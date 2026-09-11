import type { ConCualquierTexto } from "./forma";

/** El armador de invitaciones: los pasos, sus campos y sus avisos. */
const es = {
    pasoDe: "Paso {actual} de {total}",
    guardarYSalir: "Guardar y salir",
    vistaPrevia: "Vista previa",
    entendido: "Entendido",
    elegiTuPais: "Elige tu país",
    paisAyuda: "Con esto sabemos qué medios de pago y qué datos bancarios mostrar.",

    /**
     * Los nombres de los pasos, tal como se ven en la barra de progreso.
     *
     * Son sólo para mostrar: el paso se identifica adentro por su `label`
     * en inglés-neutro de wizard-steps-config.ts, que no se traduce porque
     * EditWizardContainer.tsx y WizardLivePreview.tsx lo comparan por texto.
     */
    pasos: {
        tipoDeEvento: "Tipo de Evento",
        plantilla: "Plantilla",
        recorrido: "Recorrido",
        portada: "Portada",
        tipografia: "Tipografía",
        informacionBasica: "Información Básica",
        countdown: "Countdown",
        frase: "Frase",
        ceremonia: "Ceremonia / Civil",
        detallesSalon: "Detalles del Salón",
        cronograma: "Cronograma",
        galeria: "Galería",
        album: "Álbum",
        musica: "Música",
        regalo: "Regalo (CBU)",
        trivia: "Trivia",
        infoAdicional: "Info Adicional",
    },

    /** La cabecera del wizard y la fila de botones que se repite en cada paso. */
    nav: {
        paso: "PASO {numero}",
        creaTuInvitacion: "Crea tu invitación",
        atras: "Atrás",
        siguientePaso: "Siguiente Paso",
        aplicarCambios: "Aplicar cambios",
        crearInvitacion: "Crear Invitación",
        creando: "Creando…",
        salir: "Salir",
        verCambios: "Ver cambios",
        avisoCambiosTitulo: "Cambios sin guardar",
        avisoCambiosTexto:
            "Tienes cambios sin guardar en la invitación. ¿Estás seguro de que quieres salir sin aplicar los cambios?",
        avisoSalirTitulo: "¿Salir sin terminar?",
        avisoSalirTexto:
            "Todavía no creaste la invitación. Si sales ahora vas a perder todo lo que cargaste hasta aquí.",
        salirSinGuardar: "Salir sin guardar",
        salirYPerder: "Salir y perder los cambios",
    },

    /** Avisos de plan que aparecen igual en varios pasos. */
    plan: {
        disponibleEnPremium: "Disponible en Premium",
        soloPremiumODiamond: "Solo en Premium o Diamond",
        modoAdmin: "Modo Administrador:",
    },

    tipoEvento: {
        titulo: "¿Qué tipo de evento estás organizando?",
        subtitulo: "Elige la categoría para ver las plantillas ideales.",
        bloqueadoEtiqueta: "Tipo de evento:",
        bloqueadoAviso: "No se puede cambiar después de creada",
        casamiento: "Casamiento",
        quince: "15 Años",
        otro: "Evento",
        tituloInvitacion: "Título de la Invitación",
        personalizado: "Personalizado",
        casamiento1: "Nuestra Boda",
        casamiento2: "Nos Casamos",
        casamiento3: "¡Nos Casamos!",
        quince1: "Mis 15 Años",
        quince2: "Mis Quince",
        quince3: "¡Mis 15!",
        placeholderCasamiento: "Ej: Nuestra Boda",
        placeholderQuince: "Ej: Mis 15 Años",
        placeholderOtro: "Ej: Mi Cumpleaños, Mi Bautismo, etc.",
        ayudaTitulo: "Este es el título general que aparecerá en la invitación.",
        ayudaTituloQuince:
            "Este es el título general de la invitación. Tu nombre lo vas a cargar en el siguiente campo.",
        nombreNovia: "Nombre Novia",
        nombreNovio: "Nombre Novio",
        placeholderNombre: "Nombre",
        nombreQuinceanera: "Nombre o Apodo de la Quinceañera",
        placeholderQuinceanera: "Ej: Sofi, Valentina, Mafe…",
        ayudaQuinceanera:
            "Ingresa el nombre o apodo de la quinceañera que aparecerá destacado en toda la tarjeta.",
        nombreFestejado: "Nombre del Festejado/a (Opcional)",
        placeholderFestejado: "Nombre de la persona o empresa",
        ayudaFestejado: "Si lo dejas vacío, se usa el nombre del evento.",
        errorNovia: "El nombre de la novia es obligatorio",
        errorNovio: "El nombre del novio es obligatorio",
        errorQuinceanera: "El nombre o apodo de la quinceañera es obligatorio",
    },

    basicos: {
        titulo: "Información Básica",
        subtitulo: "Contanos los detalles principales del evento.",
        infoTitulo: "¿Para qué sirve la Información Básica?",
        infoTexto:
            "Esta información establece los cimientos de tu invitación: el nombre del evento, la fecha de celebración y los nombres de los agasajados. Con estos datos se calcula la cuenta regresiva, se encabeza la portada y se organiza la agenda de tus invitados.",
        fecha: "Fecha del Evento",
        elegirFecha: "Elige una fecha",
        desbloqueadoAdmin: "Desbloqueado (Admin)",
        bloqueada30d: "Bloqueada (30d)",
        fechaBloqueadaTexto:
            "Fecha bloqueada por seguridad. Faltan 30 días o menos para la fecha del evento.",
        fechaAdminTexto:
            "👑 Habilitado por rol Administrador: tienes permiso para editar la fecha aunque falten menos de 30 días.",
        ciudad: "Ciudad / Localidad del Evento",
        ciudadPlaceholder: "Ej: Buenos Aires, Rosario, Mendoza…",
        ciudadAyuda: "Aparece junto a la fecha en la tarjeta de bienvenida de tus invitados.",
        idioma: "Idioma de la invitación",
        idiomaAyuda: "En este idioma la van a ver tus invitados, sin importar el idioma de su celular. Lo que escribas tú —nombres, dirección, tu mensaje— va tal cual, sin traducir.",
    },

    plantilla: {
        titulo: "Elige tu Plantilla",
        subtituloDiseno: "Elige el estilo y la gama de colores para tu invitación",
        subtituloOtro: "Elige el estilo que mejor represente tu evento",
        coleccionFlat: "Colección Flat",
        coleccionStorytelling: "Colección Storytelling",
        nuevas: "Nuevas",
        plantillaActual: "Plantilla actual",
        sinPlantilla: "Todavía no elegiste una plantilla",
        verModelosFlat: "Ver Modelos Flat",
        verModelosStorytelling: "Ver Modelos Storytelling",
        imagenCelebremos: "Imagen “Celebremos Juntos”",
        soloParallax: "(Solo para Parallax)",
        ayudaParallax:
            "Esta imagen aparece en la mitad derecha de la pantalla con efecto parallax.",
    },

    modalPlantillas: {
        titulo: "Elige tu plantilla",
        anteriores: "Ver plantillas anteriores",
        siguientes: "Ver más plantillas",
        tituloIframe: "Vista previa de la plantilla",
        pie: "Vista previa real con contenido de ejemplo. Tus fotos y datos se van a ver así de organizados.",
        elegir: "Elegir esta plantilla",
    },

    portadaFotos: {
        titulo: "Fotos de Portada y Fondo",
        subtitulo: "Imágenes de fondo principales que visten la presentación de tu tarjeta.",
        infoTitulo: "¿Para qué sirven las Fotos de Portada y Fondo?",
        infoStorytelling:
            "El Recorte celular y el Recorte PC son opcionales. Si cargas alguno, reemplaza el fondo decorativo original -- tanto en la tapa como en la foto principal que se ve dentro de la invitación, debajo de “Guarda la fecha” (son las mismas 2 fotos en los dos lugares). Si no cargas ninguno, no aparece foto de fondo en ningún lado: la invitación se ve tal cual la plantilla que elegiste, sin cambios.",
        infoFlat:
            "La Portada Invitación es la que se ve como foto de portada de la invitación (obligatoria, todas las plantillas la usan). La Portada de bienvenida es opcional: si cargas una foto ahí, reemplaza el fondo original de la portada de bienvenida por esa foto. Si la dejas vacía, la portada se ve tal cual la plantilla que elegiste, sin cambios.",
        recortePc: "Recorte PC",
        portadaBienvenida: "Portada de bienvenida",
        recorteCelular: "Recorte celular",
        portadaInvitacion: "Portada Invitación *",
        ayudaPcStorytelling:
            "Opcional. Si la cargas, reemplaza el fondo decorativo original en pantallas anchas -- tanto en la tapa como en la foto principal de adentro de la invitación.",
        ayudaPcFlat:
            "Si cargas una foto aquí, reemplaza el fondo original de la portada de bienvenida por esta foto.",
        ayudaCelularStorytelling:
            "Opcional. Si la cargas, reemplaza el fondo decorativo original en mobile -- tanto en la tapa como en la foto principal de adentro de la invitación, debajo de “Guarda la fecha”.",
        ayudaCelularFlat:
            "Se ve como foto de portada de la invitación. Obligatoria: todas las plantillas la usan como imagen principal.",
        tipCinematico:
            "Prueba los dos: con foto (efecto cinemático) y sin foto (fondo decorativo propio de la plantilla).",
        obligatoria: "Esta imagen es obligatoria para poder continuar.",
        faltaImagen: "Carga la imagen de portada mobile antes de continuar.",
    },

    recorrido: {
        etiqueta: "Recorrido",
        titulo: "¿Cómo se recorre el lugar?",
        subtitulo:
            "Los paneles del salón, cómo llegar y la ubicación se ven igual en los dos casos. Lo que cambia es hacia dónde avanzan cuando el invitado scrollea.",
        zigzagTitulo: "En zigzag",
        zigzagDetalle: "Se baja, los paneles del lugar pasan de costado, y se sigue bajando.",
        abajoTitulo: "Hacia abajo",
        abajoDetalle: "Los paneles van uno abajo del otro, como el resto de la invitación.",
    },

    tipografia: {
        etiqueta: "Tipografía",
        titulo: "Elige la tipografía",
        subtitulo: "Define el carácter visual de tu invitación. La puedes cambiar después.",
        titulos: "Títulos",
        texto: "Texto",
        verMas: "Ver más tipografías",
        modalTitulos: "Elige la tipografía de los Títulos",
        modalTitulosDesc: "Todas las tipografías disponibles para tus títulos.",
        modalTexto: "Elige la tipografía del Texto",
        modalTextoDesc: "Todas las tipografías disponibles para tus textos.",
        muestraTexto: "Abrir invitación",
        muestraNombre: "María",
        muestraQuince: "Mis 15 Años",
        muestraEvento: "Nombre del Evento",
    },

    countdown: {
        etiqueta: "Countdown",
        titulo: "Elige el estilo de la cuenta regresiva",
        subtitulo: "Así se va a ver el countdown en tu invitación pública.",
        clasico: "Clásico",
        clasicoDetalle: "Bloques con número grande",
        minimalista: "Minimalista",
        minimalistaDetalle: "Solo los días, en una línea",
        capsulas: "Cápsulas",
        capsulasDetalle: "Dígitos en píldoras de color",
        flip: "Flip / Separado",
        flipDetalle: "Tarjetas con separador “:”",
        diasRestantes: "días restantes",
        dias: "Días",
        horas: "Hs",
        minutos: "Min",
    },

    frase: {
        titulo: "Frase Personalizada",
        ayudaCasamiento: "Una frase que refleje la historia de ustedes dos.",
        ayudaQuince: "Una frase que la quinceañera quiera compartir.",
        ayudaOtro: "Una frase institucional o de bienvenida para el evento.",
        placeholderCasamiento: "Ej: “Lo mejor de la vida es compartirla con quien amás…”",
        placeholderQuince: "Ej: “Este es el comienzo del resto de mi vida…”",
        placeholderOtro: "Ej: “Bienvenidos a nuestra celebración. Gracias por estar aquí.”",
        infoTitulo: "¿Cómo se muestra la Frase Personalizada?",
        infoTexto:
            "Esta frase o poema se despliega como cita destacada en el cuerpo de la invitación. Puedes redactar tu propio mensaje o elegir una de nuestras sugerencias listas para usar.",
        habilitar: "Habilitar Frase Personalizada",
        elegiOEscribi: "Elige una frase o escribe la tuya:",
        escribirPropia: "Escribir mi propia frase…",
        tuFrase: "Tu Frase Personalizada",
        casamiento1:
            "El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección.",
        casamiento2: "Unimos nuestras vidas para siempre, porque juntos todo es mejor.",
        casamiento3: "Donde hay amor, hay vida. ¡Y queremos celebrar la nuestra contigo!",
        casamiento4: "Lo mejor de la vida es compartirla con quien amás… y con quienes te aman.",
        casamiento5: "Hoy comienza la mejor de nuestras aventuras.",
        quince1: "Este es el comienzo del resto de mi vida. ¡Gracias por acompañarme!",
        quince2: "Hay momentos inolvidables que se atesoran en el corazón para siempre.",
        quince3: "Dejo atrás mi niñez para comenzar a vivir mis sueños.",
        quince4: "Celebro la magia de crecer, rodeada del amor de mi familia y amigos.",
        quince5: "Una noche mágica, un recuerdo eterno. ¡Acompañame a festejar mis 15!",
    },

    salon: {
        titulo: "Detalles de la Fiesta",
        subtitulo: "¿Dónde y a qué hora es la celebración?",
        infoTitulo: "¿Cómo configurar la Ubicación del Salón?",
        infoTexto:
            "Ingresa el nombre del salón o quinta, la dirección física y el enlace a Google Maps. Tus invitados van a tener un botón interactivo “Cómo llegar” que abre la ubicación directamente en el GPS de su celular.",
        lugarNombre: "Nombre del Lugar / Salón",
        lugarPlaceholder: "Ej: Salón Los Olivos",
        excesoNombre: "Te pasaste por {cantidad} caracteres -- acortá el nombre para poder continuar.",
        direccion: "Dirección Completa",
        direccionPlaceholder: "Calle 123, Ciudad",
        excesoDireccion:
            "Te pasaste por {cantidad} caracteres -- acortá la dirección para poder continuar.",
        horario: "Horario",
        mapa: "Enlace Google Maps (Opcional)",
        mapaPlaceholder: "Pega el link que copiaste de Google Maps",
        mapaAyuda: "Vale cualquier link de Google Maps (el de “Compartir” o el de la barra de direcciones).",
        vestimenta: "Código de Vestimenta",
        vestimentaAyuda: "Se muestra en la portada de bienvenida de forma sobria.",
        vestimentaOpciones: "Opciones de Vestimenta",
        vestimenta1: "Elegante",
        vestimenta2: "Elegante Sport",
        vestimenta3: "Casual",
        vestimenta4: "Formal",
        vestimenta5: "De Gala",
        vestimentaPersonalizado: "Personalizado…",
        vestimentaEspecifica: "Especificá tu Dress Code",
        vestimentaPlaceholder: "Ej: Total White, Disfraz, etc.",
    },

    ceremonia: {
        titulo: "Ceremonia Religiosa / Civil",
        subtitulo:
            "Si la ceremonia o el matrimonio civil es en una ubicación o fecha/hora distinta al salón de fiesta, activá esta sección.",
        infoTitulo: "¿Cuándo activar la sección de Ceremonia?",
        infoTexto:
            "Activá esta sección únicamente si la misa, bendición de anillos o firma en el registro civil ocurre en una ubicación, iglesia o templo distinto del salón donde es la fiesta principal. Vas a poder ingresar la dirección, el horario propio y el mapa interactivo.",
        activar: "¿Agregar ubicación de Iglesia / Civil?",
        activarAyuda: "(Opcional - Activalo si la ceremonia es en otro lugar)",
        tituloSeccion: "Título de la Sección",
        tituloSeccionPlaceholder: "Ej: Ceremonia Religiosa, Registro Civil, Boda",
        nombreLugar: "Nombre de la Iglesia / Registro Civil / Lugar",
        nombreLugarPlaceholder: "Ej: Parroquia Nuestra Señora del Carmen",
        direccion: "Dirección",
        direccionPlaceholder: "Ej: Av. Santa Fe 1234",
        hora: "Horario de la Ceremonia",
        errorNombre: "El nombre del lugar es obligatorio",
        errorDireccion: "La dirección es obligatoria",
        errorHora: "El horario es obligatorio",
    },

    cronograma: {
        titulo: "Cronograma del Evento",
        opcional: "(Opcional)",
        subtitulo: "Definí los momentos principales de tu celebración",
        infoTitulo: "¿Cómo funciona el Cronograma?",
        infoTexto:
            "El cronograma organiza y comunica las distintas etapas de tu fiesta (ej: Recepción, Cena, Brindis, Baile). Puedes personalizar los horarios, editar los títulos e íconos de cada momento, agregar nuevas etapas o eliminar las que no necesites.",
        etapa: "Etapa #{numero}",
        hora: "Hora",
        actividad: "Actividad / Momento",
        actividadPlaceholder: "Ej: Recepción / Cena",
        etapaIncompleta: "Completa la hora y el título de esta etapa, o eliminala.",
        agregar: "Agregar Etapa al Cronograma",
        faltanDatos:
            "Completa la hora y el título de todas las etapas del cronograma antes de continuar.",
        errorHoraTitulo: "La primera etapa empieza antes que el evento",
        errorHoraTexto:
            "Tu evento empieza a las {hora}, pero la primera etapa del cronograma ({etapa}) está cargada a las {horaEtapa}, antes de esa hora.",
        errorHoraAyuda:
            "Revisa el horario del evento en el paso “Detalles de la Fiesta”, o ajustá la hora de esta etapa para que no sea anterior al inicio del evento.",
    },

    galeria: {
        titulo: "Galería de Fotos",
        subtitulo: "Sube tus mejores fotos para lucir en la invitación.",
        infoTitulo: "¿Cómo funciona la Galería de Fotos?",
        infoTexto:
            "Las fotos que subas aquí arman un carrusel interactivo continuo en la tarjeta. Conviene subir fotos en formato cuadrado u horizontal para que se vean bien en celulares.",
        mostrar: "Mostrar galería de fotos en la tarjeta",
        avisoTitulo: "Importante sobre la selección de fotos",
        avisoTexto:
            "Las fotos se seleccionan una a una. Al subir cada imagen, el sistema te deja ajustar y elegir el encuadre exacto en formato cuadrado (1:1) para que se adapte perfecto al carrusel.",
        avisoAnonimo:
            "Puedes cargar hasta {max} fotos para probar (Premium o Diamond). Si al crear tu cuenta eliges Gratis, la invitación va a mostrar solo las primeras {gratis}.",
        agregarFoto: "Agregar nueva foto (de a una)",
        limiteAlcanzado: "Llegaste al límite de fotos de tu plan",
        sinFotos:
            "Sube al menos una foto o destildá “Mostrar galería de fotos” para continuar.",
        fotosAgregadas: "Fotos agregadas ({cantidad})",
        fotosAgregadasDeMax: "Fotos agregadas ({cantidad}/{max})",
        premiumODiamond: "Premium o Diamond",
        eliminarFoto: "Eliminar foto",
        altFoto: "Foto {numero}",
        limiteTitulo: "Llegaste al límite de fotos",
        limiteAnonimo:
            "Puedes cargar hasta {max} fotos para probar (Premium o Diamond). Acuérdate de que si eliges Gratis al crear tu cuenta, la invitación va a mostrar solo las primeras {gratis}.",
        limitePlan:
            "Tu plan {plan} permite hasta {max} fotos en el álbum. Actualiza tu plan para agregar más.",
    },

    album: {
        etiqueta: "Álbum",
        titulo: "Elige el estilo del álbum de fotos",
        subtitulo:
            "Así se van a ver las fotos que cargaste en la Galería, dentro de tu invitación pública.",
        carrusel: "Carrusel",
        carruselDetalle: "Fotos deslizando en una tira horizontal",
        solapadas: "Solapadas",
        solapadasDetalle: "Fotos apiladas, con marco y sombra",
        polaroid: "Carrusel Polaroid",
        polaroidDetalle: "Carrusel con cada foto enmarcada tipo instantánea",
        avisoSolapadas:
            "Este estilo muestra hasta 8 fotos de tu Galería, repartidas en dos bloques a lo largo de la invitación (pensado para una selección destacada, no para el álbum completo).",
    },

    musica: {
        titulo: "Música de Fondo",
        subtitulo: "Agrega música para que suene mientras ven la invitación",
        modoAdminTexto:
            "Esta invitación está en Plan Gratis (bloqueada para el cliente), pero tienes permiso de Admin para editar/activar la música.",
        activar: "Activar música de fondo",
        archivo: "Archivo de Audio",
        autoplay: "Reproducir automáticamente",
        sugerenciasTitulo: "Sugerencia de Canciones",
        sugerenciasSubtitulo: "Permití que tus invitados te sugieran temas para la fiesta",
        infoTitulo: "¿Para qué sirven las sugerencias de música?",
        infoTexto:
            "Todas las canciones que tus invitados sugieran desde la tarjeta digital quedan guardadas en tu panel. Vas a poder exportar o compartir ese listado directamente con el salón de fiestas o el DJ del evento para que arme la playlist con los temas más pedidos.",
        activarSugerencias: "Activar sugerencia de música",
    },

    banco: {
        titulo: "Datos Bancarios (Regalos y Tarjetas)",
        subtitulo:
            "Configura tus datos de transferencia para regalos del evento y/o cobro de entradas. Te pedimos los datos que se usan en {pais}.",
        infoTitulo: "¿Por qué puedes configurar hasta 2 Cuentas Bancarias?",
        infoTexto1:
            "En muchos eventos (casamientos o fiestas de 15) hace falta separar la cuenta para el pago de la tarjeta / catering (que va al salón o tarjetero) de la cuenta personal para regalos.",
        infoTexto2:
            "Además, en fiestas de 15 las billeteras virtuales juveniles (ej: Mercado Pago o Ualá) suelen tener límites mensuales de recepción de dinero. Con dos cuentas evitás superar esos límites o mezclar las finanzas.",
        infoTexto3:
            "💡 Si activás una sola cuenta, la tarjeta muestra de forma unificada que esa cuenta se usa tanto para regalos como para pagos.",
        avisoTitulo: "¡ADVERTENCIA DE SEGURIDAD IMPORTANTE SOBRE TUS DATOS BANCARIOS!",
        avisoTexto:
            "Verificá cuidadosamente cada dato de tu cuenta ({campos}) antes de guardar. Un error de tipeo puede hacer que las transferencias de tus invitados vayan a una cuenta incorrecta o se pierdan de forma irreversible.",
        avisoLegal:
            "⚠️ La plataforma no se hace responsable por la pérdida de fondos ocasionada por errores de tipeo en la carga de datos bancarios.",
        modoAdminTexto:
            "Esta invitación está en Plan Gratis (bloqueada para el cliente), pero tienes permiso de Admin para editar/activar las cuentas bancarias.",
        seccionRegalo: "1. Cuenta para Regalos del Evento",
        seccionRegaloAyuda:
            "Datos de transferencia para que tus invitados te hagan un regalo voluntario",
        seccionTarjeta: "2. Cuenta para Pago de Tarjetas / Pases",
        seccionTarjetaAyuda:
            "Datos de transferencia destinados a saldar la tarjeta de invitación o pase del evento",
        tituloSeccion: "Título de la Sección",
        personalizado: "Personalizado",
        tituloPersonalizadoPlaceholder: "Escribe un título personalizado",
        regaloTitulo1: "Regalo",
        regaloTitulo2: "Mesa de Regalos",
        regaloTitulo3: "Colaboración",
        tarjetaTitulo1: "Pago de Tarjetas",
        tarjetaTitulo2: "Pago de Invitaciones",
        tarjetaTitulo3: "Entrada al Evento",
        banco: "Banco / Billetera Virtual",
        bancoPlaceholderRegalo: "Ej: Mercado Pago / Banco Galicia",
        bancoPlaceholderTarjeta: "Ej: Banco BBVA / Mercado Pago",
        opcional: "(opcional)",
        elegiOpcion: "Elige una opción",
        alMenosUno: "Carga al menos uno de estos datos: {campos}.",
        titular: "Titular de la Cuenta",
        titularPlaceholderRegalo: "Ej: María Pérez",
        titularPlaceholderTarjeta: "Ej: Salón Los Olivos",
        titularObligatorio: "El titular es obligatorio.",
        tarifas: "Tarifas por Categoría de Invitado ({simbolo} {codigo})",
        valorAdulto: "1. Valor de la Tarjeta por ADULTO ({simbolo} {codigo})",
        valorAdultoObligatorio: "El valor por adulto es obligatorio si vas a cobrar la tarjeta.",
        tarifaAdolescente: "2. Tarifa diferenciada para ADOLESCENTES",
        tarifaAdolescenteAyuda: "Permite ingresar un valor específico para jóvenes / adolescentes",
        tarifaNino: "3. Tarifa diferenciada para NIÑOS",
        tarifaNinoAyuda: "Permite ingresar un valor específico para niños de menor edad",
        revisarDatos:
            "Revisa los datos bancarios: hay campos obligatorios o con un formato inválido.",
    },

    trivia: {
        titulo: "Quiz / Trivia",
        subtitulo:
            "Crea un juego divertido para que tus invitados demuestren cuánto conocen a {sujeto}",
        infoTitulo: "¿Cómo funciona el Quiz o Juego de Trivia?",
        infoTexto:
            "El juego de Trivia les permite a tus invitados responder preguntas divertidas sobre {sujeto} directamente desde la tarjeta digital. Puedes cargar preguntas con opciones múltiples, marcar la respuesta correcta y desafiar a tus amigos y familiares a demostrar cuánto los conocen durante la fiesta.",
        sujetoPareja: "la pareja",
        sujetoQuinceanera: "la quinceañera",
        sujetoAgasajado: "el agasajado",
        modoAdminTexto:
            "Esta función está en Plan Gratis para el cliente, pero tienes permiso de Admin para activarla y cargar preguntas.",
        activar: "Activar Quiz/Trivia",
        tituloCampo: "Título",
        casamiento1: "¿Cuánto Nos Conocés?",
        casamiento2: "Trivia de los Novios",
        casamiento3: "¿Qué Tanto Sabes de Nosotros?",
        quince1: "¿Cuánto Me Conocés?",
        quince2: "Trivia de mis 15",
        quince3: "¿Qué Tanto Sabes de Mí?",
        otro1: "Trivia del Festejo",
        otro2: "¿Cuánto Sabes?",
        otro3: "Pon a Prueba tu Memoria",
        personalizado: "Personalizado",
        tituloPlaceholder: "Escribe un título personalizado",
        preguntasAgregadas: "Preguntas agregadas ({cantidad})",
        agregarNueva: "Agregar nueva pregunta",
        pregunta: "Pregunta",
        preguntaPlaceholder: "¿Cuál es el lugar favorito de la quinceañera?",
        opciones: "Opciones de respuesta",
        opcionPlaceholder: "Opción {letra}",
        correcta: "Correcta",
        pendienteAviso:
            "Esta pregunta está a medio completar. Completa la pregunta y las 4 opciones, o borrá el texto para descartarla, antes de continuar.",
        agregarYOtra: "Agregar y cargar otra",
        listoCerrar: "Listo, cerrar",
        avisoAgregada: "Pregunta agregada.",
        avisoCompletar: "Tienes que completar la pregunta y todas las opciones.",
        avisoPendienteEditar:
            "Tienes una pregunta a medio completar en el formulario. Completala o borrá el texto antes de editar otra.",
        avisoPendiente:
            "Tienes una pregunta a medio completar: escribe la pregunta y las 4 opciones, o borrá el texto para descartarla.",
        avisoGuardada: "Pregunta guardada.",
        avisoUltima: "Se agregó tu última pregunta antes de continuar.",
        avisoSinPreguntas: "Agrega al menos una pregunta a la Trivia, o deshabilitá la sección.",
    },

    infoAdicional: {
        titulo: "¿Qué necesitas que sepan tus invitados?",
        subtitulo:
            "Datos prácticos como alojamiento, estacionamiento o transporte -- aparecen en un botón aparte dentro de la invitación, así no se mezclan con el resto del contenido.",
        interruptor: "Mostrar esta sección en la invitación",
        interruptorAyuda:
            "Es el interruptor general: si está apagado, el botón “¿Qué necesitas saber?” no aparece aunque hayas cargado información abajo -- puedes dejar todo preparado y activarlo cuando quieras.",
        alojamiento: "Alojamiento",
        alojamientoDetalle: "Hoteles o alojamientos recomendados cerca del evento",
        alojamientoPlaceholder:
            "Ej: Hotel Los Álamos, a 5 min del salón. Mencioná “Casamiento [apellido]” para la tarifa preferencial.",
        estacionamiento: "Estacionamiento",
        estacionamientoDetalle: "Dónde estacionar y si el lugar tiene cochera propia",
        estacionamientoPlaceholder:
            "Ej: El salón cuenta con cochera propia gratuita para los invitados.",
        transporte: "Transporte",
        transporteDetalle: "Traslados organizados, remises recomendados, etc.",
        transportePlaceholder:
            "Ej: Vamos a organizar un traslado en combi desde la iglesia hasta el salón, saliendo a las 20:30.",
        adicional: "Datos Adicionales",
        adicionalDetalle: "Cualquier otra cosa que tus invitados necesiten saber",
        adicionalPlaceholder:
            "Ej: El evento es al aire libre, te recomendamos llevar un abrigo liviano para la noche.",
        textoInvitados: "Texto que van a ver tus invitados",
        exceso: "Te pasaste por {cantidad} caracteres -- acortá el texto para poder continuar.",
        faltaTexto: "Completa el texto de las secciones que activaste, o desactivalas.",
        avisoExceso: "El texto de “{seccion}” se pasó del límite -- acortalo para poder continuar.",
        errorCrear: "Error al crear la invitación: {mensaje}",
        errorDesconocido: "Error desconocido",
        errorPago: "Error al iniciar el pago",
    },

    limitePlan: {
        titulo: "Llegaste al límite del plan Gratis",
        descripcion:
            "Ya tienes una invitación Gratis activa -- elige Premium o Diamond para crear esta.",
        confirmarTitulo: "Confirmar uso de crédito {plan}",
        confirmarUno:
            "Tienes 1 crédito {plan} disponible. Al confirmar, se usa uno para convertir esta invitación -- no se te cobra nada.",
        confirmarVarios:
            "Tienes {cantidad} créditos {plan} disponibles. Al confirmar, se usa uno para convertir esta invitación -- no se te cobra nada.",
        confirmarUsar: "Confirmar y usar crédito",
        usarPremium: "Usar Premium",
        usarDiamond: "Usar Diamond",
        creditoUno: "1 crédito disponible",
        creditosVarios: "{cantidad} créditos disponibles",
        consultando: "Consultando créditos…",
    },
} as const;

