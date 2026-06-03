/*
  Warnings:

  - Added the required column `rmmStatus` to the `boxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rmmStatus` to the `shelves` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rmmStatus` to the `storages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "rmm_code_status" AS ENUM ('Created', 'Deleted', 'DeleteNotifSent', 'RestoreNotifSent', 'ToBeCreated', 'ToBeDeleted');

-- AlterTable
ALTER TABLE "boxes" ADD COLUMN     "rmmStatus" "rmm_code_status" NOT NULL;

-- AlterTable
ALTER TABLE "shelves" ADD COLUMN     "rmmStatus" "rmm_code_status" NOT NULL;

-- AlterTable
ALTER TABLE "storages" ADD COLUMN     "rmmStatus" "rmm_code_status" NOT NULL;
