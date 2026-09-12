# Prompts para Claude Design — nuevas colecciones de plantillas

> Documento de trabajo. Contiene (1) el análisis de las 12 webs de inspiración que
> elegiste y cómo se agrupan en familias de estilo, (2) el **bloque común** que
> hay que pegar al principio de CADA prompt (el contrato con el backend y con
> las secciones actuales), y (3) **un prompt por colección**, listo para pegar
> en Claude Design.
>
> Cómo usarlo: abrí Claude Design con el repo `cris-imc/invitaciones` sincronizado
> (como se hizo para la Colección Storytelling, ver `mockup/nuevo/github.md`),
> pegá **Bloque común + Prompt de la colección** en un solo mensaje, y adjuntá el
> moodboard si generaste uno. El resultado esperado es un `.dc.html` panorámico
> por plantilla (mismo formato que `mockup/Pase VIP - Panoramica.dc.html`), que
> después se porta a React siguiendo `docs/GUIA_TECNICA_PLANTILLAS.md`.

---

## 0. Qué tienen en común Flat y Storytelling (y qué heredan las colecciones nuevas)

Las dos colecciones actuales son dos *layouts* distintos de una misma idea, y esa
idea es la que conservan las nuevas:

| Idea común | Cómo la resuelve Flat | Cómo la resuelve Storytelling |
|---|---|---|
| **Una invitación = una historia que se recorre bajando**, en un orden fijo de capítulos | Secciones apiladas con `SectionWrapper`, nav pill inferior | Pantallas de 100vh, riel lateral con el nombre del capítulo, paneles laterales pineados |
| **Tapa cerrada con el nombre del invitado + botón "Abrir invitación"** | Splash mobile a pantalla completa | `BienvenidaStorytelling` (de quién es la fiesta, fecha, lugar, pase) |
| **Iconografía SVG inline dibujada a mano, temática, nunca íconos de librería** | 10 slots fijos de doodle | Medallones, sellos, rutas dibujadas con `stroke-dashoffset` |
| **Un gesto de luz/movimiento sobre la foto de portada, coherente con el tema** | Haz de luz, lens flare, shimmer (anime.js `onScroll`) | Ken Burns + enfoque + tinte (`AnimatedCoverPhoto`) |
| **Una familia = 1 base + 4/5 variantes de color donde el acento principal cambia DE VERDAD** | Script de generación (`--t-acc`) | Ídem (`PLAN_VARIANTES_COLOR_STORYTELLING.md`) |
| **Tipografía Google Fonts: 1 display + 1 texto (a veces 1 mono)** | Fraunces/Sora, Cormorant/Montserrat… | Bodoni Moda/IBM Plex Mono… |
| **Mobile-first**: el diseño se piensa a 430px, escritorio es una adaptación | Grid `440px 1fr` con columna fija | Columna centrada de 560px, foto enmarcada a 900px |
| **Los mismos componentes compartidos del backend** | Countdown, RSVPWizardV2, Album, SongSuggestion, quiz, BankDetailsCard, QR de ingreso | Ídem, con estilo propio sobre las mismas props |
| **Post-evento**: la invitación deja de invitar y muestra el álbum | `PostEvento*` | `PostEventoStorytelling` |

Las colecciones nuevas **no cambian ese contrato**: cambian el *lenguaje visual y
de movimiento* de cada capítulo (profundidad 3D, capas de papel ilustradas,
tipografía cinética / cómic), no qué capítulos hay ni qué datos leen.

---

## 1. Bloque común (pegar al principio de TODOS los prompts)

