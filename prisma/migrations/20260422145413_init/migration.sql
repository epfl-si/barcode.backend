-- CreateTable
CREATE TABLE "inventory" (
    "id_storage" SERIAL NOT NULL,
    "barcode" VARCHAR(80) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id_storage")
);

-- CreateTable
CREATE TABLE "mutation_logs" (
    "id_mutation_logs" SERIAL NOT NULL,
    "modified_by" TEXT NOT NULL,
    "modified_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "table_name" TEXT NOT NULL,
    "table_id" INTEGER NOT NULL,
    "column_name" TEXT,
    "old_value" TEXT NOT NULL,
    "new_value" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "mutation_logs_pkey" PRIMARY KEY ("id_mutation_logs")
);

-- CreateIndex
CREATE UNIQUE INDEX "barcode" ON "inventory"("barcode");
