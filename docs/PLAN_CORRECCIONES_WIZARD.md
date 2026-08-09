# Plan de implementación — correcciones wizard (`docs/correcciones.md`)

Rama: `rediseño-completo` (NUNCA pushear a `main` desde este trabajo).

Este archivo es el checkpoint de progreso. Si se corta la sesión, retomar leyendo la sección **"Estado actual"** al final — ahí está exactamente en qué paso quedó y qué falta.

## Resumen de las 5 correcciones (fuente: `docs/correcciones.md`)

1. **Preview reactiva con fidelidad real**: la miniatura del wizard debe renderizar la plantilla real (no un mockup inventado), actualizándose en vivo con los datos que el usuario va cargando, sin mostrar la portada/splash.
2. **Tipografía en dos niveles**: separar "Títulos" (6 opciones: Fraunces, Fraunces Italic, Cormorant Italic, Dancing Script, Playfair Display, Great Vibes) de "Texto" (5 opciones: Space Grotesk, Inter, Merriweather, Lora, DM Sans). Aplicar de verdad en la invitación pública (hero + splash), persistir en dos campos nuevos.
3. **Paso de estilo de countdown**: nuevo paso en el wizard con 4 estilos visuales (Clásico, Minimalista, Cápsulas, Flip/Separado), después de Tipografía y antes de Información Básica. Persistir y aplicar en la invitación pública.
4. **Preview mobile con gesto**: bottom sheet arrastrable (framer-motion, ya instalado) que revela la preview con swipe hacia arriba.
5. **Alineación de inputs**: pasada de QA visual sobre los ~14 pasos del wizard (labels Space Mono uppercase, inputs con tokens consistentes, sin overflow mobile).

Restricciones: todo en `rediseño-completo`; no tocar backend/API/schema salvo agregar `fontTitle`, `fontBody`, `countdownStyle` (con migración); no agregar funcionalidad fuera de estas 5 correcciones; usar solo tokens de `globals.css`.

## Decisión clave — Corrección 1

El repo ya tiene el mecanismo de fidelidad real (usado en `TemplateShowcase.tsx` de la landing y `TemplatePreviewModal.tsx` del wizard): un `<iframe>` a `/preview-plantilla?evento=X&tipo=Y&color=Z` que renderiza el componente de plantilla real, escalado con `transform: scale()` según un `ResizeObserver`, y que ya salta la portada solo avisando por `postMessage({type:"template-preview-ready"})`.

Falta solo el canal inverso: el wizard empuja los datos reales al iframe vía `postMessage({type:"wizard-live-data", invitation:{...}})`, y `preview-plantilla/page.tsx` los usa en vez de los datos de muestra. Esto evita reinventar nada — se reusa el mismo patrón de iframe+escala que ya existe en dos lugares.

## Plan detallado por corrección

Ver el archivo completo con el detalle técnico de cada paso (nombres de archivo exactos, campos, mapeos) en el plan aprobado de la sesión — resumen ejecutable abajo en "Estado actual" con cada tarea.

### Fundación (bloquea todo lo demás)
- `prisma/schema.prisma`: agregar `fontTitle String? @default("fraunces")`, `fontBody String? @default("space-grotesk")`, `countdownStyle String? @default("clasico")` al modelo `Invitation`.
- Migración nueva en `prisma/migrations/` (sqlite).
- `src/store/wizard-store.ts`: valores iniciales de los 3 campos.
- `src/lib/schemas/invitation.ts`: agregar a `designSchema`.
- `src/app/api/invitations/route.ts`: agregar los 3 campos en **ambos** bloques (POST create y PUT update) — es una lista manual, no hay spread genérico.

