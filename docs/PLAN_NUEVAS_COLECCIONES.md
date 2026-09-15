# Plan de instalación — Colecciones Paper e Iconic

> Rama: `nuevas-colecciones` (sale de `main` en `8e0b13c`).
> Este documento es la bitácora viva: **el estado de cada familia se actualiza acá y se commitea en el mismo commit que el código**. Si la sesión se corta, `git log` + la tabla de la sección 6 dicen exactamente por dónde íbamos.

---

## 1. Qué hay en los mockups (relevado el 2026-09-15)

Dos carpetas, cuatro sub-colecciones, **29 familias × 5 variantes = 145 plantillas**.

### `mockup/Paper/` — mecanismo **Flat** (10 familias)

| Sub-colección | Familia | Evento | Base a copiar (según notas de port del mockup) | Piezas |
|---|---|---|---|---|
| Papelería Viva 01 | Sobre & Sello | Casamiento | ModernoTemplate | `sobre-sello/` (4) + `tinta-vinilo/vinilo` |
| Papelería Viva 02 | Acuarela & Corona | Quince | ModernoTemplate | `acuarela-corona/` (8) |
| Papelería Viva 03 | Manuscrita | Casamiento informal | ModernoTemplate | `manuscrita/` (4, como máscara) |
| Papelería Viva 04 | Tinta & Vinilo | Cumpleaños adulto | ModernoTemplate | `tinta-vinilo/` (5) |
| Papelería Viva 05 | Membrete | Corporativo | ModernoTemplate | ninguna (todo SVG/CSS) |
| Papel Prensado 01 | Prensa | Casamiento **y** Quince (toggle en el mockup) | ModernoTemplate | `iconos-linea/` (12, máscara) |
| Papel Prensado 02 | Noche | Casamiento, Quince y Corporativo | ModernoTemplate, **tema oscuro** | `iconos-linea/` |
| Papel Prensado 03 | Lumbre | Casamiento y Quince | ModernoTemplate | `iconos-linea/` |
| Papel Prensado 04 | Herbario | Quince (sin ceremonia) | ModernoTemplate | `herbario/` (4, como `<img>` con duotono) + `iconos-linea/` |
| Papel Prensado 05 | Trazo | Casamiento y Quince | ModernoTemplate | `trazo/` (9) + `iconos-linea/` |

Los cinco de Papel Prensado comparten **un solo registro**: hoja 301:432 con relieve y grano en CSS, entrada de sección `rotateY 6°` 1200 ms, luz que gira con el scroll, pastilla inferior con íconos de línea, CONFIRMADO en relieve hueco. Lo que cambia entre familias es el ornamento; entre variantes, **sólo el tono del papel** (la tinta es la misma en las cinco — esto está anotado en el mockup para que la auditoría de acentos duplicados no lo lea como bug).

Los cinco de Papelería Viva tienen cada uno **su gesto de apertura propio** (el sobre que se abre y el lacre que se parte, etc.) y variantes de paleta completa (fondo, alterno, tinta, tinta suave, acento, secundario).

### `mockup/Icon/` — mecanismo **Storytelling** (19 familias)

| Sub-colección | Familia | Evento | Prefijo | Fuentes | Piezas propias |
|---|---|---|---|---|---|
| Capas de papel | Jardín de papel | Casamiento | `jdp` | Cormorant Garamond + DM Sans | `img/` 7 PNG |
| Capas de papel | Cielo de papel | Quince | `cdp` | Playfair Display + DM Sans | `img/` 7 PNG |
| Capas de papel | Ciudad de papel | Casamiento urbano | `ciu` (el mockup repite `cdp`) | Playfair Display + Work Sans | `img/` 7 PNG |
| Capas de papel | Cuento de papel | Quince (cuento de hadas) | `cuh` | Playfair Display + DM Sans | `img/` 7 PNG |
| Capas de papel | Trazo de papel | Casamiento (línea dibujada, sin fotos) | `tdp` | Caveat Brush + DM Sans | `img/trazo/` 24 PNG |
| Tipográfica Editorial | Editorial Blanc & Noir | Casamiento | `ebn` | Instrument Serif + Archivo | — |
| Tipográfica Editorial | Couture | Casamiento | `cou` | Bodoni Moda + Space Grotesk | — |
| Tipográfica Editorial | Cartelera | Casamiento | `car` | Limelight + … | — |
| Tipográfica Editorial | Bauhaus | Casamiento | `bau` | Jost | — |
| Tipográfica Editorial | Retrowave | Casamiento (roadmap "Retrowave 1987") | `rtw` | Righteous | `assets/rw-*` 3 PNG |
| Tipográfica Editorial | Postal | Casamiento | `pos` | Alfa Slab One + Work Sans + JetBrains Mono | — |
| Tipográfica Editorial | Noir | Casamiento | `noi` | Playfair Display 900 + Courier Prime | — |
| Tipográfica Editorial | Observatorio | Casamiento | `obs` | Cormorant Garamond + Jost + IBM Plex Mono | — |
| Tipográfica Editorial | Pop | Quince | `pop` | Bangers + Nunito | — |
| Tipográfica Editorial | Shōjo | Quince | `sho` | Cherry Bomb One | — |
| Tipográfica Editorial | Reino | Quince | `rei` | Cinzel Decorative | — |
| Tipográfica Editorial | Tropical | Quince | `tro` | Lilita One | — |
| Tipográfica Editorial | Y2K | Quince | `y2k` | Baloo 2 + Comfortaa + VT323 | — |
| Tipográfica Editorial | Arcade | Quince | `arc` | Press Start 2P + Rubik | — |

