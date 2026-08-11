# Plan DIAMOND
## Estado: En progreso
## Rama: DIAMOND

### Checkpoints
- [x] 1. Modelo de datos: membresías y créditos
- [x] 2. Actualizar lógica de membresías (Free / Premium / Diamond / Enterprise)
- [x] 3. Landing page: sección de precios actualizada
- [x] 4. Landing page: opción Contacto → WhatsApp
- [x] 5. Registro: rediseño de cards de membresía con UX mejorado
- [ ] 6. Panel admin: gestión de membresías y créditos por cliente
- [ ] 7. Panel cliente: créditos remanentes en pantalla de inicio
- [ ] 8. App mobile: botón Ayuda → WhatsApp en topbar
- [ ] 9. App desktop: opción Ayuda en sidebar
- [ ] 10. Revisión y checklist final

### Notas de avance
- CP1: `planTier` en `User`/`Invitation`/`Payment` ya es `String` (no enum), así que DIAMOND y ENTERPRISE no requieren cambio de schema para el tipo de membresía — ya son valores válidos. Se agregó `diamondCredits Int @default(0)` a `User` (junto a `premiumCredits`). Migración additive: `20260811120000_add_diamond_membership_and_credits`.
- CP2: `plan-limits.ts` — PREMIUM pierde `live`/`maxLivePhotos`, se agregó tier DIAMOND (mismos límites que Premium + LIVE), ENTERPRISE queda igual (ya tenía todo ilimitado/habilitado).
  - `invitation.planTier` (no `user.planTier`) es lo que determina si una invitación puntual tiene LIVE habilitado (`canUseFeature` en `api/live/session/route.ts`). Antes, toda invitación creada con crédito o plan ilimitado quedaba en `'PREMIUM'` a nivel invitación; se corrigió `api/invitations/route.ts` para que las cuentas con plan ilimitado (Diamond/Enterprise/Admin) hereden su propio tier en la invitación — si no, ninguna invitación de un usuario Diamond hubiera tenido LIVE nunca.
  - Bug encontrado y corregido de paso: `QuickEditPrice.tsx` (precio niño) y `GuestManager.tsx` (tipo de invitado Familia/Grupo) bloqueaban la feature con `planTier !== 'PREMIUM'` en vez de `=== 'FREE'` — con Diamond en juego eso hubiera bloqueado esas features justo a los usuarios Diamond. Corregido a `=== 'FREE'`.
  - Nota pendiente (fuera de los 10 checkpoints, no implementado): no existe todavía un flujo de UI para "gastar 1 crédito diamond" al crear una invitación (equivalente a `usePremiumCredit`). Los créditos diamond se otorgan (registro/admin) y se muestran (CP7), pero consumirlos al crear una invitación puntual no está pedido en el plan — si se necesita, es checkpoint nuevo.
  - Se actualizaron también los selectores de plan en `CreateUserButton.tsx` y `AdminPlanSelect.tsx` (agregado DIAMOND) para que sigan siendo consistentes, aunque el rediseño completo de gestión de membresías es CP6.
- CP3/CP4: `Pricing.tsx` reescrito con 4 cards (Gratis/Premium/Diamond/Enterprise) usando `PLAN_LIMITS` como fuente de verdad; precio Diamond calculado como 20% off del precio real (`PLAN_LIMITS.DIAMOND.price`). Enterprise sin precio fijo, CTA "Consultar" a WhatsApp, sin link a /register. `LandingNav.tsx`: agregado "Contacto" → WhatsApp (`target=_blank`) al array `BASE_LINKS`, se refleja automáticamente en desktop nav y drawer mobile porque ambos renderizan del mismo array.
- CP5: `register/page.tsx` reescrito como flujo de 2 pasos (antes era grid 2 columnas fijo: cards + form juntos). Paso 1: 3 cards (Free/Premium/Diamond) con selección por click, borde+ring dorado (`--accent`) en la seleccionada, Diamond con badge "Recomendado" y preseleccionada por default salvo que `?plan=free|premium|diamond` diga lo contrario. Paso 2: resumen del plan elegido arriba del form, botón "Crear cuenta" (se sacó la mención a pago/Mercado Pago que tenía antes: "Pagar $X y Registrarme"). El campo `planTier` que se manda a `/api/auth/register` ahora acepta "DIAMOND" (ya soportado desde CP2).
