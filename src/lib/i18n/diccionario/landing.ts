import type { ConCualquierTexto } from "./forma";

/** La página pública: portada, precios, cómo funciona, pie. */
const es = {
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
  registrarse: "Registrarse",
  ingresar: "Ingresar",
  cerrarSesion: "Cerrar sesión",
  abrirMenu: "Abrir menú",
  cerrarMenu: "Cerrar menú",
  accesosRapidos: "Accesos rápidos",
  hechoPara: "Hecho para bodas, cumpleaños, eventos y todo lo que se celebra",

  nav: {
    inicio: "Inicio",
    // El texto con el que arranca el chat de WhatsApp al tocar "Contacto".
    whatsapp: "Hola, quiero conocer más sobre las invitaciones de altainvitacion.com",
  },

  // El titular del hero se tipea solo: un prefijo fijo y frases que rotan.
  // La palabra LIVE se resalta buscándola dentro de la frase, así que tiene
  // que seguir escrita igual en los tres idiomas.
  hero: {
    prefijo: "No somos solo una invitación digital. ",
    frase1: "Somos un link personal para cada invitado.",
    frase2: "Somos una invitación en tiempo real.",
    frase3: "Con LIVE tu fiesta se anima.",
  },

  showcase: {
    kicker: "Plantillas",
    titulo: "Un diseño para cada celebración",
    bajada: "Bodas y 15 años, en distintos estilos y colores. Así se ve tu invitación en el celular de cada invitado.",
    tituloIframe: "Vista previa de plantillas",
    evento: {
      boda: "Boda",
      quince: "15 Años",
    },
    color: {
      verde: "Verde",
      rojo: "Rojo",
      azul: "Azul",
      rosa: "Rosa",
    },
  },

  collage: {
    kicker: "Todo en un solo link",
    titulo: "Así es tu invitación",
    bajada: "Portada, cuenta regresiva, ubicación, RSVP, álbum y regalos — todo lo que tus invitados necesitan, en un vistazo.",
    alt: "Desglose de las partes de una invitación digital de Alta Invitación: portada, cuenta regresiva, ubicación, RSVP, álbum de fotos y mesa de regalos",
  },

  strip: {
    kicker: "Todo en uno",
    titulo: "Mucho más que una invitación",
    personalizable: {
      titulo: "Plantilla 100% Personalizable",
      detalle: "Adapta colores, tipografías, fotos y estructura. Ya sea una boda, un 15 o un evento corporativo, el diseño se ajusta a tu estilo.",
    },
    gestion: {
      titulo: "Gestión de Invitados y Pagos",
      detalle: "Recibe confirmaciones (RSVP) al instante, administra accesos y configura tu mesa de regalos o cuenta bancaria sin comisiones.",
    },
    live: {
      titulo: "Con LIVE tu fiesta se anima",
      detalle: "Tus invitados pueden subir fotos y dejar mensajes desde sus teléfonos durante la fiesta. Todo se proyecta y queda guardado de recuerdo.",
    },
  },

  caracteristicas: {
    kicker: "Incluido en tu invitación",
    titulo: "Todo lo que incluye tu invitación",
    exclusiva: "Exclusiva",
    enGratis: "Gratis",
    enPremium: "Premium",
    enDiamond: "Diamond",
    pagos: {
      titulo: "Quién pagó y quién debe",
      detalle: "Lleva la cuenta de la tarjeta invitado por invitado: precio por lugar, exentos y pagos parciales. Te pagan a ti directamente; la app sólo lleva la cuenta.",
    },
    live: {
      titulo: "Modo LIVE",
      detalle: "Fotos y mensajes de tus invitados proyectados en vivo durante la fiesta.",
    },
    mesas: {
      titulo: "Organización de mesas",
      detalle: "Arma el salón, asigna cada familia a su mesa y reparte a las que no entran en una sola. Cada invitado ve la suya en su invitación.",
    },
    ingreso: {
      titulo: "Control de ingreso",
      detalle: "Cada invitación termina con un QR. Lo escaneas en la puerta y ves quiénes son y cuántos vienen. Si armaste el salón, también a qué mesa mandarlos.",
    },
    aperturas: {
      titulo: "Quién abrió la invitación",
      detalle: "Sabés a quién le llegó y a quién conviene volver a escribirle, antes de insistir a ciegas por WhatsApp.",
    },
    rsvp: {
      titulo: "Confirmación de asistencia",
      detalle: "RSVP en tiempo real: sabes quién confirmó sin tener que preguntar.",
    },
    social: {
      titulo: "Módulo social",
      detalle: "Sugerencias de canciones para el DJ y mensajes de cariño de los invitados.",
    },
    saveTheDate: {
      titulo: "Save the date",
      detalle: "Cuenta regresiva y botón para agendar la fecha directo en Google Calendar.",
    },
    ubicacion: {
      titulo: "Ubicación e indicaciones",
      detalle: "Mapa, horarios y cómo llegar a la ceremonia y a la fiesta, todo en un lugar.",
    },
    album: {
      titulo: "Álbum de fotos",
      detalle: "Comparte los momentos de la pareja antes de la fiesta y suma los del evento.",
    },
    musica: {
      titulo: "Música de fondo",
      detalle: "La invitación suena con la canción que los identifica como pareja.",
    },
    cronograma: {
      titulo: "Cronograma del evento",
      detalle: "Recepción, ceremonia, cena, baile: tus invitados saben qué pasa a cada hora sin tener que preguntar.",
    },
  },

  pasos: {
    elegis: {
      n: "Elegís",
      titulo: "Una plantilla para tu evento",
      detalle: "Boda, cumpleaños, bautismo o lo que estés celebrando: cada una trae su propio tono, tipografía y estructura.",
    },
    personalizas: {
      n: "Personalizás",
      titulo: "Nombres, fecha, lugar y mensaje",
      detalle: "Wizard guiado paso a paso. Vista previa en vivo, igual a como la va a ver cada invitado en su teléfono.",
    },
    compartis: {
      n: "Compartís",
      titulo: "Un link, listo para enviar",
      detalle: "RSVP, mapa y módulo social incluidos. Vas viendo las confirmaciones a medida que entran.",
    },
  },

  video: {
    kicker: "En minutos, no en horas",
    titulo: "Mira cómo funciona",
    bajada: "De la idea a tu invitación lista, en minutos.",
    sinSoporte: "Tu navegador no soporta video HTML5.",
  },

  planes: {
    kicker: "Precios Transparentes",
    titulo: "Elige el plan para tu evento",
    bajada: "Empieza completamente gratis o desbloquea todas las funcionalidades con un único pago. Sin suscripciones, y hasta en {cuotas} cuotas sin interés.",
    bajadaSinCuotas: "Empieza completamente gratis o desbloquea todas las funcionalidades con un único pago. Sin suscripciones.",
    cobroEnDolares: "* Precio aproximado. PayPal no cobra en tu moneda, así que el cobro se hace en dólares ({monto}) y tu banco lo convierte.",
    porEvento: "/evento",
    descuento: "{porcentaje}% OFF",
    cuotas: "o {cuotas} cuotas sin interés de {monto}",
    recomendado: "Recomendado",

    // Lo que un plan NO trae. Vive suelto porque las mismas líneas aparecen
    // en más de una tarjeta y repetirlas por plan multiplicaría el trabajo de
    // traducción sin agregar nada.
    sin: {
      pagos: "Sin gestión de pagos",
      live: "Sin función LIVE",
      liveDiamond: "Sin función LIVE (exclusiva de Diamond)",
      marcaAgua: "Con marca de agua de altainvitacion",
      mesas: "El salón completo es de Premium",
      ingreso: "Sin control de ingreso",
      aperturas: "Sin ver quién abrió la invitación",
    },

    gratis: {
      nombre: "Gratis",
      detalle: "Ideal para eventos íntimos y para probar la plataforma.",
      cta: "Crear cuenta gratis",
      personalizables: "Invitaciones personalizables completas",
      rsvp: "Gestión de confirmaciones (RSVP)",
      invitados: "Hasta {max} invitados",
      album: "Álbum de fotos (hasta {fotos} fotos)",
      ingreso: "Control de ingreso: escaneas el QR en la puerta",
    },

    premium: {
      detalle: "Todas las herramientas interactivas, sin límite de invitados.",
      cta: "Elegir Premium",
      todoGratis: "Todo lo del plan Gratis, más:",
      ilimitados: { titulo: "Invitados ilimitados", detalle: "y sin restricciones" },
      album: { titulo: "Álbum de fotos premium", detalle: "(hasta {fotos} fotos)" },
      musica: "Música de fondo, trivias y sugerencias de DJ",
      mesas: {
        titulo: "Organización de mesas:",
        detalle: "arma el salón completo y asigna a cada familia su mesa, que cada invitado ve en su invitación",
      },
      pagos: {
        titulo: "Gestión de pagos:",
        detalle: "cuentas bancarias para regalos y cobro de tarjetas/entradas",
      },
    },

    diamond: {
      detalle: "Todo Premium, más el Modo LIVE y saber quién abrió su invitación.",
      cta: "Elegir Diamond",
      todoPremium: "Todo lo del plan Premium, más:",
      live: {
        titulo: "Interacción LIVE:",
        detalle: "proyección de fotos en vivo en tu fiesta (hasta {fotos} fotos)",
      },
      mesas: {
        titulo: "Organización de mesas:",
        detalle: "arma el salón y asigna a cada familia su mesa, y cada invitado la ve en su invitación",
      },
      ingreso: {
        titulo: "Control de ingreso:",
        detalle: "escaneas el QR en la puerta y ves quién llegó y a qué mesa va",
      },
      aperturas: {
        titulo: "Quién abrió la invitación:",
        detalle: "sabes a quién le llegó y a quién volver a escribirle",
      },
      sinMarca: {
        titulo: "Sin marca de agua:",
        detalle: "la invitación es tuya, sin nuestro logo al pie",
      },
    },

    enterprise: {
      precio: "Precio a consultar",
      detalle: "Para empresas o clientes que necesiten un diseño de plantilla a medida.",
      cta: "Consultar",
      todoDiamond: "Todo lo de Diamond",
      diseno: "Diseño de plantilla 100% a medida",
      asesor: "Asesor dedicado",
      whatsapp: "Hola, me interesa el plan Enterprise de Alta Invitación",
    },
  },

  // Las mismas preguntas viven en src/lib/faq-data.ts para /dashboard/faq,
  // que todavía no está traducido. Cuando ese panel se traduzca, conviene que
  // las dos pantallas lean de acá y borrar el archivo de datos.
  faq: {
    kicker: "Preguntas frecuentes",
    titulo: "¿Tenés dudas?",
    sinDiseno: {
      q: "¿Necesito saber de diseño o programación para armar mi invitación?",
      a: "No. Elegís una plantilla y la personalizas con un wizard guiado paso a paso: nombres, fecha, lugar, fotos y mensaje. Vas viendo la vista previa en vivo, tal cual la va a ver cada invitado en su teléfono, así que no hay sorpresas al final.",
    },
    proceso: {
      q: "¿Cómo es el proceso, paso a paso?",
      a: "Elegís una plantilla según tu evento, la personalizas con tus datos y fotos en el wizard viendo la vista previa en tiempo real, y publicas para compartir el link por WhatsApp, Instagram o el medio que prefieras. No hay tiempos de espera ni formularios que enviar a un tercero: tú controlas todo el proceso.",
    },
    editar: {
      q: "¿Puedo editar mi invitación después de haberla publicado?",
      a: "Sí, puedes volver a tu panel y modificar textos, fotos, fecha o cualquier dato las veces que necesites. Si cambia el lugar o la fecha del evento, el link no cambia: tus invitados van a ver la información actualizada automáticamente.",
    },
    compartir: {
      q: "¿Cómo comparto mi invitación con los invitados?",
      a: "Generas un link único y personalizado para cada invitado o grupo familiar. Lo envías de forma individual (uno a uno) por WhatsApp, email o el medio que prefieras. Al ser un link personal, cada persona recibe su propia invitación exclusiva para confirmar su asistencia.",
    },
    limite: {
      q: "¿Hay límite de invitados?",
      a: "En el plan Gratis puedes cargar hasta 20 invitados. En Premium y Diamond no hay límite: puedes invitar a todos los que quieras sin restricciones.",
    },
    planes: {
      q: "¿Qué diferencia hay entre los planes Gratis, Premium y Diamond?",
      a: "El plan Gratis incluye invitación personalizable completa, RSVP y álbum de hasta 5 fotos para hasta 20 invitados: ideal para probar la plataforma o eventos íntimos. Premium suma invitados ilimitados, álbum de hasta 15 fotos, música de fondo, trivias, sugerencias de DJ y gestión de pagos. Diamond agrega el Modo LIVE, con proyección de fotos en vivo durante la fiesta.",
    },
    cambiarPlan: {
      q: "¿Puedo cambiar de plan después de haber empezado?",
      a: "Sí, puedes empezar gratis y subir de plan en cualquier momento sin perder lo que ya cargaste.",
    },
    celular: {
      q: "¿Mi invitación se va a ver bien en el celular de mis invitados?",
      a: "Sí. Cada plantilla está pensada mobile-first, porque la gran mayoría de tus invitados la va a abrir desde WhatsApp en su teléfono. También se ve correctamente en tablet y PC.",
    },
    otrosEventos: {
      q: "¿Puedo usar Alta Invitación para otro evento que no sea una boda?",
      a: "Sí, tenemos plantillas para bodas, XV años, cumpleaños y otros eventos, cada una con su propio estilo, tipografía y estructura.",
    },
    costoGratis: {
      q: "¿Hay algún costo por usar el plan Gratis?",
      a: "No, el plan Gratis es $0 por evento, sin suscripción ni tarjeta requerida. Solo pagas si eliges desbloquear funcionalidades con Premium o Diamond, y es un pago único por evento, nunca una suscripción recurrente.",
    },
    cantidadConfirmada: {
      q: "Un invitado ya confirmó su asistencia, ¿puedo modificar la cantidad de invitados después?",
      a: "Sí. Desde \"Gestionar invitados\" puedes editar la cantidad aunque ya haya confirmado. Si la aumentas (por ejemplo, de 3 a 5 personas), el invitado va a poder entrar a su link y confirmar hasta esa nueva cantidad. Si en cambio la reduces por debajo de lo que ya había confirmado, su respuesta se reinicia automáticamente y va a tener que volver a confirmar su asistencia.",
    },
  },

  pie: {
    links: {
      plantillas: "Plantillas",
      asiEsTuInvitacion: "Así es tu invitación",
      preguntasFrecuentes: "Preguntas frecuentes",
    },
    arrepentimiento: {
      enlace: "Botón de arrepentimiento",
      asunto: "Botón de arrepentimiento",
      cuerpo: "Nombre completo:\nEmail de contratación:\nFecha de contratación:\nPlan contratado:\nMotivo (opcional):",
    },
  },

  modelos: {
    kicker: "Modelos reales",
    // El título termina resaltado en itálica, así que la parte destacada va
    // siempre al final de la frase en los tres idiomas.
    tituloAntes: "Mira cómo ven la invitación",
    tituloDestacado: "tus invitados",
    bajada: "Invitaciones reales, con nombre, salón, mapa y fecha de verdad — toca cualquiera para abrirla completa, tal cual la va a ver cada invitado.",
    vacio: "Estamos preparando los modelos. Vuelve pronto para ver ejemplos reales.",
    masAntes: "Y un montón más de",
    masDestacado: "posibilidades",
    masBajada: "Una variedad de tipografías, colores y efectos: combinalos como quieras.",
    cta: "Crear mi invitación",
    tabs: {
      xv: "XV",
      boda: "Boda",
      evento: "Evento",
      personalizado: "Personalizado",
    },
  },
} as const;

