# Prompt para Claude Design — Colección D "Papelería Viva" (clásica, con gestos memorables)

> Fecha: 2026-09-14. Basado en `docs/ANALISIS_INVITACIONES_CLASICAS.md` (7
> invitaciones de momento.vip y bento medidas en celular y escritorio). Las
> tiras de fotogramas para adjuntar están en `mockup/inspire/webs/2x-*.jpg`.
>
> Qué se pidió: una familia con **look clásico** (como esas invitaciones), con
> **efectos lindos y memorables**, **algo distinto**, y con la precisión que
> tuvo la Colección C "Tipográfica editorial". Prioridad casamiento y XV;
> mobile primero y escritorio compuesto; ilustración en SVG; sin video.
>
> Diferencia con las colecciones A, B y C: esta usa el **mecanismo Flat** (flujo
> vertical con secciones apiladas, splash mobile y nav pill inferior, grid de
> escritorio con columna fija), porque es el que corresponde a una invitación
> clásica que se lee de arriba abajo. No usa pantallas de 100vh ni paneles
> pineados.

---

## 1. La idea (para que sepas qué pedís)

Las siete referencias comparten un lenguaje de **papelería impresa**: serif de
alto contraste para el nombre, script para el acento, mayúsculas tracked para
los kickers, una foto real como protagonista, un solo color profundo sobre
neutros, ornamento botánico, filetes, sellos, tarjetas blancas con sombra
suave. Sus gestos memorables medidos son pocos y precisos: el sobre que se
abre, el vinilo que gira, la corona de hojas que rota, la palabra en marca de
agua, la línea de tiempo que entra alternando de lado, el pase de acceso con
QR, el parallax lento del hero.

**"Algo distinto"**: lo que ninguna de las siete hace, y que sí hizo bien la
Colección C, es tratar el texto con criterio editorial: folios, kickers
numerados, un dato grande por pantalla, jerarquía estricta. La propuesta es
**papelería clásica con edición tipográfica**: la invitación se siente impresa
en papel de algodón, pero cada sección está compuesta como una página de
revista de bodas, y cada gesto de movimiento imita algo físico (abrir, doblar,
sellar, girar, estampar), nunca un efecto digital. Por eso "Papelería Viva".

---

## 2. Prompt (pegar completo en Claude Design, con el repo sincronizado)

