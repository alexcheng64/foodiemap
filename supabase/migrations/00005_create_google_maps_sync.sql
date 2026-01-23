-- Create sync_direction enum type
CREATE TYPE public.sync_direction AS ENUM ('two_way', 'to_google', 'from_google');

-- Create sync_status enum type
CREATE TYPE public.sync_status AS ENUM ('idle', 'syncing', 'error');

-- Create google_maps_sync table
CREATE TABLE public.google_maps_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_list_id VARCHAR(255),
  google_list_name VARCHAR(255),
  sync_direction public.sync_direction NOT NULL DEFAULT 'two_way',
  last_synced_at TIMESTAMPTZ,
  sync_status public.sync_status NOT NULL DEFAULT 'idle',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One sync config per user
  UNIQUE(user_id)
);

-- Performance indexes
CREATE INDEX idx_google_maps_sync_user_id ON public.google_maps_sync(user_id);
CREATE INDEX idx_google_maps_sync_status ON public.google_maps_sync(sync_status);

-- Enable RLS
ALTER TABLE public.google_maps_sync ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own sync config
CREATE POLICY "Users can view own sync config"
  ON public.google_maps_sync FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sync config"
  ON public.google_maps_sync FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync config"
  ON public.google_maps_sync FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync config"
  ON public.google_maps_sync FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER google_maps_sync_updated_at
  BEFORE UPDATE ON public.google_maps_sync
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