export type Landing = ConCualquierTexto<typeof es>;

const en: Landing = {
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
  registrarse: "Sign up",
  ingresar: "Log in",
  cerrarSesion: "Log out",
  abrirMenu: "Open menu",
  cerrarMenu: "Close menu",
  accesosRapidos: "Quick links",
  hechoPara: "Made for weddings, birthdays, events and everything worth celebrating",

  nav: {
    inicio: "Home",
    whatsapp: "Hi, I'd like to know more about altainvitacion.com invitations",
  },

  hero: {
    prefijo: "We're not just a digital invitation. ",
    frase1: "We're a personal link for every guest.",
    frase2: "We're an invitation in real time.",
    frase3: "With LIVE your party comes alive.",
  },

  showcase: {
    kicker: "Designs",
    titulo: "A design for every celebration",
    bajada: "Weddings and quinceañeras, in all kinds of styles and colors. This is how your invitation looks on each guest's phone.",
    tituloIframe: "Template preview",
    evento: {
      boda: "Wedding",
      quince: "Quinceañera",
    },
    color: {
      verde: "Green",
      rojo: "Red",
      azul: "Blue",
      rosa: "Pink",
    },
  },

  collage: {
    kicker: "All in a single link",
    titulo: "This is your invitation",
    bajada: "Cover, countdown, location, RSVP, album and gifts — everything your guests need, at a glance.",
    alt: "Breakdown of the parts of an Alta Invitación digital invitation: cover, countdown, location, RSVP, photo album and gift registry",
  },

  strip: {
    kicker: "All in one",
    titulo: "Much more than an invitation",
    personalizable: {
      titulo: "100% customizable template",
      detalle: "Change colors, fonts, photos and layout. Wedding, quinceañera or corporate event, the design follows your style.",
    },
    gestion: {
      titulo: "Guests and payments in one place",
      detalle: "Get RSVPs instantly, manage access and set up your gift registry or bank account with no commission.",
    },
    live: {
      titulo: "With LIVE your party comes alive",
      detalle: "Your guests upload photos and leave messages from their phones during the party. It all goes up on the screen and stays as a keepsake.",
    },
  },

  caracteristicas: {
    kicker: "Included in your invitation",
    titulo: "Everything your invitation comes with",
    exclusiva: "Exclusive",
    enGratis: "Free",
    enPremium: "Premium",
    enDiamond: "Diamond",
    pagos: {
      titulo: "Who paid and who owes",
      detalle: "Track the ticket guest by guest: price per seat, exemptions and partial payments. They pay you directly; the app just keeps the count.",
    },
    live: {
      titulo: "LIVE mode",
      detalle: "Photos and messages from your guests, up on the screen during the party.",
    },
    mesas: {
      titulo: "Table planning",
      detalle: "Lay out the room, seat each family together and split the ones that don't fit at a single table. Every guest sees theirs in the invitation.",
    },
    ingreso: {
      titulo: "Door check-in",
      detalle: "Every invitation ends with a QR code. Scan it at the door to see who they are, how many are coming and which table to send them to.",
    },
    aperturas: {
      titulo: "Who opened the invitation",
      detalle: "See who got it and who's worth messaging again, instead of chasing everyone blindly on WhatsApp.",
    },
    rsvp: {
      titulo: "Guest RSVP",
      detalle: "Real-time RSVP: you know who's coming without having to ask.",
    },
    social: {
      titulo: "Social module",
      detalle: "Song requests for the DJ and messages from your guests.",
    },
    saveTheDate: {
      titulo: "Save the date",
      detalle: "Countdown and a button to add the date straight to Google Calendar.",
    },
    ubicacion: {
      titulo: "Location and directions",
      detalle: "Map, times and how to get to the ceremony and the party, all in one place.",
    },
    album: {
      titulo: "Photo album",
      detalle: "Share the couple's moments before the party and add the ones from the event.",
    },
    musica: {
      titulo: "Background music",
      detalle: "The invitation plays the song that's theirs.",
    },
    cronograma: {
      titulo: "Event schedule",
      detalle: "Reception, ceremony, dinner, dancing: your guests know what happens at each hour without having to ask.",
    },
  },

  pasos: {
    elegis: {
      n: "Pick",
      titulo: "A template for your event",
      detalle: "Wedding, birthday, christening or whatever you're celebrating: each one brings its own tone, typography and structure.",
    },
    personalizas: {
      n: "Customize",
      titulo: "Names, date, venue and message",
      detalle: "A step-by-step guided wizard. Live preview, exactly as each guest will see it on their phone.",
    },
    compartis: {
      n: "Share",
      titulo: "One link, ready to send",
      detalle: "RSVP, map and social module included. Watch the replies come in as they happen.",
    },
  },

  video: {
    kicker: "In minutes, not hours",
    titulo: "See how it works",
    bajada: "From the idea to your finished invitation, in minutes.",
    sinSoporte: "Your browser doesn't support HTML5 video.",
  },

  planes: {
    kicker: "Transparent pricing",
    titulo: "Choose the plan for your event",
    bajada: "Start completely free or unlock every feature with a single payment. No subscriptions, and up to {cuotas} interest-free instalments.",
    bajadaSinCuotas: "Start completely free, or unlock every feature with a single payment. No subscriptions.",
    cobroEnDolares: "* Approximate price. PayPal doesn't charge in your currency, so the payment is made in US dollars ({monto}) and your bank converts it.",
    porEvento: "/event",
    descuento: "{porcentaje}% OFF",
    cuotas: "or {cuotas} interest-free instalments of {monto}",
    recomendado: "Recommended",

    sin: {
      pagos: "No payment tracking",
      live: "No LIVE feature",
      liveDiamond: "No LIVE feature (Diamond only)",
      marcaAgua: "With the altainvitacion watermark",
      mesas: "The full seating plan is Premium",
      ingreso: "No door check-in",
      aperturas: "No way to see who opened the invitation",
    },

    gratis: {
      nombre: "Free",
      detalle: "Great for intimate events and for trying the platform.",
      cta: "Create a free account",
      personalizables: "Fully customizable invitations",
      rsvp: "RSVP management",
      invitados: "Up to {max} guests",
      album: "Photo album (up to {fotos} photos)",
      ingreso: "Door check-in: scan the QR at the entrance",
    },

    premium: {
      detalle: "Every interactive tool, with no guest limit.",
      cta: "Choose Premium",
      todoGratis: "Everything in Free, plus:",
      ilimitados: { titulo: "Unlimited guests", detalle: "and no restrictions" },
      album: { titulo: "Premium photo album", detalle: "(up to {fotos} photos)" },
      musica: "Background music, trivia and DJ song requests",
      mesas: {
        titulo: "Seating plan:",
        detalle: "lay out the whole venue and give every family its table, which each guest sees in their invitation",
      },
      pagos: {
        titulo: "Payment tracking:",
        detalle: "bank accounts for gifts and collecting card or ticket payments",
      },
    },

    diamond: {
      detalle: "Everything in Premium, plus LIVE mode and seeing who opened their invitation.",
      cta: "Choose Diamond",
      todoPremium: "Everything in Premium, plus:",
      live: {
        titulo: "LIVE interaction:",
        detalle: "photos up on the screen during your party (up to {fotos} photos)",
      },
      mesas: {
        titulo: "Table planning:",
        detalle: "lay out the room and seat each family, and every guest sees their table in the invitation",
      },
      ingreso: {
        titulo: "Door check-in:",
        detalle: "scan the QR at the door and see who arrived and which table they're at",
      },
      aperturas: {
        titulo: "Who opened the invitation:",
        detalle: "see who got it and who to message again",
      },
      sinMarca: {
        titulo: "No watermark:",
        detalle: "the invitation is yours, without our logo at the bottom",
      },
    },

    enterprise: {
      precio: "Custom pricing",
      detalle: "For companies or clients who need a template designed from scratch.",
      cta: "Talk to us",
      todoDiamond: "Everything in Diamond",
      diseno: "Fully bespoke template design",
      asesor: "A dedicated advisor",
      whatsapp: "Hi, I'm interested in the Alta Invitación Enterprise plan",
    },
  },

  faq: {
    kicker: "Frequently asked questions",
    titulo: "Got questions?",
    sinDiseno: {
      q: "Do I need design or coding skills to build my invitation?",
      a: "No. You pick a template and customize it with a step-by-step guided wizard: names, date, venue, photos and message. You see the preview live, exactly as each guest will see it on their phone, so there are no surprises at the end.",
    },
    proceso: {
      q: "What does the process look like, step by step?",
      a: "You pick a template for your event, customize it with your details and photos in the wizard while watching the preview in real time, and publish to share the link on WhatsApp, Instagram or wherever you like. No waiting, no forms to send to anyone else: you're in control of the whole process.",
    },
    editar: {
      q: "Can I edit my invitation after publishing it?",
      a: "Yes, you can go back to your dashboard and change text, photos, the date or any detail as many times as you need. If the venue or date changes, the link stays the same: your guests see the updated information automatically.",
    },
    compartir: {
      q: "How do I share my invitation with my guests?",
      a: "You get a unique, personal link for each guest or family. You send it one by one over WhatsApp, email or whatever you prefer. Because the link is personal, each person gets their own invitation to confirm their attendance.",
    },
    limite: {
      q: "Is there a guest limit?",
      a: "On the Free plan you can add up to 20 guests. On Premium and Diamond there's no limit: invite as many people as you want.",
    },
    planes: {
      q: "What's the difference between the Free, Premium and Diamond plans?",
      a: "The Free plan includes a fully customizable invitation, RSVP and an album of up to 5 photos for up to 20 guests: great for trying the platform or for intimate events. Premium adds unlimited guests, an album of up to 15 photos, background music, trivia, DJ song requests and payment tracking. Diamond adds LIVE mode, with photos up on the screen during the party.",
    },
    cambiarPlan: {
      q: "Can I change plans after I've started?",
      a: "Yes, you can start for free and move up at any time without losing anything you've already added.",
    },
    celular: {
      q: "Will my invitation look good on my guests' phones?",
      a: "Yes. Every template is designed mobile-first, because most of your guests will open it from WhatsApp on their phone. It looks right on tablet and desktop too.",
    },
    otrosEventos: {
      q: "Can I use Alta Invitación for an event other than a wedding?",
      a: "Yes, we have templates for weddings, quinceañeras, birthdays and other events, each with its own style, typography and structure.",
    },
    costoGratis: {
      q: "Does the Free plan cost anything?",
      a: "No, the Free plan is $0 per event, with no subscription and no card required. You only pay if you choose to unlock features with Premium or Diamond, and that's a one-time payment per event, never a recurring subscription.",
    },
    cantidadConfirmada: {
      q: "A guest already confirmed — can I still change how many people they're bringing?",
      a: "Yes. From \"Manage guests\" you can edit the number even after they've confirmed. If you raise it (say, from 3 to 5 people), the guest can open their link again and confirm up to the new number. If you lower it below what they had already confirmed, their answer resets automatically and they'll have to confirm again.",
    },
  },

  pie: {
    links: {
      plantillas: "Designs",
      asiEsTuInvitacion: "This is your invitation",
      preguntasFrecuentes: "FAQ",
    },
    arrepentimiento: {
      enlace: "Cancel my purchase",
      asunto: "Cancellation request",
      cuerpo: "Full name:\nEmail used to buy:\nPurchase date:\nPlan purchased:\nReason (optional):",
    },
  },

  modelos: {
    kicker: "Real invitations",
    tituloAntes: "See the invitation through the eyes of",
    tituloDestacado: "your guests",
    bajada: "Real invitations, with real names, venues, maps and dates — tap any of them to open it in full, exactly as each guest sees it.",
    vacio: "We're getting the samples ready. Come back soon to see real examples.",
    masAntes: "And a whole lot more",
    masDestacado: "possibilities",
    masBajada: "A range of fonts, colors and effects: mix them however you like.",
    cta: "Create my invitation",
    tabs: {
      xv: "XV",
      boda: "Wedding",
      evento: "Event",
      personalizado: "Custom",
    },
  },
};