```text
CONTEXTO
Diseñás una colección nueva de plantillas de invitación digital para
altainvitacion.com (Argentina y Latinoamérica). Público principal: CASAMIENTOS
y QUINCE AÑOS; secundario: cumpleaños de adultos, corporativo, infantil. Ya
existen dos colecciones en producción: "Flat" (22 familias: flujo vertical de
secciones) y "Storytelling" (36 familias: pantallas completas con paneles
laterales). Esta colección, "PAPELERÍA VIVA", usa el mecanismo FLAT.

Tenés el repo sincronizado. Antes de diseñar leé:
- Skills/GUIA_PEDIR_NUEVA_PLANTILLA.md (arquitectura rígida de una plantilla
  Flat: estado, toggle Celular/Escritorio, buildStyles, splash, grid 440px 1fr,
  parallax de la foto, 10 slots de doodle, 9 secciones)
- docs/GUIA_TECNICA_PLANTILLAS.md (cómo se porta a React; secciones 2.2 y 8:
  doodles propios, gesto de luz sobre la foto, marco de la foto, portada de
  bienvenida animada)
- mockup/nuevo/Plantillas Casamiento.dc.html (formato de entrega Flat, con
  toggle Celular/Escritorio)
- src/components/templates/ChicTemplate.tsx (una Flat clara ya portada)
- src/lib/schemas/invitation.ts (campos reales; no inventes otros)
Adjunto tiras de fotogramas de siete invitaciones de la competencia
(mockup/inspire/webs/2x-*.jpg): son la referencia de LOOK (papelería clásica)
y de GESTOS (sobre que se abre, vinilo, corona, marca de agua, línea de
tiempo). No las copies: superalas.

FORMATO DE ENTREGA (no negociable)
- Un archivo .dc.html panorámico por familia, "<Nombre> - Panoramica.dc.html",
  con las dos vistas (Celular 430x932 y Escritorio 1440x900) en el mismo
  componente y el toggle arriba, igual que mockup/nuevo/*.dc.html.
- Solo HTML + CSS + SVG inline + JS plano. NADA de WebGL, GSAP, Lottie, Rive,
  canvas, video ni PNG/JPG para ilustrar. Toda ilustración (hojas, flores,
  pampas, sellos, íconos, florituras) es SVG inline dibujado a mano con
  paths y gradientes; el look acuarela se logra con gradientes radiales
  superpuestos, feTurbulence a baja opacidad y bordes irregulares, no con
  imágenes. Las fotos reales entran solo por los campos del backend (bloque
  con la palabra FOTO).
- Movimiento con CSS (@keyframes, transitions), IntersectionObserver y el
  progreso de scroll leído en requestAnimationFrame. Se portará a
  framer-motion + anime.js (onScroll). Respetá prefers-reduced-motion.
- Español neutro, cálido y sobrio. Google Fonts: 1 serif de display + 1 script
  + 1 sans/mono para datos. Nada de emojis.

MOBILE PRIMERO, ESCRITORIO COMPUESTO
- Celular: splash a pantalla completa con nombre del invitado y botón "Abrir
  invitación"; al abrir, secciones apiladas y nav pill inferior (existe:
  BottomNavPill). Botones de 48px, datos nunca por debajo de 14px, contraste
  AA, safe areas.
- Escritorio: el grid Flat de 440px + columna de scroll (la foto y la tarjeta
  con nombre, fecha y nav numerada quedan fijas a la izquierda; las secciones
  se leen a la derecha). Componé la columna fija como una tarjeta de papelería
  real (sobre, sello, filetes), no como una barra lateral.
- Presupuesto para un Android de gama media: solo transform y opacity
  animados; máximo 3 elementos grandes en movimiento; sin blur animado.
- Mostrá el splash con "Valentina" y con "María Florencia".

SECCIONES (las 9 de Flat, mismo orden, sin agregar ni quitar):
 Portada → Countdown → Frase → Detalles del evento (salón; ceremonia si
 ceremoniaHabilitada; cómo llegar con mapUrl; cronograma con
 cronogramaEventos; dress code) → Álbum (galeriaPrincipalFotos; albumStyle
 carrusel/solapadas) → Mapa → RSVP (RSVPWizardV2: asistencia, cantidad,
 restricciones; precios por edad si aplica; el gesto de confirmación es
 propio de la familia) → Datos bancarios / regalo (BankDetailsCard, puede
 haber dos) → Sugerí una canción (+ botón de música) → Footer (crédito
 altainvitacion.com). Además: quiz opcional (triviaHabilitada), pase con QR
 (QrDeIngreso, número de pase, mesa), info adicional (alojamiento,
 estacionamiento, transporte) y estado post-evento (solo álbum).
 Los 10 slots de doodle de la guía son fijos en cantidad y posición.

DATOS: solo campos de src/lib/schemas/invitation.ts y Guest (name,
expectedCount, status, orderNumber). Fecha futura (2027), salón en Córdoba o
Buenos Aires, datos realistas.

VARIANTES: paleta base + 4 variantes por familia (nombre en español + hex de
fondo, fondo alterno, tinta, tinta suave, acento principal, acento
secundario). El acento principal cambia de forma notoria. Handoff al final
del archivo: variantes, fuentes, y cada animación (nombre, duración, easing,
stagger, factor de parallax).

CONCEPTO DE LA COLECCIÓN: "PAPELERÍA VIVA"
La invitación se siente impresa en papel de algodón (crema, grano fino,
filetes, sello, monograma) pero está COMPUESTA como una página de revista de
bodas: un dato grande por pantalla, kickers numerados "01 — LA FECHA", folios
"02 / 09" al pie de cada sección, columnas y filetes finos con un punto
central. Y cada movimiento imita un gesto físico: abrir, doblar, sellar,
girar, estampar, deslizar una hoja. Nunca un efecto digital (sin glow, sin
glitch, sin partículas de luz).

Tríada tipográfica obligatoria: serif de alto contraste para nombres y
números grandes (Cormorant Garamond, Playfair Display o Bodoni Moda), script
elegante SOLO para acentos (Pinyon Script, Parisienne o Great Vibes: el "&",
la frase, el nombre del cierre), y una sans o mono para datos y kickers
(Jost, DM Sans o Space Mono) en mayúsculas tracked 0,25 em. Un solo color
profundo por familia sobre neutros de papel.

GESTOS MEDIDOS QUE SE ADOPTAN (con valores)
- Reveals sobrios: títulos translateY(60px → 0) + opacity, 0,7 s,
  cubic-bezier(.16,1,.3,1); bloques translateY(16px → 0), 0,5 s; nunca
  stagger por letra (la sobriedad es parte del look).
- Línea de tiempo (cronograma): ícono redondo en el eje, hora en pill, cada
  ítem entra desde ±60 px en X alternando lado, 0,6 s.
- Parallax lento de la foto de portada: factor 0,8 (queda atrás) más el
  gesto de luz propio de la familia.
- Ornamento que gira: la corona del countdown rota 1 vuelta por minuto en
  reposo; las pampas/hojas de esquina entran con rotate(-12° → 0).
- Marca de agua: una palabra en serif gigante (12-16 vw) al 6% de opacidad
  detrás del título de RSVP y de Regalos.
- Vinilo: en "Sugerí una canción", un disco SVG que gira (8 s/vuelta) con
  la etiqueta "SUENA AHORA" y una onda de audio de 12 barras cuando hay
  música.
- Pase de acceso: tarjeta con número de pase grande, mesa, QR y "Presentá tu
  pase al ingresar", con borde troquelado.

MOMENTO WOW DE LA COLECCIÓN: LA APERTURA (uno distinto por familia)
El splash se cierra con un gesto físico de 1-1,2 s que revela la portada:
sobre con sello que se parte, tarjeta que se abre como libro, hoja que se
desliza como en una caja, lazo que se desata. Es lo que el invitado recuerda.
Especificá cada apertura con keyframes y easing.

FAMILIAS (base + 4 variantes cada una). Las dos primeras son la prioridad:

1. CASAMIENTO — "Sobre & Sello"
   Papel crema #F4EBE2 con grano fino, tinta #2A2320, acento bordó #7A2F3A
   (variantes: verde bosque #1F5A47, azul tinta #24344D, terracota #B8643C,
   oliva #6B6B3A). Splash: un sobre cerrado visto de frente, con solapa en V y
   un sello de lacre SVG (círculo dentado, brillo especular, monograma en
   serif). Apertura: el sello se parte en dos mitades que caen con rotación
   ±20°, la solapa se levanta (rotateX 0 → -160° con perspective 900px,
   0,9 s) y la tarjeta sube desde adentro del sobre (translateY 40% → 0,
   0,8 s, delay 0,4 s). Portada: foto con marco de papel y filete doble,
   nombres en serif, "&" en script, fecha entre filetes con punto. Countdown
   en cuatro tarjetas de papel con esquina superior doblada. Cronograma como
   línea de tiempo. RSVP en bloque del color de acento a todo el ancho; al
   confirmar, un sello "CONFIRMADO" se estampa (scale 1,4 → 1, rotate -8°,
   0,4 s, con un halo de tinta que se expande y desaparece). Regalos con la
   marca de agua "REGALO". Cierre: nombres en script + crédito.
   Escritorio: la columna fija es el sobre abierto con la tarjeta, la nav
   numerada va impresa en la solapa.

2. QUINCE — "Acuarela & Corona"
   Papel #FBF3EA, tinta #3B2A2A, acento rosa antiguo #C27C86 (variantes:
   lavanda #8E7CC3, durazno #E39A6B, salvia #7C9A7E, azul noche #22304A con
   papel claro). Ornamento botánico en SVG acuarela (peonías, hojas, ramas)
   en las esquinas de la portada, superpuesto al borde de la foto, y
   divisores orgánicos (borde irregular tipo papel rasgado, path con 20-30
   nodos) entre secciones. Splash: la foto tapada por una hoja de papel
   vegetal con el nombre en script; apertura: la hoja se desliza hacia
   arriba como sacada de una caja (translateY 0 → -110%, 1 s) mientras las
   flores de las esquinas entran girando. Countdown: corona de hojas y
   flores que rota 1 vuelta/min con el número de días en serif gigante en el
   centro y hh:mm:ss en una tarjeta. Frase con el "&" y una palabra en
   script. Cronograma como línea de tiempo con íconos de línea fina (copa,
   corona, torta, notas). RSVP con marca de agua "RSVP"; al confirmar, caen
   8-12 pétalos SVG. Álbum con polaroids con cinta. Cierre con el nombre en
   script grande.
   Escritorio: la columna fija es la foto enmarcada por la corona botánica.

3. Opcional CUMPLEAÑOS ADULTO — "Tinta & Vinilo"
   Papel obra #EFE9DF, tinta negra, un acento (rojo lacre o azul klein);
   serif condensada + mono; el vinilo como pieza central del splash: el
   disco gira y el brazo del tocadiscos baja para abrir. Sobrio, editorial.

4. Opcional CORPORATIVO — "Membrete"
   Blanco roto, gris grafito, un acento institucional; grilla estricta, sello
   seco (relieve simulado con dos sombras), sin script.

GESTO DE LUZ SOBRE LA FOTO (obligatorio, uno por familia): Sobre & Sello, un
reflejo cálido que cruza el marco de papel; Acuarela & Corona, un velo de
acuarela que se aclara al bajar (mask); Tinta & Vinilo, un destello sobre el
disco; Membrete, ninguno (la sobriedad es el efecto).

CRITERIOS DE CALIDAD
- Belleza en reposo: cada sección es una página impresa aunque nada se mueva.
- Un gesto físico por sección, nunca dos; los datos se leen quietos.
- Legibilidad: la script nunca en cuerpos de texto ni en datos.
- Identidad propia: los doodles de los 10 slots son específicos de la familia
  (sello, lazo, peonía, vinilo, pampas), no íconos genéricos.

ENTREGA: un .dc.html por familia con toggle Celular/Escritorio, la tabla de
variantes y el handoff con los keyframes de la apertura, de los reveals, del
sello de confirmación, de la corona y del vinilo.
```