Todas traen 5 variantes y un bloque de handoff con paleta, tipografía, capas, animaciones (duración · easing · stagger) y convenciones `data-*` idénticas a las de Guest Pass VIP (`data-xin`, `data-w`, `data-pan`/`data-strip`/`data-dot`, `data-tone`, `data-screen-label`, riel lateral). Es decir: **se portan sobre la arquitectura de `GuestPassVipTemplate.tsx`**, con `BienvenidaStorytelling`, `PostEventoStorytelling`, `BurbujaPase`, `QrDeIngreso` y el arreglo del álbum de una hoja (`--st-pasos`).

### Lo que ya está en el repo (no hay que volver a traer)

- `public/templates/` tiene **idénticas** las 21 piezas de Papelería Viva y las de herbario/iconos-linea/trazo. Las cinco de `baraja/` del mockup son más nuevas que las del repo (13:08 vs 11:23 del 15/9): se copian las del mockup.
- `src/app/fonts/final-parade-script.woff2` es byte por byte la misma que trae el mockup; ya está registrada en `layout.tsx`.
- Los `.zip` son los mismos exports empaquetados; los `screenshots/` y `uploads/` son referencia de diseño, no van a `public/`.
- `mockup/Icon/mockup/*` (Pase VIP, Acrylic Pop) son copias de referencia de mockups ya portados. No se tocan.

### Lo que falta traer

- **Icon `img/` (18 PNG de 1254 px, ~1,3 MB cada uno) e `img/trazo/` (30 PNG chicos) y `assets/rw-*` (3 PNG)**: 34 MB de PNG. Van a `public/templates/<familia>/` **convertidos a WebP y reducidos** (`scripts/optimizar-imagenes.js`), nunca como PNG de 1,3 MB.
- ~22 familias tipográficas de Google Fonts nuevas, vía `next/font/google` en cada plantilla (mismo patrón que `gpBodoni` en Guest Pass VIP).

---

## 2. Decisiones de arquitectura

### 2.1 Cuatro colecciones en el wizard

Hoy la colección es un binario en tres archivos (`type Collection = "FLAT" | "STORYTELLING"`) y se deduce con `isStorytellingTemplate()`. Pasa a ser:

```ts
// wizard-steps-config.ts — fuente única
export type Coleccion = "FLAT" | "STORYTELLING" | "PAPER" | "ICONIC";
export const COLECCION_DE_FAMILIA: Record<string, Coleccion> = { … };
export function coleccionDeFamilia(tipo): Coleccion  // default FLAT
```

`isStorytellingTemplate()` **se conserva** pero pasa a significar *"arquitectura storytelling"* (scroller propio, paneles, paso Recorrido, sin paso de tipografía): devuelve `true` para STORYTELLING **e ICON**. Paper es arquitectura Flat en todo (tipografía elegible, portada, álbum). Así los ~15 usos actuales de `isStorytellingTemplate` (flujo del wizard, scroll del preview, showcase de la landing) siguen correctos sin tocarlos; sólo el selector y el filtro de tabs pasan a usar `coleccionDeFamilia`.

Etiquetas visibles (es/en/pt + variante AR): **Colección Paper** y **Colección Iconic**, como las nombró el pedido. Dentro del modal de familias, cada tab lleva su sub-colección como subtítulo chico (Papelería Viva / Papel Prensado / Capas de papel / Tipográfica Editorial) para que las 19 de Icon no sean una fila plana de 19 nombres.

### 2.2 Códigos de familia (`TemplateTipo`) y variantes

