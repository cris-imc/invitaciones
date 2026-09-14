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

**Eso vale para el papel, el relieve y el pliegue. NO vale para el ornamento.**
Las flores pintadas, las ramas, los garabatos y los íconos dibujados a mano son
dibujo, y el dibujo hay que dibujarlo. Son, además, la mitad de lo que hace
lindas a estas plantillas, y están compuestos con criterio: el inventario
completo y las reglas de colocación medidas están en §8.

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
| Íconos de línea dibujados a mano (iglesia, anillos en cajita, copas, sobre, confeti, tarjeta) | **PNG generado**, `ChatGPT Image 9 jul 2026` — un lote entero el mismo día | 41–128 px | — |
| Íconos sólidos (algunas familias) | The Noun Project — `noun-church-2684219_edited.png`, `noun-diamond-ring-5305964.png` | 31–66 px | — |
| Ornamento botánico (ramas, flores, pampas, magnolia) | PNG con transparencia, 2 a 3 piezas por familia | 77–520 px | — |
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
- Los íconos de The Noun Project sólidos, que además vienen con la atribución
  impresa adentro del PNG y sin recortar (se ve en `noun-diamond-ring-5305964`).
  Los que sí se toman son los **dibujados a mano** (§8), que son propios.

**Lo que NO se toca (y en la primera versión de este documento me equivoqué):**
el ornamento dibujado. Las ramas pintadas, los garabatos de trazo suelto y los
íconos hechos a mano son la mitad del encanto de estas plantillas y no salen de
un `feTurbulence`. Se diseñan, se generan y se recortan, igual que las piezas de
la Colección D. Las reglas de composición están medidas en §8.

**Lo que agregamos y ellos no tienen** (el "algo distinto"):
- El relieve reacciona a la luz: al scrollear, el ángulo de la sombra del
  relieve gira 6° de ida y vuelta, como si la hoja se inclinara bajo una
  lámpara. Es una interpolación de dos `text-shadow`, cuesta nada y ninguna
  invitación del mercado lo hace.
- El papel se puede **recolorear entero** con una variable, porque no es una
  imagen. Cuatro variantes por familia salen gratis.
- Pase con QR, trivia y datos bancarios, que ellos no cubren.

---

## 8. El ornamento: inventario y reglas de composición

Esta sección faltaba en la primera versión y es la que más importa para el
diseño. Se midió descargando **todas** las imágenes de siete familias
(`/botanico`, `/magnolia`, `/pampagrass`, `/doodles`, `/church`, `/lucky`,
`/chilling`), con su tamaño renderizado y su posición relativa dentro de la
hoja que las contiene. Las láminas de referencia quedaron en
`mockup/inspire/webs/4y-rame-assets-*.jpg`.

### 8.1 Los tres registros de dibujo

**a) Íconos de línea dibujados a mano** — el vocabulario compartido, el que más
se repite y el que más carácter da. Trazo único de peso uniforme (~2 px al
tamaño original), puntas redondeadas, temblor de mano evidente, monocromo, sin
relleno. Anillos en su cajita abierta, iglesia con cruz y destellitos, copas
brindando con chispas, tarjeta doblada con un corazón, sobre con un tilde,
confeti saliendo, polaroids apiladas, nota musical con corazones, rama fina.
Aparecen en `/pampagrass`, `/doodles`, `/botanico` y `/church` — el mismo set.
Están generados: los nombres dicen `ChatGPT Image 9 jul 2026`, todos del mismo
día, o sea **una sola tanda**.

**b) Botánica pintada monocroma** — 2 o 3 piezas por familia, en acuarela o
lápiz teñido de un solo color: rama de magnolia sepia de 145×520, espigas secas
color trigo, ramita de eucalipto verde con florcitas blancas, corona circular de
doble filete con hojitas.

**c) Garabatos sueltos** (sólo `/doodles`) — trazos largos y curvos, sin objeto:
una línea que recorre el borde de la hoja, dos corazones a mano alzada,
destellos sueltos. Son el elemento más informal de las 13 y el que hace que la
plantilla se lea como un cuaderno.

Y aparte, fuera de registro: `/church` tiene un **dibujo a pluma de una catedral**
(199×272), grabado fino, que es la pieza más linda de las 13 y la única
ilustración "seria" del set.

### 8.2 Cómo están compuestos — las reglas medidas

Sobre una hoja de 301 px de ancho (§3), midiendo cada pieza como fracción del
ancho de su hoja:

| Regla | Valor medido |
|---|---|
| **Ningún ornamento tiene transform ni blend mode** | 159 de 159 imágenes: `transform: none`, `mix-blend-mode: normal`, `opacity: 1` |
| Ícono de línea sobre el título | ancho **0,19** de la hoja (mediana; rango 0,10–0,30) → **57 px**, rango 30–90 |
| Ícono: posición | centrado, `relX` 0,36–0,43; justo encima del número de sección |
| Botánica de esquina | ancho 0,28–0,38 · `relX` **−0,05 a 0** · `relY` 0,55–0,74 |
| Botánica de cabecera | ancho 0,40–0,63 · `relX` 0,37–0,56 · `relY` 0,00–0,10 |
| Botánica vertical de costado | ancho 0,45 · alto 520 px sobre una portada de 773 → recorre **2/3 de la altura** |
| Par espejado | la misma pieza a `relX` 0 y `relX` 0,67, reflejada |
| Título de sección en relieve | ancho 0,59 de la hoja (190 px) |

