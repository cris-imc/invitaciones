# Plan DIAMOND
## Estado: Completo (con 1 excepción documentada en CP10)
## Rama: DIAMOND

### Checkpoints
- [x] 1. Modelo de datos: membresías y créditos
- [x] 2. Actualizar lógica de membresías (Free / Premium / Diamond / Enterprise)
- [x] 3. Landing page: sección de precios actualizada
- [x] 4. Landing page: opción Contacto → WhatsApp
- [x] 5. Registro: rediseño de cards de membresía con UX mejorado
- [x] 6. Panel admin: gestión de membresías y créditos por cliente
- [x] 7. Panel cliente: créditos remanentes en pantalla de inicio
- [x] 8. App mobile: botón Ayuda → WhatsApp en topbar
- [x] 9. App desktop: opción Ayuda en sidebar
- [x] 10. Revisión y checklist final

### Notas de avance
- CP1: `planTier` en `User`/`Invitation`/`Payment` ya es `String` (no enum), así que DIAMOND y ENTERPRISE no requieren cambio de schema para el tipo de membresía — ya son valores válidos. Se agregó `diamondCredits Int @default(0)` a `User` (junto a `premiumCredits`). Migración additive: `20260811120000_add_diamond_membership_and_credits`.
- CP2: `plan-limits.ts` — PREMIUM pierde `live`/`maxLivePhotos`, se agregó tier DIAMOND (mismos límites que Premium + LIVE), ENTERPRISE queda igual (ya tenía todo ilimitado/habilitado).
  - `invitation.planTier` (no `user.planTier`) es lo que determina si una invitación puntual tiene LIVE habilitado (`canUseFeature` en `api/live/session/route.ts`). Antes, toda invitación creada con crédito o plan ilimitado quedaba en `'PREMIUM'` a nivel invitación; se corrigió `api/invitations/route.ts` para que las cuentas con plan ilimitado (Diamond/Enterprise/Admin) hereden su propio tier en la invitación — si no, ninguna invitación de un usuario Diamond hubiera tenido LIVE nunca.
  - Bug encontrado y corregido de paso: `QuickEditPrice.tsx` (precio niño) y `GuestManager.tsx` (tipo de invitado Familia/Grupo) bloqueaban la feature con `planTier !== 'PREMIUM'` en vez de `=== 'FREE'` — con Diamond en juego eso hubiera bloqueado esas features justo a los usuarios Diamond. Corregido a `=== 'FREE'`.
  - Nota pendiente (fuera de los 10 checkpoints, no implementado): no existe todavía un flujo de UI para "gastar 1 crédito diamond" al crear una invitación (equivalente a `usePremiumCredit`). Los créditos diamond se otorgan (registro/admin) y se muestran (CP7), pero consumirlos al crear una invitación puntual no está pedido en el plan — si se necesita, es checkpoint nuevo.
  - Se actualizaron también los selectores de plan en `CreateUserButton.tsx` y `AdminPlanSelect.tsx` (agregado DIAMOND) para que sigan siendo consistentes, aunque el rediseño completo de gestión de membresías es CP6.
