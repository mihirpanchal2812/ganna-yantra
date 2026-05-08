
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlists" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Anyone can insert playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update playlists" ON public.playlists FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete playlists" ON public.playlists FOR DELETE USING (true);

CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, song_id)
);

CREATE INDEX idx_playlist_songs_playlist ON public.playlist_songs(playlist_id, position);

ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlist songs" ON public.playlist_songs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert playlist songs" ON public.playlist_songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update playlist songs" ON public.playlist_songs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete playlist songs" ON public.playlist_songs FOR DELETE USING (true);
