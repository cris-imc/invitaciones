// Formato argentino sin prefijos de marcado local: código de área sin el 0
// inicial (ej. "351", no "0351") y número sin el 15 inicial (ej. "5551234",
// no "155551234"). Es el formato que se usa para armar el numero
// internacional (+54 9 <area><numero>).

export function normalizeDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

export function validatePhoneAreaCode(value: string): string | null {
  const digits = normalizeDigits(value);
  if (!digits) return "Ingresá el código de área";
  if (digits.startsWith("0")) return "El código de área va sin el 0 inicial";
  if (digits.length < 2 || digits.length > 4) return "El código de área debe tener entre 2 y 4 dígitos";
  return null;
}

export function validatePhoneNumber(value: string): string | null {
  const digits = normalizeDigits(value);
  if (!digits) return "Ingresá el número de teléfono";
  if (digits.startsWith("15")) return "El número va sin el 15 inicial";
  if (digits.length < 6 || digits.length > 8) return "El número debe tener entre 6 y 8 dígitos";
  return null;
}
