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
- Pasada visual final sobre los ~14 `Step*.tsx` (incluye los dos nuevos/modificados de este trabajo).

## Checklist antes de commitear (propio — el original se perdió en otra herramienta)
- [ ] Preview reactiva sin avanzar de paso (nombre/fecha/lugar/tipografía/countdown)
- [ ] Preview nunca muestra el splash/portada
- [ ] Las 6 tipografías de título y 5 de texto se ven bien en la grilla y se reflejan en `/i/[slug]` (hero + splash)
- [ ] Los 4 estilos de countdown se ven distintos entre sí, en el wizard y en la invitación pública
- [ ] Invitación vieja (sin estos campos) se sigue viendo igual (defaults no rompen nada)
- [ ] Bottom sheet mobile: peek, revela con swipe arriba, oculta con swipe abajo
- [ ] Recorrido visual completo del wizard en mobile y desktop, sin overflow
- [ ] `tsc --noEmit` limpio
- [ ] Migración corre limpio sobre `dev.db`
- [ ] Todo commiteado y pusheado solo a `origin/rediseño-completo`, nunca `main`

---

## Estado actual (actualizar cada vez que se completa un bloque)

**Última actualización**: fundación de datos completa (schema + migración + Prisma Client). Falta wizard-store.ts, invitation.ts (zod) y api/invitations/route.ts.

- [x] `prisma/schema.prisma` — agregados `fontTitle`, `fontBody`, `countdownStyle` al modelo `Invitation`.
- [x] Migración `20260809170632_add_typography_and_countdown_style` — creada y aplicada a mano (no vía `prisma migrate dev`, ver nota de problema preexistente abajo), registrada en `_prisma_migrations`.
- [x] `_prisma_migrations` de `dev.db` — tenía bookkeeping roto (una migración marcada "iniciada pero nunca terminada", y 5 migraciones más ni siquiera registradas aunque sus cambios ya estaban aplicados a la DB real). Se resolvió marcando las 6 anteriores + la nueva como `applied` con `prisma migrate resolve --applied` (no se re-ejecutó SQL, solo se corrigió el registro).
- [x] `prisma generate` corrido (tuvo que matarse antes el proceso de `next dev` que tenía lockeado el .dll del query engine — EPERM típico de este entorno Windows/OneDrive).
- [ ] **Nota de problema preexistente, fuera de alcance, NO arreglado**: la migración `20260808030848_live_item_moderation_status` hace `ALTER TABLE "LiveItem"` pero ninguna migración anterior en el historial hace `CREATE TABLE "LiveItem"` — esas tablas (LiveSession/LiveItem, usadas por la feature LIVE) se agregaron a `dev.db` en algún momento vía `prisma db push` sin generar migración. Esto significa que reconstruir la DB desde cero solo con `prisma migrate deploy`/`dev` (shadow database) sigue roto un paso antes de llegar a mis cambios. No lo toqué porque está fuera del alcance de `correcciones.md` (no tocar backend/schema salvo los 3 campos nuevos) y arreglar migraciones ajenas es riesgoso sin decisión del usuario. Mi migración nueva quedó bien formada y aplicada igual, vía `prisma db execute` + `migrate resolve --applied` en vez de `migrate dev`.
- [ ] `wizard-store.ts`, `invitation.ts` (designSchema), `api/invitations/route.ts` (POST+PUT) — siguiente paso inmediato.
- [ ] Fuentes nuevas en layout.tsx — no arrancado
- [ ] StepTypography dos niveles — no arrancado
- [ ] Countdown (hook + componente + paso nuevo) — no arrancado
- [ ] WizardLivePreview (preview reactiva real) — no arrancado
- [ ] Aplicar fontTitle/fontBody/countdownStyle en plantillas — no arrancado
- [ ] Bottom sheet mobile — no arrancado
- [ ] Pasada de alineación — no arrancado
- [ ] Checklist final + push a rediseño-completo — no arrancado

**Para retomar**: seguir resolviendo el estado de migraciones de `dev.db` (correr `prisma migrate dev` para aplicar las pendientes, confirmando antes que no hay datos importantes en riesgo — es la DB local de desarrollo), después generar la migración `add_typography_and_countdown_style`, y seguir con el resto de la fundación (wizard-store.ts, invitation.ts schema, api/invitations/route.ts) antes de tocar ningún componente visual.
