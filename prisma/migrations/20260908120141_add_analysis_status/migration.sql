-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "analysis_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "analysis_error" TEXT,
ADD COLUMN     "analysis_status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "leads_analysis_status_idx" ON "leads"("analysis_status");
