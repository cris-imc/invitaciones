# Inventario — Implementación masiva de plantillas nuevas (rama `imple-masiva`)

> Checkpoint de progreso. Arquitectura de referencia obligatoria: `docs/GUIA_TECNICA_PLANTILLAS.md`. Si la sesión se corta, retomar mirando la tabla de la sección 2 (columna Estado) contra `git status`/`git diff` en `imple-masiva` — no confiar ciegamente en lo que dice acá si pasó tiempo.

## 1. Reglas confirmadas por el usuario

- **Genéricas** → `CUMPLEANOS`. **Infantil** → `CUMPLEANOS`. **15 años** (ya especificadas) → `QUINCE_ANOS`. **Casamiento** (ya especificadas) → `CASAMIENTO`. **Sin especificación de tipo** → los 3 tipos.
- Todas deben quedar elegibles en el wizard ("Elegí tu plantilla"), con sus variantes de color.
- **El acento principal debe variar de verdad entre variantes** (lección del Bug 6 de Chic, ver `GUIA_TECNICA_PLANTILLAS.md` sección 2.4) — confirmarlo con DOM/`getComputedStyle`, no solo a ojo.
- Plantillas repetidas entre mockups: descartar una, no duplicar trabajo.

## 2. Survey de los mockups (`mockup/nuevo/*.dc.html`, servidos localmente con `npx serve mockup/nuevo -l 4555`)

| Archivo mockup | Contiene | Decisión |
|---|---|---|
| `Plantillas Eventos Genéricos.dc.html` | 3 sistemas × claro/oscuro: **Minimal Corporate**, **Garden Party**, **Loft Industrial** | Implementar los 3 (CUMPLEANOS) |
| `Infantil evento.dc.html` | 1 diseño único: rediseño juvenil coral/lavanda/menta | Implementar (CUMPLEANOS) |
| `Plantillas 15 Años.dc.html` | 3 sistemas × 2 (individual/familiar): **Débutante** (Editorial), **Ónix** (Noir&Oro), **Jardín de Seda** (Botánico) | Implementar los 3, **solo la versión "individual"** — la versión "familiar" agrega un mini-wizard de conteo adultos/adolescentes/niños que es una FEATURE nueva, no un reskin visual; queda **fuera de alcance de esta pasada**, anotado como pendiente para el usuario (QUINCE_ANOS) |
| `Plantillas 15 Años Tech.dc.html` | 3 sistemas × 2: **Holograma**, **Circuito**, **Cristal 3D** | Implementar los 3 (QUINCE_ANOS) |
| `Plantillas Casamiento.dc.html` | 3 sistemas × 2: **Cine**, **Atelier Nórdico**, **Riviera** | Implementar los 3 (CASAMIENTO) |
| `Plantillas Casamiento Cinemático.dc.html` | 3 sistemas × 2: **Seda**, **Pétalos**, **Luz de Luna** (versión boda) | Implementar los 3 |
| `Plantillas 15 Años Cinemático.dc.html` | Los MISMOS 3 sistemas (Seda/Pétalos/Luz de Luna) con contenido de 15 | **Mismo sistema visual que el de arriba, reusar el mismo componente para los dos tipos de evento** (como ya hace Neon con QUINCE+CUMPLEANOS) → gating `QUINCE_ANOS` + `CASAMIENTO` |
| `Golden Dusk Wedding.dc.html` | 1 diseño único: boda al atardecer, marfil/terracota dorada | Implementar (CASAMIENTO) |
| `Bon Voyage Travel wedding & 15.dc.html` | 1 diseño único, explícitamente dual | Implementar (CASAMIENTO + QUINCE_ANOS) |
| `Plantillas Premium.dc.html` | Editorial Blanc / Noir&Oro / Botánico aplicados a boda — **el mismo sistema que "Plantillas 15 Años.dc.html" (Débutante/Ónix/Jardín de Seda), en versión boda** | **DESCARTAR — es el draft original superado**; el pack oficial de boda (`Plantillas Casamiento.dc.html`) usa 3 sistemas explícitamente distintos ("nada de Editorial Bodoni/Noir dorado/Botánico orgánico") |
| `neon.html` | — | ✅ Ya implementado (`NeonTemplate`), no tocar |
| `chic.html` | — | ✅ Ya implementado (`ChicTemplate`); el usuario borró el mockup del working tree, no hace falta |

