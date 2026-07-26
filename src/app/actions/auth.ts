"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(email: string, password: string) {
  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password: password.trim(),
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email o contraseña incorrectos." };
        default:
          return { error: "Error de configuración de autenticación." };
      }
    }
    // Next.js redirects throw a special NEXT_REDIRECT error which must be re-thrown
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error.message || "Error al iniciar sesión." };
  }
}
