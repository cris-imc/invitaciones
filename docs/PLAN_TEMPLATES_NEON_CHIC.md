# Plan de implementación — Plantillas "Neon" y "Chic"

> Rama de trabajo: `nuevo-template`. **No pushear a `main`** (pedido explícito del usuario). Este documento es el checkpoint de progreso: antes de seguir trabajando, leer la sección "Estado actual" y verificar lo que dice "Hecho" contra el código real (no confiar ciegamente si pasó mucho tiempo).
>
> ⚠️ **Regla importante**: las 5 variantes de color (`NeonTemplateVioleta.tsx`, etc.) son generadas por script a partir de `NeonTemplate.tsx` (default). **Cada vez que se edite `NeonTemplate.tsx` (JSX, doodles, animaciones, estructura -- no solo color), hay que volver a correr el script generador y regenerar las 5 variantes**, si no quedan desincronizadas (como pasó una vez en esta misma sesión: se generaron las variantes, después se agregaron doodles al cuerpo de `NeonTemplate.tsx`, y las variantes se quedaron sin esos doodles hasta que se regeneraron de nuevo). El script está en el historial de comandos de esta rama -- buscar "regenerated NeonTemplate" en las Fases 4 para copiarlo tal cual en vez de reescribirlo. Cuando exista Chic con sus variantes, aplica la misma regla.

## Objetivo

Instalar dos plantillas nuevas de invitación:

- **Neon** (mockup `mockup/nuevo/neon.html`, concepto interno "Doodle Disco 15") — disponible solo para eventos tipo **QUINCE_ANOS** ("15 años") y **CUMPLEANOS** ("Evento").
- **Chic** (mockup `mockup/nuevo/chic.html`, concepto interno "Doodle Wedding") — disponible solo para eventos tipo **CASAMIENTO**.

Ambas con:
- Iconografía de mayor calidad que los SVG inline actuales (ver sección Iconografía).
- Animaciones con **anime.js** (a instalar, no está en el proyecto todavía) con efectos "PRO".
- **Sub-variantes de color**, igual que ya existen para Moderno (7: default/Azul/Bordo/Gris/Negro/Purpura/Rojo/Verde) y Elegant (9: default/Green/Red/Blue/Orange/Violet/Gray/DarkYellow/Pink).

---

## Estado actual (actualizar esto en cada sesión)

**Fase 0 — Investigación de arquitectura: COMPLETA.**
**Fase 1 — Lectura/interpretación de mockups: COMPLETA** (ver resumen abajo; no hace falta repetirla).
**Fase 2 en adelante: NO INICIADA.**

Progreso por fase (marcar `[x]` a medida que se completa; si se corta la sesión a mitad de una fase, dejar una nota debajo del checkbox con el archivo exacto y la línea donde se quedó):

- [x] Fase 2 — Instalar `animejs` (v4.5.0, instalado en `package.json`. Es ESM-only, tipos propios incluidos, API modular: `import { animate, stagger, createTimeline, svg } from 'animejs'`, NO el `import anime from 'animejs'` de v3 — usar esta API en todo el código nuevo)
- [x] Fase 3 — Crear `NeonTemplate.tsx` (variante `default`) — **HECHO Y VERIFICADO EN NAVEGADOR**, con hallazgos importantes, ver "Hallazgos de la verificación visual" más abajo antes de tocar Chic o las variantes. **Doodles + anime.js: HECHO** — `IconDiscoBall`/`IconSpark` ahora se usan en el JSX de la portada (5 doodles scattered: 3 discoball + 2 spark), con un `useEffect` (`coverRootRef`) que anima su entrada con `animate()`/`stagger()` de anime.js real (scale+rotate+opacity, delay escalonado) más un pulso de escala en el sello (`.neon-seal`). Verificado en `/i/mis-15-anos-1786510799040` (invitación real ya existente con `templateTipo: NEON`, creada probablemente por el usuario probando el wizard): los doodles arrancan en `opacity:0/scale:0` (vía clase `opacity-0` + el `from` de animejs) y asientan en `opacity:1` con su posición/rotación final — confirmado inspeccionando `style.opacity` por JS, no solo por screenshot. Nota: en dev mode (sin build) la animación puede tardar varios segundos en "verse" en la primera carga de la ruta porque Next.js compila la página on-demand la primera vez -- no es un problema del código, es normal de `next dev`.

**Doodles en el cuerpo de la invitación (no solo portada): HECHO.** El usuario notó correctamente que los doodles solo estaban en la pantalla de bienvenida y que el mockup también los tiene en la invitación propiamente dicha. Se agregaron 3 puntos más: (1) 2 doodles chicos scattered en el contenedor de texto del hero mobile/aside (`IconDiscoBall` + `IconSpark`, semi-transparentes); (2) un divisor decorativo entre el hero y la cuenta regresiva (2 `IconDiscoBall` cian flanqueando una línea con gradiente magenta y un `IconSpark` al centro, calcado del mockup); (3) un separador de líneas diagonales cian (SVG inline, no depende de las clases de texto `///////` del mockup que eran solo texto) antes del footer/crédito. Verificado visualmente en `/i/mis-15-anos-1786510799040`: los 3 se ven correctamente. **Importante**: como estos cambios tocaron `NeonTemplate.tsx` DESPUÉS de haber generado las 5 variantes de color (Fase 4), hubo que volver a correr el script generador para las 5 -- ya está hecho y `tsc` quedó limpio, pero es el ejemplo real de por qué existe la regla de arriba.

**Doodles por sección + animación al scrollear: HECHO** (el usuario pidió esto en dos rondas: primero "faltan más doodles dentro de la invitación", después "y no están animados"). Se agregó:
- Un `useEffect` nuevo con `IntersectionObserver` (además del de la portada) que anima con `animate()` cualquier elemento con la clase `.neon-scroll-doodle` la primera vez que entra en viewport (scale+rotate+opacity, `ease: "outBack"`, dispara una sola vez y desobserva). Los doodles del cuerpo arrancan en `opacity-0` en el JSX.
- Se re-etiquetaron con `.neon-scroll-doodle` los doodles que ya existían (scatter del hero, divisor hero→countdown, separador de footer), que antes eran estáticos.
- Se agregó un ícono doodle chico (`IconSpark` o `IconDiscoBall`, alternando cian/magenta) junto al kicker de cada sección: "CUÁNDO Y DÓNDE", "CRONOGRAMA", "ÁLBUM", "DATOS BANCARIOS DEL EVENTO", el quiz (`"¿CUÁNTO SABÉS?"` o el título custom), y un ícono de vinilo (`IconMusic`, ya existente, se le agregaron props `className`/`style` que no tenía) centrado arriba de "Sugerí una canción".
- Verificado en `/i/mis-15-anos-1786510799040` con `document.getElementById(id).scrollIntoView(...)` + zoom por sección: el ícono aparece correcto y con su color en Detalles, Álbum y Canciones (Banco/Quiz no se pudieron ver en esta invitación puntual porque esos datos están deshabilitados ahí — no hay nada malo, simplemente no había contenido que renderizar; el código es el mismo patrón en los 5 casos).
- **Regla del recuadro de arriba aplicada de nuevo**: como estos cambios tocaron `NeonTemplate.tsx`, se volvieron a regenerar las 5 variantes de color después. `tsc` limpio.

