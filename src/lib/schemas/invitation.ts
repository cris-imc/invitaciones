import { z } from "zod";

export const eventTypeSchema = z.object({
    type: z.string().min(1, "Debes seleccionar un tipo de evento"),
    nombreEvento: z.string().min(1, "El título de la invitación es obligatorio"),
    nombreNovio: z.string().optional(),
    nombreNovia: z.string().optional(),
    nombreQuinceanera: z.string().optional(),
});

export const basicInfoSchema = z.object({
    fecha: z.date(),
    ciudad: z.string().optional(),
    rsvpDaysBeforeEvent: z.number().min(1).max(90).optional(),
});

export const detailsSchema = z.object({
    lugarNombre: z.string().min(3, "El nombre del lugar es requerido"),
    direccion: z.string().min(5, "La dirección es requerida"),
    hora: z.string().min(1, "La hora es requerida"),
    mapUrl: z.string().optional(),
    portadaDressCode: z.string().optional(),
});

export const coverPageSchema = z.object({
    portadaHabilitada: z.boolean().default(true),
    portadaKicker: z.string().optional(),
    portadaTitulo: z.string().optional(),
    portadaDressCode: z.string().optional(),
    dresscodeHabilitado: z.boolean().default(true),
    portadaMensaje: z.string().optional(),
    portadaTextoBoton: z.string().optional(),
    portadaImagenFondo: z.string().optional(),
    portadaImagenFondoDesktop: z.string().optional(),
});

export const gallerySchema = z.object({
    galeriaPrincipalHabilitada: z.boolean().default(true),
    galeriaPrincipalFotos: z.array(z.string()).default([]),
    galeriaSecundariaHabilitada: z.boolean().default(false),
    galeriaSecundariaFotos: z.array(z.string()).default([]),
});

export const musicSchema = z.object({
    musicaHabilitada: z.boolean().default(false),
    sugerenciaMusicaHabilitada: z.boolean().default(true),
    musicaUrl: z.string().optional(),
    musicaAutoplay: z.boolean().default(false),
    musicaLoop: z.boolean().default(true),
});

export const designSchema = z.object({
    colorPrincipal: z.string(),
    tema: z.string().optional(),
    templateTipo: z.string().optional().default("ORIGINAL"),
    tipografiaDisplay: z.string().optional().default("fraunces"),
    fontTitle: z.string().optional().default("fraunces"),
    fontBody: z.string().optional().default("space-grotesk"),
    countdownStyle: z.string().optional().default("clasico"),
    albumStyle: z.string().optional().default("carrusel"),
    imagenCelebremosJuntos: z.string().optional(),
});

export const triviaSchema = z.object({
    triviaHabilitada: z.boolean().default(false),
    triviaIcono: z.string().optional(),
    triviaTitulo: z.string().optional(),
    triviaSubtitulo: z.string().optional(),
    triviaPreguntas: z.string().optional(), // JSON string
});

// Límites de caracteres del paso "Info Adicional" del wizard -- Datos
// Adicionales es el único campo de uso libre (no tiene una categoría
// predefinida como los otros 3), así que admite bastante más texto.
export const INFO_ADICIONAL_MAX_LENGTH = {
    alojamiento: 300,
    estacionamiento: 300,
    transporte: 300,
    adicional: 600,
} as const;

export const infoAdicionalSchema = z.object({
    infoAlojamientoHabilitado: z.boolean().default(false),
    infoAlojamientoTexto: z.string().max(INFO_ADICIONAL_MAX_LENGTH.alojamiento).optional(),
    infoEstacionamientoHabilitado: z.boolean().default(false),
    infoEstacionamientoTexto: z.string().max(INFO_ADICIONAL_MAX_LENGTH.estacionamiento).optional(),
    infoTransporteHabilitado: z.boolean().default(false),
    infoTransporteTexto: z.string().max(INFO_ADICIONAL_MAX_LENGTH.transporte).optional(),
    infoAdicionalHabilitado: z.boolean().default(false),
    infoAdicionalTexto: z.string().max(INFO_ADICIONAL_MAX_LENGTH.adicional).optional(),
});

export const ceremoniaSchema = z.object({
    ceremoniaHabilitada: z.boolean().default(false),
    ceremoniaTitulo: z.string().optional(),
    ceremoniaNombre: z.string().optional(),
    ceremoniaDireccion: z.string().optional(),
    ceremoniaHora: z.string().optional(),
    ceremoniaMapUrl: z.string().optional(),
});

export const invitationSchema = z.object({
    ...eventTypeSchema.shape,
    ...basicInfoSchema.shape,
    ...detailsSchema.shape,
    ...ceremoniaSchema.shape,
    ...coverPageSchema.shape,
    ...gallerySchema.shape,
    ...musicSchema.shape,
    ...designSchema.shape,
    ...triviaSchema.shape,
    ...infoAdicionalSchema.shape,
    // Nuevas secciones
    sugerenciaMusicaHabilitada: z.boolean().default(true),
    frasePersonalizadaHabilitada: z.boolean().default(false),
    frasePersonalizadaTexto: z.string().optional(),
    frasePersonalizadaEstilo: z.string().optional(),

    regaloHabilitado: z.boolean().default(false),
    regaloTitulo: z.string().optional(),
    regaloMensaje: z.string().optional(),
    regaloMostrarDatos: z.boolean().default(false),
    regaloCbu: z.string().optional(),
    regaloAlias: z.string().optional(),
    regaloBanco: z.string().optional(),
    regaloTitular: z.string().optional(),
    regaloMonto: z.number().optional(),
    precioNino: z.number().optional(),
    precioAdolescente: z.number().optional(),
    precioNinoHabilitado: z.boolean().default(true),
    precioAdolescenteHabilitado: z.boolean().default(false),

    pagoTarjetaHabilitado: z.boolean().default(false),
    pagoTarjetaTitulo: z.string().optional(),
    pagoTarjetaMensaje: z.string().optional(),
    pagoTarjetaMostrarDatos: z.boolean().default(false),
    pagoTarjetaCbu: z.string().optional(),
    pagoTarjetaAlias: z.string().optional(),
    pagoTarjetaBanco: z.string().optional(),
    pagoTarjetaTitular: z.string().optional(),
    pagoTarjetaMonto: z.number().optional(),

    cronogramaEventos: z.string().optional(), // JSON string

    // Propiedades opcionales de plantillas
    tituloPortada: z.string().optional(),
    subtituloPortada: z.string().optional(),
    albumCompartidoHabilitado: z.boolean().default(false),
    mensajeFinalHabilitado: z.boolean().default(false),
    mensajeFinalTexto: z.string().optional(),

    // IDs y metadata
    id: z.string().optional(),
    slug: z.string().optional(),
    planTier: z.string().optional(),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;

