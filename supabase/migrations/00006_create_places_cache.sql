-- Create places_cache table for caching Google Places API responses
-- This helps reduce API costs by caching place details

CREATE TABLE public.places_cache (
  place_id VARCHAR(255) PRIMARY KEY,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for cleanup queries
CREATE INDEX idx_places_cache_expires ON public.places_cache(expires_at);

-- Note: This table does not have RLS enabled because:
-- 1. It only stores public Google Places data (no user data)
-- 2. Edge Functions using service role will access it
-- 3. We don't want users to directly query this table

-- Function to get or cache place data
CREATE OR REPLACE FUNCTION public.get_cached_place(p_place_id VARCHAR(255))
RETURNS JSONB AS $$
DECLARE
  cached_data JSONB;
BEGIN
  SELECT data INTO cached_data
  FROM public.places_cache
  WHERE place_id = p_place_id
    AND expires_at > NOW();

  RETURN cached_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cache place data
CREATE OR REPLACE FUNCTION public.cache_place(
  p_place_id VARCHAR(255),
  p_data JSONB,
  p_ttl_hours INTEGER DEFAULT 24
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.places_cache (place_id, data, cached_at, expires_at)
  VALUES (
    p_place_id,
    p_data,
    NOW(),
    NOW() + (p_ttl_hours || ' hours')::INTERVAL
  )
  ON CONFLICT (place_id)
  DO UPDATE SET
    data = EXCLUDED.data,
    cached_at = NOW(),
    expires_at = NOW() + (p_ttl_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.places_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