**Pendiente de pulido, no bloqueante**: no se agregaron doodles adicionales *dentro* del contenido de cada sección (ej. entre cada fila del cronograma, o como marca de agua de fondo repetida) — solo uno por encabezado de sección, que ya cubre razonablemente el pedido. Si se quiere más densidad, mismo patrón (SVG + `.neon-scroll-doodle`).

**Marco en la foto de portada + brillo ligado al scroll: HECHO.** El usuario pidió esto tras ver el mockup (que tiene un marco en la foto de arriba) y preguntar si anime.js podía hacer algo tipo "reflejo al scrollear".
- `PhotoCornerFrame` (nuevo componente, junto a los demás Icon* cerca del inicio del archivo): al principio se hizo como 4 marcas de esquina tipo visor de cámara (calcado literal del mockup), pero el usuario pidió específicamente un **marco completo alrededor** de la foto, no solo esquinas -- quedó como un borde fino cian (`border: 1px solid rgba(57,255,208,0.55)`) en todo el perímetro (`inset-3`), con un detalle `IconSpark` magenta en la esquina inferior derecha.
- Brillo: un div `heroShineRef` con `linear-gradient(115deg, transparent, rgba casi blanca, transparent)` sobre la foto, cuyo `opacity`/`translateX` se actualizan en un `useEffect` con `onScroll()` de anime.js (import agregado: `animate, stagger, onScroll` desde `"animejs"`) apuntando a `heroPhotoRef` (el contenedor de la foto). `onUpdate: (self) => { const p = self.progress; ... }` -- `progress` va de 0 a 1 mientras la foto atraviesa el viewport.
- **Iteraciones de diseño pedidas por el usuario** (aplicadas en orden): (1) que el marco fuera completo, no solo esquinas: hecho. (2) que el brillo recorra "de punta a punta" en vez de aparecer centrado como una mancha: se angostó la banda brillante del gradiente (era 40%-50%-60%, quedó 46%-50%-54%, banda más angosta = look de "haz" en vez de "mancha") y se amplió el rango de `translateX` (era `p*160-40`, quedó `p*240-70`) para que el barrido cruce bien de un extremo al otro. (3) que fuera más tenue pero se note: opacidad pico bajada de `×0.9` a `×0.35`, y el color de la banda pasó de cian puro a un blanco-cian tenue (`rgba(200,255,245,0.5)`). (4) que arranque desde el vértice superior izquierdo: pendiente de ajuste fino (ver nota de debugging abajo). (5) el usuario después vio el resultado en vivo (dev server con Fast Refresh) y pidió **dejarlo como quedó, sin extenderlo más** ("no lo lleves al otro vértice... con esa intensidad queda sutil") -- **no tocar más los valores de opacidad/rango de `translateX` a menos que el usuario lo pida explícitamente de nuevo**, ya está en el punto que el usuario aprobó viéndolo en vivo.
- **Nota de debugging honesta**: intenté verificar el efecto de forma aislada inyectando JS por consola (`window.scrollTo` + leer `style.opacity`/`style.transform` del elemento) y varias veces lo encontré "congelado" en un valor fijo sin reaccionar al scroll. Investigué el source real de `ScrollObserver` (`node_modules/animejs/dist/modules/events/scroll.js`) y until confirmé que el container por defecto (sin especificar) ya cae en `document.body` con modo `useWin` (escucha `window`, no `body.scrollTop`) -- o sea que pasar `container: document.body` explícito es un no-op, no fue eso lo que arregló nada. Antes de terminar de aislar la causa real (sospecha: timing de Fast Refresh en dev mode, viendo los logs de `[Fast Refresh] rebuilding` aparecer DESPUÉS de mis intentos de prueba, lo que invalidaba varias de mis mediciones), el usuario probó en su propio navegador y confirmó que SÍ se ve andando ("queda sutil" implica que lo vio moverse, no que esté roto). **Si en el futuro parece congelado de nuevo**, sospechar primero de timing de Fast Refresh (recargar la página entera, no confiar en HMR) antes de asumir que el código está mal.
- **Regenerar variantes**: hecho una vez más después de estos cambios (regla del recuadro de arriba). `tsc` limpio.
- [x] Fase 4 — Crear variantes de color de Neon (5: Violeta/Dorado/Verde/Azul/Rojo) — **HECHO**. Generadas con script node desde `NeonTemplate.tsx` (mismo método que Fase 3), sustituyendo `#39FFD0`→primario y `#FF2E9B`→secundario (y sus `rgba()` derivados en las mismas opacidades) por par: Violeta=`#B24BFF`+cian, Dorado=`#FFC94B`+magenta, Verde=`#B6FF3C`+magenta, Azul=`#3C8CFF`+magenta, Rojo=`#FF3C5C`+cian. Fondo/superficie/texto quedan iguales en las 6 (negro fijo). Registradas en `NEON_COLORS`/`NEON_COMPONENTS` (registry) y en el `switch(color)` de las 3 páginas de render real + `template-preview-samples.ts` (`NEON_COLOR_TO_VESTIDO`). `tsc` limpio. **Verificado en navegador** (Violeta, comparado contra Moderno Rojo en la misma vista desktop-aside): el color primario se ve correctamente aplicado en portada/hero/countdown/nav pill; los números de cuenta regresiva y la lista numerada "01/02/03" del aside salen en un naranja que NO es ninguno de los 2 colores de la variante — pero se confirmó que Moderno tiene EXACTAMENTE el mismo naranja ahí (mismo `--t-acc` del sistema de theming viejo por `data-theme`, ver "Hallazgos" arriba) — no es un bug de las variantes, es la misma limitación preexistente ya documentada. Las otras 4 variantes (Dorado/Verde/Azul/Rojo) no se revisaron una por una visualmente (se confía en que el script determinístico se aplicó igual a las 5, confirmado por conteo de ocurrencias idéntico en las 5 antes del build).
- [x] Fase 5 — Crear `ChicTemplate.tsx` (variante `default`) — **HECHO Y VERIFICADO EN NAVEGADOR**. Copiado desde `ModernoTemplate.tsx` (no Neon), paleta "Doodle Wedding" (crema `#FBF3EA` + tinta `#241E12` + dorado fijo `#C9A876` + oliva `#6B7A4F`), tipografía Playfair Display itálica + Jost. Doodles propios: `IconRings`, `IconHeartDoodle`, `IconRibbon`, `IconChurch` (con cruz chica a pedido del usuario -- "sino parece un cementerio"), con más detalle de trazo a pedido del usuario (doble aro, brillos, volutas). Doodles + anime.js (mismo patrón que Neon: `coverRootRef` al montar, `.chic-scroll-doodle` + IntersectionObserver en el cuerpo) en portada, hero, divisor guirnalda antes del countdown, kicker de cada sección, separador de footer. Ver "Hallazgos de Chic" abajo para los bugs reales encontrados y corregidos (son distintos a los de Neon, no repetir el checklist de Neon a ciegas).
- [x] Fase 6 — Crear variantes de color de Chic (6: Rosa/Azul/Terracota/Violeta/VerdeBotella/Gris) — **HECHO**, pero con un cambio de enfoque importante respecto al plan original -- ver "Hallazgos de Chic".
- [x] Fase 7 — Registrar en `template-preview-registry.tsx` — **HECHO** (`TemplateTipo` extendido a `"ELEGANT" | "MODERNO" | "NEON"`, `NEON_COLORS`, `NEON_COMPONENTS` agregados). Falta agregar `"CHIC"` + `CHIC_COLORS` + `CHIC_COMPONENTS` cuando exista `ChicTemplate.tsx` (Fase 5).
- [x] Fase 8 — Gating por tipo de evento en `TemplatePreviewModal.tsx` — **HECHO** (`getAvailableTabs(eventType)` muestra el tab "Neon" solo si `eventType === "QUINCE_ANOS" || eventType === "CUMPLEANOS"`; falta agregar la condición de "Chic" solo para `CASAMIENTO` cuando exista, ya dejé el helper preparado con un comentario). **Verificado en navegador**: confirmar de nuevo con el flujo completo del wizard (no solo `/preview-plantilla` directo) antes de dar la fase por 100% cerrada — lo que se probó fue la URL directa del iframe, no clickeando el modal real paso a paso.
- [x] Fase 9 — Generalizar puntos binarios ELEGANT/MODERNO — **HECHO** en los 3 archivos (`StepDesign.tsx`, `WizardLivePreview.tsx`, `preview-plantilla/page.tsx`).
- [x] Fase 10 — Sample data de preview (`template-preview-samples.ts`) — **HECHO** (tipo `TemplateTipo` importado del registry en vez de duplicar el union literal; `NEON_COLOR_TO_VESTIDO` agregado con `default: "rojo"`).
- [x] Fase 11 — Wiring en las 3 páginas de render real — **HECHO para Neon** en las 3 (`invite/[slug]/[token]/page.tsx`, `i/[slug]/page.tsx`, `preview/[slug]/page.tsx`: import de `NeonTemplate` + rama `if (templateTipo === 'NEON') return <NeonTemplate .../>` antes del `if/else` de MODERNO/ELEGANT existente). Falta repetir para `ChicTemplate` cuando exista (Fase 5).
- [~] Fase 12 — Verificación end-to-end — **PARCIAL**: `tsc --noEmit` limpio, verificación visual en navegador hecha para Neon default vía `/preview-plantilla?evento=QUINCE_ANOS&tipo=NEON&color=default` (ver hallazgos abajo). **Falta**: `next build` completo, probar el flujo real del wizard (no solo la URL directa), probar Neon con evento `CUMPLEANOS` (solo se probó `QUINCE_ANOS`), y repetir toda la verificación para Chic + todas las variantes de color de ambas.
- [ ] Fase 13 — Commit en `nuevo-template` (sin push salvo pedido explícito). NO iniciada — no hay nada commiteado todavía de este trabajo, todo sigue como cambios sin commitear en el working tree.

