-- Add 'not_visited' to visit_status enum and set as default
ALTER TYPE public.visit_status ADD VALUE 'not_visited';

-- Change default to 'not_visited'
ALTER TABLE public.bookmarks ALTER COLUMN visit_status SET DEFAULT 'not_visited';
