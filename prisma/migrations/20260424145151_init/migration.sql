-- CreateTable
CREATE TABLE "room_type" (
    "id_room_type" SERIAL NOT NULL,
    "room_type" VARCHAR(64) NOT NULL,

    CONSTRAINT "room_type_pkey" PRIMARY KEY ("id_room_type")
);

-- CreateTable
CREATE TABLE "product_type" (
    "id_product_type" SERIAL NOT NULL,
    "product_type" VARCHAR(64) NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id_product_type")
);

-- CreateTable
CREATE TABLE "storage_type" (
    "id_storage_type" SERIAL NOT NULL,
    "storage_type" VARCHAR(64) NOT NULL,

    CONSTRAINT "storage_type_pkey" PRIMARY KEY ("id_storage_type")
);

-- CreateTable
CREATE TABLE "storage_subtype" (
    "id_storage_subtype" SERIAL NOT NULL,
    "storage_subtype" VARCHAR(64) NOT NULL,

    CONSTRAINT "storage_subtype_pkey" PRIMARY KEY ("id_storage_subtype")
);

-- CreateTable
CREATE TABLE "product_and_storage" (
    "id_product_type" INTEGER NOT NULL,
    "id_storage_type" INTEGER NOT NULL,

    CONSTRAINT "product_and_storage_pkey" PRIMARY KEY ("id_product_type","id_storage_type")
);

-- CreateTable
CREATE TABLE "storage_and_storage_subtype" (
    "id_storage_type" INTEGER NOT NULL,
    "id_storage_subtype" INTEGER NOT NULL,

    CONSTRAINT "storage_and_storage_subtype_pkey" PRIMARY KEY ("id_storage_type","id_storage_subtype")
);

-- CreateTable
CREATE TABLE "locations" (
    "id_location" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "lab_display" VARCHAR(32) NOT NULL,
    "id_room_type" INTEGER NOT NULL,
    "id_product_type" INTEGER NOT NULL,
    "id_storage_type" INTEGER NOT NULL,
    "id_storage_subtype" INTEGER NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id_location")
);

-- CreateTable
CREATE TABLE "shelves" (
    "id_shelf" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "id_location" INTEGER NOT NULL,

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id_shelf")
);

-- CreateTable
CREATE TABLE "boxes" (
    "id_box" SERIAL NOT NULL,
    "barcode" VARCHAR(64) NOT NULL,
    "id_shelf" INTEGER NOT NULL,

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
CREATE UNIQUE INDEX "room_type_room_type_key" ON "room_type"("room_type");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_product_type_key" ON "product_type"("product_type");

-- CreateIndex
CREATE UNIQUE INDEX "storage_type_storage_type_key" ON "storage_type"("storage_type");

-- CreateIndex
CREATE UNIQUE INDEX "storage_subtype_storage_subtype_key" ON "storage_subtype"("storage_subtype");

-- CreateIndex
CREATE UNIQUE INDEX "locations_barcode_key" ON "locations"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "shelves_barcode_key" ON "shelves"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_barcode_key" ON "boxes"("barcode");

-- AddForeignKey
ALTER TABLE "product_and_storage" ADD CONSTRAINT "product_and_storage_id_product_type_fkey" FOREIGN KEY ("id_product_type") REFERENCES "product_type"("id_product_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_and_storage" ADD CONSTRAINT "product_and_storage_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id_storage_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_and_storage_subtype" ADD CONSTRAINT "storage_and_storage_subtype_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id_storage_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_and_storage_subtype" ADD CONSTRAINT "storage_and_storage_subtype_id_storage_subtype_fkey" FOREIGN KEY ("id_storage_subtype") REFERENCES "storage_subtype"("id_storage_subtype") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_id_room_type_fkey" FOREIGN KEY ("id_room_type") REFERENCES "room_type"("id_room_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_id_product_type_fkey" FOREIGN KEY ("id_product_type") REFERENCES "product_type"("id_product_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_id_storage_type_fkey" FOREIGN KEY ("id_storage_type") REFERENCES "storage_type"("id_storage_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_id_storage_subtype_fkey" FOREIGN KEY ("id_storage_subtype") REFERENCES "storage_subtype"("id_storage_subtype") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "locations"("id_location") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_id_shelf_fkey" FOREIGN KEY ("id_shelf") REFERENCES "shelves"("id_shelf") ON DELETE RESTRICT ON UPDATE CASCADE;
