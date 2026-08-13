import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentType } from "react";

export type TemplateTipo = "ELEGANT" | "MODERNO" | "NEON" | "CHIC";

export interface ColorOption {
  id: string;
  name: string;
  color: string;
}

// Colores de los circulitos selectores (no son el color real de la
// plantilla, solo la muestra en el picker) -- versiones más claras que el
// tono casi negro de cada plantilla para que se distingan de un vistazo,
// pero apagadas/desaturadas (no colores puros) para que queden acordes a
// la estética general.
export const MODERNO_COLORS: ColorOption[] = [
  { id: "default", name: "Gris y Dorado", color: "#5A5A61" },
  { id: "Bordo", name: "Bordó y Dorado", color: "#6B2436" },
  { id: "Azul", name: "Azul y Dorado", color: "#3A5A85" },
  { id: "Verde", name: "Verde y Dorado", color: "#3D6B54" },
  { id: "Purpura", name: "Violeta y Dorado", color: "#5C4472" },
  { id: "Rojo", name: "Rojo y Dorado", color: "#B84A3E" },
];

// Neon ("Doodle Disco 15") solo se ofrece para QUINCE_ANOS/CUMPLEANOS -- el
// gating vive en TemplatePreviewModal.tsx, no acá.
export const NEON_COLORS: ColorOption[] = [
  { id: "default", name: "Cian y Magenta", color: "#39FFD0" },
  { id: "Violeta", name: "Violeta y Cian", color: "#B24BFF" },
  { id: "Dorado", name: "Dorado y Magenta", color: "#FFC94B" },
  { id: "Verde", name: "Verde Lima y Magenta", color: "#B6FF3C" },
  { id: "Azul", name: "Azul Eléctrico y Magenta", color: "#3C8CFF" },
  { id: "Rojo", name: "Rojo y Cian", color: "#FF3C5C" },
];

// Chic ("Doodle Wedding") solo se ofrece para CASAMIENTO -- el gating vive
// en TemplatePreviewModal.tsx, no acá. Dorado queda fijo en todas (como en
// Moderno), varía el acento "oliva".
export const CHIC_COLORS: ColorOption[] = [
  { id: "default", name: "Oliva y Dorado", color: "#6B7A4F" },
  { id: "Rosa", name: "Rosa Antiguo y Dorado", color: "#B08590" },
  { id: "Azul", name: "Azul Grisáceo y Dorado", color: "#6E8299" },
  { id: "Terracota", name: "Terracota y Dorado", color: "#B9713F" },
  { id: "Violeta", name: "Violeta Apagado y Dorado", color: "#8779A0" },
  { id: "VerdeBotella", name: "Verde Botella y Dorado", color: "#3F5F4A" },
  { id: "Gris", name: "Gris Cálido y Dorado", color: "#8C8275" },
];

export const ELEGANT_COLORS: ColorOption[] = [
  { id: "default", name: "Dorados (Original)", color: "#C79A4B" },
  { id: "Green", name: "Verdes", color: "#5C8A7A" },
  { id: "Red", name: "Rojos", color: "#8A4A54" },
  { id: "Blue", name: "Azules", color: "#52718A" },
  { id: "Orange", name: "Naranjas", color: "#B86A4C" },
  { id: "Violet", name: "Violetas", color: "#7B6282" },
  { id: "Gray", name: "Grises", color: "#70767B" },
  { id: "DarkYellow", name: "Amarillo Oscuro", color: "#B8964C" },
  { id: "Pink", name: "Rosas", color: "#A87082" },
];

export function PreviewLoading() {
  return (
    <div className="flex h-full min-h-[100dvh] w-full items-center justify-center bg-black/90">
      <Loader2 className="h-6 w-6 animate-spin text-white/70" />
    </div>
  );
}

export interface PreviewProps {
  invitation: Record<string, unknown>;
  guest?: null;
  isPersonalized?: boolean;
}

type PreviewComponent = ComponentType<PreviewProps>;

export const MODERNO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/ModernoTemplateGris").then((m) => m.ModernoTemplateGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bordo: dynamic(() => import("@/components/templates/ModernoTemplateBordo").then((m) => m.ModernoTemplateBordo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/ModernoTemplateAzul").then((m) => m.ModernoTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/ModernoTemplateVerde").then((m) => m.ModernoTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Purpura: dynamic(() => import("@/components/templates/ModernoTemplatePurpura").then((m) => m.ModernoTemplatePurpura), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rojo: dynamic(() => import("@/components/templates/ModernoTemplateRojo").then((m) => m.ModernoTemplateRojo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const NEON_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/NeonTemplate").then((m) => m.NeonTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/NeonTemplateVioleta").then((m) => m.NeonTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/NeonTemplateDorado").then((m) => m.NeonTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/NeonTemplateVerde").then((m) => m.NeonTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/NeonTemplateAzul").then((m) => m.NeonTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rojo: dynamic(() => import("@/components/templates/NeonTemplateRojo").then((m) => m.NeonTemplateRojo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CHIC_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/ChicTemplate").then((m) => m.ChicTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/ChicTemplateRosa").then((m) => m.ChicTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/ChicTemplateAzul").then((m) => m.ChicTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/ChicTemplateTerracota").then((m) => m.ChicTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/ChicTemplateVioleta").then((m) => m.ChicTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  VerdeBotella: dynamic(() => import("@/components/templates/ChicTemplateVerdeBotella").then((m) => m.ChicTemplateVerdeBotella), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Gris: dynamic(() => import("@/components/templates/ChicTemplateGris").then((m) => m.ChicTemplateGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ELEGANT_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/ElegantTemplate").then((m) => m.ElegantTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Green: dynamic(() => import("@/components/templates/ElegantTemplateGreen").then((m) => m.ElegantTemplateGreen), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Red: dynamic(() => import("@/components/templates/ElegantTemplateRed").then((m) => m.ElegantTemplateRed), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Blue: dynamic(() => import("@/components/templates/ElegantTemplateBlue").then((m) => m.ElegantTemplateBlue), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Orange: dynamic(() => import("@/components/templates/ElegantTemplateOrange").then((m) => m.ElegantTemplateOrange), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violet: dynamic(() => import("@/components/templates/ElegantTemplateViolet").then((m) => m.ElegantTemplateViolet), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Gray: dynamic(() => import("@/components/templates/ElegantTemplateGray").then((m) => m.ElegantTemplateGray), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  DarkYellow: dynamic(() => import("@/components/templates/ElegantTemplateDarkYellow").then((m) => m.ElegantTemplateDarkYellow), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Pink: dynamic(() => import("@/components/templates/ElegantTemplatePink").then((m) => m.ElegantTemplatePink), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};
