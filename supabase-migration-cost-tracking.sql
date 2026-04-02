-- Migration: Add cost tracking columns to generations table
-- Run this in Supabase SQL Editor

-- Add token usage and cost columns
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10, 6) DEFAULT 0;

-- Index for cost aggregation queries
CREATE INDEX IF NOT EXISTS idx_generations_cost
  ON public.generations(created_at, cost_usd)
  WHERE cost_usd > 0;

-- Backfill: estimate cost for existing generations that don't have cost tracked
-- Uses Gemini image generation average cost (~$0.04 per generation)
-- You can adjust this value based on your actual Google Cloud billing
UPDATE public.generations
  SET cost_usd = 0.04
  WHERE cost_usd = 0 OR cost_usd IS NULL;