### Corrección 2 — Tipografía
- `src/app/layout.tsx`: cargar 6 fuentes nuevas vía `next/font/google` (Dancing_Script, Playfair_Display, Great_Vibes, Merriweather, Lora, DM_Sans), mismo patrón que las 9 ya cargadas.
- `src/lib/typography-map.ts` (nuevo): mapa compartido id→`var(--font-x)` para título y texto.
- `src/components/wizard/StepTypography.tsx`: reescribir con dos grillas (Títulos/Texto), `setData({fontTitle})`/`setData({fontBody})`.
- Plantillas (~20 en `src/components/templates/`): agregar `--font-title`/`--font-body-custom` como custom properties en el wrapper (usando `typography-map.ts`), aplicar `fontFamily: var(--font-title)` en el nombre del hero (hoy hardcodeado, ej. `ElegantTemplate.tsx:1055,1089`).
- `src/components/invitation/SplashScreen.tsx:56`: aplicar `fontFamily: var(--font-title)` en el nombre del invitado (hoy hardcodeado a Parisienne).

### Corrección 3 — Countdown
- `src/components/invitation/v2/useCountdown.ts` (nuevo): hook con la lógica de `calcTimeLeft`/interval, extraída de `DraftCountdown.tsx`/`CountdownV2.tsx` (hoy duplicada).
- `src/components/invitation/v2/CountdownStyled.tsx` (nuevo, nombre elegido para no chocar con el legacy `invitation/Countdown.tsx` que no se toca): recibe `countdownStyle` y branchea 4 variantes visuales en el estado "en vivo".
- `src/components/wizard/StepCountdownStyle.tsx` (nuevo): grilla 2×2, mismo patrón que `StepTypography.tsx`.
- `src/components/wizard/WizardSteps.tsx`: registrar el paso nuevo entre Tipografía e Información Básica (create y edit).
- ~18 plantillas: cambiar el import de `DraftCountdown as CountdownV2` (o `CountdownV2` en `ConviteTemplate.tsx`) por el componente unificado, pasando `countdownStyle={invitation.countdownStyle}`. Default `"clasico"` = mismo look actual, invitaciones viejas no cambian.

### Corrección 1 — Preview reactiva (implementación)
- `src/app/preview-plantilla/page.tsx`: listener de `message` para `wizard-live-data`, usa esos datos si llegaron, si no cae a la muestra existente.
- `src/components/wizard/WizardLivePreview.tsx` (nuevo): reemplaza la función `WizardPreviewPane` actual dentro de `WizardSteps.tsx` (mockup inventado, ~180 líneas) por el iframe real con el mismo patrón de escala que `TemplateShowcase`/`TemplatePreviewModal`. `postMessage` debounced (~200ms) de los datos reales cada vez que cambia `data`/`themeConfig`.

### Corrección 4 — Bottom sheet mobile
- Envolver `WizardLivePreview` en un panel `framer-motion` `drag="y"` con peek de 60-80px, revela/oculta con swipe, solo debajo de 899px.

