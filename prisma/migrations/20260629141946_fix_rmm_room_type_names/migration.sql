/*
  Warnings:

  - Made the column `rmm_name` on table `room_type` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "room_type" ALTER COLUMN "rmm_name" SET NOT NULL;
