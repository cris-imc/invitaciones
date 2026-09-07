import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/roles";
import { BRACKETS, applyAllSeats, applySeatChange, resolveCardPayment, type Bracket } from "@/lib/card-payments";

// PATCH /api/guests/[id]/payment — Pago de tarjeta (solo anfitrión autenticado)
//
// Formas de pedirlo:
//   { seat: { bracket, index, paid } }            → marca/desmarca un lugar
//   { seat: { bracket, index, override } }        → precio propio de ese lugar
//   { status: "PENDING" | "EXEMPT" | "PAID" }     → atajos (ninguno / exento / todos)
//   { receivedAmount, notes }                     → registro privado del anfitrión
//
// Marcar un lugar congela el precio que le corresponde en ese momento; los que
// siguen pendientes se valúan al precio vigente. Ver src/lib/card-payments.ts.
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
  const { status, seat, receivedAmount, notes } = body;

  const hasSeat = seat !== undefined && seat !== null;
  const hasReceived = receivedAmount !== undefined && receivedAmount !== null;
  const hasNotes = notes !== undefined;

  if (hasSeat) {
    const s = seat as Record<string, unknown>;
    if (!BRACKETS.includes(s.bracket as Bracket)) {
      return NextResponse.json({ error: "seat.bracket inválido" }, { status: 400 });
    }
    if (typeof s.index !== "number" || !Number.isInteger(s.index) || s.index < 0) {
      return NextResponse.json({ error: "seat.index debe ser un entero >= 0" }, { status: 400 });
    }
    if (s.paid !== undefined && typeof s.paid !== "boolean") {
      return NextResponse.json({ error: "seat.paid debe ser true o false" }, { status: 400 });
    }
    if (
      s.override !== undefined &&
      s.override !== null &&
      (typeof s.override !== "number" || !Number.isFinite(s.override) || s.override < 0)
    ) {
      return NextResponse.json(
        { error: "seat.override debe ser un número mayor o igual a 0, o null" },
        { status: 400 }
      );
    }
  }

  if (hasNotes && notes !== null && typeof notes !== "string") {
    return NextResponse.json({ error: "notes debe ser texto" }, { status: 400 });
  }

  if (
    hasReceived &&
    (typeof receivedAmount !== "number" || !Number.isFinite(receivedAmount) || receivedAmount < 0)
  ) {
    return NextResponse.json(
      { error: "receivedAmount debe ser un número mayor o igual a 0" },
      { status: 400 }
    );
  }

  if (!hasSeat && !hasReceived && !hasNotes && !["PENDING", "EXEMPT", "PAID"].includes(status)) {
    return NextResponse.json(
      { error: "Enviá seat, receivedAmount, notes, o status PENDING, EXEMPT o PAID" },
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

    // Anotar el monto recibido o una nota no toca los lugares ni el estado: es el
    // registro aparte que lleva el anfitrión.
    const onlyRegistro = (hasReceived || hasNotes) && !hasSeat && status === undefined;

    const seatUpdate = hasSeat
      ? applySeatChange(guest, guest.invitation, {
          bracket: (seat as { bracket: Bracket }).bracket,
          index: (seat as { index: number }).index,
          paid: (seat as { paid?: boolean }).paid,
          override: (seat as { override?: number | null }).override,
        })
      : onlyRegistro
        ? { seatDetails: guest.seatDetails ?? "" }
        : applyAllSeats(guest, guest.invitation, status === "PAID");

    const isExempt = onlyRegistro ? Boolean(guest.isExempt) : status === "EXEMPT";
    const nextReceived = hasReceived ? (receivedAmount as number) : guest.receivedAmount;

    const resolved = resolveCardPayment(
      { ...guest, ...seatUpdate, isExempt, receivedAmount: nextReceived },
      guest.invitation
    );

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...seatUpdate,
        isExempt,
        receivedAmount: nextReceived,
        ...(hasNotes ? { hostNotes: notes ? String(notes).slice(0, 2000) : null } : {}),
        paymentStatus: resolved.status,
        paymentStatusUpdatedAt: new Date(),
        paymentStatusUpdatedBy: String(session.user.id),
      },
      select: { id: true, name: true, paymentStatus: true, isExempt: true, hostNotes: true },
    });

    return NextResponse.json({ ...updated, ...resolved });
  } catch (error) {
    console.error("[payment PATCH]", error);
    return NextResponse.json({ error: "Error al actualizar el pago" }, { status: 500 });
  }
}
