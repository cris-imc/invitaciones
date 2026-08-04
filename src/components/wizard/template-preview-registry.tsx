import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentType } from "react";

export type TemplateTipo = "ELEGANT" | "MODERNO";

export interface ColorOption {
  id: string;
  name: string;
  color: string;
}

export const MODERNO_COLORS: ColorOption[] = [
  { id: "default", name: "Gris y Dorado", color: "#1E1F22" },
  { id: "Bordo", name: "Bordó y Dorado", color: "#2A0811" },
  { id: "Azul", name: "Azul y Dorado", color: "#050B14" },
  { id: "Verde", name: "Verde y Dorado", color: "#05120B" },
  { id: "Purpura", name: "Violeta y Dorado", color: "#0D0412" },
  { id: "Rojo", name: "Rojo y Dorado", color: "#8A2E3B" },
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
