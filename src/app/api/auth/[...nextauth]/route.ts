import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// NextAuth v5 (beta) a veces resuelve mal el host self-hosted en Railway y
// arma URLs internas con localhost:PORT (el bind interno del contenedor) en
// vez del dominio público -- incluso con trustHost/AUTH_URL correctamente
// seteados, y aunque el callback "redirect" en auth.ts fuerce la base
// correcta (ver https://github.com/nextauthjs/next-auth/issues/12117; en
// este caso ni siquiera ese callback alcanzó, así que el host mal resuelto
// se está armando en un nivel más bajo, dentro del propio handler interno).
// En vez de seguir dependiendo de que la librería lo resuelva bien, se
// intercepta la respuesta ya generada y se corrige cualquier URL rota antes
// de devolverla al cliente.

const BROKEN_ORIGIN = /https?:\/\/(localhost|0\.0\.0\.0)(:\d+)?/gi;

function getCorrectOrigin(request: NextRequest): string {
  const configured = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

async function fixResponse(response: Response, correctOrigin: string): Promise<Response> {
  const headers = new Headers(response.headers);

  const location = headers.get("location");
  if (location) {
    headers.set("location", location.replace(BROKEN_ORIGIN, correctOrigin));
  }

  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json") || contentType.includes("text/")) {
    const text = await response.text();
    return new NextResponse(text.replace(BROKEN_ORIGIN, correctOrigin), {
      status: response.status,
      headers,
    });
  }

  return new NextResponse(response.body, { status: response.status, headers });
}

export async function GET(request: NextRequest) {
  const response = await handlers.GET(request);
  return fixResponse(response, getCorrectOrigin(request));
}

export async function POST(request: NextRequest) {
  const response = await handlers.POST(request);
  return fixResponse(response, getCorrectOrigin(request));
}
