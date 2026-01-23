-- Create visit_status enum type
CREATE TYPE public.visit_status AS ENUM ('want_to_visit', 'visited');

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_place_id VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  google_rating DECIMAL(2, 1),
  google_rating_count INTEGER,
  price_level SMALLINT CHECK (price_level >= 1 AND price_level <= 4),
  phone VARCHAR(50),
  website TEXT,
  photo_reference TEXT,
  personal_note TEXT,
  personal_rating SMALLINT CHECK (personal_rating >= 1 AND personal_rating <= 5),
  visit_status public.visit_status NOT NULL DEFAULT 'want_to_visit',
  visited_at DATE,
  synced_to_google BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: user can only bookmark a place once
  UNIQUE(user_id, google_place_id)
);

-- Performance indexes
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_visit_status ON public.bookmarks(user_id, visit_status);
CREATE INDEX idx_bookmarks_google_place_id ON public.bookmarks(google_place_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
