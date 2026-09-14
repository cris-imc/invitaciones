# Análisis de 7 invitaciones "clásicas" de la competencia (momento.vip y bento)

> Fecha: 2026-09-14. Complemento de `docs/PROMPTS_CLAUDE_DESIGN_COLECCION_CLASICA.md`.
>
> **Método**: cada invitación se abrió en Chromium emulando un iPhone (430×932,
> touch), se tocó "Abrir invitación" cuando había tapa, se grabó video de la
> carga + 10 pasos de scroll de 700 px, se armó una tira de fotogramas (1 por
> segundo) y una traza del DOM (posición, transform y opacidad de hasta 450
> elementos por paso). Además, captura de escritorio a 1440×900 y descarga del
> HTML y del bundle JS. Las tiras están en `mockup/inspire/webs/2x-*.jpg`.
> Todo lo de abajo es **medido**, salvo donde dice "probable".

## 0. Qué son técnicamente

| | momento.vip | inv.bento.com.ar |
|---|---|---|
| Stack | React (Vite), bundle de 420 KB | React (Vite), bundle de 1,8 MB |
| Librerías detectadas en el bundle | confetti, Rive (2 menciones), partículas, Spotify y YouTube embebidos, Google Maps | Lottie (51), Rive (41), three (22), QRCode, confetti, Swiper, ScrollTrigger (1), IntersectionObserver |
| Fuentes (Google) | Caveat, Fraunces, Hanken Grotesk, Space Mono; en la invitación: Cormorant, Montserrat, Petit Formal Script | Banco por plantilla: Playfair Display, Cormorant Garamond, EB Garamond, Bodoni Moda, DM Serif Display, Libre Baskerville, Spectral, Crimson Pro, Fraunces, Parisienne, Bebas Neue, Cinzel, Montserrat, Inter; Shimmer usa una script propia ("Darrel Allura") |
| Escritorio | La tapa es una tarjeta centrada (≈450 px) sobre un fondo crema con viñeta; adentro, columna centrada | Columna de celular (680 px) centrada sobre un fondo desenfocado del mismo tono; barra superior "Ver diseños / Vista demo" |
| Idioma de las demos | Inglés (XV de Victoria, Lucía & Santiago, María José) | Español rioplatense |

Ninguna usa WebGL para la invitación en sí. Todo el movimiento que se ve es
CSS + IntersectionObserver, salvo el confeti (probable canvas) y la música.

## 1. momento.vip — XV de Victoria (21)

**Tapa**: preloader con el logo "Momento." (2 s). Después una **tarjeta tipo
sobre** centrada: crema #F3E7E0, kicker tracked "A CELEBRATION", un **sello de
lacre** bordó #7A2F3A dentado con la inicial "V" en serif, el nombre "Victoria"
en Cormorant 72 px, la fecha entre dos filetes, botón pill outline "Open
invitation". Al tocar el botón (9 s), el sello se parte en dos mitades y la
tarjeta se desvanece: **el sobre se abre** (~1 s).

**Adentro**: foto a pantalla completa de la quinceañera con degradé oscuro
abajo; sobre la foto: "MY QUINCEAÑERA" tracked, "Victoria" serif, fecha, y una
**frase en script** (Petit Formal Script) blanca. Botón flotante de música
(disco) abajo a la izquierda y una barra de precio/CTA del producto abajo.

**Secciones** (en orden): countdown ("The big dance is just around the
corner", cuatro cajas bordó redondeadas con días/horas/min/seg + fecha con
punto que parpadea) → "The venue" (Casino Español de México, dirección, **mapa
de Google embebido**, botones Directions/Waze) → "8 photos: A Dream of Wine
and Gold" (**grilla masonry de 2 columnas**, fotos con bordes redondeados) →
"Gift registry" (tarjeta con miniaturas y flecha) → "Our song: The Song of My
Waltz" (**vinilo que gira** con "NOW PLAYING", onda de audio y botón Pause) →
RSVP en bloque bordó a todo el ancho ("Confirm your spot at the dance", fecha
límite en pill, "Confirm via WhatsApp") → "Dress code: Etiqueta rigurosa"
(tarjeta con ícono de vestido/traje y "See inspiration") → "Evening
Itinerary" (**línea de tiempo vertical** con íconos redondos a la izquierda y
tarjetas con hora en pill: Reception, Waltz and coronation, Imperial Dinner,
Let's dance, Toast and cake) → cierre: nombre en script + fecha + crédito
"Momento".

**Movimiento medido**: cada bloque entra con `translateY(85-105px → 0)` +
opacity al cruzar el 80% del viewport (~0,7 s, ease-out). Foto del hero con
parallax 0,82 (se queda un poco atrás). El punto de "counting down" parpadea
(opacidad 0,44 ↔ 1). El vinilo gira en loop. No hay stagger por letra ni
paneles pineados: es un flujo vertical clásico, sereno.

