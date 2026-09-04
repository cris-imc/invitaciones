# Plan — Pagos parciales de tarjeta

**Rama:** `pagos-parciales` (creada desde `experimento-foto-storytelling`)
**Estado:** implementación completa y commiteada (`05afd21`), **sin probar end-to-end**
**Última revisión:** 2026-09-04

> ⚠️ **Si el panel no trae los invitados, reiniciá `next dev`.** El dev server cachea
> `@prisma/client` en memoria al arrancar. Si venía corriendo desde antes de que se
> agregaran `paidAmount` / `expectedAmount` al schema, el `select` de `GET /api/guests`
> tira error, la respuesta es un 500 y la lista queda vacía. No es un bug del código.

---

## El problema

`Guest.paymentStatus` solo tenía tres valores: `PENDING`, `EXEMPT`, `PAID`. Si una familia o
grupo debe $500.000 y entrega $150.000, no encaja en ninguno: marcarlo `PAID` miente sobre la
recaudación, dejarlo `PENDING` borra la plata que ya se recibió.

## La solución elegida

El dinero recibido pasa a ser el dato real (`Guest.paidAmount`) y **el estado se deriva de él**.
Nunca se guarda un estado que contradiga el monto. Se agrega un cuarto estado `PARTIAL`, que
nadie escribe a mano: sale del cálculo `paidAmount` vs `expectedAmount`.

`expectedAmount` se **congela** al confirmar el RSVP (o al tocar el pago por primera vez) para
que una suba posterior del precio de la tarjeta no reabra saldo sobre pagos ya cerrados.

Fuente única de verdad del cálculo: `src/lib/payments.ts`.

---

## ✅ Hecho

### Datos
- [x] `prisma/schema.prisma` — `Guest.paidAmount Float @default(0)` y `Guest.expectedAmount Float?`
- [x] `prisma/migrations/20260903120000_add_partial_card_payments/migration.sql` — columnas +
      backfill de `expectedAmount` (respetando precios de adolescente/niño) + `paidAmount` de
      los que ya estaban `PAID`

### Lógica compartida
- [x] `src/lib/payments.ts` (nuevo) — `derivePaymentStatus()`, `computeExpectedAmount()`,
      `resolveGuestPayment()`, `computeBalance()`, `resolveCardPrices()`, labels/colores,
      `formatARS()`. Incluye el fallback legacy: un invitado `PAID` con `paidAmount = 0`
      (schema aplicado con `db push`, sin backfill) se interpreta como pago completo.

### API
- [x] `GET /api/guests` — devuelve `paidAmount`, `expectedAmount`, `balance` y el estado ya
      resuelto por el servidor. El panel dejó de estimar precios por su cuenta.
- [x] `PATCH /api/guests/[id]/payment` — acepta `{ paidAmount: number }` (parcial) o
      `{ status }` (atajos de siempre); siempre escribe monto y deriva estado.
- [x] `PUT /api/guests/[id]` — al editar un invitado confirmado recalcula `expectedAmount` y
      re-deriva el estado (cambiar la cantidad de personas puede cerrar o reabrir un parcial).
- [x] `POST /api/guests/[id]/confirm` — congela `expectedAmount` al confirmar el RSVP.

### Panel del anfitrión
- [x] `GuestListWithPayment.tsx` — cuarto botón **Parcial**, editor de monto inline por fila,
      atajos "pagaron N tarjetas", saldo visible por invitado, totales
      (Recaudado / Falta cobrar / Total tarjetas / N parciales), export Excel con columnas
      Total tarjeta / Abonado / Saldo.
- [x] `GuestStatsBar.tsx` — los parciales cuentan como pendientes + contador de parciales.
- [x] `dashboard/page.tsx` — idem en las stats globales.
- [x] El campo de monto acepta **solo dígitos y separadores**: las letras y símbolos ya no se
      pueden tipear (antes entraban y recién se rechazaban al guardar).
- [x] Confirmación antes de borrar un monto ya registrado (ver punto 5).

### Invitación del invitado
- [x] `RSVPWizardV2.tsx` — prop `initialPaidAmount`, título "Pago registrado en parte" y
      líneas "Ya registramos $X / Saldo pendiente $Y".
- [x] 184 plantillas — leen `guest.paidAmount` y lo pasan al wizard.
- [x] `src/app/invite/[slug]/[token]/page.tsx` — el `select` del guest ahora pide
      `paidAmount` y `expectedAmount`. Sin esto llegaban `undefined` a las plantillas y el
      invitado **nunca veía su saldo**: era el eslabón que dejaba muerto todo el trabajo del
      wizard y de las 184 plantillas.

### Verificado
- [x] `npx tsc --noEmit` pasa sin errores.
- [x] Las columnas `paidAmount` / `expectedAmount` **existen** en `prisma/dev.db`.
- [x] Commiteado en `05afd21` — solo los 197 archivos de pagos, sin arrastrar los borrados
      de `mockup/` ni `public/uploads/` que estaban sueltos en el working tree.

