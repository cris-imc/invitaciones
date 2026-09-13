# Análisis de las 12 webs de inspiración (para las nuevas colecciones)

> Complemento de `docs/PROMPTS_CLAUDE_DESIGN_NUEVAS_COLECCIONES.md`. Fecha: 2026-09-12.
>
> **Nota metodológica.** Este documento tiene dos partes. La primera (secciones
> 1 a 12) se escribió cuando la red del entorno todavía bloqueaba las webs: se
> basa en el código fuente público del sitio 1 (verificado), en fichas de
> Awwwards / Codrops / Framer / Webflow vía búsquedas y en memoria previa,
> marcada *[memoria]*. La segunda parte ("Medido en navegador", al final) se
> hizo después de habilitar la red: HTML y JS descargados de los 12 sitios,
> video de 30-40 s por sitio con carga + 6 pasos de scroll, tira de fotogramas y
> una traza del DOM (posición, transform y opacidad de hasta 450 elementos en la
> intro, en 6 posiciones de scroll y en reposo). **Donde las dos partes
> difieren, vale la segunda.**
>
> Leyenda de fiabilidad: **[verificado]**, **[fuente secundaria]**, **[memoria]**.
> Restricciones del proyecto para la viabilidad: un componente React por
> archivo, solo CSS + SVG inline + framer-motion / anime.js (sin WebGL, GSAP,
> Lottie/Rive ni video obligatorio).

---

## 1. 2018 — A Year In Review (Green Chameleon / Unseen Studio)

- **URL**: https://2018.craftedbygc.com/#enter
- **Lo que gustó**: el scroll se siente como viajar hacia adentro de la escena.
- **Fiabilidad**: **[verificado]** (código fuente).

**Librerías**: `three@0.101` (WebGL), `gsap@2`, `three-bmfont-text`, `three.meshline`, `three-svg-loader`, `tinygesture`, shaders GLSL propios. Sin ScrollTrigger ni Lenis: el scroll es **virtual** (wheel/touch → `scrollPos` → tween de `timeline.position.z`), no hay scroll nativo.

**Assets**: ~25 videos `.mp4` como `VideoTexture` sobre planos; JPG/PNG; SVG para logo/flechas; fuentes BMFont. Tipografía: **Schnyder L** (serif display, título "2018" en outline al fondo) + **Suisse Intl Bold**. Paleta: fondo/niebla **#AEC7C3** (salvia gris), acento **#1B42D8** (azul eléctrico), blanco.

**Visual**: escena clara, tarjetas flotando en distintos planos alrededor de un eje central, título serif outline enorme al fondo, cursor custom. Con el scroll la cámara avanza: lo lejano emerge de la niebla, pasa a los lados y sale por detrás.

**Técnica**: cámara fija, **se mueve el grupo en Z** (dolly equivalente). Cada ítem en `z = índice * -300 - 200`; `scene.fog = Fog(0xAEC7C3, 1400, 2000)` funde lo lejano con el fondo (**la niebla es la clave de la profundidad**). Shader por ítem: imagen ↔ duotono según `progress`. `camera.rotation` sigue al mouse (tilt).

**Viabilidad**: **MEDIUM** con CSS 3D real. Contenedor `sticky; height:100vh; perspective:800px; transform-style:preserve-3d` dentro de una sección de 400-600vh; 8-15 capas con `translate3d(x, y, -zᵢ)`; un padre cuyo `translateZ` va de 0 a zMax con el progreso del scroll; cuando la z relativa de una capa pasa por 0 → `opacity 0`. Niebla: opacidad/`blur()` por capa según distancia o `radial-gradient` fijo del color de fondo. Tilt con mouse (`rotateX/rotateY` + spring). Límite: sin video-texturas ni shaders; más de ~20 capas con blur pesa en móvil.

**Ideas reutilizables**: hero "entrá a la fiesta" (pasillo de tarjetas/flores/globos hacia un título outline); línea de tiempo en profundidad ("cómo nos conocimos"); niebla del color del fondo (salvia, rosa empolvado, crema); título gigante en outline como capa más lejana; tilt con mouse/giroscopio; duotono → color al enfocar (`grayscale()`).

---

## 2. Shape Studio

- **URL**: https://shapestudio.co.uk/
- **Lo que gustó**: scroll horizontal, elementos que aparecen progresivamente, tamaño del texto.
- **Fiabilidad**: **[fuente secundaria]** (Awwwards SOTD; case study de Unseen Studio) + **[memoria]**.

**Librerías**: GSAP, WebGL (patrón Unseen: canvas fijo, imágenes como planos con distorsión ligada a la velocidad del scroll), WordPress. Sans grotesk a dos escalas (titulares 8-12vw), índices numerados *[memoria]*.

**Visual**: minimalismo de galería, fondo claro, mucho aire, fotografía editorial grande, recorrido **horizontal** en la home.

**Técnica**: rueda vertical → track con `translateX` proporcional al progreso (pin), con lerp. Reveals por máscara de línea (`overflow:hidden` + `translateY(100%) → 0`) con stagger.

**Viabilidad**: **EASY-MEDIUM**. Es lo que ya hace la Storytelling (`data-pan/data-strip`). La distorsión WebGL no se reproduce; aproximación: `skewX` proporcional a la velocidad del scroll con spring.

**Ideas**: programa del evento en horizontal; galería horizontal con captions enmascarados; tipografía a escala de viewport (`clamp(3rem, 10vw, 12rem)`); skew por velocidad; índice numerado 01/04.

