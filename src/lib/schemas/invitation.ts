import { z } from "zod";

export const eventTypeSchema = z.object({
    type: z.string().min(1, "Debes seleccionar un tipo de evento"),
});

export const basicInfoSchema = z.object({
    nombreEvento: z.string().min(3, "El nombre del evento debe tener al menos 3 caracteres"),
    fecha: z.date(),
    nombreNovio: z.string().optional(),
    nombreNovia: z.string().optional(),
    nombreQuinceanera: z.string().optional(),
    rsvpDaysBeforeEvent: z.number().min(1).max(90).default(7),
});

export const detailsSchema = z.object({
    lugarNombre: z.string().min(3, "El nombre del lugar es requerido"),
    direccion: z.string().min(5, "La dirección es requerida"),
    hora: z.string().min(1, "La hora es requerida"),
    mapUrl: z.string().optional(),
});

export const coverPageSchema = z.object({
    portadaHabilitada: z.boolean().default(true),
    portadaTitulo: z.string().optional(),
    portadaTextoBoton: z.string().optional(),
    portadaImagenFondo: z.string().optional(),
});

export const gallerySchema = z.object({
    galeriaPrincipalHabilitada: z.boolean().default(true),
    galeriaPrincipalFotos: z.array(z.string()).default([]),
    galeriaSecundariaHabilitada: z.boolean().default(false),
    galeriaSecundariaFotos: z.array(z.string()).default([]),
});

export const musicSchema = z.object({
    musicaHabilitada: z.boolean().default(false),
    musicaUrl: z.string().optional(),
    musicaAutoplay: z.boolean().default(false),
    musicaLoop: z.boolean().default(true),
});

export const designSchema = z.object({
    colorPrincipal: z.string(),
    tema: z.string().optional(),
});

export const triviaSchema = z.object({
    triviaHabilitada: z.boolean().default(false),
    triviaIcono: z.string().optional(),
    triviaTitulo: z.string().optional(),
    triviaSubtitulo: z.string().optional(),
    triviaPreguntas: z.string().optional(), // JSON string
});

export const invitationSchema = z.object({
    ...eventTypeSchema.shape,
    ...basicInfoSchema.shape,
    ...detailsSchema.shape,
    ...coverPageSchema.shape,
    ...gallerySchema.shape,
    ...musicSchema.shape,
    ...designSchema.shape,
    ...triviaSchema.shape,
    // Nuevas secciones
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
});

export type InvitationFormData = z.infer<typeof invitationSchema>;