---

## ❌ Falta

### 1. Estrategia de despliegue de la migración
`prisma migrate status` reporta **4 migraciones sin aplicar**, incluida la de pagos parciales
(las otras 3 son de Diamond/teléfono, previas a este trabajo). Las columnas existen en
`dev.db`, o sea que en algún momento se usó `db push` en vez de `migrate`.

- [ ] Decidir: ¿producción usa `db push` o `migrate deploy`?
- [ ] Si usa `db push`, el backfill de la migración **no corre**: confirmar que el fallback
      legacy de `resolveGuestPayment()` cubre a todos los clientes que ya cobraron
- [ ] Si usa `migrate deploy`, resolver primero las 3 migraciones atrasadas

### 2. Probar en la app real (nada se probó todavía)
- [ ] Cargar un parcial desde el panel y ver que queda `PARTIAL` con el saldo correcto
- [ ] Abrir la invitación de ese invitado y ver "Ya registramos / Saldo pendiente"
- [ ] Completar el saldo → pasa a `PAID` solo
- [ ] Familia con precios diferenciados (adulto/adolescente/niño): que el total cierre
- [ ] Editar la cantidad de personas de una familia con parcial cargado
- [ ] Marcar y desmarcar exento sobre un invitado con parcial
- [ ] Export a Excel con las columnas nuevas
- [ ] Invitación **sin** precio de tarjeta cargado: el botón Parcial debe estar deshabilitado

### 3. Colección Storytelling sin pago de tarjeta
177 plantillas usan `RSVPWizardV2` pero **no pasan `initialPaymentStatus`** (ni el viejo).
No es una regresión de este trabajo, pero hay que decidirlo.

- [ ] Confirmar si esas plantillas deben soportar pago de tarjeta
- [ ] Si sí: cablear `initialPaymentStatus` + `initialPaidAmount` en las 177

### 4. Deuda menor
- [ ] `PaymentBadge.tsx` — su tipo sigue siendo `"PENDING" | "EXEMPT" | "PAID"`, no conoce
      `PARTIAL`. Hoy está **importado pero nunca renderizado** en las plantillas, así que no
      rompe nada; si se reactiva mostraría el total sin descontar lo abonado.
- [ ] `GuestListWithPayment` sigue recibiendo el prop `paymentAmount` que ya no usa —
      limpiarlo acá y en `GuestPageTabs`.

### 5. Casos de borde
- [x] **Borrado accidental del monto**: pasar a "No pago" o "Exento" deja el monto en cero (es
      coherente con el modelo: son estados sin plata). Pero un clic al pasar borraba en
      silencio lo que la familia ya había entregado, sin deshacer. Ahora, **solo si hay monto
      registrado**, la fila pide confirmación diciendo cuánto se va a borrar.
- [ ] Mismo problema en `PUT /api/guests/[id]`: tildar "exento" al **editar** un invitado desde
      `GuestManager` sigue poniendo `paidAmount = 0` sin avisar. Falta el mismo guardarraíl ahí.
- [ ] **Sobrepago**: el panel lo bloquea con un error, pero la API lo acepta. Unificar.
- [ ] **Historial de pagos**: hoy solo hay un monto acumulado, no un registro de cada entrega
      ("el 3/9 trajeron $150.000"). Decidir si alcanza así. Resolvería también el caso de
      arriba: con historial, quitar la exención podría devolver lo que se había pagado.

### 6. Higiene de la rama
- [ ] `prisma/dev.db` quedó modificado y **fuera del commit** a propósito (es la base local).
- [ ] En el working tree siguen sueltos los borrados de `mockup/` y `public/uploads/` que
      vienen de otras ramas. No son de este trabajo: decidir aparte qué hacer con ellos.

---

## Archivos que tocó este trabajo

| Archivo | Qué |
|---|---|
| `src/lib/payments.ts` | **nuevo** — toda la lógica |
| `prisma/schema.prisma` | 2 campos nuevos en `Guest` |
| `prisma/migrations/20260903120000_add_partial_card_payments/` | **nuevo** |
| `src/app/api/guests/route.ts` | GET devuelve montos resueltos |
| `src/app/api/guests/[id]/payment/route.ts` | acepta monto, deriva estado |
| `src/app/api/guests/[id]/route.ts` | recalcula al editar |
| `src/app/api/guests/[id]/confirm/route.ts` | congela expected al confirmar |
| `src/components/dashboard/GuestListWithPayment.tsx` | UI del anfitrión |
| `src/components/dashboard/GuestStatsBar.tsx` | stats |
| `src/app/dashboard/page.tsx` | stats globales |
| `src/components/invitation/v2/RSVPWizardV2.tsx` | saldo del invitado |
| `src/components/templates/*.tsx` (184) | pasan `initialPaidAmount` |
| `src/app/invite/[slug]/[token]/page.tsx` | select del guest con los montos |
