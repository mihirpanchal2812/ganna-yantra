import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchSongs, type Song } from "@/lib/songs";
import { SongRow } from "@/components/player/SongRow";
import { usePlayer } from "@/components/player/PlayerContext";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [greeting, setGreeting] = useState("Hello");
  const { recentIds, play } = usePlayer();

  useEffect(() => {
    const computeGreeting = () => {
      const h = new Date().getHours();
      if (h < 5) return "Good night";
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      if (h < 22) return "Good evening";
      return "Good night";
    };
    setGreeting(computeGreeting());
    const t = setInterval(() => setGreeting(computeGreeting()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    fetchSongs().then((s) => {
      if (active) setSongs(s);
    });
    return () => {
      active = false;
    };
  }, []);

  const recent = useMemo(() => {
    const map = new Map(songs.map((s) => [s.id, s]));
    return recentIds.map((id) => map.get(id)).filter((s): s is Song => Boolean(s));
  }, [songs, recentIds]);

  const featured = songs.slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{greeting}</h1>
        <Link
          to="/library"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary"
        >
          Library
        </Link>
      </header>

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recently played
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {recent.slice(0, 6).map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => play(song, songs)}
                className="flex items-center gap-2 overflow-hidden rounded-md bg-card text-left transition-colors hover:bg-accent"
              >
                <div
                  className="h-12 w-12 flex-shrink-0 overflow-hidden"
                  style={{ background: song.cover ? undefined : "var(--gradient-card)" }}
                >
                  {song.cover && (
                    <img src={song.cover} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="truncate pr-2 text-sm font-medium text-foreground">
                  {song.title}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Made for you
        </h2>
        <div className="space-y-1">
          {featured.map((song) => (
            <SongRow key={song.id} song={song} queue={songs} />
          ))}
        </div>
      </section>
    </div>
  );
}
