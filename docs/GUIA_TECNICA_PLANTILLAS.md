# Guía técnica — Cómo implementar una plantilla de invitación nueva

> Destilado de la implementación real de **Neon** ("Doodle Disco 15") y **Chic** ("Doodle Wedding"), las primeras dos plantillas agregadas después de Elegant/Moderno. El detalle bug-por-bug de esas dos (con capturas de contexto, citas textuales del usuario, etc.) vive en `docs/PLAN_TEMPLATES_NEON_CHIC.md` — ese documento es la bitácora de una sesión puntual y no hace falta releerlo entero. **Este documento es el que hay que abrir cada vez que se agregue una plantilla nueva** — reemplaza tener que redescubrir estos mismos puntos a los tumbos otra vez.
>
> Cuando termines una plantilla nueva y encuentres un bug de arquitectura que no está listado acá (no un typo puntual, algo que la próxima plantilla también va a pisar), agregalo a la sección 6. Este documento se mantiene vivo.

---

## 1. Arquitectura: dónde entra una plantilla nueva

Hay una única familia real de plantillas de "diseño", tipada como:

```ts
// src/components/wizard/template-preview-registry.tsx
export type TemplateTipo = "ELEGANT" | "MODERNO" | "NEON" | "CHIC";
```

Se aplica **solo** a invitaciones cuyo `tipo` (campo string en el modelo `Invitation`) es `"CASAMIENTO" | "QUINCE_ANOS" | "CUMPLEANOS"` — lo que en el código se llama `isDesignEvent` (ver `StepDesign.tsx`). Cualquier otro tipo de evento usa un catálogo legado distinto (`src/lib/templatesConfig.ts` + `ConviteTemplate`) que **no** hay que tocar ni usar de referencia para esto.

Flujo de datos: `Invitation.templateTipo` (uno de los 4 valores de arriba) + `Invitation.temaColores` (JSON string, `{ colorPrincipal: "..." }`) determinan qué componente React se renderiza. Cada `TemplateTipo` tiene:
- Un archivo base (`XxxTemplate.tsx`) con la variante `default`.
- N archivos variante de color (`XxxTemplateNombreColor.tsx`), generados por script a partir del base (ver sección 4).
- Una entrada en `XXX_COLORS` (array para el selector) y `XXX_COMPONENTS` (mapa `id color → componente`) en `template-preview-registry.tsx`.

**No existe una capa de abstracción/interfaz común entre plantillas.** Cada `XxxTemplate.tsx` es un archivo standalone de ~1000-1500 líneas que reimplementa toda la invitación (portada, hero, countdown, cronograma, álbum, RSVP, banco, quiz, canciones, footer) reutilizando los mismos **componentes compartidos** (`Countdown`, `RSVPWizardV2`, `BottomNavPill`, `SongSuggestion`, `AlbumCarousel`, `ProgressiveQuiz`, `SectionWrapper`, todos en `src/components/invitation/v2/`) más JSX/CSS propio para todo lo demás. Copiar un archivo base existente y editarlo es el flujo de trabajo esperado, no armar algo desde cero.

---

## 2. Proceso paso a paso para agregar una plantilla nueva

### 2.1 Elegir el archivo base a copiar

- Si la plantilla nueva es de **tema oscuro** (fondo oscuro, texto claro): copiar `ModernoTemplate.tsx`.
- Si es de **tema claro** (fondo claro, texto oscuro): copiar `ModernoTemplate.tsx` igual (es la base más completa y ya tiene los fixes de las secciones 3-5 de este documento) y después invertir colores — **no** copiar `ChicTemplate.tsx` ni `NeonTemplate.tsx` como base de una tercera plantilla, son ellas mismas copias con contenido temático ya específico que no aplica a la nueva.

### 2.2 Identidad visual propia — esto es lo que hace que la plantilla se sienta "nueva" y no un reskin

Copiar el color y la tipografía no alcanza. Lo que el usuario evalúa como "plantilla nueva de verdad" (y lo pidió explícitamente en las dos rondas de Neon/Chic) son estos tres elementos, coherentes con la temática del mockup que se esté portando:

