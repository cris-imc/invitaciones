# Prompts para Claude Design — nuevas colecciones de plantillas

> Versión final (2026-09-12). Contiene: (0) qué heredan las colecciones nuevas
> de Flat y Storytelling, (1) el **Bloque común** que se pega al principio de
> cada prompt, (2) las tres colecciones y por qué se agrupan así, con el
> movimiento **medido** en las webs de referencia, (3) **un prompt por
> colección** listo para pegar, (4) prompts de moodboard, (5) el flujo hasta
> portar a React.
>
> El análisis web por web (qué se vio, qué se midió y qué no se pudo ver) está
> en `docs/ANALISIS_WEBS_INSPIRACION.md`. Las tiras de fotogramas de cada web
> están en `mockup/inspire/webs/` y se adjuntan al prompt como referencia
> visual (Claude Design no navega esas webs; los links van solo como nombre).
>
> Reglas fijadas por el dueño del producto:
> - Prioridad **casamiento y XV**; cumpleaños de adulto, corporativo e infantil
>   son variantes opcionales.
> - **Mobile primero** (la invitación llega por WhatsApp), pero el escritorio
>   tiene que verse compuesto, no una columna estirada.
> - **Ilustración en SVG inline**, por ahora. Sin fondos de video.

---

## 0. Qué tienen en común Flat y Storytelling (y qué heredan las colecciones nuevas)

| Idea común | Flat | Storytelling |
|---|---|---|
| **Una invitación = una historia que se recorre bajando**, capítulos en orden fijo | Secciones apiladas, nav pill inferior | Pantallas de 100vh, riel lateral con el capítulo, paneles laterales pineados |
| **Tapa cerrada con el nombre del invitado + "Abrir invitación"** | Splash mobile | `BienvenidaStorytelling` (de quién es la fiesta, fecha, lugar, pase) |
| **Iconografía SVG inline dibujada, temática, nunca íconos de librería** | 10 slots de doodle | Medallones, sellos, rutas con `stroke-dashoffset` |
| **Un gesto de luz/movimiento sobre la foto de portada** | Haz, lens flare, shimmer (anime.js `onScroll`) | Ken Burns + enfoque + tinte (`AnimatedCoverPhoto`) |
| **1 base + 4 variantes de color; el acento principal cambia de verdad** | Script (`--t-acc`) | Ídem |
| **Google Fonts: 1 display + 1 texto (+ 1 mono)** | | |
| **Mobile-first, escritorio adaptado** | Grid `440px 1fr` | Columna 560px, foto enmarcada a 900px |
| **Mismos componentes compartidos** | Countdown, RSVPWizardV2, Album, SongSuggestion, quiz, BankDetailsCard, QrDeIngreso | Ídem con estilo propio |
| **Post-evento: solo álbum** | `PostEvento*` | `PostEventoStorytelling` |

Las colecciones nuevas usan el **mecanismo Storytelling** (scroller propio,
`data-screen-label`, `data-tone`, `data-pan/data-strip`, riel lateral) porque es
el que ya soporta paneles pineados y pantallas completas. Cambian el lenguaje
visual y el movimiento de cada capítulo, no qué capítulos hay ni qué datos leen.

---

## 1. Bloque común (pegar al principio de TODOS los prompts)