## 2. momento.vip — Lucía & Santiago (22)

**Tapa**: verde menta #DCE8E0 con **un pliegue vertical en el centro** (una
línea de sombra, como una tarjeta doblada), círculo verde bosque #1F5A47 con
monograma "L·S", "Lucía & Santiago" en serif, fecha entre filetes, "For
Familia González Vega" en script, botón pill verde. Al tocar: **la tarjeta se
abre como un libro** (las dos mitades se pliegan hacia afuera, ~1 s) y aparece
la foto.

**Adentro**: foto de la pareja con degradé, "WE'RE GETTING MARRIED", nombres,
fecha, lugar, frase en script, y una **pill con el invitado y sus pases**
("Familia González Vega · 5 passes").

**Secciones**: countdown → "The Place" (Sunset Monalisa, mapa, Directions/
Waze) → "10 photos: Our History in Pictures" (masonry) → Gift registry → Our
song (vinilo) → RSVP en bloque verde (I will attend / Can't make it + Send
confirmation) → **"Your passes"** (tarjeta de acceso: nombre de la familia,
número grande "5", "Mesa 1", botones "My QR code" y "Apple Wallet", "Please
present your pass upon arrival") → Dress code "Playa formal" con ícono →
Itinerary (Beachfront Ceremony, Cocktail at Sunset, Price, First Dance,
Tornaboda) → **"Where to stay"** (tres tarjetas de hotel con foto, texto y
link) → cierre en script.

**Lo importante**: la estructura es casi 1:1 con nuestro backend: invitado +
cantidad (Guest.name/expectedCount), pase con QR (QrDeIngreso), mesa
(mesas), cronograma (cronogramaEventos), alojamiento (infoAlojamientoTexto),
regalo, canción, RSVP.

## 3. momento.vip — XV de María José (27)

Misma tapa-sobre que Victoria pero en terracota #C8825A sobre crema, monograma
"M·J" en el sello, "For Familia González Vega" en script. Adentro: foto con
degradé, pill "Familia González Vega · 5 passes", countdown, "Where should we
meet?" (Hacienda San José Lavista, mapa), "13 photos: My Moments" (masonry),
Gift registry, "The Song for My Party" (vinilo), RSVP en bloque terracota con
tarjeta "Will you join us? I will attend / Can't make it", Dress code "Formal"
con ícono, Evening Itinerary, cierre.

**Movimiento medido**: los bloques del cuerpo entran con `translateY(36px → 0)`
+ opacity, 4-5 a la vez con stagger corto (≈80 ms). Igual que Victoria en todo
lo demás.

## 4. bento — Autumn (23)

**Sin tapa**: abre directo en el hero (con un preloader del logo de Bento en
verde agua, 1 s). Hero: foto de mesa de casamiento arriba, **hojas de arce en
acuarela** superpuestas al borde inferior de la foto, y un **divisor
orgánico** (borde ondulado irregular, como papel rasgado) que pasa al fondo
crema #FBF1E6. "Sofía & Mateo" en Playfair Display 64-96 px con el "&" en
script naranja, fecha "13.03.2027" con filetes, un texto tracked en
mayúsculas, "SCROLL" con chevrones. Pill "¡Música disponible!" arriba.

**Secciones**: countdown ("EL MOMENTO SE ACERCA / Faltan sólo" + **corona de
hojas de acuarela** con "179 días" en el centro + tarjeta hh:mm:ss) →
"Nuestra historia: Los capítulos que nos trajeron acá" (línea de tiempo con
años: 2019 El comienzo, 2021 Mendoza, 2023 Olivo, 2025 La propuesta; hojas al
pie) → "La celebración: Estancia Los Robles" (tarjeta con tres columnas
fecha/hora/lugar con íconos de línea, "Ver mapa" y "Agendar") → "Vestimenta:
Elegante natural" en sección marrón #4A2A1A con lista numerada → "Nuestra
historia: Galería" (carrusel de fotos con esquinas redondeadas) → RSVP "¿Nos
acompañás?" con una **palabra gigante "RSVP" en marca de agua** detrás y
flores de acuarela → "Mesa de regalos" en sección marrón (dos tarjetas de
banco con copiar) → "Armá la playlist" (formulario) → CTA del producto.
**Nav pill inferior** flotante con íconos (Detalles, Timeline, Galería, RSVP,
Regalos, Música), igual a nuestro BottomNavPill.

**Movimiento medido**: títulos `translateY(60 → 0)` + opacity; bloques
`translateY(16 → 0)` + opacity; **ítems de la línea de tiempo entran desde
±60 px en X alternando lado**; imagen de la corona con `rotate` lento en
reposo (cambia de transform 2 veces en 3 s: ~1 vuelta/min); las hojas
decorativas con parallax 0,56-0,7. El hero **no** tiene parallax.

## 5. bento — Shimmer (24)

Hero: foto a pantalla completa de la quinceañera con el nombre "Valen" en una
**script fina con florituras** (Darrel Allura, 100 px), "TE INVITO A CELEBRAR"
en Cinzel tracked, fecha, pill rosa #E8869A con la hora, "SCROLLEÁ". El fondo
de las secciones es una **textura de satén gris** (foto de tela) con bordes
ondulados; las tarjetas son blancas. Íconos de **línea fina dibujada** (un
reloj, un pin, una copa) y títulos en la misma script: "Cuenta Regresiva", "Mi
historia: Crecer a mi lado", "El Gran Día: Salón Versailles", "Dress Code:
Elegante con onda", "Galería", "Vení", "Regalos", "Música", cierre "Valen".

**Movimiento medido**: la foto del hero se desplaza hacia arriba 207 px a lo
largo de 2800 px de scroll (**parallax lento**, ≈0,07 extra); títulos
`translateY(60 → 0)`; las florituras SVG tienen parallax 0,35-0,67 (se
quedan atrás); los bloques `translateY(16 → 0)`.

## 6. bento — Phantom (25)

Oscura: negro #0B0B0B, foto con velo negro, "VALENTINA" en Montserrat 900
uppercase 58-96 px, "& RÍOS" tracked fino, frase en itálica, pill magenta
#FF2E7A con la hora; preloader verde agua de Bento. Secciones: "Cuenta
regresiva" (cuatro tarjetas oscuras con dígitos blancos grandes y letras
D/H/M/S grises detrás, mensaje en pill magenta), "Mi historia: Crecer es
esto" (línea de tiempo con puntos magenta), "El Gran Día" (lista con hora,
salón, botones), Dress code "ELEGANTE" (pill magenta + lista), Galería
(grilla), RSVP "¿VAS A VENIR?" con **la palabra "VAS" en magenta y "A VENIR?"
en blanco** con contorno, "Mercado Pago: cumple.bauti" (alias con copiar),
"Pedir canción" (formulario), CTA.