**Al retomar**: antes de marcar cualquier fase como "en progreso", correr `git status` y `git diff` en la rama `nuevo-template` para ver qué archivos ya fueron tocados, y comparar contra la lista de "Puntos de choque" más abajo — así se detecta si una fase quedó a medias.

---

## Hallazgos de la verificación visual de Neon (importante — leer antes de tocar Chic)

Se verificó `NeonTemplate.tsx` (variante `default`) en el navegador, comparando siempre contra `ModernoTemplate.tsx` renderizado en las mismas condiciones para distinguir "bug mío" de "comportamiento preexistente de la arquitectura compartida que Moderno también tiene". Metodología: `npx serve`/dev server + `http://localhost:3000/preview-plantilla?evento=QUINCE_ANOS&tipo=NEON&color=default&scroll=1` (y con `tipo=MODERNO` para comparar), viewport 420×900.

**Bug real encontrado y corregido**: `BottomNavPill` usa `createPortal(..., document.body)` — al portarse fuera del árbol DOM del wrapper de la plantilla, NO hereda las CSS vars (`--t-acc`, `--t-surface`) que el wrapper define inline. El nav inferior de Neon se veía dorado (el accent global del sitio) en vez de cian. Esto es un bug **preexistente que Moderno también tiene**, pero invisible ahí porque el dorado global del sitio coincide por casualidad con el dorado de Moderno. Se corrigió agregando props explícitas `accentColor`/`surfaceColor` a `BottomNavPill` (con defaults = colores originales de Moderno, cero riesgo de regresión) y pasándolas desde `NeonTemplate.tsx`. **Pendiente**: `ChicTemplate.tsx` va a necesitar el mismo fix (pasar sus propios `accentColor`/`surfaceColor` al `BottomNavPill`) — no asumir que ya funciona solo.

**Bug real encontrado y corregido**: `SongSuggestion.tsx` (no portado, pero SÍ compartido) tenía los colores de la rama `variant === "moderno"` **hardcodeados en hex literal** (`#0F0E13`, `#151219`, `#C9A876`, `#9B92AF`) en vez de usar CSS vars. Se agregaron 3 CSS vars nuevas y genéricas al wrapper de cada plantilla (`--t-bg`, `--t-surface`, `--t-muted`, sumadas a la `--t-acc` que ya existía) y se reemplazaron los hex literales de `SongSuggestion.tsx` y `BottomNavPill.tsx` por `var(--t-bg)`/`var(--t-surface)`/`var(--t-acc)`/`var(--t-muted)`. **Se agregaron estas 3 vars nuevas a los 8 archivos Moderno** (`ModernoTemplate.tsx` + las 7 variantes de color) con los valores originales exactos (`#0F0E13`/`#151219`/`#9B92AF`) para no cambiar absolutamente nada de su render — verificado que compilan. **Pendiente**: `ChicTemplate.tsx` y sus 6 variantes también van a necesitar estas 3 vars definidas con sus propios valores (no van a tenerlas por defecto).

**Comportamiento preexistente confirmado (NO es un bug de Neon, no tocar)**: el `<h1>` del hero en la vista mobile no usa `var(--font-cormorant)` (que si resuelve bien a Bebas Neue) sino una ruta de estilos completamente distinta y más vieja: la clase `.p-hero h1 { font-family: var(--t-font-d); ... }` (en `globals.css`), y `--t-font-d` se define en `#inv-stage[data-theme="xv"]{--t-font-d:'Fraunces',serif; ...}` — un sistema de theming por `data-theme` (boda/xv/cumple/ejecutivo/etc, en `globals.css` líneas ~1176-1182) que es anterior a Moderno y que ni Moderno ni mi copia de Neon sobreescriben. Se confirmó comparando: Moderno también muestra "Sofía" en Fraunces serif en esa vista, no en su tipografía propia. Si en algún momento se quiere tipografía 100% consistente (Bebas Neue en TODOS los textos, no solo los que pasan por `--font-cormorant`), hay que tocar esta capa base compartida — está fuera del alcance de "instalar una plantilla nueva siguiendo el patrón de Moderno" y afectaría a Moderno/Elegant/Draft también.

