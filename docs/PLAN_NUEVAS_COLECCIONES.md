# Plan de instalación — Colecciones Paper e Icon

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
export type Coleccion = "FLAT" | "STORYTELLING" | "PAPER" | "ICON";
export const COLECCION_DE_FAMILIA: Record<string, Coleccion> = { … };
export function coleccionDeFamilia(tipo): Coleccion  // default FLAT
```

`isStorytellingTemplate()` **se conserva** pero pasa a significar *"arquitectura storytelling"* (scroller propio, paneles, paso Recorrido, sin paso de tipografía): devuelve `true` para STORYTELLING **e ICON**. Paper es arquitectura Flat en todo (tipografía elegible, portada, álbum). Así los ~15 usos actuales de `isStorytellingTemplate` (flujo del wizard, scroll del preview, showcase de la landing) siguen correctos sin tocarlos; sólo el selector y el filtro de tabs pasan a usar `coleccionDeFamilia`.

Etiquetas visibles (es/en/pt + variante AR): **Colección Paper** y **Colección Icon**, como las nombró el pedido. Dentro del modal de familias, cada tab lleva su sub-colección como subtítulo chico (Papelería Viva / Papel Prensado / Capas de papel / Tipográfica Editorial) para que las 19 de Icon no sean una fila plana de 19 nombres.

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
6. Final Parade Script como `var(--font-final-parade)` (ya registrada). El resto por `next/font/google`.
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
| 1 | Infra de 4 colecciones (tipo, selector, i18n, gating, labels) sin familias nuevas | El wizard muestra 4 botones; Paper e Icon vacíos pero funcionales. |
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
| `Coleccion` + `PAPER/ICON_TEMPLATE_TIPOS` + `coleccionDeFamilia()` + `subcoleccionDeFamilia()` en wizard-steps-config | ✔ |
| `isStorytellingTemplate` = STORYTELLING ∪ ICON | ✔ |
| StepDesign: 4 botones + `familiaPorDefecto()` por colección | ✔ |
| TemplatePreviewModal: filtro por `coleccionDeFamilia` + subtítulo de sub-colección | ✔ |
| i18n es/en/pt: `coleccionPaper`, `coleccionIcon`, `verModelosPaper`, `verModelosIcon`, `subcoleccion.*` (AR no hace falta: no hay voseo en esos textos) | ✔ |
| tsc limpio, eslint sin errores nuevos | ✔ |
| Recorrer el wizard con Guest Pass VIP y Elegant en el navegador (nada cambió) | pendiente de navegador |

### Paper · Papel Prensado

| Familia | Código | Estado |
|---|---|---|
| Prensa | PRENSA | — |
| Noche | NOCHE | — |
| Lumbre | LUMBRE | — |
| Herbario | HERBARIO | — |
| Trazo | TRAZO | — |

### Paper · Papelería Viva

| Familia | Código | Estado |
|---|---|---|
| Sobre & Sello | SOBRESELLO | — |
| Acuarela & Corona | ACUARELACORONA | — |
| Manuscrita | MANUSCRITA | — |
| Tinta & Vinilo | TINTAVINILO | — |
| Membrete | MEMBRETE | — |

### Icon · Capas de papel

| Familia | Código | Estado |
|---|---|---|
| Jardín de papel | JARDINDEPAPEL | — |
| Cielo de papel | CIELODEPAPEL | — |
| Cuento de papel | CUENTODEPAPEL | — |
| Ciudad de papel | CIUDADDEPAPEL | — |
| Trazo de papel | TRAZODEPAPEL | — |

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
| TemplateShowcase de la landing incluye Paper e Icon | — |
| Auditoría final: acentos duplicados, exports, `generar-plantillas-dinamicas`, tsc, eslint | — |
| GUIA_TECNICA_PLANTILLAS §1/§2.5 actualizadas con las 4 colecciones | — |
| Mockups: `mockup/Paper` y `mockup/Icon` quedan como referencia (sin `uploads/` ni `screenshots/`, que no son del repo) | — |