```text
CONTEXTO
Diseñás plantillas de invitación digital para altainvitacion.com (Argentina y
Latinoamérica). Público principal: CASAMIENTOS y QUINCE AÑOS; secundario:
cumpleaños de adultos, eventos corporativos, cumpleaños infantiles. Ya existen
dos colecciones en producción ("Flat", 22 familias, y "Storytelling", 36). Esta
es una colección NUEVA que convive con ellas: cambia el lenguaje visual y el
movimiento, NO cambia las secciones ni los datos.

Tenés el repo sincronizado. Antes de diseñar leé:
- docs/GUIA_TECNICA_PLANTILLAS.md (cómo se porta un mockup a React)
- mockup/Pase VIP - Panoramica.dc.html y mockup/Acrylic Pop - Panoramica.dc.html
  (formato de entrega, atributos data-* y el script de la Storytelling)
- src/components/templates/GuestPassVipTemplate.tsx (una Storytelling portada)
- src/lib/schemas/invitation.ts (los campos que existen; no inventes otros)
Adjunto tiras de fotogramas de las webs de referencia (mockup/inspire/webs/):
usalas para entender el MOVIMIENTO, no para copiar el estilo.

FORMATO DE ENTREGA (no negociable)
- Un .dc.html panorámico por familia: "<Nombre> - Panoramica.dc.html", igual que
  los de mockup/. Un solo componente; estado, estilos y script en el archivo.
- Preview base 430x932 (celular). Se diseña primero ahí.
- Solo HTML + CSS + SVG inline + JS plano dentro del script del componente.
  NADA de WebGL, three.js, GSAP, Lottie, Rive, canvas, video, ni PNG/JPG para
  ilustrar. Toda ilustración es SVG inline (paths, gradients, filters, masks,
  patterns). Las fotos reales entran solo por los campos de foto del backend
  (mostralas como bloques con la palabra FOTO).
- Movimiento permitido: transforms 2D/3D (perspective, translateZ, rotateX/Y,
  preserve-3d), position: sticky + scroll pineado, progreso de scroll leído en
  requestAnimationFrame, IntersectionObserver, @keyframes, clip-path, mask,
  mix-blend-mode, stroke-dashoffset. Se portará a framer-motion + anime.js
  (onScroll) + CSS: no dependas de ninguna otra librería.
- Convenciones del proyecto: data-xin + data-dist + data-delay para entradas al
  scroll; data-w para reveal palabra por palabra; data-tone="dark|light" y
  data-screen-label en cada pantalla; contenedor data-scroller; paneles
  laterales con data-pan / data-strip / data-dot; data-drift para parallax.
- prefers-reduced-motion: todo se ve bien quieto. La captura estática se usa en
  el catálogo, así que cada pantalla tiene que verse compuesta sin moverse.
- Texto en español neutro, cálido y sobrio (sin signos de admiración apilados,
  sin emojis). Google Fonts únicamente: 1 display + 1 texto (+ 1 mono opcional).

MOBILE PRIMERO, ESCRITORIO COMPUESTO
- Todo el movimiento funciona con el dedo: scroll vertical natural, arrastre
  lateral en los paneles pineados, tap. Nada depende de hover. Lo que en
  escritorio reacciona al mouse, en celular reacciona al giroscopio (con
  permiso en iOS) y, si no hay permiso, a una animación autónoma suave.
- Presupuesto para un Android de gama media: solo transform y opacity animados;
  máximo 3 capas grandes en movimiento a la vez; will-change acotado; cero
  filter: blur() animado; cero box-shadow animado; SVG livianos (sin paths de
  miles de puntos); 60 fps al bajar.
- Ergonomía: botones de 48px de alto mínimo; acciones principales alcanzables
  con el pulgar; datos (dirección, alias, horarios) nunca por debajo de 14px;
  contraste AA; safe areas (env(safe-area-inset-*)).
- Tipografía gigante con clamp() y vw; mostrá la portada con un nombre corto
  ("Valentina") y uno largo ("María Florencia") para verificar que no rompe.
- Escritorio (≥1024px): NO es una columna angosta estirada. Contenido centrado a
  560px para lo que es lectura, pero el escenario (capas, profundidad, grilla
  editorial) ocupa el ancho completo: más escena a los costados, la foto
  principal enmarcada a 900px (ver .gpv-hero-photo-frame), el parallax pasa a
  mouse. Es una invitación, no una landing: sin menú, sin secciones extra.

CAPÍTULOS (los de Storytelling, mismo orden, no se agregan ni quitan ni
reordenan; cada uno con data-screen-label y data-tone):
 0. Bienvenida (la pone la app con BienvenidaStorytelling; diseñá cómo se ve con
    las clases de tu familia): tipo de evento, NOMBRE grande, fecha, lugar,
    pase Nº y cantidad de personas, saludo al invitado, botón "Abrir invitación".
 1. "Save the Date": fecha grande, kicker "01 — GUARDÁ LA FECHA", link
    "agregar al calendario", foto principal opcional (portadaImagenFondo).
 2. "Countdown": días/horas/minutos/segundos (los valores los pone la app).
 3. "Frase": frasePersonalizadaTexto, reveal palabra por palabra (data-w).
 4. "Cuándo y dónde": paneles salón (lugarNombre, direccion, hora, dress code),
    ceremonia si ceremoniaHabilitada, "cómo llegar" (mapUrl), cronograma
    (cronogramaEventos). Recorrido lateral pineado (data-pan/data-strip/
    data-dot) Y apilado vertical (storytellingScrollVertical=true): mismo
    diseño, mostrá los dos modos. Numeración 01/03 dinámica.
 5. "Check-in": RSVP con confirmación, cantidad, restricciones alimentarias,
    mensaje; precios por edad si aplica; estado PENDIENTE → CONFIRMADO con un
    gesto propio de la familia (hay callback onConfirmed).
 6. "Álbum": galeriaPrincipalFotos en hojas de hasta 5 fotos (pineado lateral o
    vertical); después del evento, las fotos de "Momentos".
 7. "Música": sugerí una canción (título + artista) y votación; botón de música.
 8. "Regalos": regaloTitulo/regaloMensaje + datos bancarios (BankDetailsCard,
    puede haber dos: regalo y pago de tarjeta) con copiar.
 9. "Quiz": trivia opcional (triviaHabilitada).
10. "Tu pase": número de pase, QR de ingreso (QrDeIngreso), sector/mesa, info
    adicional (alojamiento, estacionamiento, transporte), firma y crédito
    "altainvitacion.com" (LogoFooterCredit).
Además: riel lateral de progreso con el capítulo actual, botón flotante de
música, burbuja de pase (BurbujaPase), estado post-evento (solo álbum).

DATOS: solo campos de src/lib/schemas/invitation.ts y de Guest (name,
expectedCount, status, orderNumber). Datos de muestra realistas en español,
fecha FUTURA (2027), salón en Córdoba o Buenos Aires.

VARIANTES DE COLOR: paleta base + 4 alternativas por familia (nombre en
español + hex de fondo, fondo alterno, tinta, tinta suave, acento principal,
acento secundario). El ACENTO PRINCIPAL cambia de forma notoria entre
variantes; los neutros del álbum y de los formularios se mantienen. Al final
del archivo: bloque "handoff" con variantes, fuentes, y cada animación clave
(nombre, duración, easing, stagger, factor de parallax) para quien lo porta.

CRITERIOS DE CALIDAD
- Identidad propia, no un reskin: iconografía y gestos específicos del tema.
- Un "momento wow" por capítulo, y un gesto de luz/movimiento propio sobre la
  foto de portada.
- Sobriedad: el movimiento acompaña la lectura, nunca compite con ella. Lo
  expresivo va en nombre, fecha y frase; los datos se leen quietos.
- Belleza en reposo: cada pantalla es un afiche aunque nada se mueva.
```

