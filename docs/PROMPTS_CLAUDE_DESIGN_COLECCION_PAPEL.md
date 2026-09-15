# Prompt para Claude Design — Colección E "Papel Prensado"

> Fecha: 2026-09-14. Basado en `docs/ANALISIS_RAMESTUDIO.md`: las 13
> invitaciones de ramestudio.net abiertas, filmadas y medidas en el DOM.
> Tiras de fotogramas para adjuntar: `mockup/inspire/webs/4*-rame-*.jpg`.
>
> Qué se pidió: una familia con **look de papel real, elegante y fina,
> distinta al resto, monocroma**. Prioridad casamiento y XV; mobile primero y
> escritorio compuesto; sin video.
>
> Mecanismo: **Flat** (flujo vertical de secciones apiladas, splash mobile, nav
> pill inferior, grid de escritorio 440px + columna de scroll), igual que la
> Colección D.
>
> Diferencia con la Colección D "Papelería Viva": aquélla es papelería clásica
> **ilustrada en color** (flores en acuarela, lacre bordó, vinilo). Ésta es
> papelería **prensada y monocroma**: el papel, el relieve y el aire llevan el
> peso, y el dibujo entra en tinta a un solo color — íconos hechos a mano, ramas
> de herbario, garabatos sueltos —, siempre sangrando por un borde de la hoja y
> siempre recoloreable por variante. Son complementarias, no competidoras.
>
> **Corrección sobre la primera versión de este documento:** decía "cero
> imágenes de ornamento" y estaba mal. El dibujo a mano es la mitad de lo que
> hace lindas a estas plantillas y no sale de un filtro CSS. Las láminas de
> assets a pedir están en §3, y las reglas de composición medidas (dónde va cada
> pieza, de qué tamaño y cuántas) dentro del prompt.

---

## 1. La idea (para que sepas qué pedís)

Las 13 referencias son un solo sistema con 13 pieles. Su fuerza no está en
ningún efecto: está en lo que **no** hacen. Trece invitaciones y cinco
animaciones en total, ninguna llamativa. Lo que queda cuando sacás todo lo
demás son tres cosas: una hoja de papel con grano, una letra en relieve y un
dibujo a mano apoyado en el borde de la hoja.

Y una cuarta, que es la letra: las referencias usan **Final Parade Script**, la
misma que compraste. Ya está instalada en el repo (§6).

Las tres primeras se consiguen de dos maneras distintas y conviene no
confundirlas.

**El papel y el relieve se hacen en CSS.** Ellos los hornean como PNG porque
están sobre Wix; nosotros no tenemos esa limitación, y ahí está una parte del
"algo distinto":

- **El papel es CSS** (`feTurbulence` en un `data:` URI de 400 bytes), así que
  se recolorea con una variable y cuatro variantes por familia salen gratis.
- **El relieve es CSS** (`text-shadow` de tres capas), así que el título sigue
  siendo texto: se traduce, se lee con lector de pantalla y se reemplaza por
  los datos reales del backend.
- Y como el relieve es una sombra viva y no un pixel, **puede reaccionar**: al
  scrollear, el ángulo de la luz gira 6° de ida y vuelta, como si la hoja se
  inclinara bajo una lámpara. Ninguna invitación del mercado hace eso.

Las dos recetas están probadas contra el PNG original de ramestudio antes de
escribir este prompt; la comparación está en
`mockup/inspire/webs/4x-rame-relieve-css-vs-png.jpg` y el prototipo completo de
una hoja en `mockup/inspire/webs/4x-rame-prototipo-css.jpg`.

**El dibujo, en cambio, se dibuja.** Los íconos hechos a mano, las ramas de
herbario y los garabatos sueltos son la otra mitad del encanto y no salen de un
filtro. Lo que sí podemos hacer mejor es cómo se usan: ellos generan cada pieza
con el color quemado adentro del PNG, y por eso `/botanico` y `/magnolia` no
tienen variantes de color. Nosotros las pedimos en **tinta a un solo color** y
las usamos como máscara CSS, así la misma rama sale verde salvia, oliva o
ceniza según la variante, sin regenerar un solo archivo.

**Las 29 piezas ya están cortadas** en `public/templates/` (12 íconos de línea
compartidos, 4 de herbario, 9 de trazo), con su inventario y sus dos modos de
uso en `public/templates/INVENTARIO_PAPEL_PRENSADO.md`; falta la lámina de
baraja española, cuyo prompt está en §3. Y hay una distinción que descubrí al
verificarlas y que importa: los íconos y los trazos son **tinta plana**
(luminancia 24-47), así que van como máscara CSS y toman el color de la
variante; el herbario está **pintado** con luces y sombras (luminancia 2-255),
así que la máscara lo aplastaría — va como imagen con un duotono de filtros, que
conserva el pintado y también da las cinco variantes. La baraja va en ese mismo
registro pintado.

Y sobre cómo se colocan, medí las siete familias con dibujo y las reglas son
pocas y estrictas: **toda pieza grande sangra por un borde de la hoja**, se usan
**dos o tres piezas reutilizadas en tres a cinco tamaños** (la familia mejor
compuesta usa literalmente dos archivos en toda la invitación), y **el ornamento
está quieto**: de 159 imágenes medidas, ninguna tiene rotación, opacidad parcial
ni modo de fusión. Todo eso está adentro del prompt, con números.

---

## 2. Prompt (pegar completo en Claude Design, con el repo sincronizado)