**Movimiento medido**: ítems de la línea de tiempo desde ±60 px en X; los
segundos del countdown **pulsan** (opacidad 0,5 y 4 px de rebote por tick);
títulos `translateY(60 → 0)`.

## 7. bento — Campestre (26)

Hero: foto oscura de bosque con la pareja, **pampas y flores secas en
acuarela** en las esquinas superior izquierda e inferior derecha, "13 / MAR /
2027" grande en vertical a la izquierda, "Sofía & Mateo" en Playfair itálica
con "&" dorado #C9A54A, frase tracked, "SCROLL". Secciones oscuras #2C2418
con divisores ondulados hacia crema: countdown "Faltan 179 días 23 59 44" con
pampas, "Nuestra historia" (línea de tiempo con puntos dorados), foto grande
de los novios con bordes redondeados, "La celebración: Estancia Los Robles"
(tarjeta crema con íconos), "Vestimenta: Elegante natural" (lista 01/02/03),
"Galería", RSVP "¿Nos acompañás?" con marca de agua "RSVP", "Mesa de regalos"
(tarjetas oscuras), "Armá la playlist", CTA.

**Movimiento medido**: el **hero tiene parallax real** (la sección se mueve al
0,34-0,56 de la velocidad del scroll, es decir queda atrás mientras el
contenido siguiente la tapa); las pampas decorativas **giran** al entrar
(`rotate` de ~140° a ~50°) y derivan 11 px en reposo; ítems de la línea de
tiempo desde ±60 px; títulos 60 → 0; bloques 16 → 0.

## 8. Qué tienen en común (el "look clásico") y qué podemos tomar

**Lenguaje visual compartido**

1. **Serif de alto contraste para los nombres** (Cormorant, Playfair, Bodoni),
   **script para acentos** (frase, "&", títulos de sección en Shimmer),
   **mayúsculas tracked pequeñas para kickers** (letter-spacing 0,2-0,35 em).
   Es la tríada de la papelería impresa.
2. **Una foto real como protagonista** del hero, con degradé para la lectura;
   el resto de la invitación es papel (crema, menta, satén) o tinta oscura.
3. **Un solo color de acento profundo** por invitación (bordó, verde bosque,
   terracota, marrón, magenta, dorado) sobre neutros.
4. **Ornamento botánico en acuarela** (hojas, pampas, flores) en esquinas y
   como corona del countdown; **divisores orgánicos** (borde ondulado o
   rasgado) entre secciones; filetes finos con un punto central.
