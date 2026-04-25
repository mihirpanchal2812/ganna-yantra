import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { fetchSongs, type Song } from "@/lib/songs";
import { SongRow } from "@/components/player/SongRow";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    fetchSongs().then((s) => {
      if (active) setSongs(s);
    });
    return () => {
      active = false;
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(songs, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "artist", weight: 0.3 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [songs],
  );

  const filtered = useMemo(() => {
    const needle = q.trim();
    if (!needle) return songs;
    return fuse.search(needle).map((r) => r.item);
  }, [songs, q, fuse]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Library</h1>
        <p className="text-sm text-muted-foreground">{songs.length} songs</p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search — typos are fine"
          className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {q && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"} for “{q}”
        </p>
      )}

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No songs found.</p>
        ) : (
          filtered.map((song) => <SongRow key={song.id} song={song} queue={filtered} />)
        )}
      </div>
    </div>
  );
}