```text
CONTEXTO
Diseñás una colección nueva de plantillas de invitación digital para
altainvitacion.com (Argentina y Latinoamérica). Público principal: CASAMIENTOS
y QUINCE AÑOS; secundario: cumpleaños de adultos, corporativo, infantil. Ya
existen dos colecciones en producción: "Flat" (22 familias: flujo vertical de
secciones) y "Storytelling" (36 familias: pantallas completas con paneles
laterales). Esta colección, "PAPEL PRENSADO", usa el mecanismo FLAT.

Tenés el repo sincronizado. Antes de diseñar leé:
- docs/ANALISIS_RAMESTUDIO.md (LEELO PRIMERO Y ENTERO: son las mediciones
  reales de las 13 referencias, con los números exactos de geometría,
  movimiento y las dos recetas CSS ya probadas)
- Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md (arquitectura rígida de una plantilla
  Flat: estado, toggle Celular/Escritorio, buildStyles, splash, grid 440px 1fr,
  parallax de la foto, 10 slots de doodle, 9 secciones)
- docs/GUIA_TECNICA_PLANTILLAS.md (cómo se porta a React)
- mockup/nuevo/Plantillas Casamiento.dc.html (formato de entrega Flat)
- src/components/templates/ChicTemplate.tsx (una Flat clara ya portada)
- src/lib/schemas/invitation.ts (campos reales; no inventes otros)
- public/templates/INVENTARIO_PAPEL_PRENSADO.md (las 29 piezas ya cortadas: ruta,
  medida, peso, para qué es cada una y cómo se usa cada set)
Adjunto tiras de fotogramas de las 13 referencias
(mockup/inspire/webs/4*-rame-*.jpg). Son la referencia de LOOK, no de contenido.
No las copies: el objetivo es hacer lo mismo pero con el papel y el relieve en
CSS en vez de horneados como PNG, con el ornamento recoloreable por variante, y
con el relieve vivo.

FORMATO DE ENTREGA (no negociable)
- Un archivo .dc.html panorámico por familia, "<Nombre> - Panoramica.dc.html",
  con las dos vistas (Celular 430x932 y Escritorio 1440x900) en el mismo
  componente y el toggle arriba, igual que mockup/nuevo/*.dc.html.
- Solo HTML + CSS + SVG inline + JS plano. NADA de WebGL, GSAP, Lottie, Rive,
  canvas ni video.
- QUÉ VA EN CSS Y QUÉ VA EN DIBUJO, que no es lo mismo:
  * El PAPEL, el RELIEVE y el PLIEGUE van en CSS: grano con feTurbulence en un
    data: URI, relieve con text-shadow, esquina con clip-path. No uses imágenes
    para nada de eso.
  * Los FILETES, marcos, reglas y el monograma van en SVG inline dibujado por
    vos, trazo 0,75-1 px.
  * El ORNAMENTO DIBUJADO (íconos de línea hechos a mano, ramas, garabatos,
    piezas de baraja) va en PIEZAS WebP con transparencia que YA EXISTEN,
    cortadas y listas. No las inventes ni las describas para generar: leé
    public/templates/INVENTARIO_PAPEL_PRENSADO.md antes de componer y usá sólo
    las de tu familia más el set compartido de íconos. Son 25 piezas cortadas:
    12 íconos de línea, 4 de herbario y 9 de trazo (las 5 de baraja están
    pendientes de generar; si todavía no están, no hagas esa familia).
    Hay DOS formas de usarlas y no son intercambiables:
      - iconos-linea y trazo son TINTA PLANA: van como máscara CSS
        (mask / -webkit-mask con background: var(--t-acc)), y así toman el
        color de cada variante sin generar un archivo por color.
      - herbario y baraja están PINTADOS con luces y sombras: la máscara los
        aplastaría en una mancha. Van como <img> y se tiñen con un duotono de
        filtros; los cinco valores probados están en el INVENTARIO.
    En los dos casos: alt="", aria-hidden="true" y pointer-events:none.
  * Las fotos reales entran solo por los campos del backend (bloque FOTO).
- LA TIPOGRAFÍA SCRIPT ES UN ARCHIVO DEL REPO, NO DE GOOGLE FONTS. En el
  .dc.html declarala así, tal cual, arriba de todo:
    @font-face{ font-family:'Final Parade Script';
                src:url('/fonts/final-parade-script.woff2') format('woff2');
                font-weight:400; font-display:swap; }
  y usala como font-family:'Final Parade Script', cursive. NO la pidas a
  fonts.googleapis.com (no existe ahí) y NO la reemplaces por Great Vibes,
  Parisienne ni ninguna otra. Las otras dos fuentes (la serif y la sans) sí van
  de Google Fonts con <link>.
- LAS RUTAS DE PIEZAS Y FUENTE SON RAÍZ-RELATIVAS: /templates/<set>/<pieza>.webp
  y /fonts/final-parade-script.woff2. Escribilas así aunque en el canvas no se
  previsualicen: así es como resuelven una vez portadas a Next.js. Para componer
  sabiendo cómo es cada pieza, mirá mockup/inspire/webs/4y-piezas-cortadas.jpg,
  que las muestra a escala con su nombre.
- Movimiento con CSS (@keyframes, transitions), IntersectionObserver y el
  progreso de scroll leído en requestAnimationFrame. Se portará a
  framer-motion + anime.js (onScroll). Respetá prefers-reduced-motion: con
  reduced-motion todo aparece sin fundido ni rotación, y el relieve queda
  quieto en su ángulo de reposo.
- Español neutro, cálido y sobrio. Nada de emojis.

MOBILE PRIMERO, ESCRITORIO COMPUESTO
- Celular: splash a pantalla completa con el nombre del invitado y botón
  "Abrir invitación"; al abrir, secciones apiladas y nav pill inferior
  (existe: BottomNavPill). Botones de 48px, datos nunca por debajo de 14px,
  contraste AA, safe areas.
- El splash de esta colección es QUIETO: una hoja centrada, el nombre del
  invitado en relieve y el botón. Al abrir, la hoja NO vuela ni se rompe: se
  desvanece en 900 ms mientras la portada sube 24 px. La sobriedad es el
  producto; cualquier gesto espectacular acá lo arruina.
- Escritorio: el grid Flat de 440px + columna de scroll. La columna fija es una
  hoja de papel de proporción A (una sola, grande) con la foto, los nombres y
  la nav numerada impresa al pie. Las secciones se leen a la derecha, cada una
  en su propia hoja.
- Presupuesto para un Android de gama media: solo transform y opacity
  animados; máximo 3 elementos grandes en movimiento; sin blur animado.
- Mostrá el splash con "Valentina" y con "María Florencia".

SECCIONES (las 9 de Flat, mismo orden, sin agregar ni quitar):
 Portada → Countdown → Frase → Detalles del evento (salón; ceremonia si
 ceremoniaHabilitada; cómo llegar con mapUrl; cronograma con
 cronogramaEventos; dress code) → Álbum (galeriaPrincipalFotos; albumStyle
 carrusel/solapadas) → Mapa → RSVP (RSVPWizardV2) → Datos bancarios / regalo
 (BankDetailsCard, puede haber dos) → Sugerí una canción (+ botón de música)
 → Footer (crédito altainvitacion.com). Además: quiz opcional
 (triviaHabilitada), pase con QR (QrDeIngreso, número de pase, mesa), info
 adicional (alojamiento, estacionamiento, transporte) y estado post-evento
 (solo álbum). Los 10 slots de doodle de la guía son fijos en cantidad y
 posición: acá los llenás con las piezas WebP de tu familia siguiendo las
 reglas de composición de abajo.

NUMERACIÓN DE SECCIONES (tomado de las referencias, es gratis y ordena todo):
 cada sección lleva arriba, centrado, su número en serif ligera a 26 px con
 punto: "01." "02." … "09.". Encima del número, nada. Debajo, el título.

DATOS: solo campos de src/lib/schemas/invitation.ts y Guest (name,
expectedCount, status, orderNumber). Fecha futura (2027), salón en Córdoba o
Buenos Aires, datos realistas.

VARIANTES: paleta base + 4 variantes por familia (nombre en español + hex de
papel, papel alterno, tinta, tinta suave, sombra del relieve). Como el papel es
CSS, la variante cambia el TONO DEL PAPEL, no un color de acento: es una
colección monocroma y tiene que seguir siéndolo en las cinco variantes.
Handoff al final del archivo: variantes, fuentes, y cada animación (nombre,
duración, easing, stagger, ángulo).

=========================================================================
GEOMETRÍA — VALORES MEDIDOS, USALOS TAL CUAL
=========================================================================
- La unidad de composición es LA HOJA. Todo vive dentro de hojas; no hay
  secciones a sangre salvo una (la de la frase).
- Ancho de la hoja: 94 % del ancho disponible (margen lateral 3 %).
- Proporción de la hoja de portada: 301:432 (0,697, una hoja A). Las demás
  crecen con el contenido pero nunca bajan de 0,60.
- Sombra de la hoja: -1.41px 1.41px 4px rgba(<sombra>,.40). Son 2 px a 45°
  hacia abajo y a la izquierda: LA LUZ VIENE DE ARRIBA A LA DERECHA. Todo el
  relieve de la colección tiene que respetar esa misma dirección.
- Filete interior: inset 14px, 0,5px sólido, radio 6px, color de sombra al 34 %.
- Esquina plegada (dos por hoja, superior derecha e inferior izquierda, 26 px):
    clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 26px,
                       100% 100%, 26px 100%, 0 calc(100% - 26px));
  y el dorso del pliegue con dos cuadrados de 26 px en ::before/::after con
  gradiente a 225° y 45° de rgba(<sombra>,.34) a transparente.
- Separación entre hojas: 22 px.
- Largo total en celular: entre 6 y 8,5 pantallas. Si te pasás, sacá aire de
  las secciones de datos, nunca de la portada.

=========================================================================
COMPOSICIÓN DEL ORNAMENTO — REGLAS MEDIDAS, SON LO QUE HACE LINDA A LA HOJA
=========================================================================
Medidas sobre las siete familias con dibujo de las referencias. Los tamaños van
como fracción del ancho de la hoja (301 px en celular), no en píxeles.

1) TODA PIEZA GRANDE SANGRA POR UN BORDE. Ninguna flota en el medio de la hoja.
   - De esquina: ancho 0,28-0,38, pegada al borde izquierdo (left: -5% a 0),
     en el tercio inferior (top 55-74 %). Entra cortada desde afuera.
   - De cabecera: ancho 0,40-0,63, arriba a la derecha (left 37-56 %,
     top 0-10 %), cortada por el borde superior.
   - Vertical de costado: ancho 0,45, corriendo dos tercios de la altura de la
     portada, cortada arriba y abajo.
   - Par espejado: la misma pieza a left 0 y left 67 %, una de ellas con
     transform: scaleX(-1). Es el recurso más barato para llenar una hoja.
2) DOS O TRES PIEZAS POR FAMILIA, REUTILIZADAS EN TRES A CINCO TAMAÑOS. La
   referencia con mejor composición usa DOS archivos en toda la invitación: una
   ramita de esquina a dos tamaños y una rama horizontal a tres. No pidas ni uses
   una pieza distinta por sección: la riqueza sale de repetir a distintas
   escalas, no de acumular dibujos.
3) EL ÍCONO DE LÍNEA VA ARRIBA DEL NÚMERO DE SECCIÓN, centrado, ancho 0,19 de la
   hoja (rango 0,10-0,30). Uno por sección, siempre el mismo para la misma
   sección en todas las familias: así las cuatro se leen como una colección.
4) EL ORNAMENTO ESTÁ QUIETO. Cero rotación, cero opacidad parcial, cero
   mix-blend-mode. Las 159 imágenes medidas en las referencias tienen
   transform:none, opacity:1 y blend normal. Entra con el mismo fundido de
   1200 ms del resto de la sección y se queda donde está. Un ornamento que rota,
   late o brilla rompe el registro entero.
5) NUNCA ORNAMENTO SOBRE TEXTO. Si se pisan, gana el texto: mové la pieza o
   achicala. El ornamento vive en los márgenes de la hoja.
6) COMO ES TINTA A UN COLOR, se usa de máscara y se recolorea por variante:
     .orn-rama{ width:38%; background:var(--t-acc);
       -webkit-mask:url(/templates/<familia>/rama.webp) no-repeat center/contain;
               mask:url(/templates/<familia>/rama.webp) no-repeat center/contain; }
   Eso es lo que las referencias NO pueden hacer (tienen el color quemado en el
   PNG) y por eso no tienen variantes de color. Nosotros sí.

=========================================================================
LAS DOS RECETAS CENTRALES — YA PROBADAS, NO LAS REINVENTES
=========================================================================
GRANO DE PAPEL (400 bytes, se tilea solo, se tiñe con la variable):
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23f)' opacity='0.30'/></svg>");
  baseFrequency 0.85 en el FONDO DE PÁGINA y 1.1 dentro de la HOJA. El grano
  más fino adentro que afuera es lo que hace que se lean como dos papeles
  distintos. Sobre papel oscuro subí la opacity a 0.42.

RELIEVE (letra prensada hacia afuera, sobre papel claro):
  color: <papel oscurecido un 4 %>;
  text-shadow:
    -1px -1px 0   rgba(<sombra>,.55),
     1px  1px 0   rgba(255,255,255,.92),
     2px  3px 4px rgba(<sombra>,.20);
HUECO (letra prensada hacia adentro; es la variante para papel oscuro):
  color: <papel aclarado un 3 %>;
  text-shadow: 0 -1px 0 rgba(255,255,255,.90),
               0  1px 1px rgba(<sombra>,.50),
               0  2px 3px rgba(<sombra>,.12);
El cuerpo de la letra va MÁS OSCURO que el papel, no más claro. Si lo hacés
más claro se ve inflado y de plantilla gratis. Probá el resultado contra
mockup/inspire/webs/4x-rame-relieve-css-vs-png.jpg.
El relieve se usa SOLO en: nombres de la portada, títulos de sección y el
número grande del countdown. Nunca en texto corrido ni en datos: ahí es
ilegible.

=========================================================================
MOVIMIENTO — VALORES MEDIDOS
=========================================================================
1) ENTRADA DE SECCIÓN (la única entrada de toda la colección):
   opacity 0 → 1 en 1200 ms, easing cubic-bezier(.22,.61,.36,1),
   junto con transform: perspective(800px) rotateY(6deg) translateY(10px)
                     → perspective(800px) rotateY(0)    translateY(0)
   La rotación se consume en los primeros ~350 ms; el fundido sigue hasta
   1200 ms. Disparada por IntersectionObserver al 15 % de visibilidad, una sola
   vez. 1,2 s es largo a propósito: es el ritmo de la colección, no lo acortes.
   Stagger entre los bloques de una misma hoja: 120 ms. Nunca stagger por letra.
2) FONDO FIJO, SIN PARALLAX:
   el grano de la página va en un elemento position: fixed detrás de todo. No
   hay ni un solo elemento con factor de parallax distinto de 1. La profundidad
   sale de que las hojas pasan por encima de una textura quieta.
3) BARRA SUPERIOR:
   sticky, 38 px, fondo rgba(<papel>,.94) con backdrop-filter: blur(6px) y una
   línea de 1 px al pie. Izquierda "MENÚ", centro "V | M · 14•03•27", derecha
   el ícono de menú, todo en versalitas de 10 px con 0,39 em de tracking.
   Al scrollear: opacity 1 → 0 y translateY 0 → -18px en 300 ms.
   Al frenar: espera 370 ms y vuelve en 350 ms.
4) LA LUZ QUE GIRA (esto es NUESTRO, ninguna referencia lo tiene):
   mientras se scrollea, el ángulo del relieve de los títulos visibles gira de
   -3° a +3° respecto de su reposo y vuelve, siguiendo el progreso de scroll
   leído en requestAnimationFrame. Se implementa interpolando los offsets de
   las dos primeras capas del text-shadow sobre un círculo de radio 1,4 px:
     dx = 1.4*cos(a), dy = 1.4*sin(a), con a = -135° ± 3°
   y el par claro en el ángulo opuesto. Amplitud máxima 3°, nunca más: tiene
   que notarse como que la hoja respira, no como que el texto vibra. Se apaga
   con prefers-reduced-motion.
5) COUNTDOWN DE CONFIRMACIÓN (tomado de las referencias):
   dentro del RSVP, antes del formulario, un segundo contador: "QUEDAN / 25 /
   DÍAS PARA CONFIRMAR TU ASISTENCIA", con el número en relieve al mismo
   tamaño que el countdown del evento. Es el único momento de la invitación que
   pide algo, y por eso va sobrio.
6) LO QUE ESTÁ PROHIBIDO:
   parallax, stagger por letra, blur animado, glow, partículas, brillos,
   destellos sobre la foto, scroll secuestrado, contadores que suben solos,
   cualquier cosa que rote más de 6° y cualquier animación de más de 1,2 s.

=========================================================================
TIPOGRAFÍA — ESCALA MEDIDA
=========================================================================
Tres fuentes de Google Fonts, no más:
- SERIF DE DISPLAY, peso ligero, para nombres, números grandes y numeración de
  sección: Cormorant Garamond 300 (primera opción) o Bodoni Moda 400. Es la
  fuente de la colección; usala en italic para los títulos de sección cuando la
  familia no lleve script.
- SCRIPT: **Final Parade Script**, obligatoria, no la cambies por una de Google.
  Es la misma que usan las referencias y ya está en el repo. Peso 400, el único
  que hay. En el .dc.html va con el @font-face de arriba; cuando se porte a
  React ya está registrada con next/font/local y se usa como
  var(--font-final-parade, 'Final Parade Script'), cursive. Sólo para títulos de sección, el "&"
  de la portada y la frase de cierre: una palabra o una frase corta por vez,
  nunca un párrafo ni un dato.
  OJO, ESTO SE MIDIÓ Y ES UNA RESTRICCIÓN REAL: el trazo es monolineal y muy
  fino, así que el relieve estándar se la come. Las reglas son:
    * En TINTA PLANA: de 30 a 36 px. Así la usan las referencias (miden 29 px)
      y así se lee perfecto. Es la opción por defecto.
    * En RELIEVE: mínimo 56 px, y con el contraste reforzado, no el estándar:
        color: <papel −8 %>;
        text-shadow: -1.5px -1.5px 0 rgba(<sombra>,.80),
                      1.5px  1.5px 0 rgba(255,255,255,1),
                      3px    4px  5px rgba(<sombra>,.26);
    * NUNCA: relieve estándar a tamaño de título (46 px o menos). Se borra.
    * NUNCA por debajo de 28 px, ni en mayúsculas, ni con letter-spacing.
  La comparación de las cinco opciones está en
  mockup/inspire/webs/4z-final-parade-relieve-vs-plana.jpg.
- SANS para datos, versalitas y kickers: Jost 300 (primera opción) o Archivo.

Escala medida en las referencias, respetala:
- Kicker / versalitas chicas: 10 px, tracking 0,39 em, mayúsculas. Ese tracking
  enorme en el texto más chico es LA firma de la fineza; si lo bajás, la
  colección se cae.
- Datos (fecha, ciudad, hora): 13 px, tracking 0,16 em, mayúsculas.
- Numeración de sección: serif 300, 26 px, con punto.
- Título de sección: Final Parade en tinta plana 34 px (por defecto), o en
  relieve reforzado 56-72 px, o serif italic 34 px cuando la familia no lleve
  script.
- Nombres de portada: serif 300, 38 px, una línea por nombre, el "&" en Final
  Parade a 34 px en la línea del medio (en relieve va con el serif, porque el
  "&" es un solo glifo grande y ahí sí aguanta).
- Número grande del countdown: serif 300, 86 px, line-height 0,9.
- Texto corrido: 15 px, line-height 1,75, nunca menos de 14 px.

=========================================================================
FAMILIAS (base + 4 variantes cada una). Las dos primeras son la prioridad; la
quinta es opcional. Las cinco comparten el set de íconos de línea.
=========================================================================
1. CASAMIENTO — "PRENSA"
   La familia pura: papel crema, sin botánica, todo el peso en el relieve y el
   aire. Único ornamento: los íconos de línea compartidos, uno por sección. Es
   la que más se parece a /emboss y /editorial y la que mejor muestra de qué se
   trata la colección.
   Piezas: sólo public/templates/iconos-linea/ (el set compartido de 12).
   Papel #F4ECE2, papel alterno #EFE5D9, tinta #514842, tinta suave #8A756D,
   sombra 120,103,86.
   Variantes (cambia el tono del papel, NUNCA se agrega color de acento):
   "Lino" #F4ECE2 · "Hueso" #F8F4EE · "Arena" #EDE3D4 · "Piedra" #E4DED6 ·
   "Humo" #DCD8D2.
   Portada: hoja A, kicker "¡NOS CASAMOS!", nombres en serif con relieve, "&"
   en script, filete de 38 px, fecha y ciudad en versalitas. La foto NO va en
   la portada: va recién en la sección de álbum, y entra como una hoja más, con
   un margen de papel de 10 px alrededor, como una foto pegada.
   Countdown: número en relieve a 86 px, "FALTAN" arriba y "DÍAS" abajo en
   versalitas.
   Cronograma: línea de tiempo vertical con un filete de 0,5 px y un punto de
   3 px por hito; la hora en versalitas a la izquierda, el hito en serif italic
   a la derecha. Cada ítem entra con el fundido de 1,2 s y 120 ms de stagger.
   Detalles: acordeones con una línea de 0,5 px entre filas y un signo "+" que
   rota 45° al abrir; la respuesta se despliega en 400 ms.
   RSVP: countdown de confirmación + RSVPWizardV2. Al confirmar, el texto
   "CONFIRMADO" aparece en relieve HUECO (como prensado en la hoja) creciendo
   de 0,96 a 1 en 500 ms. Sin sellos, sin color, sin confeti.
   Escritorio: la columna fija es UNA hoja A grande con los nombres en relieve
   y la nav numerada impresa al pie en versalitas.

2. QUINCE — "HERBARIO"
   Papel crema y un solo verde apagado. Es /botanico, /magnolia y /pampagrass:
   ramas, hojas y espigas de lámina de herbario, teñidas de ese único verde. No
   es un acento de color: es la tinta de un sello de botánica, y no aparece en
   ningún otro lado de la invitación.
   Papel #F7F2EA, papel alterno #F1EADF, tinta #45443C, tinta suave #857F70,
   trazo botánico #6E7A5E, sombra 116,110,92.
   Variantes: "Salvia" #6E7A5E · "Eucalipto" #7C8B7A · "Oliva" #7A7A55 ·
   "Ceniza" #8A8A82 · "Tinta" #55605C.
   Piezas: public/templates/herbario/ (rama-esquina, rama-cabecera, magnolia,
   hoja) + el set compartido de íconos de línea.
   Ornamento: las TRES piezas y nada más, reutilizadas en cinco tamaños según
   las reglas de composición de arriba. rama-esquina en el tercio inferior
   izquierdo sangrando por el borde; rama-cabecera arriba a la derecha cortada
   por el borde superior; magnolia sólo en la portada y en la columna fija de
   escritorio, corriendo dos tercios de la altura. Van como <img> con el duotono
   de la variante (NO como máscara). Quietas: no rotan ni cambian de opacidad.
   Portada: nombre de la quinceañera en serif a 44 px con relieve, "MIS XV" en
   versalitas con 0,39 em, ramita en la esquina superior derecha.
   Countdown: el número grande y, alrededor, un círculo de 0,75 px con doce
   marcas finas, como un herbario prensado bajo vidrio.
   Álbum: polaroids con 10 px de margen de papel y una cinta de papel SVG en la
   esquina; nada de sombras grandes.
   RSVP: al confirmar, tres hojitas (herbario/hoja.webp, a 24 px) caen
   desde arriba de la hoja y se apoyan, en 900 ms, con easing
   cubic-bezier(.22,.61,.36,1). Es el único momento con movimiento "de más" de
   toda la colección y la única excepción a la regla de ornamento quieto.
   Escritorio: la columna fija lleva la foto con margen de papel y una rama
   larga que la cruza en diagonal, cortada por los dos bordes.

3. CASAMIENTO / CORPORATIVO / CUMPLE ADULTO — "NOCHE"
   La piel oscura (/noir). Papel negro con grano, tinta hueso, relieve HUECO en
   vez de relieve saliente, filete interior más presente.
   Papel #141414, papel alterno #1C1C1A, tinta #F6EBE4, tinta suave #A89C93,
   sombra 0,0,0 (y la luz del relieve en rgba(255,255,255,.14), no .92: sobre
   negro la luz es mucho más tenue).
   Variantes: "Carbón" #141414 · "Tinta" #16191F · "Vino" #1B1315 ·
   "Bosque" #121A16 · "Bronce" #1A1611.
   OJO con el grano: sobre negro, feTurbulence a opacity 0.42 y baseFrequency
   1.1 dentro de la hoja. Si queda plano, se ve barato.
   Monograma: dos iniciales en serif dentro de un óvalo de 0,75 px, arriba de
   los nombres.
   Íconos de sección: el set compartido de public/templates/iconos-linea/,
   usados como máscara con background: var(--t-ink) para que salgan en hueso
   sobre el negro. Ancho 0,19 de la hoja, uno por sección, arriba del número.
   Para corporativo: misma familia, monograma reemplazado por el logo del
   cliente en un slot de 120x40, y el cronograma pasa a ser la agenda.
   Escritorio: la columna fija es una hoja negra con el filete interior y el
   monograma; la foto entra en la columna derecha.

4. CASAMIENTO / XV — "TRAZO"
   La informal de la colección, y la que el cliente señaló como "parece dibujado
   a mano" (/doodles). Mismo papel y mismo relieve que Prensa, pero la hoja está
   recorrida por trazos sueltos: una línea larga y curva que bordea el papel, dos
   corazones a mano alzada, destellos. Nada de botánica.
   Papel #F6F1E9, papel alterno #EFE8DC, tinta #3C3A35, tinta suave #7E7A70,
   sombra 112,106,94.
   Variantes: "Grafito" #3C3A35 · "Tinta" #2E3A4A · "Terracota" #8A5340 ·
   "Verde" #3F5347 · "Ciruela" #54364A.
   Piezas: public/templates/trazo/ (garabato-largo, garabato-corto,
   corazon-grande, corazon-chico, marco-circular, destello-1..4) + el set
   compartido.
   Composición: el garabato-largo va pegado al borde izquierdo o derecho de la
   hoja, sangrando arriba y abajo, a 0,30 de ancho; el corto cierra la esquina
   inferior contraria. Nunca los dos del mismo lado. El marco-circular sólo
   rodea el número del countdown.
   El trazo es el color de la variante, así que la misma familia pasa de
   cuaderno a lápiz de color sin regenerar nada.
   Escritorio: la columna fija lleva el garabato-largo cruzando la foto por
   detrás.

5. CASAMIENTO / XV / CUMPLEAÑOS — "BARAJA"
   La invitación es una mano de cartas de BARAJA ESPAÑOLA. No de póker: nada de
   corazones, tréboles, picas ni diamantes, nada de "J Q K", nada de dar vuelta
   la carta. Los palos son oros, copas, espadas y bastos.
   Papel #F6EFE4, papel alterno #EFE6D6, tinta #34302C, tinta suave #8A7A72,
   sombra 120,103,86.
   Variantes (el duotono de las piezas y el color de las pintas cambian juntos):
   "Oro viejo" #9A7B3F · "Vino" #7A2F3A · "Verde mesa" #2F5244 ·
   "Tinta" #2B3A57 · "Ceniza" #6E6A62.
   Piezas: public/templates/baraja/ (as-de-copas, as-de-oros, ancho-de-espada,
   ancho-de-basto, espada-y-basto) + el set compartido de íconos de línea.
   Van como <img> con el duotono de la variante, NO como máscara: están
   pintadas con luces y sombras, igual que el herbario.

   EL GESTO PROPIO DE ESTA FAMILIA: LAS PINTAS.
   En la baraja española, el marco de cada carta se interrumpe una cantidad
   distinta de veces según el palo, y así se sabe el palo sin ver el dibujo:
     oros    = marco continuo, SIN cortes
     copas   = 1 corte arriba y 1 abajo
     espadas = 2 cortes arriba y 2 abajo
     bastos  = 3 cortes arriba y 3 abajo
   Adoptalo tal cual: el filete interior de cada hoja lleva la pinta del palo
   que le toca a esa sección, y la viñeta de la sección es la silueta de ese
   palo. El invitado no va a saber por qué, pero va a sentir que las secciones
   están ordenadas en cuatro grupos. Repartilos así:
     COPAS   → portada, cuenta regresiva, frase
     OROS    → detalles del evento, mapa, regalos y datos bancarios
     ESPADAS → RSVP, pase con QR, confirmación
     BASTOS  → álbum, canción, cierre
   Se hace con el mismo filete inset 14px de siempre: en vez de un borde
   entero, cuatro segmentos SVG con los huecos en el centro de cada lado. El
   hueco mide 18 px y el corte doble o triple se separa 10 px. En la hoja de
   oros el filete va entero, sin tocar.

   Portada: EL ESCUDO DE LA PAREJA. La pieza espada-y-basto cruzados, centrada,
   ancho 45 % de la hoja, y debajo los nombres en serif con relieve. El ancho de
   espada y el ancho de basto son las dos cartas más altas del truco: son la
   pareja, y esa es toda la idea de la familia. Si la variante es para XV o
   cumpleaños, en vez del escudo va el as de copas solo.
   El número de sección va DOS VECES, en la esquina superior izquierda y en la
   inferior derecha rotado 180°, como el índice de una carta. Es el único lugar
   donde el número se repite.

   Countdown: el as de oros centrado, ancho 55 %, con el número de días en
   serif 86 px en relieve encima del medallón. El oro no gira: está quieto como
   todo el ornamento.
   Detalles del evento: as de oros de cabecera, arriba a la derecha, ancho 40 %,
   cortado por el borde superior.
   Álbum: las fotos como cartas de una mano abierta — tres tarjetas con el mismo
   filete y la misma proporción 301:432, superpuestas y rotadas -6°, 0° y +6°.
   Es rotación de COMPOSICIÓN, no de animación: entran con el fundido de
   siempre y se quedan quietas.
   RSVP: el ancho de espada vertical pegado al borde izquierdo, sangrando arriba
   y abajo, ancho 22 %. Al confirmar, el texto "CONFIRMADO" en relieve hueco,
   igual que en Prensa. Sin barajar, sin repartir, sin voltear.
   Canción y cierre: el ancho de basto del otro lado, en espejo.
   As de copas: esquina inferior izquierda de la portada y del cierre, ancho
   32 %, sangrando por el borde.

   Escritorio: la columna fija es una carta entera de proporción 301:432 con el
   escudo, los nombres y la nav numerada al pie; las pintas de la columna son
   las de copas.

   LO QUE NO SE HACE, aunque tiente: barajar, repartir, abanicar con animación,
   voltear cartas, "elegí una carta", dorso de naipe repetido como fondo,
   números romanos, sota/caballo/rey. Todo eso convierte una idea en un truco
   de fiesta. El movimiento sigue siendo el mismo de la colección: fundido de
   1200 ms y rotateY de 6°, nada más.

=========================================================================
CHEQUEO ANTES DE ENTREGAR
=========================================================================
- ¿Hay alguna imagen que no venga de un campo del backend o del INVENTARIO?
  Si sí, sacala.
- ¿Toda pieza grande sangra por un borde de la hoja? ¿Ninguna flota en el medio?
- ¿Usaste dos o tres piezas reutilizadas, en vez de una distinta por sección?
- ¿El ornamento quedó quieto (sin rotación, sin opacidad parcial, sin blend)?
- ¿El relieve se lee sobre el papel a 320 px de ancho, en un celular al sol?
  Si dudás, subí el contraste de la sombra, no el tamaño.
- ¿Todas las animaciones duran 1,2 s o menos y son solo opacity y transform?
- ¿Las versalitas chicas tienen 0,39 em de tracking?
- ¿Final Parade quedó en tinta plana a 30-36 px, o en relieve reforzado a 56 px
  o más? ¿No quedó ningún título con relieve estándar?
- ¿La script se declaró con @font-face apuntando a /fonts/final-parade-script.woff2
  y NO se pidió a Google Fonts?
- ¿Las rutas de las piezas son /templates/<set>/<pieza>.webp, con los nombres
  exactos del INVENTARIO? (no inventes nombres: si una pieza no está en la
  tabla, no existe)
- ¿Las piezas de herbario y baraja van como <img> con filtro, y las de
  iconos-linea y trazo como máscara? (al revés queda mal en los dos casos)
- En Baraja: ¿cada hoja lleva la pinta de SU palo (oros 0 cortes, copas 1,
  espadas 2, bastos 3)? ¿No se coló ningún palo de póker?
- ¿Las cinco variantes siguen siendo monocromas?
- ¿El texto corrido bajó de 14 px en algún lado?
- ¿Se ve bien con prefers-reduced-motion activado?
```

