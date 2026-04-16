-- CreateTable
CREATE TABLE `inventory` (
    `id_storage` INTEGER NOT NULL AUTO_INCREMENT,
    `barcode` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `barcode`(`barcode`),
    PRIMARY KEY (`id_storage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