**Comportamiento preexistente probable (no confirmado al 100%, revisar si se ve feo en la práctica)**: `.desktop-stage{background:var(--t-paper)}` (`globals.css` línea 1227, `min-height:640px`) es el fondo del wrapper raíz compartido por TODAS las plantillas, y `--t-paper` para tema "xv" es `#FBF0E9` (crema claro) — un tono que no tiene nada que ver con el dark de Moderno/Neon. Se vio un frame con fondo crema al saltar instantáneamente (`window.scrollTo`) a mitad de página en Neon; no se pudo confirmar si es un frame de transición real (`.reveal`/IntersectionObserver, `transition:all` está seteado en `.desktop-stage`) que un usuario real jamás vería scrolleando normalmente, o un gap real entre secciones. Como es la MISMA regla compartida que usa Moderno (no algo que yo haya tocado), no se le puede echar la culpa a Neon específicamente sin probarlo también en Moderno con scroll real (no instantáneo) — pendiente de una verificación más cuidadosa con scroll gradual real (`computer scroll`, no `window.scrollTo`) en ambas plantillas antes de decidir si hay que arreglar algo.

**No verificado todavía**: RSVP, quiz, tarjeta bancaria/álbum con fotos reales, música. Sí se verificó el cover/portada con los doodles + anime.js (ver nota en la Fase 3 arriba) y hero/countdown/nav.

**Actualización posterior (ya no aplica)**: la nota original acá decía que los doodles de Neon solo estaban en la portada. Ya no es así — se extendieron al cuerpo completo (hero, divisor, kickers de sección, footer) con scroll-reveal animado vía `IntersectionObserver`, más un marco de esquinas en la foto del hero y un brillo diagonal ligado al scroll (`onScroll` de anime.js). Ver la sección de Chic abajo para el detalle de implementación (es el mismo patrón en ambas plantillas, documentado una sola vez para no repetir).

---

## Hallazgos de Chic (leer antes de tocar variantes de Chic o crear más plantillas nuevas)

Mismo proceso que con Neon: se construyó `ChicTemplate.tsx` copiando `ModernoTemplate.tsx` (colores/fuentes/identificadores por script, doodles propios agregados a mano), y luego se verificó en navegador comparando contra la referencia para separar "bug mío" de "comportamiento preexistente". Además, el usuario pidió en esta misma ronda: doodles en el cuerpo (no solo portada) desde el principio, doodles más detallados, un marco alrededor de la foto del hero (no solo esquinas — **marco completo**, a diferencia de lo que se hizo primero para Neon), y un efecto de brillo tipo "sol en el lente de una cámara" (lens flare) en vez del "haz" diagonal de Neon.

**Implementado desde el principio (no hubo que redescubrirlo)**: `--t-bg`/`--t-surface`/`--t-muted` en el wrapper, `accentColor`/`surfaceColor` explícitos en `BottomNavPill`. Esto ya estaba en `ModernoTemplate.tsx` (fix de la ronda de Neon) y se heredó automáticamente al copiar — confirma que valió la pena arreglarlo ahí en vez de en Neon únicamente.

**Doodles**: `IconRings` (anillos entrelazados, con brillos tipo diamante), `IconHeartDoodle` (corazón con voluta), `IconRibbon` (moño con dos lazos y colas), `IconChurch` (capillita con puerta en arco, rosetón, y **cruz deliberadamente chica** — pedido explícito del usuario: "hazlo pequeñito, ya que sino parece un cementerio"). Con más detalle de trazo que la primera versión (el usuario pidió explícitamente "hazlos más detallado" después de ver los primeros bocetos simples). Animados igual que Neon: `.chic-doodle` + `coverRootRef` al montar (portada), `.chic-scroll-doodle` + `IntersectionObserver` en el cuerpo (hero, divisor tipo guirnalda antes del countdown, kicker de cada sección, separador de footer con ramita en vez del `///////` de Neon).

**Marco de foto + brillo tipo lente**: a diferencia de Neon (que terminó con marco completo tras pedido del usuario), acá se implementó marco completo **desde el principio** (borde dorado fino en todo el perímetro + `IconRings`/`IconHeartDoodle` "saliendo" del borde en dos esquinas, calcando "ornamentos que salen del marco" del mockup). El brillo es un lens flare real: un punto de luz cálido (`radial-gradient` casi blanco) más 2 reflejos fantasma más chicos seguido con `translate`, todos ligados a `onScroll()` de anime.js vía `self.progress`. El usuario dio feedback en vivo sobre Neon que se aplicó por adelantado acá: opacidad baja (pico ×0.35-0.55, no más), recorrido amplio para que cruce bien la foto.

**Bug real encontrado y corregido — inversión de tema (light vs dark) en colores "coincidentes"**: al sustituir colores de Moderno (oscuro) a Chic (claro), varios lugares usaban un token de Moderno (ej. `#0F0E13`, `#1C1926`) como **color de texto** contra un fondo que en Moderno coincidía con ese mismo tono oscuro (dark-on-dark invisible si no fuera porque en Moderno esos fondos NO usaban ese token) -- el sustituto mecánico (`#0F0E13`→crema) convirtió esas instancias en **texto crema sobre fondo crema** (invisible) en varios puntos: el h4 de las tarjetas Ceremonia/Fiesta, el texto de los badges/botones dorados, un texto de detalle en RSVP, y el estado "copiado" del botón de copiar alias bancario. Se corrigieron los 5 casos a mano tras comparar cada uno contra su fondo real en el original (**uno de los 5 casos, el botón "copiado", en realidad SÍ necesitaba quedar claro** porque su fondo también se había invertido a oscuro -- el primer intento de "arreglarlo" lo dejó oscuro-sobre-oscuro por segunda vez; hay que revisar el fondo de CADA instancia individualmente, no aplicar la misma corrección a todas en bloque). **Para la próxima plantilla nueva que invierta claro/oscuro** (no aplica si la nueva plantilla mantiene el mismo tema oscuro que Moderno): buscar `color:\s*#<token-de-fondo-viejo>` y `text-\[#<token-de-fondo-viejo>\]` en el archivo generado y revisar CADA uno contra su fondo real, no asumir que la sustitución mecánica los dejó bien.

**Bug real encontrado y corregido — prop `dark` de componentes compartidos**: `Countdown.tsx` y `RSVPWizardV2.tsx` (compartidos, no portados) usan un prop booleano `dark` que además de agregar una clase `.dark` (que los `<style jsx>` de Chic SÍ necesitan para sus overrides `#rsvp.section.dark ...`/`#countdown.dark`) también dispara colores de texto **hardcodeados en `#FFFFFF`/`#EDE9F4`** pensados para fondos oscuros -- invisibles sobre el fondo claro de Chic (el usuario lo reportó como "el countdown minimalista no se lee el número"). La solución NO es pasar `dark={false}` (eso rompe los overrides CSS que dependen de la clase `.dark`) -- es cambiar los hardcodes en los componentes compartidos a `dark ? "var(--t-onink, #FFFFFF)" : "inherit"` (con el hex original como fallback, así Moderno/Neon/Elegant -- que no definen `--t-onink` -- quedan exactamente igual que antes) y definir `--t-onink: "#241E12"` en el wrapper de `ChicTemplate.tsx`. Corregido en `Countdown.tsx` (1 instancia, estilo "minimalista") y `RSVPWizardV2.tsx` (7 instancias). **Si se agrega una plantilla nueva de tema claro en el futuro, revisar si usa `Countdown`/`RSVPWizardV2` con `dark` y definir `--t-onink` ahí también** -- no hace falta tocar los componentes compartidos de nuevo, ya están preparados.