**a) Doodles/iconografía SVG a medida del tema — no genéricos de librería.** El proyecto tiene `lucide-react` disponible pero para estas plantillas la calidad esperada es iconografía de trazo fino hecha a mano, específica del tema (bola de disco/ondas de sonido para una fiesta de 15; anillos entrelazados/moños para una boda). Se escriben como componentes SVG inline en el mismo archivo (mismo patrón que `IconInfo`/`IconMap` ya existentes) — no hace falta instalar una librería de íconos nueva. **Si al portar un mockup nuevo la temática tiene motivos visuales propios (ver el HTML de referencia), hacer SVG a medida de esos motivos; no reusar los doodles de Neon/Chic ni un ícono genérico "parecido".**

**b) Un efecto de luz/reflejo sobre la foto de portada, coherente con la temática — no el mismo efecto reciclado.** Cada plantilla tuvo su propio efecto, decidido por analogía con su ambientación, no copiado 1:1:
- **Neon** (disco/neón): un haz de luz diagonal que cruza la foto de punta a punta al hacer scroll — como un reflejo de luz de neón pasando.
- **Chic** (boda elegante): un lens-flare cálido (punto de luz + 2 reflejos fantasma más chicos) — como un rayo de sol pegándole al lente de una cámara.

Al agregar una plantilla nueva, **pensar qué efecto es coherente con SU tema** antes de portar cualquiera de los dos anteriores: ejemplos de analogías razonables — un template de cine podría tener un flicker tipo proyector/grano de película; uno tropical/playa un destello tipo reflejo en el agua; uno vintage un efecto de luz cálida tipo atardecer. El mecanismo técnico (`onScroll()` de anime.js atado a un `ref` sobre la foto, ver sección 3) es reutilizable siempre — lo que cambia por plantilla es el `background` del gradiente/posición y la curva de opacidad, ajustados a mano viéndolo en vivo (ver nota de debugging en la sección 6).

**c) Un marco decorativo alrededor de la foto de portada.** Ambas plantillas terminaron con un borde fino de un solo color, cubriendo todo el perímetro (no solo esquinas — eso se probó primero en Neon y el usuario pidió específicamente que fuera completo). Confirmar contra el mockup si el marco tiene algún detalle adicional (un ícono "saliendo" de una esquina, como en Chic) antes de darlo por terminado con un simple `border`.

**Si el mockup de una plantilla nueva no tiene alguno de estos tres elementos (por ejemplo, no tiene marco), no inventarlo — pero si el mockup SÍ los sugiere y la primera versión que se sube no los tiene, hay que agregarlos antes de considerar la plantilla terminada.** Es un patrón que el usuario va a esperar consistentemente en cada plantilla nueva a partir de acá.

### 2.3 Animaciones con anime.js

Instalado como dependencia (`animejs` v4.5.0 en `package.json`, ya no hace falta instalarlo de nuevo). **API modular de v4, no v3**:

```ts
import { animate, stagger, onScroll } from "animejs";
```

Dos patrones ya probados y reutilizables tal cual:

1. **Entrada al abrir la portada**: un `useEffect` con un `ref` al contenedor de la portada (`coverRootRef`), que en el montaje corre `animate()` sobre los doodles de la portada con `stagger()` (aparecen uno por uno, no todos a la vez) — `scale` + `rotate` + `opacity`, partiendo de la clase `opacity-0` en el JSX.
2. **Scroll-reveal en el cuerpo**: un segundo `useEffect` con un `IntersectionObserver` que, la primera vez que un elemento con una clase propia de la plantilla (ej. `.neon-scroll-doodle`, `.chic-scroll-doodle` — usar un nombre de clase propio por plantilla, no reusar el de otra) entra en viewport, corre `animate()` sobre él (`scale`+`rotate`+`opacity`, `ease: "outBack"` funcionó bien en ambas) y se desobserva (dispara una sola vez). Todos los doodles del cuerpo arrancan con `opacity-0` en el JSX.
3. **Brillo/reflejo ligado al scroll**: `onScroll({ target: heroPhotoRef.current, onUpdate: (self) => { const p = self.progress; /* actualizar opacity/transform del overlay a mano */ } })`. `self.progress` va de 0 a 1 mientras el elemento atraviesa el viewport — no hace falta pasar `container` explícito, sin especificarlo ya cae en modo `useWin` (escucha `window`), pasar `document.body` a mano es un no-op.

