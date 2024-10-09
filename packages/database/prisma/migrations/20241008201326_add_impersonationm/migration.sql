-- CreateTable
CREATE TABLE "ImpersonationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "adminUserId" INTEGER NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpersonationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImpersonationToken_token_key" ON "ImpersonationToken"("token");

-- AddForeignKey
ALTER TABLE "ImpersonationToken" ADD CONSTRAINT "ImpersonationToken_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
