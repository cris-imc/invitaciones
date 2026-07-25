export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/api/invitations/:path*", "/api/guests/:path*"],
}
