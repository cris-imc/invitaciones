-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN "infoAlojamientoHabilitado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Invitation" ADD COLUMN "infoAlojamientoTexto" TEXT;
ALTER TABLE "Invitation" ADD COLUMN "infoEstacionamientoHabilitado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Invitation" ADD COLUMN "infoEstacionamientoTexto" TEXT;
ALTER TABLE "Invitation" ADD COLUMN "infoTransporteHabilitado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Invitation" ADD COLUMN "infoTransporteTexto" TEXT;
ALTER TABLE "Invitation" ADD COLUMN "infoAdicionalHabilitado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Invitation" ADD COLUMN "infoAdicionalTexto" TEXT;
