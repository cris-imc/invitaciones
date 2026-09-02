import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentType } from "react";

export type TemplateTipo = "ELEGANT" | "MODERNO" | "NEON" | "CHIC" | "EDITORIAL" | "ONIX" | "JARDINSEDA" | "HOLOGRAMA" | "CIRCUITO" | "CRISTAL3D" | "CINE" | "NORDICO" | "RIVIERA" | "GOLDENDUSK" | "SEDA" | "PETALOS" | "LUZLUNA" | "BONVOYAGE" | "CORPORATE" | "GARDENPARTY" | "LOFTINDUSTRIAL" | "INFANTIL" | "GUESTPASSVIP" | "PRINCESA" | "CORONAESCARLATA" | "JEWELRYBOX" | "PASEVIP" | "CINEABSTRACTOXV" | "ACRYLICPOP" | "BOLADEDISCOTECA" | "CRYSTAL3D" | "FASHIONTAG" | "CERAMICAEDITORIAL" | "CINEABSTRACTO" | "PAPELERIADEHOTELDELUJO" | "VINTAGEEDITORIAL" | "FASHIONLOOKBOOK" | "MARMOLYORO" | "ATELIERDEPAPEL" | "BOTANICAEDITORIAL" | "ENCAJECONTEMPORANEO" | "LIQUIDGLASS" | "BLACKANDWHITE" | "BABYSHOWER" | "BAUTISMO" | "CORPORATIVOANIVERSARIO" | "CORPORATIVOENCUENTRO" | "CUMPLEANOSCOCKTAIL" | "CUMPLEANOSJARDIN" | "CUMPLEANOSTERRAZA" | "DESPEDIDASOLTERA" | "DESPEDIDASOLTERO" | "GRADUACION" | "INAUGURACION" | "INFANTILESPACIO" | "INFANTILJURASICO" | "INFANTILSAFARI" | "ANIVERSARIO";

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
// Eclipse va primero: unica variante con base violeta-negra genuina (el
// resto comparte el mismo #0D0D10 casi neutro de "default").
export const NEON_COLORS: ColorOption[] = [
  { id: "Eclipse", name: "Eclipse", color: "#FF6EC7" },
  { id: "default", name: "Cian y Magenta", color: "#39FFD0" },
  { id: "Violeta", name: "Violeta y Cian", color: "#B24BFF" },
  { id: "Dorado", name: "Dorado y Magenta", color: "#FFC94B" },
  { id: "Verde", name: "Verde Lima y Magenta", color: "#B6FF3C" },
  { id: "Azul", name: "Azul Eléctrico y Magenta", color: "#3C8CFF" },
  { id: "Rojo", name: "Rojo y Cian", color: "#FF3C5C" },
  { id: "Blackout", name: "Blackout", color: "#00E5FF" },
  { id: "Tropical", name: "Tropical", color: "#FF8A3D" },
  { id: "Ascuas", name: "Ascuas", color: "#FFD166" },
  { id: "Manzana", name: "Manzana", color: "#7ED321" },
];

// Chic ("Doodle Wedding") solo se ofrece para CASAMIENTO -- el gating vive
// en TemplatePreviewModal.tsx, no acá. A diferencia de Moderno, acá el
// acento principal SÍ varía por completo en cada variante (--t-acc deja de
// ser dorado fijo) -- ver docs/GUIA_TECNICA_PLANTILLAS.md, "Bug 6".
export const CHIC_COLORS: ColorOption[] = [
  { id: "Ambar", name: "Ámbar Cálido", color: "#B8823E" },
  { id: "default", name: "Dorado Clásico", color: "#C9A876" },
  { id: "Rosa", name: "Rosa Antiguo", color: "#B08590" },
  { id: "Azul", name: "Azul Grisáceo", color: "#6E8299" },
  { id: "Terracota", name: "Terracota", color: "#B9713F" },
  { id: "Violeta", name: "Violeta Apagado", color: "#8779A0" },
  { id: "VerdeBotella", name: "Verde Botella", color: "#3F5F4A" },
  { id: "Gris", name: "Gris Cálido", color: "#8C8275" },
  { id: "NocheChic", name: "Noche Chic", color: "#D9A15C" },
  { id: "PiedraChic", name: "Piedra Chic", color: "#6E7A6E" },
  { id: "AzulMedianocheChic", name: "Azul Medianoche", color: "#7FA8D9" },
];


// Grafito va primero a propósito: es la única variante de esta familia con
// una base gris fría genuina (el resto comparte el mismo beige cálido
// #EDEBE5 de "default", solo cambia el acento) -- así la primera vista de
// Editorial en el selector de familias no repite la base clara de la
// familia anterior en la fila de tabs (ver TemplatePreviewModal.tsx).
export const EDITORIAL_COLORS: ColorOption[] = [
  { id: "Grafito", name: "Grafito", color: "#4B4F58" },
  { id: "default", name: "Burdeos Editorial", color: "#A3123B" },
  { id: "Azul", name: "Azul", color: "#1B3A5C" },
  { id: "Gris", name: "Gris", color: "#4A4640" },
  { id: "Malva", name: "Malva", color: "#6B4A6B" },
  { id: "Terracota", name: "Terracota", color: "#B5502E" },
  { id: "Verde", name: "Verde", color: "#1F4B3F" },
  { id: "Onice", name: "Onice", color: "#C9A15C" },
  { id: "Piedra", name: "Piedra", color: "#6B7A6E" },
  { id: "Cobalto", name: "Cobalto", color: "#3B5773" },
];

// Medianoche va primero: base azul-negra genuina (el resto comparte el
// mismo violeta-negro #140B14 de "default").
export const ONIX_COLORS: ColorOption[] = [
  { id: "Medianoche", name: "Medianoche", color: "#C9D4E8" },
  { id: "default", name: "Oro Rosado", color: "#D89AA0" },
  { id: "Amatista", name: "Amatista", color: "#B48CD9" },
  { id: "Esmeralda", name: "Esmeralda", color: "#6FBF9B" },
  { id: "Oro", name: "Oro", color: "#D4AF62" },
  { id: "Plata", name: "Plata", color: "#C9C9D1" },
  { id: "Zafiro", name: "Zafiro", color: "#7FA8D9" },
  { id: "Carbon", name: "Carbón", color: "#B0C9D6" },
  { id: "Marfil", name: "Marfil", color: "#8C3F52" },
  { id: "Bosque", name: "Bosque", color: "#C97B4A" },
];

export const JARDINSEDA_COLORS: ColorOption[] = [
  { id: "default", name: "Malva", color: "#B79FC4" },
  { id: "Cielo", name: "Cielo", color: "#8CA9C4" },
  { id: "Durazno", name: "Durazno", color: "#E0A97E" },
  { id: "Lila", name: "Lila", color: "#9C8AD1" },
  { id: "RosaAntiguo", name: "Rosa Antiguo", color: "#D68FA0" },
  { id: "Salvia", name: "Salvia", color: "#6F9A76" },
  { id: "JardinNocturno", name: "Jardín Nocturno", color: "#9C7FB4" },
  { id: "PiedraJardin", name: "Piedra Jardín", color: "#7A8570" },
  { id: "TerracotaJardin", name: "Terracota Jardín", color: "#C1734A" },
];

// Aurora va primero: base verde-azulada genuina (el resto comparte el mismo
// negro neutro #0D0D14 de "default").
export const HOLOGRAMA_COLORS: ColorOption[] = [
  { id: "Aurora", name: "Aurora", color: "#4FE8C8" },
  { id: "default", name: "Violeta Holográfico", color: "#A78BFA" },
  { id: "Azul", name: "Azul", color: "#5B8CFF" },
  { id: "Coral", name: "Coral", color: "#FF8A65" },
  { id: "Dorado", name: "Dorado", color: "#F5C452" },
  { id: "Esmeralda", name: "Esmeralda", color: "#2EE6A8" },
  { id: "Rosa", name: "Rosa", color: "#FF6FD8" },
  { id: "NebulosaRoja", name: "Nebulosa Roja", color: "#FF3355" },
  { id: "BlancoPrisma", name: "Blanco Prisma", color: "#6F4BE0" },
  { id: "GrafitoCuantico", name: "Grafito Cuántico", color: "#00D9FF" },
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
  { id: "AmbarFundido", name: "Ámbar Fundido", color: "#FFB347" },
  { id: "CristalBlanco", name: "Cristal Blanco", color: "#4A7FBF" },
  { id: "RosaCristalOscuro", name: "Rosa Cristal Oscuro", color: "#FF6FD8" },
];