Tres conclusiones, que son las que hay que trasladar:

1. **Toda pieza grande sangra por un borde de la hoja.** Ninguna flota en el
   medio. Las de esquina arrancan en `relX −0,05` (o sea, entran cortadas desde
   afuera); las de cabecera se cortan arriba. Es lo que hace que la hoja se lea
   como un papel impreso y no como una página web con una calcomanía pegada.

2. **Dos o tres piezas por familia, reutilizadas en tres a cinco tamaños.**
   `/botanico` usa **dos archivos** en toda la invitación: una ramita de esquina
   (a 123×155 y a 77×156) y una rama horizontal (a 201×83, 146×60 y 127×52).
   Nada más. La riqueza sale de la repetición a distintas escalas, no de tener
   muchos dibujos.

3. **El ornamento está quieto.** Cero rotación, cero opacidad parcial, cero
   modo de fusión. Entra con el mismo fundido que el resto de la sección y se
   queda donde está. Cualquier ornamento que se mueva o brille rompe el registro.

### 8.3 Qué hacemos nosotros

Lo mismo, generado y recortado con el flujo que ya usamos en la Colección D
(lámina PNG → recorte por etiquetas → WebP con transparencia → `INVENTARIO.md`),
con dos correcciones sobre el original:

- **Un set de íconos para toda la colección**, no uno por familia. Son el
  vocabulario común y hacen que las cuatro familias se lean como una.
- **Monocromo de verdad**: cada pieza sale en tinta a un solo color, para usarse
  como máscara CSS (`mask` con `background: var(--t-acc)`) y recolorearse por
  variante sin regenerar nada. Ramé no puede hacer eso: sus flores vienen con el
  color quemado, y por eso `/botanico` y `/magnolia` no tienen variantes.

Las láminas a pedir y sus prompts están en
`docs/PROMPTS_CLAUDE_DESIGN_COLECCION_PAPEL.md`, §5.

---

## 9. La tipografía script: Final Parade Script

Las referencias cargan **Final Parade Script** (se ve en su stack de fuentes
como `orig_final_parade_script`), a **29 px** y en tinta plana. Es la misma que
se compró para este proyecto y la que usa la Colección E.

**Ficha del archivo** (leída del TTF):

| Campo | Valor |
|---|---|
| Familia | Final Parade Script · Regular · v1.002 |
| Autoría | Putracetol Studio, Karanganyar — Putra Novembria Candra Kusuma, ©2022 |
| Licencia | "please refer to the license on the website where you bought this font" → putracetol.com/licenses/ |
| `fsType` | **0** (Installable Embedding: el archivo no restringe el empotrado) |
| Glifos | 361 — cubre todos los acentos, `ñ`, `ü`, `¿`, `¡`, cifras y puntuación |
| Features | `liga` (ligaduras), `kern`, `aalt` |
| Métrica | 1000 upem · asc 900 · desc −400 |

Conversión: el TTF de 131,9 KB pasó a **WOFF2 de 59,8 KB**, sin subsetear, para
no perder las ligaduras ni el kerning — en una script, eso es el efecto.
Queda en `src/app/fonts/final-parade-script.woff2` y se registra en
`src/app/layout.tsx` con `next/font/local`, variable `--font-final-parade`, con
`preload: false` (sólo la pintan las plantillas de esta colección). También
quedó como opción de título en `src/lib/typography-map.ts`.

> Nota legal, una sola vez: `fsType 0` es un permiso técnico del archivo, no una
> licencia. Las licencias de estos estudios suelen separar *desktop* de
> *webfont*, y el uso en **plantillas que se venden a terceros** a veces pide una
> licencia extendida. Conviene confirmar esos dos puntos con Putracetol antes de
> publicar la colección. La fuente ya está instalada y funcionando.

### 9.1 El límite medido: relieve vs tinta plana

Final Parade es **monolineal y muy fina**. El relieve de §5.2, que funciona
perfecto con un serif, se la come. Se probaron cinco combinaciones
(`mockup/inspire/webs/4z-final-parade-relieve-vs-plana.jpg`):

| | Tamaño | Tratamiento | Resultado |
|---|---|---|---|
| A | 34 px | tinta plana | **Perfecto.** Es como la usan las referencias (29 px). |
| B | 34 px | tinta de color | Perfecto; es la opción de la familia Naipe. |
| C | 46 px | relieve estándar | **Se borra.** El trazo no tiene cuerpo para sostener tres sombras. |
| D | 56 px | relieve reforzado | El mínimo que aguanta. |
| E | 72 px | relieve reforzado | Muy bien; es el tamaño de lucimiento. |

Reglas que salen de ahí, y que están en el prompt:

- Por defecto, **tinta plana a 30-36 px**.
- Si se quiere en relieve, **56 px o más y con el contraste reforzado**:
  offsets de 1,5 px, sombra al 80 % y luz al 100 %, en vez de 1 px / 55 % / 92 %.
- Nunca relieve estándar a tamaño de título, nunca por debajo de 28 px, nunca en
  mayúsculas ni con `letter-spacing`.

El relieve, entonces, es de la **serif** (Cormorant Garamond 300). La script
entra en tinta, que además es lo que hace que la hoja tenga dos niveles de
lectura en vez de uno.