No usar anime.js para nada que no sea estos tres efectos puntuales — el resto del proyecto usa `framer-motion`, no reemplazarlo.

### 2.4 Generar las variantes de color — con script, nunca a mano

Cada variante (`XxxTemplateNombre.tsx`) se genera con un script de Node de una sola vez, por sustitución de string sobre el archivo base — no se escribe a mano ni se copia-pega. Patrón (adaptar la lista de tokens de color según lo que la plantilla use):

```js
const fs = require("fs");
const baseSrc = fs.readFileSync("src/components/templates/XxxTemplate.tsx", "utf8");
const variants = [
  { name: "NombreVariante", accent: "#RRGGBB", accentRgb: "R,G,B", bg: "#RRGGBB", bg2: "#RRGGBB", surf: "#RRGGBB" },
  // ...
];
for (const v of variants) {
  let s = baseSrc;
  s = s.replace(/rgba\(R,\s*G,\s*B,\s*([0-9.]+)\)/g, (_, a) => `rgba(${v.accentRgb},${a})`); // rgba derivados del acento
  s = s.split("#ACCENTHEX").join(v.accent);
  s = s.split("#BGHEX").join(v.bg);
  s = s.split("#BG2HEX").join(v.bg2);
  s = s.split("#SURFHEX").join(v.surf);
  s = s.split("XxxTemplate").join(`XxxTemplate${v.name}`); // rename de identificador
  fs.writeFileSync(`src/components/templates/XxxTemplate${v.name}.tsx`, s);
}
```

**⚠️ Regla no negociable**: cada vez que se edite el archivo base (JSX, doodles, animaciones, estructura — no solo un color puntual), hay que volver a correr el script y regenerar TODAS las variantes, si no quedan desincronizadas silenciosamente (pasó dos veces en la sesión de Neon: se agregaron doodles al cuerpo después de generar las variantes, y quedaron sin esos doodles hasta regenerar de nuevo). Guardar el script generador en algún lado reutilizable durante la sesión (no reescribirlo de memoria cada vez) y volver a correrlo después de cada edición sustancial al base.

**⚠️ Lección de diseño (no técnica) del Bug 6 de Chic — la más importante de esta sección**: la primera versión del generador de Chic solo variaba un acento secundario poco visible y dejaba el acento principal (`--t-acc`, el color que se ve en los dígitos del countdown, los kickers de sección, los bordes) **fijo** en todas las variantes, imitando lo que se creyó que era el patrón de Moderno. El usuario tuvo que aclarar dos veces que **el acento principal, el color más visible, tiene que cambiar de verdad entre variantes** — es el punto entero de tener variantes. **Al diseñar el generador de una plantilla nueva, la variable que hay que variar es `--t-acc` (y todo lo que dependa de ella: `--t-acc2`, `--c-accent`, sus `rgba()` derivados) — no un token secundario poco visible.** Un retinte sutil del fondo por variante (opcional, buen detalle) nunca reemplaza esto.

Después de generar/regenerar: `npx tsc --noEmit` debe quedar limpio antes de seguir.

### 2.5 Wiring — los archivos que hay que tocar sí o sí

Estos son los puntos de choque reales (confirmados, no la lista original estimada que quedó desactualizada en `PLAN_TEMPLATES_NEON_CHIC.md`). Para una plantilla nueva `XXX`, en cada uno:

