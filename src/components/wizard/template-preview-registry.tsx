import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentType } from "react";

export type TemplateTipo = "ELEGANT" | "MODERNO" | "NEON" | "CHIC" | "EDITORIAL" | "ONIX" | "JARDINSEDA" | "HOLOGRAMA" | "CIRCUITO" | "CRISTAL3D" | "CINE" | "NORDICO" | "RIVIERA" | "GOLDENDUSK" | "SEDA" | "PETALOS" | "LUZLUNA" | "BONVOYAGE" | "CORPORATE" | "GARDENPARTY" | "LOFTINDUSTRIAL" | "INFANTIL";

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
// en TemplatePreviewModal.tsx, no acá. A diferencia de Moderno, acá el
// acento principal SÍ varía por completo en cada variante (--t-acc deja de
// ser dorado fijo) -- ver docs/GUIA_TECNICA_PLANTILLAS.md, "Bug 6".
export const CHIC_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Clásico", color: "#C9A876" },
  { id: "Rosa", name: "Rosa Antiguo", color: "#B08590" },
  { id: "Azul", name: "Azul Grisáceo", color: "#6E8299" },
  { id: "Terracota", name: "Terracota", color: "#B9713F" },
  { id: "Violeta", name: "Violeta Apagado", color: "#8779A0" },
  { id: "VerdeBotella", name: "Verde Botella", color: "#3F5F4A" },
  { id: "Gris", name: "Gris Cálido", color: "#8C8275" },
];


export const EDITORIAL_COLORS: ColorOption[] = [
  { id: "default", name: "Burdeos Editorial", color: "#A3123B" },
  { id: "Azul", name: "Azul", color: "#1B3A5C" },
  { id: "Gris", name: "Gris", color: "#4A4640" },
  { id: "Malva", name: "Malva", color: "#6B4A6B" },
  { id: "Terracota", name: "Terracota", color: "#B5502E" },
  { id: "Verde", name: "Verde", color: "#1F4B3F" },
];

export const ONIX_COLORS: ColorOption[] = [
  { id: "default", name: "Oro Rosado", color: "#D89AA0" },
  { id: "Amatista", name: "Amatista", color: "#B48CD9" },
  { id: "Esmeralda", name: "Esmeralda", color: "#6FBF9B" },
  { id: "Oro", name: "Oro", color: "#D4AF62" },
  { id: "Plata", name: "Plata", color: "#C9C9D1" },
  { id: "Zafiro", name: "Zafiro", color: "#7FA8D9" },
];

export const JARDINSEDA_COLORS: ColorOption[] = [
  { id: "default", name: "Malva", color: "#B79FC4" },
  { id: "Cielo", name: "Cielo", color: "#8CA9C4" },
  { id: "Durazno", name: "Durazno", color: "#E0A97E" },
  { id: "Lila", name: "Lila", color: "#9C8AD1" },
  { id: "RosaAntiguo", name: "Rosa Antiguo", color: "#D68FA0" },
  { id: "Salvia", name: "Salvia", color: "#6F9A76" },
];

export const HOLOGRAMA_COLORS: ColorOption[] = [
  { id: "default", name: "Violeta Holográfico", color: "#A78BFA" },
  { id: "Azul", name: "Azul", color: "#5B8CFF" },
  { id: "Coral", name: "Coral", color: "#FF8A65" },
  { id: "Dorado", name: "Dorado", color: "#F5C452" },
  { id: "Esmeralda", name: "Esmeralda", color: "#2EE6A8" },
  { id: "Rosa", name: "Rosa", color: "#FF6FD8" },
];

export const CIRCUITO_COLORS: ColorOption[] = [
  { id: "default", name: "Cian Circuito", color: "#39FFD0" },
  { id: "Ambar", name: "Ámbar", color: "#FFB020" },
  { id: "Azul", name: "Azul", color: "#3ED0FF" },
  { id: "Lima", name: "Lima", color: "#C6FF3B" },
  { id: "Rojo", name: "Rojo", color: "#FF3B3B" },
  { id: "Violeta", name: "Violeta", color: "#B14EFF" },
];

