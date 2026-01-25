-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "permitirSubida" BOOLEAN NOT NULL DEFAULT true,
    "moderacion" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Album_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Album" ("id", "invitationId", "moderacion", "permitirSubida") SELECT "id", "invitationId", "moderacion", "permitirSubida" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE UNIQUE INDEX "Album_invitationId_key" ON "Album"("invitationId");
CREATE TABLE "new_Cuestionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "preguntas" TEXT NOT NULL,
    CONSTRAINT "Cuestionario_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cuestionario" ("id", "invitationId", "preguntas", "titulo") SELECT "id", "invitationId", "preguntas", "titulo" FROM "Cuestionario";
DROP TABLE "Cuestionario";
ALTER TABLE "new_Cuestionario" RENAME TO "Cuestionario";
CREATE UNIQUE INDEX "Cuestionario_invitationId_key" ON "Cuestionario"("invitationId");
CREATE TABLE "new_Foto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "albumId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "aprobada" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Foto_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Foto" ("albumId", "aprobada", "createdAt", "descripcion", "id", "uploadedBy", "url") SELECT "albumId", "aprobada", "createdAt", "descripcion", "id", "uploadedBy", "url" FROM "Foto";
DROP TABLE "Foto";
ALTER TABLE "new_Foto" RENAME TO "Foto";
CREATE TABLE "new_RSVP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "asistencia" TEXT NOT NULL,
    "numeroAcompanantes" INTEGER NOT NULL DEFAULT 0,
    "restricciones" TEXT,
    "mensaje" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RSVP_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RSVP" ("asistencia", "createdAt", "email", "id", "invitationId", "mensaje", "nombre", "numeroAcompanantes", "restricciones", "telefono") SELECT "asistencia", "createdAt", "email", "id", "invitationId", "mensaje", "nombre", "numeroAcompanantes", "restricciones", "telefono" FROM "RSVP";
DROP TABLE "RSVP";
ALTER TABLE "new_RSVP" RENAME TO "RSVP";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
