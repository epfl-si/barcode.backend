-- CreateTable
CREATE TABLE `stoPlace_catalyse` (
    `id_stoPlace` INTEGER NOT NULL AUTO_INCREMENT,
    `stoPlace` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id_stoPlace`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stoProperty_catalyse` (
    `id_stoProperty` INTEGER NOT NULL AUTO_INCREMENT,
    `stoProperty` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_stoProperty`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stoType_catalyse` (
    `id_stoType` INTEGER NOT NULL AUTO_INCREMENT,
    `stoType` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id_stoType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storage_catalyse` (
    `id_storage` INTEGER NOT NULL AUTO_INCREMENT,
    `id_stoType` INTEGER NOT NULL,
    `id_stoProperty` INTEGER NOT NULL,
    `id_stoPlace` INTEGER NOT NULL,
    `content` CHAR(2) NOT NULL,
    `barcode` VARCHAR(80) NOT NULL,
    `lab_display` VARCHAR(20) NOT NULL,
    `sciper` INTEGER NOT NULL,
    `author` VARCHAR(50) NOT NULL,
    `date` DATETIME(0) NOT NULL,

    UNIQUE INDEX `barcode`(`barcode`),
    INDEX `id_stoPlace`(`id_stoPlace`),
    INDEX `id_stoProperty`(`id_stoProperty`),
    INDEX `id_stoType`(`id_stoType`),
    UNIQUE INDEX `unique_barcode`(`barcode`, `lab_display`),
    PRIMARY KEY (`id_storage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_storage_catalyse` (
    `id_sub_storage` INTEGER NOT NULL AUTO_INCREMENT,
    `id_storage` INTEGER NOT NULL,
    `sub_storage_barcode` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `sub_storage_barcode`(`sub_storage_barcode`),
    UNIQUE INDEX `unique_sub_storage_barcode`(`id_storage`, `sub_storage_barcode`),
    PRIMARY KEY (`id_sub_storage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

