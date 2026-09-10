import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ViewportHeightFix } from "@/components/ViewportHeightFix";
import { Fraunces, Space_Grotesk, Space_Mono, Inter, Cormorant_Garamond, Bricolage_Grotesque, Fredoka, Baloo_2, Sora, Dancing_Script, Playfair_Display, Great_Vibes, Merriweather, Lora, DM_Sans, Cinzel, Parisienne, Sacramento, Abril_Fatface, Prata, Montserrat, Open_Sans, Nunito, Lato } from 'next/font/google';
import localFont from 'next/font/local';

// Sólo las 4 fuentes del chrome de la app (display / ui / mono / body en
// globals.css) se precargan. Las otras 20 son opciones que el usuario elige
// para SU invitación: con el preload por defecto, Next metía un
// <link rel="preload"> de las 24 en TODAS las páginas de la app, así que cada
// visitante se bajaba ~30 archivos de fuente para ver, a lo sumo, 4 o 5. Con
// `preload: false` el navegador baja únicamente las que la página realmente
// pinta; `display: 'swap'` ya estaba puesto, así que el texto se ve desde el
// primer momento.
const fraunces = Fraunces({ style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({ preload: false, subsets: ['latin'], variable: '--font-sora', display: 'swap' });

const cormorant = Cormorant_Garamond({ preload: false, weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-cormorant', display: 'swap' });
const bricolage = Bricolage_Grotesque({ preload: false, subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const fredoka = Fredoka({ preload: false, subsets: ['latin'], variable: '--font-fredoka', display: 'swap' });
const baloo = Baloo_2({ preload: false, subsets: ['latin'], variable: '--font-baloo', display: 'swap' });

// Corrección 2 (docs/correcciones.md): tipografía de dos niveles del wizard.
// Títulos:
const dancingScript = Dancing_Script({ preload: false, subsets: ['latin'], variable: '--font-dancing-script', display: 'swap' });
const playfairDisplay = Playfair_Display({ preload: false, subsets: ['latin'], variable: '--font-playfair-display', display: 'swap' });
const greatVibes = Great_Vibes({ preload: false, weight: ['400'], subsets: ['latin'], variable: '--font-great-vibes', display: 'swap' });
const cinzel = Cinzel({ preload: false, subsets: ['latin'], variable: '--font-cinzel', display: 'swap' });
const parisienne = Parisienne({ preload: false, weight: ['400'], subsets: ['latin'], variable: '--font-parisienne', display: 'swap' });
const sacramento = Sacramento({ preload: false, weight: ['400'], subsets: ['latin'], variable: '--font-sacramento', display: 'swap' });
const abrilFatface = Abril_Fatface({ preload: false, weight: ['400'], subsets: ['latin'], variable: '--font-abril-fatface', display: 'swap' });
const prata = Prata({ preload: false, weight: ['400'], subsets: ['latin'], variable: '--font-prata', display: 'swap' });

// Texto:
const merriweather = Merriweather({ preload: false, weight: ['400', '700'], subsets: ['latin'], variable: '--font-merriweather', display: 'swap' });
const lora = Lora({ preload: false, subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const dmSans = DM_Sans({ preload: false, subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const montserrat = Montserrat({ preload: false, subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
// Auto-hospedada (next/font/local) en vez de next/font/google -- las URLs de
// Roboto que trae fijadas el paquete de Next.js para este build empezaron a
// devolver 404 de fonts.gstatic.com, rompiendo el build en Railway. Con el
// archivo local el build ya no depende de esa descarga.
const roboto = localFont({
  src: [
    { path: './fonts/roboto-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/roboto-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/roboto-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-roboto',
  display: 'swap',
});
const openSans = Open_Sans({ preload: false, subsets: ['latin'], variable: '--font-open-sans', display: 'swap' });
const nunito = Nunito({ preload: false, subsets: ['latin'], variable: '--font-nunito', display: 'swap' });
const lato = Lato({ preload: false, weight: ['400', '700'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });

const allFonts = [
  fraunces, spaceGrotesk, spaceMono, inter, sora, cormorant, bricolage, fredoka, baloo,
  dancingScript, playfairDisplay, greatVibes, cinzel, parisienne, sacramento, abrilFatface, prata,
  merriweather, lora, dmSans, montserrat, roboto, openSans, nunito, lato
].map(f => f.variable).join(" ");

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
    <html lang="es" className={`${allFonts}`}>
      <head>
      </head>
      <body className="antialiased">
        <ViewportHeightFix />
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
