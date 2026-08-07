import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { PlanTier } from "@/lib/plan-limits";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      planTier: PlanTier;
      subscriptionStatus: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    planTier: string;
    subscriptionStatus: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH DEBUG] Attempting login with:", credentials?.email, "Password length:", (credentials?.password as string)?.length);
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH DEBUG] Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).trim().toLowerCase() },
        });

        console.log("[AUTH DEBUG] User found in DB:", user ? user.email : "NO USER FOUND");

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          (credentials.password as string).trim(),
          user.password
        );

        console.log("[AUTH DEBUG] Password valid?:", isPasswordValid);

        if (!isPasswordValid) {
          return null;
        }

        // Para las estadisticas de admin (registros/tarjetas/logueos). Sesion
        // en JWT, sin tabla de Session persistida, asi que esto es lo unico
        // que deja rastro de cada login exitoso.
        await prisma.loginEvent.create({ data: { userId: user.id } }).catch((e) => {
          console.error("[AUTH] No se pudo registrar el login event:", e);
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          planTier: user.planTier,
          subscriptionStatus: user.subscriptionStatus,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.planTier = user.planTier;
        token.subscriptionStatus = user.subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.planTier = token.planTier as PlanTier;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
    // En Railway (y otros hosts self-managed), el auto-detect de host de
    // Auth.js a veces resuelve mal y termina armando URLs con localhost
    // interno en vez del dominio público, incluso con trustHost/AUTH_URL
    // seteados (ver https://github.com/nextauthjs/next-auth/issues/12117).
    //
    // Dos intentos previos de arreglar esto reconstruían la URL absoluta a
    // mano (usando baseUrl, o forzando AUTH_URL/NEXT_PUBLIC_APP_URL) -- los
    // dos rompían apenas había mas de un dominio publico valido (el de
    // Railway y altainvitacion.com), porque baseUrl termina siendo SIEMPRE
    // el valor de AUTH_URL en este hosting (no el dominio real de la
    // request), asi que "confiar en baseUrl salvo que sea localhost" no
    // alcanzaba: baseUrl nunca es localhost, pero tampoco es el dominio
    // correcto.
    //
    // La forma correcta: cuando el destino ya es una ruta relativa, no
    // tocarla -- devolverla tal cual. Un Location relativo (sin dominio) lo
    // resuelve el propio browser contra el dominio real por el que llego
    // la respuesta, sea cual sea (Railway o el dominio propio), sin
    // depender de que este codigo adivine bien esa base.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;

      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // url inválida: cae al fallback de abajo
      }
      return "/";
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "secret-invitaciones-dev-key-2026",
});

