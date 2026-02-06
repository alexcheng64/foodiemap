-- Add 'none' to visit_status enum and set as default
ALTER TYPE public.visit_status ADD VALUE 'none';

-- Change default to 'none'
ALTER TABLE public.bookmarks ALTER COLUMN visit_status SET DEFAULT 'none';
