import type { Idioma } from "./idiomas";

/**
 * Los textos de la aplicación, en un solo lugar por idioma.
 *
 * Cómo está organizado y por qué:
 *
 * - Las claves son en español y descriptivas del LUGAR, no del texto
 *   ("panel.invitados.sinAbrir"), porque el texto cambia y la clave no. Una
 *   clave que sea el texto mismo ("Sin abrir") obliga a tocar todos los
 *   archivos cuando alguien decide que ahora diga "Todavía no la abrió".
 *
 * - El español es la fuente de verdad y define la forma. Los otros idiomas
 *   completan las mismas claves, y TypeScript obliga a que estén todas: una
 *   traducción a medias es un texto en español apareciendo en medio de una
 *   pantalla en inglés, que se ve peor que no traducir.
 *
 * - Los textos con partes variables usan {llaves} y no concatenación, porque
 *   el orden de las palabras cambia entre idiomas. "Faltan 3 invitados" y
 *   "3 guests remaining" no ponen el número en el mismo lugar.
 *
 * ATENCIÓN: esto es sólo el cimiento, con los textos más visibles. La
 * extracción del resto se hace después, cuando las funciones nuevas estén
 * cerradas -- si se hace antes, cada función que se agregue llega en español
 * y hay que traducirla aparte.
 */

const es = {
  comun: {
    guardar: "Guardar",
    cancelar: "Cancelar",
    volver: "Volver",
    siguiente: "Siguiente",
    cerrar: "Cerrar",
    borrar: "Borrar",
    editar: "Editar",
    cargando: "Cargando…",
    buscar: "Buscar…",
    si: "Sí",
    no: "No",
  },

  landing: {
    empezarGratis: "Empezar gratis",
    verInvitacionReal: "Ver una invitación real",
    yaTengoCuenta: "Ya tengo cuenta",
    gratisParaEmpezar: "Gratis para empezar · Sin tarjeta · Pagás una vez, sin suscripción",
    planesDesde: "Planes desde {precio}",
    cuotasSinInteres: "Hasta {cuotas} cuotas sin interés",
    verModelos: "Ver modelos",
    comoFunciona: "Cómo funciona",
    precios: "Precios",
    contacto: "Contacto",
    crearInvitacion: "Crear invitación",
  },

  panel: {
    invitados: {
      titulo: "Invitados",
      individual: "Individual",
      grupal: "Grupal",
      abrio: "Abrió la invitación",
      sinAbrir: "Sin abrir",
      llego: "Llegó {fecha}",
      rechazadoEnLaPuerta: "Rechazado en la puerta",
      exento: "Exento",
      pegarLista: "Pegar una lista",
      agregarInvitado: "Agrega un invitado",
    },
    mesas: {
      titulo: "Mesas e ingresos",
      agregarMesa: "Agregar mesa",
      escanearIngreso: "Escanear ingreso",
      sinUbicar: "Sin ubicar",
      todosUbicados: "Están todos ubicados.",
      lugares: "Lugares",
      forma: "Forma",
      redonda: "Redonda",
      rectangular: "Rectangular",
      enEstaMesa: "En esta mesa",
      espacio: "Espacio",
      ubicados: "{hechos} de {total} ubicados",
    },
  },

  invitacion: {
    abrirInvitacion: "Abrir invitación",
    confirmarAsistencia: "Confirmar asistencia",
    guardaLaFecha: "Guardá la fecha",
    comoLlegar: "Cómo llegar",
    tuIngreso: "Tu ingreso",
    tuMesa: "Tu mesa",
    tusMesas: "Tus mesas",
    paseEspecial: "Pase especial",
    lugar: "Lugar",
    lugares: "Lugares",
    mostraloAlLlegar: "Mostralo al llegar y te indicamos tu mesa.",
  },
} as const;

/**
 * La forma del diccionario, tomada del español: las mismas claves, pero
 * cualquier texto.
 *
 * El `as const` de arriba hace falta para que las claves queden fijas y el
 * autocompletado funcione, pero también congela los VALORES en el texto
 * español exacto. Sin este ensanchado, "Save" no sería asignable a una clave
 * cuyo tipo es literalmente "Guardar", y ningún idioma podría existir.
 */
type ConCualquierTexto<T> = {
  [K in keyof T]: T[K] extends string ? string : ConCualquierTexto<T[K]>;
};

export type Diccionario = ConCualquierTexto<typeof es>;

