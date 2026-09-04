import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import { applyPaidSeats, resolveCardPayment, resolveSeats } from "@/lib/card-payments";

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
  const { status, seats } = body;

  const hasSeats = seats !== undefined && seats !== null;
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
  } else if (!["PENDING", "EXEMPT", "PAID"].includes(status)) {
    return NextResponse.json(
      { error: "Enviá seats (cupos por franja) o status PENDING, EXEMPT o PAID" },
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
    // Los atajos son casos particulares de "marcar cupos": todos, o ninguno.
    const target = hasSeats
      ? (seats as Record<string, number>)
      : status === "PAID"
        ? all
        : { adults: 0, teens: 0, children: 0 };

    const paid = applyPaidSeats(guest, guest.invitation, target);
    const isExempt = !hasSeats && status === "EXEMPT";

    const resolved = resolveCardPayment(
      { ...guest, ...paid, isExempt },
      guest.invitation
    );

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...paid,
        isExempt,
        paymentStatus: resolved.status,
        paymentStatusUpdatedAt: new Date(),
        paymentStatusUpdatedBy: String(session.user.id),
      },
      select: { id: true, name: true, paymentStatus: true, isExempt: true },
    });

    return NextResponse.json({
      ...updated,
      paidSeats: resolved.paidSeats,
      seats: resolved.seats,
      paidAmount: resolved.paidAmount,
      pendingAmount: resolved.pendingAmount,
      totalAmount: resolved.totalAmount,
      surplus: resolved.surplus,
    });
  } catch (error) {
    console.error("[payment PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar el pago" }, { status: 500 });
  }
}
