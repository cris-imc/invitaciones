-- AlterTable: pagos parciales de tarjeta por invitado (grupos/familias que
-- abonan una parte). paidAmount es el dinero recibido; expectedAmount se
-- congela al confirmar el RSVP.
ALTER TABLE "Guest" ADD COLUMN "paidAmount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Guest" ADD COLUMN "expectedAmount" REAL;

-- Backfill del monto esperado de los que ya confirmaron, con el precio vigente
-- de su invitacion (incluye precios diferenciados de adolescentes/ninos).
-- Mismo criterio que computeExpectedAmount() en src/lib/payments.ts: si el
-- invitado no tiene desglose por franja, se cobra attendingCount x precio adulto.
UPDATE "Guest"
SET "expectedAmount" = (
  SELECT
    CASE
      WHEN "Guest"."attendingAdults" + "Guest"."attendingTeens" + "Guest"."attendingChildren" > 0 THEN
        COALESCE("Invitation"."pagoTarjetaMonto", "Invitation"."regaloMonto", 0) * "Guest"."attendingAdults"
        + COALESCE("Invitation"."precioAdolescente", "Invitation"."pagoTarjetaMonto", "Invitation"."regaloMonto", 0) * "Guest"."attendingTeens"
        + COALESCE("Invitation"."precioNino", "Invitation"."pagoTarjetaMonto", "Invitation"."regaloMonto", 0) * "Guest"."attendingChildren"
      ELSE
        COALESCE("Invitation"."pagoTarjetaMonto", "Invitation"."regaloMonto", 0) * "Guest"."attendingCount"
    END
  FROM "Invitation" WHERE "Invitation"."id" = "Guest"."invitationId"
)
WHERE "Guest"."status" = 'CONFIRMED' AND "Guest"."isExempt" = 0;

-- Los que ya estaban marcados PAID quedan con su monto registrado, para que la
-- recaudacion (suma de paidAmount) no arranque en cero.
UPDATE "Guest" SET "paidAmount" = COALESCE("expectedAmount", 0) WHERE "paymentStatus" = 'PAID';