**Bug real encontrado y corregido — las variantes de color no se notaban (Parte 1, INSUFICIENTE, superado por Bug 6)**: el usuario reportó "Chic aún no está variando de colores... está el selector, pero no cambia". Causa: el plan original decía "dorado fijo, varía el acento oliva", y el acento oliva casi no se usa en el render (2-3 spots nomás, igual que en Moderno). El error fue no darse cuenta de que **en Moderno, lo que realmente hace que sus 7 variantes se vean distintas es que cada una recolorea TODO el fondo/base** (`#0F0E13`→`#3D0808` para Rojo, etc.) -- el dorado (`--t-acc`) se mantiene literalmente igual en las 7, pero como los componentes compartidos (`Countdown`, etc.) leen `var(--t-acc)` para el color más visible (dígitos de la cuenta regresiva), y ESE token nunca varía en Chic, las variantes eran casi indistinguibles. **Fix parcial (esta parte)**: el generador de variantes de Chic retintó `#FBF3EA`/`#F5EAD9`/`#FFFFFF` (fondo/superficie) con un tono sutil por variante, ADEMÁS de seguir variando el acento oliva. **Esto NO fue suficiente** -- ver Bug 6 abajo, el usuario aclaró que el punto principal de las variantes era que el ACENTO (dorado, `--t-acc`) mismo cambiara, no solo el fondo.

**Bug real encontrado y corregido — el wrapper de escritorio nunca tuvo las CSS vars del tema (afecta a Moderno/Neon/Chic por igual, preexistente)**: al verificar el fix del countdown en el navegador, midiendo el DOM real (no solo mirando screenshots), until encontré que `ChicTemplate.tsx` (y `NeonTemplate.tsx`, y el `ModernoTemplate.tsx` original) renderizan **dos wrappers raíz distintos** con `className="desktop-stage"`: uno para mobile (con TODAS las CSS vars del tema: `--t-acc`, `--t-bg`, etc.) y otro, más abajo en el archivo, exclusivo para el layout de escritorio (`<aside className="d-left">` + `<div className="d-right tpl">`), que **solo tenía `getTypographyCssVars(...)` y ninguna de las vars de color**. En Moderno esto "no se nota" porque el fallback de los componentes compartidos (`Countdown`, `RSVPWizardV2`) cuando la var no existe es un color claro que igual se lee bien sobre el fondo oscuro de Moderno -- pura coincidencia, no diseño. En Chic (tema claro) ese mismo fallback es invisible. **Fix**: se agregaron las mismas 7 vars (`--t-acc`, `--t-acc2`, `--c-accent`, `--t-bg`, `--t-surface`, `--t-muted`, y en Chic también `--chic-ink`) al wrapper de escritorio en `ChicTemplate.tsx` Y en `NeonTemplate.tsx` (por consistencia/corrección, aunque en Neon "andaba" por la misma coincidencia). **No se tocó `ModernoTemplate.tsx`** (ni sus 7 variantes) para no arriesgar una regresión en algo que ya está en producción funcionando por esa coincidencia -- si en algún momento se nota un problema de legibilidad en la vista de escritorio de Moderno, este es el lugar exacto para mirar primero.

**Bug real encontrado y corregido — colisión de nombre de variable CSS (`--t-onink`)**: para el fix anterior (countdown ilegible) se había definido `--t-onink` en el wrapper de Chic. Sin querer, este nombre **ya existía** en el sistema de theming viejo y compartido (`globals.css`, reglas `.p-hero h1{color:var(--t-onink)}` y `.d-left-top h1{color:var(--t-onink)}`, pensadas para el texto que va ENCIMA de la foto de portada -- necesita quedar claro/blanco, no seguir el color de tinta de la página). Como esa var nunca había estado definida en el scope de estas plantillas, esas reglas quedaban "inertes" (`color: var(--var-inexistente)` sin fallback computa como el valor heredado, que por casualidad se veía bien). Al definir `--t-onink` para arreglar el countdown, **"desperté" esas reglas viejas sin querer** y el nombre de los novios en la vista de escritorio (que va superpuesto sobre la foto, con clase Tailwind `text-white`) pasó a mostrarse con mi tinta oscura -- ilegible sobre la foto. El usuario lo notó de inmediato ("cambiaste el color al nombre de los novios... en desktop"). **Fix**: se renombró la variable que agregué de `--t-onink` a `--chic-ink` (namespace propio, sin colisión) en los 3 lugares que la definen/usan con fallback (`Countdown.tsx`, `RSVPWizardV2.tsx` -- 7 instancias con fallback, no las que ya usaban `var(--t-onink)` sin fallback desde antes de esta sesión, esas se dejaron intactas -- y `ChicTemplate.tsx`, ambos wrappers). Verificado en el DOM real: el countdown sigue en `#241E12` (legible) y el nombre de los novios volvió a `#F7F1E4` (el valor que ya traía el sistema de theming viejo para ese contexto, legible sobre la foto). **Lección para plantillas nuevas**: antes de inventar un nombre de variable CSS nuevo con prefijo `--t-*`, comprobar que no exista ya en `globals.css` (`grep -n "nombre-propuesto" src/app/globals.css`) -- ese prefijo es el namespace del sistema de theming viejo/compartido, no un espacio libre.

**Bug real encontrado y corregido — el acento (dorado) seguía fijo en todas las variantes (Parte 2, fix real)**: tras el fix del Bug 3 (retinte de fondo), el usuario volvió a aclarar: "no se cambian los colores de cada plantilla, siguen todos con el acento en dorado, eso era lo principal". El diseño original (documentado más abajo como "dorado fijo + 1 acento variable", copiando la lógica asumida de Moderno) estaba mal interpretado: para Moderno el dorado SÍ es fijo porque su identidad visual pasa por el fondo oscuro variable, pero para Chic el usuario quería que el propio dorado (`--t-acc`/`--t-acc2`/`--c-accent`, el color más visible: dígitos del countdown, kickers de sección, bordes, íconos doodle) cambiara por variante -- igual que ya hace Neon (que sí varía `--t-acc` directamente por variante). **Fix real**: se reescribió el generador de variantes (`ChicTemplate.tsx` → `ChicTemplate{Nombre}.tsx`) para que CADA variante tenga un único color de acento propio, usado tanto para lo que antes era el token oliva secundario (`#6B7A4F`, doodles chicos, washes de fondo en Cita/Quiz) como para el dorado principal (`#C9A876` y sus `rgba(201,168,118,X)`) -- ambos tokens ahora colapsan al mismo `v.accent` por variante, más el retinte de fondo del Bug 3 que se mantuvo. Paleta final: Rosa `#B08590`, Azul `#6E8299`, Terracota `#B9713F`, Violeta `#8779A0`, VerdeBotella `#3F5F4A`, Gris `#8C8275` (default sigue dorado `#C9A876`, sin variante = plantilla original). Verificado con `tsc --noEmit` limpio y en el DOM real de 3 variantes (`default`→acento `#C9A876`, `VerdeBotella`→`#3F5F4A` confirmado en `--t-acc` computado y en el color real del kicker, `Terracota`→visualmente naranja/terracota en countdown y "01 Detalles"), más captura de pantalla confirmando que el nombre de los novios sigue blanco/legible sobre la foto (sin regresión del Bug 5). **Si se toca `ChicTemplate.tsx` de nuevo, el script generador vigente es el que sustituye `#6B7A4F` Y `#C9A876` (con sus variantes rgba) por el mismo `v.accent` por variante -- no el de la Fase 6 original que solo tocaba el fondo.**