export type Wizard = ConCualquierTexto<typeof es>;

const en: Wizard = {
    pasoDe: "Step {actual} of {total}",
    guardarYSalir: "Save and exit",
    vistaPrevia: "Preview",
    entendido: "Got it",
    elegiTuPais: "Choose your country",
    paisAyuda: "This tells us which payment methods and bank fields to show.",

    pasos: {
        tipoDeEvento: "Event type",
        plantilla: "Template",
        recorrido: "Flow",
        portada: "Cover",
        tipografia: "Typography",
        informacionBasica: "Basic details",
        countdown: "Countdown",
        frase: "Quote",
        ceremonia: "Ceremony",
        detallesSalon: "Venue details",
        cronograma: "Schedule",
        galeria: "Gallery",
        album: "Album",
        musica: "Music",
        regalo: "Gift",
        trivia: "Trivia",
        infoAdicional: "Extra info",
    },

    nav: {
        paso: "STEP {numero}",
        creaTuInvitacion: "Create your invitation",
        atras: "Back",
        siguientePaso: "Next step",
        aplicarCambios: "Apply changes",
        crearInvitacion: "Create invitation",
        creando: "Creating…",
        salir: "Exit",
        verCambios: "View changes",
        avisoCambiosTitulo: "Unsaved changes",
        avisoCambiosTexto:
            "You have unsaved changes to this invitation. Are you sure you want to leave without applying them?",
        avisoSalirTitulo: "Leave before finishing?",
        avisoSalirTexto:
            "You haven't created the invitation yet. If you leave now you'll lose everything you've entered so far.",
        salirSinGuardar: "Leave without saving",
        salirYPerder: "Leave and discard changes",
    },

    plan: {
        disponibleEnPremium: "Available on Premium",
        soloPremiumODiamond: "Premium or Diamond only",
        modoAdmin: "Administrator mode:",
    },

    tipoEvento: {
        titulo: "What kind of event are you planning?",
        subtitulo: "Pick a category to see the templates that fit best.",
        bloqueadoEtiqueta: "Event type:",
        bloqueadoAviso: "This can't be changed once the invitation is created",
        casamiento: "Wedding",
        quince: "Quinceañera",
        otro: "Event",
        tituloInvitacion: "Invitation title",
        personalizado: "Custom",
        casamiento1: "Our Wedding",
        casamiento2: "We're Getting Married",
        casamiento3: "We're Getting Married!",
        quince1: "My Quinceañera",
        quince2: "My Fifteenth Birthday",
        quince3: "My 15!",
        placeholderCasamiento: "E.g. Our Wedding",
        placeholderQuince: "E.g. My Quinceañera",
        placeholderOtro: "E.g. My Birthday, My Christening, etc.",
        ayudaTitulo: "This is the overall title that appears on the invitation.",
        ayudaTituloQuince:
            "This is the overall title of the invitation. You'll enter your name in the next field.",
        nombreNovia: "Bride's name",
        nombreNovio: "Groom's name",
        placeholderNombre: "Name",
        nombreQuinceanera: "Name or nickname of the birthday girl",
        placeholderQuinceanera: "E.g. Sophia, Emma, Mia…",
        ayudaQuinceanera:
            "Enter the name or nickname of the birthday girl, which will stand out across the whole card.",
        nombreFestejado: "Name of the person celebrating (optional)",
        placeholderFestejado: "Person or company name",
        ayudaFestejado: "If you leave it empty, the event name is used instead.",
        errorNovia: "The bride's name is required",
        errorNovio: "The groom's name is required",
        errorQuinceanera: "The birthday girl's name or nickname is required",
    },

    basicos: {
        titulo: "Basic details",
        subtitulo: "Tell us the main details of the event.",
        infoTitulo: "What are the basic details for?",
        infoTexto:
            "These details are the foundation of your invitation: the event name, the date and the names of the guests of honour. They're used to work out the countdown, to head up the cover and to organise your guests' calendars.",
        fecha: "Event date",
        elegirFecha: "Pick a date",
        desbloqueadoAdmin: "Unlocked (Admin)",
        bloqueada30d: "Locked (30d)",
        fechaBloqueadaTexto:
            "The date is locked for safety. There are 30 days or fewer left until the event.",
        fechaAdminTexto:
            "👑 Enabled by your Administrator role: you can edit the date even with fewer than 30 days to go.",
        ciudad: "City / town of the event",
        ciudadPlaceholder: "E.g. Buenos Aires, Rosario, Mendoza…",
        ciudadAyuda: "It appears next to the date on your guests' welcome card.",
        idioma: "Invitation language",
        idiomaAyuda: "Your guests will see it in this language, whatever their phone is set to. What you write —names, address, your message— goes exactly as you wrote it.",
    },

    plantilla: {
        titulo: "Choose your template",
        subtituloDiseno: "Pick the style and colour range for your invitation",
        subtituloOtro: "Pick the style that best represents your event",
        coleccionFlat: "Flat collection",
        coleccionStorytelling: "Storytelling collection",
        nuevas: "New",
        plantillaActual: "Current template",
        sinPlantilla: "You haven't chosen a template yet",
        verModelosFlat: "See Flat designs",
        verModelosStorytelling: "See Storytelling designs",
        imagenCelebremos: "“Let's Celebrate” image",
        soloParallax: "(Parallax only)",
        ayudaParallax: "This image appears on the right half of the screen with a parallax effect.",
    },

    modalPlantillas: {
        titulo: "Choose your template",
        anteriores: "See previous templates",
        siguientes: "See more templates",
        tituloIframe: "Template preview",
        pie: "A real preview with sample content. Your photos and details will look just as tidy.",
        elegir: "Choose this template",
    },

    portadaFotos: {
        titulo: "Cover and background photos",
        subtitulo: "The main background images that dress up your card.",
        infoTitulo: "What are the cover and background photos for?",
        infoStorytelling:
            "The phone crop and the desktop crop are both optional. If you upload either one, it replaces the decorative background -- on the cover as well as on the main photo inside the invitation, below “Save the date” (they're the same 2 photos in both places). If you upload neither, no background photo appears anywhere: the invitation looks exactly like the template you chose.",
        infoFlat:
            "The invitation cover is the photo shown as the invitation's cover (required, every template uses it). The welcome cover is optional: if you upload a photo there, it replaces the original welcome-cover background. If you leave it empty, the cover looks exactly like the template you chose.",
        recortePc: "Desktop crop",
        portadaBienvenida: "Welcome cover",
        recorteCelular: "Phone crop",
        portadaInvitacion: "Invitation cover *",
        ayudaPcStorytelling:
            "Optional. If you upload it, it replaces the decorative background on wide screens -- on the cover as well as on the main photo inside the invitation.",
        ayudaPcFlat:
            "If you upload a photo here, it replaces the original welcome-cover background with this photo.",
        ayudaCelularStorytelling:
            "Optional. If you upload it, it replaces the decorative background on mobile -- on the cover as well as on the main photo inside the invitation, below “Save the date”.",
        ayudaCelularFlat:
            "This is shown as the invitation's cover photo. Required: every template uses it as the main image.",
        tipCinematico:
            "Try both: with a photo (cinematic effect) and without one (the template's own decorative background).",
        obligatoria: "This image is required in order to continue.",
        faltaImagen: "Upload the mobile cover image before continuing.",
    },

    recorrido: {
        etiqueta: "Flow",
        titulo: "How do guests move through the venue?",
        subtitulo:
            "The venue panels, the directions and the map look the same either way. What changes is which way they move as the guest scrolls.",
        zigzagTitulo: "Zigzag",
        zigzagDetalle: "You scroll down, the venue panels slide sideways, then you scroll down again.",
        abajoTitulo: "Straight down",
        abajoDetalle: "The panels stack one below the other, like the rest of the invitation.",
    },

    tipografia: {
        etiqueta: "Typography",
        titulo: "Choose the typeface",
        subtitulo: "It sets the visual character of your invitation. You can change it later.",
        titulos: "Headings",
        texto: "Body text",
        verMas: "See more typefaces",
        modalTitulos: "Choose the heading typeface",
        modalTitulosDesc: "Every typeface available for your headings.",
        modalTexto: "Choose the body typeface",
        modalTextoDesc: "Every typeface available for your body text.",
        muestraTexto: "Open invitation",
        muestraNombre: "Maria",
        muestraQuince: "My Quinceañera",
        muestraEvento: "Event name",
    },

    countdown: {
        etiqueta: "Countdown",
        titulo: "Choose the countdown style",
        subtitulo: "This is how the countdown will look on your public invitation.",
        clasico: "Classic",
        clasicoDetalle: "Blocks with a large number",
        minimalista: "Minimal",
        minimalistaDetalle: "Just the days, on one line",
        capsulas: "Capsules",
        capsulasDetalle: "Digits in coloured pills",
        flip: "Flip / Split",
        flipDetalle: "Cards with a “:” separator",
        diasRestantes: "days to go",
        dias: "Days",
        horas: "Hrs",
        minutos: "Min",
    },

    frase: {
        titulo: "Custom quote",
        ayudaCasamiento: "A line that captures the story of you two.",
        ayudaQuince: "A line the birthday girl wants to share.",
        ayudaOtro: "A welcome or corporate line for the event.",
        placeholderCasamiento: "E.g. “The best thing in life is sharing it with the one you love…”",
        placeholderQuince: "E.g. “This is the beginning of the rest of my life…”",
        placeholderOtro: "E.g. “Welcome to our celebration. Thank you for being here.”",
        infoTitulo: "How is the custom quote shown?",
        infoTexto:
            "This quote or poem appears as a highlighted line in the body of the invitation. You can write your own message or pick one of our ready-made suggestions.",
        habilitar: "Enable custom quote",
        elegiOEscribi: "Pick a line or write your own:",
        escribirPropia: "Write my own line…",
        tuFrase: "Your custom quote",
        casamiento1:
            "Love does not consist in gazing at each other, but in looking outward together in the same direction.",
        casamiento2: "We're joining our lives for good, because everything is better together.",
        casamiento3: "Where there is love, there is life. And we want to celebrate ours with you!",
        casamiento4:
            "The best thing in life is sharing it with the one you love… and with those who love you.",
        casamiento5: "Today the greatest of our adventures begins.",
        quince1: "This is the beginning of the rest of my life. Thank you for being part of it!",
        quince2: "Some moments are unforgettable and stay in your heart forever.",
        quince3: "I'm leaving childhood behind to start living my dreams.",
        quince4: "I'm celebrating the magic of growing up, surrounded by family and friends.",
        quince5: "One magical night, a memory for life. Come celebrate my quinceañera with me!",
    },

    salon: {
        titulo: "Party details",
        subtitulo: "Where and at what time is the celebration?",
        infoTitulo: "How do I set up the venue location?",
        infoTexto:
            "Enter the name of the venue, the street address and the Google Maps link. Your guests get a “Get directions” button that opens the location straight in their phone's GPS.",
        lugarNombre: "Venue name",
        lugarPlaceholder: "E.g. Los Olivos Hall",
        excesoNombre: "You're {cantidad} characters over -- shorten the name to continue.",
        direccion: "Full address",
        direccionPlaceholder: "123 Main St, City",
        excesoDireccion: "You're {cantidad} characters over -- shorten the address to continue.",
        horario: "Time",
        mapa: "Google Maps link (optional)",
        mapaPlaceholder: "Paste the link you copied from Google Maps",
        mapaAyuda: "Any Google Maps link works (the “Share” one or the one in the address bar).",
        vestimenta: "Dress code",
        vestimentaAyuda: "It's shown discreetly on the welcome cover.",
        vestimentaOpciones: "Dress code options",
        vestimenta1: "Elegant",
        vestimenta2: "Smart casual",
        vestimenta3: "Casual",
        vestimenta4: "Formal",
        vestimenta5: "Black tie",
        vestimentaPersonalizado: "Custom…",
        vestimentaEspecifica: "Specify your dress code",
        vestimentaPlaceholder: "E.g. Total White, Costume, etc.",
    },

    ceremonia: {
        titulo: "Religious / civil ceremony",
        subtitulo:
            "If the ceremony or civil wedding is at a different place, date or time than the party venue, turn this section on.",
        infoTitulo: "When should I turn the ceremony section on?",
        infoTexto:
            "Turn this section on only if the mass, ring blessing or civil registry signing takes place at a location, church or temple other than the venue where the main party is held. You'll be able to enter its address, its own time and an interactive map.",
        activar: "Add a church / civil ceremony location?",
        activarAyuda: "(Optional - turn it on if the ceremony is somewhere else)",
        tituloSeccion: "Section title",
        tituloSeccionPlaceholder: "E.g. Religious ceremony, Civil registry, Wedding",
        nombreLugar: "Name of the church / civil registry / venue",
        nombreLugarPlaceholder: "E.g. St Mary's Church",
        direccion: "Address",
        direccionPlaceholder: "E.g. 1234 Santa Fe Ave",
        hora: "Ceremony time",
        errorNombre: "The venue name is required",
        errorDireccion: "The address is required",
        errorHora: "The time is required",
    },

    cronograma: {
        titulo: "Event schedule",
        opcional: "(Optional)",
        subtitulo: "Set out the main moments of your celebration",
        infoTitulo: "How does the schedule work?",
        infoTexto:
            "The schedule lays out and communicates the different stages of your party (e.g. Reception, Dinner, Toast, Dancing). You can set the times, edit the title and icon of each moment, add new stages or remove the ones you don't need.",
        etapa: "Stage #{numero}",
        hora: "Time",
        actividad: "Activity / moment",
        actividadPlaceholder: "E.g. Reception / Dinner",
        etapaIncompleta: "Fill in the time and title of this stage, or remove it.",
        agregar: "Add a stage to the schedule",
        faltanDatos: "Fill in the time and title of every stage of the schedule before continuing.",
        errorHoraTitulo: "The first stage starts before the event",
        errorHoraTexto:
            "Your event starts at {hora}, but the first stage of the schedule ({etapa}) is set for {horaEtapa}, before that time.",
        errorHoraAyuda:
            "Check the event time in the “Venue details” step, or adjust this stage's time so it isn't earlier than the start of the event.",
    },

    galeria: {
        titulo: "Photo gallery",
        subtitulo: "Upload your best photos to show off in the invitation.",
        infoTitulo: "How does the photo gallery work?",
        infoTexto:
            "The photos you upload here become a continuous interactive carousel in the card. Square or landscape photos work best on phones.",
        mostrar: "Show the photo gallery in the card",
        avisoTitulo: "Important note about choosing photos",
        avisoTexto:
            "Photos are selected one at a time. As you upload each image, you can adjust and pick the exact square (1:1) crop so it fits the carousel perfectly.",
        avisoAnonimo:
            "You can upload up to {max} photos to try it out (Premium or Diamond). If you pick Free when you create your account, the invitation will only show the first {gratis}.",
        agregarFoto: "Add a new photo (one at a time)",
        limiteAlcanzado: "You've reached your plan's photo limit",
        sinFotos: "Upload at least one photo, or untick “Show the photo gallery” to continue.",
        fotosAgregadas: "Photos added ({cantidad})",
        fotosAgregadasDeMax: "Photos added ({cantidad}/{max})",
        premiumODiamond: "Premium or Diamond",
        eliminarFoto: "Remove photo",
        altFoto: "Photo {numero}",
        limiteTitulo: "You've reached the photo limit",
        limiteAnonimo:
            "You can upload up to {max} photos to try it out (Premium or Diamond). Remember that if you pick Free when you create your account, the invitation will only show the first {gratis}.",
        limitePlan:
            "Your {plan} plan allows up to {max} photos in the album. Upgrade your plan to add more.",
    },

    album: {
        etiqueta: "Album",
        titulo: "Choose the photo album style",
        subtitulo:
            "This is how the photos you uploaded to the Gallery will look inside your public invitation.",
        carrusel: "Carousel",
        carruselDetalle: "Photos sliding along a horizontal strip",
        solapadas: "Stacked",
        solapadasDetalle: "Photos piled up, with a frame and a shadow",
        polaroid: "Polaroid carousel",
        polaroidDetalle: "A carousel with each photo framed like an instant print",
        avisoSolapadas:
            "This style shows up to 8 photos from your Gallery, split into two blocks along the invitation (meant for a highlight selection, not the whole album).",
    },

    musica: {
        titulo: "Background music",
        subtitulo: "Add music to play while your guests look at the invitation",
        modoAdminTexto:
            "This invitation is on the Free plan (locked for the customer), but your Admin role lets you edit and turn the music on.",
        activar: "Turn background music on",
        archivo: "Audio file",
        autoplay: "Play automatically",
        sugerenciasTitulo: "Song suggestions",
        sugerenciasSubtitulo: "Let your guests suggest tracks for the party",
        infoTitulo: "What are music suggestions for?",
        infoTexto:
            "Every song your guests suggest from the digital card is saved to your dashboard. You can export or share that list straight with the venue or the event's DJ so they build the playlist around the most requested tracks.",
        activarSugerencias: "Turn song suggestions on",
    },

    banco: {
        titulo: "Bank details (gifts and tickets)",
        subtitulo:
            "Set up your transfer details for event gifts and/or ticket payments. We ask for the details used in {pais}.",
        infoTitulo: "Why can you set up two bank accounts?",
        infoTexto1:
            "At many events (weddings or quinceañeras) you need to keep the account for the ticket / catering payment (which goes to the venue or organiser) separate from your personal account for gifts.",
        infoTexto2:
            "On top of that, at quinceañeras the digital wallets young people use often have monthly limits on incoming money. Two accounts keep you under those limits and keep the finances apart.",
        infoTexto3:
            "💡 If you turn on only one account, the card shows that this single account is used for both gifts and payments.",
        avisoTitulo: "IMPORTANT SECURITY WARNING ABOUT YOUR BANK DETAILS!",
        avisoTexto:
            "Check every detail of your account ({campos}) carefully before saving. A typo could send your guests' transfers to the wrong account or lose them for good.",
        avisoLegal:
            "⚠️ The platform is not responsible for funds lost through typing mistakes in the bank details.",
        modoAdminTexto:
            "This invitation is on the Free plan (locked for the customer), but your Admin role lets you edit and turn the bank accounts on.",
        seccionRegalo: "1. Account for event gifts",
        seccionRegaloAyuda: "Transfer details so your guests can give you a voluntary gift",
        seccionTarjeta: "2. Account for ticket / pass payments",
        seccionTarjetaAyuda:
            "Transfer details for settling the invitation ticket or the event pass",
        tituloSeccion: "Section title",
        personalizado: "Custom",
        tituloPersonalizadoPlaceholder: "Write a custom title",
        regaloTitulo1: "Gift",
        regaloTitulo2: "Gift registry",
        regaloTitulo3: "Contribution",
        tarjetaTitulo1: "Ticket payment",
        tarjetaTitulo2: "Invitation payment",
        tarjetaTitulo3: "Event admission",
        banco: "Bank / digital wallet",
        bancoPlaceholderRegalo: "E.g. Mercado Pago / Banco Galicia",
        bancoPlaceholderTarjeta: "E.g. Banco BBVA / Mercado Pago",
        opcional: "(optional)",
        elegiOpcion: "Pick an option",
        alMenosUno: "Enter at least one of these: {campos}.",
        titular: "Account holder",
        titularPlaceholderRegalo: "E.g. Maria Perez",
        titularPlaceholderTarjeta: "E.g. Los Olivos Hall",
        titularObligatorio: "The account holder is required.",
        tarifas: "Rates by guest category ({simbolo} {codigo})",
        valorAdulto: "1. Ticket price per ADULT ({simbolo} {codigo})",
        valorAdultoObligatorio: "The adult price is required if you're charging for tickets.",
        tarifaAdolescente: "2. Separate rate for TEENAGERS",
        tarifaAdolescenteAyuda: "Lets you enter a specific price for teenagers",
        tarifaNino: "3. Separate rate for CHILDREN",
        tarifaNinoAyuda: "Lets you enter a specific price for younger children",
        revisarDatos: "Check the bank details: some fields are missing or have an invalid format.",
    },

    trivia: {
        titulo: "Quiz / trivia",
        subtitulo:
            "Create a fun game so your guests can show how well they know {sujeto}",
        infoTitulo: "How does the quiz work?",
        infoTexto:
            "The trivia game lets your guests answer fun questions about {sujeto} straight from the digital card. You can add multiple-choice questions, mark the right answer and challenge your friends and family to show how well they know them during the party.",
        sujetoPareja: "the couple",
        sujetoQuinceanera: "the birthday girl",
        sujetoAgasajado: "the guest of honour",
        modoAdminTexto:
            "This feature is on the Free plan for the customer, but your Admin role lets you turn it on and add questions.",
        activar: "Turn the quiz on",
        tituloCampo: "Title",
        casamiento1: "How Well Do You Know Us?",
        casamiento2: "The Couple's Trivia",
        casamiento3: "How Much Do You Know About Us?",
        quince1: "How Well Do You Know Me?",
        quince2: "My Quinceañera Trivia",
        quince3: "How Much Do You Know About Me?",
        otro1: "Party Trivia",
        otro2: "How Much Do You Know?",
        otro3: "Put Your Memory to the Test",
        personalizado: "Custom",
        tituloPlaceholder: "Write a custom title",
        preguntasAgregadas: "Questions added ({cantidad})",
        agregarNueva: "Add a new question",
        pregunta: "Question",
        preguntaPlaceholder: "What's the birthday girl's favourite place?",
        opciones: "Answer options",
        opcionPlaceholder: "Option {letra}",
        correcta: "Correct",
        pendienteAviso:
            "This question is half finished. Fill in the question and all 4 options, or clear the text to discard it, before continuing.",
        agregarYOtra: "Add and write another",
        listoCerrar: "Done, close",
        avisoAgregada: "Question added.",
        avisoCompletar: "You need to fill in the question and every option.",
        avisoPendienteEditar:
            "You have a half-finished question in the form. Complete it or clear the text before editing another one.",
        avisoPendiente:
            "You have a half-finished question: write the question and all 4 options, or clear the text to discard it.",
        avisoGuardada: "Question saved.",
        avisoUltima: "Your last question was added before continuing.",
        avisoSinPreguntas: "Add at least one question to the quiz, or turn the section off.",
    },

    infoAdicional: {
        titulo: "What do your guests need to know?",
        subtitulo:
            "Practical details like accommodation, parking or transport -- they show up under a separate button inside the invitation, so they don't get mixed in with the rest.",
        interruptor: "Show this section in the invitation",
        interruptorAyuda:
            "This is the master switch: when it's off, the “What do I need to know?” button doesn't appear even if you've filled in the information below -- so you can get everything ready and turn it on whenever you like.",
        alojamiento: "Accommodation",
        alojamientoDetalle: "Recommended hotels or places to stay near the event",
        alojamientoPlaceholder:
            "E.g. Los Álamos Hotel, 5 min from the venue. Mention “[surname] wedding” for the special rate.",
        estacionamiento: "Parking",
        estacionamientoDetalle: "Where to park and whether the venue has its own car park",
        estacionamientoPlaceholder: "E.g. The venue has its own free car park for guests.",
        transporte: "Transport",
        transporteDetalle: "Organised transfers, recommended taxi firms, etc.",
        transportePlaceholder:
            "E.g. We're organising a shuttle from the church to the venue, leaving at 20:30.",
        adicional: "Extra details",
        adicionalDetalle: "Anything else your guests need to know",
        adicionalPlaceholder:
            "E.g. The event is outdoors, we recommend bringing a light jacket for the evening.",
        textoInvitados: "The text your guests will see",
        exceso: "You're {cantidad} characters over -- shorten the text to continue.",
        faltaTexto: "Fill in the text of the sections you turned on, or turn them off.",
        avisoExceso: "The text of “{seccion}” is over the limit -- shorten it to continue.",
        errorCrear: "Couldn't create the invitation: {mensaje}",
        errorDesconocido: "Unknown error",
        errorPago: "Couldn't start the payment",
    },

    limitePlan: {
        titulo: "You've reached the Free plan limit",
        descripcion:
            "You already have an active Free invitation -- choose Premium or Diamond to create this one.",
        confirmarTitulo: "Confirm the use of a {plan} credit",
        confirmarUno:
            "You have 1 {plan} credit available. When you confirm, one will be used to convert this invitation -- you won't be charged anything.",
        confirmarVarios:
            "You have {cantidad} {plan} credits available. When you confirm, one will be used to convert this invitation -- you won't be charged anything.",
        confirmarUsar: "Confirm and use credit",
        usarPremium: "Use Premium",
        usarDiamond: "Use Diamond",
        creditoUno: "1 credit available",
        creditosVarios: "{cantidad} credits available",
        consultando: "Checking credits…",
    },
};