---

## 3. Moodboard (opcional, para Gemini o ChatGPT Image)

- **Sobre & Sello**: "Moodboard 3x3 de papelería de casamiento de lujo: sobre
  de papel de algodón crema con solapa en V y sello de lacre bordó con
  monograma, tarjeta con filetes dobles y tipografía serif de alto contraste,
  un '&' caligráfico, grano de papel, luz cálida; sin personas, sin texto."
- **Acuarela & Corona**: "Moodboard 3x3 de invitación de quince años en
  acuarela: peonías rosa antiguo, hojas de eucalipto y ramas en esquinas,
  corona botánica circular, bordes de papel rasgado, papel crema, tipografía
  serif y script fina; delicado y elegante, no infantil, sin texto."

## 4. Flujo

1. Pegar el prompt de §2 en Claude Design con el repo sincronizado; adjuntar
   las tiras `mockup/inspire/webs/2x-*.jpg` y el moodboard si lo generaste.
2. Revisar que cada `.dc.html` tenga las 9 secciones, el toggle Celular/
   Escritorio, la apertura especificada con keyframes, las variantes y el
   handoff.
3. Guardar en `mockup/clasica/<Nombre> - Panoramica.dc.html`.
4. Portar con `docs/GUIA_TECNICA_PLANTILLAS.md` sobre `ModernoTemplate.tsx`
   como base (es Flat), invertir a tema claro con las trampas de la sección
   3.4 y 3.5 (`--chic-ink`), generar variantes por script, wirear los 8
   puntos, agregar a `template-labels.ts` y al gating por tipo de evento.
