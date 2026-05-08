import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Trash2, Pencil, Check, X, Play } from "lucide-react";
import { usePlayer } from "@/components/player/PlayerContext";
import {
  fetchPlaylistSongs,
  fetchPlaylists,
  removeSongFromPlaylist,
  deletePlaylist,
  renamePlaylist,
  type Song,
  type Playlist,
} from "@/lib/songs";
import { SongRow } from "@/components/player/SongRow";

export const Route = createFileRoute("/playlists/$playlistId")({
  component: PlaylistDetail,
});

function PlaylistDetail() {
  const { playlistId } = Route.useParams();
  const navigate = useNavigate();
  const { play } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const load = async () => {
    const [list, all] = await Promise.all([
      fetchPlaylistSongs(playlistId),
      fetchPlaylists(),
    ]);
    setSongs(list);
    const p = all.find((x) => x.id === playlistId) ?? null;
    setPlaylist(p);
    setName(p?.name ?? "");
  };

  useEffect(() => { load(); }, [playlistId]);

  const onRemove = async (songId: string) => {
    await removeSongFromPlaylist(playlistId, songId);
    load();
  };

  const onDelete = async () => {
    if (!confirm("Delete this playlist?")) return;
    await deletePlaylist(playlistId);
    navigate({ to: "/playlists" });
  };

  const onSaveName = async () => {
    if (!name.trim()) return;
    await renamePlaylist(playlistId, name.trim());
    setEditing(false);
    load();
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate({ to: "/playlists" })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Playlists
      </button>

      <header className="flex items-center justify-between gap-2">
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-lg font-bold text-foreground"
            />
            <button onClick={onSaveName} className="rounded-full p-2 text-primary"><Check className="h-5 w-5" /></button>
            <button onClick={() => { setEditing(false); setName(playlist?.name ?? ""); }} className="rounded-full p-2 text-muted-foreground"><X className="h-5 w-5" /></button>
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
                {playlist?.name ?? "Playlist"}
              </h1>
              <p className="text-sm text-muted-foreground">{songs.length} songs</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => songs.length && play(songs[0], songs)}
                disabled={songs.length === 0}
                className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                aria-label="Play playlist"
              ><Play className="h-4 w-4 fill-current" /> Play</button>
              <button
                onClick={() => setEditing(true)}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent"
                aria-label="Rename"
              ><Pencil className="h-4 w-4" /></button>
              <button
                onClick={onDelete}
                className="rounded-full p-2 text-destructive hover:bg-accent"
                aria-label="Delete playlist"
              ><Trash2 className="h-4 w-4" /></button>
            </div>
          </>
        )}
      </header>

      <div className="space-y-1">
        {songs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No songs yet. Add some from your library.
          </p>
        ) : (
          songs.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              queue={songs}
              onRemove={() => onRemove(song.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}