const pt: Landing = {
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
  registrarse: "Criar conta",
  ingresar: "Entrar",
  cerrarSesion: "Sair",
  abrirMenu: "Abrir menu",
  cerrarMenu: "Fechar menu",
  accesosRapidos: "Atalhos",
  hechoPara: "Feito para casamentos, aniversários, eventos e tudo que se comemora",

  nav: {
    inicio: "Início",
    whatsapp: "Olá, quero saber mais sobre os convites do altainvitacion.com",
  },

  hero: {
    prefijo: "Não somos só um convite digital. ",
    frase1: "Somos um link pessoal para cada convidado.",
    frase2: "Somos um convite em tempo real.",
    frase3: "Com o LIVE sua festa se anima.",
  },

  showcase: {
    kicker: "Modelos",
    titulo: "Um design para cada comemoração",
    bajada: "Casamentos e 15 anos, em vários estilos e cores. É assim que seu convite aparece no celular de cada convidado.",
    tituloIframe: "Prévia dos modelos",
    evento: {
      boda: "Casamento",
      quince: "15 Anos",
    },
    color: {
      verde: "Verde",
      rojo: "Vermelho",
      azul: "Azul",
      rosa: "Rosa",
    },
  },

  collage: {
    kicker: "Tudo em um único link",
    titulo: "Assim é o seu convite",
    bajada: "Capa, contagem regressiva, local, RSVP, álbum e presentes — tudo o que seus convidados precisam, num relance.",
    alt: "Detalhe das partes de um convite digital da Alta Invitación: capa, contagem regressiva, local, RSVP, álbum de fotos e lista de presentes",
  },

  strip: {
    kicker: "Tudo em um só lugar",
    titulo: "Muito mais que um convite",
    personalizable: {
      titulo: "Modelo 100% personalizável",
      detalle: "Mude cores, fontes, fotos e estrutura. Seja um casamento, um 15 anos ou um evento corporativo, o design acompanha o seu estilo.",
    },
    gestion: {
      titulo: "Convidados e pagamentos",
      detalle: "Receba as confirmações na hora, controle os acessos e configure sua lista de presentes ou conta bancária sem comissões.",
    },
    live: {
      titulo: "Com o LIVE sua festa se anima",
      detalle: "Seus convidados sobem fotos e deixam mensagens pelo celular durante a festa. Tudo vai para o telão e fica guardado de lembrança.",
    },
  },

  caracteristicas: {
    kicker: "Incluído no seu convite",
    titulo: "Tudo o que o seu convite inclui",
    exclusiva: "Exclusiva",
    enGratis: "Grátis",
    enPremium: "Premium",
    enDiamond: "Diamond",
    pagos: {
      titulo: "Quem pagou e quem deve",
      detalle: "Acompanhe o valor convidado por convidado: preço por lugar, isenções e pagamentos parciais. Pagam direto para você; o app só faz a conta.",
    },
    live: {
      titulo: "Modo LIVE",
      detalle: "Fotos e mensagens dos seus convidados no telão, ao vivo, durante a festa.",
    },
    mesas: {
      titulo: "Organização das mesas",
      detalle: "Monte o salão, coloque cada família na sua mesa e divida as que não cabem em uma só. Cada convidado vê a dele no convite.",
    },
    ingreso: {
      titulo: "Controle de entrada",
      detalle: "Cada convite termina com um QR. Você escaneia na porta e vê quem são, quantos vieram e para qual mesa mandar.",
    },
    aperturas: {
      titulo: "Quem abriu o convite",
      detalle: "Saiba quem recebeu e para quem vale a pena escrever de novo, em vez de insistir às cegas no WhatsApp.",
    },
    rsvp: {
      titulo: "Confirmação de presença",
      detalle: "RSVP em tempo real: você sabe quem confirmou sem precisar perguntar.",
    },
    social: {
      titulo: "Módulo social",
      detalle: "Sugestões de músicas para o DJ e mensagens carinhosas dos convidados.",
    },
    saveTheDate: {
      titulo: "Save the date",
      detalle: "Contagem regressiva e botão para salvar a data direto no Google Agenda.",
    },
    ubicacion: {
      titulo: "Local e como chegar",
      detalle: "Mapa, horários e como chegar à cerimônia e à festa, tudo em um só lugar.",
    },
    album: {
      titulo: "Álbum de fotos",
      detalle: "Compartilhe os momentos do casal antes da festa e some os do evento.",
    },
    musica: {
      titulo: "Música de fundo",
      detalle: "O convite toca a música que é a cara do casal.",
    },
    cronograma: {
      titulo: "Programação do evento",
      detalle: "Recepção, cerimônia, jantar, festa: seus convidados sabem o que acontece a cada hora sem precisar perguntar.",
    },
  },

  pasos: {
    elegis: {
      n: "Escolha",
      titulo: "Um modelo para o seu evento",
      detalle: "Casamento, aniversário, batizado ou o que você estiver comemorando: cada um tem seu próprio tom, tipografia e estrutura.",
    },
    personalizas: {
      n: "Personalize",
      titulo: "Nomes, data, local e mensagem",
      detalle: "Um assistente guiado passo a passo. Prévia ao vivo, igual ao que cada convidado vai ver no celular.",
    },
    compartis: {
      n: "Compartilhe",
      titulo: "Um link, pronto para enviar",
      detalle: "RSVP, mapa e módulo social inclusos. Você acompanha as confirmações conforme vão chegando.",
    },
  },

  video: {
    kicker: "Em minutos, não em horas",
    titulo: "Veja como funciona",
    bajada: "Da ideia ao seu convite pronto, em minutos.",
    sinSoporte: "Seu navegador não suporta vídeo HTML5.",
  },

  planes: {
    kicker: "Preços transparentes",
    titulo: "Escolha o plano para o seu evento",
    bajada: "Comece de graça ou libere todos os recursos com um pagamento único. Sem assinaturas, e em até {cuotas} parcelas sem juros.",
    bajadaSinCuotas: "Comece totalmente grátis ou libere todos os recursos com um único pagamento. Sem assinaturas.",
    cobroEnDolares: "* Preço aproximado. O PayPal não cobra na sua moeda, então a cobrança é feita em dólares ({monto}) e seu banco converte.",
    porEvento: "/evento",
    descuento: "{porcentaje}% OFF",
    cuotas: "ou {cuotas} parcelas sem juros de {monto}",
    recomendado: "Recomendado",

    sin: {
      pagos: "Sem gestão de pagamentos",
      live: "Sem o recurso LIVE",
      liveDiamond: "Sem o recurso LIVE (exclusivo do Diamond)",
      marcaAgua: "Com marca d'água da altainvitacion",
      mesas: "O salão completo é do Premium",
      ingreso: "Sem controle de entrada",
      aperturas: "Sem ver quem abriu o convite",
    },

    gratis: {
      nombre: "Grátis",
      detalle: "Ideal para eventos íntimos e para testar a plataforma.",
      cta: "Criar conta grátis",
      personalizables: "Convites totalmente personalizáveis",
      rsvp: "Gestão de confirmações (RSVP)",
      invitados: "Até {max} convidados",
      album: "Álbum de fotos (até {fotos} fotos)",
      ingreso: "Controle de entrada: escaneia o QR na porta",
    },

    premium: {
      detalle: "Todas as ferramentas interativas, sem limite de convidados.",
      cta: "Escolher Premium",
      todoGratis: "Tudo do plano Grátis, mais:",
      ilimitados: { titulo: "Convidados ilimitados", detalle: "e sem restrições" },
      album: { titulo: "Álbum de fotos premium", detalle: "(até {fotos} fotos)" },
      musica: "Música de fundo, quiz e sugestões para o DJ",
      mesas: {
        titulo: "Organização de mesas:",
        detalle: "monte o salão inteiro e dê a cada família a sua mesa, que cada convidado vê no seu convite",
      },
      pagos: {
        titulo: "Gestão de pagamentos:",
        detalle: "contas bancárias para presentes e cobrança de convites/ingressos",
      },
    },

    diamond: {
      detalle: "Tudo do Premium, mais o Modo LIVE e saber quem abriu o convite.",
      cta: "Escolher Diamond",
      todoPremium: "Tudo do plano Premium, mais:",
      live: {
        titulo: "Interação LIVE:",
        detalle: "projeção de fotos ao vivo na sua festa (até {fotos} fotos)",
      },
      mesas: {
        titulo: "Organização das mesas:",
        detalle: "monte o salão e coloque cada família na sua mesa, e cada convidado vê a dele no convite",
      },
      ingreso: {
        titulo: "Controle de entrada:",
        detalle: "escaneie o QR na porta e veja quem chegou e para qual mesa vai",
      },
      aperturas: {
        titulo: "Quem abriu o convite:",
        detalle: "saiba quem recebeu e para quem escrever de novo",
      },
      sinMarca: {
        titulo: "Sem marca d'água:",
        detalle: "o convite é seu, sem o nosso logo no rodapé",
      },
    },

    enterprise: {
      precio: "Preço sob consulta",
      detalle: "Para empresas ou clientes que precisam de um modelo sob medida.",
      cta: "Falar com a gente",
      todoDiamond: "Tudo do Diamond",
      diseno: "Modelo 100% sob medida",
      asesor: "Consultor dedicado",
      whatsapp: "Olá, tenho interesse no plano Enterprise da Alta Invitación",
    },
  },

  faq: {
    kicker: "Perguntas frequentes",
    titulo: "Ficou com dúvida?",
    sinDiseno: {
      q: "Preciso saber de design ou programação para montar meu convite?",
      a: "Não. Você escolhe um modelo e personaliza com um assistente guiado passo a passo: nomes, data, local, fotos e mensagem. A prévia aparece ao vivo, igual ao que cada convidado vai ver no celular, então não tem surpresa no final.",
    },
    proceso: {
      q: "Como é o processo, passo a passo?",
      a: "Você escolhe um modelo de acordo com o seu evento, personaliza com seus dados e fotos no assistente vendo a prévia em tempo real, e publica para compartilhar o link por WhatsApp, Instagram ou o meio que preferir. Não há tempo de espera nem formulários para enviar a terceiros: você controla todo o processo.",
    },
    editar: {
      q: "Posso editar meu convite depois de publicado?",
      a: "Sim, você pode voltar ao seu painel e alterar textos, fotos, data ou qualquer dado quantas vezes precisar. Se o local ou a data mudar, o link não muda: seus convidados veem a informação atualizada automaticamente.",
    },
    compartir: {
      q: "Como compartilho meu convite com os convidados?",
      a: "Você gera um link único e personalizado para cada convidado ou família. Envia individualmente (um a um) por WhatsApp, e-mail ou o meio que preferir. Como o link é pessoal, cada pessoa recebe o próprio convite para confirmar a presença.",
    },
    limite: {
      q: "Existe limite de convidados?",
      a: "No plano Grátis você pode cadastrar até 20 convidados. No Premium e no Diamond não há limite: convide quantas pessoas quiser, sem restrições.",
    },
    planes: {
      q: "Qual é a diferença entre os planos Grátis, Premium e Diamond?",
      a: "O plano Grátis inclui convite totalmente personalizável, RSVP e álbum de até 5 fotos para até 20 convidados: ideal para testar a plataforma ou para eventos íntimos. O Premium soma convidados ilimitados, álbum de até 15 fotos, música de fundo, quiz, sugestões para o DJ e gestão de pagamentos. O Diamond acrescenta o Modo LIVE, com projeção de fotos ao vivo durante a festa.",
    },
    cambiarPlan: {
      q: "Posso mudar de plano depois de começar?",
      a: "Sim, você pode começar grátis e subir de plano a qualquer momento sem perder o que já cadastrou.",
    },
    celular: {
      q: "Meu convite vai ficar bom no celular dos meus convidados?",
      a: "Sim. Cada modelo é pensado mobile-first, porque a grande maioria dos seus convidados vai abrir pelo WhatsApp no celular. Também fica certinho no tablet e no computador.",
    },
    otrosEventos: {
      q: "Posso usar a Alta Invitación para outro evento além de casamento?",
      a: "Sim, temos modelos para casamentos, 15 anos, aniversários e outros eventos, cada um com estilo, tipografia e estrutura próprios.",
    },
    costoGratis: {
      q: "Tem algum custo para usar o plano Grátis?",
      a: "Não, o plano Grátis é $0 por evento, sem assinatura e sem precisar de cartão. Você só paga se quiser liberar recursos com o Premium ou o Diamond, e é um pagamento único por evento, nunca uma assinatura recorrente.",
    },
    cantidadConfirmada: {
      q: "Um convidado já confirmou presença, posso mudar a quantidade depois?",
      a: "Sim. Em \"Gerenciar convidados\" você pode editar a quantidade mesmo que ele já tenha confirmado. Se aumentar (por exemplo, de 3 para 5 pessoas), o convidado pode entrar no link dele e confirmar até essa nova quantidade. Se reduzir abaixo do que ele já havia confirmado, a resposta é reiniciada automaticamente e ele vai ter que confirmar de novo.",
    },
  },

  pie: {
    links: {
      plantillas: "Modelos",
      asiEsTuInvitacion: "Assim é o seu convite",
      preguntasFrecuentes: "Perguntas frequentes",
    },
    arrepentimiento: {
      enlace: "Botão de arrependimento",
      asunto: "Botão de arrependimento",
      cuerpo: "Nome completo:\nE-mail da compra:\nData da compra:\nPlano contratado:\nMotivo (opcional):",
    },
  },

  modelos: {
    kicker: "Modelos reais",
    tituloAntes: "Veja o convite pelos olhos de",
    tituloDestacado: "seus convidados",
    bajada: "Convites reais, com nome, salão, mapa e data de verdade — toque em qualquer um para abrir completo, igual ao que cada convidado vê.",
    vacio: "Estamos preparando os modelos. Volte em breve para ver exemplos reais.",
    masAntes: "E muito mais",
    masDestacado: "possibilidades",
    masBajada: "Uma variedade de tipografias, cores e efeitos: combine como quiser.",
    cta: "Criar meu convite",
    tabs: {
      xv: "XV",
      boda: "Casamento",
      evento: "Evento",
      personalizado: "Personalizado",
    },
  },
};

export const landing = { es, en, pt };