| Familia | Código | ids de variante (`temaColores.colorPrincipal`) |
|---|---|---|
| Sobre & Sello | `SOBRESELLO` | default (Bordó), VerdeBosque, AzulTinta, Terracota, Oliva |
| Acuarela & Corona | `ACUARELACORONA` | del mockup |
| Manuscrita | `MANUSCRITA` | del mockup |
| Tinta & Vinilo | `TINTAVINILO` | del mockup |
| Membrete | `MEMBRETE` | del mockup |
| Prensa | `PRENSA` | default (Lino), Hueso, Arena, Piedra, Humo |
| Noche | `NOCHE` | default (Carbón), Tinta, Vino, Bosque, Bronce |
| Lumbre | `LUMBRE` | del mockup |
| Herbario | `HERBARIO` | cinco verdes (par hex/filtro) |
| Trazo | `TRAZO` | del mockup |
| Jardín de papel | `JARDINDEPAPEL` | default (Jardín), NocheEstrellada, Bosque, RosaEmpolvado, Vinedo |
| Cielo / Ciudad / Cuento / Trazo de papel | `CIELODEPAPEL` `CIUDADDEPAPEL` `CUENTODEPAPEL` `TRAZODEPAPEL` | del mockup |
| Editorial Blanc & Noir | `EDITORIALBLANCNOIR` (`EDITORIAL` ya existe en Flat) | del mockup |
| Couture | `COUTURE` | default (Oro), Burdeos, Botella, Noche, Terracota |
| Cartelera, Bauhaus, Retrowave, Postal, Noir, Observatorio | `CARTELERA` `BAUHAUS` `RETROWAVE` `POSTAL` `NOIR` `OBSERVATORIO` | del mockup |
| Pop, Shōjo, Reino, Tropical, Y2K, Arcade | `POP` `SHOJO` `REINO` `TROPICAL` `Y2K` `ARCADE` | del mockup |

Regla: `XxxTemplate.tsx` exporta `XxxTemplate`; la variante `XxxTemplateNombre.tsx` exporta `XxxTemplateNombre` (lo verifica `scripts/generar-plantillas-dinamicas.js`).

### 2.3 Cómo se porta cada familia (contrato, no negociable)

**Paper (Flat)** — por las notas de port de los mockups y la guía §2:
1. Copiar `ModernoTemplate.tsx` (nunca Chic/Neon). Tema claro: revisar cada `color:`/`text-[#…]` contra su fondo real.
2. Componentes compartidos de `v2/` (Countdown, RSVPWizardV2, BottomNavPill, SongSuggestion, Album con switch por `albumStyle`, ProgressiveQuiz, SectionWrapper) — **no** re-maquetar lo que el mockup maquetó a mano sólo para mostrar el diseño.
3. Theming en los dos wrappers (§3.2): `--t-bg --t-surface --t-muted --t-acc --t-acc2 --c-accent`, y `--chic-ink` literal en tema claro (§3.4). En Papel Prensado `--t-acc/--t-acc2` son la **tinta**, no un acento.
4. Las 9 secciones y los 10 slots de doodle en su posición; el gesto de apertura, el efecto sobre la foto y el marco, **tal como los describe el handoff** (nombre · duración · easing · delay).
5. Piezas: `iconos-linea/` y `manuscrita/` como **máscara CSS** con background en la tinta; `herbario/`, `sobre-sello/`, `acuarela-corona/`, `tinta-vinilo/`, `trazo/` como `<img alt="" aria-hidden>`; rutas canónicas `/templates/<familia>/x.webp` en una constante `PIEZAS`.
6. Final Parade Script como `var(--font-final-parade)` (ya registrada). El resto por `next/font/google`. **Las caras son parte del diseño y quedan fijas en el archivo**: Paper no lee `--font-title/--font-body-custom` y el paso de Tipografía del wizard no aparece para esta colección (igual que Storytelling e Iconic). Ojo con la especificidad: la regla genérica `.tpl h3` le ganaba a `.pr-titulo`; la script lleva `!important` en sus cuatro lugares (títulos de sección, &, frase de cierre, nombre del splash).
7. Variantes por script (§2.4), con la nota en el generador de qué cambia y qué no.
8. Post-evento: el mismo mecanismo que usan las Flat actuales.

**Icon (Storytelling)** — por el handoff de cada mockup y la guía:
1. Copiar `GuestPassVipTemplate.tsx` (2.196 líneas: scroller, riel, `data-pan`/`data-strip` con `--st-pasos`, Bienvenida, PostEvento, BurbujaPase, QR). Renombrar el prefijo de clases (`gp-` → el de la tabla).
2. Reemplazar la piel completa: capas de la cabecera, animaciones con las duraciones del handoff, paleta por variante, fuentes por `next/font/google`.
3. Respetar `storytellingScrollVertical` (paneles apilados) y `prefers-reduced-motion` (estado final, sin drift).
4. Piezas propias a `public/templates/<familia>/` en WebP.