**Bug real encontrado y corregido — el título "SUGERÍ UNA CANCIÓN" no se veía en Neon ni en Chic**: el usuario reportó "el titulo de sugeri una cancion no se esta viendo ni en neon, ni en chic". Causa: el bloque `<style jsx>` de personalización de `SongSuggestion` (copiado de `ModernoTemplate.tsx`, sección "SongSuggestion Custom Aesthetics") tiene la regla `#songs.d-sec.dark h2, #songs.d-sec.dark p:not(.t-kicker) { display: none !important; }`. Esta regla fue escrita pensando que el kicker visible tendría la clase `.t-kicker`, pero `SongSuggestion.tsx` con `variant="moderno"` (el que usan Moderno/Neon/Chic) renderiza el kicker con clases Tailwind sueltas (`text-[11px] font-semibold...`), NO con `.t-kicker` -- así que el selector `p:not(.t-kicker)` termina matcheando y ocultando al propio kicker, que es el ÚNICO `<p>` que existe en el DOM en esta configuración (`hideHeader` ya impide que se rendericen el `h2` y el párrafo de descripción). Confirmado en el DOM real con `element.matches(rule.selectorText)`: en Chic y Neon el kicker medía `display: none`; en Moderno, por alguna diferencia de compilación/scope de styled-jsx que no vale la pena perseguir, la misma regla (idéntica en el código fuente) NO matcheaba y el texto sí se veía -- por eso el usuario solo lo notó en las plantillas nuevas. **Fix**: se acotó la regla a `#songs.d-sec.dark h2 { display: none !important; }` (se sacó el `p:not(.t-kicker)`, que ya no cumple ningún propósito con `hideHeader` activo) en `NeonTemplate.tsx` y `ChicTemplate.tsx`, y se propagó el mismo cambio textual a las 5 variantes de Neon y las 6 de Chic (el bloque es idéntico en las 11, sin colores de por medio). **No se tocó `ModernoTemplate.tsx`** porque ahí no está roto -- si en el futuro se nota el mismo síntoma en Moderno, esta es la regla a revisar primero. Verificado con `tsc --noEmit` limpio y en el DOM real de Chic y Neon (`kickerDisplay: "block"`, texto "SUGERÍ UNA CANCIÓN" visible).

## Checklist "antes de dar por terminada una plantilla nueva" (usar para Chic y para cada variante)

1. Copiar el archivo base correcto (`ModernoTemplate.tsx` para Chic — NO `NeonTemplate.tsx`, que ya tiene contenido neon-específico).
2. Sustituir colores + identificadores (script de node, no a mano — ver el que se usó para Neon como referencia, buscar en el historial de esta rama).
3. Agregar `--t-bg`, `--t-surface`, `--t-muted` al wrapper (además de `--t-acc`/`--t-acc2`/`--c-accent` que el script ya cubre).
4. Pasar `accentColor`/`surfaceColor` explícitos al `<BottomNavPill variant="moderno" .../>`.
5. `grep -rn "moderno" archivo.tsx` (case-insensitive) y revisar CADA resultado — no asumir que todos son inocuos (comentarios) como en Neon; puede haber `variant="moderno"` o clases `.moderno-*` reales.
6. `npx tsc --noEmit` limpio.
7. Verificación visual real en navegador: servir con dev server, abrir `/preview-plantilla?evento=<tipo>&tipo=<TIPO>&color=default&scroll=1`, comparar CADA sección contra la plantilla base (Moderno) tomando screenshots — no dar por bueno un renglón de código sin verlo renderizado.
8. Repetir el punto 7 con scroll gradual real (no `window.scrollTo` instantáneo) para no perderse animaciones/transiciones que dependen de scroll progresivo.

---

## Reglas de negocio (gating)

En el modelo `Invitation` (`prisma/schema.prisma`), el campo `tipo` (String, sin enum real, valores usados en código: `"CASAMIENTO"`, `"QUINCE_ANOS"`, `"CUMPLEANOS"`) determina el tipo de evento. En el wizard (`src/components/wizard/StepEventType.tsx`), la opción `CUMPLEANOS` se muestra al usuario con la etiqueta **"Evento"** (ícono `PartyPopper`) — es el valor al que se refería el pedido "neon va para 15 y evento".

- **Neon**: visible/seleccionable solo si `tipo === 'QUINCE_ANOS' || tipo === 'CUMPLEANOS'`.
- **Chic**: visible/seleccionable solo si `tipo === 'CASAMIENTO'`.
- Los templates existentes (Elegant, Moderno) siguen disponibles para los 3 tipos "de diseño" (`CASAMIENTO`, `QUINCE_ANOS`, `CUMPLEANOS`) — no tocar ese comportamiento.
- El gating debe implementarse donde el usuario elige la plantilla (`TemplatePreviewModal.tsx`, ver Fase 8). No hace falta gating server-side estricto (rechazar en el backend si igual llega un `templateTipo` inválido para el tipo de evento) porque el patrón existente tampoco lo hace para Elegant/Moderno — mantener consistencia, no sobre-construir.

---

## Resumen de los mockups (ya analizados — no repetir este trabajo)

Ambos archivos (`mockup/nuevo/neon.html`, `mockup/nuevo/chic.html`) son exports "bundled" de una herramienta de page-building: el HTML visible es solo un loader que descomprime un `<script type="__bundler/manifest">` con imágenes/fuentes/JS embebidos en base64+gzip. **No intentar leer el archivo crudo con Read/grep — es inviable (>1M tokens en una sola línea) e innecesario.** Para verlos, servirlos con un static server (`npx serve mockup/nuevo -l <puerto>`) y abrirlos en el navegador (`http://localhost:<puerto>/neon.html`, ídem chic) — funcionan standalone, con toggle "Celular/Escritorio". **No son HTML/CSS reutilizable como código fuente** — son referencia visual únicamente. Toda la implementación real se escribe desde cero en React siguiendo el patrón de `ModernoTemplate.tsx`.

### Neon → "Doodle Disco 15"

Paleta: **negro** de fondo + **magenta neón** + **cian**. Tipografía: display condensada bold estilo **Bebas Neue** (títulos grandes tipo "SOFÍA 15"), texto/labels en **Space Grotesk**, cifras/horarios en **Space Mono** (fuentes confirmadas por los `.woff2` embebidos en el manifest). Motivos decorativos: **doodles de trazo fino** — bola de disco, ondas de sonido, confeti, número "15", copa, luces de neón — usados como line-art sutil (círculos tipo sunburst/rueda, líneas onduladas con puntos, diagonales `///////` como separador de footer). Botones: contorno fino (cian) para CTAs secundarias, relleno sólido (magenta) para CTA primaria ("ENVIAR" en sugerencias de canciones). Cronograma con horas en Space Mono color cian sobre fondo con bordes finos.