const en: Diccionario = {
  comun: {
    guardar: "Save",
    cancelar: "Cancel",
    volver: "Back",
    siguiente: "Next",
    cerrar: "Close",
    borrar: "Delete",
    editar: "Edit",
    cargando: "Loading…",
    buscar: "Search…",
    si: "Yes",
    no: "No",
  },

  landing: {
    empezarGratis: "Start for free",
    verInvitacionReal: "See a real invitation",
    yaTengoCuenta: "I already have an account",
    gratisParaEmpezar: "Free to start · No card · Pay once, no subscription",
    planesDesde: "Plans from {precio}",
    cuotasSinInteres: "Up to {cuotas} interest-free instalments",
    verModelos: "Browse designs",
    comoFunciona: "How it works",
    precios: "Pricing",
    contacto: "Contact",
    crearInvitacion: "Create invitation",
  },

  panel: {
    invitados: {
      titulo: "Guests",
      individual: "Individual",
      grupal: "Group",
      abrio: "Opened the invitation",
      sinAbrir: "Not opened",
      llego: "Arrived {fecha}",
      rechazadoEnLaPuerta: "Turned away at the door",
      exento: "Exempt",
      pegarLista: "Paste a list",
      agregarInvitado: "Add a guest",
    },
    mesas: {
      titulo: "Tables and check-in",
      agregarMesa: "Add table",
      escanearIngreso: "Scan check-in",
      sinUbicar: "Not seated",
      todosUbicados: "Everyone has a table.",
      lugares: "Seats",
      forma: "Shape",
      redonda: "Round",
      rectangular: "Rectangular",
      enEstaMesa: "At this table",
      espacio: "Spacing",
      ubicados: "{hechos} of {total} seated",
    },
  },

  invitacion: {
    abrirInvitacion: "Open invitation",
    confirmarAsistencia: "RSVP",
    guardaLaFecha: "Save the date",
    comoLlegar: "Get directions",
    tuIngreso: "Your check-in",
    tuMesa: "Your table",
    tusMesas: "Your tables",
    paseEspecial: "Special pass",
    lugar: "Seat",
    lugares: "Seats",
    mostraloAlLlegar: "Show this when you arrive and we'll point you to your table.",
  },
};

const pt: Diccionario = {
  comun: {
    guardar: "Salvar",
    cancelar: "Cancelar",
    volver: "Voltar",
    siguiente: "Próximo",
    cerrar: "Fechar",
    borrar: "Excluir",
    editar: "Editar",
    cargando: "Carregando…",
    buscar: "Buscar…",
    si: "Sim",
    no: "Não",
  },

  landing: {
    empezarGratis: "Começar grátis",
    verInvitacionReal: "Ver um convite real",
    yaTengoCuenta: "Já tenho conta",
    gratisParaEmpezar: "Grátis para começar · Sem cartão · Pague uma vez, sem assinatura",
    planesDesde: "Planos a partir de {precio}",
    cuotasSinInteres: "Até {cuotas} parcelas sem juros",
    verModelos: "Ver modelos",
    comoFunciona: "Como funciona",
    precios: "Preços",
    contacto: "Contato",
    crearInvitacion: "Criar convite",
  },

  panel: {
    invitados: {
      titulo: "Convidados",
      individual: "Individual",
      grupal: "Grupo",
      abrio: "Abriu o convite",
      sinAbrir: "Não abriu",
      llego: "Chegou {fecha}",
      rechazadoEnLaPuerta: "Barrado na entrada",
      exento: "Isento",
      pegarLista: "Colar uma lista",
      agregarInvitado: "Adicionar convidado",
    },
    mesas: {
      titulo: "Mesas e entrada",
      agregarMesa: "Adicionar mesa",
      escanearIngreso: "Escanear entrada",
      sinUbicar: "Sem mesa",
      todosUbicados: "Todos têm mesa.",
      lugares: "Lugares",
      forma: "Formato",
      redonda: "Redonda",
      rectangular: "Retangular",
      enEstaMesa: "Nesta mesa",
      espacio: "Espaço",
      ubicados: "{hechos} de {total} acomodados",
    },
  },

  invitacion: {
    abrirInvitacion: "Abrir convite",
    confirmarAsistencia: "Confirmar presença",
    guardaLaFecha: "Salve a data",
    comoLlegar: "Como chegar",
    tuIngreso: "Sua entrada",
    tuMesa: "Sua mesa",
    tusMesas: "Suas mesas",
    paseEspecial: "Passe especial",
    lugar: "Lugar",
    lugares: "Lugares",
    mostraloAlLlegar: "Mostre isto ao chegar e indicamos sua mesa.",
  },
};

export const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en, pt };
