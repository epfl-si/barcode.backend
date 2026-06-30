/*
  Warnings:

  - A unique constraint covering the columns `[rmm_name]` on the table `room_type` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "room_type" ADD COLUMN     "rmm_name" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "room_type_rmm_name_key" ON "room_type"("rmm_name");

UPDATE room_type set rmm_name='LAB' where symbol='LABO';
UPDATE room_type set rmm_name='RECEIVING LOCATION' where symbol='RCVLC';
UPDATE room_type set rmm_name='STOCKROOM' where symbol='STKRM';
UPDATE room_type set rmm_name='STORAGE ROOM' where symbol='STRRM';
