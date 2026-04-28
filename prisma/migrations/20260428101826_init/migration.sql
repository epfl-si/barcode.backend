-- CreateTable
CREATE TABLE "room_type" (
    "id_room_type" SERIAL NOT NULL,
    "room_type_name" VARCHAR(64) NOT NULL,

    CONSTRAINT "room_type_pkey" PRIMARY KEY ("id_room_type")
);

-- CreateTable
CREATE TABLE "product_type" (
    "id_product_type" SERIAL NOT NULL,
    "product_type_name" VARCHAR(64) NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id_product_type")
);

-- CreateTable
CREATE TABLE "storage_type" (
    "id_storage_type" SERIAL NOT NULL,
    "storage_type_name" VARCHAR(64) NOT NULL,

    CONSTRAINT "storage_type_pkey" PRIMARY KEY ("id_storage_type")
);

-- CreateTable
CREATE TABLE "storage_subtype" (
    "id_storage_subtype" SERIAL NOT NULL,
    "storage_subtype_name" VARCHAR(64) NOT NULL,

    CONSTRAINT "storage_subtype_pkey" PRIMARY KEY ("id_storage_subtype")
);

-- CreateTable
CREATE TABLE "allowed_type_values" (
    "id_room_type" INTEGER NOT NULL,
    "id_product_type" INTEGER NOT NULL,
    "id_storage_type" INTEGER NOT NULL,
    "id_storage_subtype" INTEGER NOT NULL,

    CONSTRAINT "allowed_type_values_pkey" PRIMARY KEY ("id_room_type","id_product_type","id_storage_type","id_storage_subtype")
);

-- CreateTable
CREATE TABLE "storages" (
    "id_storage" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "lab_display" VARCHAR(32) NOT NULL,
    "id_room_type" INTEGER NOT NULL,
    "id_product_type" INTEGER NOT NULL,
    "id_storage_type" INTEGER NOT NULL,
    "id_storage_subtype" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id_storage")
);

-- CreateTable
CREATE TABLE "shelves" (
    "id_shelf" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "id_storage" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id_shelf")
);

-- CreateTable
CREATE TABLE "boxes" (
    "id_box" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "id_shelf" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "boxes_pkey" PRIMARY KEY ("id_box")
);

-- CreateTable
CREATE TABLE "mutation_log" (
    "id_mutation_log" SERIAL NOT NULL,
    "modified_by" TEXT NOT NULL,
    "modified_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "table_name" VARCHAR(32) NOT NULL,
    "table_id" INTEGER NOT NULL,
    "column_name" VARCHAR(32),
    "old_value" TEXT NOT NULL,
    "new_value" TEXT NOT NULL,
    "action" VARCHAR(32) NOT NULL,

    CONSTRAINT "mutation_log_pkey" PRIMARY KEY ("id_mutation_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_type_room_type_name_key" ON "room_type"("room_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_product_type_name_key" ON "product_type"("product_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_type_storage_type_name_key" ON "storage_type"("storage_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_subtype_storage_subtype_name_key" ON "storage_subtype"("storage_subtype_name");

-- CreateIndex
CREATE UNIQUE INDEX "storages_barcode_key" ON "storages"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "shelves_barcode_key" ON "shelves"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_barcode_key" ON "boxes"("barcode");

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_room_type_fkey" FOREIGN KEY ("id_room_type") REFERENCES "room_type"("id_room_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_product_type_fkey" FOREIGN KEY ("id_product_type") REFERENCES "product_type"("id_product_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id_storage_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowed_type_values" ADD CONSTRAINT "allowed_type_values_id_storage_subtype_fkey" FOREIGN KEY ("id_storage_subtype") REFERENCES "storage_subtype"("id_storage_subtype") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_room_type_fkey" FOREIGN KEY ("id_room_type") REFERENCES "room_type"("id_room_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_product_type_fkey" FOREIGN KEY ("id_product_type") REFERENCES "product_type"("id_product_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id_storage_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storages" ADD CONSTRAINT "storages_id_storage_subtype_fkey" FOREIGN KEY ("id_storage_subtype") REFERENCES "storage_subtype"("id_storage_subtype") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_id_storage_fkey" FOREIGN KEY ("id_storage") REFERENCES "storages"("id_storage") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_id_shelf_fkey" FOREIGN KEY ("id_shelf") REFERENCES "shelves"("id_shelf") ON DELETE RESTRICT ON UPDATE CASCADE;