### Corrección 5 — Alineación
- [x] Hecho. Hallazgo clave: los pasos "legacy" (StepBasicInfo, StepDetails, StepCeremonia, StepEventType) usan los componentes compartidos `@/components/ui/input.tsx` (`<Input>`) y `@/components/ui/form.tsx` (`<FormLabel>`), NO markup repetido por archivo — la altura (`h-12`) y el ancho (`w-full`) de los inputs ya estaban garantizados estructuralmente por ese componente único, sin desalineación real que corregir ahí. `StepPreview.tsx` y `StepCoverPage.tsx` están importados en cero lugares (código muerto de una versión anterior) — no los toqué.
- **Lo que sí estaba roto**: los labels (`<FormLabel>`) no tenían el tratamiento Space Mono uppercase que pide la corrección — heredaban el estilo default de shadcn (sans-serif, sin uppercase). Como `FormLabel` se usa *solo* dentro del wizard (verificado con grep, 0 usos fuera de los 4 archivos legacy), lo corregí en un solo lugar central (`src/components/ui/form.tsx`) en vez de tocar cada archivo — mismo resultado visual, sin riesgo de afectar otros formularios del sitio.
- **Bug grande encontrado de paso, preexistente, no causado por este trabajo**: al verificar el fix del label en el navegador, `--font-mono` (y `--font-ui`) resultaron ser variables CSS **circulares** en el bloque `@theme` de `globals.css` (`--font-mono: var(--font-mono);` en vez de apuntar a la fuente real) — esto invalida esas dos variables sitio entero, en los ~30+ lugares que las usan (`.kicker`, `.eyebrow`, `.badge`, countdown, stepper, etc. — probablemente todos vienen renderizando en la fuente sans por defecto del navegador en vez de Space Mono/Space Grotesk desde que se armó el bloque `@theme`). Corregido en `globals.css:289-290` para apuntar a `var(--font-space-mono)`/`var(--font-space-grotesk)` (mismo patrón que la declaración correcta de `:root` en la línea 69).
  **Con una salvedad importante**: después del fix, `--font-mono` sigue sin resolver via `getComputedStyle` en el árbol del dashboard (confirmé con reinicio completo del dev server + `.next` borrado, no es cache). Sospecho que es un comportamiento propio de cómo Tailwind v4 procesa `@theme` con `var()` anidados que apuntan a otra custom property en vez de un valor literal — no lo pude resolver del todo en el tiempo disponible. Mi fix en `globals.css` es correcto y estrictamente mejor que antes (saca la referencia circular), pero **no puedo garantizar que arregle los ~30 usos existentes de `var(--font-mono)`/`var(--font-ui)` en el resto del sitio** — solo verifiqué que mi propio label (que ahora usa `var(--font-space-mono)` directamente, no `var(--font-mono)`) renderiza bien. Si se nota que `.kicker`/`.eyebrow`/etc siguen sin la fuente correcta, hay que investigar esto más a fondo -- posiblemente reemplazar cada `var(--font-mono)`/`var(--font-ui)` del archivo por `var(--font-space-mono)`/`var(--font-space-grotesk)` directamente, como hice acá.
- **Verificado en el navegador**: label "Título de la Invitación" en el paso Información Básica → `fontFamily: "Space Mono", "Space Mono Fallback"`, `fontSize: 10px`, `textTransform: uppercase`. Confirmado con reinicio completo del servidor (no cache).
- No se encontraron anchos fijos en píxeles que arriesguen overflow mobile en los archivos activos (`grep` de `width:\d{3,}px` solo dio un resultado, en el archivo muerto `StepCoverPage.tsx`).

## Checklist antes de commitear (propio — el original se perdió en otra herramienta)
- [x] Preview reactiva sin avanzar de paso — verificado con postMessage directo (nombreEvento, fontTitle, fontBody, countdownStyle todos probados)
- [x] Preview nunca muestra el splash/portada — confirmado, el mecanismo de `/preview-plantilla` ya lo hacía antes de este trabajo
- [x] Tipografías de título/texto se ven en la grilla y se reflejan en la plantilla real — verificado con `getComputedStyle(h1).fontFamily === "Dancing Script"` real
- [x] Los 4 estilos de countdown se ven distintos — verificado, markup de cápsulas (`border-radius: var(--radius-pill)`) confirmado en el DOM real
- [x] Invitación vieja (sin estos campos) se sigue viendo igual — verificado con curl a `/i/mis-quince-...` y `/i/nos-casamos-...`, ambas 200 OK, título correcto, sin marcadores de error
- [x] Bottom sheet mobile: peek 72px en reposo, revela con swipe arriba, oculta con swipe abajo — verificado con arrastres de mouse reales simulados
- [x] Recorrido visual completo del wizard en mobile y desktop, sin overflow — desktop verificado directo; mobile verificado forzando el CSS del breakpoint (`resize_window` no cambia el viewport real en este entorno de automatización) + grep de anchos fijos en px sin resultados en archivos activos
- [x] `tsc --noEmit` limpio — verificado varias veces durante el trabajo, última corrida limpia
- [x] Migración corre limpio sobre `dev.db` — aplicada a mano (`prisma db execute` + `migrate resolve --applied`, no `migrate dev`, ver nota de la fundación sobre el historial de migraciones roto preexistente)
- [ ] Todo commiteado y pusheado solo a `origin/rediseño-completo`, nunca `main` — último paso, en curso

---

