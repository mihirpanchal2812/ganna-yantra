import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchSongs, type Song } from "@/lib/songs";
import { SongRow } from "@/components/player/SongRow";
import { Search } from "lucide-react";

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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) || s.artist.toLowerCase().includes(needle),
    );
  }, [songs, q]);

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
          placeholder="Search songs or artists"
          className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

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