### 2.4 Wiring (por familia, siempre igual)

1. `template-preview-registry.tsx`: `TemplateTipo` + `XXX_COLORS` + `XXX_COMPONENTS`.
2. `wizard-steps-config.ts`: `COLECCION_DE_FAMILIA[XXX]`; si es Icon, también en `STORYTELLING_TEMPLATE_TIPOS`.
3. `template-labels.ts`: etiqueta visible.
4. `TemplatePreviewModal.tsx`: `TEMPLATE_TIPOS_ORDENADOS` + set de gating por evento.
5. `StepDesign.tsx`: records `TEMPLATE_TIPO_LABEL/COLORS/BORDER` + default por colección.
6. `WizardLivePreview.tsx`: `DESIGN_TEMPLATE_TIPOS`.
7. `preview-plantilla/page.tsx`: mapa de `_COMPONENTS`.
8. Páginas reales (`/invite`, `/i`, `/preview`): rama por familia + `node scripts/generar-plantillas-dinamicas.js`.
9. `template-preview-samples.ts` si la familia necesita muestra propia.
10. `npx tsc --noEmit` limpio + `grep -rn XXX` en los diez puntos.

### 2.5 Verificación por familia

- `tsc` limpio, `eslint` sin errores nuevos.
- `/preview-plantilla?evento=…&tipo=XXX&color=…` renderiza; por DOM se comprueba: paleta (hex de `getComputedStyle` contra el handoff), fuentes cargadas, las 9/7 secciones presentes, `data-*` de animación armados, post-evento.
- Auditoría §3.6: ningún par de variantes con el mismo acento **salvo** Papel Prensado (monocromo a propósito; anotado).
- Captura de pantalla cuando el navegador esté disponible; si no, se deja marcado "pendiente de ojos humanos" en la tabla.

---

## 3. Orden de trabajo (y por qué)

Primero lo que hace que **las cuatro colecciones existan y se puedan elegir**, después llenar cada una. Si la sesión se corta a mitad, el producto queda consistente en cualquier punto:

| Fase | Qué | Resultado si se corta acá |
|---|---|---|
| 0 | Rama, plan, assets (baraja + PNG de Icon a WebP), fuentes | Nada visible cambia; el repo tiene los assets. |
| 1 | Infra de 4 colecciones (tipo, selector, i18n, gating, labels) sin familias nuevas | El wizard muestra 4 botones; Paper e Iconic vacíos pero funcionales. |
| 2 | **Prensa** completa (base + 5 variantes + wiring + verificación) | Paper tiene 1 familia y prueba el mecanismo Papel Prensado. |
| 3 | **Jardín de papel** completa | Icon tiene 1 familia y prueba el mecanismo Capas. |
| 4 | Noche, Lumbre, Trazo, Herbario (derivan del registro de Prensa) | Papel Prensado completo (5). |
| 5 | Sobre & Sello, Acuarela & Corona, Manuscrita, Tinta & Vinilo, Membrete | Paper completo (10). |
| 6 | Cielo, Cuento, Ciudad, Trazo de papel (derivan de Jardín) | Capas de papel completo (5). |
| 7 | Las 14 de Tipográfica Editorial, de a una, boda primero | Icon completo (19). |
| 8 | `/modelos` (invitaciones demo `modelo-*`), showcase de la landing, docs, auditoría final | Listo para mergear a `main`. |

Cada familia es **un commit** ("feat(paper): Prensa, 5 variantes") que incluye la actualización de la tabla de la sección 6. Nunca se commitea una familia a medias sin marcarla como tal en la tabla.

---

## 4. Riesgos conocidos