---

## 3. Las láminas de assets — YA ESTÁN HECHAS Y CORTADAS

Tres de las cuatro láminas se generaron, se cortaron y quedaron listas:
**25 piezas** en `public/templates/`, con su inventario en
`public/templates/INVENTARIO_PAPEL_PRENSADO.md`. **No hay que volver a
generarlas.** La cuarta, la de baraja española, está pendiente: su prompt es el
de la Lámina 3, más abajo.

| Set | Piezas | Peso | Cómo se usa |
|---|---|---|---|
| `iconos-linea` | 12 (iglesia, copas, anillos, tarjeta, sobre, confeti, polaroids, nota-musical, torta, reloj, auto, regalo) | 225 KB | máscara CSS |
| `herbario` | 4 (rama-esquina, rama-cabecera, magnolia, hoja) | 277 KB | `<img>` + duotono |
| `trazo` | 9 (garabato-largo/corto, 2 corazones, marco-circular, 4 destellos) | 101 KB | máscara CSS |
| `baraja` | 5 (as-de-copas, as-de-oros, ancho-de-espada, ancho-de-basto, espada-y-basto) | — | **pendiente**: `<img>` + duotono |

Las capturas de control: `mockup/inspire/webs/4y-piezas-cortadas.jpg` (las 29 a
escala) y `4y-herbario-variantes.jpg` (una rama en las cinco variantes).

