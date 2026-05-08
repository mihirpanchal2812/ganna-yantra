import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, ListMusic, Trash2 } from "lucide-react";
import { fetchPlaylists, createPlaylist, deletePlaylist, type Playlist } from "@/lib/songs";

export const Route = createFileRoute("/playlists/")({
  component: PlaylistsPage,
});

function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => fetchPlaylists().then(setPlaylists);
  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    if (!name.trim()) return;
    await createPlaylist(name.trim());
    setName("");
    setCreating(false);
    load();
  };

  const onDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this playlist?")) return;
    await deletePlaylist(id);
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Playlists</h1>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label="New playlist"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      {creating && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
          />
          <button
            type="button"
            onClick={onCreate}
            disabled={!name.trim()}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Create
          </button>
        </div>
      )}

      <div className="space-y-1">
        {playlists.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No playlists yet. Tap + to create one.
          </p>
        ) : (
          playlists.map((p) => (
            <Link
              key={p.id}
              to="/playlists/$playlistId"
              params={{ playlistId: p.id }}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md" style={{ background: "var(--gradient-card)" }}>
                <ListMusic className="h-6 w-6 text-foreground/80" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
              </div>
              <button
                type="button"
                onClick={(e) => onDelete(e, p.id)}
                className="rounded-full p-2 text-destructive hover:bg-background"
                aria-label="Delete playlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}