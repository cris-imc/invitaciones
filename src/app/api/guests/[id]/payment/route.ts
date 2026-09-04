import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import { applyPaidSeats, resolveCardPayment, resolvePaidSeats, resolveSeats } from "@/lib/card-payments";

// PATCH /api/guests/[id]/payment — Pago de tarjeta (solo anfitrión autenticado)
//
// Dos formas de pedirlo:
//   { seats: { adults: 2, teens: 1, children: 0 } }  → marca esos cupos como pagos
//   { status: "PENDING" | "EXEMPT" | "PAID" }        → atajos (ninguno / exento / todos)
//
// Los cupos que se suman se cobran al precio vigente; los que se sacan devuelven
// lo que habían aportado. Ver src/lib/card-payments.ts.
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
  const { status, seats, receivedAmount, notes } = body;

  const hasSeats = seats !== undefined && seats !== null;
  const hasReceived = receivedAmount !== undefined && receivedAmount !== null;
  const hasNotes = notes !== undefined;

  if (hasNotes && notes !== null && typeof notes !== "string") {
    return NextResponse.json({ error: "notes debe ser texto" }, { status: 400 });
  }

  if (hasReceived && (typeof receivedAmount !== "number" || !Number.isFinite(receivedAmount) || receivedAmount < 0)) {
    return NextResponse.json(
      { error: "receivedAmount debe ser un número mayor o igual a 0" },
      { status: 400 }
    );
  }
  if (hasSeats) {
    if (typeof seats !== "object") {
      return NextResponse.json({ error: "seats debe ser un objeto" }, { status: 400 });
    }
    for (const k of ["adults", "teens", "children"]) {
      const v = (seats as Record<string, unknown>)[k];
      if (v !== undefined && (typeof v !== "number" || !Number.isFinite(v) || v < 0)) {
        return NextResponse.json(
          { error: `seats.${k} debe ser un número mayor o igual a 0` },
          { status: 400 }
        );
      }
    }
  } else if (!hasReceived && !hasNotes && !["PENDING", "EXEMPT", "PAID"].includes(status)) {
    return NextResponse.json(
      { error: "Enviá seats, receivedAmount, notes, o status PENDING, EXEMPT o PAID" },
      { status: 400 }
    );
  }

  try {
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

    const all = resolveSeats(guest);
    // Anotar el monto recibido o una nota no toca los cupos ni el estado: es el
    // registro aparte que lleva el anfitrión.
    const onlyReceived = (hasReceived || hasNotes) && !hasSeats && status === undefined;

    // Los atajos son casos particulares de "marcar cupos": todos, o ninguno.
    const target = hasSeats
      ? (seats as Record<string, number>)
      : onlyReceived
        ? resolvePaidSeats(guest)
        : status === "PAID"
          ? all
          : { adults: 0, teens: 0, children: 0 };

    const paid = applyPaidSeats(guest, guest.invitation, target);
    const isExempt = onlyReceived ? Boolean(guest.isExempt) : status === "EXEMPT";
    const nextReceived = hasReceived ? (receivedAmount as number) : guest.receivedAmount;

    const resolved = resolveCardPayment(
      { ...guest, ...paid, isExempt, receivedAmount: nextReceived },
      guest.invitation
    );

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...paid,
        isExempt,
        receivedAmount: nextReceived,
        ...(hasNotes ? { hostNotes: notes ? String(notes).slice(0, 2000) : null } : {}),
        paymentStatus: resolved.status,
        paymentStatusUpdatedAt: new Date(),
        paymentStatusUpdatedBy: String(session.user.id),
      },
      select: { id: true, name: true, paymentStatus: true, isExempt: true, hostNotes: true },
    });

    return NextResponse.json({
      ...updated,
      paidSeats: resolved.paidSeats,
      seats: resolved.seats,
      paidAmount: resolved.paidAmount,
      pendingAmount: resolved.pendingAmount,
      totalAmount: resolved.totalAmount,
      surplus: resolved.surplus,
      receivedAmount: resolved.receivedAmount,
      onAccount: resolved.onAccount,
      missingAmount: resolved.missingAmount,
      // Cobrado por franja: el panel lo necesita para decir cuánto se descuenta
      // al desmarcar un lugar. Sin devolverlo, esa cifra quedaba con el valor
      // del primer fetch hasta recargar la página.
      paidAmountAdults: paid.paidAmountAdults,
      paidAmountTeens: paid.paidAmountTeens,
      paidAmountChildren: paid.paidAmountChildren,
    });
  } catch (error) {
    console.error("[payment PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar el pago" }, { status: 500 });
  }
}