Estructura de secciones (idéntica al orden que ya usa `DraftTemplate`/`ModernoTemplate`, confirmando que se puede portar 1:1):
1. Portada ("Con mucho cariño, para / [Familia]", dress code, botón "Abrir Invitación")
2. Hero ("Mis Quince Años" / "[Nombre] 15" con foto)
3. Cuenta regresiva (DÍAS/HS/MIN/SEG)
4. Frase/quote
5. Cuándo y dónde (Ceremonia + Fiesta, cada una con link "Ver mapa")
6. Cronograma (lista hora + evento)
7. Álbum
8. Mapa embebido
9. Confirmación/RSVP ("¿Venís a mi fiesta?", Confirmar / No podré)
10. Valor de la tarjeta / datos bancarios (2 alias: tarjeta y regalo)
11. Quiz ("¿Cuánto sabés?")
12. Sugerí una canción (con contador de votos ♥)
13. Footer + nav inferior flotante (INFO / MAPA / RSVP / TARJETA / QUIZ / MÚSICA)

### Chic → "Doodle Wedding"

Paleta: **crema** de fondo + **tinta negra** + **oliva** + **dorado**. Tipografía: título display en **itálica serif elegante** (ver qué alias de Google Font se usa realmente al implementar — visualmente similar a Fraunces/Playfair itálica, ya usados en el proyecto), labels en versalita trackeada. Motivos decorativos: **doodles de trazo fino de boda** — anillos entrelazados, corazones, moños/cintas, ramitas, elipses, cruces pequeñas, todo como **marca de agua al 6% de opacidad** de fondo en cada sección, más un ícono doodle propio por sección y separadores tipo "guirnalda" entre secciones. Ornamentos que "salen" del marco de la portada (no quedan contenidos en un rectángulo limpio, cruzan el borde). Nav inferior flotante en tono oliva oscuro.

Misma estructura de secciones que Neon (portada → hero "Nos Casamos / [Novia] & [Novio]" → cuenta regresiva → frase → ceremonia/fiesta → cronograma → álbum → mapa → confirmación → datos bancarios ["Pago de tarjetas" + "Regalos"] → quiz → sugerí canción → footer + nav con label "BANCO" en vez de "TARJETA").

### Nota de licencias

Las fotos de stock usadas en ambos mockups son de **iStock/Getty** (créditos visibles tipo "iStock — Credit: kali9"). **No reutilizar esas imágenes en producción** — son solo referencia de estilo/grading para las fotos de muestra (sample data de preview). Usar imágenes propias o placeholders neutros donde el componente necesite una imagen de referencia.

---

## Arquitectura actual del sistema de plantillas (investigada, con paths exactos)

Hay **dos familias de plantillas reales** (`TemplateTipo = "ELEGANT" | "MODERNO"`), cada una con variantes de color. El catálogo `src/lib/templatesConfig.ts` (ids como `GOLDEN`, `NEON`, `PARALLAX`, etc.) es un sistema **legado/paralelo** que solo se usa para tipos de evento que NO son de diseño (ni boda/15/cumpleaños) vía `TemplateSelector.tsx` — **no tocar ni usar ese sistema para esto**, Neon y Chic entran por el sistema `TemplateTipo` porque `QUINCE_ANOS`/`CUMPLEANOS`/`CASAMIENTO` son siempre "eventos de diseño" (`isDesignEvent` en `StepDesign.tsx`).

**Nota de nombres**: el id legado `NEON` en `templatesConfig.ts` (categoría MODERN, ⚡, colores `#000000/#00F3FF/#FF00FF`) es solo una entrada de catálogo sin componente real detrás — no colisiona con el nuevo `TemplateTipo: "NEON"` que se va a crear (viven en sistemas distintos), pero el nombre es confuso. No hace falta renombrar nada del catálogo legado (fuera de alcance), solo tenerlo presente para no confundirse durante el desarrollo.

Flujo de datos: `Invitation.templateTipo` (String, default `"ORIGINAL"`) + `Invitation.temaColores` (String JSON, con `colorPrincipal`) determinan qué componente se renderiza. `Invitation.tipo` determina si se usa el flujo de diseño (ELEGANT/MODERNO/futuro NEON/CHIC) o el legado (`ConviteTemplate`).

### Puntos de choque exactos (12 archivos + N archivos nuevos — lista actualizada, 2 más de lo previsto originalmente)

1. **`src/components/templates/NeonTemplate.tsx`** ✅ HECHO — variante `default` creada, copiando `ModernoTemplate.tsx` (mismos subcomponentes reutilizados). Falta: usar `IconDiscoBall`/`IconSpark` en el JSX (están creados pero sin usar) y agregar el `useEffect` con `animate()`/`stagger()` de anime.js (el import está pero no hay ningún efecto real todavía).
2. **`src/components/templates/NeonTemplate{Violeta,Dorado,Verde,Azul,Rojo}.tsx`** ❌ NO HECHO (0 de 5-6 archivos).
3. **`src/components/templates/ChicTemplate.tsx`** ❌ NO HECHO. Al crearlo, aplicar desde el principio el checklist de la sección anterior (no repetir el descubrimiento de bugs a los tumbos).
4. **`src/components/templates/ChicTemplate{Rosa,Azul,Terracota,Violeta,VerdeBotella,Gris}.tsx`** ❌ NO HECHO (0 de 6).
5. **`src/components/wizard/template-preview-registry.tsx`** ✅ HECHO para Neon (`TemplateTipo`, `NEON_COLORS`, `NEON_COMPONENTS`). Falta `CHIC_COLORS`/`CHIC_COMPONENTS` + agregar `"CHIC"` a `TemplateTipo`.
6. **`src/components/wizard/TemplatePreviewModal.tsx`** ✅ HECHO para Neon (`getAvailableTabs`/`getColorsForTipo`, gating por `eventType`, borde de swatch cian). Falta agregar la condición de Chic en `getAvailableTabs` (`tipo === "CHIC" → eventType === "CASAMIENTO"`).
7. **`src/components/wizard/StepDesign.tsx`** ✅ HECHO para Neon (`TEMPLATE_TIPO_LABEL`/`TEMPLATE_TIPO_COLORS`/`TEMPLATE_TIPO_BORDER` como lookup por tipo, ya no ternario binario). Solo falta agregar la entrada `CHIC` a esos 3 records cuando exista.
8. **`src/components/wizard/WizardLivePreview.tsx`** ✅ HECHO para Neon. Falta agregar `"CHIC"` a la condición cuando exista.
9. **`src/app/preview-plantilla/page.tsx`** ✅ HECHO para Neon (`NEON_COMPONENTS` importado, narrowing de `tipo` extendido). Falta rama `CHIC`.
10. **`src/lib/template-preview-samples.ts`** ✅ HECHO para Neon (`TemplateTipo` importado del registry, `NEON_COLOR_TO_VESTIDO`). Falta mapa equivalente para Chic si aplica (Chic es CASAMIENTO, que usa `getCasamientoFotos` — rotación por hash, no por vestido — probablemente no necesita nada extra, revisar igual).
11. **`src/app/invite/[slug]/[token]/page.tsx`**, **`src/app/i/[slug]/page.tsx`**, **`src/app/preview/[slug]/page.tsx`** ✅ HECHO para Neon en las 3 (import + rama `if (templateTipo === 'NEON') return <NeonTemplate .../>`). Falta rama `CHIC` en las 3 cuando exista `ChicTemplate.tsx`.
12. **`package.json`** ✅ HECHO — `animejs` v4.5.0 instalado (API modular, ver nota arriba).