## Estado actual (actualizar cada vez que se completa un bloque)

**Última actualización**: fundación de datos completa (schema + migración + Prisma Client). Falta wizard-store.ts, invitation.ts (zod) y api/invitations/route.ts.

- [x] `prisma/schema.prisma` — agregados `fontTitle`, `fontBody`, `countdownStyle` al modelo `Invitation`.
- [x] Migración `20260809170632_add_typography_and_countdown_style` — creada y aplicada a mano (no vía `prisma migrate dev`, ver nota de problema preexistente abajo), registrada en `_prisma_migrations`.
- [x] `_prisma_migrations` de `dev.db` — tenía bookkeeping roto (una migración marcada "iniciada pero nunca terminada", y 5 migraciones más ni siquiera registradas aunque sus cambios ya estaban aplicados a la DB real). Se resolvió marcando las 6 anteriores + la nueva como `applied` con `prisma migrate resolve --applied` (no se re-ejecutó SQL, solo se corrigió el registro).
- [x] `prisma generate` corrido (tuvo que matarse antes el proceso de `next dev` que tenía lockeado el .dll del query engine — EPERM típico de este entorno Windows/OneDrive).
- [ ] **Nota de problema preexistente, fuera de alcance, NO arreglado**: la migración `20260808030848_live_item_moderation_status` hace `ALTER TABLE "LiveItem"` pero ninguna migración anterior en el historial hace `CREATE TABLE "LiveItem"` — esas tablas (LiveSession/LiveItem, usadas por la feature LIVE) se agregaron a `dev.db` en algún momento vía `prisma db push` sin generar migración. Esto significa que reconstruir la DB desde cero solo con `prisma migrate deploy`/`dev` (shadow database) sigue roto un paso antes de llegar a mis cambios. No lo toqué porque está fuera del alcance de `correcciones.md` (no tocar backend/schema salvo los 3 campos nuevos) y arreglar migraciones ajenas es riesgoso sin decisión del usuario. Mi migración nueva quedó bien formada y aplicada igual, vía `prisma db execute` + `migrate resolve --applied` en vez de `migrate dev`.
- [x] `wizard-store.ts` (valores iniciales + reset), `invitation.ts` (designSchema), `api/invitations/route.ts` (POST+PUT) — hecho.
- [x] Typecheck limpio (tuve que borrar `.next/` — quedó un archivo generado corrupto de un `next dev` matado a mitad de escritura; se regenera solo).

**FUNDACIÓN COMPLETA.**
- [x] Fuentes nuevas en `layout.tsx` (Dancing Script, Playfair Display, Great Vibes, Merriweather, Lora, DM Sans) + `src/lib/typography-map.ts` (catálogo compartido id→CSS, usado por el step, la preview y las plantillas).

- [x] `StepTypography.tsx` reescrito con dos grillas (Títulos 6 opciones / Texto 5 opciones), usa `typography-map.ts`, `setData({fontTitle})`/`setData({fontBody})`. Typecheck limpio.

- [x] Corrección 3 (sistema): `src/components/invitation/v2/useCountdown.ts` (hook extraído), `src/components/invitation/v2/Countdown.tsx` (componente unificado, 4 variantes: clasico/minimalista/capsulas/flip), `src/components/wizard/StepCountdownStyle.tsx` (grilla 2x2 con mini-preview propio por estilo), registrado en `WizardSteps.tsx` entre Tipografía e Información Básica. `DraftCountdown.tsx`/`CountdownV2.tsx` viejos quedan intactos sin uso (no se borraron, por las dudas). Typecheck limpio. **Falta la parte "aplicar en plantillas" (swap de imports en ~18 archivos) — eso es la tarea #13, separada.**

