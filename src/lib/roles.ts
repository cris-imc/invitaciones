// "ADMIN" y "SUPERUSER" tienen acceso administrativo equivalente en toda la
// app -- SUPERUSER ademas puede crear/eliminar cuentas ADMIN, algo que un
// ADMIN comun no puede hacer. Hay un solo SUPERUSER por el momento.
export function isAdmin(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPERUSER";
}

export function isSuperUser(role?: string | null): boolean {
  return role === "SUPERUSER";
}

export const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Cliente",
  ADMIN: "Admin",
  SUPERUSER: "Super Usuario",
};