---

## 2. Las tres colecciones, y por qué

Las 12 webs se midieron en navegador (video + traza del DOM) donde fue posible.
Lo que quedó claro es que hay **tres mecánicas** distintas detrás de lo que te
gustó, y que no conviven en una sola familia:

| Colección | Webs | Mecánica medida | Para qué evento rinde mejor |
|---|---|---|---|
| **A. Profundidad** | craftedbygc (1), epic (8), alireza (10), discodungeon (12) | Túnel/dolly en Z con niebla (1, verificado en código); hero con volumen donde el personaje y la plataforma respiran ±16px y el título entra con fade lento (12, medido); un objeto que entra escalando y girando en 1,2 s y sale igual al cambiar de sección (8, medido); recorrido por un solo objeto con textos que suben 60px con stagger (10, medido) | Casamiento de gala nocturno, XV de noche, aniversario, corporativo premium |
| **B. Capas de papel** | indnegev (3), parallax webflow (4), discodungeon (12, mecánica), unifiers (5) y ponpon (7) para figuras | Parallax por capas con factores 0,76-0,85 en lo lejano y desplazamientos crecientes en lo cercano; nubes que derivan solas 2-4 px/s; personaje que respira ±16px; texturas de papel y sombras de recorte | Casamiento de día/campo/jardín, XV jardín o cielo, infantil |
| **C. Tipográfica editorial** | shapestudio (2), unifiers (5), hausofwords (6), eszterbial (9), marsrejects (11), epic texto (8) | Hero pineado (factor 0,02-0,12) con nombre gigante en piezas que entran escalonadas; preloader con contador y cortina de columnas; letras que se intercambian en loop; marquesina ~80 px/s; ticker de ilustraciones ~50 px/s; inversión de color por sección; tarjetas de historia que entran sobre una portada fija | XV pop, casamiento moderno blanco y negro, cumpleaños de adulto, corporativo |

