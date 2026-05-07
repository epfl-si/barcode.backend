-- CreateTable
CREATE TABLE "room_type" (
    "id" SERIAL NOT NULL,
    "short_name" VARCHAR(3) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,

    CONSTRAINT "room_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_type" (
    "id" SERIAL NOT NULL,
    "short_name" VARCHAR(3) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_type" (
    "id" SERIAL NOT NULL,
    "short_name" VARCHAR(3) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,

    CONSTRAINT "storage_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_subtype" (
    "id" SERIAL NOT NULL,
    "short_name" VARCHAR(3) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,

    CONSTRAINT "storage_subtype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allowed_type_values" (
    "id_room_type" INTEGER NOT NULL,
    "id_product_type" INTEGER NOT NULL,
    "id_storage_type" INTEGER NOT NULL,
    "id_storage_subtype" INTEGER NOT NULL,
    "allows_shelves" BOOLEAN NOT NULL DEFAULT true,
    "allows_boxes" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "allowed_type_values_pkey" PRIMARY KEY ("id_room_type","id_product_type","id_storage_type","id_storage_subtype")
);

-- CreateTable
CREATE TABLE "storages" (
    "id" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "num_storage" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "room_display" VARCHAR(32) NOT NULL,
    "id_room_type" INTEGER NOT NULL,
    "id_product_type" INTEGER NOT NULL,
    "id_storage_type" INTEGER NOT NULL,
    "id_storage_subtype" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelves" (
    "id" SERIAL NOT NULL,
    "id_storage" INTEGER NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "num_shelf" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boxes" (
    "id" SERIAL NOT NULL,
    "id_shelf" INTEGER NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "num_box" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutation_log" (
    "id" SERIAL NOT NULL,
    "modified_by" TEXT NOT NULL,
    "modified_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "table_name" VARCHAR(32) NOT NULL,
    "table_id" INTEGER NOT NULL,
    "column_name" VARCHAR(32),
    "old_value" TEXT NOT NULL,
    "new_value" TEXT NOT NULL,
    "action" VARCHAR(32) NOT NULL,

    CONSTRAINT "mutation_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_type_short_name_key" ON "room_type"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "room_type_symbol_key" ON "room_type"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_short_name_key" ON "product_type"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_symbol_key" ON "product_type"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "storage_type_short_name_key" ON "storage_type"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_type_symbol_key" ON "storage_type"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "storage_subtype_short_name_key" ON "storage_subtype"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_subtype_symbol_key" ON "storage_subtype"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "storages_barcode_key" ON "storages"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "shelves_barcode_key" ON "shelves"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_barcode_key" ON "boxes"("barcode");

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_room_type_fkey" FOREIGN KEY ("id_room_type") REFERENCES "room_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_product_type_fkey" FOREIGN KEY ("id_product_type") REFERENCES "product_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_storage_subtype_fkey" FOREIGN KEY ("id_storage_subtype") REFERENCES "storage_subtype"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_room_type_fkey" FOREIGN KEY ("id_room_type") REFERENCES "room_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_product_type_fkey" FOREIGN KEY ("id_product_type") REFERENCES "product_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_storage_subtype_fkey" FOREIGN KEY ("id_storage_subtype") REFERENCES "storage_subtype"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_id_storage_fkey" FOREIGN KEY ("id_storage") REFERENCES "storages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_id_shelf_fkey" FOREIGN KEY ("id_shelf") REFERENCES "shelves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
