// Preguntas frecuentes -- misma fuente para la landing pública (sección
// #faq en src/app/page.tsx) y para /dashboard/faq (accesible desde el menú
// de Ayuda una vez logueado). Un solo lugar para agregar/editar preguntas.
export interface FaqItem {
    q: string;
    a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
    {
        q: "¿Necesito saber de diseño o programación para armar mi invitación?",
        a: "No. Elegís una plantilla y la personalizás con un wizard guiado paso a paso: nombres, fecha, lugar, fotos y mensaje. Vas viendo la vista previa en vivo, tal cual la va a ver cada invitado en su teléfono, así que no hay sorpresas al final."
    },
    {
        q: "¿Cómo es el proceso, paso a paso?",
        a: "Elegís una plantilla según tu evento, la personalizás con tus datos y fotos en el wizard viendo la vista previa en tiempo real, y publicás para compartir el link por WhatsApp, Instagram o el medio que prefieras. No hay tiempos de espera ni formularios que enviar a un tercero: vos controlás todo el proceso."
    },
    {
        q: "¿Puedo editar mi invitación después de haberla publicado?",
        a: "Sí, podés volver a tu panel y modificar textos, fotos, fecha o cualquier dato las veces que necesites. Si cambia el lugar o la fecha del evento, el link no cambia: tus invitados van a ver la información actualizada automáticamente."
    },
    {
        q: "¿Cómo comparto mi invitación con los invitados?",
        a: "Generás un link único y personalizado para cada invitado o grupo familiar. Lo enviás de forma individual (uno a uno) por WhatsApp, email o el medio que prefieras. Al ser un link personal, cada persona recibe su propia invitación exclusiva para confirmar su asistencia."
    },
    {
        q: "¿Hay límite de invitados?",
        a: "En el plan Gratis podés cargar hasta 20 invitados. En Premium y Diamond no hay límite: podés invitar a todos los que quieras sin restricciones."
    },
    {
        q: "¿Qué diferencia hay entre los planes Gratis, Premium y Diamond?",
        a: "El plan Gratis incluye invitación personalizable completa, RSVP y álbum de hasta 5 fotos para hasta 20 invitados: ideal para probar la plataforma o eventos íntimos. Premium suma invitados ilimitados, álbum de hasta 15 fotos, música de fondo, trivias, sugerencias de DJ y gestión de pagos. Diamond agrega el Modo LIVE, con proyección de fotos en vivo durante la fiesta."
    },
    {
        q: "¿Puedo cambiar de plan después de haber empezado?",
        a: "Sí, podés empezar gratis y subir de plan en cualquier momento sin perder lo que ya cargaste."
    },
    {
        q: "¿Mi invitación se va a ver bien en el celular de mis invitados?",
        a: "Sí. Cada plantilla está pensada mobile-first, porque la gran mayoría de tus invitados la va a abrir desde WhatsApp en su teléfono. También se ve correctamente en tablet y PC."
    },
    {
        q: "¿Puedo usar Alta Invitación para otro evento que no sea una boda?",
        a: "Sí, tenemos plantillas para bodas, XV años, cumpleaños y otros eventos, cada una con su propio estilo, tipografía y estructura."
    },
    {
        q: "¿Hay algún costo por usar el plan Gratis?",
        a: "No, el plan Gratis es $0 por evento, sin suscripción ni tarjeta requerida. Solo pagás si elegís desbloquear funcionalidades con Premium o Diamond, y es un pago único por evento, nunca una suscripción recurrente."
    },
    {
        q: "Un invitado ya confirmó su asistencia, ¿puedo modificar la cantidad de invitados después?",
        a: "Sí. Desde \"Gestionar invitados\" podés editar la cantidad aunque ya haya confirmado. Si la aumentás (por ejemplo, de 3 a 5 personas), el invitado va a poder entrar a su link y confirmar hasta esa nueva cantidad. Si en cambio la reducís por debajo de lo que ya había confirmado, su respuesta se reinicia automáticamente y va a tener que volver a confirmar su asistencia."
    },
];
