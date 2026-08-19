// Frases naturales para referirse al evento según su tipo -- evita que
// mensajes armados como "Estás invitado a {título}" queden con texto raro
// cuando el título es una frase (ej. "¡Nos casamos!") en vez de un sustantivo.
export function getInvitePhrase(tipo: string | null | undefined): string {
  switch (tipo) {
    case "CASAMIENTO":
      return "nuestro casamiento";
    case "QUINCE_ANOS":
      return "mis 15";
    case "CUMPLEANOS":
    case "OTRO":
      return "este evento";
    case "ANIVERSARIO":
      return "nuestro aniversario";
    default:
      return "este evento";
  }
}

// Nombre de los protagonistas del evento (novios / quinceañera), cuando
// aplica -- útil como subtítulo en pantallas donde ya se muestra el título
// del evento (ej. la pantalla del LIVE).
export function getHonoreeNames(invitation: {
  tipo?: string | null;
  nombreNovia?: string | null;
  nombreNovio?: string | null;
  nombreQuinceanera?: string | null;
}): string | null {
  if (invitation.tipo === "CASAMIENTO" && invitation.nombreNovia && invitation.nombreNovio) {
    return `${invitation.nombreNovia} & ${invitation.nombreNovio}`;
  }
  if (invitation.tipo === "QUINCE_ANOS" && invitation.nombreQuinceanera) {
    return invitation.nombreQuinceanera;
  }
  return null;
}

// Nombre que se muestra en el saludo de la portada de bienvenida (link
// personalizado de cada invitado). Por defecto prioriza el nombre del
// invitado/familia sobre el de los novios/quinceañera/evento -- pero es
// configuración genérica del dueño de la tarjeta (Invitation.mostrarNombreInvitadoEnSaludo,
// switch en el panel de Administrar > Gestionar invitados), no por invitado
// individual: si está en false, siempre muestra el nombre del evento aunque
// el link sea personalizado.
export function resolveGuestNameDisplay(
  invitation: Record<string, unknown>,
  guest?: { name?: string | null } | null
): string {
  const tipo = String(invitation.tipo ?? "OTRO");
  const showGuestName = Boolean(guest?.name) && invitation.mostrarNombreInvitadoEnSaludo !== false;
  if (showGuestName) return String(guest!.name);
  if (tipo === "CASAMIENTO" && invitation.nombreNovia && invitation.nombreNovio) {
    return `${invitation.nombreNovia} & ${invitation.nombreNovio}`;
  }
  return String(invitation.nombreQuinceanera || invitation.nombreEvento || "Invitado Especial");
}
