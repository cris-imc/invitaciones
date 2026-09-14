# Análisis medido — 13 invitaciones de ramestudio.net

> Fecha: 2026-09-14. Las 13 URLs se abrieron en Chromium a 430×932 (iPhone,
> touch), se filmaron mientras se scrolleaban y se midieron en el DOM: opacidad,
> transform, posición, tipografía computada, colores reales y peso de cada
> imagen. No hay nada inferido de capturas: todo número de acá salió de una
> medición. Las tiras de fotogramas quedaron en
> `mockup/inspire/webs/4*-rame-*.jpg`.
>
> Qué dijo el cliente que le gusta: **el look de papel real, la elegancia y
> fineza, lo diferente al resto, lo monocromo.** Y que, por lo que investigó,
> los fondos de papel y los assets son PNG hechos con ChatGPT. Lo segundo se
> confirmó: los nombres de archivo lo dicen literalmente.

---

## 0. El hallazgo principal

**Las 13 no son 13 diseños: son un solo sistema con 13 pieles.** Misma
estructura, mismo orden de secciones, misma grilla, mismo motor de animación.
Lo que cambia es el tono del papel, el tipo de ornamento y si el texto va
impreso o en relieve.

Eso es una ventaja para nosotros: no hay que diseñar 13 familias, hay que
diseñar **un mecanismo y cuatro pieles**.

Y el segundo hallazgo, que es el que decide toda la colección:

> **El "papel real" y el relieve se pueden hacer en CSS puro, sin un solo PNG.**

Ramé los hornea como imagen porque está sobre Wix y no puede escribir CSS.
Nosotros sí. Lo probé antes de escribir este documento (§5): grano de papel con
`feTurbulence` en un `data:` URI de 400 bytes, relieve con `text-shadow` de tres
capas, esquina plegada con `clip-path` + dos gradientes. Resultado
indistinguible del PNG original, con tres ventajas que ellos no tienen: pesa
nada, se recolorea por variante con una variable CSS, y el texto sigue siendo
texto (se puede seleccionar, buscar, leer con lector de pantalla y cambiar por
los datos reales del backend).

---

## 1. Las 13, agrupadas

| # | URL | Papel | Ornamento | Letra de los títulos | Grupo |
|---|---|---|---|---|---|
| 1 | `/emboss` | Crema #F8F0E8 | Ninguno | Script en relieve | **A. Relieve** |
| 2 | `/classic` | Crema gris #E0D8D0 | Monograma en óvalo con laurel | Script en relieve | **A. Relieve** |
| 3 | `/editorial` | Hueso #F8F0E8 | Filetes finos, escudito | Serif impresa, versalitas | **A. Relieve** |
| 4 | `/tipografico` | Hueso | Filetes y reglas | Serif impresa | **A. Relieve** |
| 5 | `/noir` | Negro #101010 | Filete interior, íconos de línea | Serif clara sobre negro | **B. Noche** |
| 6 | `/lumiere` | Topo cálido | Foto a sangre | Script | **B. Noche** (claro) |
| 7 | `/botanico` | Crema | Ramitas botánicas verdes | Script | **C. Herbario** |
| 8 | `/magnolia` | Crema cálido | Rama de magnolia | Serif | **C. Herbario** |
| 9 | `/pampagrass` | Arena | Pampas secas | Script | **C. Herbario** |
| 10 | `/doodles` | Crema | Dibujos de línea a mano (anillos, iglesia, sobre) | Script | **C. Herbario** |
| 11 | `/church` | Crema | Íconos de línea + numerales serif grandes | Serif | **C. Herbario** |
| 12 | `/lucky` | Crema con lunares | Naipe (as de corazones), puntilla | Script | **D. Naipe** |
| 13 | `/chilling` | Crema con lunares | Polaroids B&N, puntilla | Script | **D. Naipe** |

Los cuatro grupos son los que proponemos como familias en el prompt.

---

## 2. Estructura, idéntica en las 13

Orden de secciones, leído del texto real de la página:

```
(portada: nombres + ¡NOS CASAMOS! + fecha + ciudad)
01. LA CUENTA REGRESIVA      → FALTAN / 89 / DÍAS
02. LA MÚSICA                → "¡Poné play antes de seguir!" + reproductor
03. NUESTRA HISTORIA         → frase + carrusel de fotos
04. LA CEREMONIA / LA IGLESIA→ hora, parroquia, ciudad, VER UBICACIÓN
05. LA FIESTA                → hora, salón, ciudad, VER UBICACIÓN
06. LOS DETALLES             → acordeones: DRESS CODE / NIÑOS / REGALOS
07. TU CONFIRMACIÓN          → segundo countdown "quedan N días para confirmar"
08. ¡COMPARTÍ TUS FOTOS!
09. ¡AYUDANOS CON LA PLAYLIST!
(crédito del estudio)
```

**Esto calza casi 1:1 con nuestro backend.** El mapeo está en §6.

Dos cosas que hacen y nosotros no:

- **Numeran las secciones** (`01.` … `09.`) en serif, centrado, arriba de cada
  título. Es gratis y ordena toda la lectura.