La tipografía cinética (5, 6, 9) es además una **capa transversal**: las tres
colecciones la usan en la Bienvenida y la Frase; por eso el Bloque común ya la
pide.

Si empezás por una: **B** es la de mejor relación esfuerzo/impacto para
casamiento y XV; **A** es la más "wow" y la más cara de portar y optimizar;
**C** es la más rápida y la más distinta de lo que ya tenés.

### 2.1 Respuestas a tus preguntas

- **"¿Se puede imitar viajar hacia adentro?" (1)**: sí, la sensación. El sitio
  real mueve todo el grupo en Z con three.js y funde lo lejano con una niebla
  del color del fondo. En CSS: `perspective` + capas a `translateZ` negativo +
  un padre cuyo `translateZ` crece con el scroll, y opacidad por distancia como
  niebla. Sin luces ni materiales, pero en celular alcanza y rinde.
- **"¿Es difícil dibujar eso?" (3, 4)**: no. Son 11 a 20 capas recortadas
  (confirmado en su HTML) movidas a distinta velocidad. Lo que lleva trabajo
  es dibujar bien cada capa; en SVG se logra con formas simples, textura de
  papel (`feTurbulence` a baja opacidad, una sola vez) y sombra de recorte.
- **"¿Cómo se logra ese nivel de dibujo y animación?" (7)**: con un ilustrador
  que dibuja el personaje por partes y un desarrollador que anima cada parte
  sobre WebGL. Por código se logra un personaje geométrico (6-12 formas) que
  respira, parpadea y se mece; no un personaje con volumen y expresiones. Para
  adultos: figuras estilizadas y elegantes, sin ojos grandes.
- **"¿Se puede lograr el 3D de arriba sin ese estilo?" (12)**: sí, y ni
  siquiera es 3D: son capas planas (estatuas a los lados, plataforma, personaje)
  con un personaje que respira y un título que se funde despacio; en versiones
  anteriores, marcos que escalaban con el scroll. Cambian los dibujos, no la
  técnica.

---

## 3. Prompts por colección (pegar después del Bloque común)

### 3.1 Prompt — Colección A "Profundidad"

