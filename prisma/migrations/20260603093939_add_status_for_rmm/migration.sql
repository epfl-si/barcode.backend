/*
  Warnings:

  - Added the required column `rmm_status` to the `boxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rmm_status` to the `shelves` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rmm_status` to the `storages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "rmm_code_status" AS ENUM ('Created', 'Deleted', 'DeleteNotifSent', 'ToBeCreated', 'ToBeDeleted');

-- AlterTable
ALTER TABLE "boxes" ADD COLUMN     "rmm_status" "rmm_code_status" NOT NULL;

-- AlterTable
ALTER TABLE "shelves" ADD COLUMN     "rmm_status" "rmm_code_status" NOT NULL;

-- AlterTable
ALTER TABLE "storages" ADD COLUMN     "rmm_status" "rmm_code_status" NOT NULL;