- **Tamaño.** 145 archivos de 1.400–2.200 líneas. La sesión va a cortarse varias veces; por eso el orden de arriba y la tabla de abajo. Retomar = leer la sección 6, abrir el mockup de la familia marcada "en curso" y seguir.
- **Fidelidad vs. componentes compartidos.** El mockup maqueta a mano el countdown, el RSVP y el álbum "sólo para mostrar el diseño"; en el port van los componentes `v2/` con el theming de la familia. Donde el diseño del mockup no se pueda lograr con el componente compartido, se documenta acá antes de re-maquetar.
- **Pesos y egreso (Railway cobra cada byte que baja un invitado).** Regla para las 29 familias:
  - Ninguna pieza en PNG. WebP con transparencia, ancho máximo 800 px (480 px los íconos de línea, 720 px los fondos de portada), calidad 76. Hecho: los 34 MB de PNG de Icon quedaron en 2,5 MB; una familia de Capas de papel carga ~530 KB de piezas, Trazo de papel ~190 KB por las que usa.
  - Presupuesto por familia: **≤ 500 KB de piezas por invitación abierta**. Se mide antes de marcar la familia como verificada.
  - Todo `<img>` de pieza que no esté en la portada va con `loading="lazy"` y `decoding="async"`; las máscaras CSS (`iconos-linea`, `manuscrita`) ya son livianas por naturaleza (tinta plana).
  - Las fuentes de Google van por `next/font/google` con `preload: false` y sólo los pesos que el handoff pide; nunca el archivo completo de la familia.
  - Los mockups (`.dc.html`, PNG fuente) viven en `mockup/` y no se sirven: `public/` sólo tiene lo optimizado.
- **Nombres.** `EDITORIAL` y `TRAZO` chocaban: resueltos en 2.2. `cdp` repetido en Cielo y Ciudad: Ciudad usa `ciu`.
- **`isStorytellingTemplate` para Icon.** Es la decisión que más toca código existente; se hace en la fase 1 y se verifica que el flujo Storytelling actual no cambie (tsc + recorrer el wizard con Guest Pass VIP).

---

## 5. Cómo retomar después de un corte

1. `git checkout nuevas-colecciones && git log --oneline -5` — el último commit dice la última familia cerrada.
2. Sección 6: la fila marcada **EN CURSO** dice qué archivo se estaba escribiendo y hasta qué sección del mockup se llegó.
3. `git status` — si hay un archivo sin commitear bajo `src/components/templates/`, revisarlo: puede haber quedado a medio escribir.
4. `npx tsc --noEmit` antes de seguir.

---

## 6. Estado por familia

Estados: `—` sin empezar · `EN CURSO (detalle)` · `base` (archivo base escrito, tsc ok) · `variantes` (5 generadas) · `wiring` (los 10 puntos) · `verificada` (DOM + capturas) · `✔` commiteada.

### Fase 0 — Infra

| Ítem | Estado |
|---|---|
| Rama `nuevas-colecciones` desde `main` `8e0b13c` | ✔ |
| Este plan | ✔ |
| Copiar `baraja/` (5 webp más nuevas) | ✔ `7c619d4` |
| Icon `img/` + `img/trazo/` + `assets/rw-*` → WebP en `public/templates/<familia>/` | ✔ `scripts/importar-piezas-icon.js`, 2,5 MB |
| Verificar que ninguna fuente nueva falle en `next/font/google` (nombres exactos) | se hace familia por familia al portar |

### Fase 1 — Cuatro colecciones

| Ítem | Estado |
|---|---|
| `Coleccion` + `PAPER/ICONIC_TEMPLATE_TIPOS` + `coleccionDeFamilia()` + `subcoleccionDeFamilia()` en wizard-steps-config | ✔ |
| `isStorytellingTemplate` = STORYTELLING ∪ ICON | ✔ |
| StepDesign: 4 botones + `familiaPorDefecto()` por colección | ✔ |
| TemplatePreviewModal: filtro por `coleccionDeFamilia` + subtítulo de sub-colección | ✔ |
| i18n es/en/pt: `coleccionPaper`, `coleccionIconic`, `verModelosPaper`, `verModelosIconic`, `subcoleccion.*` (AR no hace falta: no hay voseo en esos textos) | ✔ |
| tsc limpio, eslint sin errores nuevos | ✔ |
| Recorrer el wizard con Guest Pass VIP y Elegant en el navegador (nada cambió) | pendiente de navegador |

### Paper · Papel Prensado