```text
COLECCIÓN "PROFUNDIDAD"
Referencias (por nombre; adjunto tiras de fotogramas): 2018.craftedbygc.com
(viajar hacia adentro), discodungeongame.com (marcos que se abren hacia vos al
bajar), epic.net (un objeto con volumen entra girando), alireza.com (un solo
objeto recorrido de arriba a abajo, textos que suben con fade). Tomá el
concepto de volumen y avance, no el estilo de ninguna.

CONCEPTO
Cada capítulo es una sala a la que se entra. El scroll no baja: avanza.
Motor (explicalo en un comentario al inicio del script):
- Contenedor de cada sección: perspective 1000px, transform-style: preserve-3d,
  sticky de 100vh dentro de una sección de 250-300vh.
- Adentro, 3-4 capas: fondo lejano translateZ(-700px), ornamentos -350px, texto
  0, detalles adelantados +120px. El progreso de scroll (0→1) mueve el grupo de
  0 a +900px en Z: lo lejano se acerca, lo cercano pasa de largo y desaparece.
- NIEBLA (es lo que hace creíble la profundidad, tomado del código de
  craftedbygc): cada capa lleva un velo del color de fondo cuya opacidad baja a
  medida que se acerca (lejano 0,65 → cerca 0). Nunca filter: blur animado.
- Los objetos decorativos son SVG con volumen: extruidos (la misma forma
  repetida 6-8 veces con offset de 1-2px y tono más oscuro) o isométricos (3
  caras + sombra plana). Giran en rotateY según el progreso (0° → 25°).
- Entrada de objeto (medido en epic.net): scale 0,15 → 1 + rotateY 40° → 0 en
  ~1,2 s, easing cubic-bezier(.16,1,.3,1); al cambiar de capítulo sale igual,
  al revés y más rápido (0,6 s).
- Textos (medido en alireza.com): cada bloque entra con translateY 60px → 0 y
  opacity 0 → 1, 0,9 s, stagger de 120 ms entre líneas.
- Descenso (propuesta nuestra a partir de discodungeon; su versión actual
  solo hace respirar al personaje ±16px y funde el título en 4 s): en la
  Bienvenida, 4-6 marcos SVG concéntricos (arcos, aros, molduras) escalan de 1
  a 2,2 con el progreso y se desvanecen al superar 1,8; el elemento central
  baja 60vh y se reduce a 0,85. Sumá la respiración medida (±16px, 3,5 s) al
  objeto central de cada sala.
- Escritorio: la sala se ensancha (más capas a los costados), tilt de ±3° con
  el mouse; en celular, giroscopio ±3°.
- Reduced-motion y captura estática: cada sala es una composición en capas,
  quieta.

FAMILIAS (base + 4 variantes cada una). Las dos primeras son la prioridad:
1. CASAMIENTO — "Bóveda": salas negro azulado/grafito, objetos de vidrio y
   metal (anillos entrelazados, copas, un arco, una luna), acento champagne.
   Serif fina (Cormorant Garamond o Bodoni Moda) + sans (Jost o Sora).
   Nocturno, elegante, nada de fiesta.
2. QUINCE — "Constelación": violeta/azul noche profundo, estrellas facetadas,
   una corona con volumen, cintas; el countdown son bloques extruidos que giran
   al pasar; acento rosa cuarzo o lila. Display con carácter (Fraunces itálica
   o Unbounded) + sans.
3. Opcional CUMPLEAÑOS ADULTO — "Estudio": salas de color pleno (terracota,
   verde botella, cobalto), objetos con volumen: vinilo, botella, cóctel.
4. Opcional CORPORATIVO — "Atrio": grafito y plata, objetos geométricos puros,
   sin ornamento, tipografía grotesk.

GESTOS POR CAPÍTULO
- Bienvenida: marcos concéntricos que se abren (descenso) y el nombre viene
  desde el fondo (translateZ -400px → 0, blur que se aclara, 1,2 s); el botón
  es el portal.
- Save the Date: día, mes y año en tres profundidades que se alinean al llegar.
- Countdown: cuatro bloques con volumen; los segundos giran como cubo (rotateX
  90° por tick, 300 ms).
- Frase: palabra por palabra, cada palabra desde una profundidad distinta.
- Cuándo y dónde: paneles laterales pineados, cada panel una sala con su
  objeto; también apilado vertical.
- Check-in: al confirmar, la tarjeta del pase sale hacia el frente
  (translateZ 0 → 120px, 700 ms) y se sella.
- Álbum: fotos como planos a distinta profundidad; en escritorio, enmarcadas.
- Tu pase: QR sobre un bloque con volumen; el riel lateral muestra la
  profundidad recorrida como un ascensor (01 → 10).
- Foto de portada: un reflejo recorre el plano de la foto mientras gira 4° en
  rotateY con el scroll.

ENTREGA: un .dc.html por familia + handoff con la fórmula progreso → translateZ
y la niebla por capa.
```

### 3.2 Prompt — Colección B "Capas de papel"