1. **`src/components/templates/XxxTemplate.tsx`** + variantes — el archivo nuevo en sí (secciones 2.1-2.4).
2. **`src/components/wizard/template-preview-registry.tsx`** — agregar `"XXX"` a `TemplateTipo`, un array `XXX_COLORS: ColorOption[]`, y un mapa `XXX_COMPONENTS` (dynamic imports, mismo patrón que `NEON_COMPONENTS`/`CHIC_COMPONENTS`).
3. **`src/components/wizard/TemplatePreviewModal.tsx`** — agregar la condición de gating en `getAvailableTabs(eventType)` (ver sección 5).
4. **`src/components/wizard/StepDesign.tsx`** — agregar la entrada `XXX` a los records `TEMPLATE_TIPO_LABEL`/`TEMPLATE_TIPO_COLORS`/`TEMPLATE_TIPO_BORDER` (o como se llamen en el momento — son lookups por `TemplateTipo`, ya no ternarios binarios desde que existen 4 tipos).
5. **`src/components/wizard/WizardLivePreview.tsx`** — agregar `"XXX"` a la condición de qué componente previsualizar.
6. **`src/app/preview-plantilla/page.tsx`** — importar `XXX_COMPONENTS` y extender el narrowing de `tipo`.
7. **`src/lib/template-preview-samples.ts`** — revisar si necesita un mapa `XXX_COLOR_TO_VESTIDO` (o equivalente) para las fotos de muestra del preview; depende de si el tipo de evento usa rotación por vestido o por hash.
8. **`src/app/invite/[slug]/[token]/page.tsx`, `src/app/i/[slug]/page.tsx`, `src/app/preview/[slug]/page.tsx`** — las 3 páginas de render real: importar `XxxTemplate*` y agregar la rama `if (templateTipo === 'XXX') return <XxxTemplate .../>` (o el `switch(color)` equivalente, ver estas mismas páginas para Neon/Chic como referencia exacta).

Después de tocar todos: `grep -rn "XXX" src/components/wizard src/app/preview-plantilla src/app/invite src/app/i src/app/preview src/lib/template-preview-samples.ts` para confirmar que ninguno quedó afuera.

### 2.6 Gating por tipo de evento

Vive exclusivamente en `TemplatePreviewModal.tsx`, función `getAvailableTabs(eventType)`:

```ts
function getAvailableTabs(eventType: string | undefined): { tipo: TemplateTipo; label: string }[] {
  // ...
  if (tipo === "NEON") return eventType === "QUINCE_ANOS" || eventType === "CUMPLEANOS";
  if (tipo === "CHIC") return eventType === "CASAMIENTO";
  // agregar acá la condición de XXX
}
```

No hay gating server-side (el backend no rechaza un `templateTipo` inválido para el `tipo` de evento) — es consistente con Elegant/Moderno, que tampoco lo tienen. No agregarlo solo para la plantilla nueva.

---

## 3. Sistema de theming (CSS custom properties) — contrato y trampas

### 3.1 Las variables que toda plantilla nueva debe definir

En el wrapper raíz (inline `style`), como mínimo:

```
--t-acc       (acento principal — el color más visible: countdown, kickers, bordes)
--t-acc2      (acento secundario, puede ser igual a --t-acc si la plantilla usa un solo color dominante)
--c-accent    (alias legado que algún componente compartido todavía lee)
--t-bg        (fondo de sección)
--t-surface   (superficie de tarjetas/inputs)
--t-muted     (texto secundario/placeholder)
```

Estas son las que leen genéricamente `Countdown.tsx`, `RSVPWizardV2.tsx`, `BottomNavPill.tsx` y `SongSuggestion.tsx` (variant `"moderno"`) — se agregaron durante la implementación de Neon reemplazando hex literales hardcodeados que esos componentes tenían pensados solo para Moderno. **Ya son genéricas, no hace falta tocar esos 4 componentes de nuevo al agregar una plantilla — solo definir bien estas variables en el wrapper de la plantilla nueva.**

### 3.2 Trampa: el wrapper se define DOS VECES en el mismo archivo

Cada `XxxTemplate.tsx` renderiza dos raíces `className="desktop-stage"` distintas: una para mobile (arriba del archivo, con todas las CSS vars) y otra, más abajo, exclusiva para el layout de escritorio (`<aside className="d-left">` + `<div className="d-right tpl">`). **Las dos necesitan exactamente las mismas variables de color** — la de escritorio suele arrancar solo con `getTypographyCssVars(...)` (tipografía) y sin ninguna de las variables de la sección 3.1, lo que deja el countdown/RSVP/etc. en la vista de escritorio con el color de fallback en vez del de la plantilla. Definir las variables en **ambos** wrappers desde el principio, no solo en el primero que se encuentra editando.