```text
CONTEXTO DEL PRODUCTO
Estás diseñando plantillas de invitación digital para altainvitacion.com
(Argentina / Latinoamérica; público: casamientos, quince años y cumpleaños de
adultos; ocasionalmente cumpleaños infantiles). El proyecto ya tiene dos
colecciones en producción: "Flat" (22 familias) y "Storytelling" (36 familias).
Esta es una colección NUEVA que convive con ellas: cambia el lenguaje visual y
el movimiento, NO cambia las secciones ni los datos que se muestran.

Tenés el repo sincronizado. Antes de diseñar, leé:
- docs/GUIA_TECNICA_PLANTILLAS.md (cómo se porta un mockup a React y qué
  componentes compartidos existen)
- docs/PLAN_VARIANTES_COLOR_STORYTELLING.md (cómo funcionan las variantes de color)
- mockup/Pase VIP - Panoramica.dc.html y mockup/Acrylic Pop - Panoramica.dc.html
  (formato de entrega esperado, atributos data-* y script de la Storytelling)
- src/components/templates/GuestPassVipTemplate.tsx (una Storytelling real ya
  portada, para ver qué props y componentes compartidos consume)
- src/lib/schemas/invitation.ts (los campos reales que existen; no inventes otros)

FORMATO DE ENTREGA (no negociable)
- Un archivo .dc.html panorámico por plantilla, nombre "<Nombre> - Panoramica.dc.html",
  igual que los de mockup/. Un solo componente, estado y estilos en el mismo archivo.
- Preview base 430x932 (mobile). Todo se diseña primero a ese ancho. El escritorio
  es una adaptación: contenido centrado en una columna de 560px, la foto principal
  enmarcada a 900px (ver .gpv-hero-photo-frame en GuestPassVipTemplate.tsx). Nunca
  estirar recortes verticales de celular a pantalla ancha.
- Solo HTML + CSS + SVG inline + JS plano en el script del componente. NADA de
  WebGL, three.js, GSAP, Lottie, Rive, canvas ni imágenes PNG/JPG para ilustrar.
  Toda ilustración es SVG inline dibujado (paths, circles, gradients, filters,
  masks). Las fotos reales entran solo por los campos de foto del backend.
- Todo el movimiento se logra con: CSS transforms 3D (perspective, translateZ,
  rotateX/Y, transform-style: preserve-3d), position: sticky + scroll pineado,
  IntersectionObserver / progreso de scroll leído en un requestAnimationFrame,
  @keyframes, clip-path, mask, mix-blend-mode, stroke-dashoffset, filter: blur().
  En React se portará a framer-motion + anime.js (onScroll) + CSS: no diseñes
  nada que dependa de una librería que el proyecto no tiene.
- Respetar prefers-reduced-motion (todo se ve bien quieto).
- Texto siempre en español neutro, tono cálido y sobrio (sin signos de admiración
  apilados, sin emojis).
- Google Fonts únicamente: 1 display + 1 texto (+ 1 mono opcional).

SECCIONES / CAPÍTULOS (mismos que Storytelling, mismo orden, no se agregan ni
quitan ni reordenan; cada uno con data-screen-label y data-tone="dark|light"):
 0. Bienvenida (la pone la app: BienvenidaStorytelling; diseñá solo cómo se ve
    con las clases de tu familia: tipo de evento, NOMBRE grande, fecha, lugar,
    pase Nº y cantidad de personas)
 1. "Save the Date" — fecha grande, kicker "01 — GUARDÁ LA FECHA", link
    "agregar al calendario", foto principal opcional (portadaImagenFondo)
 2. "Countdown" — días/horas/minutos/segundos (los valores los pone la app)
 3. "Frase" — frasePersonalizadaTexto, con reveal palabra por palabra (data-w)
 4. "Cuándo y dónde" — paneles: salón (lugarNombre, direccion, hora, dress code),
    ceremonia si ceremoniaHabilitada, "cómo llegar" (mapUrl), cronograma
    (cronogramaEventos). Se recorren de costado con scroll pineado
    (data-pan / data-strip / data-dot) Y tienen que funcionar apilados en
    vertical (storytellingScrollVertical=true: mismo diseño, uno abajo del otro)
 5. "Check-in" — RSVP: confirmación, cantidad de personas, restricciones
    alimentarias, mensaje; precios por edad si aplica (precioNino/
    precioAdolescente); estado PENDIENTE → CONFIRMADO con un gesto propio
 6. "Álbum" — fotos de galeriaPrincipalFotos en páginas (también pineado
    lateral o vertical), y después del evento las fotos de "Momentos"
 7. "Música" — sugerí una canción (título + artista) y votación
 8. "Regalos" — regaloTitulo/regaloMensaje + datos bancarios (BankDetailsCard,
    puede haber 2: regalo y pago de tarjeta) con copiar al portapapeles
 9. "Quiz" — trivia opcional (triviaHabilitada)
10. "Tu pase" — cierre: número de pase, QR de ingreso (QrDeIngreso), sector/
    mesa, info adicional (alojamiento, estacionamiento, transporte), firma y
    crédito "altainvitacion.com"
Además: riel lateral de progreso con el nombre del capítulo actual, botón
flotante de música, burbuja de pase (BurbujaPase), y el estado post-evento
(solo álbum).

DATOS: usá SOLO campos que existen en src/lib/schemas/invitation.ts y en Guest
(name, expectedCount, status, orderNumber). Mostrá datos de ejemplo realistas
en español (nombres, fecha 2027, salón en Buenos Aires o Córdoba).

VARIANTES DE COLOR: cada familia se entrega con su paleta base + 4 paletas
alternativas (nombre + hex de fondo, fondo alterno, tinta, tinta suave, acento
principal, acento secundario). El ACENTO PRINCIPAL tiene que cambiar de forma
notoria entre variantes; los neutros del álbum y de los formularios se
mantienen. Indicá la lista de variantes en un bloque de "handoff" al final del
archivo, junto con las fuentes y las animaciones clave (nombre del keyframe,
duración, easing) para el equipo que lo porta.

CRITERIOS DE CALIDAD QUE SE EVALÚAN
- Identidad propia, no un reskin: iconografía y gestos de movimiento
  específicos del tema.
- Un gesto de luz/movimiento propio sobre la foto de portada.
- Legibilidad primero: contraste AA, cuerpo de texto nunca en script ni en
  display condensada; lo grande y expresivo va en títulos, fecha y frase.
- Performance: nada de blur pesado animado en loop sobre áreas grandes;
  máximo ~30 elementos animados simultáneos; will-change solo donde haga falta.
- Tiene que verse bien también quieto (captura estática para el catálogo).
```

---

## 2. Las 12 webs, agrupadas en colecciones

<!-- SECCION_ANALISIS_WEBS: se completa con el informe verificado -->

