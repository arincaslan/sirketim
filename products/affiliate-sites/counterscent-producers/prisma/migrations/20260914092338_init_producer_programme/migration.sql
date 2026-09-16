-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PADDLE', 'IYZICO', 'PAYTR');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "PublishState" AS ENUM ('DRAFT', 'PENDING', 'LIVE', 'WITHDRAWN_BY_PRODUCER', 'REMOVED_BY_EDITOR');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('PRODUCER', 'STAFF', 'FOUNDER', 'AUTOMATION');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DECLARED', 'VERIFIED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "PyramidSource" AS ENUM ('DECLARED', 'IMPUTED');

-- CreateTable
CREATE TABLE "Producer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    "isHouse" BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerCustomerId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT,
    "providerPriceId" TEXT,
    "interval" "BillingInterval" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "tier" TEXT NOT NULL DEFAULT 'free',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "referenceSlug" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "concentration" TEXT NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "bottleMl" INTEGER NOT NULL,
    "family" TEXT NOT NULL,
    "notesTop" TEXT[],
    "notesHeart" TEXT[],
    "notesBase" TEXT[],
    "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pyramidSource" "PyramidSource" NOT NULL DEFAULT 'DECLARED',
    "facetFreshness" DOUBLE PRECISION NOT NULL,
    "facetSweetness" DOUBLE PRECISION NOT NULL,
    "facetWarmth" DOUBLE PRECISION NOT NULL,
    "facetWoodyDepth" DOUBLE PRECISION NOT NULL,
    "facetLongevity" DOUBLE PRECISION NOT NULL,
    "facetSillage" DOUBLE PRECISION NOT NULL,
    "longevityHoursMin" INTEGER NOT NULL,
    "longevityHoursMax" INTEGER NOT NULL,
    "sillageLabel" TEXT NOT NULL,
    "declaredDifferences" TEXT NOT NULL,
    "verdict" TEXT,
    "pairingSource" TEXT,
    "pairingQuote" TEXT,
    "pairingUrl" TEXT,
    "storeUrl" TEXT NOT NULL,
    "affiliateLinkId" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "publishState" "PublishState" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "removedAt" TIMESTAMP(3),
    "removedReason" TEXT,
    "scoreAtRemoval" INTEGER,
    "founderOverrideScore" INTEGER,
    "founderOverrideNote" TEXT,
    "founderOverrideDate" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastPublishedAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionRevision" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "message" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "SubmissionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "channel" TEXT,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "tierAtEvent" TEXT,
    "statusAtEvent" TEXT,
    "rawScore" INTEGER,
    "publishedScore" INTEGER,
    "codeVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT,
    "producerIdAtClick" TEXT,
    "submissionSlugAtClick" TEXT,
    "referenceSlug" TEXT,
    "linkId" TEXT NOT NULL,
    "subId" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "producerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Producer_slug_key" ON "Producer"("slug");

-- CreateIndex
CREATE INDEX "Producer_slug_idx" ON "Producer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_producerId_key" ON "Subscription"("producerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerCustomerId_key" ON "Subscription"("providerCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key" ON "Subscription"("providerSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Submission_producerId_approvalStatus_idx" ON "Submission"("producerId", "approvalStatus");

-- CreateIndex
CREATE INDEX "Submission_referenceSlug_approvalStatus_idx" ON "Submission"("referenceSlug", "approvalStatus");

-- CreateIndex
CREATE INDEX "Submission_publishState_idx" ON "Submission"("publishState");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_producerId_slug_key" ON "Submission"("producerId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_producerId_referenceSlug_key" ON "Submission"("producerId", "referenceSlug");

-- CreateIndex
CREATE INDEX "SubmissionRevision_submissionId_status_idx" ON "SubmissionRevision"("submissionId", "status");

-- CreateIndex
CREATE INDEX "SubmissionRevision_status_requestedAt_idx" ON "SubmissionRevision"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_submissionId_createdAt_idx" ON "AuditEvent"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_producerId_createdAt_idx" ON "AuditEvent"("producerId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_action_createdAt_idx" ON "AuditEvent"("action", "createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_submissionId_createdAt_idx" ON "ClickEvent"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_subId_idx" ON "ClickEvent"("subId");

-- CreateIndex
CREATE INDEX "ClickEvent_producerIdAtClick_createdAt_idx" ON "ClickEvent"("producerIdAtClick", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionRevision" ADD CONSTRAINT "SubmissionRevision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
