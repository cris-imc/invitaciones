import type { ConCualquierTexto } from "./forma";

/** El panel del anfitrión: invitados, mesas, ingresos, perfil. */
const es = {
  /**
   * El locale para toLocaleDateString / toLocaleTimeString.
   *
   * Va acá y no en un mapa aparte porque es un dato del idioma como cualquier
   * otro: una pantalla que ya tiene `t` puede formatear una fecha sin además
   * pedir el código de idioma.
   */
  localeFecha: "es-AR",

  sidebar: {
    inicio: "Inicio",
    inactivas: "Inactivas",
    misDatos: "Mis Datos",
    descuentos: "Descuentos",
    registros: "Registros",
    cerrarSesion: "Cerrar Sesión",
    // La botonera de mobile repite los mismos destinos con etiquetas cortas:
    // el aria-label lleva el nombre entero, el texto visible el abreviado.
    descuentosCorto: "Desc.",
    registrosCorto: "Reg.",
    misDatosCorto: "Datos",
    nuevaInvitacion: "Nueva invitación",
    nuevaCorto: "Nueva",
    nuevoUsuario: "Nuevo usuario",
    nuevoUsuarioCorto: "Alta",
    irAInicio: "Ir a Inicio",
    salirCorto: "Salir",
    salirSinTerminar: "¿Salir sin terminar?",
    cambiosSinGuardar: "Cambios sin guardar",
    salirNuevaDetalle:
      "Todavía no creaste la invitación. Si sales ahora vas a perder todo lo que cargaste hasta aquí.",
    salirEdicionDetalle:
      "Tienes cambios sin guardar en la invitación. ¿Seguro que quieres salir sin aplicar los cambios?",
    salirYPerder: "Salir y perder los cambios",
    salirSinGuardar: "Salir sin guardar",
  },

  creditos: {
    premiumUno: "{cantidad} crédito Premium disponible",
    premiumVarios: "{cantidad} créditos Premium disponibles",
    diamondUno: "{cantidad} crédito Diamond disponible",
    diamondVarios: "{cantidad} créditos Diamond disponibles",
    ilimitadas: "Invitaciones Premium: ilimitadas por tu plan.",
  },

  inicio: {
    anfitrion: "anfitrión",
    resumenAdmin: "Gestioná los clientes activos y sus invitaciones.",
    resumen: "Aquí tienes el resumen de tus eventos en tiempo real.",
    kpiActivas: "Invitaciones activas",
    kpiActivasDetalle: "{total} en total",
    kpiConfirmaron: "Confirmaron",
    kpiConfirmaronDetalle: "personas confirmadas",
    kpiPagaron: "Pagaron",
    kpiPagaronDetalle: "{pendientes} pendientes de pago",
    kpiCanciones: "Canciones pendientes",
    kpiCancionesDetalle: "requieren moderación",
    tusActivas: "Tus invitaciones activas",
    sinActivas: "Todavía no tienes invitaciones activas.",
    verInactivas: "Ver invitaciones inactivas ({cantidad}) →",
  },

  inactivas: {
    titulo: "Invitaciones Inactivas",
    detalle:
      "Invitaciones en borrador, finalizadas, o que ya vencieron (3 meses después del evento).",
    borrador: "Borrador",
    finalizada: "Finalizada",
    confirmadas: "{confirmadas} / {tope} confirmadas",
    planGratis: "Gratis",
    administrar: "Administrar →",
    vacio:
      "No tienes invitaciones inactivas. Las vas a encontrar aquí cuando queden en borrador, finalicen, o venzan 3 meses después del evento.",
  },

  evento: {
    migaInicio: "Inicio",
    migaAdministrar: "Administrar",
    gestionDelEvento: "Gestión del Evento",
    enVivo: "Datos en tiempo real",
    desconectado: "Desconectado",
  },

  invitados: {
    titulo: "Invitados",
    individual: "Individual",
    grupal: "Grupal",
    grupalCon: "Grupal ({cantidad})",
    familiaOGrupo: "Familia/Grupo",
    abrio: "Abrió la invitación",
    sinAbrir: "Sin abrir",
    llego: "Llegó {fecha}",
    rechazadoEnLaPuerta: "Rechazado en la puerta",
    exento: "Exento",
    pegarLista: "Pegar una lista",
    agregarInvitado: "Agrega un invitado",
    buscarInvitado: "Buscar invitado…",
    listaDeInvitados: "Lista de Invitados",
    gestionaTusInvitados: "Gestioná tus invitados y comparte sus enlaces.",
    borrarLaBusqueda: "Borrar la búsqueda",

    // Cuándo abrió la invitación, y con qué certeza lo sabemos.
    abrioPrimeraVez: "Abrió por primera vez el {fecha}",
    abrioVeces: "Abrió por primera vez el {fecha} · {veces} veces en total",
    contestoAsiQueAbrio: "Contestó el {fecha}, así que la abrió",
    sinRegistroDeApertura:
      "Sin registro: este invitado se cargó antes de que se empezara a medir la apertura. Puede haberla abierto sin que quedara constancia.",
    todaviaNoAbrio: "Todavía no abrió su invitación",

    restar: "Restar {que}",
    sumar: "Sumar {que}",
    adultos: "Adultos",
    adolescentes: "Adolescentes",
    ninos: "Niños",
    adulto: "Adulto",
    adolescente: "Adolescente",
    categoria: "Categoría",
    sinPrecio: "Sin precio",

    agregarTitulo: "Agregar Invitados",
    cupo: "{personas}/{tope} personas",
    enlaceUnico: "Generá un enlace único para cada invitado/a.",
    saludarPorNombre: "Saludar por nombre del invitado/familia",
    queHaceEsteInterruptor: "Qué hace este interruptor",
    queTipoDeInvitacion: "¿Qué tipo de invitación quieres crear?",
    disponibleEnPremium: "Disponible en Premium",
    cambiarTipo: "Cambiar tipo de invitación",
    nombreDelGrupo: "Nombre del Grupo/Familia",
    ejemploGrupo: "Ej: Pérez, o Amigos del Trabajo",
    seVaAMostrarComo: "Se va a mostrar como",
    nombre: "Nombre",
    ejemploNombre: "Ej: Juan",
    apellido: "Apellido",
    ejemploApellido: "Ej: García",
    exentoDePago: "Exento de pago",
    exentoDePagoDetalle: "El invitado no tiene que abonar tarjeta.",
    agregando: "Agregando…",
    agregarALaLista: "Agregar a la lista",

    cargandoInvitados: "Cargando invitados…",
    sinResultados: "No se encontraron invitados que coincidan con tu búsqueda.",
    sinInvitados: "Todavía no agregaste invitados.",

    enviarWhatsapp: "Enviar WhatsApp",
    copiarEnlace: "Copiar enlace personalizado",
    copiar: "Copiar",
    copiarLink: "Copiar Link",
    asiSeComparte: "¡Así se comparte!",
    asiSeComparteDetalle:
      "Copia este enlace único y enviáselo a tu invitado para que vea su invitación personalizada y confirme su asistencia.",

    pagina: "Página {actual} de {total}",

    confirmado: "Confirmado",
    noAsistira: "No asistirá",
    pendiente: "Pendiente",

    // El mensaje que se manda por WhatsApp. Va armado con {llaves} porque en
    // inglés y portugués el saludo y el evento no caen en el mismo orden.
    waSaludoGrupo: "familia {nombre}",
    waMensaje:
      "¡Hola {saludo}! 🎉 {estas} a {evento}. Entrá a tu invitación personal para ver todos los detalles y confirmar tu asistencia:\n{enlace}",
    waEstanInvitados: "Están invitados",
    waEstasInvitado: "Estás invitado/a",
    fraseCasamiento: "nuestro casamiento",
    fraseQuince: "mis 15",
    fraseAniversario: "nuestro aniversario",
    fraseEvento: "este evento",

    saludarTitulo: "Saludar por nombre",
    saludarQueCambia: "Cambia cómo arranca la invitación que abre cada invitado.",
    saludarActivado: "Activado:",
    saludarActivadoDetalle:
      "lo saluda por su nombre — “Hola, Familia Juárez”. Cada uno ve el suyo, porque el enlace es personal.",
    saludarDesactivado: "Desactivado:",
    saludarDesactivadoDetalle: "en lugar del nombre del invitado muestra {que}, igual para todos.",
    saludarNombreNovios: "el nombre de los novios",
    saludarNombreQuinceanera: "el nombre de la quinceañera",
    saludarNombreEvento: "el nombre del evento",
    saludarNota:
      "Vale para todos los invitados a la vez, y puedes cambiarlo cuando quieras: la próxima vez que alguien abra su enlace ya lo ve aplicado.",
    entendido: "Entendido",

    eliminarTitulo: "¿Eliminar invitado?",
    eliminarDetalle:
      "Estás a punto de eliminar a {nombre} de la lista de invitados. Esta acción no se puede deshacer y el enlace de la invitación deja de funcionar para esa persona.",
    eliminarInvitado: "Eliminar Invitado",

    editarTitulo: "Editar Invitado",
    yaConfirmoAviso:
      "Este invitado ya confirmó asistencia. Puedes aumentar la cantidad de invitados para que después pueda entrar a su link y sumar más gente. Si en cambio la reduces por debajo de lo que ya confirmó, su respuesta se reinicia y va a tener que volver a confirmar.",
    tipoDeInvitacion: "Tipo de Invitación",

    precioAdulto: "💰 Precio Adulto",
    precioAdolescente: "🎓 Precio Adolescente",
    precioNino: "👶 Precio Niño",
    sinPrecioDetalle:
      "No hay precio configurado para esta categoría. Ingresa el monto para habilitarla.",
    monto: "Monto ($)",
    ejemploMonto: "Ej: 5000",
    guardarYHabilitar: "Guardar y Habilitar",

    limiteTitulo: "Llegaste al límite de invitados del plan Gratis",
    limiteDetalle:
      "El plan Gratis admite hasta 20 personas: pásate a Premium o Diamond para seguir agregando invitados sin perder los que ya cargaste.",

    // Avisos
    montoInvalido: "Ingresa un monto válido",
    precioGuardado: "Precio guardado correctamente",
    errorPrecio: "Error al guardar el precio",
    preferenciaGuardada: "Preferencia guardada",
    errorPreferencia: "Error al guardar la preferencia",
    agregado: "Invitado agregado correctamente",
    errorAgregar: "Error al agregar invitado",
    errorConexion: "Error de conexión",
    actualizado: "Invitado actualizado correctamente",
    errorActualizar: "Error al actualizar invitado",
    eliminado: "Invitado eliminado",
    errorEliminar: "Error al eliminar",
    enlaceCopiado: "¡Enlace copiado! Compartilo con tu invitado.",
  },

  mesas: {
    limiteTitulo: "¿Sigues armando mesas? Pásate a Premium",
    limiteDetalle:
      "Con Premium armas todas las mesas que necesites, repartes a las familias que no entran en una sola y cada invitado ve la suya en su invitación.",
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
    mostrarNoConfirmados: "Mostrar también los que no confirmaron",

    mesaNumero: "Mesa {numero}",
    mesaNumeroCorto: "MESA {numero}",
    armandoSalon: "Armando el salón…",
    volverAlSalon: "Volver al salón",
    unaMesa: "{cantidad} mesa · {lugares} lugares",
    variasMesas: "{cantidad} mesas · {lugares} lugares",
    achicarSalon: "Achicar el salón",
    agrandarSalon: "Agrandar el salón",

    mostrarLaMesa: "Mostrarle la mesa a cada invitado",
    mostrarLaMesaDetalle:
      "Aparece en su pase, dentro de la invitación. Si una familia quedó repartida, ve las dos mesas, sin el detalle de quién va en cada una.",
    controlarIngreso: "Controlar el ingreso con QR",
    controlarIngresoDetalle:
      "Cada invitación termina con un QR. Lo escaneas en la puerta y ves quiénes son, cuántos vienen y a qué mesa mandarlos. Queda registrado quién llegó y a qué hora.",

    salonVacio:
      "Todavía no hay mesas. Agrega la primera y arrastrala para armar el salón como va a estar el día del evento.",
    ahoraTocaUnaMesa: "Ahora toca una mesa del salón.",
    comoUbicar:
      "Arrastrá un invitado o familia hasta la mesa, o tocalo y después toca la mesa.",
    nadieConfirmoTodavia:
      "Todavía no confirmó nadie. Si quieres ir adelantando, tildá la opción de arriba para ubicar también a los que no contestaron.",
    sinCoincidencias: "Nadie sin ubicar coincide con “{busqueda}”.",
    sinConfirmar: "sin confirmar",
    faltan: "faltan {cantidad}",
    anteriorCorto: "‹ Anterior",
    siguienteCorto: "Siguiente ›",
    deTotal: "{actual} de {total}",

    apodo: "Apodo para ti (ej: Primos)",
    quitarLugar: "Quitar un lugar",
    agregarLugar: "Agregar un lugar",
    excedida:
      "Hay {personas} personas para {lugares} lugares. Agrandá la mesa o pasá a alguien a otra.",
    nadieEnLaMesa: "Todavía no hay nadie.",
    invitado: "Invitado",
    yaNoConfirmado: "ya no está confirmado",
    unLugarMenos: "Un lugar menos en esta mesa",
    unLugarMas: "Un lugar más en esta mesa",
    sacarDeLaMesa: "Sacar de esta mesa",
    siBorrar: "Sí, borrar {mesa}",
    borrarMesa: "Borrar mesa",

    // Avisos
    errorCargar: "No se pudieron cargar las mesas",
    errorGuardar: "No se pudo guardar",
    mesasVisibles: "Listo: cada invitado va a ver su mesa en la portada de su invitación.",
    mesasOcultas: "Las mesas quedan sólo para ti. Los invitados no ven nada.",
    qrActivado: "Listo: cada invitación termina con un QR y puedes escanear en la puerta.",
    qrDesactivado: "Sin control en la puerta: el QR desaparece de las invitaciones.",
    mesaCompleta: "{mesa} ya está completa. Agrandala o elige otra.",
    entraronParte: "{nombre}: {ubicados} en {mesa}, quedan {faltan} por ubicar.",
  },

  escaner: {
    apuntaAlQr: "Apuntá al QR que cada invitado tiene al final de su invitación.",
    encenderCamara: "Encender la cámara",
    apagar: "Apagar",
    escanearOtro: "Escanear otro",
    noPudeLeer: "No pude leer ese código",
    sinPermiso: "El navegador no dio permiso para usar la cámara. Habilitalo y vuelve a intentar.",
    sinCamara: "No encontré ninguna cámara en este dispositivo.",
    noPudeAbrir: "No pude abrir la cámara.",
    rechazado: "RECHAZADO",
    contactarAnfitrion: "{motivo}. Contactar al anfitrión.",
    yaHabiaEntrado: "Ya había entrado {hora}",
    ingresoRegistrado: "Ingreso registrado",
    unaPersona: "{cantidad} persona",
    variasPersonas: "{cantidad} personas",
    sinConfirmar: " · sin confirmar",
    adultos: "{cantidad} adultos",
    adolescentes: "{cantidad} adolescentes",
    ninos: "{cantidad} niños",
    sinMesa: "Sin mesa asignada",
    unLugar: "{cantidad} lugar",
    variosLugares: "{cantidad} lugares",
  },

  compartir: {
    tipeando: "Previsualizá tu diseño o editá los detalles…",
    verEjemplo: "Ver ejemplo",
    editarInvitacion: "Editar invitación",
    cambiarPlantilla: "Cambiar Plantilla",
    esGratis: "Esta invitación está en plan Gratis",
    esGratisDetalle:
      "Convertila a Premium o Diamond para sumar música, trivia, gestión de pagos y el Modo LIVE.",
    habilitar: "Habilitar Premium/Diamond",
    habilitarTitulo: "Habilitar funciones Premium/Diamond",
    habilitarDetalle:
      "Convertí esta invitación de Gratis a Premium o Diamond sin perder nada de lo que ya cargaste.",
    listoPremium: "¡Listo! Tu invitación ya es Premium.",
    listoDiamond: "¡Listo! Tu invitación ya es Diamond.",
    errorPlan: "Error al actualizar el plan",
    errorPago: "Error al iniciar el pago",
  },

  nueva: {
    boton: "+ Nueva invitación",
    titulo: "Elige tu tipo de invitación",
    detalle: "¿Qué tipo de invitación quieres crear?",
    crearGratis: "Crear Gratis",
    usarPremium: "Usar Crédito Premium",
    usarDiamond: "Usar Crédito Diamond",
    ilimitadas: "Invitaciones premium ilimitadas por tu plan",
    unCredito: "{cantidad} crédito disponible",
    variosCreditos: "{cantidad} créditos disponibles",
    errorPago: "Error al iniciar el pago",
  },

  tarjeta: {
    vistaPrevia: "Vista previa",
    confirmados: "Confirmados",
    verInvitacion: "Ver Invitación",
    invitados: "Invitados",
    eliminarTitulo: "¿Eliminar invitación?",
    eliminarDetalle:
      "Esta acción no se puede deshacer. Se elimina de forma permanente la invitación {nombre} y todos los datos asociados.",
    eliminando: "Eliminando…",
    errorEliminar: "Error al eliminar la invitación",
  },

  faq: {
    tituloPagina: "Preguntas frecuentes | Convite",
    titulo: "Preguntas frecuentes",
    detalle: "Dudas comunes sobre cómo funciona Alta Invitación",
  },

  perfil: {
    tituloPagina: "Mi Perfil | Convite",
    titulo: "Mi Perfil",
    detalle: "Administra tus datos personales",
    nombreCompleto: "Nombre Completo",
    tuNombre: "Tu nombre",
    correo: "Correo Electrónico",
    correoNota: "El correo electrónico no se puede modificar, por seguridad.",
    pais: "País",
    paisNota:
      "Define qué datos bancarios te pedimos para cobrar. Se aplica a las invitaciones nuevas; las que ya creaste conservan el país con el que las armaste.",
    telefono: "Teléfono",
    codigoArea: "Cód. área",
    numero: "Número",
    telefonoNota: "Código de área sin el 0 (ej. 351) y número sin el 15 (ej. 5551234)",
    guardarCambios: "Guardar Cambios",
    nombreVacio: "El nombre no puede estar vacío",
    errorPerfil: "Error al actualizar el perfil",
    errorTelefono: "Error al actualizar el teléfono",
    errorPais: "Error al actualizar el país",
    guardado: "Perfil actualizado correctamente",
    errorInesperado: "Ocurrió un error inesperado",
  },
} as const;

