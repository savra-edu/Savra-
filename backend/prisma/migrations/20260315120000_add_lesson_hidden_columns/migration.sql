-- Add hidden_columns to lessons table (nullable JSONB for array of column keys to hide).
-- Safe: nullable, no backfill; IF NOT EXISTS for idempotency.
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "hidden_columns" JSONB;