const pt: Wizard = {
    pasoDe: "Passo {actual} de {total}",
    guardarYSalir: "Salvar e sair",
    vistaPrevia: "Pré-visualização",
    entendido: "Entendi",
    elegiTuPais: "Escolha seu país",
    paisAyuda: "Assim sabemos quais meios de pagamento e dados bancários mostrar.",

    pasos: {
        tipoDeEvento: "Tipo de evento",
        plantilla: "Modelo",
        recorrido: "Percurso",
        portada: "Capa",
        tipografia: "Tipografia",
        informacionBasica: "Dados básicos",
        countdown: "Contagem regressiva",
        frase: "Frase",
        ceremonia: "Cerimônia",
        detallesSalon: "Detalhes do local",
        cronograma: "Programação",
        galeria: "Galeria",
        album: "Álbum",
        musica: "Música",
        regalo: "Presente",
        trivia: "Quiz",
        infoAdicional: "Informações extras",
    },

    nav: {
        paso: "PASSO {numero}",
        creaTuInvitacion: "Crie seu convite",
        atras: "Voltar",
        siguientePaso: "Próximo passo",
        aplicarCambios: "Aplicar alterações",
        crearInvitacion: "Criar convite",
        creando: "Criando…",
        salir: "Sair",
        verCambios: "Ver alterações",
        avisoCambiosTitulo: "Alterações não salvas",
        avisoCambiosTexto:
            "Você tem alterações não salvas no convite. Tem certeza de que quer sair sem aplicá-las?",
        avisoSalirTitulo: "Sair sem terminar?",
        avisoSalirTexto:
            "Você ainda não criou o convite. Se sair agora, vai perder tudo o que preencheu até aqui.",
        salirSinGuardar: "Sair sem salvar",
        salirYPerder: "Sair e descartar as alterações",
    },

    plan: {
        disponibleEnPremium: "Disponível no Premium",
        soloPremiumODiamond: "Só no Premium ou Diamond",
        modoAdmin: "Modo Administrador:",
    },

    tipoEvento: {
        titulo: "Que tipo de evento você está organizando?",
        subtitulo: "Escolha a categoria para ver os modelos ideais.",
        bloqueadoEtiqueta: "Tipo de evento:",
        bloqueadoAviso: "Não dá para mudar depois que o convite é criado",
        casamiento: "Casamento",
        quince: "15 anos",
        otro: "Evento",
        tituloInvitacion: "Título do convite",
        personalizado: "Personalizado",
        casamiento1: "Nosso Casamento",
        casamiento2: "Vamos Casar",
        casamiento3: "Vamos Casar!",
        quince1: "Meus 15 Anos",
        quince2: "Meus Quinze",
        quince3: "Meus 15!",
        placeholderCasamiento: "Ex.: Nosso Casamento",
        placeholderQuince: "Ex.: Meus 15 Anos",
        placeholderOtro: "Ex.: Meu Aniversário, Meu Batizado, etc.",
        ayudaTitulo: "Este é o título geral que aparece no convite.",
        ayudaTituloQuince:
            "Este é o título geral do convite. Seu nome você preenche no próximo campo.",
        nombreNovia: "Nome da noiva",
        nombreNovio: "Nome do noivo",
        placeholderNombre: "Nome",
        nombreQuinceanera: "Nome ou apelido da aniversariante",
        placeholderQuinceanera: "Ex.: Sofi, Valentina, Mafe…",
        ayudaQuinceanera:
            "Digite o nome ou apelido da aniversariante, que vai aparecer em destaque em todo o convite.",
        nombreFestejado: "Nome do(a) homenageado(a) (opcional)",
        placeholderFestejado: "Nome da pessoa ou da empresa",
        ayudaFestejado: "Se deixar em branco, usamos o nome do evento.",
        errorNovia: "O nome da noiva é obrigatório",
        errorNovio: "O nome do noivo é obrigatório",
        errorQuinceanera: "O nome ou apelido da aniversariante é obrigatório",
    },

    basicos: {
        titulo: "Dados básicos",
        subtitulo: "Conte os detalhes principais do evento.",
        infoTitulo: "Para que servem os dados básicos?",
        infoTexto:
            "Estas informações são a base do seu convite: o nome do evento, a data da celebração e os nomes dos homenageados. Com esses dados calculamos a contagem regressiva, montamos a capa e organizamos a agenda dos seus convidados.",
        fecha: "Data do evento",
        elegirFecha: "Escolha uma data",
        desbloqueadoAdmin: "Desbloqueado (Admin)",
        bloqueada30d: "Bloqueada (30d)",
        fechaBloqueadaTexto:
            "Data bloqueada por segurança. Faltam 30 dias ou menos para o evento.",
        fechaAdminTexto:
            "👑 Liberado pelo perfil de Administrador: você pode editar a data mesmo faltando menos de 30 dias.",
        ciudad: "Cidade do evento",
        ciudadPlaceholder: "Ex.: São Paulo, Rio de Janeiro, Curitiba…",
        ciudadAyuda: "Aparece junto da data no cartão de boas-vindas dos seus convidados.",
        idioma: "Idioma do convite",
        idiomaAyuda: "Seus convidados vão vê-lo neste idioma, não importa o idioma do celular deles. O que você escrever —nomes, endereço, sua mensagem— vai exatamente como está.",
    },

    plantilla: {
        titulo: "Escolha seu modelo",
        subtituloDiseno: "Escolha o estilo e a paleta de cores do seu convite",
        subtituloOtro: "Escolha o estilo que melhor representa o seu evento",
        coleccionFlat: "Coleção Flat",
        coleccionStorytelling: "Coleção Storytelling",
        nuevas: "Novos",
        plantillaActual: "Modelo atual",
        sinPlantilla: "Você ainda não escolheu um modelo",
        verModelosFlat: "Ver modelos Flat",
        verModelosStorytelling: "Ver modelos Storytelling",
        imagenCelebremos: "Imagem “Vamos Celebrar”",
        soloParallax: "(Só para o Parallax)",
        ayudaParallax: "Esta imagem aparece na metade direita da tela com efeito parallax.",
    },

    modalPlantillas: {
        titulo: "Escolha seu modelo",
        anteriores: "Ver modelos anteriores",
        siguientes: "Ver mais modelos",
        tituloIframe: "Pré-visualização do modelo",
        pie: "Pré-visualização real com conteúdo de exemplo. Suas fotos e dados vão ficar assim de organizados.",
        elegir: "Escolher este modelo",
    },

    portadaFotos: {
        titulo: "Fotos de capa e de fundo",
        subtitulo: "As imagens de fundo principais que vestem a apresentação do seu convite.",
        infoTitulo: "Para que servem as fotos de capa e de fundo?",
        infoStorytelling:
            "O recorte de celular e o recorte de PC são opcionais. Se você enviar algum, ele substitui o fundo decorativo original -- tanto na capa quanto na foto principal que aparece dentro do convite, abaixo de “Salve a data” (são as mesmas 2 fotos nos dois lugares). Se não enviar nenhum, não aparece foto de fundo em lugar nenhum: o convite fica igual ao modelo que você escolheu.",
        infoFlat:
            "A capa do convite é a foto que aparece como capa do convite (obrigatória, todos os modelos usam). A capa de boas-vindas é opcional: se você enviar uma foto ali, ela substitui o fundo original da capa de boas-vindas. Se deixar vazia, a capa fica igual ao modelo que você escolheu.",
        recortePc: "Recorte PC",
        portadaBienvenida: "Capa de boas-vindas",
        recorteCelular: "Recorte celular",
        portadaInvitacion: "Capa do convite *",
        ayudaPcStorytelling:
            "Opcional. Se você enviar, substitui o fundo decorativo original em telas largas -- tanto na capa quanto na foto principal de dentro do convite.",
        ayudaPcFlat:
            "Se você enviar uma foto aqui, ela substitui o fundo original da capa de boas-vindas.",
        ayudaCelularStorytelling:
            "Opcional. Se você enviar, substitui o fundo decorativo original no celular -- tanto na capa quanto na foto principal de dentro do convite, abaixo de “Salve a data”.",
        ayudaCelularFlat:
            "Aparece como foto de capa do convite. Obrigatória: todos os modelos usam como imagem principal.",
        tipCinematico:
            "Teste os dois: com foto (efeito cinematográfico) e sem foto (fundo decorativo do próprio modelo).",
        obligatoria: "Esta imagem é obrigatória para continuar.",
        faltaImagen: "Envie a imagem de capa para celular antes de continuar.",
    },

    recorrido: {
        etiqueta: "Percurso",
        titulo: "Como o convidado percorre o local?",
        subtitulo:
            "Os painéis do local, como chegar e a localização ficam iguais nos dois casos. O que muda é para onde eles avançam quando o convidado rola a tela.",
        zigzagTitulo: "Em ziguezague",
        zigzagDetalle: "Desce, os painéis do local passam de lado e continua descendo.",
        abajoTitulo: "Para baixo",
        abajoDetalle: "Os painéis ficam um embaixo do outro, como o resto do convite.",
    },

    tipografia: {
        etiqueta: "Tipografia",
        titulo: "Escolha a tipografia",
        subtitulo: "Ela define o caráter visual do seu convite. Dá para mudar depois.",
        titulos: "Títulos",
        texto: "Texto",
        verMas: "Ver mais tipografias",
        modalTitulos: "Escolha a tipografia dos títulos",
        modalTitulosDesc: "Todas as tipografias disponíveis para os seus títulos.",
        modalTexto: "Escolha a tipografia do texto",
        modalTextoDesc: "Todas as tipografias disponíveis para os seus textos.",
        muestraTexto: "Abrir convite",
        muestraNombre: "Maria",
        muestraQuince: "Meus 15 Anos",
        muestraEvento: "Nome do evento",
    },

    countdown: {
        etiqueta: "Contagem regressiva",
        titulo: "Escolha o estilo da contagem regressiva",
        subtitulo: "É assim que a contagem regressiva vai aparecer no seu convite público.",
        clasico: "Clássico",
        clasicoDetalle: "Blocos com número grande",
        minimalista: "Minimalista",
        minimalistaDetalle: "Só os dias, em uma linha",
        capsulas: "Cápsulas",
        capsulasDetalle: "Dígitos em pílulas coloridas",
        flip: "Flip / separado",
        flipDetalle: "Cartões com separador “:”",
        diasRestantes: "dias restantes",
        dias: "Dias",
        horas: "Hs",
        minutos: "Min",
    },

    frase: {
        titulo: "Frase personalizada",
        ayudaCasamiento: "Uma frase que traduza a história de vocês dois.",
        ayudaQuince: "Uma frase que a aniversariante queira compartilhar.",
        ayudaOtro: "Uma frase institucional ou de boas-vindas para o evento.",
        placeholderCasamiento: "Ex.: “O melhor da vida é dividi-la com quem a gente ama…”",
        placeholderQuince: "Ex.: “Este é o começo do resto da minha vida…”",
        placeholderOtro: "Ex.: “Bem-vindos à nossa celebração. Obrigado por estarem aqui.”",
        infoTitulo: "Como a frase personalizada aparece?",
        infoTexto:
            "Esta frase ou poema aparece como citação em destaque no corpo do convite. Você pode escrever a sua própria mensagem ou escolher uma das nossas sugestões prontas.",
        habilitar: "Ativar frase personalizada",
        elegiOEscribi: "Escolha uma frase ou escreva a sua:",
        escribirPropia: "Escrever a minha própria frase…",
        tuFrase: "Sua frase personalizada",
        casamiento1:
            "Amar não é olhar um para o outro, é olhar juntos na mesma direção.",
        casamiento2: "Unimos as nossas vidas para sempre, porque juntos tudo é melhor.",
        casamiento3: "Onde há amor, há vida. E queremos celebrar a nossa com você!",
        casamiento4: "O melhor da vida é dividi-la com quem a gente ama… e com quem nos ama.",
        casamiento5: "Hoje começa a melhor das nossas aventuras.",
        quince1: "Este é o começo do resto da minha vida. Obrigada por me acompanhar!",
        quince2: "Há momentos inesquecíveis que ficam guardados no coração para sempre.",
        quince3: "Deixo para trás a infância para começar a viver os meus sonhos.",
        quince4: "Celebro a magia de crescer, cercada do amor da minha família e dos meus amigos.",
        quince5: "Uma noite mágica, uma lembrança eterna. Venha comemorar os meus 15 comigo!",
    },

    salon: {
        titulo: "Detalhes da festa",
        subtitulo: "Onde e a que horas é a celebração?",
        infoTitulo: "Como configurar a localização do local?",
        infoTexto:
            "Digite o nome do salão ou da chácara, o endereço e o link do Google Maps. Seus convidados vão ter um botão interativo “Como chegar” que abre a localização direto no GPS do celular.",
        lugarNombre: "Nome do local / salão",
        lugarPlaceholder: "Ex.: Salão Los Olivos",
        excesoNombre: "Você passou {cantidad} caracteres -- encurte o nome para continuar.",
        direccion: "Endereço completo",
        direccionPlaceholder: "Rua 123, Cidade",
        excesoDireccion: "Você passou {cantidad} caracteres -- encurte o endereço para continuar.",
        horario: "Horário",
        mapa: "Link do Google Maps (opcional)",
        mapaPlaceholder: "Cole o link que você copiou do Google Maps",
        mapaAyuda: "Vale qualquer link do Google Maps (o de “Compartilhar” ou o da barra de endereços).",
        vestimenta: "Traje",
        vestimentaAyuda: "Aparece de forma discreta na capa de boas-vindas.",
        vestimentaOpciones: "Opções de traje",
        vestimenta1: "Elegante",
        vestimenta2: "Esporte fino",
        vestimenta3: "Casual",
        vestimenta4: "Social",
        vestimenta5: "Black tie",
        vestimentaPersonalizado: "Personalizado…",
        vestimentaEspecifica: "Especifique o seu dress code",
        vestimentaPlaceholder: "Ex.: Total White, Fantasia, etc.",
    },

    ceremonia: {
        titulo: "Cerimônia religiosa / civil",
        subtitulo:
            "Se a cerimônia ou o casamento civil for em um local, data ou horário diferente do salão da festa, ative esta seção.",
        infoTitulo: "Quando ativar a seção de cerimônia?",
        infoTexto:
            "Ative esta seção apenas se a missa, a bênção das alianças ou a assinatura no cartório acontecer em um local, igreja ou templo diferente do salão onde é a festa principal. Você vai poder informar o endereço, o horário próprio e o mapa interativo.",
        activar: "Adicionar local da igreja / cartório?",
        activarAyuda: "(Opcional - ative se a cerimônia for em outro lugar)",
        tituloSeccion: "Título da seção",
        tituloSeccionPlaceholder: "Ex.: Cerimônia religiosa, Cartório, Casamento",
        nombreLugar: "Nome da igreja / cartório / local",
        nombreLugarPlaceholder: "Ex.: Paróquia Nossa Senhora do Carmo",
        direccion: "Endereço",
        direccionPlaceholder: "Ex.: Av. Paulista 1234",
        hora: "Horário da cerimônia",
        errorNombre: "O nome do local é obrigatório",
        errorDireccion: "O endereço é obrigatório",
        errorHora: "O horário é obrigatório",
    },

    cronograma: {
        titulo: "Programação do evento",
        opcional: "(Opcional)",
        subtitulo: "Defina os momentos principais da sua celebração",
        infoTitulo: "Como funciona a programação?",
        infoTexto:
            "A programação organiza e comunica as etapas da sua festa (ex.: Recepção, Jantar, Brinde, Baile). Você pode definir os horários, editar o título e o ícone de cada momento, adicionar novas etapas ou remover as que não precisa.",
        etapa: "Etapa nº {numero}",
        hora: "Horário",
        actividad: "Atividade / momento",
        actividadPlaceholder: "Ex.: Recepção / Jantar",
        etapaIncompleta: "Preencha o horário e o título desta etapa, ou remova-a.",
        agregar: "Adicionar etapa à programação",
        faltanDatos: "Preencha o horário e o título de todas as etapas da programação antes de continuar.",
        errorHoraTitulo: "A primeira etapa começa antes do evento",
        errorHoraTexto:
            "Seu evento começa às {hora}, mas a primeira etapa da programação ({etapa}) está marcada para {horaEtapa}, antes desse horário.",
        errorHoraAyuda:
            "Confira o horário do evento no passo “Detalhes da festa”, ou ajuste o horário desta etapa para que não seja anterior ao início do evento.",
    },

    galeria: {
        titulo: "Galeria de fotos",
        subtitulo: "Envie as suas melhores fotos para brilharem no convite.",
        infoTitulo: "Como funciona a galeria de fotos?",
        infoTexto:
            "As fotos que você enviar aqui formam um carrossel interativo contínuo no convite. Vale a pena enviar fotos quadradas ou horizontais para ficarem bem no celular.",
        mostrar: "Mostrar a galeria de fotos no convite",
        avisoTitulo: "Importante sobre a seleção de fotos",
        avisoTexto:
            "As fotos são selecionadas uma a uma. Ao enviar cada imagem, dá para ajustar e escolher o enquadramento exato em formato quadrado (1:1), para encaixar perfeitamente no carrossel.",
        avisoAnonimo:
            "Você pode enviar até {max} fotos para testar (Premium ou Diamond). Se escolher o plano Grátis ao criar a sua conta, o convite vai mostrar só as primeiras {gratis}.",
        agregarFoto: "Adicionar nova foto (uma de cada vez)",
        limiteAlcanzado: "Você chegou ao limite de fotos do seu plano",
        sinFotos: "Envie pelo menos uma foto ou desmarque “Mostrar a galeria de fotos” para continuar.",
        fotosAgregadas: "Fotos adicionadas ({cantidad})",
        fotosAgregadasDeMax: "Fotos adicionadas ({cantidad}/{max})",
        premiumODiamond: "Premium ou Diamond",
        eliminarFoto: "Remover foto",
        altFoto: "Foto {numero}",
        limiteTitulo: "Você chegou ao limite de fotos",
        limiteAnonimo:
            "Você pode enviar até {max} fotos para testar (Premium ou Diamond). Lembre-se: se escolher o plano Grátis ao criar a sua conta, o convite vai mostrar só as primeiras {gratis}.",
        limitePlan:
            "Seu plano {plan} permite até {max} fotos no álbum. Faça um upgrade para adicionar mais.",
    },

    album: {
        etiqueta: "Álbum",
        titulo: "Escolha o estilo do álbum de fotos",
        subtitulo:
            "É assim que as fotos que você enviou na Galeria vão aparecer dentro do seu convite público.",
        carrusel: "Carrossel",
        carruselDetalle: "Fotos deslizando em uma faixa horizontal",
        solapadas: "Sobrepostas",
        solapadasDetalle: "Fotos empilhadas, com moldura e sombra",
        polaroid: "Carrossel Polaroid",
        polaroidDetalle: "Carrossel com cada foto emoldurada como uma instantânea",
        avisoSolapadas:
            "Este estilo mostra até 8 fotos da sua Galeria, divididas em dois blocos ao longo do convite (pensado para uma seleção de destaque, não para o álbum inteiro).",
    },

    musica: {
        titulo: "Música de fundo",
        subtitulo: "Adicione uma música para tocar enquanto veem o convite",
        modoAdminTexto:
            "Este convite está no plano Grátis (bloqueado para o cliente), mas você tem permissão de Admin para editar e ativar a música.",
        activar: "Ativar música de fundo",
        archivo: "Arquivo de áudio",
        autoplay: "Tocar automaticamente",
        sugerenciasTitulo: "Sugestão de músicas",
        sugerenciasSubtitulo: "Deixe seus convidados sugerirem músicas para a festa",
        infoTitulo: "Para que servem as sugestões de música?",
        infoTexto:
            "Todas as músicas que seus convidados sugerirem pelo convite digital ficam salvas no seu painel. Você vai poder exportar ou compartilhar essa lista direto com o buffet ou com o DJ do evento, para montarem a playlist com as mais pedidas.",
        activarSugerencias: "Ativar sugestão de músicas",
    },

    banco: {
        titulo: "Dados bancários (presentes e convites)",
        subtitulo:
            "Configure seus dados para transferência de presentes do evento e/ou cobrança de entradas. Pedimos os dados usados em {pais}.",
        infoTitulo: "Por que dá para configurar até 2 contas bancárias?",
        infoTexto1:
            "Em muitos eventos (casamentos ou festas de 15 anos) é preciso separar a conta do pagamento do convite / buffet (que vai para o salão ou para o organizador) da conta pessoal para presentes.",
        infoTexto2:
            "Além disso, em festas de 15 anos as carteiras digitais usadas por jovens costumam ter limites mensais de recebimento. Com duas contas você evita estourar esses limites ou misturar as finanças.",
        infoTexto3:
            "💡 Se ativar só uma conta, o convite mostra de forma unificada que essa conta serve tanto para presentes quanto para pagamentos.",
        avisoTitulo: "AVISO DE SEGURANÇA IMPORTANTE SOBRE OS SEUS DADOS BANCÁRIOS!",
        avisoTexto:
            "Confira cuidadosamente cada dado da sua conta ({campos}) antes de salvar. Um erro de digitação pode fazer com que as transferências dos seus convidados vão para a conta errada ou se percam de forma irreversível.",
        avisoLegal:
            "⚠️ A plataforma não se responsabiliza pela perda de valores causada por erros de digitação no preenchimento dos dados bancários.",
        modoAdminTexto:
            "Este convite está no plano Grátis (bloqueado para o cliente), mas você tem permissão de Admin para editar e ativar as contas bancárias.",
        seccionRegalo: "1. Conta para presentes do evento",
        seccionRegaloAyuda:
            "Dados para transferência, para que seus convidados possam te dar um presente",
        seccionTarjeta: "2. Conta para pagamento de convites / passes",
        seccionTarjetaAyuda:
            "Dados para transferência destinados a quitar o convite ou o passe do evento",
        tituloSeccion: "Título da seção",
        personalizado: "Personalizado",
        tituloPersonalizadoPlaceholder: "Escreva um título personalizado",
        regaloTitulo1: "Presente",
        regaloTitulo2: "Lista de presentes",
        regaloTitulo3: "Colaboração",
        tarjetaTitulo1: "Pagamento do convite",
        tarjetaTitulo2: "Pagamento dos convites",
        tarjetaTitulo3: "Entrada do evento",
        banco: "Banco / carteira digital",
        bancoPlaceholderRegalo: "Ex.: Nubank / Mercado Pago",
        bancoPlaceholderTarjeta: "Ex.: Itaú / Mercado Pago",
        opcional: "(opcional)",
        elegiOpcion: "Escolha uma opção",
        alMenosUno: "Preencha pelo menos um destes dados: {campos}.",
        titular: "Titular da conta",
        titularPlaceholderRegalo: "Ex.: Maria Pereira",
        titularPlaceholderTarjeta: "Ex.: Salão Los Olivos",
        titularObligatorio: "O titular é obrigatório.",
        tarifas: "Valores por categoria de convidado ({simbolo} {codigo})",
        valorAdulto: "1. Valor do convite por ADULTO ({simbolo} {codigo})",
        valorAdultoObligatorio: "O valor por adulto é obrigatório se você for cobrar o convite.",
        tarifaAdolescente: "2. Valor diferenciado para ADOLESCENTES",
        tarifaAdolescenteAyuda: "Permite informar um valor específico para jovens / adolescentes",
        tarifaNino: "3. Valor diferenciado para CRIANÇAS",
        tarifaNinoAyuda: "Permite informar um valor específico para crianças menores",
        revisarDatos:
            "Revise os dados bancários: há campos obrigatórios ou com formato inválido.",
    },

    trivia: {
        titulo: "Quiz / trivia",
        subtitulo:
            "Crie um jogo divertido para os seus convidados mostrarem o quanto conhecem {sujeto}",
        infoTitulo: "Como funciona o quiz?",
        infoTexto:
            "O quiz permite que seus convidados respondam perguntas divertidas sobre {sujeto} direto do convite digital. Você pode criar perguntas de múltipla escolha, marcar a resposta certa e desafiar amigos e familiares a mostrarem o quanto os conhecem durante a festa.",
        sujetoPareja: "o casal",
        sujetoQuinceanera: "a aniversariante",
        sujetoAgasajado: "o homenageado",
        modoAdminTexto:
            "Este recurso está no plano Grátis para o cliente, mas você tem permissão de Admin para ativá-lo e cadastrar perguntas.",
        activar: "Ativar quiz/trivia",
        tituloCampo: "Título",
        casamiento1: "Quanto Você Nos Conhece?",
        casamiento2: "Quiz dos Noivos",
        casamiento3: "O Quanto Você Sabe Sobre Nós?",
        quince1: "Quanto Você Me Conhece?",
        quince2: "Quiz dos Meus 15",
        quince3: "O Quanto Você Sabe Sobre Mim?",
        otro1: "Quiz da Festa",
        otro2: "Quanto Você Sabe?",
        otro3: "Ponha a Sua Memória à Prova",
        personalizado: "Personalizado",
        tituloPlaceholder: "Escreva um título personalizado",
        preguntasAgregadas: "Perguntas cadastradas ({cantidad})",
        agregarNueva: "Adicionar nova pergunta",
        pregunta: "Pergunta",
        preguntaPlaceholder: "Qual é o lugar favorito da aniversariante?",
        opciones: "Opções de resposta",
        opcionPlaceholder: "Opção {letra}",
        correcta: "Correta",
        pendienteAviso:
            "Esta pergunta está pela metade. Preencha a pergunta e as 4 opções, ou apague o texto para descartá-la, antes de continuar.",
        agregarYOtra: "Adicionar e criar outra",
        listoCerrar: "Pronto, fechar",
        avisoAgregada: "Pergunta adicionada.",
        avisoCompletar: "Você precisa preencher a pergunta e todas as opções.",
        avisoPendienteEditar:
            "Você tem uma pergunta pela metade no formulário. Termine ou apague o texto antes de editar outra.",
        avisoPendiente:
            "Você tem uma pergunta pela metade: escreva a pergunta e as 4 opções, ou apague o texto para descartá-la.",
        avisoGuardada: "Pergunta salva.",
        avisoUltima: "Sua última pergunta foi adicionada antes de continuar.",
        avisoSinPreguntas: "Adicione pelo menos uma pergunta ao quiz, ou desative a seção.",
    },

    infoAdicional: {
        titulo: "O que seus convidados precisam saber?",
        subtitulo:
            "Informações práticas como hospedagem, estacionamento ou transporte -- aparecem em um botão separado dentro do convite, sem se misturar com o resto do conteúdo.",
        interruptor: "Mostrar esta seção no convite",
        interruptorAyuda:
            "É o interruptor geral: se estiver desligado, o botão “O que você precisa saber?” não aparece mesmo que você tenha preenchido as informações abaixo -- dá para deixar tudo pronto e ativar quando quiser.",
        alojamiento: "Hospedagem",
        alojamientoDetalle: "Hotéis ou hospedagens recomendadas perto do evento",
        alojamientoPlaceholder:
            "Ex.: Hotel Los Álamos, a 5 min do salão. Mencione “Casamento [sobrenome]” para a tarifa especial.",
        estacionamiento: "Estacionamento",
        estacionamientoDetalle: "Onde estacionar e se o local tem estacionamento próprio",
        estacionamientoPlaceholder:
            "Ex.: O salão tem estacionamento próprio e gratuito para os convidados.",
        transporte: "Transporte",
        transporteDetalle: "Traslados organizados, táxis recomendados, etc.",
        transportePlaceholder:
            "Ex.: Vamos organizar uma van da igreja até o salão, saindo às 20:30.",
        adicional: "Informações extras",
        adicionalDetalle: "Qualquer outra coisa que seus convidados precisem saber",
        adicionalPlaceholder:
            "Ex.: O evento é ao ar livre, recomendamos levar um casaco leve para a noite.",
        textoInvitados: "Texto que seus convidados vão ver",
        exceso: "Você passou {cantidad} caracteres -- encurte o texto para continuar.",
        faltaTexto: "Preencha o texto das seções que você ativou, ou desative-as.",
        avisoExceso: "O texto de “{seccion}” passou do limite -- encurte para continuar.",
        errorCrear: "Erro ao criar o convite: {mensaje}",
        errorDesconocido: "Erro desconhecido",
        errorPago: "Erro ao iniciar o pagamento",
    },

    limitePlan: {
        titulo: "Você chegou ao limite do plano Grátis",
        descripcion:
            "Você já tem um convite Grátis ativo -- escolha Premium ou Diamond para criar este.",
        confirmarTitulo: "Confirmar uso de crédito {plan}",
        confirmarUno:
            "Você tem 1 crédito {plan} disponível. Ao confirmar, um será usado para converter este convite -- nada será cobrado.",
        confirmarVarios:
            "Você tem {cantidad} créditos {plan} disponíveis. Ao confirmar, um será usado para converter este convite -- nada será cobrado.",
        confirmarUsar: "Confirmar e usar crédito",
        usarPremium: "Usar Premium",
        usarDiamond: "Usar Diamond",
        creditoUno: "1 crédito disponível",
        creditosVarios: "{cantidad} créditos disponíveis",
        consultando: "Consultando créditos…",
    },
};

export const wizard = { es, en, pt };
