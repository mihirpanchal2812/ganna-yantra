import { supabase } from "@/integrations/supabase/client";

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover?: string;
  duration?: number;
}

const BUCKET = "music";

export async function fetchSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, artist, storage_path, cover_url, duration")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("fetchSongs error:", error);
    return [];
  }

  return data.map((row) => {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path);
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      url: pub.publicUrl,
      cover: row.cover_url ?? undefined,
      duration: row.duration ?? undefined,
    };
  });
}

export async function uploadSong(
  file: File,
  meta: { title: string; artist: string; cover?: File | null },
) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${crypto.randomUUID()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
  if (upErr) throw upErr;

  let coverUrl: string | null = null;
  if (meta.cover) {
    const safeCover = meta.cover.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const coverPath = `covers/${crypto.randomUUID()}-${safeCover}`;
    const { error: covErr } = await supabase.storage
      .from(BUCKET)
      .upload(coverPath, meta.cover, {
        contentType: meta.cover.type || "image/jpeg",
        upsert: false,
      });
    if (!covErr) {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(coverPath);
      coverUrl = pub.publicUrl;
    }
  }

  const { error: insErr } = await supabase.from("songs").insert({
    title: meta.title,
    artist: meta.artist || "Unknown Artist",
    storage_path: path,
    cover_url: coverUrl,
  });
  if (insErr) {
    // best-effort cleanup
    await supabase.storage.from(BUCKET).remove([path]);
    throw insErr;
  }
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface Playlist {
  id: string;
  name: string;
  cover_url?: string | null;
  created_at: string;
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select("id, name, cover_url, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Playlist[];
}

export async function createPlaylist(name: string): Promise<Playlist | null> {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return data as Playlist;
}

export async function deletePlaylist(id: string) {
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) throw error;
}

export async function renamePlaylist(id: string, name: string) {
  const { error } = await supabase.from("playlists").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function fetchPlaylistSongs(playlistId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("playlist_songs")
    .select("position, songs ( id, title, artist, storage_path, cover_url, duration )")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data
    .map((row: any) => row.songs)
    .filter(Boolean)
    .map((row: any) => {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path);
      return {
        id: row.id,
        title: row.title,
        artist: row.artist,
        url: pub.publicUrl,
        cover: row.cover_url ?? undefined,
        duration: row.duration ?? undefined,
      } as Song;
    });
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  const { count } = await supabase
    .from("playlist_songs")
    .select("id", { count: "exact", head: true })
    .eq("playlist_id", playlistId);
  const { error } = await supabase
    .from("playlist_songs")
    .insert({ playlist_id: playlistId, song_id: songId, position: count ?? 0 });
  if (error && !`${error.message}`.toLowerCase().includes("duplicate")) throw error;
}

export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  const { error } = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("song_id", songId);
  if (error) throw error;
}