- **El RSVP tiene su propio countdown** ("quedan 25 días para confirmar"),
  distinto del countdown del evento. Es una idea buena y barata: presiona a
  confirmar sin sonar exigente.

Ninguna tiene splash de "abrir invitación". Abren directo en la portada.

---

## 3. Geometría medida

Todas las mediciones sobre el lienzo real de la página (320 px de ancho).

| Qué | Valor medido |
|---|---|
| Ancho del lienzo | 320 px |
| Ancho de la tarjeta de papel | **301 px** (x = 10) → margen lateral 10 px = **3,1 %** |
| Alto base de la tarjeta | **432 px** → proporción **301:432 = 0,697** (una hoja A es 0,707) |
| Sombra de la tarjeta | `-1.41px 1.41px 4px rgba(0,0,0,.40)` |
| Filete interior | a 14 px del borde, 0,5 px, esquinas redondeadas |
| Tarjeta del reproductor | radio 12 px, sombra `0 8px 24px rgba(81,72,66,.05)` |
| Alto del documento (mobile) | 5.465 a 7.851 px → **6 a 8,5 pantallas** |

La sombra merece una nota: `-1.41 / +1.41` es un desplazamiento de **2 px a
45°**, hacia abajo y a la izquierda. O sea, **la luz viene de arriba a la
derecha**. Todo el relieve de la colección tiene que respetar esa misma
dirección o el papel deja de leerse como papel.

---

## 4. Movimiento medido

Poco, lento y siempre el mismo. Eso *es* la elegancia: no hay un solo efecto
llamativo en las 13.

### 4.1 Entrada de sección — fundido largo
`opacity 0 → 1` en **1.200 ms**, con una curva claramente ease-out:

| t (ms) | 135 | 361 | 628 | 840 | 1.048 | 1.202 |
|---|---|---|---|---|---|---|
| opacidad | 0,02 | 0,17 | 0,50 | 0,84 | 0,94 | 1,00 |

1,2 s es casi el doble de lo habitual. Es la decisión de ritmo más importante
de todo el sitio.

### 4.2 Entrada 3D — la hoja que se endereza
Los títulos entran con `matrix3d`. Descompuesta, es
**`perspective(800px) rotateY(θ)`** con θ inicial de **5,1° a 6°**, que baja a
cero en **~350 ms**:

| t (ms) | 828 | 879 | 931 | 983 | 1.035 | 1.087 | 1.139 | 1.190 |
|---|---|---|---|---|---|---|---|---|
| rotateY | 5,14° | 3,56° | 2,39° | 1,51° | 0,88° | 0,44° | 0,10° | 0,01° |

La perspectiva sale exacta del término de proyección de la matriz:
`0,0895666 / 0,000112 = 800` px, y se verifica con otra muestra:
`0,047848 / 5,98099e-05 = 800`. **Perspective: 800px, sin redondeo.**

El gesto es literal: *una hoja de papel girada apenas, que se acomoda de
frente.* Es el único movimiento "3D" del sitio y por eso funciona.

### 4.3 Sin parallax
Ningún elemento se mueve a un factor distinto de 1 respecto del scroll. El
fondo de papel es `position: fixed` (verificado en `/noir`), así que la textura
queda quieta y las hojas pasan por encima. Ese es todo el truco de profundidad.

### 4.4 Barra superior — se esconde y vuelve
Al scrollear: `opacity 1 → 0` y `translateY 0 → −18 px` en **~300 ms**.
Al frenar: espera **~370 ms** y vuelve en **~350 ms**.

### 4.5 Lo que NO hay
Sin splash, sin parallax, sin stagger por letra, sin blur animado, sin
partículas, sin glow, sin video, sin scroll secuestrado. Trece invitaciones y
cinco animaciones en total.

---

## 5. El papel y el relieve: cómo lo hacen ellos, cómo lo hacemos nosotros

### 5.1 Cómo lo hacen (confirmado por los nombres de archivo)

| Pieza | Qué es en realidad | Tamaño servido | Original |
|---|---|---|---|
| Títulos de sección ("La ceremonia", "Nuestra historia") | **PNG horneado de texto en relieve** — `PRESETS DE EMBOSS.png`, `01. TEXTOS PARA MODELO EMBOSS.png` | 280×75 px, 4–8 kB | 3.649×953, 450–640 kB |
| Fondo de tarjeta | **PNG generado con IA** — el `alt` dice literalmente `ChatGPT Image 3 jul 2026, 15…` | 281×422, ~24 kB | 931×1689, 1,9–2,6 MB |
| Íconos (iglesia, música, fiesta, anillos) | The Noun Project — `noun-church-2684219_edited.png`, `noun-music-2684263…` | 31–66 px | — |
| Fotos | JPG | 305–320 px de ancho | — |

El cliente tenía razón. Y esto explica el costo del método: **cada título es una
imagen**, así que no se puede cambiar el texto sin volver a generarla, no se
puede traducir, no la lee un lector de pantalla, y cada variante de color exige
regenerar todo el set.

### 5.2 Cómo lo hacemos nosotros (probado, no propuesto)