---

## 3. InDnegev (festival)

- **URL**: https://indnegev.co.il/
- **Lo que gustó**: ilustración superior, movimiento por capas, look papel.
- **Fiabilidad**: **[fuente secundaria]** (Awwwards: Art & Illustration, Parallax, Header Design; Made-in-Webflow) + **[memoria]**.

**Librerías**: Webflow (IX2: "while scrolling into view", "mouse move"). Google Fonts (hebreo, RTL). Sin WebGL/GSAP.

**Assets**: PNG/WebP/SVG por capas (cielo, dunas, escenario, personajes, plantas, nubes); textura de papel.

**Visual**: hero ilustrado a pantalla completa, paisaje desértico en capas tipo **recorte de papel** (sombra suave, colores planos, grano). Paleta cálida aprox.: arenas #E8C39E-#D9A066, terracota #C8553D, rosa atardecer #F2A7B4, azul noche #1E3A5F, crema #F6EFE4.

**Técnica**: 4-6 capas absolutas con `translateY` (y `translateX`/`scale`) a velocidades distintas ligadas al scroll y al mouse. Papel: `drop-shadow` suave por capa, bordes irregulares, grano multiplicado.

**Viabilidad**: **EASY**. Cada capa un `<g>` SVG con `y` ligado al progreso; papel con `feDropShadow` + `feTurbulence`/`feDisplacementMap` (scale 1-2) para bordes "cortados"; grano con `feTurbulence` a baja opacidad. Todo en un archivo.

**Ideas**: hero de paisaje por capas con los nombres insertados entre capas; recorte de papel para flores, hojas, guirnaldas y globos; sol/luna que asciende y cielo que cambia con el scroll; parallax con mouse/giroscopio (±10px); bloques de info con color plano heredado de la ilustración.

---

## 4. Ambient Parallax Template (Webflow)

- **URL**: https://parallax-bgsprod.webflow.io/
- **Lo que gustó**: ilustración superior, parallax por capas.
- **Fiabilidad**: **[fuente secundaria]** (Made-in-Webflow, 2022) + **[memoria]**.

**Librerías**: Webflow IX2. Sin WebGL/GSAP. Preloader.

