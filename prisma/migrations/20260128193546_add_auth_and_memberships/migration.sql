/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "planTier" TEXT NOT NULL,
    "mercadoPagoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guest" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Guest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestToken" TEXT,
    "answers" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planTier" TEXT NOT NULL DEFAULT 'FREE',
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "slug" TEXT NOT NULL,
    "nombreEvento" TEXT NOT NULL,
    "fechaEvento" DATETIME NOT NULL,
    "nombreNovio" TEXT,
    "nombreNovia" TEXT,
    "nombreQuinceanera" TEXT,
    "lugarNombre" TEXT,
    "direccion" TEXT,
    "hora" TEXT,
    "mapUrl" TEXT,
    "templateId" TEXT NOT NULL,
    "templateTipo" TEXT NOT NULL DEFAULT 'ORIGINAL',
    "temaColores" TEXT NOT NULL,
    "imagenCelebremosJuntos" TEXT,
    "cronogramaEventos" TEXT,
    "musicaUrl" TEXT,
    "portadaHabilitada" BOOLEAN NOT NULL DEFAULT true,
    "portadaTitulo" TEXT,
    "portadaTextoBoton" TEXT,
    "portadaImagenFondo" TEXT,
    "portadaImagenPosX" INTEGER NOT NULL DEFAULT 50,
    "portadaImagenPosY" INTEGER NOT NULL DEFAULT 50,
    "portadaImagenEscala" INTEGER NOT NULL DEFAULT 100,
    "musicaHabilitada" BOOLEAN NOT NULL DEFAULT true,
    "musicaAutoplay" BOOLEAN NOT NULL DEFAULT true,
    "musicaLoop" BOOLEAN NOT NULL DEFAULT true,
    "contadorHabilitado" BOOLEAN NOT NULL DEFAULT true,
    "seccionCuandoHabilitada" BOOLEAN NOT NULL DEFAULT true,
    "seccionCuandoIcono" TEXT,
    "seccionCuandoTitulo" TEXT,
    "seccionDondeHabilitada" BOOLEAN NOT NULL DEFAULT true,
    "seccionDondeIcono" TEXT,
    "seccionDondeTitulo" TEXT,
    "lugarBotonTexto" TEXT,
    "dresscodeHabilitado" BOOLEAN NOT NULL DEFAULT false,
    "dresscodeIcono" TEXT,
    "dresscodeTitulo" TEXT,
    "dresscodeTipo" TEXT,
    "dresscodeObservaciones" TEXT,
    "galeriaPrincipalHabilitada" BOOLEAN NOT NULL DEFAULT true,
    "galeriaPrincipalFotos" TEXT,
    "galeriaPrincipalEstilo" TEXT,
    "galeriaPrincipalAutoplay" BOOLEAN NOT NULL DEFAULT false,
    "frasePersonalizadaHabilitada" BOOLEAN NOT NULL DEFAULT false,
    "frasePersonalizadaTexto" TEXT,
    "frasePersonalizadaEstilo" TEXT,
    "albumCompartidoHabilitado" BOOLEAN NOT NULL DEFAULT true,
    "albumCompartidoIcono" TEXT,
    "albumCompartidoTitulo" TEXT,
    "albumCompartidoDescripcion" TEXT,
    "albumCompartidoBotonTexto" TEXT,
    "regaloHabilitado" BOOLEAN NOT NULL DEFAULT false,
    "regaloIcono" TEXT,
    "regaloTitulo" TEXT,
    "regaloMensaje" TEXT,
    "regaloMostrarDatos" BOOLEAN NOT NULL DEFAULT false,
    "regaloAlias" TEXT,
    "regaloCvu" TEXT,
    "regaloCbu" TEXT,
    "regaloBanco" TEXT,
    "regaloTitular" TEXT,
    "galeriaSecundariaHabilitada" BOOLEAN NOT NULL DEFAULT false,
    "galeriaSecundariaFotos" TEXT,
    "mensajeFinalHabilitado" BOOLEAN NOT NULL DEFAULT false,
    "mensajeFinalTexto" TEXT,
    "triviaHabilitada" BOOLEAN NOT NULL DEFAULT false,
    "triviaIcono" TEXT,
    "triviaTitulo" TEXT,
    "triviaSubtitulo" TEXT,
    "triviaPreguntas" TEXT,
    "triviaBotonTexto" TEXT,
    "rsvpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rsvpType" TEXT DEFAULT 'INDIVIDUAL',
    "rsvpDeadline" DATETIME,
    "rsvpDaysBeforeEvent" INTEGER DEFAULT 7,
    "confirmacionHabilitada" BOOLEAN NOT NULL DEFAULT true,
    "confirmacionIcono" TEXT,
    "confirmacionTitulo" TEXT,
    "confirmacionFechaLimite" DATETIME,
    "confirmacionWhatsapp" TEXT,
    "confirmacionEmail" TEXT,
    "despedidaHabilitada" BOOLEAN NOT NULL DEFAULT false,
    "despedidaIcono" TEXT,
    "despedidaTexto" TEXT,
    "despedidaFoto" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invitation" ("albumCompartidoBotonTexto", "albumCompartidoDescripcion", "albumCompartidoHabilitado", "albumCompartidoIcono", "albumCompartidoTitulo", "confirmacionEmail", "confirmacionFechaLimite", "confirmacionHabilitada", "confirmacionIcono", "confirmacionTitulo", "confirmacionWhatsapp", "contadorHabilitado", "createdAt", "despedidaFoto", "despedidaHabilitada", "despedidaIcono", "despedidaTexto", "direccion", "dresscodeHabilitado", "dresscodeIcono", "dresscodeObservaciones", "dresscodeTipo", "dresscodeTitulo", "estado", "fechaEvento", "frasePersonalizadaEstilo", "frasePersonalizadaHabilitada", "frasePersonalizadaTexto", "galeriaPrincipalAutoplay", "galeriaPrincipalEstilo", "galeriaPrincipalFotos", "galeriaPrincipalHabilitada", "galeriaSecundariaFotos", "galeriaSecundariaHabilitada", "hora", "id", "lugarBotonTexto", "lugarNombre", "mapUrl", "mensajeFinalHabilitado", "mensajeFinalTexto", "musicaAutoplay", "musicaHabilitada", "musicaLoop", "musicaUrl", "nombreEvento", "nombreNovia", "nombreNovio", "nombreQuinceanera", "portadaHabilitada", "portadaImagenFondo", "portadaTextoBoton", "portadaTitulo", "regaloAlias", "regaloCbu", "regaloCvu", "regaloHabilitado", "regaloIcono", "regaloMensaje", "regaloMostrarDatos", "regaloTitulo", "seccionCuandoHabilitada", "seccionCuandoIcono", "seccionCuandoTitulo", "seccionDondeHabilitada", "seccionDondeIcono", "seccionDondeTitulo", "slug", "temaColores", "templateId", "tipo", "triviaBotonTexto", "triviaHabilitada", "triviaIcono", "triviaPreguntas", "triviaSubtitulo", "triviaTitulo", "updatedAt", "userId") SELECT "albumCompartidoBotonTexto", "albumCompartidoDescripcion", "albumCompartidoHabilitado", "albumCompartidoIcono", "albumCompartidoTitulo", "confirmacionEmail", "confirmacionFechaLimite", "confirmacionHabilitada", "confirmacionIcono", "confirmacionTitulo", "confirmacionWhatsapp", "contadorHabilitado", "createdAt", "despedidaFoto", "despedidaHabilitada", "despedidaIcono", "despedidaTexto", "direccion", "dresscodeHabilitado", "dresscodeIcono", "dresscodeObservaciones", "dresscodeTipo", "dresscodeTitulo", "estado", "fechaEvento", "frasePersonalizadaEstilo", "frasePersonalizadaHabilitada", "frasePersonalizadaTexto", "galeriaPrincipalAutoplay", "galeriaPrincipalEstilo", "galeriaPrincipalFotos", "galeriaPrincipalHabilitada", "galeriaSecundariaFotos", "galeriaSecundariaHabilitada", "hora", "id", "lugarBotonTexto", "lugarNombre", "mapUrl", "mensajeFinalHabilitado", "mensajeFinalTexto", "musicaAutoplay", "musicaHabilitada", "musicaLoop", "musicaUrl", "nombreEvento", "nombreNovia", "nombreNovio", "nombreQuinceanera", "portadaHabilitada", "portadaImagenFondo", "portadaTextoBoton", "portadaTitulo", "regaloAlias", "regaloCbu", "regaloCvu", "regaloHabilitado", "regaloIcono", "regaloMensaje", "regaloMostrarDatos", "regaloTitulo", "seccionCuandoHabilitada", "seccionCuandoIcono", "seccionCuandoTitulo", "seccionDondeHabilitada", "seccionDondeIcono", "seccionDondeTitulo", "slug", "temaColores", "templateId", "tipo", "triviaBotonTexto", "triviaHabilitada", "triviaIcono", "triviaPreguntas", "triviaSubtitulo", "triviaTitulo", "updatedAt", "userId" FROM "Invitation";
DROP TABLE "Invitation";
ALTER TABLE "new_Invitation" RENAME TO "Invitation";
CREATE UNIQUE INDEX "Invitation_slug_key" ON "Invitation"("slug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "planTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscriptionStartDate" DATETIME,
    "subscriptionEndDate" DATETIME,
    "mercadoPagoCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "role") SELECT "createdAt", "email", "id", "name", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_mercadoPagoCustomerId_key" ON "User"("mercadoPagoCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercadoPagoId_key" ON "Payment"("mercadoPagoId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_uniqueToken_key" ON "Guest"("uniqueToken");

-- CreateIndex
CREATE INDEX "QuizResponse_invitationId_idx" ON "QuizResponse"("invitationId");

-- CreateIndex
CREATE INDEX "QuizResponse_guestToken_idx" ON "QuizResponse"("guestToken");
