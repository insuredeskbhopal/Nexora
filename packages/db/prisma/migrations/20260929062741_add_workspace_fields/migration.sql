-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'FREE';
