import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST - El invitado abrió su invitación.
 *
 * Lo llama el navegador del invitado, no el servidor al renderizar la página.
 * Es a propósito: al pegar el link en WhatsApp, WhatsApp pide la página para
 * armar la vista previa, y contar eso sería decirle al anfitrión que la
 * abrieron cuando todavía no la tocó nadie.
 *
 * Público (el token del invitado es la credencial, igual que para confirmar
 * asistencia), y deliberadamente escueto: no devuelve nada del invitado. Con
 * un token válido ya se puede ver la invitación entera; con uno inventado,
 * esto no cuenta nada nuevo -- y responde igual para no convertirse en una
 * forma de adivinar qué tokens existen.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ ok: true });

    const guest = await prisma.guest.findUnique({
      where: { uniqueToken: token },
      select: { id: true, abiertaEn: true },
    });
    if (!guest) return NextResponse.json({ ok: true });

    const ahora = new Date();
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        // La primera vez no se pisa nunca: "la abrió por primera vez el
        // martes" es el dato que importa cuando el anfitrión revisa a quién
        // le llegó y a quién no.
        abiertaEn: guest.abiertaEn ?? ahora,
        ultimaAperturaEn: ahora,
        aperturas: { increment: 1 },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Que falle no puede romperle la invitación a nadie: es un dato de
    // seguimiento, no parte de lo que el invitado vino a hacer.
    console.error("Error al registrar la apertura:", error);
    return NextResponse.json({ ok: true });
  }
}