(`ModernoTemplate.tsx` tiene este mismo gap y no se corrigió a propósito, para no arriesgar una regresión en algo que ya funciona en producción por una coincidencia de que su fallback claro igual se lee bien sobre su fondo oscuro. Si se toca Moderno en el futuro por otro motivo, este es el primer lugar a revisar si se nota algo destemplado en escritorio.)

### 3.3 Trampa: colisión de nombres con el sistema de theming viejo

`globals.css` tiene un sistema de theming previo a Moderno, con el mismo prefijo `--t-*`, activado por `#inv-stage[data-theme="boda"|"xv"|"cumple"|...]` (variables como `--t-onink`, `--t-font-d`, `--t-paper`, `--t-ink`, usadas por reglas base como `.p-hero h1`, `.d-left-top h1`). Si una plantilla nueva define una variable `--t-<algo>` que por casualidad ya existe ahí, **"despierta" esas reglas viejas sin querer** — pasó con `--t-onink`, que rompió el color del nombre de los novios superpuesto sobre la foto en la vista de escritorio (esa regla vieja estaba "inerte" hasta que la variable empezó a existir en scope).

**Antes de inventar el nombre de una variable CSS nueva**: `grep -n "<nombre-propuesto>" src/app/globals.css`. Si ya existe, usar un namespace propio de la plantilla en vez del prefijo `--t-*` genérico (ej. `--chic-ink` en vez de `--t-onink`).

### 3.4 Trampa: el prop `dark` de `Countdown`/`RSVPWizardV2`

Estos dos componentes compartidos usan un prop booleano `dark` que hace dos cosas a la vez: (1) agrega una clase `.dark` que el `<style jsx>` de la plantilla puede necesitar como hook para sus propios overrides (`#rsvp.section.dark ...`, `#countdown.dark ...`), y (2) dispara colores de texto hardcodeados pensados para fondo oscuro. Si la plantilla nueva es de **tema claro** y se le pasa `dark={false}` para arreglar el punto 2, se rompen los overrides CSS del punto 1 que dependen de la clase.

La solución ya está resuelta genéricamente en ambos componentes: los hardcodes quedaron como `dark ? "var(--chic-ink, #FFFFFF)" : "inherit"` (fallback = el hex original, así Moderno/Neon/Elegant, que no definen esa variable, quedan exactamente igual que antes).

**⚠️ Corrección (encontrada durante la tanda de 18 plantillas de `imple-masiva`, repetida en 6 plantillas nuevas antes de detectarse)**: el nombre de variable que leen `Countdown.tsx`/`RSVPWizardV2.tsx` es **literalmente `--chic-ink`, fijo, no configurable** — NO "cualquier nombre que la plantilla elija" como decía una versión anterior de este párrafo. Si la plantilla nueva es de tema claro y define su propia variable con nombre propio (ej. `--editorial-ink`) en vez de `--chic-ink`, el fallback hardcodeado (`#FFFFFF`/`#EDE9F4`, pensado para fondo oscuro) queda activo sobre un fondo claro → texto invisible en el countdown "minimalista" y en varios textos del RSVP. **Si la plantilla nueva es de tema claro, definir `--chic-ink` con el hex de tinta que corresponda, en ambos wrappers (sección 3.2)** — se puede definir TAMBIÉN una variable con nombre propio en paralelo para otros usos (ej. `textColor` de `LogoFooterCredit`, que sí acepta cualquier nombre porque no lo tiene hardcodeado), pero `--chic-ink` específicamente tiene que estar. Si la plantilla nueva es de tema oscuro, no hay nada que hacer acá — `dark={true}` con el fallback default ya funciona (es la misma coincidencia que beneficia a Moderno).

### 3.5 Trampa: inversión mecánica de colores claro↔oscuro

Al portar una plantilla de tema oscuro a uno claro (o viceversa) sustituyendo tokens de color por script, es fácil que un token que en el original era "fondo oscuro" termine reusado como **color de texto** en algún punto puntual del archivo, y el reemplazo mecánico lo convierta en texto invisible (mismo color que su fondo real, que no es el fondo que se estaba sustituyendo). Pasó en 5 puntos distintos al portar Chic. **Revisar cada instancia de `color:` / `text-[#...]` que use un token de fondo del original, contra su fondo REAL en el contexto donde aparece — no asumir que la sustitución mecánica dejó todo bien, y no aplicar la misma corrección a todas las instancias en bloque** (una de las 5 en Chic necesitaba la corrección contraria a las otras 4, porque su fondo también se había invertido).