// Café va primero: base marrón café más pronunciada (el resto, incluido
// "default"/Sepia, comparte el mismo casi-negro #17130F -- se nota marrón
// recién en el acento, no en el fondo).
export const CINE_COLORS: ColorOption[] = [
  { id: "Ambar", name: "Café Tostado", color: "#CE9A4A" },
  { id: "default", name: "Sepia", color: "#C08A3E" },
  { id: "Borgona", name: "Borgoña", color: "#8C4A56" },
  { id: "Esmeralda", name: "Esmeralda", color: "#5B8A72" },
  { id: "Noir", name: "Noir", color: "#8FA3B0" },
  { id: "Tecnicolor", name: "Tecnicolor", color: "#C1442E" },
  { id: "BlancoYNegro", name: "Blanco y Negro", color: "#3A3A3A" },
  { id: "MedianocheDeCine", name: "Medianoche de Cine", color: "#4A7BA8" },
  { id: "OcreVintage", name: "Ocre Vintage", color: "#8C9A4A" },
];

// Pizarra va primero: base gris-pizarra fría genuina (el resto, incluido
// "default"/Grafito -- que solo tiñe el acento -- comparte el mismo blanco
// puro #FFFFFF de fondo).
export const NORDICO_COLORS: ColorOption[] = [
  { id: "Pizarra", name: "Pizarra", color: "#4A5A66" },
  { id: "default", name: "Grafito", color: "#5B5850" },
  { id: "Bosque", name: "Bosque", color: "#3F5D45" },
  { id: "Marino", name: "Marino", color: "#35507A" },
  { id: "Ocre", name: "Ocre", color: "#A97D2A" },
  { id: "Terracota", name: "Terracota", color: "#B15E3D" },
  { id: "CarbonNordico", name: "Carbón Nórdico", color: "#C9B08A" },
  { id: "Musgo", name: "Musgo", color: "#5B6E52" },
  { id: "ArticoAzul", name: "Ártico Azul", color: "#2E6B8F" },
];

// Cal va primero: base blanco-cal/verde pálida genuina (el resto comparte
// el mismo crema #FAF1E4 de "default").
export const RIVIERA_COLORS: ColorOption[] = [
  { id: "Cal", name: "Cal", color: "#D9899C" },
  { id: "default", name: "Terracota Riviera", color: "#C1734A" },
  { id: "Azulejo", name: "Azulejo", color: "#3E7C8C" },
  { id: "Coral", name: "Coral", color: "#D97757" },
  { id: "Ocre", name: "Ocre", color: "#C6963B" },
  { id: "Oliva", name: "Oliva", color: "#7A8F5E" },
  { id: "MedianocheRiviera", name: "Medianoche Riviera", color: "#E8B4A0" },
  { id: "PiedraGris", name: "Piedra Gris", color: "#6E7A6E" },
  { id: "LavandaCostera", name: "Lavanda Costera", color: "#6E7CA8" },
  { id: "OcasoAzulejo", name: "Ocaso Azulejo", color: "#4A8C99" },
];

// Ocaso va primero: base malva/ciruela pálida genuina (el resto comparte el
// mismo crema #FDF6F0 de "default").
export const GOLDENDUSK_COLORS: ColorOption[] = [
  { id: "Ocaso", name: "Ocaso", color: "#A8899C" },
  { id: "default", name: "Atardecer", color: "#C8956C" },
  { id: "AzulMedianoche", name: "Azul Medianoche", color: "#3B5773" },
  { id: "Borgona", name: "Borgoña", color: "#8C4A4A" },
  { id: "ChampagneDorado", name: "Champagne Dorado", color: "#B8863E" },
  { id: "RosaAntiguo", name: "Rosa Antiguo", color: "#B97D82" },
  { id: "Salvia", name: "Salvia", color: "#7C8F6E" },
  { id: "NocheDorada", name: "Noche Dorada", color: "#D9A15C" },
  { id: "PiedraCalida", name: "Piedra Cálida", color: "#A97D5C" },
  { id: "BrumaAzul", name: "Bruma Azul", color: "#5C7A96" },
  { id: "NocheCiruela", name: "Noche Ciruela", color: "#9C6B8C" },
];

export const SEDA_COLORS: ColorOption[] = [
  { id: "default", name: "Champagne", color: "#C9A0A6" },
  { id: "Esmeralda", name: "Esmeralda", color: "#3D6E58" },
  { id: "Marfil", name: "Marfil", color: "#B98D57" },
  { id: "Nocturna", name: "Nocturna", color: "#8C4A52" },
  { id: "Perla", name: "Perla", color: "#8FA3B0" },
  { id: "OnixSeda", name: "Ónix Seda", color: "#7FA8D9" },
  { id: "Piedra", name: "Piedra", color: "#6E7A6E" },
  { id: "Ciruela", name: "Ciruela", color: "#6B4A6B" },
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

// Ivoire va primero: base marfil cálida genuina (el resto comparte el mismo
// celeste pálido #F4F9FB de "default").
export const BONVOYAGE_COLORS: ColorOption[] = [
  { id: "Ivoire", name: "Ivoire", color: "#9C8A4A" },
  { id: "default", name: "Océano", color: "#2E7EA6" },
  { id: "Coral", name: "Coral", color: "#C97A5C" },
  { id: "Esmeralda", name: "Esmeralda", color: "#2E8B72" },
  { id: "Lavanda", name: "Lavanda", color: "#6B6FA6" },
  { id: "Medianoche", name: "Medianoche", color: "#24506B" },
  { id: "Turquesa", name: "Turquesa", color: "#2CA6A4" },
  { id: "NocheDeViaje", name: "Noche de Viaje", color: "#C9A15C" },
  { id: "ArenaCalida", name: "Arena Cálida", color: "#6E8299" },
  { id: "MapaVintage", name: "Mapa Vintage", color: "#6E7A4A" },
  { id: "CoralTropical", name: "Coral Tropical", color: "#FF6B35" },
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

// Por ahora una sola variante de color (dorado champagne sobre negro, la
// aprobada en el diseño original) -- futuras variantes de acento seguirían
// el mismo patrón que el resto de las familias.
export const GUESTPASSVIP_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Champagne", color: "#C8A45C" },
  { id: "Borgona", name: "Borgoña", color: "#BE6774" },
  { id: "Esmeralda", name: "Esmeralda", color: "#4FA983" },
  { id: "Plata", name: "Plata", color: "#B6C4CF" },
  { id: "Zafiro", name: "Zafiro", color: "#6D93C9" },
];

// Primera familia de la Colección Storytelling exclusiva del tipo de evento
// genérico "Evento" (CUMPLEANOS) -- ver soloCumpleanos en
// TemplatePreviewModal.tsx. "Nube y Estrella" (lavanda sobre noche) es la
// base; el resto son variantes de acento sobre el mismo layout/copy/motion.
export const BABYSHOWER_COLORS: ColorOption[] = [
  { id: "default", name: "Nube y Estrella", color: "#C9A8D4" },
  { id: "Menta", name: "Menta", color: "#8FBFA3" },
  { id: "Durazno", name: "Durazno", color: "#E8A87C" },
  { id: "Celeste", name: "Celeste", color: "#8AAED0" },
  { id: "Dorado", name: "Dorado Suave", color: "#D4B483" },
];

export const BAUTISMO_COLORS: ColorOption[] = [
  { id: "default", name: "Luz y Lino", color: "#B7A97E" },
  { id: "Celeste", name: "Celeste", color: "#A9C4D9" },
  { id: "Marfil", name: "Marfil", color: "#D9CBAE" },
  { id: "Rosa", name: "Rosa", color: "#D9A9B7" },
  { id: "VerdeSalvia", name: "Verde Salvia", color: "#A9C4A0" },
];

export const CORPORATIVOANIVERSARIO_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Ejecutivo", color: "#C9A25C" },
  { id: "Borgona", name: "Borgoña", color: "#B8707A" },
  { id: "Esmeralda", name: "Esmeralda", color: "#6FA98A" },
  { id: "Grafito", name: "Grafito", color: "#A8A8AC" },
  { id: "Plata", name: "Plata", color: "#B8C0C9" },
];

export const CORPORATIVOENCUENTRO_COLORS: ColorOption[] = [
  { id: "default", name: "Cobre", color: "#B8895A" },
  { id: "Azul", name: "Azul", color: "#6E93B8" },
  { id: "Gris", name: "Gris", color: "#A0A0A0" },
  { id: "Verde", name: "Verde", color: "#7AA377" },
  { id: "Vino", name: "Vino", color: "#A5677A" },
];

export const CUMPLEANOSCOCKTAIL_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Champagne", color: "#C8A45C" },
  { id: "Esmeralda", name: "Esmeralda", color: "#4FA983" },
  { id: "Plata", name: "Plata", color: "#B6C4CF" },
  { id: "Rubi", name: "Rubí", color: "#C9556F" },
  { id: "Zafiro", name: "Zafiro", color: "#6D93C9" },
];

export const CUMPLEANOSJARDIN_COLORS: ColorOption[] = [
  { id: "default", name: "Jardín", color: "#9FB98A" },
  { id: "Azulado", name: "Azulado", color: "#7FA8C9" },
  { id: "Coral", name: "Coral", color: "#E08A6F" },
  { id: "Dorado", name: "Dorado", color: "#D4B483" },
  { id: "Lavanda", name: "Lavanda", color: "#B48CC9" },
];

