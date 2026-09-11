/**
 * Qué le falta a una invitación para estar lista.
 *
 * Existe porque quien crea una invitación y ve una pantalla llena de opciones
 * no sabe cuál es el próximo paso, y la abandona. Esto le dice qué hacer
 * ahora, en el orden en que conviene hacerlo.
 *
 * Sólo se listan cosas que de verdad importan si faltan. Si el checklist tiene
 * quince ítems y trece son opcionales, deja de ser una guía y pasa a ser una
 * lista de reproches.
 */

export interface PasoPendiente {
  id: string;
  titulo: string;
  /** Por qué conviene hacerlo. Corto: es una ayuda, no un manual. */
  ayuda: string;
  hecho: boolean;
  /** A dónde lleva el botón. Relativo, se completa con el slug. */
  ir: string;
}

interface DatosInvitacion {
  slug: string;
  fechaEvento: Date | string | null;
  direccion: string | null;
  mapUrl: string | null;
  portadaImagenFondo: string | null;
  cantidadInvitados: number;
  estado: string;
}

export function pasosDe(inv: DatosInvitacion): PasoPendiente[] {
  const base = `/dashboard/invitaciones/${inv.slug}`;

  return [
    {
      id: "portada",
      titulo: "Sube la foto de portada",
      ayuda: "Es lo primero que ve cada invitado al abrir el link.",
      hecho: Boolean(inv.portadaImagenFondo),
      ir: `/dashboard/invitaciones/editar/${inv.slug}`,
    },
    {
      id: "lugar",
      titulo: "Carga dónde es",
      ayuda: "Sin dirección ni mapa, tus invitados te van a escribir uno por uno para preguntarte.",
      hecho: Boolean(inv.direccion || inv.mapUrl),
      ir: `/dashboard/invitaciones/editar/${inv.slug}`,
    },
    {
      id: "invitados",
      titulo: "Agrega tus invitados",
      ayuda: "Cada uno recibe su propio link, y por eso puedes saber quién confirmó y quién no.",
      hecho: inv.cantidadInvitados > 0,
      ir: `${base}/guests`,
    },
    {
      id: "compartir",
      titulo: "Comparte los links",
      ayuda: "Se mandan por WhatsApp desde la lista de invitados, uno por uno.",
      // No hay forma de saber si los mandó: se marca cuando ya hay invitados
      // cargados y la invitación está activa, que es cuando ya puede hacerlo.
      hecho: inv.cantidadInvitados > 0 && inv.estado === "ACTIVA",
      ir: `${base}/guests`,
    },
  ];
}

export interface ResumenPasos {
  pasos: PasoPendiente[];
  hechos: number;
  total: number;
  /** El próximo que conviene hacer, o null si están todos. */
  siguiente: PasoPendiente | null;
  completo: boolean;
}

export function resumirPasos(inv: DatosInvitacion): ResumenPasos {
  const pasos = pasosDe(inv);
  const hechos = pasos.filter((p) => p.hecho).length;
  return {
    pasos,
    hechos,
    total: pasos.length,
    siguiente: pasos.find((p) => !p.hecho) ?? null,
    completo: hechos === pasos.length,
  };
}