### 3.6 Trampa: dos variantes de la misma plantilla con el mismo acento principal (sin querer)

Al generar variantes a mano o con un script que arma cada paleta como un par `{ acc, acc2 }` elegido "a ojo" por variante (en vez de un único acento por variante tomado de una lista central), es fácil que dos variantes terminen con el **mismo `--t-acc`** y solo difieran en `--t-acc2` — pasó en 3 de las 18 plantillas de la tanda `imple-masiva` (`Seda`: `Nocturna`/`Esmeralda` compartían `#D9BFA0` como acento principal; `Pétalos`: la base y `VinoVibrante` compartían `#E23B4E`; `Luz de Luna`: la base y `PerlaSuave` compartían `#B9A6D9`). Como `--t-acc` es el que de verdad se nota (countdown, kickers, bordes — sección 2.4), esas parejas de variantes eran visualmente casi indistinguibles pese a tener nombres distintos — el mismo bug de fondo que el Bug 6 de Chic, reintroducido por variantes que no salieron de un único generador determinístico.

**Verificación obligatoria después de generar variantes de CUALQUIER plantilla** (agregar al checklist de la sección 6): `grep -oE '"--t-acc": *"#[0-9A-Fa-f]+"' src/components/templates/NombrePlantilla*.tsx | sort | uniq -c` y confirmar que cada archivo tiene un hex de `--t-acc` distinto a los demás de la misma familia. Si dos coinciden, no alcanza con tocar `--t-acc2` — hay que hacer que `--t-acc` (y su espejo `--c-accent`, que siempre lo replica) sea realmente distinto entre esas dos variantes (la corrección más simple: intercambiar los valores de `--t-acc`/`--t-acc2` en una de las dos, si el que iba de secundario ya era suficientemente distintivo).

---

## 4. Landmine puntual: el título de `SongSuggestion` puede quedar oculto

El bloque `<style jsx>` de personalización de la sección de canciones (buscar el comentario `SongSuggestion Custom Aesthetics` dentro de cualquier `XxxTemplate.tsx`) suele copiarse tal cual entre plantillas. Tiene una regla `#songs.d-sec.dark h2, #songs.d-sec.dark p:not(.t-kicker) { display: none !important; }` pensada para ocultar el título/descripción largos cuando se usa `hideHeader`. El problema: `SongSuggestion` con `variant="moderno"` (la que usan todas estas plantillas) renderiza el kicker visible con clases Tailwind sueltas, **no** con la clase `.t-kicker` — así que ese `p:not(.t-kicker)` termina ocultando al propio kicker, que es el único `<p>` que existe en el DOM en esa configuración.

**Al copiar este bloque a una plantilla nueva, dejar la regla acotada a `#songs.d-sec.dark h2 { display: none !important; }` (sin el `p:not(.t-kicker)`)** — ya se corrigió así en Neon y Chic; si se copia desde `ModernoTemplate.tsx` (que todavía tiene la versión vieja, sin romperse por una razón de scope de styled-jsx que no se terminó de explicar) hay que aplicar el mismo recorte a mano al portarlo.

---

## 5. Checklist de verificación — cómo confirmar que algo realmente funciona

No dar nada por bueno solo por cómo se ve en un screenshot o por leer el código. El patrón que sí detectó los bugs reales de esta sección:

1. **`npx tsc --noEmit`** limpio después de cada archivo nuevo o cada regeneración de variantes.
2. **Servidor de desarrollo + `/preview-plantilla?evento=<TIPO>&tipo=<XXX>&color=<id>&scroll=1`** — dismissea la portada automáticamente, sirve para revisar rápido el cuerpo y comparar variantes entre sí. **No sirve** para verificar la animación de entrada de la portada (necesita el gesto manual de abrir).
3. **`/i/[slug]` de una invitación real** con `templateTipo`/`temaColores` seteados a la plantilla en cuestión, abriendo manualmente la portada — necesario para confirmar animaciones de entrada y el comportamiento real que va a ver un invitado.
4. **Inspección directa del DOM, no solo visual**: varios de los bugs reales de esta sesión (el wrapper de escritorio sin variables, la colisión de `--t-onink`, el kicker de canciones oculto) se confirmaron con `getComputedStyle(el)`, `el.getBoundingClientRect()`, o iterando `document.styleSheets` + `el.matches(rule.selectorText)` para encontrar EXACTAMENTE qué regla está ganando — un screenshot puede no mostrar la diferencia, o mostrar un estado transitorio de compilación (ver punto 6) que parece el bug pero no lo es.
5. **Comparar siempre contra Moderno** en la misma vista/condición antes de asumir que algo es un bug de la plantilla nueva — varios "bugs" resultaron ser comportamiento preexistente compartido (el portal de `BottomNavPill`, la tipografía del `<h1>` del hero mobile) que Moderno también tiene pero donde no se nota por una coincidencia de colores.
6. **Cuidado con el Fast Refresh de `next dev`**: los cambios a bloques `<style jsx>` grandes a veces tardan en reflejarse, y probar demasiado rápido después de guardar puede hacer parecer roto algo que en realidad solo no terminó de compilar — si algo parece "congelado" o sin cambios después de una edición, recargar la página entera (no confiar en HMR) antes de asumir que el código está mal.
7. Si el usuario reporta un bug sobre una URL específica (deployada o local), **probar esa URL exacta** antes de asumir dónde está el problema — dos veces en esta sesión el bug reportado terminó siendo simplemente que el fix ya hecho todavía no estaba pusheado/deployado a la rama que el usuario estaba mirando, no un bug de código nuevo.

## 6. Checklist final antes de dar por terminada una plantilla nueva

1. Doodles temáticos SVG propios (no genéricos) en portada Y en el cuerpo (kicker de cada sección como mínimo) — sección 2.2a.
2. Efecto de brillo/reflejo sobre la foto de portada, coherente con la temática de la plantilla, ligado al scroll — sección 2.2b.
3. Marco decorativo completo alrededor de la foto de portada — sección 2.2c.
4. Animación de entrada de doodles al abrir la portada + scroll-reveal en el cuerpo — sección 2.3.
5. Variantes de color generadas por script, con el **acento principal (`--t-acc`) variando de verdad**, no solo un token secundario — sección 2.4 — Y **sin dos variantes de la misma familia compartiendo el mismo `--t-acc`** (`grep` de la sección 3.6).
6. Las 6 variables de la sección 3.1 definidas en **ambos** wrappers (mobile y escritorio) — sección 3.2.
7. `grep -n "<nombre-de-cada-variable-nueva>" src/app/globals.css` antes de darlas por libres de colisión — sección 3.3.
8. Si es tema claro: **`--chic-ink` definido literalmente con ese nombre** (no uno propio) en ambos wrappers, para que `Countdown`/`RSVPWizardV2` lo lean — sección 3.4 (el nombre NO es configurable, es un hardcode del componente compartido).
9. Si se invierten colores claro↔oscuro: cada instancia de texto revisada individualmente contra su fondo real — sección 3.5.
10. Bloque de `SongSuggestion Custom Aesthetics` sin el `p:not(.t-kicker)` — sección 4.
11. Los 8 puntos de choque de wiring tocados (sección 2.5) + gating (2.6) confirmados con el `grep` de la sección 2.5.
12. `npx tsc --noEmit` limpio.
13. Verificación visual real en navegador (no solo lectura de código) de cada sección, en `/preview-plantilla` Y en `/i/[slug]` real con portada abierta a mano, siguiendo la sección 5.

---

## 7. Implementar muchas plantillas a la vez en paralelo (subagentes) — lecciones de `imple-masiva`

Cuando el pedido es "implementá N plantillas" con N grande (esta guía nació de un pack de 2, pero se usó por primera vez a esta escala con 18 plantillas de una), hacerlo secuencialmente no es viable en una sesión razonable. Lo que funcionó:

**División del trabajo — solo archivos nuevos, wiring aparte.** Repartir las plantillas en lotes por subagente (agrupadas por mockup de origen, así cada agente abre un solo archivo de referencia) y darle a cada uno la instrucción explícita de **crear ÚNICAMENTE archivos nuevos bajo `src/components/templates/`** — nunca tocar `template-preview-registry.tsx`, `TemplatePreviewModal.tsx`, `StepDesign.tsx`, `WizardLivePreview.tsx`, `preview-plantilla/page.tsx`, `template-preview-samples.ts`, las 3 páginas de render real, ni ningún componente compartido (`Countdown.tsx`, `RSVPWizardV2.tsx`, `BottomNavPill.tsx`, `SongSuggestion.tsx`), ni archivos de otras plantillas del lote de al lado. El wiring de esos archivos compartidos lo hace **un solo proceso, después, secuencialmente** — si dos agentes en paralelo editan el mismo archivo compartido al mismo tiempo (sin worktrees separados) se pisan entre sí de verdad, no es un riesgo teórico.

**Los agentes no pueden verificar visualmente lo que construyen mientras el wiring no exista.** Sin entrada en el registry/gating, `/preview-plantilla` no puede renderizar la plantilla nueva todavía. La verificación de cada agente durante esta fase queda limitada a: inspección del mockup real en el navegador (colores/tipografía/doodles, con `getComputedStyle` para hex exactos) + `npx tsc --noEmit`. La verificación visual EN LA APP (sección 5 de esta guía) se hace recién en la pasada de wiring, una sola vez, sobre las 18 ya integradas — no antes.

**Límite de sesión de la cuenta.** Correr 6 agentes en paralelo, cada uno haciendo exploración de navegador + escritura de ~1500 líneas × 5-6 archivos, consume mucho uso de la cuenta — es esperable pegar contra el límite de sesión ("You've hit your session limit · resets HH:MMam/pm") a mitad de tarea, más de una vez. Cuando pasa:
- El agente corta limpio (no hay que hacer nada especial del lado del código, no corrompe archivos a medio escribir de forma sistemática — pero sí conviene revisar el archivo que estaba tocando en el momento exacto del corte, puede haber quedado a medio reescribir).
- **Reanudar con un mensaje al mismo agente (no relanzar de cero) apenas se libere** — reusa todo el contexto ya acumulado (mockup ya visto, decisiones de paleta ya tomadas), mucho más barato que empezar de nuevo. Si el mensaje de reanudación dice `"No transcript found for agent ID"`, ahí sí hay que relanzar un agente nuevo con el prompt original completo (se perdió el historial).
- Antes de reanudar los 6 a la vez, probar con **uno solo primero** — si el límite realmente se liberó, ese uno completa su lote entero sin cortarse de nuevo y confirma que vale la pena reanudar el resto; si vuelve a cortarse enseguida, evitá quemar los otros 5 intentos en simultáneo.
- Instruir explícitamente a cada agente **"si volvés a fallar por el mismo límite, no reintentes en loop — terminá tu turno así el sistema notifica"** — un agente reintentando solo por su cuenta contra un límite de cuenta agotado no consigue nada y quema más contexto.

**Navegador compartido entre agentes paralelos.** Varios agentes controlando Chrome al mismo tiempo (aunque cada uno cree su propia pestaña) generó inestabilidad real en algunos casos (pestañas navegadas por otro proceso concurrente, `screenshot` devolviendo errores de deserialización persistentes). Cuando el screenshot falla de forma persistente, la salida es inspeccionar el mockup por JS (`document.querySelector`, `getComputedStyle`, leer directamente objetos de configuración embebidos en el `<script>` del mockup si el bundle los expone) en vez de insistir con capturas — sirve igual de bien para sacar paleta/tipografía exactas y no bloquea el avance.

**Auditoría final después de que todos los lotes terminan, antes de creer los reportes al pie de la letra.** Cada agente reporta su propio trabajo como terminado y verificado, pero conviene re-confirmar con comandos propios sobre el código real antes de wiring: `grep` de duplicados de acento entre variantes de una misma familia (sección 3.6), `grep` del nombre de archivo/export function de cada base y variante (que coincidan con lo prometido en el reporte), y `npx tsc --noEmit` general una vez más con todo junto (cada agente lo corrió sobre su propio lote, pero nunca con los 18 lotes ya combinados en el mismo árbol).