```text
COLECCIÓN "CAPAS DE PAPEL"
Referencias (por nombre; adjunto tiras de fotogramas): indnegev.co.il (capas
con look de papel y grano, portal circular, nubes recortadas),
parallax-bgsprod.webflow.io (11 capas de paisaje + 8 nubes, cielo de
crepúsculo), discodungeongame.com (personaje que respira sobre un escenario),
unifiersofjapan.framer.website y ponpon-mania.com (figuras estilizadas con
micro-animaciones; acá NO infantiles: casamientos, quince, adultos).

CONCEPTO
Toda la invitación es papel recortado y apilado, con la ilustración en capas
que se separan al bajar. Motor:
- Cabecera de cada capítulo: 5-7 capas SVG con id="layer-1…7", de atrás hacia
  adelante: cielo con degradé y grano; luna o sol; plano lejano; portal o arco
  que enmarca el texto; follaje medio; objetos flotantes (3-5, con flote);
  primer plano que asoma por los bordes.
- Parallax medido en indnegev y en el template de Webflow: lo lejano se mueve al
  0,76-0,85 de la velocidad del scroll (queda atrás), el plano medio al 1,0, el
  primer plano se adelanta (translateY crece 40 → 180 px a lo largo de la
  pantalla, según la capa). Usá data-drift con estos valores: -40, -25, 0, +30,
  +60, +90.
- Deriva autónoma (medida): las nubes/objetos flotantes se mueven solos en X
  a 2-4 px/s, cada uno con fase distinta; el personaje u objeto central respira
  (translateY ±16px, 3,5 s, ease-in-out) y parpadea cada 3-5 s.
- Papel: cada capa con sombra de recorte corta y dura (0 2px 0 rgba(0,0,0,.12)
  + 0 8px 14px rgba(0,0,0,.08)); textura con feTurbulence + feColorMatrix al
  6-8% de opacidad, UNA vez por sección, nunca animada; bordes levemente
  irregulares (feDisplacementMap scale 1-2). Marcas de doblez sutiles como en
  indnegev (líneas claras a 45°, opacidad 0,06).
- Tarjetas (countdown, RSVP, banco) como papelitos apilados con rotaciones de
  1-2° y esquinas dobladas.
- Figuras: geométricas, 6-12 formas, dos tonos por color más una sombra,
  proporciones alargadas y elegantes, sin rostro detallado; 2-3 keyframes
  (mecerse, saludar, una cinta que ondea).
- Escritorio: la escena se ensancha (más cielo y follaje a los costados), no se
  escala; las capas responden al mouse ±10px; en celular al giroscopio ±6px.
- Reduced-motion: las capas quedan apiladas en su posición final.

FAMILIAS (base + 4 variantes cada una). Las dos primeras son la prioridad:
1. CASAMIENTO — "Jardín de papel": cerros, árboles, una casona, dos figuras
   de espaldas; crema #F3EBDD, tinta #2B2A33, acento terracota #C86B5A,
   secundario salvia #7C9A7E. Serif humanista (Fraunces o Cormorant) + sans
   (DM Sans). Variantes: Noche estrellada (azul noche + dorado), Bosque (verde
   profundo + cobre), Rosa empolvado (rosa viejo + borgoña), Viñedo (crema +
   uva y oro).
2. QUINCE — "Cielo de papel": portal circular como en indnegev con el nombre
   adentro, nubes recortadas, luna, una figura con vestido largo que se mece,
   mariposas; noche azul + papel rosado/dorado. Display con carácter + sans.
3. Opcional CUMPLEAÑOS ADULTO — "Mesa larga": mesa vista desde arriba con
   platos, copas, guirnaldas y manos que brindan; mostaza, azul petróleo, rojo
   ladrillo. Sans gruesa.
4. Opcional INFANTIL — "Circo de papel": carpa, banderines, animales
   geométricos; primarios suavizados.

GESTOS POR CAPÍTULO
- Bienvenida: las capas entran de abajo hacia arriba con stagger de 90 ms
  (fondo primero, primer plano último), 900 ms cubic-bezier(.16,1,.3,1); el
  nombre es un cartel que se despega (rotateX -12° → 0 con la sombra que
  crece).
- Save the Date: números recortados con sombra propia; el mes en una cinta.
- Countdown: cuatro papelitos; los segundos giran como hoja (rotateX 180°).
- Frase: cada palabra un recorte que cae a su lugar (translateY -24 → 0 +
  rotate 3° → 0, stagger 120 ms).
- Cuándo y dónde: paneles pineados; cada panel una mini-escena en capas (la
  puerta del salón, el camino con la ruta dibujada con stroke-dashoffset, la
  iglesia si hay ceremonia); también apilado vertical.
- Check-in: al confirmar cae un sello de papel (scale 1,6 → 1 con rebote) y
  suelta 8-12 pétalos SVG; el estado pasa a CONFIRMADO.
- Álbum: polaroids con cinta de papel; en escritorio, enmarcadas a 900px.
- Tu pase: entrada troquelada con el QR y el número de pase.
- Foto de portada: una ventana de papel se abre (clip-path) sobre la foto al
  bajar, con luz cálida en el borde.
- El cielo cambia de tarde a noche entre Save the Date y Tu pase; el sol/luna
  asciende con el scroll.

ENTREGA: un .dc.html por familia + handoff con la lista de capas de cada
cabecera (nombre, data-drift, z-index) y los keyframes de las figuras.
```

