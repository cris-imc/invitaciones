import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Fraunces, Space_Grotesk, Space_Mono, Inter, Cormorant_Garamond, Bricolage_Grotesque, Fredoka, Baloo_2 } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const cormorant = Cormorant_Garamond({ weight: ['500'], subsets: ['latin'], variable: '--font-cormorant', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', display: 'swap' });
const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Invitaciones Digitales para tus eventos",
  description: "Creá invitaciones digitales personalizadas para bodas, XV años, cumpleaños y más. Compartí por WhatsApp, gestioná confirmaciones y seguí los pagos desde un solo lugar.",
  keywords: ["invitaciones digitales", "boda", "quince años", "cumpleaños", "argentina", "RSVP online"],
  openGraph: {
    siteName: "Invitaciones Digitales",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <head>
      </head>
      <body className={`antialiased ${fraunces.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${inter.variable} ${cormorant.variable} ${bricolage.variable} ${fredoka.variable} ${baloo.variable}`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