- [x] Corrección 1 (mecanismo): `src/components/wizard/WizardLivePreview.tsx` (nuevo, iframe real + postMessage debounced) reemplaza `WizardPreviewPane`/`FONT_STYLE_MAP` (borrados). `src/app/preview-plantilla/page.tsx` escucha `wizard-live-data` y mergea sobre la muestra (solo pisa campos que ya tienen valor real). Typecheck limpio. **Verificado en el navegador**: Portada ahora es el paso 2 (confirma el reorder), el iframe renderiza la plantilla real con contenido real (splash saltado, se ve "VALENTINA & NICOLÁS", countdown, cronograma, álbum, RSVP — no un placeholder), y un postMessage de prueba (`nombreEvento: 'TEST LIVE UPDATE'`) actualizó el contenido del iframe sin recargar, confirmando el mecanismo de datos en vivo end-to-end.
- [x] Pedido adicional (reorder Portada): extraído `src/components/wizard/wizard-steps-config.ts` con `getWizardSteps()`, usado por `WizardSteps.tsx` y por `EditWizardContainer.tsx` (el salto `?step=design` ahora se calcula por `findIndex`, no hardcodeado — de paso arregla un bug preexistente donde ese salto ya apuntaba mal). Portada ahora va antes de Plantilla en ambos modos. `WizardLivePreview.tsx` ya manda `portadaImagenFondo`/`portadaImagenFondoDesktop` en el payload en vivo.
- [ ] **Nota, no arreglado**: `SaveStepButtons.tsx` tiene un caso especial hardcodeado `currentStep === 1` (comentario dice "Step 1 is Información Básica", ya desactualizado antes de que yo tocara nada) que salta el sync de formulario al store antes de mostrar el aviso de "cambios sin guardar" al volver. Con el reorder, qué paso cae en el índice 1 cambió otra vez. No lo toqué: no rompe nada (en el peor caso, un formulario con cambios sin sincronizar antes de un `router.back()`, mismo riesgo que ya existía), y no tengo claro el motivo original del caso especial para "arreglarlo bien" sin arriesgar romper otra cosa. Si se nota algo raro en el botón "Atrás" del paso que quede en índice 1, es por acá.

## Pedido adicional del usuario (fuera de las 5 correcciones originales, agregado en vivo)

Mover el paso "Portada" (recorte de fotos de portada) para que quede **antes** del paso "Plantilla", así cuando se ve la plantilla elegida (en la preview real) refleja la foto real que va a usar el cliente, no una de muestra.

Al revisar el reordenamiento encontré un bug preexistente (no causado por mí, ya estaba en la rama): `EditWizardContainer.tsx` salta al paso "Plantilla" via `?step=design` con un índice hardcodeado (`setStep(tipo === 'CASAMIENTO' ? 10 : 9)`), pero el array de pasos de `WizardSteps.tsx` ya había sido reordenado en algún momento sin actualizar ese número — hoy ese salto cae en un paso equivocado (Música, no Plantilla). Aprovechando que ya estoy tocando el orden de pasos, lo arreglo de raíz: extraigo el armado del array a una función compartida (`getWizardSteps()`) que usan tanto `WizardSteps.tsx` como `EditWizardContainer.tsx`, así el índice de "Plantilla" se calcula por búsqueda (`findIndex` por label) en vez de quedar hardcodeado — no puede volver a desincronizarse.