| Familia | Código | Estado |
|---|---|---|
| Prensa | PRENSA | `verificada` — base `PrensaTemplate.tsx` (hoja, relieve con luz que gira, entrada de sección, splash quieto, pastilla que se repliega, CONFIRMADO hueco), 4 variantes por `scripts/gen-papel-prensado-variants.js`, los 10 puntos de wiring, tsc y eslint limpios. Verificada en el navegador (DOM): íconos ≤ 49 px, cuenta propia en Cormorant 46 px, cero íconos de lucide visibles, logo del pie en negro. **Correcciones del 2026-09-15** (ver §7). |
| Noche | NOCHE | `verificada` — derivada de Prensa con `scripts/derivar-noche.js`: relieve HUECO (la letra prensada hacia adentro, luz al 14 %), líneas claras (`LN`), grano 0.42, monograma en óvalo en vez del ícono y nombres en Final Parade. 5 negros (Carbón, Tinta, Vino, Bosque, Bronce). Verificada en DOM: papel #141414, tinta #F6EBE4, filetes rgba(246,235,228,.34), nombres en Final Parade 62 px, cero íconos de lucide. |
| Lumbre | LUMBRE | `verificada` — derivada de Prensa con `scripts/derivar-lumbre.js`: portada A SANGRE (la foto del anfitrión a pantalla completa con velo de legibilidad .15→.78 y los nombres en Final Parade blancos encima) en las tres portadas (splash, columna de escritorio y portada del celular), papel topo más cálido. 5 papeles (Topo, Tostado, Arcilla, Ceniza, Sombra). Verificada en DOM: 2 portadas a sangre, 3 velos, nombres 66 px blancos, papel #E9DFD3. |
| Herbario | HERBARIO | `verificada` — derivada de Prensa con `scripts/derivar-herbario.js`: botánica como `<img>` duotonizada por filtro CSS (4 WebP para las 5 variantes, no 20), cuenta regresiva con los días en grande y horas/minutos/segundos al costado, y tres hojas que caen sobre el CONFIRMADO (sólo cuando el RSVP confirma, vía `:has([role=status][aria-live=polite])`). 5 filtros (Salvia, Eucalipto, Oliva, Ceniza, Tinta). Verificada en DOM: 9 piezas botánicas con el duotono salvia, countdown partido, 3 hojas montadas. |
| Trazo | TRAZO | `verificada` — derivada de Prensa con `scripts/derivar-trazo.js`: garabatos, destellos y corazones como máscaras pintadas con la tinta (se salen por el borde de la hoja a propósito) y marco circular alrededor de la cifra. Acá la variante cambia la TINTA, no el papel (Grafito, Tinta, Terracota, Verde, Ciruela). Verificada en DOM: 9 dibujos, tinta #3C3A35, papel #F6F1E9. |

### Paper · Papelería Viva

| Familia | Código | Estado |
|---|---|---|
| Sobre & Sello | SOBRESELLO | `verificada` — base de Papelería Viva, derivada de Prensa con `scripts/derivar-sobre-sello.js`: comparte la ARQUITECTURA (Flat, las mismas 9 secciones, los componentes compartidos, el splash, la pastilla) y no comparte NADA del vestuario. Dos acentos (lacre + dorado) en vez de monocroma, doodles pintados como `<img>` en 10 slots, tarjetas con filete fino y esquina doblada en vez de hojas troqueladas, portada-SOBRE (forro a rayas, doble filete, ramos, lacre) y cuenta regresiva con los días en un anillo que gira una vuelta por minuto. Pinyon Script como firma. 5 variantes que cambian papel Y acentos (Bordó, Verde bosque, Azul tinta, Terracota, Oliva). Verificada en DOM: 2 sobres, doodles cargando (0 rotas), Cormorant 44 px + Pinyon en el &, 4 cabeceras con filete y punto, cero lucide. |
| Acuarela & Corona | ACUARELACORONA | — |
| Manuscrita | MANUSCRITA | — |
| Tinta & Vinilo | TINTAVINILO | — |
| Membrete | MEMBRETE | — |

### Icon · Capas de papel

