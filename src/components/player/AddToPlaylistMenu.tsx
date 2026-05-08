import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import {
  fetchPlaylists,
  createPlaylist,
  addSongToPlaylist,
  type Playlist,
} from "@/lib/songs";

export function AddToPlaylistMenu({
  songId,
  onClose,
}: {
  songId: string;
  onClose: () => void;
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPlaylists().then(setPlaylists);
  }, []);

  const onAdd = async (pid: string) => {
    setBusy(true);
    try {
      await addSongToPlaylist(pid, songId);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const p = await createPlaylist(name.trim());
      if (p) await addSongToPlaylist(p.id, songId);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Add to playlist
          </h3>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {playlists.length === 0 && !creating && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No playlists yet.
            </p>
          )}
          {playlists.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={busy}
              onClick={() => onAdd(p.id)}
              className="block w-full rounded-lg p-2 text-left text-sm text-foreground hover:bg-accent disabled:opacity-50"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="border-t border-border p-3">
          {creating ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Playlist name"
                className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={onCreate}
                disabled={busy || !name.trim()}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> New playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}