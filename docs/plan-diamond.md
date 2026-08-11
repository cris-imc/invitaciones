# Plan DIAMOND
## Estado: En progreso
## Rama: DIAMOND

### Checkpoints
- [x] 1. Modelo de datos: membresías y créditos
- [ ] 2. Actualizar lógica de membresías (Free / Premium / Diamond / Enterprise)
- [ ] 3. Landing page: sección de precios actualizada
- [ ] 4. Landing page: opción Contacto → WhatsApp
- [ ] 5. Registro: rediseño de cards de membresía con UX mejorado
- [ ] 6. Panel admin: gestión de membresías y créditos por cliente
- [ ] 7. Panel cliente: créditos remanentes en pantalla de inicio
- [ ] 8. App mobile: botón Ayuda → WhatsApp en topbar
- [ ] 9. App desktop: opción Ayuda en sidebar
- [ ] 10. Revisión y checklist final

### Notas de avance
- CP1: `planTier` en `User`/`Invitation`/`Payment` ya es `String` (no enum), así que DIAMOND y ENTERPRISE no requieren cambio de schema para el tipo de membresía — ya son valores válidos. Se agregó `diamondCredits Int @default(0)` a `User` (junto a `premiumCredits`). Migración additive: `20260811120000_add_diamond_membership_and_credits`.
