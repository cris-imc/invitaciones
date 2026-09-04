import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import {
  PAYMENT_CLEAR_CODE,
  computeBalance,
  computeExpectedAmount,
  derivePaymentStatus,
  resolveExpectedAmount,
  resolveGuestPayment,
} from "@/lib/payments";

// PATCH /api/guests/[id]/payment — Cambiar el pago de tarjeta (solo anfitrión autenticado)
//
// Acepta dos formas, y ambas terminan escribiendo un MONTO (paidAmount): el
// estado se deriva siempre de la plata registrada, nunca se guarda suelto.
//   { status: "PENDING" | "EXEMPT" | "PAID" }  → atajos de siempre (0 / exento / total)
//   { paidAmount: 150000 }                     → pago parcial de un grupo/familia
//
// El monto esperado se congela en expectedAmount la primera vez que se toca el
// pago (si el RSVP no lo congeló ya), así una suba posterior del precio de la
// tarjeta no reabre saldo sobre pagos que el anfitrión ya dio por cerrados.
//
// Un cambio que dejaría en cero un monto ya registrado responde 409 con
// PAYMENT_CLEAR_CODE en vez de aplicarse; para confirmarlo se reintenta con
// { confirmClearPayment: true }.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: guestId } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, paidAmount } = body;

  const hasPaidAmount = paidAmount !== undefined && paidAmount !== null;

  if (hasPaidAmount) {
    if (typeof paidAmount !== "number" || !Number.isFinite(paidAmount) || paidAmount < 0) {
      return NextResponse.json(
        { error: "paidAmount debe ser un número mayor o igual a 0" },
        { status: 400 }
      );
    }
  } else if (!["PENDING", "EXEMPT", "PAID"].includes(status)) {
    return NextResponse.json(
      { error: "Enviá paidAmount (número) o status PENDING, EXEMPT o PAID" },
      { status: 400 }
    );
  }

  try {
    // Verificar que el guest pertenece a una invitación del usuario autenticado
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        invitation: {
          select: {
            userId: true,
            pagoTarjetaMonto: true,
            regaloMonto: true,
            precioAdolescente: true,
            precioNino: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
    }

    if (guest.invitation.userId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }

    // Lo que hay registrado hoy. Sirve para dos controles distintos: no aceptar
    // más plata de la que corresponde, y no borrar la que ya está.
    const currentPaid = resolveGuestPayment(guest, guest.invitation).paidAmount;

    // Monto esperado: el congelado solo si la tarjeta ya estaba paga; si no, el
    // vigente según los precios actuales de la invitación. Así una suba de
    // precio le sube el saldo al que debe, y no le reabre nada al que ya pagó.
    const expectedAmount = resolveExpectedAmount({
      frozenExpected: guest.expectedAmount,
      liveExpected: computeExpectedAmount(guest, guest.invitation),
      paidAmount: currentPaid,
    });

    // Sobrepago: el panel ya lo rechaza al escribir el monto, pero la regla real
    // tiene que estar acá o depende de qué cliente llame. Sin precio cargado
    // (expectedAmount 0) no hay total contra el cual medir, así que no se valida.
    if (hasPaidAmount && expectedAmount > 0 && (paidAmount as number) > expectedAmount) {
      return NextResponse.json(
        { error: `El monto no puede superar el total de la tarjeta (${expectedAmount}).` },
        { status: 400 }
      );
    }

    // Pasar a "no pago" o marcar exento pone el monto en cero, y sin historial
    // de pagos eso no se puede deshacer: se confirma explícitamente.
    const wipesMoney =
      currentPaid > 0 &&
      ((hasPaidAmount && (paidAmount as number) === 0) || status === "PENDING" || status === "EXEMPT");

    if (wipesMoney && body.confirmClearPayment !== true) {
      return NextResponse.json(
        {
          error: `Este invitado tiene ${currentPaid} registrado como abonado. Este cambio lo borra.`,
          code: PAYMENT_CLEAR_CODE,
          paidAmount: currentPaid,
        },
        { status: 409 }
      );
    }

    let nextPaid: number;
    let nextExempt: boolean;

    if (hasPaidAmount) {
      // Cargar un monto saca al invitado de "exento": ya está pagando.
      nextPaid = paidAmount as number;
      nextExempt = false;
    } else if (status === "EXEMPT") {
      nextPaid = 0;
      nextExempt = true;
    } else if (status === "PAID") {
      // Si no hay precio cargado en la invitación no hay total que cobrar; se
      // respeta lo que ya estuviera registrado (incluido el legacy PAID sin monto).
      nextPaid = expectedAmount > 0
        ? expectedAmount
        : resolveGuestPayment(guest, guest.invitation).paidAmount;
      nextExempt = false;
    } else {
      nextPaid = 0;
      nextExempt = false;
    }

    const nextStatus = derivePaymentStatus({
      paidAmount: nextPaid,
      expectedAmount,
      isExempt: nextExempt,
    });

    // El total se congela unicamente al quedar paga la tarjeta. Mientras haya
    // saldo se guarda null, para que el monto siga el precio vigente y una suba
    // posterior aumente lo que falta cobrar.
    const nextExpected = nextStatus === "PAID" ? expectedAmount : null;

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        paidAmount: nextPaid,
        expectedAmount: nextExpected,
        paymentStatus: nextStatus,
        isExempt: nextExempt,
        paymentStatusUpdatedAt: new Date(),
        paymentStatusUpdatedBy: String(session.user.id),
      },
      select: {
        id: true,
        name: true,
        paymentStatus: true,
        paidAmount: true,
        expectedAmount: true,
        isExempt: true,
        paymentStatusUpdatedAt: true,
      },
    });

    // Se devuelve el total efectivo, no el guardado: mientras haya saldo la
    // columna queda en null y el panel necesita el monto vigente para mostrar
    // "falta $X de $Y".
    return NextResponse.json({
      ...updated,
      expectedAmount,
      balance: computeBalance(updated.paidAmount, expectedAmount),
    });
  } catch (error) {
    console.error("[payment PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar estado de pago" }, { status: 500 });
  }
}
