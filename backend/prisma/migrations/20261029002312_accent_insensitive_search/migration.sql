-- CreateExtension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- CreateFunction
CREATE OR REPLACE FUNCTION immutable_unaccent(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
AS $$
  SELECT public.unaccent('public.unaccent'::regdictionary, value)
$$;

-- DropIndex
DROP INDEX "products_category_idx";

-- DropIndex
DROP INDEX "products_name_idx";

-- CreateIndex
CREATE INDEX "products_name_search_idx" ON "products" USING GIN (immutable_unaccent("name") gin_trgm_ops);

-- CreateIndex
CREATE INDEX "products_category_search_idx" ON "products" USING GIN (immutable_unaccent("category") gin_trgm_ops);