### 3.3 Prompt — Colección C "Tipográfica editorial"

```text
COLECCIÓN "TIPOGRÁFICA EDITORIAL"
Referencias (por nombre; adjunto tiras de fotogramas): eszterbial.com (contador
0→100%, cortina de columnas, letras que se intercambian), unifiersofjapan
(nombre gigante en piezas sobre un hero fijo mientras el contenido pasa por
encima), hausofwords.com (colores plenos, patrón tipográfico, marquesina),
marsrejects.com (revista + cómic: ticker de ilustraciones, inversión de color
por sección, portada fija con tarjetas que entran), shapestudio.co.uk (texto a
escala de viewport con recorrido lateral), epic.net (letras que se deslizan).

CONCEPTO
El texto ES la ilustración. Cada capítulo es una doble página: color pleno de
fondo (dos colores por sección, alto contraste, nada de degradés suaves),
display a escala de viewport (clamp(64px, 22vw, 180px) para el dato
principal), grilla editorial (kicker, folio "01/10", columnas, pie). Motor:
- Preloader tipográfico (medido en eszterbial): contador 0% → 100% en 1 s en
  mono; después una cortina de 4 columnas que se retiran con stagger de 80 ms
  (scaleY 1 → 0, 500 ms) y descubren la Bienvenida.
- Nombre en piezas (medido en unifiers): el nombre se parte en 2-3 piezas
  (sílabas o nombre/apellido), cada pieza entra desde abajo 320 px → 0 con
  stagger de 150 ms, 1,4 s, cubic-bezier(.16,1,.3,1); el hero queda casi fijo
  (se mueve al 0,05-0,12 de la velocidad del scroll) mientras el capítulo
  siguiente pasa por encima.
- Letras vivas (medido en eszterbial y epic): en el título, cada 3-5 s una
  letra se intercambia por otra (la original sale deslizando 60-170 px y la
  clon entra), o las letras se deslizan 20-50 px en X; sutil, una a la vez.
- Marquesina (medida en hausofwords): 80 px/s, dos direcciones, se pausa con
  reduced-motion; ticker de ilustraciones (medido en marsrejects) 50 px/s
  detrás del título.
- Inversión de color (marsrejects): al pasar de capítulo el fondo y el título
  intercambian colores (crema/tinta ↔ tinta/crema, o rojo/negro ↔ negro/rojo).
- Portada fija + tarjetas (marsrejects): en "Cuándo y dónde", la tarjeta
  principal queda sticky y los datos entran como tarjetas con rotación de
  ±3° y translateX desde los bordes, una por paso de scroll.
- Recursos SVG: tramas halftone (<pattern> de círculos), contornos de 2-4px,
  subrayados y flechas a mano, sellos con texto en arco (textPath),
  viñetas con borde irregular. Nada de PNG.
- Escritorio: doble página real (dos columnas, el nombre cruza el lomo);
  celular: una página por pantalla.

FAMILIAS (base + 4 variantes cada una). Las dos primeras son la prioridad:
1. CASAMIENTO — "Editorial Blanc & Noir": revista de moda; blanco roto
   #F5F1EA, negro #141414, un acento (rojo lacre #E63B2E o azul klein
   #1F4FD1); serif display extra grande (Instrument Serif o Bodoni Moda) +
   grotesk (Archivo o Space Grotesk); cómic solo en los detalles (subrayados,
   sellos). Elegante, no gracioso.
2. QUINCE — "Pop": fucsia #FF2E63, amarillo #FFD84D, cian #2EC4FF sobre negro
   o crema; tramas halftone; el nombre como lettering de portada; globos de
   texto para la frase; display cómica legible (Bangers, Anton, Rubik Mono
   One) SOLO en titulares, datos en sans redondeada.
3. Opcional CUMPLEAÑOS ADULTO — "Fanzine": papel obra, negro, un flúo;
   grotesk condensada gigante, grano de fotocopia, stickers, frase en
   marquesina.
4. Opcional CORPORATIVO — "Anuario": grilla estricta, dos tintas, folios y
   tablas; el movimiento se reduce a las entradas por línea.

GESTOS POR CAPÍTULO
- Bienvenida: contador + cortina; el nombre en piezas; el tipo de evento como
  sello en arco que gira despacio; el botón, un sello o un globo.
- Save the Date: la fecha como titular de tapa en 3 líneas (21 / MAR / 2027)
  que entran de direcciones opuestas; el año como folio; trama detrás.
- Countdown: cuatro números en columnas de revista; los segundos cambian con
  flip de letra; etiquetas en marquesina.
- Frase: palabra por palabra con resaltador de color alternado y una palabra
  clave en globo.
- Cuándo y dónde: tarjeta principal fija + tarjetas que entran; también en
  paneles pineados y apilado vertical; cada panel con folio.
- Check-in: cupón "recortá por acá" con línea punteada; al confirmar cae un
  sticker CONFIRMADO con rotación.
- Álbum: contact sheet en blanco y negro que toma color al pasar por el
  centro (grayscale 1 → 0).
- Tu pase: contratapa: QR grande, sello en arco, créditos como colofón.
- Foto de portada: trama halftone que se disuelve para revelar la foto (mask
  animada) al bajar.

ENTREGA: un .dc.html por familia + handoff con las fuentes (y por qué), los
patrones SVG de trama y los timings de los reveals por letra.
```

