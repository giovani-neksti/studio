-- Migration: Add showcase column to generations table
-- Run this in Supabase SQL Editor

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS showcase BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_generations_showcase
  ON public.generations(showcase)
  WHERE showcase = true;