5. **Tarjetas blancas con sombra suave** para datos; **secciones de color
   pleno** para RSVP y regalos (el acento a todo el ancho).
6. **Íconos de línea fina** (pin, reloj, copa, vestido) y **sello o monograma
   circular** con las iniciales.
7. **Nav pill inferior** (bento) y **botón flotante de música** (momento).

**Gestos memorables (medidos) que sí valen la pena**

- **La apertura**: sobre con sello de lacre que se parte (momento XV) o
  tarjeta que se abre como libro (momento boda). Dura ~1 s y es el gesto que
  más se recuerda. Nuestra tapa ya existe; lo que cambia es el gesto de
  salida.
- **Vinilo que gira** con "NOW PLAYING" y onda de audio para la canción.
- **Corona de hojas que rota** despacio alrededor del número de días.
- **Marca de agua tipográfica** ("RSVP", "VAS") detrás del título de sección.
- **Línea de tiempo** con ítems que entran alternando desde la izquierda y la
  derecha (±60 px), hora en pill, ícono redondo en el eje.
- **Pase de acceso** como tarjeta con número grande, mesa, QR y "presentar al
  ingresar" (esto ya lo tenemos: QrDeIngreso + BurbujaPase + mesas).
- **Parallax lento del hero** (0,35-0,8) y florituras que se quedan atrás.
- **Reveals sobrios**: títulos 60 px, bloques 16 px, 0,6-0,8 s, sin stagger
  por letra. La sobriedad es parte del look.

**Lo que NO conviene copiar**

- Mapa de Google embebido (pesado; el nuestro es un link/embed opcional que
  ya existe con `toEmbedMapUrl`).
- Textura de satén como foto de fondo (Shimmer): rompe la regla "sin PNG para
  ilustrar"; se reemplaza por un degradé con grano SVG.
- Barra de venta del producto dentro de la invitación.
- "Nuestra historia" con años: no hay campo en nuestro schema. Se puede cubrir
  con la Frase o con el cronograma; no inventar un campo.

**Mapa a nuestro backend** (todo existe):

| Sección de ellos | Nuestro campo/componente |
|---|---|
| Tapa con invitado y pases | `BienvenidaStorytelling` / splash Flat, `Guest.name`, `expectedCount`, `mostrarNombreInvitadoEnSaludo` |
| Hero foto + nombres + frase | `portadaImagenFondo`, `nombreNovia/Novio/Quinceanera`, `frasePersonalizadaTexto`, `portadaMensaje` |
| Countdown | `Countdown` (countdownStyle) |
| Venue + mapa | `lugarNombre`, `direccion`, `hora`, `mapUrl`, `ceremonia*` |
| Itinerary | `cronogramaEventos` |
| Galería / Moments | `galeriaPrincipalFotos`, `Album` (albumStyle), Momentos post-evento |
| Gift registry / Mesa de regalos | `regalo*`, `pagoTarjeta*`, `BankDetailsCard` |
| Our song / playlist | `musicaUrl` + `MusicPlayer`, `SongSuggestion` |
| RSVP | `RSVPWizardV2` (attending, count, restricciones) |
| Your passes | `QrDeIngreso`, `BurbujaPase`, `orderNumber`, mesas |
| Dress code | `portadaDressCode`, `dresscodeHabilitado` |
| Where to stay | `infoAlojamientoTexto`, `infoTransporteTexto`, `infoEstacionamientoTexto` (`InfoAdicionalSection`) |
| Quiz | `QuizTrivia` (ellos no lo tienen: es diferencial nuestro) |

## 9. Agrupación

Hay **dos sistemas** y un tercero opcional:

- **"Papelería" (momento)**: tapa-sobre con sello o pliegue, crema + un color
  profundo, serif + script + tracked, tarjetas y bloques de color pleno,
  vinilo, itinerario con íconos. Sereno, formal, para XV y casamiento.
- **"Acuarela" (bento Autumn, Campestre, Shimmer)**: foto hero + ornamento
  botánico en acuarela + divisores orgánicos + corona de countdown + marca de
  agua; claro (Autumn) u oscuro (Campestre); con script fina y satén
  (Shimmer). Para casamiento de campo y XV romántica.
- **"Noir" (bento Phantom)**: oscuro, sans pesada en mayúsculas, un acento
  flúo, tipografía en dos colores. Cumpleaños de adulto y XV nocturna. Es el
  más cercano a lo que ya tenemos en Ónix/Neon, así que va como opcional.

Cómo se traduce esto a una colección propia, sin copiar y con "algo distinto",
está en `docs/PROMPTS_CLAUDE_DESIGN_COLECCION_CLASICA.md`.