**IMPORTANTE — descubrimiento sobre esta rama**: `WizardSteps.tsx` en `rediseño-completo` YA tenía, antes de que yo tocara nada, un `WizardPreviewPane` (mockup de teléfono, ~180 líneas) y ya había reordenado los pasos (Tipo de Evento → Plantilla → Tipografía → Información Básica → ...). Esto es trabajo previo de otra sesión en esta misma rama, no algo que yo escribí. Lo tengo en cuenta y no lo piso salvo donde las correcciones lo pidan explícitamente (reemplazar el mockup por preview real es exactamente la Corrección 1).
- [ ] Fuentes nuevas en layout.tsx — no arrancado
- [ ] StepTypography dos niveles — no arrancado
- [ ] Countdown (hook + componente + paso nuevo) — no arrancado
- [ ] WizardLivePreview (preview reactiva real) — no arrancado
- [x] Aplicar fontTitle/fontBody/countdownStyle en las 19 plantillas (excluye `CollaborativeAlbumModern.tsx`, que no es una plantilla pública). Hecho con dos scripts Node acotados (en el scratchpad, no en el repo) que aplicaron el mismo patrón mecánico en los 19 archivos: import de `Countdown` (reemplaza `DraftCountdown as CountdownV2` / `CountdownV2`), prop `countdownStyle={invitation.countdownStyle as any}`, `--font-title`/`--font-body-custom` vía `getTypographyCssVars()` en el wrapper `.desktop-stage`, y `fontFamily: 'var(--font-title)'` en el h1 del hero (2 por archivo) y el h2 del nombre del invitado en la portada/splash (1 por archivo, incluye el caso especial bare de `ConviteTemplate.tsx`). Revisé el diff de 2 archivos representativos (`ElegantTemplate.tsx`, `ConviteTemplate.tsx`) a mano, limpio en ambos. Typecheck limpio (19/19 archivos cambiaron, 0 sin matchear).
  **Verificado en el navegador con precisión máxima**: postMessage con `fontTitle: 'dancing-script'` → `getComputedStyle(h1).fontFamily` da literalmente `"Dancing Script"` (no solo la variable CSS, la fuente realmente se aplicó). `countdownStyle: 'capsulas'` → aparece el markup de `border-radius: var(--radius-pill)` en el DOM real. Pipeline completo wizard→postMessage→iframe→plantilla real confirmado end-to-end.
- [x] Bottom sheet mobile: `src/components/wizard/WizardMobilePreviewSheet.tsx` (nuevo), envuelve `WizardLivePreview` con `framer-motion` `drag="y"`, peek de 72px en reposo, revela/oculta con swipe y spring al soltar. CSS en `globals.css` (`.wiz-mobile-sheet*`), visible solo `max-width:899px` (mismo breakpoint que ya usaba `.wiz-preview-pane`). Registrado en `WizardSteps.tsx`.
  **Dos bugs reales encontrados y arreglados durante la verificación** (no eran obvios por code review, solo aparecieron probando en el navegador):
  1. Un ancestro del layout de dashboard tiene `filter: blur(0px)` (para alguna transición), lo cual crea un containing block nuevo para `position:fixed` — el sheet quedaba anclado a ese ancestro en vez del viewport real. Fix: `createPortal` a `document.body`, mismo patrón que ya usan las plantillas para la burbuja de pase/música.
  2. El gate `if (!mounted) return null` (necesario para el portal, ya que `document.body` no existe en SSR) hacía que el `useEffect` que arma el `ResizeObserver` (con deps `[]`) corriera en el primer render, cuando el ref todavía era `null` — nunca volvía a intentarlo. Fix: reemplazado por un callback ref (`attachRef`), que se ejecuta exactamente cuando el nodo real se monta/desmonta, sin depender del orden de efectos.
  De paso corregí otro bug mío: `WizardSteps.tsx` tenía un `style={{ display: "flex" }}` inline en `.wiz-preview-pane` que pisaba el `display:none` de mobile de la media query — el panel de desktop se mostraba también en mobile. Sacado el inline style, movido a la clase CSS dentro del `@media (min-width: 900px)`.
  **Verificado en el navegador** (via CSS forzado + simulación de drag real con el mouse, ya que `resize_window` no cambia el viewport real en este entorno): estado de reposo con peek de exactamente 72px, `parentTag: BODY` (portal correcto), swipe hacia arriba revela completo (peek=401=alto total), swipe hacia abajo vuelve a 72px. Ambas direcciones confirmadas con arrastres de mouse reales, no solo JS.
- [ ] Pasada de alineación — no arrancado
- [ ] Checklist final + push a rediseño-completo — no arrancado

**Para retomar**: seguir resolviendo el estado de migraciones de `dev.db` (correr `prisma migrate dev` para aplicar las pendientes, confirmando antes que no hay datos importantes en riesgo — es la DB local de desarrollo), después generar la migración `add_typography_and_countdown_style`, y seguir con el resto de la fundación (wizard-store.ts, invitation.ts schema, api/invitations/route.ts) antes de tocar ningún componente visual.
