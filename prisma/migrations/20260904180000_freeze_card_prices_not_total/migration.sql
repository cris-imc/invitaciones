-- Congelamiento del PRECIO de la tarjeta en lugar del total.
--
-- Congelar el total (Guest.expectedAmount) tambien absorbia los cambios de
-- asistentes: quien pagaba su tarjeta y despues sumaba gente seguia debiendo $0.
-- paidPrices guarda los precios vigentes al momento de quedar paga, como JSON
-- {adult,teen,child}, y el total se recalcula contra las cantidades actuales.
-- Ver resolveExpectedAmount() en src/lib/payments.ts.
ALTER TABLE "Guest" ADD COLUMN "paidPrices" TEXT;

-- Los que ya estaban pagos conservan el precio con el que quedaron pagos: se
-- reconstruye desde el total congelado dividido por las personas confirmadas.
-- Sin desglose por franja, todos pagan como adulto -- mismo criterio que
-- computeExpectedAmount().
UPDATE "Guest"
SET "paidPrices" = (
  SELECT '{"adult":' || CAST(
    "Guest"."expectedAmount" / CAST(
      CASE WHEN "Guest"."attendingCount" > 0 THEN "Guest"."attendingCount" ELSE 1 END AS REAL
    ) AS TEXT
  ) || '}'
)
WHERE "Guest"."paymentStatus" = 'PAID'
  AND "Guest"."expectedAmount" IS NOT NULL
  AND "Guest"."expectedAmount" > 0;