Los prompts de abajo quedan por si más adelante querés piezas nuevas.

Reglas para las cuatro láminas:
- Cuadrada, 1500×1500 o más, **fondo transparente**.
- Las piezas separadas entre sí por al menos 40 px de vacío, sin tocarse ni
  superponerse. Es lo que me permite recortarlas por etiquetas sin que se mezclen.
- **Tinta a UN SOLO color** (gris oscuro #3A342E sobre transparente). Nada de
  color, nada de sombras, nada de fondo. El color lo pone la variante con una
  máscara CSS.
- Trazo de peso uniforme y puntas redondeadas.

### Lámina 0 — Íconos de línea (la comparte TODA la colección)

```text
Generá una lámina cuadrada de 1500x1500 px, fondo TRANSPARENTE, con 12 íconos
dibujados a mano, separados entre sí por al menos 40 px de espacio vacío, en
una grilla de 4 columnas x 3 filas.

Estilo: línea única de peso uniforme, puntas redondeadas, trazo con temblor de
mano evidente (dibujados, no vectorizados), SIN relleno, SIN sombra, SIN color:
todo en gris oscuro #3A342E sobre transparente. Cada ícono cabe en un cuadrado
imaginario de 300 px y ocupa unos 220 px. Estética de cuaderno de bocetos de una
diseñadora de bodas: delicado, fino, nada infantil, nada de clipart.

Los 12 íconos, en este orden:
 1. Dos anillos de compromiso en una cajita abierta, con un destello arriba.
 2. Una iglesia chiquita con campanario y una cruz, dos destellos al costado.
 3. Dos copas de champán brindando, con tres chispas.
 4. Una tarjeta doblada parada, con un corazón chico en el frente.
 5. Un sobre abierto con un tilde adentro.
 6. Un cono de confeti explotando, con corazoncitos y estrellitas.
 7. Dos fotos polaroid apiladas y giradas, con un corazón en la de arriba.
 8. Una nota musical doble con dos corazones colgando.
 9. Una torta de dos pisos con una velita.
10. Un reloj de agujas simple.
11. Un auto de costado con dos latitas atadas atrás.
12. Una cajita de regalo con un moño.

Nada de texto, nada de marcas de agua, nada de firma.
```

### Lámina 1 — Herbario (familia 2)

```text
Generá una lámina cuadrada de 1800x1800 px, fondo TRANSPARENTE, con 4 piezas
botánicas separadas entre sí por al menos 60 px de espacio vacío.

Estilo: ilustración botánica delicada, dibujada a mano, en UN SOLO color gris
oscuro #3A342E sobre transparente, sin color, sin sombra, sin fondo. Trazo fino
con relleno suave en las hojas (tipo lápiz o acuarela de un solo tono), NO línea
pura. Elegante y seco, estilo lámina de herbario antiguo.

Las 4 piezas:
 1. RAMA DE ESQUINA: un ramito de eucalipto con tres florcitas chicas, que
    crece en diagonal desde abajo a la izquierda hacia arriba a la derecha.
    Formato vertical, unas 600x760 px.
 2. RAMA DE CABECERA: una rama horizontal de hojas finas y espigas, más ancha
    que alta, unas 900x380 px, con el tallo entrando desde la izquierda.
 3. RAMA VERTICAL: una rama larga y angosta de magnolia con dos flores
    abiertas y varias hojas, muy vertical, unas 400x1400 px.
 4. HOJITA SUELTA: una sola hoja ovalada con su tallito, unas 180x220 px.

Cada pieza completa y entera, sin cortar por el borde de la lámina. Nada de
texto, nada de marco, nada de firma.
```

### Lámina 2 — Trazo (familia 4)

```text
Generá una lámina cuadrada de 1500x1500 px, fondo TRANSPARENTE, con 5 piezas
de trazo suelto, separadas entre sí por al menos 50 px de espacio vacío.

Estilo: garabato a mano alzada, línea única de peso uniforme (unos 6 px a esta
escala), puntas redondeadas, temblor de mano evidente, en gris oscuro #3A342E
sobre transparente. Sin relleno, sin sombra, sin color.

Las 5 piezas:
 1. GARABATO LARGO: una sola línea curva y ondulada, muy vertical (unos
    260x1300 px), como la que alguien traza al costado de una hoja sin levantar
    el lápiz. Sin objeto, pura línea.
 2. GARABATO CORTO: una línea curva más suelta y horizontal, unos 600x400 px,
    con un rulo en el medio.
 3. CORAZONES: dos corazones a mano alzada de distinto tamaño, uno al lado del
    otro, trazo abierto (no cierran del todo), unos 500x400 px.
 4. DESTELLOS: cinco chispitas de cuatro puntas de distinto tamaño, sueltas,
    repartidas en unos 400x400 px.
 5. MARCO CIRCULAR: un círculo a mano alzada de doble filete fino, con tres
    hojitas chiquitas apoyadas en el borde de abajo, unos 900x900 px, con el
    centro completamente vacío.

Nada de texto, nada de firma.
```

### Lámina 3 — Baraja española (familia 5) · PENDIENTE DE GENERAR

> Reemplaza a la lámina vieja de naipe de póker (corazón, trébol, puntilla),
> que se descartó: era una copia directa de una carta de póker y no aportaba
> nada. Estas cinco piezas van **pintadas y desteñidas**, en el mismo registro
> que el herbario, no en línea plana: se usan como `<img>` con el duotono de la
> variante.

```text
Generá una lámina cuadrada de 2000x2000 px, fondo TRANSPARENTE, con 5 piezas de
baraja española, separadas entre sí por al menos 70 px de espacio vacío.

ESTILO (esto es lo más importante, más que el dibujo):
Ilustración pintada a mano en aguada, con luces y sombras suaves, trazo de
contorno fino y algo tembloroso, textura de papel viejo. Colores DESTEÑIDOS y
apagados, como una carta de baraja impresa hace ochenta años y gastada por el
uso: nada de amarillo oro saturado, nada de rojo vivo, nada de negro puro.
Una sola familia de tonos, sepia y tierra apagados (#8A7A64, #6E5F4C, #C9B9A0,
#EFE6D6), con las luces en crema. Sin fondo, sin sombra proyectada, sin marco,
sin borde de carta: sólo el dibujo recortado sobre transparente.
NO uses el estilo plano de línea negra y color liso de la baraja moderna. El
referente es una lámina de anticuario pintada, no un naipe impreso.

LAS 5 PIEZAS:
 1. AS DE COPAS: una copa ceremonial ornamentada, con pie ancho, nudo labrado
    en el tallo y boca abierta; guirnalda de hojas y volutas alrededor del
    cuerpo. Vertical, unas 700x1100 px.
 2. AS DE OROS: un medallón circular tipo moneda antigua, con un rosetón o sol
    de rayos en el centro y una orla de volutas en el canto. Casi cuadrado,
    unas 900x900 px.
 3. ANCHO DE ESPADA: una espada recta vertical, de hoja lisa y empuñadura
    labrada con guarda curva, punta hacia arriba. Muy vertical, unas
    260x1300 px.
 4. ANCHO DE BASTO: un garrote de madera vertical, nudoso, con dos o tres
    brotes de hojas saliendo de los nudos, extremo grueso abajo. Muy vertical,
    unas 320x1300 px.
 5. ESPADA Y BASTO CRUZADOS: las dos piezas anteriores cruzadas en aspa, como
    el escudo de un naipe, con un lazo fino atándolas en el cruce. Unas
    1000x1000 px.

Cada pieza completa y entera, sin cortar por el borde de la lámina, sin
superponerse con las otras. Nada de texto, nada de números, nada de firma,
nada de marca de agua.
```

**Por qué cinco y no más:** las reglas de composición piden dos o tres piezas
reutilizadas en varios tamaños, no una distinta por sección (§8.2 del análisis).
Las cuatro pintas chicas que van como viñeta de sección NO se generan: son
siluetas simples y las dibuja Claude Design en SVG inline, que a 57 px se lee
mucho mejor que una aguada. Registro por tamaño: **pintado en grande, plano en
chico.**

### Qué hago yo con una lámina nueva

Las subís donde te quede cómodo (la vez pasada las pusiste en `main`, en
`mockup/inspire/assets/`) y yo:
1. Las recorto por etiquetas (cada dibujo con sus propios píxeles, nada cortado
   ni con pedazos de la vecina).
2. Las paso a WebP con transparencia, lado mayor máximo 1200 px.
3. Las dejo en `public/templates/iconos-linea/`, `/herbario/`, `/trazo/`,
   `/baraja/` y las agrego a `public/templates/INVENTARIO_PAPEL_PRENSADO.md` con ruta, medida,
   peso, para qué es cada una y el snippet de máscara CSS.
4. Recién entonces le pasás el prompt de la plantilla a Claude Design.

---

## 4. Qué adjuntarle

| Archivo | Qué muestra |
|---|---|
| `mockup/inspire/webs/41-rame-lucky-*.jpg` … `53-rame-magnolia-*.jpg` | las 13, scroll completo |
| `mockup/inspire/webs/4x-rame-nueve-modelos.jpg` | nueve modelos lado a lado, para ver que son una sola familia |
| `mockup/inspire/webs/4x-rame-detalle-papel-y-emboss.jpg` | el grano y el relieve reales, ampliados |
| `mockup/inspire/webs/4x-rame-relieve-css-vs-png.jpg` | **la comparación CSS contra PNG**: es la que más importa |
| `mockup/inspire/webs/4x-rame-prototipo-css.jpg` | la hoja completa ya hecha en CSS |
| `mockup/inspire/webs/4y-rame-assets-*.jpg` | **el ornamento real de seis familias, recortado y a escala**: los íconos a mano, las ramas, los garabatos |
| `mockup/inspire/webs/4z-final-parade-relieve-vs-plana.jpg` | Final Parade en tinta plana y en relieve, a cinco tamaños: por qué hay un mínimo |
| `mockup/inspire/webs/4y-piezas-cortadas.jpg` | **las 25 piezas ya cortadas, a escala y con su nombre** — es con lo que va a componer |
| `mockup/inspire/webs/4y-herbario-variantes.jpg` | la misma rama en las cinco variantes, con el duotono de filtros |
| `docs/ANALISIS_RAMESTUDIO.md` | los números, y en §8 el inventario de ornamento con las reglas de composición medidas |

---

## 5. Orden sugerido

Las cuatro láminas ya están cortadas, así que se puede arrancar directo:

1. **Prensa** primero y sola. Es la que define la colección; si el relieve y el
   grano no quedan bien ahí, no quedan bien en ninguna.
2. Revisarla en celular real antes de pedir las otras.
3. **Herbario** (XV) y **Trazo**.
4. **Noche** (oscura / corporativa): usa el mismo set de íconos, en hueso.
5. **Baraja**, cuando esté cortada su lámina.

---

## 6. Qué queda de mi lado cuando entregue

Esto no va en el prompt: es la lista de lo que hay que tocar en el repo para
que una familia entregada pase de `.dc.html` a plantilla viva.

1. **Portar** con `docs/GUIA_TECNICA_PLANTILLAS.md`, tomando
   `src/components/templates/ChicTemplate.tsx` como base (es una Flat clara).
2. **Variantes** por script, una por color de papel, como el resto de la
   colección Flat.
3. **Registrar el nombre visible** en `src/lib/template-labels.ts` (si falta, la
   landing de modelos muestra la constante cruda en mayúsculas).
4. **Gating por tipo de evento** en `src/components/wizard/wizard-steps-config.ts`:
   estas familias usan el mecanismo Flat, así que NO van en
   `STORYTELLING_TEMPLATE_TIPOS`.
5. **La fuente ya está lista** en los dos lados: `src/app/fonts/` la registra
   `next/font/local` para producción, y `public/fonts/` sirve la copia que usan
   los `.dc.html` y cualquier mockup suelto. Si se agrega otra fuente propia,
   hay que hacer las dos cosas.
6. **Las piezas ya están servidas** desde `public/templates/`, así que no hay
   nada que mover al portar: las rutas del mockup funcionan tal cual.

### Pendiente antes de publicar

Confirmar con Putracetol (putracetol.com/licenses/) que la licencia de Final
Parade Script cubre **uso como webfont** y **uso en plantillas que se venden a
terceros**. El archivo trae `fsType 0`, que es permiso técnico de empotrado, no
licencia. Está instalada y andando; esto es sólo el trámite.
