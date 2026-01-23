-- Create bookmark_tags junction table
CREATE TABLE public.bookmark_tags (
  bookmark_id UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (bookmark_id, tag_id)
);

-- Performance indexes
CREATE INDEX idx_bookmark_tags_bookmark_id ON public.bookmark_tags(bookmark_id);
CREATE INDEX idx_bookmark_tags_tag_id ON public.bookmark_tags(tag_id);

-- Enable RLS
ALTER TABLE public.bookmark_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only manage tags on their own bookmarks
CREATE POLICY "Users can view own bookmark tags"
  ON public.bookmark_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookmarks
      WHERE bookmarks.id = bookmark_tags.bookmark_id
      AND bookmarks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own bookmarks"
  ON public.bookmark_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookmarks
      WHERE bookmarks.id = bookmark_tags.bookmark_id
      AND bookmarks.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.tags
      WHERE tags.id = bookmark_tags.tag_id
      AND tags.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from own bookmarks"
  ON public.bookmark_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookmarks
      WHERE bookmarks.id = bookmark_tags.bookmark_id
      AND bookmarks.user_id = auth.uid()
    )
  );
