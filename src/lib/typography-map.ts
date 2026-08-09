import type { CSSProperties } from "react";

// Corrección 2 (docs/correcciones.md): catálogo compartido de tipografías de
// título/texto del wizard. Un solo lugar para el mapeo id -> CSS, usado por
// StepTypography.tsx (grillas de selección), WizardLivePreview.tsx (preview
// en vivo) y las plantillas públicas (custom properties --font-title /
// --font-body-custom).

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string; // var(--font-x)
  fontStyle?: "italic";
}

export const TITLE_FONT_OPTIONS: FontOption[] = [
  { id: "fraunces", label: "Fraunces", fontFamily: "var(--font-fraunces)" },
  { id: "fraunces-italic", label: "Fraunces Italic", fontFamily: "var(--font-fraunces)", fontStyle: "italic" },
  { id: "cormorant-italic", label: "Cormorant Italic", fontFamily: "var(--font-cormorant)", fontStyle: "italic" },
  { id: "dancing-script", label: "Dancing Script", fontFamily: "var(--font-dancing-script)" },
  { id: "playfair-display", label: "Playfair Display", fontFamily: "var(--font-playfair-display)" },
  { id: "great-vibes", label: "Great Vibes", fontFamily: "var(--font-great-vibes)" },
];

export const BODY_FONT_OPTIONS: FontOption[] = [
  { id: "space-grotesk", label: "Space Grotesk", fontFamily: "var(--font-space-grotesk)" },
  { id: "inter", label: "Inter", fontFamily: "var(--font-inter)" },
  { id: "merriweather", label: "Merriweather", fontFamily: "var(--font-merriweather)" },
  { id: "lora", label: "Lora", fontFamily: "var(--font-lora)" },
  { id: "dm-sans", label: "DM Sans", fontFamily: "var(--font-dm-sans)" },
];

const TITLE_BY_ID = Object.fromEntries(TITLE_FONT_OPTIONS.map((o) => [o.id, o]));
const BODY_BY_ID = Object.fromEntries(BODY_FONT_OPTIONS.map((o) => [o.id, o]));

export function getTitleFont(id?: string | null): FontOption {
  return (id && TITLE_BY_ID[id]) || TITLE_FONT_OPTIONS[0];
}

export function getBodyFont(id?: string | null): FontOption {
  return (id && BODY_BY_ID[id]) || BODY_FONT_OPTIONS[0];
}

// Custom properties que cada plantilla pública agrega a su wrapper raíz.
export function getTypographyCssVars(fontTitle?: string | null, fontBody?: string | null): CSSProperties {
  const title = getTitleFont(fontTitle);
  const body = getBodyFont(fontBody);
  return {
    ["--font-title" as string]: title.fontFamily,
    ["--font-title-style" as string]: title.fontStyle || "normal",
    ["--font-body-custom" as string]: body.fontFamily,
  } as CSSProperties;
}