Rendericé las dos cosas en Chromium y las comparé contra el PNG original de
ramestudio. Las capturas quedaron en
`mockup/inspire/webs/4x-rame-detalle-papel-y-emboss.jpg`.

**Grano de papel** — un `feTurbulence` en un `data:` URI, ~400 bytes, se tilea
solo y se puede teñir con `mix-blend-mode: multiply`:

```css
background-image: url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>\
<filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.85' \
numOctaves='4' stitchTiles='stitch'/>\
<feColorMatrix type='saturate' values='0'/></filter>\
<rect width='200' height='200' filter='url(%23f)' opacity='0.30'/></svg>");
```
`baseFrequency` 0,85 para el fondo de página y 1,1 para la hoja (grano más fino
adentro que afuera: así se leen como dos papeles distintos).

**Relieve** — probé cuatro recetas contra el PNG real. La que coincide es
contorno oscuro arriba-izquierda + luz abajo-derecha + sombra proyectada, con el
cuerpo de la letra **un poco más oscuro que el papel**, no más claro:

```css
.relieve {
  color: #DFD5C8;                                  /* papel −4 % de luz */
  text-shadow:
    -1px -1px 0   rgba(120,103,86,.55),             /* filo en sombra */
     1px  1px 0   rgba(255,255,255,.92),            /* filo iluminado */
     2px  3px 4px rgba(120,103,86,.20);             /* sombra proyectada */
}
```
La versión hueca (letra prensada hacia adentro), para el papel oscuro:
```css
.hueco {
  color: #E9E0D4;
  text-shadow: 0 -1px 0 rgba(255,255,255,.90),
               0  1px 1px rgba(120,103,86,.50),
               0  2px 3px rgba(120,103,86,.12);
}
```

**Esquina plegada** — `clip-path` corta la esquina y dos gradientes de 26 px
hacen el dorso del pliegue:
```css
clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 26px,
                   100% 100%, 26px 100%, 0 calc(100% - 26px));
```

El prototipo completo (hoja + grano + pliegue + filete + relieve + entrada de
1,2 s con `rotateY(6deg)`) está en
`mockup/inspire/webs/4x-rame-prototipo-css.jpg`. **Pesa cero imágenes.**

---

## 6. Mapeo a nuestro backend

| Sección de ramé | Nuestro campo / componente |
|---|---|
| Portada (nombres, fecha, ciudad) | `nombres`, `fecha`, `ciudad` + `AnimatedCoverPhoto` |
| 01. La cuenta regresiva | `Countdown` |
| 02. La música | botón de música + `SongSuggestion` |
| 03. Nuestra historia | `frase` + `Album` / `AlbumCarousel` (`galeriaPrincipalFotos`) |
| 04. La ceremonia | `ceremoniaHabilitada`, hora, lugar, `mapUrl` |
| 05. La fiesta | salón, hora, `mapUrl`, `cronogramaEventos` |
| 06. Los detalles | dress code + `InfoAdicionalSection` (alojamiento, estacionamiento, transporte) |
| 07. Tu confirmación | `RSVPWizardV2` (+ el countdown de confirmación, que es nuevo) |
| 08. Compartí tus fotos | álbum post-evento |
| 09. Ayudanos con la playlist | `SongSuggestion` |
| — | `BankDetailsCard` (regalos) — ellos lo meten dentro de "Los detalles" |
| — | `QrDeIngreso` / `BurbujaPase` — ellos no lo tienen |
| — | `LogoFooterCredit` |

Queda sin usar de su lado: nada. Queda sin cubrir del nuestro: pase con QR,
trivia y datos bancarios como sección propia. Los tres entran sin forzar nada.

---

## 7. Qué tomamos y qué no

**Se toma:**
- La hoja de papel de proporción A con margen lateral de 3 %, sombra de 2 px a
  45° y filete interior a 14 px.
- El fundido de entrada de 1,2 s y el `perspective(800px) rotateY(6deg)`.
- El fondo fijo, sin parallax.
- La numeración `01.` … `09.` de las secciones.
- El tracking enorme en las versalitas chicas (0,16 em a 9 px; **0,39 em** a
  10 px). Es la firma tipográfica de la fineza.
- El countdown de confirmación dentro del RSVP.
- La barra superior que se esconde al scrollear y vuelve al frenar.

**No se toma:**
- Los títulos como PNG. Van en CSS (§5.2).
- Los fondos de tarjeta generados con IA. Van en `feTurbulence`.
- La ausencia de splash: nuestras plantillas Flat lo tienen y sirve para el
  nombre del invitado. Se hace quieto, no espectacular.
- Los íconos de The Noun Project. Van en SVG inline dibujado.

**Lo que agregamos y ellos no tienen** (el "algo distinto"):
- El relieve reacciona a la luz: al scrollear, el ángulo de la sombra del
  relieve gira 6° de ida y vuelta, como si la hoja se inclinara bajo una
  lámpara. Es una interpolación de dos `text-shadow`, cuesta nada y ninguna
  invitación del mercado lo hace.
- El papel se puede **recolorear entero** con una variable, porque no es una
  imagen. Cuatro variantes por familia salen gratis.
- Pase con QR, trivia y datos bancarios, que ellos no cubren.
