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

> Nota de método: el entorno donde se armó este documento no pudo abrir las 12
> webs (la política de red de la organización bloquea todo salvo GitHub y npm).
> El análisis técnico sale de: el código fuente público de la web 1
> (`github.com/craftedbygc/2018-in-review`, verificado), fichas de Awwwards /
> Framer / Webflow / Codrops vía búsquedas (snippets) y conocimiento previo de
> esos sitios. El informe completo, web por web y con el nivel de evidencia de
> cada dato, está en `docs/ANALISIS_WEBS_INSPIRACION.md`. Lo que importa para
> el prompt no es replicar la tecnología de cada web (la mayoría usa WebGL,
> GSAP, Framer o Webflow, que el proyecto no tiene) sino **traducir el efecto
> que te gustó a algo que se logra con CSS + SVG + scroll**, y eso sí está
> resuelto abajo.

### 2.1 Qué pediste, web por web, y cómo se traduce

| # | Web | Lo que te gustó | Cómo lo hace (probable) | Se puede en CSS/SVG? | Traducción para una invitación |
|---|---|---|---|---|---|
| 1 | craftedbygc 2018 | Scroll = viajar "hacia adentro" en 3D | **Verificado en su código**: three.js, scroll virtual (rueda/touch) que mueve todo el grupo en Z (dolly); cada tarjeta a `z = -300·i`; **niebla del color del fondo** (#AEC7C3) que funde lo lejano; título serif en outline como capa más lejana; tilt de cámara con el mouse | **Sí, aproximado** (MEDIUM): `perspective` en el contenedor + capas hijas con `translateZ` negativo; el scroll suma `translateZ` a todo el grupo, así las capas "vienen hacia vos" y pasan de largo. Sin cámara real, pero el efecto de túnel se percibe igual | Cada capítulo es una "sala": el kicker, la fecha y los ornamentos están a distintas profundidades; al bajar, entrás a la sala siguiente |
| 2 | shapestudio.co.uk | Scroll lateral, cosas que aparecen, tamaño del texto | GSAP + WebGL (Unseen Studio): track horizontal con `translateX` según el progreso, reveals por máscara de línea, distorsión de imágenes por velocidad | **Sí** (EASY): es exactamente lo que ya hace Storytelling con `data-pan/data-strip` | Extenderlo: no solo "Cuándo y dónde" y el álbum, también la frase y el countdown se pueden contar de costado |
| 3 | indnegev.co.il | Ilustración superior, movimiento por capas, look a papel | Ilustración en 4-6 capas (PNG/SVG) con parallax por scroll; texturas de papel | **Sí** (MEDIUM): capas SVG con `data-drift` a distintas velocidades; papel con `feTurbulence` + sombras de recorte | Cabecera ilustrada por familia (skyline, jardín, mar, montaña) en capas; texturas de papel y sombras de recorte en las tarjetas |
| 4 | parallax-bgsprod.webflow.io | Ilustración superior, movimiento por capas | Webflow: interacciones de scroll sobre capas de imagen | **Sí** (EASY-MEDIUM): igual que 3 | Igual que 3; la diferencia es solo el tema de la ilustración |
| 5 | unifiersofjapan.framer.website | Texto grande, motion de textos, caricaturas | Framer: reveals de texto por palabra/letra, ilustraciones vectoriales con animaciones simples | **Sí** (MEDIUM): reveal por palabra ya existe (`data-w`); personajes/objetos como SVG de formas simples con 2-3 keyframes (flotar, parpadear, girar) | Personajes NO infantiles: siluetas elegantes, figuras estilizadas, objetos con "cara" sutil |
| 6 | hausofwords.com | Colorido, composición del texto, motions de texto | Bloques de color plenos, tipografía como imagen, reveals | **Sí** (EASY): color blocking por sección + tipografía a escala de viewport (`clamp`) + reveals | Cada capítulo un color pleno distinto, el texto ES la ilustración |
| 7 | ponpon-mania.com | Caricaturas y sus efectos; "cómo lograr ese nivel de dibujo y animación" | Ilustración profesional de Illustrator separada por capas (cuerpo, ojos, boca, brazos) y animada por partes con GSAP sobre WebGL; física (Matter.js) para arrastrar objetos; base blanco y negro, el color entra solo en la fiesta | **Parcial** (HARD): ese nivel de dibujo no sale de código; lo que sí sale es un estilo geométrico/flat con pocas formas, bien compuesto, con animación simple | Ver §2.3 "sobre el dibujo" |
| 8 | epic.net | Gráficos y movimiento 3D, motion de textos | WebGL + motion de texto | **Aproximado** (MEDIUM): objetos "3D" en SVG (isométricos/extruidos con sombra) que rotan con `rotateX/rotateY` + scroll | Sellos, medallones, números del countdown como "bloques" extruidos |
| 9 | eszterbial.com | Motion del texto de bienvenida | Split de letras + stagger (blur/desplazamiento) | **Sí** (EASY): igual que el `intro()` de la Storytelling, por letra en vez de por línea | La Bienvenida (nombre) entra letra por letra, con blur y desplazamiento |
| 10 | alireza.com | Gráficos 3D de fondo que reaccionan al scroll | three.js + Lenis: la cámara recorre UN solo modelo (una palmera) de arriba a abajo por tramos; paleta verde profundo #0E2B2D + dorado #C38C5C | **Aproximado** (MEDIUM): formas SVG grandes en capas `translateZ` que rotan/escalan con el progreso del scroll | Fondo de "objetos flotantes" (pétalos, esferas, cintas) que giran al bajar |
| 11 | marsrejects.com | Contraste de color, look cómic, motions de texto y scroll, tipografía cómic, diseño editorial de revista | Framer: cabecera ilustrada que se desplaza en horizontal al bajar, "story cards" que entran flotando mientras el fondo fijo acumula detalles, ticker, carrusel arrastrable; semitono y sombra dura | **Sí** (EASY-MEDIUM): tramas de puntos con `<pattern>` SVG, contornos gruesos, viñetas, onomatopeyas como SVG, grillas de revista | Colección "Cómic editorial" completa |
| 12 | discodungeongame.com | El 3D de la parte superior (no el estilo) | **No es WebGL**: Framer, pseudo-3D por capas: marcos con hueco central que escalan a distinta velocidad con el scroll (túnel vertical) y un personaje que desciende | **Sí** (EASY-MEDIUM): 4-6 marcos SVG concéntricos con `scale` creciente + `perspective`, los cercanos se desvanecen primero; es el sitio 1 en eje vertical | "Descenso a la fiesta": marcos concéntricos (arcos de flores, marcos dorados) como túnel de bienvenida |

### 2.2 Las tres colecciones que salen de ahí

Las 12 webs no son compatibles entre sí en una sola familia (un túnel 3D oscuro y
un cómic a colores plenos no conviven), pero sí se agrupan en **tres lenguajes**
claros. Cada colección se pide con un prompt propio y da 3 familias (una por
tipo de evento: casamiento, XV, cumpleaños de adulto) + 1 opcional infantil.

| Colección | Webs que la inspiran | Lenguaje | Movimiento distintivo |
|---|---|---|---|
| **A. Profundidad** ("Túnel") | 1, 8, 10, 12 (+ 2 para los paneles) | Oscura o de fondo profundo, capas a distintas distancias, objetos "3D" en SVG | El scroll avanza hacia adentro (`perspective` + `translateZ`), los objetos giran al pasar |
| **B. Papel** ("Capas ilustradas") | 3, 4, 5, 7 | Clara, texturas de papel, ilustración por capas, personajes/objetos estilizados no infantiles | Parallax por capas (`data-drift`), sombras de recorte, elementos que "se despegan" |
| **C. Tipográfica** ("Cómic editorial") | 6, 9, 11 (+ 2, 5 para el texto) | Colores plenos de alto contraste, tipografía display enorme, tramas, contornos, grilla de revista | Texto que entra letra por letra, marquesinas, paneles laterales, viñetas |

Los tres comparten con Flat y Storytelling todo lo del §0. Lo que cambia entre
sí es solo el lenguaje visual y el gesto de movimiento.

La "tipografía cinética" (texto que entra por letra/palabra, marquesinas,
contadores: webs 5, 6, 9) no es exclusiva de C: es una **capa transversal** que
las tres colecciones usan en la Bienvenida y en la Frase. Por eso el bloque
común ya la pide (`data-w`, reveal por letra en la Bienvenida).

Si preferís empezar por una sola colección: **B (Papel)** es la de mejor
relación esfuerzo/impacto y la más segura en celular; **A (Profundidad)** es la
más vistosa pero la más costosa de portar y de optimizar; **C (Tipográfica)**
es la más rápida de producir.

### 2.3 Sobre "¿es difícil dibujar eso?" (webs 3, 4, 5, 7)

- **Capas ilustradas con look a papel (3, 4): no es difícil.** Una cabecera de
  4-6 capas SVG (cielo, fondo lejano, medio, primer plano, detalles) con
  formas simples se dibuja bien en código. El "papel" sale de tres recursos
  que Claude Design maneja: textura con `feTurbulence` a baja opacidad,
  sombra de recorte (`drop-shadow` corta y dura) en cada capa, y bordes
  levemente irregulares. Pedilo explícitamente como "papel recortado
  (cut-paper), 5 capas, cada capa con su sombra".
- **Caricaturas nivel ponpon-mania (7): eso sí es difícil de lograr por
  código.** Esas webs tienen ilustradores dibujando personajes con volumen,
  expresiones y animación cuadro a cuadro (Lottie/Rive). Lo que sí funciona
  en SVG generado: **personajes y objetos geométricos** (una figura de 6-10
  formas: cabeza, cuerpo, brazos como cápsulas), estilo "flat" con dos tonos
  por color y una sombra, y animación de 2-3 keyframes (flotar, parpadear,
  saludar, girar). Para adultos se pide "figuras estilizadas, elegantes,
  proporciones alargadas, sin ojos grandes ni estética infantil". Si querés
  el nivel de 7 de verdad, el camino es: ilustrador humano → SVG limpio →
  animar en Rive/Lottie; eso queda fuera de esta colección.
- **Texto grande + motion (5, 6, 9, 11): es lo más fácil** y lo que mejor
  rinde en una invitación, porque el contenido ya es texto (nombre, fecha,
  frase). Es el eje de la colección C.
- **3D (1, 8, 10, 12): se logra la sensación, no el render.** Con CSS 3D
  (`perspective`, `preserve-3d`, `translateZ`) y objetos SVG isométricos o
  "extruidos" (3 caras + sombra) se consigue profundidad real al hacer
  scroll. No hay iluminación ni materiales como en WebGL, pero para una
  invitación en celular la percepción de túnel y de objetos que giran es
  suficiente y rinde bien.

---

## 3. Prompts por colección (pegar después del bloque común)

### 3.1 Prompt — Colección A "Profundidad"

```text
COLECCIÓN: "Profundidad"
Referencias de movimiento (las conozco por descripción; traducí el efecto, no la
tecnología): 2018.craftedbygc.com (el scroll se siente como VIAJAR HACIA
ADENTRO de la escena), alireza.com (objetos 3D de fondo que giran y se
acercan con el scroll), epic.net (objetos 3D + texto que entra con energía),
discodungeongame.com (una escena con volumen en la cabecera; tomá el concepto
de volumen, NO el estilo de videojuego).

CONCEPTO
Cada capítulo de la invitación es una "sala" a la que se entra. El scroll no
baja: avanza. El contenedor de cada sección tiene perspective (~900px) y
transform-style: preserve-3d; adentro hay 3-4 capas a distintas profundidades
(fondo lejano translateZ(-600px), ornamentos medios -300px, texto 0, detalles
adelantados +120px). Un progreso de scroll (rAF sobre el scroller) desplaza el
grupo en Z, así lo lejano se acerca, lo cercano pasa de largo y se desvanece,
y aparece la sala siguiente. Los objetos decorativos son SVG con volumen:
isométricos (3 caras, sombra plana) o "extruidos" (misma forma repetida 6-8
veces con offset y tono más oscuro), y giran en rotateY/rotateX según el
progreso. En reduced-motion y en la captura estática, cada sala se ve como
una composición en capas, sin movimiento.

DISEÑÁ 3 FAMILIAS (+1 opcional), cada una con su base + 4 variantes de color:
1. Casamiento — "Bóveda": salas oscuras (negro azulado, grafito) con objetos de
   vidrio/metal: anillos entrelazados, copas, arcos, una luna; acento
   champagne. Elegante, nocturno, cero fiesta infantil.
2. Quince años — "Constelación": fondo profundo violeta/azul noche, objetos que
   flotan: estrellas facetadas, una corona de volumen, cintas; el countdown
   son bloques extruidos que giran al pasar; acento rosa cuarzo o lila.
3. Cumpleaños de adulto — "Estudio": salas de color pleno saturado (terracota,
   verde botella, azul cobalto) con objetos cotidianos con volumen: discos de
   vinilo, botellas, un cóctel, globos de cristal; tipografía sans gruesa.
4. Opcional infantil — "Túnel de juguete": mismo mecanismo con objetos de
   madera/plástico, colores primarios suavizados.

GESTOS OBLIGATORIOS DE LA COLECCIÓN
- Bienvenida: el nombre entra desde el fondo (translateZ(-400px) → 0) con blur
  que se aclara; el botón "Abrir invitación" es el "portal" de la primera sala.
- Save the Date: la fecha en 3 capas (día atrás, mes en el medio, año adelante)
  que se alinean al llegar.
- Countdown: cuatro bloques con volumen; los segundos giran como un cubo
  (rotateX 90° por tick).
- Frase: palabra por palabra, cada palabra viene de una profundidad distinta.
- Cuándo y dónde: paneles laterales pineados (data-pan/data-strip), y cada
  panel es una sala con su propio objeto; funcional también apilado vertical.
- Check-in: al confirmar, la tarjeta del pase "sale" hacia el frente
  (translateZ) y se sella.
- Álbum: las fotos como planos a distinta profundidad; en desktop, enmarcadas.
- Tu pase: el QR sobre un bloque con volumen, el riel lateral muestra la
  profundidad recorrida.
- Foto de portada: gesto de luz propio = un reflejo que recorre el plano de
  la foto al girar levemente en rotateY con el scroll.
- NIEBLA (clave de la profundidad, tomada de craftedbygc): cada capa lejana
  se funde con el color de fondo de la sala (opacidad o un velo del mismo
  color), así lo que "viene" emerge de la niebla en vez de aparecer de golpe.
- Al menos una familia usa el "descenso" de discodungeon: marcos concéntricos
  (arcos, aros, marcos dorados) que escalan a distinta velocidad formando un
  túnel vertical hacia la Bienvenida.
- Opcional en desktop: tilt de toda la sala de ±3° siguiendo el mouse.

ENTREGA
Un .dc.html panorámico por familia (base) + tabla de variantes al pie, y una
tarjeta "handoff" que explique en 10 líneas cómo se calcula el progreso de
scroll → translateZ (y la niebla por capa) para que el equipo lo porte a
anime.js onScroll.
```

### 3.2 Prompt — Colección B "Papel"

```text
COLECCIÓN: "Papel"
Referencias (traducí el efecto, no la tecnología): indnegev.co.il (ilustración
superior en capas con look a papel, movimiento por capas al bajar),
parallax-bgsprod.webflow.io (cabecera ilustrada por capas),
unifiersofjapan.framer.website (texto grande + ilustraciones de personajes
estilizados), ponpon-mania.com (personajes con carácter y micro-animaciones;
NO infantil: acá van para casamientos, quince y adultos).

CONCEPTO
Toda la invitación es papel recortado y apilado. Cada sección tiene una
cabecera ilustrada de 4-6 capas SVG (cielo/fondo, plano lejano, medio,
primer plano, detalles sueltos) con parallax por scroll (data-drift con
amplitudes distintas por capa: -18, -8, 0, +12, +24 px por viewport). Cada
capa lleva sombra de recorte corta y dura (drop-shadow 0 2px 0 + 0 6px 12px a
baja opacidad) y una textura de papel (feTurbulence + feColorMatrix a 6-8% de
opacidad, UNA sola vez por sección, no animada). Las tarjetas (countdown,
RSVP, banco) son "papelitos" apilados con rotaciones de 1-2°. Los personajes
y objetos son geométricos: 6-12 formas por figura, dos tonos por color más una
sombra, proporciones alargadas y elegantes, sin ojos grandes; animación de 2-3
keyframes por elemento (flotar, parpadear, mecerse, una bandera que ondea).

DISEÑÁ 3 FAMILIAS (+1 opcional), cada una con su base + 4 variantes de color:
1. Casamiento — "Jardín de papel": cabecera con cerros, árboles, una casona,
   dos figuras estilizadas de espaldas; paleta crema/salvia/terracota, acento
   cobre. Tipografía serif humanista + sans.
2. Quince años — "Ciudad de noche": skyline recortado en capas, farolitos,
   una figura con vestido largo que se mece; paleta noche azul + papel
   rosado/dorado. Display con carácter + sans.
3. Cumpleaños de adulto — "Mesa larga": vista desde arriba de una mesa con
   platos, copas, guirnaldas y manos que brindan (solo manos y objetos);
   paleta mostaza/azul petróleo/rojo ladrillo. Sans gruesa.
4. Opcional infantil — "Circo de papel": carpa, banderines, animales
   geométricos; primarios suavizados.

GESTOS OBLIGATORIOS DE LA COLECCIÓN
- Bienvenida: el nombre es un cartel de papel que "se despega" (rotateX
  desde -12° con sombra que crece) y las capas de la cabecera entran una por
  una desde abajo con stagger.
- Save the Date: la fecha como números recortados, cada uno con su sombra;
  el mes en una cinta.
- Countdown: cuatro papelitos apilados; los segundos cambian con un giro de
  hoja (rotateX 180° por tick).
- Frase: palabra por palabra, cada palabra un recorte que cae a su lugar.
- Cuándo y dónde: paneles pineados laterales (data-pan/data-strip); cada
  panel tiene su mini-escena en capas (la puerta del salón, el camino con la
  ruta dibujada stroke-dashoffset, la iglesia si hay ceremonia); funcional
  también apilado vertical.
- Check-in: al confirmar, un sello de papel cae y se estampa (scale 1.6 → 1
  con rebote) y el estado pasa a CONFIRMADO.
- Álbum: fotos como polaroids con cinta de papel; en desktop, enmarcadas.
- Tu pase: el QR sobre una entrada de papel con borde troquelado (perf strip).
- Foto de portada: gesto de luz propio = una "ventana" de papel que se abre
  (clip-path) sobre la foto al bajar, con luz cálida en el borde.
- El cielo de la cabecera cambia de color a lo largo de la invitación (de
  tarde a noche entre Save the Date y Tu pase), y el sol/la luna asciende
  con el scroll.
- En desktop, las capas también responden al mouse (±10px), como en indnegev.

ENTREGA
Un .dc.html panorámico por familia (base) + tabla de variantes al pie, y una
tarjeta "handoff" con la lista de capas de cada cabecera (nombre, amplitud de
drift, z-index) y los keyframes de los personajes.
```

### 3.3 Prompt — Colección C "Tipográfica / Cómic editorial"

```text
COLECCIÓN: "Tipográfica"
Referencias (traducí el efecto, no la tecnología): marsrejects.com (contraste
de color, look cómic, tipografía cómic, motions de texto y de scroll, diseño
editorial de revista), hausofwords.com (colorido, composición del texto, el
texto como imagen), eszterbial.com (el texto de bienvenida entra con motion
letra por letra), shapestudio.co.uk (scroll lateral con cosas que aparecen,
tamaño del texto), unifiersofjapan.framer.website (texto grande + motion).

CONCEPTO
El texto ES la ilustración. Cada capítulo es una doble página de revista:
un color pleno de fondo (alto contraste, 2 colores por sección, nunca
degradés suaves), tipografía display a escala de viewport (clamp(64px, 22vw,
180px) para el dato principal), grilla editorial (kicker, folio "01/10",
columnas, pie), y recursos de cómic hechos en SVG: tramas de puntos
(<pattern> halftone), contornos gruesos de 2-3px, viñetas con borde
irregular, globos de texto, onomatopeyas dibujadas como lettering SVG,
flechas y subrayados a mano. Movimiento: reveal por letra (stagger 30-40ms,
translateY + blur o rotate 6°), marquesinas horizontales en el kicker de
sección, paneles pineados laterales que descubren "viñetas" una por una,
y texto en arco (textPath) para sellos.

DISEÑÁ 3 FAMILIAS (+1 opcional), cada una con su base + 4 variantes de color:
1. Casamiento — "Editorial Blanc & Noir": revista de moda; blanco roto,
   negro, un acento (rojo lacre o azul klein); serif display extra grande +
   grotesk; viñetas como fotos de editorial; cómic solo en los detalles
   (subrayados, flechas, sellos). Elegante, no gracioso.
2. Quince años — "Cómic Pop": colores plenos vibrantes (fucsia, amarillo,
   cian sobre negro o crema), tramas halftone, onomatopeyas en la bienvenida
   ("¡Mis 15!" dibujado como lettering), globos de texto para la frase;
   display cómica pero legible (no Comic Sans; pensá Bangers/Anton/Rubik Mono
   One o similares de Google Fonts) + sans redondeada.
3. Cumpleaños de adulto — "Fanzine": papel obra/ negro/ un flúo; tipografía
   grotesk condensada gigante, tramas gruesas, fotocopia (contraste alto,
   grano), stickers; texto de la frase en marquesina.
4. Opcional infantil — "Historieta": misma mecánica de viñetas con paleta
   primaria y globos de texto.

GESTOS OBLIGATORIOS DE LA COLECCIÓN
- Bienvenida: el nombre entra letra por letra (stagger) con desplazamiento y
  blur; el tipo de evento como sello en arco; el botón es un "globo" de cómic.
- Save the Date: la fecha ocupa toda la pantalla como titular de tapa; el
  año como folio; una trama halftone detrás.
- Countdown: cuatro números enormes en columnas de revista; los segundos
  cambian con "flip" de letra; etiquetas en marquesina.
- Frase: palabra por palabra, cada palabra con un color de fondo alternado
  (resaltador) y una palabra clave en globo de cómic.
- Cuándo y dónde: paneles pineados laterales, cada panel una viñeta con borde
  irregular y su onomatopeya sutil; funcional también apilado vertical.
- Check-in: el pase es una tarjeta "recortada de la revista" con líneas de
  corte; al confirmar aparece un sticker "CONFIRMADO" con rotación.
- Álbum: contact sheet / grilla de revista con folios; en desktop enmarcado.
- Tu pase: contratapa: QR grande, sello en arco, créditos como colofón.
- Foto de portada: gesto de luz propio = trama halftone que se disuelve para
  revelar la foto (mask animada) al bajar.
- Una sección "en cifras" dentro de Cuándo y dónde o Tu pase (ej. "15 años ·
  200 invitados · 1 noche"), con contadores, como hausofwords.
- El álbum o el cronograma como carrusel arrastrable (drag horizontal) al
  estilo "meet the squad" de marsrejects; sirve también para la corte de
  honor / padrinos si hay fotos.
- Opcional para la familia de cumpleaños: la invitación arranca en blanco y
  negro y el color entra al llegar a "Cuándo y dónde" (grayscale → color),
  como el golpe de color de ponpon-mania.

ENTREGA
Un .dc.html panorámico por familia (base) + tabla de variantes al pie, y una
tarjeta "handoff" con las fuentes elegidas (y por qué), los patrones SVG de
trama y los timings de los reveals por letra.
```

---

## 4. Prompts opcionales de moodboard (ChatGPT Image / Gemini), uno por colección

Como en `Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md`, conviene generar un moodboard y
adjuntarlo al prompt de Claude Design. Uno por colección:

- **A. Profundidad**: "Moodboard 3x3 para invitaciones digitales de lujo,
  estética de profundidad: salas oscuras azul-grafito con objetos de vidrio y
  metal (anillos, copas, arcos, estrellas facetadas, una corona) flotando a
  distintas distancias, perspectiva de túnel, luz champagne, tipografía serif
  fina; sin personas, sin texto, sin estética de videojuego."
- **B. Papel**: "Moodboard 3x3 de ilustración en papel recortado (cut-paper) en
  capas: cerros, jardín, skyline nocturno, mesa vista desde arriba con copas,
  figuras humanas estilizadas de proporciones alargadas sin rostro, sombras de
  recorte cortas, textura de papel, paleta crema/salvia/terracota y noche
  azul/rosa; sin texto, elegante, no infantil."
- **C. Tipográfica**: "Moodboard 3x3 de diseño editorial de revista con toques
  de cómic: dobles páginas con colores plenos de alto contraste (blanco roto,
  negro, rojo lacre, fucsia, amarillo, cian), tipografía display gigante,
  tramas halftone, viñetas con borde irregular, globos de texto, sellos en arco;
  sin personajes, sin texto legible."

---

## 5. Flujo completo, de punta a punta

1. (Opcional) Generar el moodboard de la colección con el prompt de §4.
2. En Claude Design, con el repo sincronizado: pegar **§1 (bloque común) +
   §3.x (la colección)** en un mensaje; adjuntar el moodboard.
3. Revisar que cada `.dc.html` tenga las 11 pantallas con `data-screen-label`,
   los paneles con `data-pan/data-strip`, la tabla de variantes y el handoff.
4. Guardar los archivos en `mockup/<coleccion>/<Nombre> - Panoramica.dc.html`.
5. Portar a React con `docs/GUIA_TECNICA_PLANTILLAS.md` (una Storytelling como
   base: `GuestPassVipTemplate.tsx`), generar variantes por script, wirear los
   8 puntos y agregar cada familia a `template-labels.ts`,
   `wizard-steps-config.ts` (`STORYTELLING_TEMPLATE_TIPOS`, porque usan el
   mismo mecanismo de paneles) y al gating por tipo de evento.