export const CUMPLEANOSTERRAZA_COLORS: ColorOption[] = [
  { id: "default", name: "Terracota", color: "#D99A5B" },
  { id: "Azul", name: "Azul", color: "#6D93C9" },
  { id: "Esmeralda", name: "Esmeralda", color: "#5FA97C" },
  { id: "Malva", name: "Malva", color: "#B48CA0" },
  { id: "Rojo", name: "Rojo", color: "#C9556F" },
];

export const DESPEDIDASOLTERA_COLORS: ColorOption[] = [
  { id: "default", name: "Rosa", color: "#E08FA8" },
  { id: "Coral", name: "Coral", color: "#E8A07C" },
  { id: "Dorado", name: "Dorado", color: "#D4B483" },
  { id: "Turquesa", name: "Turquesa", color: "#6FC5C0" },
  { id: "Violeta", name: "Violeta", color: "#B48CC9" },
];

export const DESPEDIDASOLTERO_COLORS: ColorOption[] = [
  { id: "default", name: "Azul", color: "#4A9BC9" },
  { id: "Dorado", name: "Dorado", color: "#C8A45C" },
  { id: "Esmeralda", name: "Esmeralda", color: "#4FA983" },
  { id: "Grafito", name: "Grafito", color: "#A8A8AE" },
  { id: "Vino", name: "Vino", color: "#BE6774" },
];

export const GRADUACION_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Académico", color: "#C6A860" },
  { id: "Azul", name: "Azul", color: "#6D93C9" },
  { id: "Borgona", name: "Borgoña", color: "#BE6774" },
  { id: "Plata", name: "Plata", color: "#B6C4CF" },
  { id: "Verde", name: "Verde", color: "#5FA97A" },
];

export const INAUGURACION_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado", color: "#C8A45C" },
  { id: "Azul", name: "Azul", color: "#6D93C9" },
  { id: "Cobre", name: "Cobre", color: "#C97B4A" },
  { id: "Esmeralda", name: "Esmeralda", color: "#4FA983" },
  { id: "Grafito", name: "Grafito", color: "#B9B9BC" },
];

export const INFANTILESPACIO_COLORS: ColorOption[] = [
  { id: "default", name: "Espacial", color: "#5FC9E8" },
  { id: "Dorado", name: "Dorado", color: "#E8C05F" },
  { id: "Rosa", name: "Rosa", color: "#E87EC0" },
  { id: "Verde", name: "Verde", color: "#5FE8A0" },
  { id: "Violeta", name: "Violeta", color: "#9B7EE8" },
];

export const INFANTILJURASICO_COLORS: ColorOption[] = [
  { id: "default", name: "Jurásico", color: "#7EA84A" },
  { id: "Amarillo", name: "Amarillo", color: "#D4B23C" },
  { id: "Marron", name: "Marrón", color: "#A87D4A" },
  { id: "Naranja", name: "Naranja", color: "#E08A3C" },
  { id: "Rojo", name: "Rojo", color: "#C9584A" },
];

export const INFANTILSAFARI_COLORS: ColorOption[] = [
  { id: "default", name: "Safari", color: "#D98A3C" },
  { id: "Amarillo", name: "Amarillo", color: "#D9B23C" },
  { id: "Coral", name: "Coral", color: "#E0704A" },
  { id: "Turquesa", name: "Turquesa", color: "#4EA3A8" },
  { id: "Verde", name: "Verde", color: "#6B8E4E" },
];

export const ANIVERSARIO_COLORS: ColorOption[] = [
  { id: "default", name: "Terracota", color: "#C48A6E" },
  { id: "Azul", name: "Azul", color: "#5C7EA8" },
  { id: "Borgona", name: "Borgoña", color: "#8C4A54" },
  { id: "Dorado", name: "Dorado", color: "#C9A45C" },
  { id: "Esmeralda", name: "Esmeralda", color: "#4E8C6E" },
];


// Negativo es la inversión clara/oscura de la misma familia (mismo layout,
// copy y motion) -- no un acento de color como en el resto de familias, así
// que su swatch usa el tono de fondo claro para distinguirse de un vistazo.
export const BLACKANDWHITE_COLORS: ColorOption[] = [
  { id: "default", name: "Grafito", color: "#B9B9BC" },
  { id: "Negativo", name: "Negativo", color: "#EDEAE0" },
];

// Por ahora una sola variante de color (lavanda sobre ciruela oscuro, la
// aprobada en el diseño original) -- misma lógica que GUESTPASSVIP_COLORS.
export const PRINCESA_COLORS: ColorOption[] = [
  { id: "default", name: "Lavanda Real", color: "#B48CC9" },
  { id: "AzulMedianoche", name: "Azul Medianoche", color: "#2F4E85" },
  { id: "Borgona", name: "Borgoña", color: "#7A2438" },
  { id: "BosqueEncantado", name: "Bosque Encantado", color: "#2C5C3C" },
  { id: "RosaAntiguo", name: "Rosa Antiguo", color: "#8C5A64" },
];

export const CORONAESCARLATA_COLORS: ColorOption[] = [
  { id: "default", name: "Escarlata y Oro", color: "#D9A441" },
  { id: "Esmeralda", name: "Esmeralda", color: "#2F6E45" },
  { id: "Imperial", name: "Imperial", color: "#7A3F8C" },
  { id: "Medianoche", name: "Medianoche", color: "#2B2B33" },
  { id: "Zafiro", name: "Zafiro", color: "#2E6FB8" },
];

export const JEWELRYBOX_COLORS: ColorOption[] = [
  { id: "default", name: "Ciruela y Dorado", color: "#D9B063" },
  { id: "Esmeralda", name: "Esmeralda", color: "#5FC38A" },
  { id: "Perla", name: "Perla", color: "#BDB4CC" },
  { id: "Rubi", name: "Rubí", color: "#E0748F" },
  { id: "Zafiro", name: "Zafiro", color: "#7FA8DB" },
];

export const PASEVIP_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado y Negro", color: "#C8A45C" },
  { id: "Cobre", name: "Cobre", color: "#C9784A" },
  { id: "Platino", name: "Platino", color: "#8FB4D9" },
  { id: "Rubi", name: "Rubí", color: "#C23B4E" },
  { id: "Violeta", name: "Violeta", color: "#9B7FC4" },
];

export const CINEABSTRACTOXV_COLORS: ColorOption[] = [
  { id: "default", name: "Marquesina Roja", color: "#E8123A" },
  { id: "Noir", name: "Noir", color: "#9FA8B0" },
  { id: "SciFi", name: "Sci-Fi", color: "#E01AA0" },
  { id: "Tecnicolor", name: "Tecnicolor", color: "#FF6A1F" },
  { id: "Western", name: "Western", color: "#8C2333" },
];

export const ACRYLICPOP_COLORS: ColorOption[] = [
  { id: "default", name: "Fucsia Ácido", color: "#FF3D8B" },
  { id: "Bubblegum", name: "Bubblegum", color: "#FF4FC3" },
  { id: "Scarlet", name: "Escarlata", color: "#FF3355" },
  { id: "Sunset", name: "Atardecer", color: "#FF7A29" },
  { id: "UltraViolet", name: "Ultravioleta", color: "#C13DFF" },
];

export const BOLADEDISCOTECA_COLORS: ColorOption[] = [
  { id: "default", name: "Neón Disco", color: "#FF2E9A" },
  { id: "Esmeralda", name: "Esmeralda", color: "#00E58A" },
  { id: "FucsiaElectrico", name: "Fucsia Eléctrico", color: "#FF17B0" },
  { id: "Turquesa", name: "Turquesa", color: "#00E5C7" },
  { id: "Violeta", name: "Violeta", color: "#B026FF" },
];

export const CRYSTAL3D_COLORS: ColorOption[] = [
  { id: "default", name: "Cristal Celeste", color: "#7FD1E0" },
  { id: "AmbarBronce", name: "Ámbar Bronce", color: "#E8A94C" },
  { id: "CuarzoRosa", name: "Cuarzo Rosa", color: "#E8A9C4" },
  { id: "EsmeraldaPlata", name: "Esmeralda Plata", color: "#6FCB9F" },
  { id: "ZafiroBlanco", name: "Zafiro Blanco", color: "#6E93E8" },
];

export const FASHIONTAG_COLORS: ColorOption[] = [
  { id: "default", name: "Óxido Boutique", color: "#B0562E" },
  { id: "BottleGreen", name: "Verde Botella", color: "#2F6A4D" },
  { id: "Burgundy", name: "Borgoña", color: "#9C2F49" },
  { id: "GoldenMustard", name: "Mostaza Dorado", color: "#C2903A" },
  { id: "MidnightNavy", name: "Azul Medianoche", color: "#35547E" },
];

