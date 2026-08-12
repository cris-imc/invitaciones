import { NextRequest } from "next/server";

// Railway (y la mayoría de los proxies) entregan la IP real del cliente en
// x-forwarded-for -- request.ip no está disponible detrás de ese proxy.
export function getRequestIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}