- CP3/CP4: `Pricing.tsx` reescrito con 4 cards (Gratis/Premium/Diamond/Enterprise) usando `PLAN_LIMITS` como fuente de verdad; precio Diamond calculado como 20% off del precio real (`PLAN_LIMITS.DIAMOND.price`). Enterprise sin precio fijo, CTA "Consultar" a WhatsApp, sin link a /register. `LandingNav.tsx`: agregado "Contacto" → WhatsApp (`target=_blank`) al array `BASE_LINKS`, se refleja automáticamente en desktop nav y drawer mobile porque ambos renderizan del mismo array.
- CP5: `register/page.tsx` reescrito como flujo de 2 pasos (antes era grid 2 columnas fijo: cards + form juntos). Paso 1: 3 cards (Free/Premium/Diamond) con selección por click, borde+ring dorado (`--accent`) en la seleccionada, Diamond con badge "Recomendado" y preseleccionada por default salvo que `?plan=free|premium|diamond` diga lo contrario. Paso 2: resumen del plan elegido arriba del form, botón "Crear cuenta" (se sacó la mención a pago/Mercado Pago que tenía antes: "Pagar $X y Registrarme"). El campo `planTier` que se manda a `/api/auth/register` ahora acepta "DIAMOND" (ya soportado desde CP2).
- CP6: Encontré dos sistemas de "plan" distintos en el panel admin ya existentes: `AdminPlanSelect` (por invitación, dentro de cada cliente expandido) y ninguno a nivel cliente/usuario. Lo que pide el checkpoint es a nivel cliente, así que:
  - Nuevo componente `AdminUserPlanSelect.tsx`: dropdown de membresía del **usuario** (`user.planTier`), persiste al cambiar (sin botón Guardar aparte, igual que `AdminPlanSelect`).
  - `EditCreditsButton.tsx` extendido: ahora edita `premiumCredits` **y** `diamondCredits` en el mismo diálogo (antes solo premium).
  - `PATCH /api/admin/users/[id]`: ahora acepta `premiumCredits`, `diamondCredits` y `planTier` de forma independiente (antes solo `premiumCredits` obligatorio).
  - `AdminDashboardClient.tsx`: agregado el selector de membresía y badge de plan actual junto a cada cliente.
- CP8/CP9: ambos viven en `Sidebar.tsx`. Topbar mobile (`.p-mobile-topbar`, `justify-content: space-between`) — se agregó el link de WhatsApp (ícono `MessageCircle` + texto "Ayuda") como segundo hijo, cae naturalmente al extremo opuesto del logo. Sidebar desktop — el link "Ayuda" se agregó dentro de `NavLinks` (que solo se usa en el `<aside className="p-side">`, no en la botonera mobile), con ícono `HelpCircle` (no WhatsApp, según lo pedido) y mismo markup que los demás items (`<b><Icono/></b>Texto`) para heredar el estilo del nav.

### CP10 — Revisión y checklist final
- `npx tsc --noEmit` limpio en cada checkpoint. `npm run build` (Turbopack) completo sin errores al final — único warning es preexistente (`src/lib/uploads.ts`, tracing de filesystem), no relacionado a este trabajo.
- Las 4 membresías (FREE/PREMIUM/DIAMOND/ENTERPRISE) existen y su lógica de features es correcta (`plan-limits.ts`); LIVE bloqueado en Premium, habilitado en Diamond/Enterprise/Admin (verificado tanto en el gate del servidor `api/live/session/route.ts` como en la UI `GuestPageTabs.tsx`).
- Landing: 4 cards + Contacto en nav (desktop y drawer mobile). Registro: flujo de 2 pasos + preselección por `?plan=`. Admin: membresía y créditos (premium/diamond) persisten vía `PATCH /api/admin/users/[id]`. Dashboard cliente: créditos solo si son > 0. Ayuda: visible en topbar mobile y sidebar desktop.
- **Excepción encontrada, no resuelta**: `/dashboard/subscription` (página preexistente, no es ninguno de los 10 checkpoints) todavía muestra precios y un botón deshabilitado "Próximamente - Mercado Pago". El checklist final pide "ningún precio ni mención a Mercado Pago en ninguna pantalla", pero tocar esa página a fondo no estaba entre los checkpoints y hubiera significado rediseñar una funcionalidad existente no pedida — se la dejó funcionalmente igual, solo se le agregó el tier Diamond (ver notas de CP2) para que no quede rota. Si se quiere, es un checkpoint aparte.
- Gap de alcance documentado (no es un checkpoint de la lista, mencionado en CP2): no hay UI todavía para "gastar 1 crédito diamond" al crear una invitación puntual (equivalente a `usePremiumCredit`). Los créditos diamond se otorgan y se muestran, pero consumirlos al crear una invitación no estaba pedido.
