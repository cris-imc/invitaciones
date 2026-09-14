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
> **ilustrada** (flores, lacre, vinilo, piezas pictóricas WebP). Ésta es
> papelería **prensada y monocroma**: sin ilustración, sin color de acento
> saturado, sin imágenes de ornamento. Todo el peso visual lo llevan el grano
> del papel, el relieve de la letra y el aire. Son complementarias, no
> competidoras.

---

## 1. La idea (para que sepas qué pedís)

Las 13 referencias son un solo sistema con 13 pieles. Su fuerza no está en
ningún efecto: está en lo que **no** hacen. Trece invitaciones y cinco
animaciones en total, ninguna llamativa. Lo que queda cuando sacás todo lo
demás es una hoja de papel con grano, una letra en relieve, márgenes enormes y
un fundido de 1,2 segundos.

Ellos hornean el papel y el relieve como PNG porque están sobre Wix. Nosotros
no tenemos esa limitación, y ahí está el "algo distinto":

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
Adjunto tiras de fotogramas de las 13 referencias
(mockup/inspire/webs/4*-rame-*.jpg). Son la referencia de LOOK, no de contenido.
No las copies: el objetivo es hacer lo mismo pero sin una sola imagen de
ornamento y con el relieve vivo.

FORMATO DE ENTREGA (no negociable)
- Un archivo .dc.html panorámico por familia, "<Nombre> - Panoramica.dc.html",
  con las dos vistas (Celular 430x932 y Escritorio 1440x900) en el mismo
  componente y el toggle arriba, igual que mockup/nuevo/*.dc.html.
- Solo HTML + CSS + SVG inline + JS plano. NADA de WebGL, GSAP, Lottie, Rive,
  canvas ni video.
- CERO IMÁGENES DE ORNAMENTO. Esta colección no usa ni WebP ni PNG ni las
  piezas de public/templates/. El grano del papel va con feTurbulence en un
  data: URI; el relieve con text-shadow; los pliegues con clip-path; los
  filetes, monogramas, íconos y viñetas con SVG inline dibujado por vos, de
  trazo 0,75-1 px. Las fotos reales entran solo por los campos del backend
  (bloque con la palabra FOTO).
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
 posición: acá los doodles son SVG de trazo fino, nunca imágenes.

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
- SCRIPT, sólo para títulos de sección y el "&": Pinyon Script, Mrs Saint
  Delafield o Style Script. Una sola palabra o frase corta por vez, nunca un
  párrafo.
- SANS para datos, versalitas y kickers: Jost 300 (primera opción) o Archivo.

Escala medida en las referencias, respetala:
- Kicker / versalitas chicas: 10 px, tracking 0,39 em, mayúsculas. Ese tracking
  enorme en el texto más chico es LA firma de la fineza; si lo bajás, la
  colección se cae.
- Datos (fecha, ciudad, hora): 13 px, tracking 0,16 em, mayúsculas.
- Numeración de sección: serif 300, 26 px, con punto.
- Título de sección: script 42-46 px, o serif italic 34 px.
- Nombres de portada: serif 300, 38 px, una línea por nombre, el "&" en script
  a 30 px en la línea del medio.
- Número grande del countdown: serif 300, 86 px, line-height 0,9.
- Texto corrido: 15 px, line-height 1,75, nunca menos de 14 px.

=========================================================================
FAMILIAS (base + 4 variantes cada una). Las dos primeras son la prioridad.
=========================================================================
1. CASAMIENTO — "PRENSA"
   La familia pura: papel crema, cero ornamento, todo el peso en el relieve y
   el aire. Es la que más se parece a /emboss y /editorial y la que mejor
   muestra de qué se trata la colección.
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
   Papel crema y un solo verde apagado, usado únicamente en trazo de 0,75 px.
   Es /botanico y /doodles: ramitas, hojas y tallos dibujados en SVG inline,
   nunca rellenos, nunca imágenes. El verde no es un acento: es la tinta de un
   sello de botánica, y aparece en no más de 5 lugares en toda la invitación.
   Papel #F7F2EA, papel alterno #F1EADF, tinta #45443C, tinta suave #857F70,
   trazo botánico #6E7A5E, sombra 116,110,92.
   Variantes: "Salvia" #6E7A5E · "Eucalipto" #7C8B7A · "Oliva" #7A7A55 ·
   "Ceniza" #8A8A82 · "Tinta" #55605C.
   Ornamento: cuatro ramitas SVG distintas (olivo, eucalipto, espiga, helecho)
   de 60-90 px, una por esquina de hoja, siempre a media opacidad y siempre
   cortadas por el borde de la hoja (entran desde afuera). Al entrar la sección,
   la ramita rota de -4° a 0 junto con el fundido.
   Portada: nombre de la quinceañera en serif a 44 px con relieve, "MIS XV" en
   versalitas con 0,39 em, ramita en la esquina superior derecha.
   Countdown: el número grande y, alrededor, un círculo de 0,75 px con doce
   marcas finas, como un herbario prensado bajo vidrio.
   Álbum: polaroids con 10 px de margen de papel y una cinta de papel SVG en la
   esquina; nada de sombras grandes.
   RSVP: al confirmar, tres hojitas SVG caen desde arriba de la hoja y se
   apoyan, en 900 ms, con easing cubic-bezier(.22,.61,.36,1). Es el único
   momento con movimiento "de más" de toda la colección.
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
   Íconos de sección en SVG de línea (anillos, iglesia, copas, torta, sobre),
   de 32-46 px, trazo 0,75 px, uno por sección, arriba del número.
   Para corporativo: misma familia, monograma reemplazado por el logo del
   cliente en un slot de 120x40, y el cronograma pasa a ser la agenda.
   Escritorio: la columna fija es una hoja negra con el filete interior y el
   monograma; la foto entra en la columna derecha.

4. XV / CUMPLEAÑOS — "NAIPE" (opcional, si hay lugar)
   La única que se permite un segundo color de tinta: /lucky y /chilling.
   Papel crema con un lunar de 1,5 px cada 14 px (SVG tileado, no imagen) y una
   tinta bordó para un solo elemento por sección.
   Papel #F6EFE4, tinta #34302C, tinta suave #8A7A72, tinta roja #7A2F3A,
   sombra 120,103,86.
   Variantes: "Bordó" #7A2F3A · "Tinta" #2B3A57 · "Verde mesa" #2F5244 ·
   "Ciruela" #5B3550 · "Cobre" #9A5A34.
   Portada: la foto dentro de un naipe (hoja con radio 12 px, filete doble a
   8 px y 12 px, y un palo de baraja SVG en dos esquinas opuestas). El naipe
   entra con la rotación de 6° de siempre, nada de "dar vuelta la carta".
   El resto igual que Prensa, con el palo de baraja como viñeta de sección.

=========================================================================
CHEQUEO ANTES DE ENTREGAR
=========================================================================
- ¿Hay alguna imagen que no venga de un campo del backend? Si sí, sacala.
- ¿El relieve se lee sobre el papel a 320 px de ancho, en un celular al sol?
  Si dudás, subí el contraste de la sombra, no el tamaño.
- ¿Todas las animaciones duran 1,2 s o menos y son solo opacity y transform?
- ¿Las versalitas chicas tienen 0,39 em de tracking?
- ¿Las cinco variantes siguen siendo monocromas?
- ¿El texto corrido bajó de 14 px en algún lado?
- ¿Se ve bien con prefers-reduced-motion activado?
```

---

## 3. Qué adjuntarle

| Archivo | Qué muestra |
|---|---|
| `mockup/inspire/webs/41-rame-lucky-*.jpg` … `53-rame-magnolia-*.jpg` | las 13, scroll completo |
| `mockup/inspire/webs/4x-rame-nueve-modelos.jpg` | nueve modelos lado a lado, para ver que son una sola familia |
| `mockup/inspire/webs/4x-rame-detalle-papel-y-emboss.jpg` | el grano y el relieve reales, ampliados |
| `mockup/inspire/webs/4x-rame-relieve-css-vs-png.jpg` | **la comparación CSS contra PNG**: es la que más importa |
| `mockup/inspire/webs/4x-rame-prototipo-css.jpg` | la hoja completa ya hecha en CSS |
| `docs/ANALISIS_RAMESTUDIO.md` | los números |

---

## 4. Orden sugerido

1. **Prensa** primero y sola. Es la que define la colección; si el relieve y el
   grano no quedan bien ahí, no quedan bien en ninguna.
2. Revisarla en celular real antes de pedir las otras.
3. **Herbario** (XV) y **Noche** (oscura / corporativa).
4. **Naipe** sólo si las tres anteriores cerraron.