---

## 4. Moodboard (opcional, antes del prompt de Claude Design)

Como en `Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md`, un moodboard adjunto ayuda a
fijar paleta e ilustración. Uno por colección, para Gemini o ChatGPT Image:

- **A. Profundidad**: "Moodboard 3x3, invitaciones de lujo, salas oscuras
  azul-grafito con objetos de vidrio y metal (anillos, copas, arcos, estrellas
  facetadas, una corona) flotando a distintas distancias, perspectiva de
  túnel, niebla del color del fondo, luz champagne, serif fina; sin personas,
  sin texto, sin videojuego."
- **B. Capas de papel**: "Moodboard 3x3 de ilustración en papel recortado por
  capas con grano y marcas de doblez: cerros, jardín, portal circular con
  nubes recortadas, cielo nocturno con luna, figuras humanas estilizadas de
  proporciones alargadas sin rostro, sombras de recorte cortas; paleta
  crema/salvia/terracota y noche azul/rosa; elegante, no infantil, sin texto."
- **C. Tipográfica editorial**: "Moodboard 3x3 de diseño editorial de revista
  con toques de cómic: dobles páginas con colores plenos de alto contraste
  (blanco roto, negro, rojo lacre, fucsia, amarillo, cian), tipografía display
  gigante, tramas halftone, viñetas con borde irregular, globos de texto,
  sellos en arco; sin personajes, sin texto legible."

---

## 5. Flujo completo

1. (Opcional) moodboard con §4.
2. Claude Design con el repo sincronizado: pegar **§1 + §3.x**, adjuntar el
   moodboard y las tiras de `mockup/inspire/webs/` de esa colección.
3. Revisar que cada `.dc.html` tenga las 11 pantallas con `data-screen-label`,
   los paneles con `data-pan/data-strip` en los dos modos, la tabla de
   variantes y el handoff con los valores de movimiento.
4. Guardar en `mockup/<coleccion>/<Nombre> - Panoramica.dc.html`.
5. Portar con `docs/GUIA_TECNICA_PLANTILLAS.md` sobre una Storytelling como base
   (`GuestPassVipTemplate.tsx`), generar variantes por script, wirear los 8
   puntos, agregar a `template-labels.ts` y a `STORYTELLING_TEMPLATE_TIPOS` (usan
   el mismo mecanismo de paneles) y al gating por tipo de evento.
6. Decisión pendiente para el wizard: `StepDesign.tsx` hoy distingue solo
   `FLAT | STORYTELLING`. Lo más barato es que las nuevas entren en la pestaña
   Storytelling con una etiqueta de colección; pestañas nuevas tocan
   `StepDesign`, `TemplatePreviewModal` y textos i18n.
7. Si más adelante el SVG de alguna capa queda pobre, el DOM y el movimiento
   permiten reemplazar esa capa por una imagen con transparencia sin tocar
   nada más. Por ahora, todo SVG.