## 3. Roster final — 18 plantillas nuevas a implementar

`TemplateTipo` propuesto (agregar a `template-preview-registry.tsx`) — id corto en mayúsculas, sin espacios:

| # | TemplateTipo | Nombre | Gating | Fuente | Estado |
|---|---|---|---|---|---|
| 1 | `EDITORIAL` | Editorial | QUINCE_ANOS | `Plantillas 15 Años.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 2 | `ONIX` | Ónix (Noir & Oro) | QUINCE_ANOS | `Plantillas 15 Años.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 3 | `JARDINSEDA` | Jardín de Seda (Botánico) | QUINCE_ANOS | `Plantillas 15 Años.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 4 | `HOLOGRAMA` | Holograma | QUINCE_ANOS | `Plantillas 15 Años Tech.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 5 | `CIRCUITO` | Circuito | QUINCE_ANOS | `Plantillas 15 Años Tech.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 6 | `CRISTAL3D` | Cristal 3D | QUINCE_ANOS | `Plantillas 15 Años Tech.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 7 | `CINE` | Cine | CASAMIENTO | `Plantillas Casamiento.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 8 | `NORDICO` | Atelier Nórdico | CASAMIENTO | `Plantillas Casamiento.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 9 | `RIVIERA` | Riviera | CASAMIENTO | `Plantillas Casamiento.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 10 | `GOLDENDUSK` | Golden Dusk | CASAMIENTO | `Golden Dusk Wedding.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 11 | `SEDA` | Seda (cinemático) | QUINCE_ANOS + CASAMIENTO | ambos packs Cinemático | ✅ Wiring completo, `tsc` limpio y verificación visual (nota: el agente no pudo tomar screenshot, verificar en navegador antes de cerrar) |
| 12 | `PETALOS` | Pétalos (cinemático) | QUINCE_ANOS + CASAMIENTO | ambos packs Cinemático | ✅ Wiring completo, `tsc` limpio y verificación visual |
| 13 | `LUZLUNA` | Luz de Luna (cinemático) | QUINCE_ANOS + CASAMIENTO | ambos packs Cinemático | ✅ Wiring completo, `tsc` limpio y verificación visual |
| 14 | `BONVOYAGE` | Bon Voyage Travel | QUINCE_ANOS + CASAMIENTO | `Bon Voyage Travel wedding & 15.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 15 | `CORPORATE` | Minimal Corporate | CUMPLEANOS | `Plantillas Eventos Genéricos.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 16 | `GARDENPARTY` | Garden Party | CUMPLEANOS | `Plantillas Eventos Genéricos.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 17 | `LOFTINDUSTRIAL` | Loft Industrial | CUMPLEANOS | `Plantillas Eventos Genéricos.dc.html` | ✅ Wiring completo, `tsc` limpio |
| 18 | `INFANTIL` | Infantil | CUMPLEANOS | `Infantil evento.dc.html` | ✅ Wiring completo, `tsc` limpio |

## 4. Estrategia de ejecución

18 plantillas es demasiado para hacer secuencialmente en una sesión con el nivel de pulido de Neon/Chic. Se reparte en **6 lotes en paralelo (subagentes)**, cada uno responsable de 3-4 plantillas de un mismo mockup (mismo contexto visual, mínima superposición). **Cada agente SOLO crea archivos nuevos en `src/components/templates/`** — el wiring a los archivos compartidos (registry, gating, wizard, páginas de render) lo hace un solo pase secuencial después, para evitar que dos agentes pisen el mismo archivo compartido a la vez.

Después del wiring: `npx tsc --noEmit` completo + verificación de al menos 1-2 plantillas por lote en `/preview-plantilla` con inspección de DOM (accento variando de verdad entre colores).

## 5. Pendientes conocidos para "mañana" (fuera de alcance de esta pasada)

- **Invitación familiar** (mini-wizard adultos/adolescentes/niños, precios por edad, 2 alias) de Débutante/Ónix/Jardín de Seda — es una feature de backend/wizard nueva, no un reskin. Implementadas solo las versiones "individual".
- Nivel de pulido de doodles/efectos de brillo puede quedar más básico que Neon/Chic en esta primera pasada (18 plantillas de una es mucho volumen) — repasar mañana con el checklist de `GUIA_TECNICA_PLANTILLAS.md` sección 6.
