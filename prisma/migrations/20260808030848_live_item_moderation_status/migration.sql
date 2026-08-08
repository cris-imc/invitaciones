-- AlterTable
ALTER TABLE "LiveItem" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "LiveItem" ADD COLUMN "rejectedAt" DATETIME;

-- Backfill: los items que ya estaban ocultos (isActive=false) no tienen forma
-- de distinguir "pendiente sin revisar" de "rechazado", asi que quedan como
-- PENDING (el valor neutral) en vez de asumir que fueron rechazados.
UPDATE "LiveItem" SET "status" = 'PENDING' WHERE "isActive" = false;

-- CreateIndex
CREATE INDEX "LiveItem_sessionId_status_createdAt_idx" ON "LiveItem"("sessionId", "status", "createdAt" DESC);