export type Panel = ConCualquierTexto<typeof es>;

const en: Panel = {
  localeFecha: "en-US",

  sidebar: {
    inicio: "Home",
    inactivas: "Inactive",
    misDatos: "My details",
    descuentos: "Discounts",
    registros: "Reports",
    cerrarSesion: "Sign out",
    descuentosCorto: "Disc.",
    registrosCorto: "Rep.",
    misDatosCorto: "Details",
    nuevaInvitacion: "New invitation",
    nuevaCorto: "New",
    nuevoUsuario: "New user",
    nuevoUsuarioCorto: "Add",
    irAInicio: "Go to Home",
    salirCorto: "Sign out",
    salirSinTerminar: "Leave before finishing?",
    cambiosSinGuardar: "Unsaved changes",
    salirNuevaDetalle:
      "You haven't created the invitation yet. If you leave now you'll lose everything you've filled in.",
    salirEdicionDetalle:
      "You have unsaved changes to this invitation. Leave without applying them?",
    salirYPerder: "Leave and discard changes",
    salirSinGuardar: "Leave without saving",
  },

  creditos: {
    premiumUno: "{cantidad} Premium credit available",
    premiumVarios: "{cantidad} Premium credits available",
    diamondUno: "{cantidad} Diamond credit available",
    diamondVarios: "{cantidad} Diamond credits available",
    ilimitadas: "Premium invitations: unlimited on your plan.",
  },

  inicio: {
    anfitrion: "there",
    resumenAdmin: "Manage active clients and their invitations.",
    resumen: "Here's how your events are doing, in real time.",
    kpiActivas: "Active invitations",
    kpiActivasDetalle: "{total} in total",
    kpiConfirmaron: "Confirmed",
    kpiConfirmaronDetalle: "people confirmed",
    kpiPagaron: "Paid",
    kpiPagaronDetalle: "{pendientes} payments pending",
    kpiCanciones: "Songs pending",
    kpiCancionesDetalle: "waiting for your review",
    tusActivas: "Your active invitations",
    sinActivas: "You don't have any active invitations yet.",
    verInactivas: "See inactive invitations ({cantidad}) →",
  },

  inactivas: {
    titulo: "Inactive invitations",
    detalle:
      "Drafts, finished invitations, and ones that expired (3 months after the event).",
    borrador: "Draft",
    finalizada: "Finished",
    confirmadas: "{confirmadas} / {tope} confirmed",
    planGratis: "Free",
    administrar: "Manage →",
    vacio:
      "You don't have any inactive invitations. They show up here once they're left as a draft, finish, or expire 3 months after the event.",
  },

  evento: {
    migaInicio: "Home",
    migaAdministrar: "Manage",
    gestionDelEvento: "Event management",
    enVivo: "Live data",
    desconectado: "Offline",
  },

  invitados: {
    titulo: "Guests",
    individual: "Individual",
    grupal: "Group",
    grupalCon: "Group ({cantidad})",
    familiaOGrupo: "Family/Group",
    abrio: "Opened the invitation",
    sinAbrir: "Not opened",
    llego: "Arrived {fecha}",
    rechazadoEnLaPuerta: "Turned away at the door",
    exento: "Exempt",
    pegarLista: "Paste a list",
    agregarInvitado: "Add a guest",
    buscarInvitado: "Search guests…",
    listaDeInvitados: "Guest list",
    gestionaTusInvitados: "Manage your guests and share their links.",
    borrarLaBusqueda: "Clear search",

    abrioPrimeraVez: "First opened on {fecha}",
    abrioVeces: "First opened on {fecha} · {veces} times in total",
    contestoAsiQueAbrio: "Replied on {fecha}, so they opened it",
    sinRegistroDeApertura:
      "No record: this guest was added before we started tracking opens. They may have opened it without it being logged.",
    todaviaNoAbrio: "Hasn't opened their invitation yet",

    restar: "Remove one {que}",
    sumar: "Add one {que}",
    adultos: "Adults",
    adolescentes: "Teens",
    ninos: "Children",
    adulto: "Adult",
    adolescente: "Teen",
    categoria: "Category",
    sinPrecio: "No price set",

    agregarTitulo: "Add guests",
    cupo: "{personas}/{tope} people",
    enlaceUnico: "Create a unique link for every guest.",
    saludarPorNombre: "Greet guests by their name",
    queHaceEsteInterruptor: "What this switch does",
    queTipoDeInvitacion: "What kind of invitation do you want to create?",
    disponibleEnPremium: "Available on Premium",
    cambiarTipo: "Change invitation type",
    nombreDelGrupo: "Group/Family name",
    ejemploGrupo: "e.g. The Smiths, or Work friends",
    seVaAMostrarComo: "It will show up as",
    nombre: "First name",
    ejemploNombre: "e.g. John",
    apellido: "Last name",
    ejemploApellido: "e.g. Miller",
    exentoDePago: "Exempt from payment",
    exentoDePagoDetalle: "This guest doesn't have to pay for their ticket.",
    agregando: "Adding…",
    agregarALaLista: "Add to the list",

    cargandoInvitados: "Loading guests…",
    sinResultados: "No guests match your search.",
    sinInvitados: "You haven't added any guests yet.",

    enviarWhatsapp: "Send on WhatsApp",
    copiarEnlace: "Copy personal link",
    copiar: "Copy",
    copiarLink: "Copy link",
    asiSeComparte: "This is how you share it!",
    asiSeComparteDetalle:
      "Copy this unique link and send it to your guest so they can see their personalized invitation and RSVP.",

    pagina: "Page {actual} of {total}",

    confirmado: "Confirmed",
    noAsistira: "Not attending",
    pendiente: "Pending",

    waSaludoGrupo: "{nombre} family",
    waMensaje:
      "Hi {saludo}! 🎉 {estas} to {evento}. Open your personal invitation to see all the details and RSVP:\n{enlace}",
    waEstanInvitados: "You're all invited",
    waEstasInvitado: "You're invited",
    fraseCasamiento: "our wedding",
    fraseQuince: "my quinceañera",
    fraseAniversario: "our anniversary",
    fraseEvento: "this event",

    saludarTitulo: "Greeting by name",
    saludarQueCambia: "Changes how the invitation opens for each guest.",
    saludarActivado: "On:",
    saludarActivadoDetalle:
      "it greets them by name — “Hi, the Juárez family”. Everyone sees their own, because the link is personal.",
    saludarDesactivado: "Off:",
    saludarDesactivadoDetalle: "instead of the guest's name it shows {que}, the same for everyone.",
    saludarNombreNovios: "the couple's names",
    saludarNombreQuinceanera: "the birthday girl's name",
    saludarNombreEvento: "the event name",
    saludarNota:
      "It applies to every guest at once, and you can change it whenever you like: the next time someone opens their link they'll see it.",
    entendido: "Got it",

    eliminarTitulo: "Delete this guest?",
    eliminarDetalle:
      "You're about to remove {nombre} from the guest list. This can't be undone, and their invitation link will stop working.",
    eliminarInvitado: "Delete guest",

    editarTitulo: "Edit guest",
    yaConfirmoAviso:
      "This guest has already RSVP'd. You can raise their allowance so they can go back to their link and add more people. If you lower it below what they already confirmed, their answer is reset and they'll have to RSVP again.",
    tipoDeInvitacion: "Invitation type",

    precioAdulto: "💰 Adult price",
    precioAdolescente: "🎓 Teen price",
    precioNino: "👶 Child price",
    sinPrecioDetalle: "This category has no price yet. Enter an amount to turn it on.",
    monto: "Amount ($)",
    ejemploMonto: "e.g. 5000",
    guardarYHabilitar: "Save and enable",

    limiteTitulo: "You've hit the Free plan's guest limit",
    limiteDetalle:
      "The Free plan allows up to 20 people. Move to Premium or Diamond to keep adding guests without losing the ones you already have.",

    montoInvalido: "Enter a valid amount",
    precioGuardado: "Price saved",
    errorPrecio: "Couldn't save the price",
    preferenciaGuardada: "Preference saved",
    errorPreferencia: "Couldn't save the preference",
    agregado: "Guest added",
    errorAgregar: "Couldn't add the guest",
    errorConexion: "Connection error",
    actualizado: "Guest updated",
    errorActualizar: "Couldn't update the guest",
    eliminado: "Guest deleted",
    errorEliminar: "Couldn't delete",
    enlaceCopiado: "Link copied! Send it to your guest.",
  },

  mesas: {
    limiteTitulo: "Adding more tables? Move up to Premium",
    limiteDetalle:
      "With Premium you lay out as many tables as you need, split the families that don't fit in one, and every guest sees theirs in their invitation.",
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
    mostrarNoConfirmados: "Also show guests who haven't confirmed",

    mesaNumero: "Table {numero}",
    mesaNumeroCorto: "TABLE {numero}",
    armandoSalon: "Setting up the room…",
    volverAlSalon: "Back to the room",
    unaMesa: "{cantidad} table · {lugares} seats",
    variasMesas: "{cantidad} tables · {lugares} seats",
    achicarSalon: "Shrink the room",
    agrandarSalon: "Expand the room",

    mostrarLaMesa: "Show each guest their table",
    mostrarLaMesaDetalle:
      "It appears on their pass, inside the invitation. If a family is split up, they see both tables, without who sits where.",
    controlarIngreso: "Check guests in with a QR code",
    controlarIngresoDetalle:
      "Every invitation ends with a QR code. Scan it at the door to see who they are, how many are coming and which table to send them to. Who arrived and when is recorded.",

    salonVacio:
      "No tables yet. Add the first one and drag it to lay out the room the way it will be on the day.",
    ahoraTocaUnaMesa: "Now tap a table in the room.",
    comoUbicar: "Drag a guest or family onto a table, or tap them and then tap the table.",
    nadieConfirmoTodavia:
      "Nobody has confirmed yet. If you want to get ahead, tick the option above to seat guests who haven't answered.",
    sinCoincidencias: "No unseated guest matches “{busqueda}”.",
    sinConfirmar: "not confirmed",
    faltan: "{cantidad} left",
    anteriorCorto: "‹ Previous",
    siguienteCorto: "Next ›",
    deTotal: "{actual} of {total}",

    apodo: "A nickname just for you (e.g. Cousins)",
    quitarLugar: "Remove a seat",
    agregarLugar: "Add a seat",
    excedida:
      "There are {personas} people for {lugares} seats. Make the table bigger or move someone else.",
    nadieEnLaMesa: "Nobody here yet.",
    invitado: "Guest",
    yaNoConfirmado: "no longer confirmed",
    unLugarMenos: "One seat less at this table",
    unLugarMas: "One more seat at this table",
    sacarDeLaMesa: "Remove from this table",
    siBorrar: "Yes, delete {mesa}",
    borrarMesa: "Delete table",

    errorCargar: "Couldn't load the tables",
    errorGuardar: "Couldn't save",
    mesasVisibles: "Done: every guest will see their table on their invitation's cover.",
    mesasOcultas: "The seating chart stays private. Guests see nothing.",
    qrActivado: "Done: every invitation ends with a QR code you can scan at the door.",
    qrDesactivado: "No door check: the QR code disappears from the invitations.",
    mesaCompleta: "{mesa} is full. Make it bigger or pick another one.",
    entraronParte: "{nombre}: {ubicados} at {mesa}, {faltan} still to seat.",
  },

  escaner: {
    apuntaAlQr: "Point at the QR code each guest has at the end of their invitation.",
    encenderCamara: "Turn on the camera",
    apagar: "Turn off",
    escanearOtro: "Scan another",
    noPudeLeer: "I couldn't read that code",
    sinPermiso: "The browser didn't allow camera access. Enable it and try again.",
    sinCamara: "I couldn't find a camera on this device.",
    noPudeAbrir: "I couldn't open the camera.",
    rechazado: "TURNED AWAY",
    contactarAnfitrion: "{motivo}. Please contact the host.",
    yaHabiaEntrado: "Already checked in at {hora}",
    ingresoRegistrado: "Checked in",
    unaPersona: "{cantidad} person",
    variasPersonas: "{cantidad} people",
    sinConfirmar: " · not confirmed",
    adultos: "{cantidad} adults",
    adolescentes: "{cantidad} teens",
    ninos: "{cantidad} children",
    sinMesa: "No table assigned",
    unLugar: "{cantidad} seat",
    variosLugares: "{cantidad} seats",
  },

  compartir: {
    tipeando: "Preview your design or edit the details…",
    verEjemplo: "See example",
    editarInvitacion: "Edit invitation",
    cambiarPlantilla: "Change template",
    esGratis: "This invitation is on the Free plan",
    esGratisDetalle:
      "Move it to Premium or Diamond to add music, trivia, payment tracking and LIVE Mode.",
    habilitar: "Enable Premium/Diamond",
    habilitarTitulo: "Enable Premium/Diamond features",
    habilitarDetalle:
      "Move this invitation from Free to Premium or Diamond without losing anything you've already set up.",
    listoPremium: "Done! Your invitation is now Premium.",
    listoDiamond: "Done! Your invitation is now Diamond.",
    errorPlan: "Couldn't change the plan",
    errorPago: "Couldn't start the payment",
  },

  nueva: {
    boton: "+ New invitation",
    titulo: "Choose your invitation type",
    detalle: "What kind of invitation do you want to create?",
    crearGratis: "Create for free",
    usarPremium: "Use a Premium credit",
    usarDiamond: "Use a Diamond credit",
    ilimitadas: "Unlimited premium invitations on your plan",
    unCredito: "{cantidad} credit available",
    variosCreditos: "{cantidad} credits available",
    errorPago: "Couldn't start the payment",
  },

  tarjeta: {
    vistaPrevia: "Preview",
    confirmados: "Confirmed",
    verInvitacion: "View invitation",
    invitados: "Guests",
    eliminarTitulo: "Delete this invitation?",
    eliminarDetalle:
      "This can't be undone. The invitation {nombre} and all its data will be permanently deleted.",
    eliminando: "Deleting…",
    errorEliminar: "Couldn't delete the invitation",
  },

  faq: {
    tituloPagina: "FAQ | Convite",
    titulo: "Frequently asked questions",
    detalle: "Common questions about how Alta Invitación works",
  },

  perfil: {
    tituloPagina: "My profile | Convite",
    titulo: "My profile",
    detalle: "Manage your personal details",
    nombreCompleto: "Full name",
    tuNombre: "Your name",
    correo: "Email",
    correoNota: "Your email can't be changed, for security reasons.",
    pais: "Country",
    paisNota:
      "It decides which bank details we ask you for to collect payments. It applies to new invitations; the ones you already created keep the country you built them with.",
    telefono: "Phone",
    codigoArea: "Area code",
    numero: "Number",
    telefonoNota: "Area code (e.g. 305) and number (e.g. 5551234)",
    guardarCambios: "Save changes",
    nombreVacio: "Your name can't be empty",
    errorPerfil: "Couldn't update your profile",
    errorTelefono: "Couldn't update your phone",
    errorPais: "Couldn't update your country",
    guardado: "Profile updated",
    errorInesperado: "Something unexpected went wrong",
  },
};

