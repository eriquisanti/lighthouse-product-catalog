-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_name_trimmed_check" CHECK ("name" = btrim("name")),
    CONSTRAINT "products_name_length_check" CHECK (char_length("name") >= 3),
    CONSTRAINT "products_price_positive_check" CHECK ("price" > 0),
    CONSTRAINT "products_stock_non_negative_check" CHECK ("stock" >= 0),
    CONSTRAINT "products_category_trimmed_check" CHECK ("category" = btrim("category")),
    CONSTRAINT "products_category_not_empty_check" CHECK (char_length("category") > 0)
);

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products" USING GIN ("name" gin_trgm_ops);
