-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "userType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_tokens_email_type_idx" ON "verification_tokens"("email", "type");

-- CreateIndex
CREATE INDEX "verification_tokens_code_type_idx" ON "verification_tokens"("code", "type");