const pt: Panel = {
  localeFecha: "pt-BR",

  sidebar: {
    inicio: "Início",
    inactivas: "Inativos",
    misDatos: "Meus dados",
    descuentos: "Descontos",
    registros: "Relatórios",
    cerrarSesion: "Sair",
    descuentosCorto: "Desc.",
    registrosCorto: "Rel.",
    misDatosCorto: "Dados",
    nuevaInvitacion: "Novo convite",
    nuevaCorto: "Novo",
    nuevoUsuario: "Novo usuário",
    nuevoUsuarioCorto: "Criar",
    irAInicio: "Ir para o Início",
    salirCorto: "Sair",
    salirSinTerminar: "Sair sem terminar?",
    cambiosSinGuardar: "Alterações não salvas",
    salirNuevaDetalle:
      "Você ainda não criou o convite. Se sair agora, vai perder tudo o que preencheu até aqui.",
    salirEdicionDetalle:
      "Você tem alterações não salvas neste convite. Quer sair sem aplicá-las?",
    salirYPerder: "Sair e descartar as alterações",
    salirSinGuardar: "Sair sem salvar",
  },

  creditos: {
    premiumUno: "{cantidad} crédito Premium disponível",
    premiumVarios: "{cantidad} créditos Premium disponíveis",
    diamondUno: "{cantidad} crédito Diamond disponível",
    diamondVarios: "{cantidad} créditos Diamond disponíveis",
    ilimitadas: "Convites Premium: ilimitados no seu plano.",
  },

  inicio: {
    anfitrion: "anfitrião",
    resumenAdmin: "Gerencie os clientes ativos e seus convites.",
    resumen: "Aqui está o resumo dos seus eventos em tempo real.",
    kpiActivas: "Convites ativos",
    kpiActivasDetalle: "{total} no total",
    kpiConfirmaron: "Confirmaram",
    kpiConfirmaronDetalle: "pessoas confirmadas",
    kpiPagaron: "Pagaram",
    kpiPagaronDetalle: "{pendientes} pagamentos pendentes",
    kpiCanciones: "Músicas pendentes",
    kpiCancionesDetalle: "esperando sua avaliação",
    tusActivas: "Seus convites ativos",
    sinActivas: "Você ainda não tem convites ativos.",
    verInactivas: "Ver convites inativos ({cantidad}) →",
  },

  inactivas: {
    titulo: "Convites inativos",
    detalle:
      "Convites em rascunho, finalizados, ou que já venceram (3 meses depois do evento).",
    borrador: "Rascunho",
    finalizada: "Finalizado",
    confirmadas: "{confirmadas} / {tope} confirmadas",
    planGratis: "Grátis",
    administrar: "Gerenciar →",
    vacio:
      "Você não tem convites inativos. Eles aparecem aqui quando ficam em rascunho, são finalizados, ou vencem 3 meses depois do evento.",
  },

  evento: {
    migaInicio: "Início",
    migaAdministrar: "Gerenciar",
    gestionDelEvento: "Gestão do evento",
    enVivo: "Dados em tempo real",
    desconectado: "Desconectado",
  },

  invitados: {
    titulo: "Convidados",
    individual: "Individual",
    grupal: "Grupo",
    grupalCon: "Grupo ({cantidad})",
    familiaOGrupo: "Família/Grupo",
    abrio: "Abriu o convite",
    sinAbrir: "Não abriu",
    llego: "Chegou {fecha}",
    rechazadoEnLaPuerta: "Barrado na entrada",
    exento: "Isento",
    pegarLista: "Colar uma lista",
    agregarInvitado: "Adicionar convidado",
    buscarInvitado: "Buscar convidado…",
    listaDeInvitados: "Lista de convidados",
    gestionaTusInvitados: "Gerencie seus convidados e compartilhe os links.",
    borrarLaBusqueda: "Limpar a busca",

    abrioPrimeraVez: "Abriu pela primeira vez em {fecha}",
    abrioVeces: "Abriu pela primeira vez em {fecha} · {veces} vezes no total",
    contestoAsiQueAbrio: "Respondeu em {fecha}, então abriu o convite",
    sinRegistroDeApertura:
      "Sem registro: este convidado foi cadastrado antes de começarmos a medir as aberturas. Pode ter aberto sem ficar registrado.",
    todaviaNoAbrio: "Ainda não abriu o convite",

    restar: "Tirar um(a) {que}",
    sumar: "Somar um(a) {que}",
    adultos: "Adultos",
    adolescentes: "Adolescentes",
    ninos: "Crianças",
    adulto: "Adulto",
    adolescente: "Adolescente",
    categoria: "Categoria",
    sinPrecio: "Sem preço",

    agregarTitulo: "Adicionar convidados",
    cupo: "{personas}/{tope} pessoas",
    enlaceUnico: "Gere um link exclusivo para cada convidado.",
    saludarPorNombre: "Cumprimentar pelo nome do convidado/família",
    queHaceEsteInterruptor: "O que esta chave faz",
    queTipoDeInvitacion: "Que tipo de convite você quer criar?",
    disponibleEnPremium: "Disponível no Premium",
    cambiarTipo: "Trocar o tipo de convite",
    nombreDelGrupo: "Nome do grupo/família",
    ejemploGrupo: "Ex: Silva, ou Galera do trabalho",
    seVaAMostrarComo: "Vai aparecer como",
    nombre: "Nome",
    ejemploNombre: "Ex: João",
    apellido: "Sobrenome",
    ejemploApellido: "Ex: Oliveira",
    exentoDePago: "Isento de pagamento",
    exentoDePagoDetalle: "Este convidado não precisa pagar o convite.",
    agregando: "Adicionando…",
    agregarALaLista: "Adicionar à lista",

    cargandoInvitados: "Carregando convidados…",
    sinResultados: "Nenhum convidado corresponde à sua busca.",
    sinInvitados: "Você ainda não adicionou convidados.",

    enviarWhatsapp: "Enviar por WhatsApp",
    copiarEnlace: "Copiar link personalizado",
    copiar: "Copiar",
    copiarLink: "Copiar link",
    asiSeComparte: "É assim que se compartilha!",
    asiSeComparteDetalle:
      "Copie este link exclusivo e envie ao seu convidado para ele ver o convite personalizado e confirmar presença.",

    pagina: "Página {actual} de {total}",

    confirmado: "Confirmado",
    noAsistira: "Não vai",
    pendiente: "Pendente",

    waSaludoGrupo: "família {nombre}",
    waMensaje:
      "Oi, {saludo}! 🎉 {estas} para {evento}. Entre no seu convite personalizado para ver todos os detalhes e confirmar presença:\n{enlace}",
    waEstanInvitados: "Vocês estão convidados",
    waEstasInvitado: "Você está convidado(a)",
    fraseCasamiento: "o nosso casamento",
    fraseQuince: "os meus 15 anos",
    fraseAniversario: "o nosso aniversário",
    fraseEvento: "este evento",

    saludarTitulo: "Cumprimentar pelo nome",
    saludarQueCambia: "Muda como o convite começa para cada convidado.",
    saludarActivado: "Ativado:",
    saludarActivadoDetalle:
      "cumprimenta pelo nome — “Oi, família Juárez”. Cada um vê o seu, porque o link é pessoal.",
    saludarDesactivado: "Desativado:",
    saludarDesactivadoDetalle: "no lugar do nome do convidado mostra {que}, igual para todo mundo.",
    saludarNombreNovios: "o nome dos noivos",
    saludarNombreQuinceanera: "o nome da aniversariante",
    saludarNombreEvento: "o nome do evento",
    saludarNota:
      "Vale para todos os convidados de uma vez, e você pode mudar quando quiser: da próxima vez que alguém abrir o link já vê a mudança.",
    entendido: "Entendi",

    eliminarTitulo: "Excluir este convidado?",
    eliminarDetalle:
      "Você está prestes a remover {nombre} da lista de convidados. Isso não tem volta, e o link do convite deixa de funcionar para essa pessoa.",
    eliminarInvitado: "Excluir convidado",

    editarTitulo: "Editar convidado",
    yaConfirmoAviso:
      "Este convidado já confirmou presença. Você pode aumentar a quantidade para ele entrar no link depois e somar mais gente. Se reduzir abaixo do que já confirmou, a resposta dele é zerada e vai precisar confirmar de novo.",
    tipoDeInvitacion: "Tipo de convite",

    precioAdulto: "💰 Preço adulto",
    precioAdolescente: "🎓 Preço adolescente",
    precioNino: "👶 Preço criança",
    sinPrecioDetalle: "Esta categoria ainda não tem preço. Informe o valor para habilitá-la.",
    monto: "Valor (R$)",
    ejemploMonto: "Ex: 5000",
    guardarYHabilitar: "Salvar e habilitar",

    limiteTitulo: "Você chegou ao limite de convidados do plano Grátis",
    limiteDetalle:
      "O plano Grátis aceita até 20 pessoas. Mude para Premium ou Diamond para seguir adicionando convidados sem perder os que já cadastrou.",

    montoInvalido: "Informe um valor válido",
    precioGuardado: "Preço salvo",
    errorPrecio: "Não deu para salvar o preço",
    preferenciaGuardada: "Preferência salva",
    errorPreferencia: "Não deu para salvar a preferência",
    agregado: "Convidado adicionado",
    errorAgregar: "Não deu para adicionar o convidado",
    errorConexion: "Erro de conexão",
    actualizado: "Convidado atualizado",
    errorActualizar: "Não deu para atualizar o convidado",
    eliminado: "Convidado excluído",
    errorEliminar: "Não deu para excluir",
    enlaceCopiado: "Link copiado! Mande para o seu convidado.",
  },

  mesas: {
    limiteTitulo: "Vai montar mais mesas? Passe para o Premium",
    limiteDetalle:
      "Com o Premium você monta quantas mesas precisar, divide as famílias que não cabem em uma só, e cada convidado vê a sua no convite.",
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
    mostrarNoConfirmados: "Mostrar também quem não confirmou",

    mesaNumero: "Mesa {numero}",
    mesaNumeroCorto: "MESA {numero}",
    armandoSalon: "Montando o salão…",
    volverAlSalon: "Voltar ao salão",
    unaMesa: "{cantidad} mesa · {lugares} lugares",
    variasMesas: "{cantidad} mesas · {lugares} lugares",
    achicarSalon: "Diminuir o salão",
    agrandarSalon: "Aumentar o salão",

    mostrarLaMesa: "Mostrar a mesa para cada convidado",
    mostrarLaMesaDetalle:
      "Aparece no passe dele, dentro do convite. Se uma família ficou dividida, ele vê as duas mesas, sem o detalhe de quem senta onde.",
    controlarIngreso: "Controlar a entrada com QR",
    controlarIngresoDetalle:
      "Cada convite termina com um QR. Você escaneia na porta e vê quem são, quantos vêm e para qual mesa mandar. Fica registrado quem chegou e a que horas.",

    salonVacio:
      "Ainda não há mesas. Adicione a primeira e arraste para montar o salão como vai ficar no dia do evento.",
    ahoraTocaUnaMesa: "Agora toque em uma mesa do salão.",
    comoUbicar:
      "Arraste um convidado ou família até a mesa, ou toque nele e depois toque na mesa.",
    nadieConfirmoTodavia:
      "Ninguém confirmou ainda. Se quiser adiantar, marque a opção acima para acomodar também quem não respondeu.",
    sinCoincidencias: "Ninguém sem mesa corresponde a “{busqueda}”.",
    sinConfirmar: "sem confirmar",
    faltan: "faltam {cantidad}",
    anteriorCorto: "‹ Anterior",
    siguienteCorto: "Próximo ›",
    deTotal: "{actual} de {total}",

    apodo: "Apelido só para você (ex: Primos)",
    quitarLugar: "Tirar um lugar",
    agregarLugar: "Adicionar um lugar",
    excedida:
      "Tem {personas} pessoas para {lugares} lugares. Aumente a mesa ou passe alguém para outra.",
    nadieEnLaMesa: "Ainda não há ninguém.",
    invitado: "Convidado",
    yaNoConfirmado: "não está mais confirmado",
    unLugarMenos: "Um lugar a menos nesta mesa",
    unLugarMas: "Um lugar a mais nesta mesa",
    sacarDeLaMesa: "Tirar desta mesa",
    siBorrar: "Sim, excluir {mesa}",
    borrarMesa: "Excluir mesa",

    errorCargar: "Não deu para carregar as mesas",
    errorGuardar: "Não deu para salvar",
    mesasVisibles: "Pronto: cada convidado vai ver a mesa dele na capa do convite.",
    mesasOcultas: "As mesas ficam só para você. Os convidados não veem nada.",
    qrActivado: "Pronto: cada convite termina com um QR e você pode escanear na porta.",
    qrDesactivado: "Sem controle na porta: o QR some dos convites.",
    mesaCompleta: "{mesa} já está cheia. Aumente ou escolha outra.",
    entraronParte: "{nombre}: {ubicados} na {mesa}, faltam {faltan} para acomodar.",
  },

  escaner: {
    apuntaAlQr: "Aponte para o QR que cada convidado tem no final do convite.",
    encenderCamara: "Ligar a câmera",
    apagar: "Desligar",
    escanearOtro: "Escanear outro",
    noPudeLeer: "Não consegui ler esse código",
    sinPermiso: "O navegador não deu permissão para usar a câmera. Libere e tente de novo.",
    sinCamara: "Não encontrei nenhuma câmera neste aparelho.",
    noPudeAbrir: "Não consegui abrir a câmera.",
    rechazado: "BARRADO",
    contactarAnfitrion: "{motivo}. Procure o anfitrião.",
    yaHabiaEntrado: "Já tinha entrado às {hora}",
    ingresoRegistrado: "Entrada registrada",
    unaPersona: "{cantidad} pessoa",
    variasPersonas: "{cantidad} pessoas",
    sinConfirmar: " · sem confirmar",
    adultos: "{cantidad} adultos",
    adolescentes: "{cantidad} adolescentes",
    ninos: "{cantidad} crianças",
    sinMesa: "Sem mesa definida",
    unLugar: "{cantidad} lugar",
    variosLugares: "{cantidad} lugares",
  },

  compartir: {
    tipeando: "Veja o seu design ou edite os detalhes…",
    verEjemplo: "Ver exemplo",
    editarInvitacion: "Editar convite",
    cambiarPlantilla: "Trocar modelo",
    esGratis: "Este convite está no plano Grátis",
    esGratisDetalle:
      "Mude para Premium ou Diamond para somar música, quiz, gestão de pagamentos e o Modo LIVE.",
    habilitar: "Habilitar Premium/Diamond",
    habilitarTitulo: "Habilitar recursos Premium/Diamond",
    habilitarDetalle:
      "Mude este convite de Grátis para Premium ou Diamond sem perder nada do que já montou.",
    listoPremium: "Pronto! Seu convite agora é Premium.",
    listoDiamond: "Pronto! Seu convite agora é Diamond.",
    errorPlan: "Não deu para mudar o plano",
    errorPago: "Não deu para iniciar o pagamento",
  },

  nueva: {
    boton: "+ Novo convite",
    titulo: "Escolha o tipo de convite",
    detalle: "Que tipo de convite você quer criar?",
    crearGratis: "Criar grátis",
    usarPremium: "Usar crédito Premium",
    usarDiamond: "Usar crédito Diamond",
    ilimitadas: "Convites premium ilimitados no seu plano",
    unCredito: "{cantidad} crédito disponível",
    variosCreditos: "{cantidad} créditos disponíveis",
    errorPago: "Não deu para iniciar o pagamento",
  },

  tarjeta: {
    vistaPrevia: "Prévia",
    confirmados: "Confirmados",
    verInvitacion: "Ver convite",
    invitados: "Convidados",
    eliminarTitulo: "Excluir este convite?",
    eliminarDetalle:
      "Isso não tem volta. O convite {nombre} e todos os dados dele são excluídos em definitivo.",
    eliminando: "Excluindo…",
    errorEliminar: "Não deu para excluir o convite",
  },

  faq: {
    tituloPagina: "Perguntas frequentes | Convite",
    titulo: "Perguntas frequentes",
    detalle: "Dúvidas comuns sobre como funciona o Alta Invitación",
  },

  perfil: {
    tituloPagina: "Meu perfil | Convite",
    titulo: "Meu perfil",
    detalle: "Administre seus dados pessoais",
    nombreCompleto: "Nome completo",
    tuNombre: "Seu nome",
    correo: "E-mail",
    correoNota: "O e-mail não pode ser alterado, por segurança.",
    pais: "País",
    paisNota:
      "Define quais dados bancários pedimos para você receber. Vale para os convites novos; os que você já criou mantêm o país com que foram montados.",
    telefono: "Telefone",
    codigoArea: "DDD",
    numero: "Número",
    telefonoNota: "DDD sem o 0 (ex. 11) e número sem o 9 inicial, se houver (ex. 55512345)",
    guardarCambios: "Salvar alterações",
    nombreVacio: "O nome não pode ficar vazio",
    errorPerfil: "Não deu para atualizar o perfil",
    errorTelefono: "Não deu para atualizar o telefone",
    errorPais: "Não deu para atualizar o país",
    guardado: "Perfil atualizado",
    errorInesperado: "Aconteceu um erro inesperado",
  },
};

export const panel = { es, en, pt };