export const CRISTAL3D_COLORS: ColorOption[] = [
  { id: "default", name: "Celeste Cristal", color: "#8FD3FF" },
  { id: "Ambar", name: "Ámbar", color: "#FFCB77" },
  { id: "Esmeralda", name: "Esmeralda", color: "#7CF2C0" },
  { id: "Menta", name: "Menta", color: "#8FFFE0" },
  { id: "RosaCuarzo", name: "Rosa Cuarzo", color: "#FFB3D1" },
  { id: "Violeta", name: "Violeta", color: "#C4A6FF" },
];

export const CINE_COLORS: ColorOption[] = [
  { id: "default", name: "Sepia", color: "#C08A3E" },
  { id: "Borgona", name: "Borgoña", color: "#8C4A56" },
  { id: "Esmeralda", name: "Esmeralda", color: "#5B8A72" },
  { id: "Noir", name: "Noir", color: "#8FA3B0" },
  { id: "Tecnicolor", name: "Tecnicolor", color: "#C1442E" },
];

export const NORDICO_COLORS: ColorOption[] = [
  { id: "default", name: "Grafito", color: "#5B5850" },
  { id: "Bosque", name: "Bosque", color: "#3F5D45" },
  { id: "Marino", name: "Marino", color: "#35507A" },
  { id: "Ocre", name: "Ocre", color: "#A97D2A" },
  { id: "Terracota", name: "Terracota", color: "#B15E3D" },
];

export const RIVIERA_COLORS: ColorOption[] = [
  { id: "default", name: "Terracota Riviera", color: "#C1734A" },
  { id: "Azulejo", name: "Azulejo", color: "#3E7C8C" },
  { id: "Coral", name: "Coral", color: "#D97757" },
  { id: "Ocre", name: "Ocre", color: "#C6963B" },
  { id: "Oliva", name: "Oliva", color: "#7A8F5E" },
];

export const GOLDENDUSK_COLORS: ColorOption[] = [
  { id: "default", name: "Atardecer", color: "#C8956C" },
  { id: "AzulMedianoche", name: "Azul Medianoche", color: "#3B5773" },
  { id: "Borgona", name: "Borgoña", color: "#8C4A4A" },
  { id: "ChampagneDorado", name: "Champagne Dorado", color: "#B8863E" },
  { id: "RosaAntiguo", name: "Rosa Antiguo", color: "#B97D82" },
  { id: "Salvia", name: "Salvia", color: "#7C8F6E" },
];

export const SEDA_COLORS: ColorOption[] = [
  { id: "default", name: "Champagne", color: "#C9A0A6" },
  { id: "Esmeralda", name: "Esmeralda", color: "#3D6E58" },
  { id: "Marfil", name: "Marfil", color: "#B98D57" },
  { id: "Nocturna", name: "Nocturna", color: "#8C4A52" },
  { id: "Perla", name: "Perla", color: "#8FA3B0" },
];

export const PETALOS_COLORS: ColorOption[] = [
  { id: "default", name: "Rojo Vibrante", color: "#E23B4E" },
  { id: "Coral", name: "Coral", color: "#F2946B" },
  { id: "Pastel", name: "Pastel", color: "#F0B8C6" },
  { id: "RosaPastel", name: "Rosa Pastel", color: "#E8A8BC" },
  { id: "VinoVibrante", name: "Vino Vibrante", color: "#8C1B2A" },
];

export const LUZLUNA_COLORS: ColorOption[] = [
  { id: "default", name: "Nocturna", color: "#B9A6D9" },
  { id: "MedianocheAzul", name: "Medianoche Azul", color: "#7EA3D9" },
  { id: "NocheEstrellada", name: "Noche Estrellada", color: "#9FB3E8" },
  { id: "Perlada", name: "Perlada", color: "#C9B8E8" },
  { id: "PerlaSuave", name: "Perla Suave", color: "#7C93B0" },
];

export const BONVOYAGE_COLORS: ColorOption[] = [
  { id: "default", name: "Océano", color: "#2E7EA6" },
  { id: "Coral", name: "Coral", color: "#C97A5C" },
  { id: "Esmeralda", name: "Esmeralda", color: "#2E8B72" },
  { id: "Lavanda", name: "Lavanda", color: "#6B6FA6" },
  { id: "Medianoche", name: "Medianoche", color: "#24506B" },
  { id: "Turquesa", name: "Turquesa", color: "#2CA6A4" },
];