| Familia | Código | Estado |
|---|---|---|
| Jardín de papel | JARDINDEPAPEL | `verificada` — base `JardinDePapelTemplate.tsx` (2.150 líneas): escenas del mockup byte por byte en `escenas/JdpEscenas.ts`, motor propio (reveals, frase palabra por palabra, paneles pineados, parallax con mouse/giroscopio, ventana de la foto, riel), portada con las 7 capas que entran y se levantan al abrir, cuenta regresiva propia, check-in con sello y pétalos, álbum de polaroids, canciones, trivia y ticket con QR. 4 variantes por `scripts/gen-capas-de-papel-variants.js` (Noche estrellada, Bosque, Rosa empolvado, Viñedo; el tono claro/oscuro sale solo de la paleta). Los 10 puntos de wiring, `PlantillaDinamica` (374), tsc y eslint limpios. Verificada en el navegador (DOM): 8 secciones, 21 SVG de escena, 4 filtros de papel, las piezas WebP, Cormorant + DM Sans, cuenta viva. |
| Cielo de papel | CIELODEPAPEL | `verificada` — derivada de Jardín con `scripts/derivar-cielo.js`: el mismo motor (reveals, paneles pineados, parallax, ventana, riel, portada en capas) con Playfair Display + Jost, sus propias escenas (`CdpEscenas.ts`: la quinceañera de papel, la luna, el salón) y cinco paletas de cielo (Cielo rosado, Noche azul, Lila, Dorado, Menta). Es de quince: entra en `soloQuince`, y Jardín pasó a `soloCasamiento` (su dibujo es una pareja). Su mockup no trae panel de ceremonia, así que las escenas de los paneles van por NOMBRE y no por posición -- si el anfitrión activa la ceremonia, ese panel va sin decoración en vez de robarle el dibujo al de al lado. Verificada en DOM: paleta #F7E9EC/#D9738F, 8 secciones, 21 SVG de escena, piezas del quince, Playfair + Jost, 10 capas de portada. |
| Cuento de papel | CUENTODEPAPEL | `verificada` — derivada con `scripts/derivar-capas.js` (ficha en `scripts/familias/capas/cuento.json`): quince de cuento de hadas, con el castillo en la portada y la quinceañera de espaldas mirándolo. Playfair Display + Jost, 5 paletas (Cuento de hadas, Bosque encantado, Rosa de cuento, Medianoche, Oro viejo). Sin panel de ceremonia, como Cielo. Verificada en DOM: paleta #F4EFFA/#9B6BD6, castillo y xv-espalda montadas, 8 escenas, 10 capas de portada. |
| Ciudad de papel | CIUDADDEPAPEL | `verificada` — derivada con `scripts/derivar-capas.js` (ficha en `capas/ciudad.json`): casamiento urbano, los cerros son edificios y la pareja mira la ciudad desde una azotea. Playfair Display + **Work Sans**, 5 paletas (Azotea, Neón nocturno, Concreto, Puerto, Terracota urbana). Trae los cuatro paneles. Verificada en DOM: paleta #EFE9E1/#C2564B, Work Sans en el cuerpo, pieza pareja-ciudad montada. |
| Trazo de papel | TRAZODEPAPEL | `verificada` — derivada con `scripts/derivar-capas.js` (ficha en `capas/trazo-de-papel.json`): el casamiento dibujado a mano, con trazos de pincel sueltos (la pareja abrazada, el ramo, las copas, el auto con latas) y lettering escrito a mano. Caveat Brush + Karla, 5 paletas (Oliva, Tinta china, Terracota, Azul tinta, Borgoña). Es la única de la sub-colección SIN foto principal: su mockup no trae esa sección, y el extractor ahora tolera secciones ausentes en vez de fallar. Verificada en DOM: 14 piezas dibujadas cargando (0 rotas), Caveat Brush en los títulos, Karla en el cuerpo. |

### Icon · Tipográfica Editorial

| Familia | Código | Estado |
|---|---|---|
| Editorial Blanc & Noir | EDITORIALBLANCNOIR | — |
| Couture | COUTURE | — |
| Cartelera | CARTELERA | — |
| Bauhaus | BAUHAUS | — |
| Retrowave | RETROWAVE | — |
| Postal | POSTAL | — |
| Noir | NOIR | — |
| Observatorio | OBSERVATORIO | — |
| Pop | POP | — |
| Shōjo | SHOJO | — |
| Reino | REINO | — |
| Tropical | TROPICAL | — |
| Y2K | Y2K | — |
| Arcade | ARCADE | — |

### Fase 8 — Cierre

| Ítem | Estado |
|---|---|
| Invitaciones demo `modelo-*` para /modelos (una por familia) | — |
| TemplateShowcase de la landing incluye Paper e Iconic | — |
| Auditoría final: acentos duplicados, exports, `generar-plantillas-dinamicas`, tsc, eslint | — |
| GUIA_TECNICA_PLANTILLAS §1/§2.5 actualizadas con las 4 colecciones | — |
| Mockups: `mockup/Paper` y `mockup/Icon` quedan como referencia (sin `uploads/` ni `screenshots/`, que no son del repo) | — |

## 7. Correcciones del 2026-09-15 (aplican a toda familia nueva)

Salieron de la primera revisión de Prensa en pantalla. No son detalles de esa
familia: son reglas de las dos colecciones nuevas.

1. **Cada colección trae su propia cuenta regresiva.** El `<Countdown>`
   compartido tiene cuatro estilos (cápsulas, flip, cajas redondeadas) que son
   de la Colección Flat; ninguno pega con el papel. Papel Prensado tiene
   `CuentaPrensa` (cifras en relieve separadas por filetes) y Capas de papel
   `CuentaJardin` (cuatro tarjetitas inclinadas con la esquina doblada). La
   lógica del tiempo sí se comparte (`useCountdown`).
2. **El paso "Countdown" del wizard queda sólo para Flat**, igual que
   "Tipografía": Paper e Iconic fijan las dos cosas en el archivo.
