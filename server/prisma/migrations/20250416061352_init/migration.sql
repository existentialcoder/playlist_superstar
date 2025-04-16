/*
  Warnings:

  - You are about to drop the column `roomId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `playlistId` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Client` DROP FOREIGN KEY `Client_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `Song` DROP FOREIGN KEY `Song_roomId_fkey`;

-- DropIndex
DROP INDEX `Client_roomId_fkey` ON `Client`;

-- DropIndex
DROP INDEX `Song_roomId_fkey` ON `Song`;

-- AlterTable
ALTER TABLE `Client` DROP COLUMN `roomId`;

-- AlterTable
ALTER TABLE `Song` DROP COLUMN `roomId`,
    DROP COLUMN `url`,
    ADD COLUMN `playlistId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Room`;

-- CreateTable
CREATE TABLE `Playlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Playlist_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlaylistToClient` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PlaylistToClient_AB_unique`(`A`, `B`),
    INDEX `_PlaylistToClient_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Song` ADD CONSTRAINT `Song_playlistId_fkey` FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlaylistToClient` ADD CONSTRAINT `_PlaylistToClient_A_fkey` FOREIGN KEY (`A`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlaylistToClient` ADD CONSTRAINT `_PlaylistToClient_B_fkey` FOREIGN KEY (`B`) REFERENCES `Playlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
