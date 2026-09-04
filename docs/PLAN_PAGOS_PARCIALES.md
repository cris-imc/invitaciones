# Plan — Pagos parciales de tarjeta

**Rama:** `pagos-parciales` — pusheada, y `templates-storytelling` fast-forwardeada al mismo
commit. **`main` NO tiene nada de esto todavía**, a propósito: se mergea cuando los pagos
estén probados (mergear ahora arrastraría también los 40 commits de la Colección Storytelling
que main no tiene — 47 commits y 438 archivos en total).
**Estado:** implementación completa, **sin probar end-to-end**
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

### Qué se congela: el precio, y cupo por cupo

Al quedar paga la tarjeta se guarda en `Guest.paidPrices` una foto del momento: los **precios**
vigentes y **cuántos cupos** cubrió ese pago (JSON `{adult,teen,child,adults,teens,children}`).
El total se recalcula siempre contra las cantidades actuales.

El congelamiento se aplica **por cupo**, no a la invitación entera:

- los lugares **ya pagos** mantienen su precio → una suba no les cobra diferencia;
- los lugares que se **suman después** van al precio vigente → ese lugar nunca se pagó;
- si se **restan** lugares, se cobra menos y lo entregado de más queda a favor (solo visible
  en el panel del anfitrión, nunca en la invitación).

Sobre los cupos ya pagos se cobra el menor entre el precio congelado y el vigente, así una
**baja** de precio se traslada igual.

Verificado con `resolveGuestPayment()` — pagó 2 cupos a $100.000 y la tarjeta sube a $150.000:

| Situación | Tarjeta | Debe |
|---|---|---|
| Sigue con 2 | $200.000 | $0 |
| Suma 1 | $350.000 | $150.000 (el cupo nuevo al precio de hoy) |
| Suma 2 | $500.000 | $300.000 |
| Si en cambio el precio baja a $60.000 | $120.000 | $0 |

Dos intentos previos fallaron y quedan como advertencia: congelar el **total** absorbía también
los cambios de asistentes (quien pagaba y sumaba gente seguía debiendo $0), y congelar solo los
**precios sin los cupos** cobraba las personas nuevas al precio viejo.

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
- [ ] Confirmación al borrar un monto: en la lista de pagos y al tildar "exento" desde
      `GuestManager`; que **Cancelar** no guarde nada
- [ ] Intentar cargar un monto mayor al total: tiene que rechazarlo con el mensaje del servidor
- [ ] Una plantilla de **Storytelling** con pago parcial: la fila tiene que decir SALDO, y
      ABONADO cuando esté pago

### ~~3. Colección Storytelling~~ — resuelta
Las 177 plantillas de Storytelling **no usan `RSVPWizardV2`** (solo lo nombran en un
comentario): cada familia tiene su propia tarjeta de RSVP. Esa tarjeta sí mostraba el pago,
pero solo miraba `isExempt`: nunca el estado de pago del invitado. Un invitado que ya había
pagado seguía viendo "VALOR: $total", como si no hubiera pagado nada — un bug anterior a los
pagos parciales.

- [x] La tarjeta recibe `paymentStatus` y `paidAmount`, y la fila de pago pasa de mostrar
      siempre "VALOR" a distinguir tres casos:
      - **VALOR** — el total, cuando no hay nada abonado (como antes)
      - **SALDO** — lo que falta, más "Ya registramos $X de $Y", con un pago parcial
      - **ABONADO** — el total, más "Pago registrado ✓", cuando está pago
- [x] Aplicado a las 177 con un script (el markup solo difiere en el prefijo de clase:
      `acp`, `gpv`, `prc`, ...). Las 177 coincidieron con los 5 puntos de anclaje, ninguna
      falló ni quedó a medias.

### ~~4. Deuda menor~~ — resuelta
- [x] `PaymentBadge.tsx` ahora conoce `PARTIAL` y acepta `paidAmount`: muestra el saldo en vez
      del total, para que el invitado no vuelva a transferir todo. (Sigue importado pero no
      renderizado en las plantillas; queda correcto para cuando se use.)
- [x] Eliminado el prop `paymentAmount` de `GuestListWithPayment`, que no se usaba.

### ~~5. Casos de borde~~ — resueltos
- [x] **Borrado accidental del monto**: pasar a "No pago" o "Exento" deja el monto en cero (es
      coherente con el modelo: son estados sin plata). Pero un clic al pasar borraba en
      silencio lo que la familia ya había entregado, sin deshacer.

      El guardarraíl quedó en la **API**, no en cada panel: `PATCH .../payment` y
      `PUT /api/guests/[id]` responden **409** con `PAYMENT_CLEAR_CODE` cuando el cambio
      pondría en cero un monto registrado, y solo lo aplican si el cliente reintenta con
      `confirmClearPayment: true`. Así queda cubierta cualquier pantalla, no solo la lista.
      - Lista de pagos: confirmación inline en la fila, con el monto que se va a borrar.
      - `GuestManager` (editar invitado → tildar "exento"): diálogo de confirmación.
      - Tipear un `0` en el editor de monto **no** pide confirmación: es un acto deliberado,
        no un clic al pasar.
- [x] **Sobrepago**: la regla ahora vive en la API (`400` si el monto supera el total), no solo
      en el panel. Sin precio cargado (`expectedAmount = 0`) no se valida, porque no hay total
      contra el cual medir. El panel muestra el mensaje que devuelve el servidor.
- [x] **Historial de pagos**: **descartado** por decisión del usuario (2026-09-04) — complejiza
      todo para el valor que aporta. Se queda el monto acumulado único.

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