3. **Una sola iconografía por sección.** Los componentes compartidos traen sus
   propios íconos de lucide (una nota musical en Canciones, un tilde en el
   RSVP, una cama en Info Adicional) y al lado del ícono de la familia quedaban
   dos dibujos distintos diciendo lo mismo. En Paper e Iconic se ocultan por
   CSS (`svg.lucide`, `.ia-icon-box`) y manda el juego de la colección.
4. **Los íconos se miden en píxeles, no en % del ancho.** El mismo 19 % que en
   un teléfono da un sello de 70 px, en la columna de escritorio daba uno de
   120 px. Van con tope: `width: min(19%, 58px)`.
5. **El logo del pie necesita `textColor` oscuro en las familias de papel.**
   `LogoFooterCredit` elige el isologotipo blanco o negro según ese color, y
   el default está pensado para fondos oscuros: sobre papel, invisible.
6. **La portada de bienvenida muestra UN nombre.** El kicker que escribe el
   anfitrión ("Con mucho cariño para…") es un saludo y sólo va arriba del
   nombre del invitado; arriba de los novios va la frase del evento ("Nos
   casamos"). Y los nombres de los homenajeados no se repiten abajo cuando ya
   son el nombre grande.
7. **El reveal no puede pisar la inclinación del papel.** En Capas de papel el
   movimiento de entrada va en `--jdp-y` y el giro en `--jdp-giro`, y el
   `transform` los compone: si el reveal escribe `transform: none`, las
   tarjetas terminan perfectamente derechas, que es justo lo que esta
   colección no es.
8. **La colección Icon se llama Iconic** (decisión del 2026-09-15). El código
   del tipo es `ICONIC_TEMPLATE_TIPOS` y `Coleccion = "ICONIC"`.

## 8. Cómo se instala una familia

Las cinco familias de Papel Prensado comparten el 92 % del archivo: en el
mockup, Lumbre y Prensa se diferencian en 87 líneas de 1.037. Copiar y pegar
1.250 líneas por familia habría dejado cinco copias que se desincronizan sin
que nadie se entere. En vez de eso:

1. **Una familia base escrita a mano** (Prensa), que es el registro de la
   sub-colección.
2. **Un script de derivación por familia** (`scripts/derivar-<familia>.js`)
   que parte de la base y aplica SÓLO lo que esa familia tiene de propio, con
   un comentario explicando por qué. Si un anclaje no aparece (porque la base
   cambió), el script falla y lo dice: no genera un archivo a medias.
3. **El generador de variantes** (`scripts/gen-papel-prensado-variants.js`),
   que ahora entiende tres formas de variar: por papel (Prensa, Noche,
   Lumbre), por tinta (Trazo) y por filtro botánico (Herbario).
4. **El cableador** (`scripts/cablear-familia.js` + un JSON por familia en
   `scripts/familias/`), que enchufa la familia en los diez puntos del wizard
   y las rutas. Es idempotente y avisa qué hizo y qué ya estaba.

Un arreglo en el registro se hace una vez en la base y llega a las cinco
volviendo a correr las derivaciones:

    node scripts/derivar-noche.js && node scripts/derivar-lumbre.js       && node scripts/derivar-herbario.js && node scripts/derivar-trazo.js       && node scripts/gen-papel-prensado-variants.js       && node scripts/generar-plantillas-dinamicas.js

### Capas de papel: una ficha por familia

Lo mismo que en Papel Prensado, pero un paso más allá: en vez de un script de
derivación por familia hay **uno solo** (`scripts/derivar-capas.js`) y una
ficha JSON por familia en `scripts/familias/capas/`, con lo único que las
distingue -- tipografías, paleta base, paletas de las variantes, y qué paneles
dibuja su mockup. Las escenas salen del mockup con
`scripts/extraer-escenas-capas.js`.

Instalar una familia nueva de Capas de papel es:

    node scripts/extraer-escenas-capas.js "mockup/Icon/<Familia>.dc.html" <pre> capas-de-papel
    # escribir scripts/familias/capas/<familia>.json y scripts/familias/<familia>.json
    node scripts/derivar-capas.js && node scripts/gen-capas-de-papel-variants.js
    node scripts/cablear-familia.js scripts/familias/<familia>.json
    node scripts/generar-plantillas-dinamicas.js

Jardín lleva ficha igual (`capas/jardin.json`, con `esBase: true`): no se
deriva -- está escrita a mano -- pero sus variantes de color se generan con el
mismo script que las demás, así no hay dos lugares donde mirar qué es una
familia.