export const CERAMICAEDITORIAL_COLORS: ColorOption[] = [
  { id: "default", name: "Bronce Cerámico", color: "#B98B5E" },
  { id: "Celadon", name: "Celadón", color: "#7FA98A" },
  { id: "Cobalto", name: "Cobalto", color: "#5E8BB9" },
  { id: "GrisPiedra", name: "Gris Piedra", color: "#9AA3A6" },
  { id: "Terracota", name: "Terracota", color: "#C1704A" },
];

export const CINEABSTRACTO_COLORS: ColorOption[] = [
  { id: "default", name: "Cobre Cine", color: "#C6743A" },
  { id: "BlancoNegroPlata", name: "Blanco y Negro Plata", color: "#B9C0C6" },
  { id: "NoirEsmeralda", name: "Noir Esmeralda", color: "#3F9C74" },
  { id: "SepiaClasico", name: "Sepia Clásico", color: "#B98A3E" },
  { id: "TecnicolorAzulNaranja", name: "Tecnicolor Azul y Naranja", color: "#E0692E" },
];

export const PAPELERIADEHOTELDELUJO_COLORS: ColorOption[] = [
  { id: "default", name: "Verde Hotel", color: "#1C4A3F" },
  { id: "AzulMarinoPlata", name: "Azul Marino y Plata", color: "#B8C9DE" },
  { id: "BorgonaOroRosa", name: "Borgoña y Oro Rosa", color: "#E3A99A" },
  { id: "GrisCarbonOroBlanco", name: "Gris Carbón y Oro Blanco", color: "#C9C2AA" },
  { id: "NegroYBronce", name: "Negro y Bronce", color: "#C1793E" },
];

export const VINTAGEEDITORIAL_COLORS: ColorOption[] = [
  { id: "default", name: "Dorado Vintage", color: "#C9A66B" },
  { id: "AzulPetroleo", name: "Azul Petróleo", color: "#67A3B3" },
  { id: "BorgonaVino", name: "Borgoña Vino", color: "#B66A7E" },
  { id: "OlivaVintage", name: "Oliva Vintage", color: "#9CAA5E" },
  { id: "PlataAntigua", name: "Plata Antigua", color: "#AAB1BB" },
];

export const FASHIONLOOKBOOK_COLORS: ColorOption[] = [
  { id: "default", name: "Rojo Editorial", color: "#D93A2B" },
  { id: "Cobalto", name: "Cobalto", color: "#2F55D9" },
  { id: "Magenta", name: "Magenta", color: "#D93A93" },
  { id: "Militar", name: "Militar", color: "#6B8F3B" },
  { id: "Mostaza", name: "Mostaza", color: "#D9A430" },
];

export const MARMOLYORO_COLORS: ColorOption[] = [
  { id: "default", name: "Mármol y Oro", color: "#C9A45C" },
  { id: "Bronce", name: "Bronce", color: "#B87333" },
  { id: "Esmeralda", name: "Esmeralda", color: "#3F9C74" },
  { id: "Onix", name: "Ónix", color: "#C9CDD1" },
  { id: "Rosa", name: "Rosa", color: "#D98FA0" },
];

export const ATELIERDEPAPEL_COLORS: ColorOption[] = [
  { id: "default", name: "Bronce y Papel", color: "#7A6852" },
  { id: "AzulTinta", name: "Azul Tinta", color: "#3F638D" },
  { id: "BorgonaVino", name: "Borgoña Vino", color: "#9B3B4B" },
  { id: "GrisGrafito", name: "Gris Grafito", color: "#606976" },
  { id: "VerdeSalvia", name: "Verde Salvia", color: "#5F7A52" },
];

export const BOTANICAEDITORIAL_COLORS: ColorOption[] = [
  { id: "default", name: "Oliva y Salvia", color: "#5A6E4E" },
  { id: "Borgona", name: "Borgoña", color: "#A9727C" },
  { id: "Indigo", name: "Índigo", color: "#7CA8C2" },
  { id: "Lavanda", name: "Lavanda", color: "#9A87B8" },
  { id: "Terracota", name: "Terracota", color: "#C08A6A" },
];

export const ENCAJECONTEMPORANEO_COLORS: ColorOption[] = [
  { id: "default", name: "Terracota y Encaje", color: "#A6491F" },
  { id: "AzulMedianoche", name: "Azul Medianoche", color: "#3E70B5" },
  { id: "Borgona", name: "Borgoña", color: "#A83A5A" },
  { id: "GrisPiedra", name: "Gris Piedra", color: "#6E6656" },
  { id: "VerdeBosque", name: "Verde Bosque", color: "#3F8A55" },
];