**Puntos de choque nuevos, descubiertos durante la verificación visual (NO estaban en el plan original)**:

13. **`src/components/invitation/v2/BottomNavPill.tsx`** ✅ HECHO — se agregaron props `accentColor`/`surfaceColor` (portal a `document.body` rompe la herencia de CSS vars, ver "Hallazgos" arriba). Moderno usa los defaults (sin cambios); Neon pasa `accentColor="#39FFD0" surfaceColor="#141418"`. **Chic va a necesitar pasar sus propios valores acá también** — no lo olvides al crear `ChicTemplate.tsx`.
14. **`src/components/invitation/v2/SongSuggestion.tsx`** ✅ HECHO — hex literales de la rama `variant === "moderno"` reemplazados por `var(--t-bg)`/`var(--t-surface)`/`var(--t-acc)`/`var(--t-muted)`. No necesita más cambios para Chic (ya es genérico), pero Chic sí necesita definir esas 4 vars en su propio wrapper (ver punto 16).
15. **`src/components/templates/ModernoTemplate.tsx` + las 7 variantes de color** (`Azul/Bordo/Gris/Negro/Purpura/Rojo/Verde`) ✅ HECHO — se agregaron `--t-bg`/`--t-surface`/`--t-muted` a los 8 archivos con los valores originales exactos de Moderno (`#0F0E13`/`#151219`/`#9B92AF`), necesario para que el fix del punto 14 no rompiera nada. Verificado con `tsc` limpio. **No hace falta tocar esto de nuevo para Chic.**
16. **`tsconfig.json`** ✅ HECHO (side-fix, no relacionado al feature pero bloqueaba `tsc` limpio) — se agregó `"mockup"` a `exclude` porque había un `.tsx` suelto dentro de `mockup/nuevo/uploads/` con un error de tipos preexistente que no tiene nada que ver con este trabajo.

No hay Prisma schema que tocar — `templateTipo`/`temaColores` ya son `String` genéricos, no hace falta migración.

---

## Sub-variantes de color (propuesta inicial — ajustable)

Siguiendo el patrón de Moderno (dorado fijo + 1 acento variable) y Elegant (crema/blanco fijo + 1 familia de color variable):

**Neon** (negro fijo + doodles + tipografía fija; varía la pareja de acentos neón):
- `default` — Cian + Magenta (el que se ve en el mockup: `#39FFD0` + `#FF2E9B`)
- `Violeta` — Violeta + Cian
- `Dorado` — Dorado + Magenta
- `Verde` — Verde lima + Magenta
- `Azul` — Azul eléctrico + Magenta
- `Rojo` — Rojo + Cian

**Chic** (crema + tinta negra fijos + doodles; varía el acento que hoy es "oliva", el dorado se mantiene):
- `default` — Oliva + Dorado
- `Rosa` — Rosa antiguo + Dorado
- `Azul` — Azul grisáceo + Dorado
- `Terracota` — Terracota + Dorado
- `Violeta` — Violeta apagado + Dorado
- `VerdeBotella` — Verde botella + Dorado
- `Gris` — Gris cálido + Dorado

Los hex exactos se definen al implementar cada variante (copiar `NeonTemplate.tsx`/`ChicTemplate.tsx` y cambiar solo las constantes de color, igual que `ModernoTemplateRojo.tsx` respecto de `ModernoTemplate.tsx`).

---

## anime.js

No está instalado (`grep` en `package.json` confirmado vacío). Instalar con `npm install animejs`. Verificar versión resultante en `package.json` después de instalar: si es v4+, la API cambia respecto a v3 (`import { animate, stagger, createTimeline } from 'animejs'` en vez de `import anime from 'animejs'`) — adaptar los ejemplos de animación al API real instalada, no asumir v3 de memoria.

Usos previstos ("efectos PRO"), a implementar en `useEffect` con refs (patrón imperativo, fuera del ciclo de render de React, igual que se haría con GSAP):
- **Neon**: parpadeo/glow pulsante en los acentos de neón (simulando tubo de neón encendiéndose), stagger de entrada en los doodles decorativos (aparecen uno por uno con leve rotación), animación de "encendido" en la portada al abrir invitación.
- **Chic**: entrada suave tipo "dibujado a mano" en los doodles (stroke-dashoffset animado si se recrean como SVG con trazo, dando sensación de que se están dibujando en vivo), stagger sutil en textos del hero, transición delicada entre secciones al hacer scroll (scroll-reveal).

No reemplazar `framer-motion` donde ya se usa en el resto del proyecto — anime.js se usa puntualmente en estos dos templates nuevos para los efectos que el usuario pidió explícitamente, no es un reemplazo global.

---

## Iconografía

El proyecto ya tiene `lucide-react` como dependencia y se usa en varios templates (`ModernoTemplate.tsx` importa `Clock, MapPin, Trophy, Star, ThumbsUp, Users, CreditCard, Gift, Ticket`), pero otros íconos se resuelven como SVG inline hechos a mano (`IconInfo`, `IconMap`, etc. en el mismo archivo) — de calidad más simple/genérica.

Para Neon y Chic, "mayor calidad" implica **iconografía a medida del tema** (no genérica de librería):
- **Neon**: line-art doodle de disco (bola de disco, ondas de sonido, confeti, trofeo/copa, rayo/luces de neón) — dibujados como SVG propios de trazo fino, coherentes con lo visto en el mockup, en vez de reusar `lucide-react` genérico.
- **Chic**: line-art doodle de boda (anillos entrelazados, corazones, moños, ramitas/guirnalda, abanico) — ídem, SVG propios de trazo fino.

Estos SVG se escriben a mano como componentes (mismo patrón que `IconInfo`/`IconMap` en `ModernoTemplate.tsx`, pero con el detalle de trazo del mockup) — no hace falta instalar una librería de iconos nueva.

---

## Verificación entre pasos (qué chequear al retomar cada fase)

- Después de crear cada archivo `.tsx` nuevo: `npx tsc --noEmit` debe seguir limpio.
- Después de tocar cualquiera de los 10 puntos de choque: `grep -rn "NEON\|CHIC" src/components/wizard src/app/preview-plantilla src/app/invite src/app/i src/app/preview src/lib/template-preview-samples.ts` para confirmar que todos los puntos de choque de la lista fueron efectivamente tocados (ninguno olvidado).
- Al final (Fase 12): `npx next build` completo (parar cualquier `next dev` corriendo antes, para no pisar el `.next`), y prueba visual en navegador vía wizard: crear/editar una invitación tipo `QUINCE_ANOS` → confirmar que en "Elegí tu plantilla" aparecen Elegant, Moderno **y Neon** (no Chic); tipo `CASAMIENTO` → aparecen Elegant, Moderno **y Chic** (no Neon); tipo `CUMPLEANOS` → aparecen Elegant, Moderno **y Neon** (no Chic).

---

## Pendiente de decisión del usuario (no bloquea el inicio, pero preguntar si surge)

- Nombres finales de las sub-variantes de color (la lista de arriba es una propuesta razonable siguiendo el patrón existente, no fue confirmada por el usuario).
- Si `mockup/nuevo/` debe agregarse a `.gitignore` (son ~2.4MB de HTML de referencia, no se usan en runtime) o mantenerse versionado tal cual.
