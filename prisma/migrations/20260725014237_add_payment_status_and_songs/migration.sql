-- CreateTable
CREATE TABLE "SongSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "guestId" TEXT,
    "guestToken" TEXT,
    "guestName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SongSuggestion_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SongSuggestion_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "expectedCount" INTEGER NOT NULL DEFAULT 1,
    "uniqueToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attendingCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "responseDate" DATETIME,
    "dietaryRestrictions" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatusUpdatedAt" DATETIME,
    "paymentStatusUpdatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Guest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Guest" ("attendingCount", "createdAt", "expectedCount", "id", "invitationId", "message", "name", "responseDate", "status", "type", "uniqueToken", "updatedAt") SELECT "attendingCount", "createdAt", "expectedCount", "id", "invitationId", "message", "name", "responseDate", "status", "type", "uniqueToken", "updatedAt" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
CREATE UNIQUE INDEX "Guest_uniqueToken_key" ON "Guest"("uniqueToken");
CREATE INDEX "Guest_invitationId_idx" ON "Guest"("invitationId");
CREATE INDEX "Guest_uniqueToken_idx" ON "Guest"("uniqueToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SongSuggestion_invitationId_idx" ON "SongSuggestion"("invitationId");

-- CreateIndex
CREATE INDEX "SongSuggestion_invitationId_status_idx" ON "SongSuggestion"("invitationId", "status");