export const CORPORATE_COLORS: ColorOption[] = [
  { id: "default", name: "Azul Corporativo", color: "#5C8DFF" },
  { id: "Bordo", name: "Bordó", color: "#D9536B" },
  { id: "Claro", name: "Claro", color: "#2952E3" },
  { id: "Verde", name: "Verde", color: "#34C77B" },
  { id: "Violeta", name: "Violeta", color: "#8B7CF6" },
];

export const GARDENPARTY_COLORS: ColorOption[] = [
  { id: "default", name: "Terracota Suave", color: "#D97757" },
  { id: "Amarillo", name: "Amarillo", color: "#E8A33D" },
  { id: "Lavanda", name: "Lavanda", color: "#8B7FD1" },
  { id: "Rosa", name: "Rosa", color: "#E0709A" },
  { id: "Vibrante", name: "Vibrante", color: "#FF5A36" },
];

export const LOFTINDUSTRIAL_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Industrial", color: "#E0B84B" },
  { id: "Acero", name: "Acero", color: "#6FA8CC" },
  { id: "Claro", name: "Claro", color: "#C0392B" },
  { id: "Cobre", name: "Cobre", color: "#D2691E" },
  { id: "Verde", name: "Verde", color: "#7FA65C" },
];

export const INFANTIL_COLORS: ColorOption[] = [
  { id: "default", name: "Rosa Fiesta", color: "#FF5C8A" },
  { id: "Amarillo", name: "Amarillo", color: "#FFB627" },
  { id: "Celeste", name: "Celeste", color: "#4FB8E8" },
  { id: "Lavanda", name: "Lavanda", color: "#9B7FE8" },
  { id: "Menta", name: "Menta", color: "#29B38A" },
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


export const EDITORIAL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/EditorialTemplate").then((m) => m.EditorialTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/EditorialTemplateAzul").then((m) => m.EditorialTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Gris: dynamic(() => import("@/components/templates/EditorialTemplateGris").then((m) => m.EditorialTemplateGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Malva: dynamic(() => import("@/components/templates/EditorialTemplateMalva").then((m) => m.EditorialTemplateMalva), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/EditorialTemplateTerracota").then((m) => m.EditorialTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/EditorialTemplateVerde").then((m) => m.EditorialTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ONIX_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/OnixTemplate").then((m) => m.OnixTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amatista: dynamic(() => import("@/components/templates/OnixTemplateAmatista").then((m) => m.OnixTemplateAmatista), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/OnixTemplateEsmeralda").then((m) => m.OnixTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Oro: dynamic(() => import("@/components/templates/OnixTemplateOro").then((m) => m.OnixTemplateOro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Plata: dynamic(() => import("@/components/templates/OnixTemplatePlata").then((m) => m.OnixTemplatePlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Zafiro: dynamic(() => import("@/components/templates/OnixTemplateZafiro").then((m) => m.OnixTemplateZafiro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const JARDINSEDA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/JardinSedaTemplate").then((m) => m.JardinSedaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cielo: dynamic(() => import("@/components/templates/JardinSedaTemplateCielo").then((m) => m.JardinSedaTemplateCielo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Durazno: dynamic(() => import("@/components/templates/JardinSedaTemplateDurazno").then((m) => m.JardinSedaTemplateDurazno), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lila: dynamic(() => import("@/components/templates/JardinSedaTemplateLila").then((m) => m.JardinSedaTemplateLila), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaAntiguo: dynamic(() => import("@/components/templates/JardinSedaTemplateRosaAntiguo").then((m) => m.JardinSedaTemplateRosaAntiguo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Salvia: dynamic(() => import("@/components/templates/JardinSedaTemplateSalvia").then((m) => m.JardinSedaTemplateSalvia), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const HOLOGRAMA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/HologramaTemplate").then((m) => m.HologramaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/HologramaTemplateAzul").then((m) => m.HologramaTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/HologramaTemplateCoral").then((m) => m.HologramaTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/HologramaTemplateDorado").then((m) => m.HologramaTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/HologramaTemplateEsmeralda").then((m) => m.HologramaTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/HologramaTemplateRosa").then((m) => m.HologramaTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CIRCUITO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CircuitoTemplate").then((m) => m.CircuitoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ambar: dynamic(() => import("@/components/templates/CircuitoTemplateAmbar").then((m) => m.CircuitoTemplateAmbar), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/CircuitoTemplateAzul").then((m) => m.CircuitoTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lima: dynamic(() => import("@/components/templates/CircuitoTemplateLima").then((m) => m.CircuitoTemplateLima), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rojo: dynamic(() => import("@/components/templates/CircuitoTemplateRojo").then((m) => m.CircuitoTemplateRojo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/CircuitoTemplateVioleta").then((m) => m.CircuitoTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CRISTAL3D_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/Cristal3DTemplate").then((m) => m.Cristal3DTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ambar: dynamic(() => import("@/components/templates/Cristal3DTemplateAmbar").then((m) => m.Cristal3DTemplateAmbar), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/Cristal3DTemplateEsmeralda").then((m) => m.Cristal3DTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Menta: dynamic(() => import("@/components/templates/Cristal3DTemplateMenta").then((m) => m.Cristal3DTemplateMenta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaCuarzo: dynamic(() => import("@/components/templates/Cristal3DTemplateRosaCuarzo").then((m) => m.Cristal3DTemplateRosaCuarzo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/Cristal3DTemplateVioleta").then((m) => m.Cristal3DTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CINE_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CineTemplate").then((m) => m.CineTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/CineTemplateBorgona").then((m) => m.CineTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/CineTemplateEsmeralda").then((m) => m.CineTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Noir: dynamic(() => import("@/components/templates/CineTemplateNoir").then((m) => m.CineTemplateNoir), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Tecnicolor: dynamic(() => import("@/components/templates/CineTemplateTecnicolor").then((m) => m.CineTemplateTecnicolor), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const NORDICO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/NordicoTemplate").then((m) => m.NordicoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bosque: dynamic(() => import("@/components/templates/NordicoTemplateBosque").then((m) => m.NordicoTemplateBosque), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marino: dynamic(() => import("@/components/templates/NordicoTemplateMarino").then((m) => m.NordicoTemplateMarino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ocre: dynamic(() => import("@/components/templates/NordicoTemplateOcre").then((m) => m.NordicoTemplateOcre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/NordicoTemplateTerracota").then((m) => m.NordicoTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const RIVIERA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/RivieraTemplate").then((m) => m.RivieraTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azulejo: dynamic(() => import("@/components/templates/RivieraTemplateAzulejo").then((m) => m.RivieraTemplateAzulejo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/RivieraTemplateCoral").then((m) => m.RivieraTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ocre: dynamic(() => import("@/components/templates/RivieraTemplateOcre").then((m) => m.RivieraTemplateOcre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Oliva: dynamic(() => import("@/components/templates/RivieraTemplateOliva").then((m) => m.RivieraTemplateOliva), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const GOLDENDUSK_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/GoldenDuskTemplate").then((m) => m.GoldenDuskTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulMedianoche: dynamic(() => import("@/components/templates/GoldenDuskTemplateAzulMedianoche").then((m) => m.GoldenDuskTemplateAzulMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/GoldenDuskTemplateBorgona").then((m) => m.GoldenDuskTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  ChampagneDorado: dynamic(() => import("@/components/templates/GoldenDuskTemplateChampagneDorado").then((m) => m.GoldenDuskTemplateChampagneDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaAntiguo: dynamic(() => import("@/components/templates/GoldenDuskTemplateRosaAntiguo").then((m) => m.GoldenDuskTemplateRosaAntiguo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Salvia: dynamic(() => import("@/components/templates/GoldenDuskTemplateSalvia").then((m) => m.GoldenDuskTemplateSalvia), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const SEDA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/SedaTemplate").then((m) => m.SedaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/SedaTemplateEsmeralda").then((m) => m.SedaTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marfil: dynamic(() => import("@/components/templates/SedaTemplateMarfil").then((m) => m.SedaTemplateMarfil), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Nocturna: dynamic(() => import("@/components/templates/SedaTemplateNocturna").then((m) => m.SedaTemplateNocturna), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Perla: dynamic(() => import("@/components/templates/SedaTemplatePerla").then((m) => m.SedaTemplatePerla), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const PETALOS_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/PetalosTemplate").then((m) => m.PetalosTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/PetalosTemplateCoral").then((m) => m.PetalosTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Pastel: dynamic(() => import("@/components/templates/PetalosTemplatePastel").then((m) => m.PetalosTemplatePastel), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaPastel: dynamic(() => import("@/components/templates/PetalosTemplateRosaPastel").then((m) => m.PetalosTemplateRosaPastel), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  VinoVibrante: dynamic(() => import("@/components/templates/PetalosTemplateVinoVibrante").then((m) => m.PetalosTemplateVinoVibrante), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const LUZLUNA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/LuzLunaTemplate").then((m) => m.LuzLunaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  MedianocheAzul: dynamic(() => import("@/components/templates/LuzLunaTemplateMedianocheAzul").then((m) => m.LuzLunaTemplateMedianocheAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NocheEstrellada: dynamic(() => import("@/components/templates/LuzLunaTemplateNocheEstrellada").then((m) => m.LuzLunaTemplateNocheEstrellada), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Perlada: dynamic(() => import("@/components/templates/LuzLunaTemplatePerlada").then((m) => m.LuzLunaTemplatePerlada), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  PerlaSuave: dynamic(() => import("@/components/templates/LuzLunaTemplatePerlaSuave").then((m) => m.LuzLunaTemplatePerlaSuave), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const BONVOYAGE_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/BonVoyageTemplate").then((m) => m.BonVoyageTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/BonVoyageTemplateCoral").then((m) => m.BonVoyageTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/BonVoyageTemplateEsmeralda").then((m) => m.BonVoyageTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lavanda: dynamic(() => import("@/components/templates/BonVoyageTemplateLavanda").then((m) => m.BonVoyageTemplateLavanda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Medianoche: dynamic(() => import("@/components/templates/BonVoyageTemplateMedianoche").then((m) => m.BonVoyageTemplateMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Turquesa: dynamic(() => import("@/components/templates/BonVoyageTemplateTurquesa").then((m) => m.BonVoyageTemplateTurquesa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CORPORATE_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CorporateTemplate").then((m) => m.CorporateTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bordo: dynamic(() => import("@/components/templates/CorporateTemplateBordo").then((m) => m.CorporateTemplateBordo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Claro: dynamic(() => import("@/components/templates/CorporateTemplateClaro").then((m) => m.CorporateTemplateClaro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/CorporateTemplateVerde").then((m) => m.CorporateTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/CorporateTemplateVioleta").then((m) => m.CorporateTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const GARDENPARTY_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/GardenPartyTemplate").then((m) => m.GardenPartyTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amarillo: dynamic(() => import("@/components/templates/GardenPartyTemplateAmarillo").then((m) => m.GardenPartyTemplateAmarillo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lavanda: dynamic(() => import("@/components/templates/GardenPartyTemplateLavanda").then((m) => m.GardenPartyTemplateLavanda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/GardenPartyTemplateRosa").then((m) => m.GardenPartyTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Vibrante: dynamic(() => import("@/components/templates/GardenPartyTemplateVibrante").then((m) => m.GardenPartyTemplateVibrante), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const LOFTINDUSTRIAL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/LoftIndustrialTemplate").then((m) => m.LoftIndustrialTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Acero: dynamic(() => import("@/components/templates/LoftIndustrialTemplateAcero").then((m) => m.LoftIndustrialTemplateAcero), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Claro: dynamic(() => import("@/components/templates/LoftIndustrialTemplateClaro").then((m) => m.LoftIndustrialTemplateClaro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cobre: dynamic(() => import("@/components/templates/LoftIndustrialTemplateCobre").then((m) => m.LoftIndustrialTemplateCobre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/LoftIndustrialTemplateVerde").then((m) => m.LoftIndustrialTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const INFANTIL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/InfantilTemplate").then((m) => m.InfantilTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amarillo: dynamic(() => import("@/components/templates/InfantilTemplateAmarillo").then((m) => m.InfantilTemplateAmarillo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Celeste: dynamic(() => import("@/components/templates/InfantilTemplateCeleste").then((m) => m.InfantilTemplateCeleste), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lavanda: dynamic(() => import("@/components/templates/InfantilTemplateLavanda").then((m) => m.InfantilTemplateLavanda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Menta: dynamic(() => import("@/components/templates/InfantilTemplateMenta").then((m) => m.InfantilTemplateMenta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
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