export const LIQUIDGLASS_COLORS: ColorOption[] = [
  { id: "default", name: "Azul Vidrio", color: "#6FA8C9" },
  { id: "Amatista", name: "Amatista", color: "#A86FC9" },
  { id: "Ambar", name: "Ámbar", color: "#C9A86F" },
  { id: "Cuarzo", name: "Cuarzo", color: "#C96FA8" },
  { id: "Esmeralda", name: "Esmeralda", color: "#6FC9A8" },
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
  Eclipse: dynamic(() => import("@/components/templates/NeonTemplateEclipse").then((m) => m.NeonTemplateEclipse), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/NeonTemplate").then((m) => m.NeonTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/NeonTemplateVioleta").then((m) => m.NeonTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/NeonTemplateDorado").then((m) => m.NeonTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/NeonTemplateVerde").then((m) => m.NeonTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/NeonTemplateAzul").then((m) => m.NeonTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rojo: dynamic(() => import("@/components/templates/NeonTemplateRojo").then((m) => m.NeonTemplateRojo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Blackout: dynamic(() => import("@/components/templates/NeonTemplateBlackout").then((m) => m.NeonTemplateBlackout), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Tropical: dynamic(() => import("@/components/templates/NeonTemplateTropical").then((m) => m.NeonTemplateTropical), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ascuas: dynamic(() => import("@/components/templates/NeonTemplateAscuas").then((m) => m.NeonTemplateAscuas), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Manzana: dynamic(() => import("@/components/templates/NeonTemplateManzana").then((m) => m.NeonTemplateManzana), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CHIC_COMPONENTS: Record<string, PreviewComponent> = {
  Ambar: dynamic(() => import("@/components/templates/ChicTemplateAmbar").then((m) => m.ChicTemplateAmbar), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/ChicTemplate").then((m) => m.ChicTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/ChicTemplateRosa").then((m) => m.ChicTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/ChicTemplateAzul").then((m) => m.ChicTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/ChicTemplateTerracota").then((m) => m.ChicTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/ChicTemplateVioleta").then((m) => m.ChicTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  VerdeBotella: dynamic(() => import("@/components/templates/ChicTemplateVerdeBotella").then((m) => m.ChicTemplateVerdeBotella), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Gris: dynamic(() => import("@/components/templates/ChicTemplateGris").then((m) => m.ChicTemplateGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NocheChic: dynamic(() => import("@/components/templates/ChicTemplateNocheChic").then((m) => m.ChicTemplateNocheChic), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  PiedraChic: dynamic(() => import("@/components/templates/ChicTemplatePiedraChic").then((m) => m.ChicTemplatePiedraChic), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulMedianocheChic: dynamic(() => import("@/components/templates/ChicTemplateAzulMedianocheChic").then((m) => m.ChicTemplateAzulMedianocheChic), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};


export const EDITORIAL_COMPONENTS: Record<string, PreviewComponent> = {
  Grafito: dynamic(() => import("@/components/templates/EditorialTemplateGrafito").then((m) => m.EditorialTemplateGrafito), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/EditorialTemplate").then((m) => m.EditorialTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/EditorialTemplateAzul").then((m) => m.EditorialTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Gris: dynamic(() => import("@/components/templates/EditorialTemplateGris").then((m) => m.EditorialTemplateGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Malva: dynamic(() => import("@/components/templates/EditorialTemplateMalva").then((m) => m.EditorialTemplateMalva), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/EditorialTemplateTerracota").then((m) => m.EditorialTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/EditorialTemplateVerde").then((m) => m.EditorialTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Onice: dynamic(() => import("@/components/templates/EditorialTemplateOnice").then((m) => m.EditorialTemplateOnice), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Piedra: dynamic(() => import("@/components/templates/EditorialTemplatePiedra").then((m) => m.EditorialTemplatePiedra), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cobalto: dynamic(() => import("@/components/templates/EditorialTemplateCobalto").then((m) => m.EditorialTemplateCobalto), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ONIX_COMPONENTS: Record<string, PreviewComponent> = {
  Medianoche: dynamic(() => import("@/components/templates/OnixTemplateMedianoche").then((m) => m.OnixTemplateMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/OnixTemplate").then((m) => m.OnixTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amatista: dynamic(() => import("@/components/templates/OnixTemplateAmatista").then((m) => m.OnixTemplateAmatista), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/OnixTemplateEsmeralda").then((m) => m.OnixTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Oro: dynamic(() => import("@/components/templates/OnixTemplateOro").then((m) => m.OnixTemplateOro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Plata: dynamic(() => import("@/components/templates/OnixTemplatePlata").then((m) => m.OnixTemplatePlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Zafiro: dynamic(() => import("@/components/templates/OnixTemplateZafiro").then((m) => m.OnixTemplateZafiro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Carbon: dynamic(() => import("@/components/templates/OnixTemplateCarbon").then((m) => m.OnixTemplateCarbon), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marfil: dynamic(() => import("@/components/templates/OnixTemplateMarfil").then((m) => m.OnixTemplateMarfil), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bosque: dynamic(() => import("@/components/templates/OnixTemplateBosque").then((m) => m.OnixTemplateBosque), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const JARDINSEDA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/JardinSedaTemplate").then((m) => m.JardinSedaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cielo: dynamic(() => import("@/components/templates/JardinSedaTemplateCielo").then((m) => m.JardinSedaTemplateCielo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Durazno: dynamic(() => import("@/components/templates/JardinSedaTemplateDurazno").then((m) => m.JardinSedaTemplateDurazno), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lila: dynamic(() => import("@/components/templates/JardinSedaTemplateLila").then((m) => m.JardinSedaTemplateLila), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaAntiguo: dynamic(() => import("@/components/templates/JardinSedaTemplateRosaAntiguo").then((m) => m.JardinSedaTemplateRosaAntiguo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Salvia: dynamic(() => import("@/components/templates/JardinSedaTemplateSalvia").then((m) => m.JardinSedaTemplateSalvia), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  JardinNocturno: dynamic(() => import("@/components/templates/JardinSedaTemplateJardinNocturno").then((m) => m.JardinSedaTemplateJardinNocturno), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  PiedraJardin: dynamic(() => import("@/components/templates/JardinSedaTemplatePiedraJardin").then((m) => m.JardinSedaTemplatePiedraJardin), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  TerracotaJardin: dynamic(() => import("@/components/templates/JardinSedaTemplateTerracotaJardin").then((m) => m.JardinSedaTemplateTerracotaJardin), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const HOLOGRAMA_COMPONENTS: Record<string, PreviewComponent> = {
  Aurora: dynamic(() => import("@/components/templates/HologramaTemplateAurora").then((m) => m.HologramaTemplateAurora), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/HologramaTemplate").then((m) => m.HologramaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/HologramaTemplateAzul").then((m) => m.HologramaTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/HologramaTemplateCoral").then((m) => m.HologramaTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/HologramaTemplateDorado").then((m) => m.HologramaTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/HologramaTemplateEsmeralda").then((m) => m.HologramaTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/HologramaTemplateRosa").then((m) => m.HologramaTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NebulosaRoja: dynamic(() => import("@/components/templates/HologramaTemplateNebulosaRoja").then((m) => m.HologramaTemplateNebulosaRoja), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BlancoPrisma: dynamic(() => import("@/components/templates/HologramaTemplateBlancoPrisma").then((m) => m.HologramaTemplateBlancoPrisma), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  GrafitoCuantico: dynamic(() => import("@/components/templates/HologramaTemplateGrafitoCuantico").then((m) => m.HologramaTemplateGrafitoCuantico), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
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
  AmbarFundido: dynamic(() => import("@/components/templates/Cristal3DTemplateAmbarFundido").then((m) => m.Cristal3DTemplateAmbarFundido), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  CristalBlanco: dynamic(() => import("@/components/templates/Cristal3DTemplateCristalBlanco").then((m) => m.Cristal3DTemplateCristalBlanco), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaCristalOscuro: dynamic(() => import("@/components/templates/Cristal3DTemplateRosaCristalOscuro").then((m) => m.Cristal3DTemplateRosaCristalOscuro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CINE_COMPONENTS: Record<string, PreviewComponent> = {
  Ambar: dynamic(() => import("@/components/templates/CineTemplateAmbar").then((m) => m.CineTemplateAmbar), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/CineTemplate").then((m) => m.CineTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/CineTemplateBorgona").then((m) => m.CineTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/CineTemplateEsmeralda").then((m) => m.CineTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Noir: dynamic(() => import("@/components/templates/CineTemplateNoir").then((m) => m.CineTemplateNoir), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Tecnicolor: dynamic(() => import("@/components/templates/CineTemplateTecnicolor").then((m) => m.CineTemplateTecnicolor), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BlancoYNegro: dynamic(() => import("@/components/templates/CineTemplateBlancoYNegro").then((m) => m.CineTemplateBlancoYNegro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  MedianocheDeCine: dynamic(() => import("@/components/templates/CineTemplateMedianocheDeCine").then((m) => m.CineTemplateMedianocheDeCine), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  OcreVintage: dynamic(() => import("@/components/templates/CineTemplateOcreVintage").then((m) => m.CineTemplateOcreVintage), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const NORDICO_COMPONENTS: Record<string, PreviewComponent> = {
  Pizarra: dynamic(() => import("@/components/templates/NordicoTemplatePizarra").then((m) => m.NordicoTemplatePizarra), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/NordicoTemplate").then((m) => m.NordicoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bosque: dynamic(() => import("@/components/templates/NordicoTemplateBosque").then((m) => m.NordicoTemplateBosque), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marino: dynamic(() => import("@/components/templates/NordicoTemplateMarino").then((m) => m.NordicoTemplateMarino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ocre: dynamic(() => import("@/components/templates/NordicoTemplateOcre").then((m) => m.NordicoTemplateOcre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/NordicoTemplateTerracota").then((m) => m.NordicoTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  CarbonNordico: dynamic(() => import("@/components/templates/NordicoTemplateCarbonNordico").then((m) => m.NordicoTemplateCarbonNordico), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Musgo: dynamic(() => import("@/components/templates/NordicoTemplateMusgo").then((m) => m.NordicoTemplateMusgo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  ArticoAzul: dynamic(() => import("@/components/templates/NordicoTemplateArticoAzul").then((m) => m.NordicoTemplateArticoAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const RIVIERA_COMPONENTS: Record<string, PreviewComponent> = {
  Cal: dynamic(() => import("@/components/templates/RivieraTemplateCal").then((m) => m.RivieraTemplateCal), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/RivieraTemplate").then((m) => m.RivieraTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azulejo: dynamic(() => import("@/components/templates/RivieraTemplateAzulejo").then((m) => m.RivieraTemplateAzulejo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/RivieraTemplateCoral").then((m) => m.RivieraTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ocre: dynamic(() => import("@/components/templates/RivieraTemplateOcre").then((m) => m.RivieraTemplateOcre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Oliva: dynamic(() => import("@/components/templates/RivieraTemplateOliva").then((m) => m.RivieraTemplateOliva), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  MedianocheRiviera: dynamic(() => import("@/components/templates/RivieraTemplateMedianocheRiviera").then((m) => m.RivieraTemplateMedianocheRiviera), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  PiedraGris: dynamic(() => import("@/components/templates/RivieraTemplatePiedraGris").then((m) => m.RivieraTemplatePiedraGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  LavandaCostera: dynamic(() => import("@/components/templates/RivieraTemplateLavandaCostera").then((m) => m.RivieraTemplateLavandaCostera), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  OcasoAzulejo: dynamic(() => import("@/components/templates/RivieraTemplateOcasoAzulejo").then((m) => m.RivieraTemplateOcasoAzulejo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const GOLDENDUSK_COMPONENTS: Record<string, PreviewComponent> = {
  Ocaso: dynamic(() => import("@/components/templates/GoldenDuskTemplateOcaso").then((m) => m.GoldenDuskTemplateOcaso), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/GoldenDuskTemplate").then((m) => m.GoldenDuskTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulMedianoche: dynamic(() => import("@/components/templates/GoldenDuskTemplateAzulMedianoche").then((m) => m.GoldenDuskTemplateAzulMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/GoldenDuskTemplateBorgona").then((m) => m.GoldenDuskTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  ChampagneDorado: dynamic(() => import("@/components/templates/GoldenDuskTemplateChampagneDorado").then((m) => m.GoldenDuskTemplateChampagneDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaAntiguo: dynamic(() => import("@/components/templates/GoldenDuskTemplateRosaAntiguo").then((m) => m.GoldenDuskTemplateRosaAntiguo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Salvia: dynamic(() => import("@/components/templates/GoldenDuskTemplateSalvia").then((m) => m.GoldenDuskTemplateSalvia), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NocheDorada: dynamic(() => import("@/components/templates/GoldenDuskTemplateNocheDorada").then((m) => m.GoldenDuskTemplateNocheDorada), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  PiedraCalida: dynamic(() => import("@/components/templates/GoldenDuskTemplatePiedraCalida").then((m) => m.GoldenDuskTemplatePiedraCalida), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BrumaAzul: dynamic(() => import("@/components/templates/GoldenDuskTemplateBrumaAzul").then((m) => m.GoldenDuskTemplateBrumaAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NocheCiruela: dynamic(() => import("@/components/templates/GoldenDuskTemplateNocheCiruela").then((m) => m.GoldenDuskTemplateNocheCiruela), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const SEDA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/SedaTemplate").then((m) => m.SedaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/SedaTemplateEsmeralda").then((m) => m.SedaTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marfil: dynamic(() => import("@/components/templates/SedaTemplateMarfil").then((m) => m.SedaTemplateMarfil), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Nocturna: dynamic(() => import("@/components/templates/SedaTemplateNocturna").then((m) => m.SedaTemplateNocturna), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Perla: dynamic(() => import("@/components/templates/SedaTemplatePerla").then((m) => m.SedaTemplatePerla), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  OnixSeda: dynamic(() => import("@/components/templates/SedaTemplateOnixSeda").then((m) => m.SedaTemplateOnixSeda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Piedra: dynamic(() => import("@/components/templates/SedaTemplatePiedra").then((m) => m.SedaTemplatePiedra), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ciruela: dynamic(() => import("@/components/templates/SedaTemplateCiruela").then((m) => m.SedaTemplateCiruela), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
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
  Ivoire: dynamic(() => import("@/components/templates/BonVoyageTemplateIvoire").then((m) => m.BonVoyageTemplateIvoire), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  default: dynamic(() => import("@/components/templates/BonVoyageTemplate").then((m) => m.BonVoyageTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/BonVoyageTemplateCoral").then((m) => m.BonVoyageTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/BonVoyageTemplateEsmeralda").then((m) => m.BonVoyageTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lavanda: dynamic(() => import("@/components/templates/BonVoyageTemplateLavanda").then((m) => m.BonVoyageTemplateLavanda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Medianoche: dynamic(() => import("@/components/templates/BonVoyageTemplateMedianoche").then((m) => m.BonVoyageTemplateMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Turquesa: dynamic(() => import("@/components/templates/BonVoyageTemplateTurquesa").then((m) => m.BonVoyageTemplateTurquesa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NocheDeViaje: dynamic(() => import("@/components/templates/BonVoyageTemplateNocheDeViaje").then((m) => m.BonVoyageTemplateNocheDeViaje), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  ArenaCalida: dynamic(() => import("@/components/templates/BonVoyageTemplateArenaCalida").then((m) => m.BonVoyageTemplateArenaCalida), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  MapaVintage: dynamic(() => import("@/components/templates/BonVoyageTemplateMapaVintage").then((m) => m.BonVoyageTemplateMapaVintage), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  CoralTropical: dynamic(() => import("@/components/templates/BonVoyageTemplateCoralTropical").then((m) => m.BonVoyageTemplateCoralTropical), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
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

export const GUESTPASSVIP_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/GuestPassVipTemplate").then((m) => m.GuestPassVipTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/GuestPassVipTemplateBorgona").then((m) => m.GuestPassVipTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/GuestPassVipTemplateEsmeralda").then((m) => m.GuestPassVipTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Plata: dynamic(() => import("@/components/templates/GuestPassVipTemplatePlata").then((m) => m.GuestPassVipTemplatePlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Zafiro: dynamic(() => import("@/components/templates/GuestPassVipTemplateZafiro").then((m) => m.GuestPassVipTemplateZafiro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const BABYSHOWER_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/BabyShowerTemplate").then((m) => m.BabyShowerTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Menta: dynamic(() => import("@/components/templates/BabyShowerTemplateMenta").then((m) => m.BabyShowerTemplateMenta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Durazno: dynamic(() => import("@/components/templates/BabyShowerTemplateDurazno").then((m) => m.BabyShowerTemplateDurazno), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Celeste: dynamic(() => import("@/components/templates/BabyShowerTemplateCeleste").then((m) => m.BabyShowerTemplateCeleste), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/BabyShowerTemplateDorado").then((m) => m.BabyShowerTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const BAUTISMO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/BautismoTemplate").then((m) => m.BautismoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Celeste: dynamic(() => import("@/components/templates/BautismoTemplateCeleste").then((m) => m.BautismoTemplateCeleste), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marfil: dynamic(() => import("@/components/templates/BautismoTemplateMarfil").then((m) => m.BautismoTemplateMarfil), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/BautismoTemplateRosa").then((m) => m.BautismoTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  VerdeSalvia: dynamic(() => import("@/components/templates/BautismoTemplateVerdeSalvia").then((m) => m.BautismoTemplateVerdeSalvia), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CORPORATIVOANIVERSARIO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CorporativoAniversarioTemplate").then((m) => m.CorporativoAniversarioTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/CorporativoAniversarioTemplateBorgona").then((m) => m.CorporativoAniversarioTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/CorporativoAniversarioTemplateEsmeralda").then((m) => m.CorporativoAniversarioTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Grafito: dynamic(() => import("@/components/templates/CorporativoAniversarioTemplateGrafito").then((m) => m.CorporativoAniversarioTemplateGrafito), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Plata: dynamic(() => import("@/components/templates/CorporativoAniversarioTemplatePlata").then((m) => m.CorporativoAniversarioTemplatePlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CORPORATIVOENCUENTRO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CorporativoEncuentroTemplate").then((m) => m.CorporativoEncuentroTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/CorporativoEncuentroTemplateAzul").then((m) => m.CorporativoEncuentroTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Gris: dynamic(() => import("@/components/templates/CorporativoEncuentroTemplateGris").then((m) => m.CorporativoEncuentroTemplateGris), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/CorporativoEncuentroTemplateVerde").then((m) => m.CorporativoEncuentroTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Vino: dynamic(() => import("@/components/templates/CorporativoEncuentroTemplateVino").then((m) => m.CorporativoEncuentroTemplateVino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CUMPLEANOSCOCKTAIL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CumpleanosCocktailTemplate").then((m) => m.CumpleanosCocktailTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/CumpleanosCocktailTemplateEsmeralda").then((m) => m.CumpleanosCocktailTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Plata: dynamic(() => import("@/components/templates/CumpleanosCocktailTemplatePlata").then((m) => m.CumpleanosCocktailTemplatePlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rubi: dynamic(() => import("@/components/templates/CumpleanosCocktailTemplateRubi").then((m) => m.CumpleanosCocktailTemplateRubi), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Zafiro: dynamic(() => import("@/components/templates/CumpleanosCocktailTemplateZafiro").then((m) => m.CumpleanosCocktailTemplateZafiro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CUMPLEANOSJARDIN_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CumpleanosJardinTemplate").then((m) => m.CumpleanosJardinTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azulado: dynamic(() => import("@/components/templates/CumpleanosJardinTemplateAzulado").then((m) => m.CumpleanosJardinTemplateAzulado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/CumpleanosJardinTemplateCoral").then((m) => m.CumpleanosJardinTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/CumpleanosJardinTemplateDorado").then((m) => m.CumpleanosJardinTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lavanda: dynamic(() => import("@/components/templates/CumpleanosJardinTemplateLavanda").then((m) => m.CumpleanosJardinTemplateLavanda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CUMPLEANOSTERRAZA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CumpleanosTerrazaTemplate").then((m) => m.CumpleanosTerrazaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/CumpleanosTerrazaTemplateAzul").then((m) => m.CumpleanosTerrazaTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/CumpleanosTerrazaTemplateEsmeralda").then((m) => m.CumpleanosTerrazaTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Malva: dynamic(() => import("@/components/templates/CumpleanosTerrazaTemplateMalva").then((m) => m.CumpleanosTerrazaTemplateMalva), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rojo: dynamic(() => import("@/components/templates/CumpleanosTerrazaTemplateRojo").then((m) => m.CumpleanosTerrazaTemplateRojo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const DESPEDIDASOLTERA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/DespedidaSolteraTemplate").then((m) => m.DespedidaSolteraTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/DespedidaSolteraTemplateCoral").then((m) => m.DespedidaSolteraTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/DespedidaSolteraTemplateDorado").then((m) => m.DespedidaSolteraTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Turquesa: dynamic(() => import("@/components/templates/DespedidaSolteraTemplateTurquesa").then((m) => m.DespedidaSolteraTemplateTurquesa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/DespedidaSolteraTemplateVioleta").then((m) => m.DespedidaSolteraTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const DESPEDIDASOLTERO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/DespedidaSolteroTemplate").then((m) => m.DespedidaSolteroTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/DespedidaSolteroTemplateDorado").then((m) => m.DespedidaSolteroTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/DespedidaSolteroTemplateEsmeralda").then((m) => m.DespedidaSolteroTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Grafito: dynamic(() => import("@/components/templates/DespedidaSolteroTemplateGrafito").then((m) => m.DespedidaSolteroTemplateGrafito), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Vino: dynamic(() => import("@/components/templates/DespedidaSolteroTemplateVino").then((m) => m.DespedidaSolteroTemplateVino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const GRADUACION_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/GraduacionTemplate").then((m) => m.GraduacionTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/GraduacionTemplateAzul").then((m) => m.GraduacionTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/GraduacionTemplateBorgona").then((m) => m.GraduacionTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Plata: dynamic(() => import("@/components/templates/GraduacionTemplatePlata").then((m) => m.GraduacionTemplatePlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/GraduacionTemplateVerde").then((m) => m.GraduacionTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const INAUGURACION_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/InauguracionTemplate").then((m) => m.InauguracionTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/InauguracionTemplateAzul").then((m) => m.InauguracionTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cobre: dynamic(() => import("@/components/templates/InauguracionTemplateCobre").then((m) => m.InauguracionTemplateCobre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/InauguracionTemplateEsmeralda").then((m) => m.InauguracionTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Grafito: dynamic(() => import("@/components/templates/InauguracionTemplateGrafito").then((m) => m.InauguracionTemplateGrafito), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const INFANTILESPACIO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/InfantilEspacioTemplate").then((m) => m.InfantilEspacioTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/InfantilEspacioTemplateDorado").then((m) => m.InfantilEspacioTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/InfantilEspacioTemplateRosa").then((m) => m.InfantilEspacioTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/InfantilEspacioTemplateVerde").then((m) => m.InfantilEspacioTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/InfantilEspacioTemplateVioleta").then((m) => m.InfantilEspacioTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const INFANTILJURASICO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/InfantilJurasicoTemplate").then((m) => m.InfantilJurasicoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amarillo: dynamic(() => import("@/components/templates/InfantilJurasicoTemplateAmarillo").then((m) => m.InfantilJurasicoTemplateAmarillo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Marron: dynamic(() => import("@/components/templates/InfantilJurasicoTemplateMarron").then((m) => m.InfantilJurasicoTemplateMarron), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Naranja: dynamic(() => import("@/components/templates/InfantilJurasicoTemplateNaranja").then((m) => m.InfantilJurasicoTemplateNaranja), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rojo: dynamic(() => import("@/components/templates/InfantilJurasicoTemplateRojo").then((m) => m.InfantilJurasicoTemplateRojo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const INFANTILSAFARI_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/InfantilSafariTemplate").then((m) => m.InfantilSafariTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amarillo: dynamic(() => import("@/components/templates/InfantilSafariTemplateAmarillo").then((m) => m.InfantilSafariTemplateAmarillo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Coral: dynamic(() => import("@/components/templates/InfantilSafariTemplateCoral").then((m) => m.InfantilSafariTemplateCoral), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Turquesa: dynamic(() => import("@/components/templates/InfantilSafariTemplateTurquesa").then((m) => m.InfantilSafariTemplateTurquesa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Verde: dynamic(() => import("@/components/templates/InfantilSafariTemplateVerde").then((m) => m.InfantilSafariTemplateVerde), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ANIVERSARIO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/AniversarioTemplate").then((m) => m.AniversarioTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Azul: dynamic(() => import("@/components/templates/AniversarioTemplateAzul").then((m) => m.AniversarioTemplateAzul), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/AniversarioTemplateBorgona").then((m) => m.AniversarioTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Dorado: dynamic(() => import("@/components/templates/AniversarioTemplateDorado").then((m) => m.AniversarioTemplateDorado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/AniversarioTemplateEsmeralda").then((m) => m.AniversarioTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};


export const BLACKANDWHITE_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/BlackAndWhiteTemplate").then((m) => m.BlackAndWhiteTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Negativo: dynamic(() => import("@/components/templates/BlackAndWhiteTemplateNegativo").then((m) => m.BlackAndWhiteTemplateNegativo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const PRINCESA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/PrincesaTemplate").then((m) => m.PrincesaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulMedianoche: dynamic(() => import("@/components/templates/PrincesaTemplateAzulMedianoche").then((m) => m.PrincesaTemplateAzulMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/PrincesaTemplateBorgona").then((m) => m.PrincesaTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BosqueEncantado: dynamic(() => import("@/components/templates/PrincesaTemplateBosqueEncantado").then((m) => m.PrincesaTemplateBosqueEncantado), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  RosaAntiguo: dynamic(() => import("@/components/templates/PrincesaTemplateRosaAntiguo").then((m) => m.PrincesaTemplateRosaAntiguo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CORONAESCARLATA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CoronaEscarlataTemplate").then((m) => m.CoronaEscarlataTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/CoronaEscarlataTemplateEsmeralda").then((m) => m.CoronaEscarlataTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Imperial: dynamic(() => import("@/components/templates/CoronaEscarlataTemplateImperial").then((m) => m.CoronaEscarlataTemplateImperial), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Medianoche: dynamic(() => import("@/components/templates/CoronaEscarlataTemplateMedianoche").then((m) => m.CoronaEscarlataTemplateMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Zafiro: dynamic(() => import("@/components/templates/CoronaEscarlataTemplateZafiro").then((m) => m.CoronaEscarlataTemplateZafiro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const JEWELRYBOX_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/JewelryBoxTemplate").then((m) => m.JewelryBoxTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/JewelryBoxTemplateEsmeralda").then((m) => m.JewelryBoxTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Perla: dynamic(() => import("@/components/templates/JewelryBoxTemplatePerla").then((m) => m.JewelryBoxTemplatePerla), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rubi: dynamic(() => import("@/components/templates/JewelryBoxTemplateRubi").then((m) => m.JewelryBoxTemplateRubi), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Zafiro: dynamic(() => import("@/components/templates/JewelryBoxTemplateZafiro").then((m) => m.JewelryBoxTemplateZafiro), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const PASEVIP_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/PaseVipTemplate").then((m) => m.PaseVipTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cobre: dynamic(() => import("@/components/templates/PaseVipTemplateCobre").then((m) => m.PaseVipTemplateCobre), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Platino: dynamic(() => import("@/components/templates/PaseVipTemplatePlatino").then((m) => m.PaseVipTemplatePlatino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rubi: dynamic(() => import("@/components/templates/PaseVipTemplateRubi").then((m) => m.PaseVipTemplateRubi), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/PaseVipTemplateVioleta").then((m) => m.PaseVipTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CINEABSTRACTOXV_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CineAbstractoXvTemplate").then((m) => m.CineAbstractoXvTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Noir: dynamic(() => import("@/components/templates/CineAbstractoXvTemplateNoir").then((m) => m.CineAbstractoXvTemplateNoir), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  SciFi: dynamic(() => import("@/components/templates/CineAbstractoXvTemplateSciFi").then((m) => m.CineAbstractoXvTemplateSciFi), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Tecnicolor: dynamic(() => import("@/components/templates/CineAbstractoXvTemplateTecnicolor").then((m) => m.CineAbstractoXvTemplateTecnicolor), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Western: dynamic(() => import("@/components/templates/CineAbstractoXvTemplateWestern").then((m) => m.CineAbstractoXvTemplateWestern), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ACRYLICPOP_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/AcrylicPopTemplate").then((m) => m.AcrylicPopTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bubblegum: dynamic(() => import("@/components/templates/AcrylicPopTemplateBubblegum").then((m) => m.AcrylicPopTemplateBubblegum), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Scarlet: dynamic(() => import("@/components/templates/AcrylicPopTemplateScarlet").then((m) => m.AcrylicPopTemplateScarlet), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Sunset: dynamic(() => import("@/components/templates/AcrylicPopTemplateSunset").then((m) => m.AcrylicPopTemplateSunset), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  UltraViolet: dynamic(() => import("@/components/templates/AcrylicPopTemplateUltraViolet").then((m) => m.AcrylicPopTemplateUltraViolet), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const BOLADEDISCOTECA_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/BolaDeDiscotecaTemplate").then((m) => m.BolaDeDiscotecaTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/BolaDeDiscotecaTemplateEsmeralda").then((m) => m.BolaDeDiscotecaTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  FucsiaElectrico: dynamic(() => import("@/components/templates/BolaDeDiscotecaTemplateFucsiaElectrico").then((m) => m.BolaDeDiscotecaTemplateFucsiaElectrico), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Turquesa: dynamic(() => import("@/components/templates/BolaDeDiscotecaTemplateTurquesa").then((m) => m.BolaDeDiscotecaTemplateTurquesa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Violeta: dynamic(() => import("@/components/templates/BolaDeDiscotecaTemplateVioleta").then((m) => m.BolaDeDiscotecaTemplateVioleta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CRYSTAL3D_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/Crystal3dTemplate").then((m) => m.Crystal3dTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AmbarBronce: dynamic(() => import("@/components/templates/Crystal3dTemplateAmbarBronce").then((m) => m.Crystal3dTemplateAmbarBronce), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  CuarzoRosa: dynamic(() => import("@/components/templates/Crystal3dTemplateCuarzoRosa").then((m) => m.Crystal3dTemplateCuarzoRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  EsmeraldaPlata: dynamic(() => import("@/components/templates/Crystal3dTemplateEsmeraldaPlata").then((m) => m.Crystal3dTemplateEsmeraldaPlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  ZafiroBlanco: dynamic(() => import("@/components/templates/Crystal3dTemplateZafiroBlanco").then((m) => m.Crystal3dTemplateZafiroBlanco), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const FASHIONTAG_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/FashionTagTemplate").then((m) => m.FashionTagTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BottleGreen: dynamic(() => import("@/components/templates/FashionTagTemplateBottleGreen").then((m) => m.FashionTagTemplateBottleGreen), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Burgundy: dynamic(() => import("@/components/templates/FashionTagTemplateBurgundy").then((m) => m.FashionTagTemplateBurgundy), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  GoldenMustard: dynamic(() => import("@/components/templates/FashionTagTemplateGoldenMustard").then((m) => m.FashionTagTemplateGoldenMustard), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  MidnightNavy: dynamic(() => import("@/components/templates/FashionTagTemplateMidnightNavy").then((m) => m.FashionTagTemplateMidnightNavy), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CERAMICAEDITORIAL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CeramicaEditorialTemplate").then((m) => m.CeramicaEditorialTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Celadon: dynamic(() => import("@/components/templates/CeramicaEditorialTemplateCeladon").then((m) => m.CeramicaEditorialTemplateCeladon), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cobalto: dynamic(() => import("@/components/templates/CeramicaEditorialTemplateCobalto").then((m) => m.CeramicaEditorialTemplateCobalto), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  GrisPiedra: dynamic(() => import("@/components/templates/CeramicaEditorialTemplateGrisPiedra").then((m) => m.CeramicaEditorialTemplateGrisPiedra), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/CeramicaEditorialTemplateTerracota").then((m) => m.CeramicaEditorialTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const CINEABSTRACTO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/CineAbstractoTemplate").then((m) => m.CineAbstractoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BlancoNegroPlata: dynamic(() => import("@/components/templates/CineAbstractoTemplateBlancoNegroPlata").then((m) => m.CineAbstractoTemplateBlancoNegroPlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NoirEsmeralda: dynamic(() => import("@/components/templates/CineAbstractoTemplateNoirEsmeralda").then((m) => m.CineAbstractoTemplateNoirEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  SepiaClasico: dynamic(() => import("@/components/templates/CineAbstractoTemplateSepiaClasico").then((m) => m.CineAbstractoTemplateSepiaClasico), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  TecnicolorAzulNaranja: dynamic(() => import("@/components/templates/CineAbstractoTemplateTecnicolorAzulNaranja").then((m) => m.CineAbstractoTemplateTecnicolorAzulNaranja), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const PAPELERIADEHOTELDELUJO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/PapeleriaDeHotelDeLujoTemplate").then((m) => m.PapeleriaDeHotelDeLujoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulMarinoPlata: dynamic(() => import("@/components/templates/PapeleriaDeHotelDeLujoTemplateAzulMarinoPlata").then((m) => m.PapeleriaDeHotelDeLujoTemplateAzulMarinoPlata), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BorgonaOroRosa: dynamic(() => import("@/components/templates/PapeleriaDeHotelDeLujoTemplateBorgonaOroRosa").then((m) => m.PapeleriaDeHotelDeLujoTemplateBorgonaOroRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  GrisCarbonOroBlanco: dynamic(() => import("@/components/templates/PapeleriaDeHotelDeLujoTemplateGrisCarbonOroBlanco").then((m) => m.PapeleriaDeHotelDeLujoTemplateGrisCarbonOroBlanco), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  NegroYBronce: dynamic(() => import("@/components/templates/PapeleriaDeHotelDeLujoTemplateNegroYBronce").then((m) => m.PapeleriaDeHotelDeLujoTemplateNegroYBronce), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const VINTAGEEDITORIAL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/VintageEditorialTemplate").then((m) => m.VintageEditorialTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulPetroleo: dynamic(() => import("@/components/templates/VintageEditorialTemplateAzulPetroleo").then((m) => m.VintageEditorialTemplateAzulPetroleo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BorgonaVino: dynamic(() => import("@/components/templates/VintageEditorialTemplateBorgonaVino").then((m) => m.VintageEditorialTemplateBorgonaVino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  OlivaVintage: dynamic(() => import("@/components/templates/VintageEditorialTemplateOlivaVintage").then((m) => m.VintageEditorialTemplateOlivaVintage), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  PlataAntigua: dynamic(() => import("@/components/templates/VintageEditorialTemplatePlataAntigua").then((m) => m.VintageEditorialTemplatePlataAntigua), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const FASHIONLOOKBOOK_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/FashionLookbookTemplate").then((m) => m.FashionLookbookTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cobalto: dynamic(() => import("@/components/templates/FashionLookbookTemplateCobalto").then((m) => m.FashionLookbookTemplateCobalto), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Magenta: dynamic(() => import("@/components/templates/FashionLookbookTemplateMagenta").then((m) => m.FashionLookbookTemplateMagenta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Militar: dynamic(() => import("@/components/templates/FashionLookbookTemplateMilitar").then((m) => m.FashionLookbookTemplateMilitar), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Mostaza: dynamic(() => import("@/components/templates/FashionLookbookTemplateMostaza").then((m) => m.FashionLookbookTemplateMostaza), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const MARMOLYORO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/MarmolYOroTemplate").then((m) => m.MarmolYOroTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Bronce: dynamic(() => import("@/components/templates/MarmolYOroTemplateBronce").then((m) => m.MarmolYOroTemplateBronce), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/MarmolYOroTemplateEsmeralda").then((m) => m.MarmolYOroTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Onix: dynamic(() => import("@/components/templates/MarmolYOroTemplateOnix").then((m) => m.MarmolYOroTemplateOnix), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Rosa: dynamic(() => import("@/components/templates/MarmolYOroTemplateRosa").then((m) => m.MarmolYOroTemplateRosa), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ATELIERDEPAPEL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/AtelierDePapelTemplate").then((m) => m.AtelierDePapelTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulTinta: dynamic(() => import("@/components/templates/AtelierDePapelTemplateAzulTinta").then((m) => m.AtelierDePapelTemplateAzulTinta), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  BorgonaVino: dynamic(() => import("@/components/templates/AtelierDePapelTemplateBorgonaVino").then((m) => m.AtelierDePapelTemplateBorgonaVino), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  GrisGrafito: dynamic(() => import("@/components/templates/AtelierDePapelTemplateGrisGrafito").then((m) => m.AtelierDePapelTemplateGrisGrafito), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  VerdeSalvia: dynamic(() => import("@/components/templates/AtelierDePapelTemplateVerdeSalvia").then((m) => m.AtelierDePapelTemplateVerdeSalvia), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const BOTANICAEDITORIAL_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/BotanicaEditorialTemplate").then((m) => m.BotanicaEditorialTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/BotanicaEditorialTemplateBorgona").then((m) => m.BotanicaEditorialTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Indigo: dynamic(() => import("@/components/templates/BotanicaEditorialTemplateIndigo").then((m) => m.BotanicaEditorialTemplateIndigo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Lavanda: dynamic(() => import("@/components/templates/BotanicaEditorialTemplateLavanda").then((m) => m.BotanicaEditorialTemplateLavanda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Terracota: dynamic(() => import("@/components/templates/BotanicaEditorialTemplateTerracota").then((m) => m.BotanicaEditorialTemplateTerracota), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const ENCAJECONTEMPORANEO_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/EncajeContemporaneoTemplate").then((m) => m.EncajeContemporaneoTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  AzulMedianoche: dynamic(() => import("@/components/templates/EncajeContemporaneoTemplateAzulMedianoche").then((m) => m.EncajeContemporaneoTemplateAzulMedianoche), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Borgona: dynamic(() => import("@/components/templates/EncajeContemporaneoTemplateBorgona").then((m) => m.EncajeContemporaneoTemplateBorgona), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  GrisPiedra: dynamic(() => import("@/components/templates/EncajeContemporaneoTemplateGrisPiedra").then((m) => m.EncajeContemporaneoTemplateGrisPiedra), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  VerdeBosque: dynamic(() => import("@/components/templates/EncajeContemporaneoTemplateVerdeBosque").then((m) => m.EncajeContemporaneoTemplateVerdeBosque), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
};

export const LIQUIDGLASS_COMPONENTS: Record<string, PreviewComponent> = {
  default: dynamic(() => import("@/components/templates/LiquidGlassTemplate").then((m) => m.LiquidGlassTemplate), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Amatista: dynamic(() => import("@/components/templates/LiquidGlassTemplateAmatista").then((m) => m.LiquidGlassTemplateAmatista), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Ambar: dynamic(() => import("@/components/templates/LiquidGlassTemplateAmbar").then((m) => m.LiquidGlassTemplateAmbar), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Cuarzo: dynamic(() => import("@/components/templates/LiquidGlassTemplateCuarzo").then((m) => m.LiquidGlassTemplateCuarzo), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
  Esmeralda: dynamic(() => import("@/components/templates/LiquidGlassTemplateEsmeralda").then((m) => m.LiquidGlassTemplateEsmeralda), { ssr: false, loading: PreviewLoading }) as PreviewComponent,
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
