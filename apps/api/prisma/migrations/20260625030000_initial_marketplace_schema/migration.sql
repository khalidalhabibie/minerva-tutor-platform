-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARENT', 'TUTOR');

-- CreateEnum
CREATE TYPE "TuitionCaseStatus" AS ENUM ('OPEN', 'MATCHED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "experiences" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuitionCase" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budgetPerHour" DECIMAL(10,2) NOT NULL,
    "status" "TuitionCaseStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TuitionCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseInvitation" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CaseInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "caseId" TEXT,
    "tutorProfileId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Document_exactly_one_owner_check" CHECK (
        ("caseId" IS NOT NULL AND "tutorProfileId" IS NULL)
        OR ("caseId" IS NULL AND "tutorProfileId" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- CreateIndex
CREATE INDEX "TutorProfile_displayName_idx" ON "TutorProfile"("displayName");

-- CreateIndex
CREATE INDEX "TutorProfile_createdAt_idx" ON "TutorProfile"("createdAt");

-- CreateIndex
CREATE INDEX "TuitionCase_ownerId_createdAt_idx" ON "TuitionCase"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "TuitionCase_status_createdAt_idx" ON "TuitionCase"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TuitionCase_subject_level_idx" ON "TuitionCase"("subject", "level");

-- CreateIndex
CREATE INDEX "TuitionCase_location_idx" ON "TuitionCase"("location");

-- CreateIndex
CREATE UNIQUE INDEX "CaseInvitation_caseId_tutorId_key" ON "CaseInvitation"("caseId", "tutorId");

-- CreateIndex
CREATE INDEX "CaseInvitation_caseId_revokedAt_idx" ON "CaseInvitation"("caseId", "revokedAt");

-- CreateIndex
CREATE INDEX "CaseInvitation_tutorId_revokedAt_createdAt_idx" ON "CaseInvitation"("tutorId", "revokedAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_caseId_createdAt_idx" ON "Document"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_tutorProfileId_createdAt_idx" ON "Document"("tutorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_uploadedById_createdAt_idx" ON "Document"("uploadedById", "createdAt");

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionCase" ADD CONSTRAINT "TuitionCase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseInvitation" ADD CONSTRAINT "CaseInvitation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TuitionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseInvitation" ADD CONSTRAINT "CaseInvitation_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TuitionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
