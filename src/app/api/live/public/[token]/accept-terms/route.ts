import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestIp } from "@/lib/request-ip";

// Registra server-side que un invitado aceptó los Términos y Condiciones
// del servicio LIVE antes de habilitarle la cámara. El checkbox del
// cliente por sí solo no prueba nada -- esta llamada es la evidencia real
// (con IP, user-agent y timestamp), y el acceptanceId que devuelve es lo
// que /upload exige para procesar cualquier archivo de este invitado.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token) return new NextResponse("Missing token", { status: 400 });

    const liveSession = await prisma.liveSession.findUnique({
      where: { publicToken: token },
    });

    if (!liveSession || !liveSession.isActive) {
      return new NextResponse("Session not active or not found", { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const guestName = typeof body?.guestName === "string" ? body.guestName.trim() : "";

    if (!guestName) {
      return NextResponse.json({ error: "Falta el nombre del invitado" }, { status: 400 });
    }

    const acceptance = await prisma.liveTermsAcceptance.create({
      data: {
        sessionId: liveSession.id,
        guestName,
        ipAddress: getRequestIp(req),
        userAgent: req.headers.get("user-agent"),
      },
      select: { id: true },
    });

    return NextResponse.json({ acceptanceId: acceptance.id });
  } catch (error) {
    console.error("[LIVE_ACCEPT_TERMS_POST]", error);
    return NextResponse.json({ error: "Error al registrar la aceptación" }, { status: 500 });
  }
}
