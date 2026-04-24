-- Songs table: metadata for uploaded MP3s
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Unknown Artist',
  storage_path TEXT NOT NULL UNIQUE,
  cover_url TEXT,
  duration NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Single-user personal app: open read + write (matches spec "no authentication")
CREATE POLICY "Anyone can view songs"
  ON public.songs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert songs"
  ON public.songs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete songs"
  ON public.songs FOR DELETE
  USING (true);

-- Public storage bucket for MP3s (direct streaming from CDN)
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true);

CREATE POLICY "Public can read music files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'music');

CREATE POLICY "Anyone can upload music files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'music');

CREATE POLICY "Anyone can delete music files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'music');