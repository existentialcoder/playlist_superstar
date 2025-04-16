/*
  Warnings:

  - Added the required column `playlistName` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Room` ADD COLUMN `playlistName` VARCHAR(191) NOT NULL;