**Visual**: paisaje de montaña vector plano/degradé en crepúsculo (#1B1F3B → #6C5B9C → #F29E6C). Título centrado, sans geométrica bold. Al bajar, las montañas se separan (las lejanas más lentas) y el título se desvanece.

**Técnica**: `translateY` por capa (mayor en primer plano), `opacity` del título 1→0, `scale` en nubes, nubes en loop por `translateX`.

**Viabilidad**: **EASY**, igual que el sitio 3 con vectores planos.

**Ideas**: cielo degradado que cambia de amanecer a noche a lo largo de la invitación; nubes/globos en loop; preloader con monograma que "abre" la invitación; botones RSVP/mapa con micro-rebote; siluetas como pie que se cierra al final.

---

## 5. Unifiers of Japan (Framer)

- **URL**: https://unifiersofjapan.framer.website/
- **Lo que gustó**: texto grande, movimiento del texto, animaciones, ilustraciones cartoon.
- **Fiabilidad**: **[fuente secundaria]** (Framer Site of the Month; Framer blog) + **[memoria]**.

**Librerías**: Framer (React + framer-motion: appear, scroll transforms, text effects con stagger por carácter/palabra). Sin WebGL.

**Assets**: ilustraciones cartoon vectoriales (personajes históricos, armaduras, abanicos, sellos).

**Visual**: paleta japonesa contrastada: bermellón #C8102E, negro tinta #111, crema #F4EDE0, oro #D4A83A. Titulares **enormes** (10-20vw) en sans condensada bold. Personajes con contornos gruesos, sombras planas. Secciones a pantalla completa alternando texto gigante / ilustración / bloques de datos.

**Técnica**: split en palabras/caracteres + stagger `opacity/y/rotate`; appear (fade + slide + blur); parallax `y/scale/rotate`; `sticky` para escenas fijas mientras cambia el texto.

**Viabilidad**: **EASY** (es framer-motion 1:1). El costo está en dibujar los personajes, no en la técnica.

**Ideas**: nombre a 15-20vw con entrada por caracteres (`y: 60→0`, `rotate: 6→0`, stagger 0.03s); personaje cartoon de la quinceañera / pareja con poses por sección; fichas de datos como "stats" con contadores; sellos con `scale 1.4→1 + rotate`; fondos planos de alto contraste por sección.

---

## 6. Haus of Words

- **URL**: https://www.hausofwords.com/
- **Lo que gustó**: colorido, composición tipográfica, movimientos de texto.
- **Fiabilidad**: **[fuente secundaria]** (Made-in-Webflow; Webflow Blog; sebastianbeck.design: tipografía custom combinable en patrón, inspirada en México) + **[memoria]**.

**Librerías**: Webflow IX2. Tipografía custom (`@font-face`). Sin WebGL.

**Visual**: paleta mexicana: fucsia #FF3C8E, amarillo #FFD23F, naranja #FF7A1A, turquesa #1FB5A3, azul #2D46FF sobre blanco y bloques saturados. Composición **tipográfica de póster**: palabras en distintos colores/pesos, tickers, patrones de letras de fondo, números grandes ("Haus in Numbers").

**Técnica**: reveals por línea/palabra; marquee infinito; patrón tipográfico animado; contadores; hover outline ↔ relleno.

**Viabilidad**: **EASY**. Marquee con `x: 0% → -50%` duplicando contenido; `<pattern>` SVG rotando; contadores.

**Ideas**: ticker con nombres / "Nos casamos" / fecha en dos direcciones; titular multicolor; sección "en cifras" ("15 años · 3 hermanos · 200 invitados"); patrón de monograma de fondo girando; palabras outline ↔ relleno al tocar.

---

## 7. Ponpon Mania (cómic interactivo)

- **URL**: https://ponpon-mania.com/
- **Lo que gustó**: personajes cartoon y sus efectos; "cómo lograr ese nivel de dibujo y animación".
- **Fiabilidad**: **[fuente secundaria]** muy completa (Codrops, Awwwards SOTD; Justine Soulié ilustración, Patrick Heng dev).

**Librerías**: WebGL custom, GSAP, Matter.js (física), Lenis, atlas de sprites, shaders GLSL para transiciones. Paleta: base blanco y negro; el color (#7E7EFF violeta, #F894C0 rosa) entra solo en las fantasías de DJ.

**Assets**: ilustraciones vectoriales de Illustrator **separadas por capas** (cuerpo, ojos, boca, brazos, props) empaquetadas en atlas PNG; audio; navegación tipo reproductor.

**Visual**: cómic de línea negra sobre blanco; ovejita redonda, expresiva, línea gruesa uniforme; paneles arrastrables; el color entra como bloques planos + luces de discoteca.

**Técnica**: personaje = **rig 2D por capas**, GSAP anima cada parte (parpadeo, respiración, cabeceo) sincronizadas con el scroll. Transiciones con shader. Física para objetos arrastrables. Cámara que "entra" en la viñeta.

**Viabilidad**: **MEDIUM** para lo esencial; **NOT-FEASIBLE-WITHOUT-WEBGL** para shaders y física completa. Rig en SVG inline: cada parte en un `<g>` con `transform-box: fill-box` y loops (ojos `scaleY 1→0.1→1` cada 3-5s; cuerpo `scaleY 1→1.03`; `rotate ±3°`) cubre el 80% del "efecto vivo". Transiciones con `clip-path` o máscara con `feTurbulence`. Arrastre con `drag` + spring, sin colisiones. Zoom a viñeta con `scale + x/y` ligados al scroll sobre viñeta `sticky`.

**Respuesta a "cómo se logra ese nivel de dibujo"**: ese nivel lo dibuja un ilustrador (no sale de código) y se anima por partes. Lo reproducible por código es un estilo geométrico de pocas formas con animación de 2-3 keyframes.

**Ideas**: mascota/avatar cartoon con rig SVG que reacciona al scroll y al tap; viñetas de cómic como secciones con cámara que entra en cada una; **blanco y negro → color** al llegar a la sección de fiesta (`grayscale(1)→0`); objetos arrastrables (discos, globos, confeti); globos de texto que aparecen con `scale` desde la cola; cursor personalizado en desktop.

---

## 8. EPIC Agency

- **URL**: https://www.epic.net/en/
- **Lo que gustó**: gráficos 3D y su movimiento; movimiento del texto.
- **Fiabilidad**: **[fuente secundaria]** (Awwwards; Orpetron: Blender, Three.js, GSAP, Vue.js) + **[memoria]**.

**Librerías**: Three.js, GSAP, Vue/Nuxt, modelos de Blender (`.glb/.gltf`). Cursor custom.

**Visual**: fondo claro o de color plano con objetos 3D cartoon (redondeados, mates, sombras suaves) flotando y rotando; titulares grandes en sans geométrica bold con líneas que entran por máscara.

**Técnica**: escena three.js fija tras el DOM; el progreso del scroll mueve rotación/posición de modelos y cámara; texto: split por líneas con máscara y stagger; ciclo de palabras clave.

**Viabilidad**: **NOT-FEASIBLE-WITHOUT-WEBGL** para 3D real. Aproximaciones: pseudo-3D CSS (capas SVG con `preserve-3d` + `rotateY` ligado al scroll, o prisma de 4-6 caras) **MEDIUM**; SVG cel-shaded (2-3 tonos + highlight) que rota en 2D y escala con el scroll **EASY**; texto **EASY**.

**Ideas**: claim en tres pasos "Ceremonia · Celebración · Fiesta" con palabras que se intercambian; objetos "3D cartoon" (anillos, corona, copa, torta) cel-shaded flotando; prisma CSS de fotos girando; cursor que crece sobre botones; sombras proyectadas animadas para volumen.

---

## 9. Eszter Bial (portfolio)

- **URL**: https://eszterbial.com/
- **Lo que gustó**: movimiento del texto de bienvenida.
- **Fiabilidad**: **[fuente secundaria]** (Awwwards HM 2026: Vanilla JS, GSAP; School of Motion) + **[memoria]**.

**Librerías**: GSAP (SplitText/ScrollTrigger probables) en Vanilla JS; sin WebGL.

**Visual**: minimalismo, mucho aire, un titular de bienvenida grande que entra por líneas/palabras; fotos con reveal por máscara; un solo acento de color.

**Técnica (bienvenida)**: split en líneas/palabras/caracteres, cada fragmento en `overflow:hidden`; `yPercent: 100 → 0`, `opacity`, stagger 0.04-0.08, ease expo; a veces `rotate` 5-10° y blur que se aclara; segunda fase: pin + scrub que reduce/mueve el titular.

**Viabilidad**: **EASY**. `initial={{ y:'110%', rotate:6 }}` → `animate={{ y:0, rotate:0 }}`, ease `[0.16,1,0.3,1]`, 0.9s, stagger.

**Ideas**: bienvenida en tres tiempos ("Te invitamos a…" → nombre más grande → fecha, 0.4s entre líneas); máscara de línea; blur → nítido en el nombre; título que se encoge con el scroll y queda fijo como cabecera; reveal de fotos por `clip-path` + `scale 1.15→1`.

---

## 10. Alireza (Immersive Garden)

- **URL**: https://alireza.com/
- **Lo que gustó**: gráficos 3D de fondo que interactúan con el scroll.
- **Fiabilidad**: **[fuente secundaria]** completa (Awwwards SOTD + FWA + CSSDA; case study de Immersive Garden).

**Librerías**: three.js, GSAP, Lenis, Vue + Nuxt. Paleta: **#0E2B2D** (verde-azul profundo) y **#C38C5C** (arena/dorado).

**Assets**: modelo 3D de una **palmera** (hojas → tronco → raíces); fotografía de archivo; serif elegante.

**Visual**: oscuro y lujoso: fondo casi negro verde-azul, palmera dorada iluminada, texto claro serif con jerarquía editorial; la cámara desciende por el modelo mientras cambian los textos.

**Técnica**: recorrido de cámara por un solo modelo: progreso del scroll → posición/rotación de cámara por tramos; DOM fijo sincronizado; luces, niebla, partículas; parallax de mouse.

**Viabilidad**: **NOT-FEASIBLE-WITHOUT-WEBGL** literal; aproximación **MEDIUM**: palmera/árbol/flor SVG en 3-5 capas dentro de `sticky`; el scroll hace descender `y` con velocidades por capa, `scale` sutil y `rotate` de hojas; luz = `radial-gradient` que se desplaza; partículas: 30-60 `<circle>` con loops de `y/opacity`; texto `sticky` que cambia por tramo.

**Ideas**: recorrido vertical por un elemento único (árbol genealógico, ramo, vestido, torta de pisos); paleta joya verde profundo + dorado; partículas doradas; luz que sigue el scroll; texto fijo por capítulos (historia de la pareja en 4 tramos).

---

## 11. Mars Rejects

- **URL**: https://www.marsrejects.com/
- **Lo que gustó**: contraste de color, look cómic, movimientos de texto/scroll, tipografía cómic, diseño editorial de revista.
- **Fiabilidad**: **[fuente secundaria]** (Framer Gallery/Blog: "cabecera gráfica que se mueve horizontalmente al bajar… story cards que entran flotando mientras el arte de fondo acumula detalles… ilustración con parallax al final"; Awwwards: illustration, ticker, carousel, drag) + **[memoria]**.

**Librerías**: Framer (framer-motion: scroll transforms, appear, ticker, carrusel con `drag`). Sin WebGL.

**Assets**: ilustraciones cómic a mano (personajes, Marte), semitono, texturas de papel; display cómic + serif/sans editorial.

**Visual**: alto contraste: rojo/naranja Marte #E63B2E / #FF5A1F, negro #0B0B0B, crema #F3E9D2, acento cian o amarillo. Titulares **display cómic** (all-caps condensada con contorno y sombra desplazada); maquetación de **revista**: columnas, numeración, cajas con borde negro grueso, sellos "REJECTED". Cabecera ilustrada que se desplaza lateralmente; story cards; ticker; carrusel arrastrable "meet the squad".

**Técnica**: cabecera con `x` ligado al scroll sobre un gráfico más ancho que el viewport; story cards `whileInView` con `x/y/rotate` + fondo `sticky` que acumula capas; parallax final de 3-5 capas; ticker; carrusel `drag="x"`; `mix-blend-mode: multiply` para texturas.

**Viabilidad**: **EASY-MEDIUM**. Look cómic en CSS/SVG: `stroke` 3-4px, `text-shadow: 4px 4px 0 #000`, `box-shadow: 6px 6px 0`, semitono con `<pattern>` de círculos + `multiply`, papel con `feTurbulence`. Fuentes Google: Bangers, Bowlby One, Anton, Rubik Mono One.

**Ideas**: portada de revista/cómic ("EDICIÓN ESPECIAL · XV DE VALERIA", sello y precio ficticio); cabecera ilustrada horizontal al bajar; story cards ("Capítulo 1: llegada, 2: ceremonia, 3: fiesta") con rotación; carrusel arrastrable "meet the squad" = corte de honor / padrinos; semitono y sombra dura en títulos y fotos; sellos "CONFIRMÁ TU ASISTENCIA" con entrada tipo estampado.

---

## 12. Disco Dungeon

- **URL**: https://discodungeongame.com/
- **Lo que gustó**: el 3D logrado en la parte superior (el concepto, no el estilo).
- **Fiabilidad**: **[fuente secundaria]** (Framer Site of the Month: "al bajar, el personaje desciende como explorando la mazmorra; los muros asoman por recortes y se mantienen presentes"; arte y web por Benjamin Trigalou) + **[memoria]**.

**Librerías**: Framer (framer-motion: scroll transforms, sticky, appear). **Sin WebGL**: el "3D" es **pseudo-3D por capas** (recortes + escala + desplazamiento).

**Visual**: mazmorra oscura con neón disco: morados/azules #1A1033 / #2B1B5E, magenta #FF2E88, cian #2EE6FF, amarillo #FFD23F. Hero: personaje centrado flotando sobre un pozo con paredes que enmarcan (túnel hacia abajo). Al bajar, el personaje desciende y muros/plataformas pasan a distinta velocidad.

**Técnica**: hero alto con contenedor `sticky`; personaje con `y` ligado al progreso (+ `scale`); capas de muro (marcos con hueco central) con `scale` creciente / `y` por profundidad → **túnel vertical**; las cercanas salen primero.

**Viabilidad**: **EASY-MEDIUM**, 100% reproducible: 4-6 marcos SVG con hueco central apilados; `scale` de sᵢ a sᵢ×2.2 con el progreso, `opacity` que cae al superar un umbral, dentro de `perspective: 900px`; personaje con `y` 0→60vh y `scale` 1→0.85. Mismo principio que el sitio 1 en eje vertical.

**Ideas**: "descenso a la fiesta" (la homenajeada/pareja baja por un pozo de luces hacia el salón); **marcos concéntricos** (arcos de flores, marcos dorados) como túnel de bienvenida; antorchas/neón parpadeando; personaje que cambia de pose por tramo (saluda → baila → brinda); botonera tipo juego con `whileTap`.

---

## Familias de estilo (agrupación técnica)

### A. Profundidad / túnel por scroll (pseudo-3D reproducible)
- **Sitios**: 1 (dolly en Z), 12 (túnel vertical), 10 (variante: recorrido por un elemento único).
- **Técnica común**: `sticky` + `perspective` + capas en distintas z/escala movidas por el progreso del scroll; niebla por opacidad. 1 y 12 comparten el **mismo código** (cambia el eje y los assets).
- **Tono**: 1 claro y elegante; 12 oscuro neón; 10 oscuro lujoso.

### B. Paisaje ilustrado por capas / look papel (parallax clásico)
- **Sitios**: 3 (papel cálido), 4 (vector plano), 11 (final), 12 (mecánica), 7 (parcial).
- **Técnica común**: 4-7 capas SVG con `y` (y `x` por mouse) a velocidades distintas; sombras suaves y grano. **EASY**. Mejor relación esfuerzo/impacto para invitaciones (bodas campestres, playa, jardín, XV de princesa).

### C. Cómic / cartoon editorial de alto contraste
- **Sitios**: 11 (revista + cómic), 7 (línea negra + rig), 5 (cartoon vector + tipografía enorme), 12 (arte de juego).
- **Técnica común**: rig SVG con loops, contornos gruesos, sombra dura, semitono, viñetas con reveal, tickers y carruseles arrastrables. Ideal para XV y cumpleaños con humor.

### D. Tipografía grande cinética / editorial colorido
- **Sitios**: 5, 6, 9, 2, 8 (texto).
- **Técnica común**: split + stagger, máscaras `overflow:hidden`, marquee, contadores. **EASY**. Se combina con cualquier familia como "capa de texto".

### E. WebGL inmersivo (solo referencia de intención)
- **Sitios**: 1, 2 (distorsión), 7 (shaders + física), 8 (modelos 3D), 10 (cámara 3D).
- Sustitutos: CSS 3D, cel-shading SVG, `clip-path`, skew por velocidad, `drag` con spring.

### Compatibilidades e incompatibilidades
- **Compatibles**: A + B (túnel de capas de paisaje); B + D (paisaje + titular gigante); C + D (cómic + display); A + D (túnel + texto outline al fondo, como el sitio 1).
- **No mezclar en la misma plantilla**:
  - Minimalismo contenido (2, 9) vs cómic ruidoso (7, 11, 6).
  - Papel cálido / vector suave (3, 4) vs 3D brillante o neón (8, 10, 12): lógica de luz y paletas opuestas.
  - B/N con color puntual (7) vs multicolor total (6, 11): el "golpe" de color desaparece.
  - Scroll horizontal (2) vs túnel/descenso vertical (1, 12, 10): ambos secuestran el eje de scroll.

### Mapeo sugerido a plantillas
- **Boda elegante**: A (sitio 1, pastel) + D (sitio 9): serif outline, niebla salvia/crema, fotos en profundidad.
- **Boda campestre / playa / jardín**: B (3-4) + D (6 suavizado): paisaje de papel con nombres entre capas, cielo que cambia.
- **XV años**: C (5, 11) + B: avatar cartoon con rig, portada de revista, marcos concéntricos de flores (mecánica del 12).
- **Cumpleaños adulto / fiesta**: C (7, 12) + D (6): B/N que se llena de color al llegar a la fiesta, tickers, botonera arcade, neón.
- **Gala / aniversario de lujo**: A con paleta del 10 (verde profundo + dorado): descenso por un elemento único con partículas doradas.

---

## Para completar el análisis fuera de este entorno

En el scratchpad de la sesión quedaron dos scripts listos para correr en una
máquina sin el bloqueo de red: `grab.sh` (curl + grep de librerías, fuentes,
assets y CSS 3D de cada sitio) y `shoot.mjs` (Playwright, capturas a 1440×900
en 0/25/50/75% del scroll + móvil 390×844). Si querés capturas reales, se
pueden correr localmente y adjuntar las imágenes al prompt de Claude Design
como moodboard.


---

# Medido en navegador (2026-09-12, con la red habilitada)

Método: Chromium sin GPU (WebGL por software) a 1280×720, video de la carga +
6 ruedas de 900 px separadas 1,8 s, tira de fotogramas a 2 fps, y traza del
DOM que compara cada elemento entre pasos: factor de parallax = desplazamiento
del elemento / desplazamiento del scroll; "fijo" = position sticky o fixed;
"en reposo" = cambia sin scroll durante 3 s. Las tiras están en
`mockup/inspire/webs/`.

| # | Sitio | Estado de la medición |
|---|---|---|
| 1 | craftedbygc 2018 | **Completo en el tercer intento**: los ~25 videos de la escena ya no se sirven y el loader se quedaba en 45%; se interceptaron los pedidos `.mp4` y se respondieron con un clip de 1 s, con eso el loader llegó a 100%, apareció "Enter" y se grabó el recorrido. Las tarjetas se ven como rectángulos blancos/grises (sin sus videos), el movimiento es el real. |
| 2 | shapestudio | **No renderizó**: todo el sitio es un canvas WebGL (Unseen); con GL por software queda en blanco. Vale la sección 2 (fuentes secundarias). |
| 3 | indnegev | **Completo** (2 tiras + captura del hero). |
| 4 | parallax webflow | **Completo**. |
| 5 | unifiersofjapan | **Completo**. |
| 6 | hausofwords | **Completo**. |
| 7 | ponpon-mania | **Parcial**: se ve el preloader con la oveja (parpadea y cambia de expresión) y después solo el fondo violeta con un disco; el cómic en sí es WebGL y no se dibuja sin GPU. |
| 8 | epic | **Completo** (el auto 3D sí se renderizó). |
| 9 | eszterbial | **Completo**. |
| 10 | alireza | **Completo** (la palmera WebGL se renderizó; el scroll es virtual). |
| 11 | marsrejects | **Completo**. |
| 12 | discodungeon | **Completo**. |

## 1. craftedbygc 2018 — medido (con los videos reemplazados por un clip vacío)

- **Lo que se ve**: fondo salvia #AEC7C3 con tipografía azul eléctrico
  #1B42D8. Al entrar: "2018" gigante en serif outline al fondo, "YEAR IN
  REVIEW" en sans bold adelante, y una mano de escultura blanca con manchas
  flotando entre ambos. Al bajar, la cámara AVANZA: las letras de "YEAR IN
  REVIEW" crecen hasta salir por los bordes, la mano pasa por delante y sale de
  cuadro, entran dos líneas curvas azules (rieles), y aparece "JANUARY" en
  serif dorada sobre fondo verde petróleo #3E8A82 con tarjetas (videos)
  repartidas a distintas profundidades. Al seguir bajando, "JANUARY" crece
  hasta que solo se ven trozos de letras ("NUA") y pasa de largo; después
  "FEBRUARY" en salmón sobre azul marino #0F2A38, y lo mismo.
- **Cómo se mueve (medido en la tira, 2 fps)**: cada mes es una "sala" de
  ~8-10 s de rueda: el título aparece chico y centrado, crece de forma
  acelerada durante ~3 s hasta ocupar 3-4 veces el ancho de pantalla, y sale;
  las tarjetas entran chicas desde el centro y se abren hacia los bordes
  (las de los costados salen antes que las centrales); el cambio de mes es un
  cambio de color de fondo de toda la escena (no un corte), que dura ~1 s.
  El scroll es virtual: la rueda no mueve el documento, empuja la cámara y
  el movimiento sigue unos instantes después de soltar (inercia).
- **En reposo**: la mano de la portada flota despacio; el título no se mueve.
- **Receta para la invitación**: cada capítulo con su color de fondo pleno; el
  título del capítulo nace al 30% de tamaño en el centro y crece con el
  progreso del scroll hasta 350% mientras se desplaza hacia un borde; las
  tarjetas (fotos, sellos) reparten en 3 profundidades (translateZ -700/-350/0)
  y se separan del centro al avanzar; la transición de capítulo es un fundido
  de color de fondo de 1 s; el elemento escultórico (anillo, corona, flor)
  flota en reposo ±10 px.

## 3. indnegev — medido

- **Lo que se ve**: no es "desierto en papel recortado" como decía la parte 1.
  Es una ilustración tipo aerógrafo/risografía sobre papel con grano y marcas
  de doblez a 45°: pasto y flores en los bordes, una mariposa con un portal
  circular en el centro, nubes recortadas como stickers con borde blanco, cielo
  en degradé azul → rosa → durazno. Logotipo serif itálico enorme arriba.
  Paleta aprox.: cielo #8FA3C8 → #E9B8B0 → #F1C9A0, verde lima #C8D26A, azul
  #2F4F82, crema #F3E9D6, tinta #1F2A44.
- **Intro**: el hero ya está compuesto a los 2 s; no hay stagger de entrada
  visible. El bloque del lineup (título + filtro) sube 40 px al cargar.
- **Scroll**: el hero se queda ~10 s en pantalla porque las capas se mueven
  con parallax: las nubes al 0,82-0,85 de la velocidad del scroll (quedan
  atrás), las plantas de los flancos reciben `translateY(+72px)` en la primera
  pantalla (se adelantan). Después, el lineup: un montón de círculos de
  colores (azul, rojo, verde) que caen y se acomodan con rotación, como una
  pila con física (matrices con rotación de ±7°, desplazamientos en X de 200 a
  1000 px, factores 0,4-0,8). Después un mapa ilustrado (misma técnica) y
  secciones de información con tarjetas.
- **En reposo**: nada se mueve solo.
- **Receta**: cabecera de 5-7 capas con `data-drift` (-40 lejano, 0 medio,
  +60/+90 cercano); textura de papel `feTurbulence` al 6-8% + líneas de
  doblez al 6% de opacidad; nubes como formas con borde claro de 3 px; portal
  circular como marco del nombre.

## 4. parallax webflow — medido

- **Lo que se ve**: preloader oscuro con logo (3 s) que se retira hacia arriba
  en tres bandas (`preloader__bg-top/middle/bottom` con -536/-179/-357 px:
  cortina en tres tiempos), después el paisaje: montañas en degradé rosa →
  violeta, nubes rosadas, pinos oscuros a los lados, logo centrado. Al bajar,
  sección oscura de texto y al final una puerta iluminada.
- **Scroll (medido)**: las 8 nubes se mueven al 0,76-0,83 de la velocidad del
  scroll (más lento = más lejos); las capas del paisaje reciben `translateY`
  crecientes hacia el frente: capa 10 +43 px, capa 9 +64, capa 8 +85… en la
  primera pantalla (es decir, cada capa más cercana se adelanta ~21 px más).
  El título hace fade 0 → 1 al entrar la sección siguiente.
- **En reposo**: las nubes derivan solas en X: entre 1 y 12 px en 3 s según la
  capa (≈0,3 a 4 px/s), la más cercana más rápido.
- **Receta**: `data-drift` escalonado de 21 px por capa; deriva autónoma de
  nubes con keyframes de 20-40 s y amplitud 30-60 px; preloader en tres bandas.

## 5. unifiersofjapan — medido

- **Lo que se ve**: rojo pleno #C8102E, cara de samurái en vector plano rojo/
  negro/crema, y el nombre "ODA NOBUNAGA" en blanco gigante (≈20 vw) detrás
  del personaje, partido en piezas.
- **Intro (medido)**: las piezas del título entran desde abajo: `y` 563 → 243
  y 866 → 546 px (320 px de recorrido) entre 1,8 y 6 s, con stagger; un bloque
  de fondo se desplaza en diagonal (-460, +547 px).
- **Scroll (medido)**: el hero está casi fijo: factor 0,12 en la primera
  pantalla, 0,06, 0,04, 0,03, 0,02 después (se mueve cada vez menos: es una
  sección sticky con un leve empuje). El contenido siguiente pasa por encima:
  el personaje se acerca (cara en primer plano), después secciones crema con
  "stats" (nacimiento, castillo, años en el poder), párrafos, mapa, "BATTLE /
  STRATEGY" a pantalla completa, y un patrón de tejas.
- **En reposo**: un fondo grande se desplaza solo (819 px en X y 749 en Y en
  3 s): marquesina diagonal.
- **Receta**: hero sticky con factor 0,05-0,12; nombre en 2-3 piezas con
  translateY 320 → 0 y stagger 150 ms; capítulos que pasan por encima.

## 6. hausofwords — medido

- **Lo que se ve**: crema #F1ECE2, "HAUS OF WORDS" en negro condensado a todo
  el ancho, un bloque azul con patrón tipográfico, después un bloque naranja
  #FF6A3D con "STRATEGISCHE KOMMUNIKATION FÜR HIDDEN CHAMPIONS".
- **Scroll (medido)**: el sitio usa scroll suavizado con mucha inercia (900 px
  de rueda → 50 px de avance). La barra de navegación se esconde
  (`translateY(-68px)`) al bajar. Los títulos entran con `translateY(40 → 0)`
  + opacity, con factor 1,16-1,2 (se adelantan un poco al scroll).
- **En reposo**: la marquesina de logos corre sola 241 px en 3 s (≈80 px/s).
- **Receta**: marquesina a 80 px/s; títulos con entrada de 40 px; bloques de
  color pleno por sección.

## 7. ponpon-mania — parcial

- Preloader: oveja de línea negra sobre crema que parpadea y cambia de
  expresión (a los 6-7 s pone cara de enojo y vuelve). Es un rig por partes.
- Después, fondo violeta #7E7EFF con un disco (vinilo) que gira: el cómic es
  WebGL y no se dibuja sin GPU. Vale la sección 7 de la parte 1.

## 8. epic — medido

- **Lo que se ve**: preloader negro con logo (1,5 s), página blanca con un
  auto rojo 3D (renderizado) y el título "AVD revival" en serif.
- **Intro (medido)**: el auto entra de chico y girado: a los 4,5 s es un punto,
  a los 5,5 s está a tamaño completo (≈1,2 s, scale ~0,15 → 1 con rotación).
  El contenido del home sube 100 px al cargar.
- **Scroll (medido)**: al cambiar de caso (16 s) el auto se reduce y gira hacia
  afuera en ~0,6 s y la sección siguiente es cian con un video. El botón
  circular de CTA gira (matriz de rotación 90°) y tiene parallax 0,1-0,33.
- **En reposo**: las letras de "AVD revival" (spans `split-char`) se deslizan
  en X entre 19 y 54 px: texto que "respira" letra a letra.
- **Receta**: entrada de objeto scale 0,15 → 1 + rotateY 40° → 0 en 1,2 s;
  salida inversa en 0,6 s; letras con deslizamiento sutil.

## 9. eszterbial — medido

- **Lo que se ve**: preloader negro con contador "0%" → "100%" (1,5 → 2,5 s),
  después una cortina de 4 columnas (`loader-col`, `scaleY` 1 → 0) que se
  retiran con stagger entre 1,9 y 2,4 s, y aparece "UX/UI *brand* DESIGNER"
  gigante en crema #E8E2D6 con un dibujo de línea (carita) detrás.
- **En reposo (medido)**: letras que se intercambian: cada letra tiene un
  original y un clon; el original sale deslizando (68-170 px) y el clon entra,
  una letra cada pocos segundos ("D:ISIGNER" a los 8,5 s, "UX/UI|" a los 11 s).
  Al final, un sticker de flor violeta que gira.
- **Scroll (medido)**: el fondo de grilla es fijo; cada sección entra por
  máscara de línea; "selected PROJECTS" con itálica + condensada; sección
  negra "FEEL LIKE COLLABORATING?".
- **Receta**: contador 0 → 100 en 1 s; cortina de 4 columnas con stagger 80 ms
  y 500 ms de duración; intercambio de letras cada 3-5 s.

## 10. alireza — medido

- **Lo que se ve**: fondo verde-azul profundo #0E2B2D; loader con un diamante
  pequeño que crece hasta un anillo (4 → 11 s); después la palmera 3D
  (renderizada) en tonos verde y dorado, y el texto "A Story of Growth" en
  serif clara.
- **Intro (medido)**: cada bloque de texto entra con `translateY 60 → 0` y
  opacity 0 → 1, escalonado (60 → 18 → 8 → 2 px en pasos sucesivos; los
  bloques siguientes van 0 → 0,42 → 0,66 → 0,96 de opacidad): stagger de
  ~120 ms y ~0,9 s por bloque.
- **Scroll**: virtual (Lenis); el DOM no se mueve, la cámara recorre la
  palmera. Las hojas giran despacio en reposo.
- **En reposo**: la sección de texto flota ±29 px (respiración lenta).
- **Receta**: loader que crece a anillo; textos que suben 60 px con stagger 120
  ms; un objeto único recorrido con el scroll; respiración de ±20-30 px.

## 11. marsrejects — medido

- **Lo que se ve**: preloader azul noche (3 s); hero con personajes de cómic en
  tinta blanco y negro (línea gruesa, sombreado a rayas) y el título "MARS
  REJECTS" en rojo #E63B2E detrás. Después la sección invierte: fondo rojo,
  título negro. Después una portada de revista ("Mars") fija con tarjetas de
  historia y globos de texto que entran alrededor.
- **Intro (medido)**: el hero hace fade 0 → 1 en ~1,2 s; el `ul` de
  personajes ya viene desplazado (-236 px): es un ticker.
- **Scroll (medido)**: el hero es casi fijo (factor 0,02-0,06); el ticker de
  personajes avanza -166 px por paso además de su marcha; el título
  (`framer-k7infy`) hace fade 1 → 0 al pasar a la sección roja; contenedores
  sticky para la portada de revista mientras las tarjetas entran.
- **En reposo**: el ticker corre 147 px en 3 s (≈50 px/s).
- **Receta**: ticker de ilustraciones a 50 px/s detrás del título; inversión
  de color al cambiar de sección; portada sticky + tarjetas que entran con
  rotación ±3°.

## 12. discodungeon — medido

- **Lo que se ve**: hero oscuro violeta #1A1033 con dos estatuas enmarcando,
  un personaje sentado sobre una plataforma luminosa en el centro y el
  logotipo "DISCO DUNGEON" con volumen. Al bajar: "Puzzle RPG Adventure",
  secciones con plataformas isométricas inclinadas, un carrusel de capturas.
- **Intro (medido)**: el título y el bloque principal hacen fade 0 → 1 en
  ~4,5 s (lento a propósito); el personaje baja 22-32 px (`y` 182 → 204) y
  la plataforma escala levemente (1 → 1,004): respiración.
- **Scroll**: el hero se va rápido (no está pineado en esta versión) y las
  secciones siguientes entran con fade + desplazamiento de 10-20 px.
- **En reposo**: personaje y plataforma respiran (±16 px, ~3,5 s).
- **Receta**: hero con fade lento de 4 s; personaje que respira ±16 px en 3,5
  s; marcos/estatuas como capas laterales; plataforma con escala sutil.

## Qué cambia respecto de la parte 1

- craftedbygc (1): ahora sí visto en movimiento: confirma el dolly (todo se
  acerca y sale por los bordes) y suma un dato que el código no mostraba tan
  claro: el título de cada sección es la capa que más crece (hasta 3-4 veces
  el ancho) y el cambio de sección es un fundido de color de fondo.
- indnegev (3): el estilo es aerógrafo/risografía con grano y dobleces, no
  papel recortado plano. La mecánica (capas con parallax) sí era correcta.
- discodungeon (12): en la versión actual el hero no queda pineado con marcos
  que escalan; lo que hay es respiración del personaje y fade lento. La idea
  de "marcos concéntricos que se abren" queda como propuesta nuestra, no como
  algo medido.
- unifiers (5): confirmado el hero casi fijo (factor 0,02-0,12) con el nombre
  en piezas de 320 px de recorrido.
- hausofwords (6): confirmada la marquesina a ~80 px/s; el scroll tiene mucha
  inercia.
- eszterbial (9): confirmado el contador + cortina de columnas + intercambio
  de letras.
- epic (8): confirmada la entrada del objeto por escala + rotación en ~1,2 s.
- alireza (10): confirmadas las entradas de texto de 60 px con stagger.
- marsrejects (11): confirmado el ticker (~50 px/s), la inversión de color y
  la portada fija con tarjetas.
