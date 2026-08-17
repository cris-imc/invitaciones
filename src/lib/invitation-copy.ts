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
