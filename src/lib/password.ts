export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS_HINT = "Mínimo 8 caracteres, con al menos una mayúscula y un número";

export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe tener al menos una mayúscula";
  }
  if (!/[0-9]/.test(password)) {
    return "La contraseña debe tener al menos un número";
  }
  return null;
}
