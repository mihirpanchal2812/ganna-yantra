import { Play, Pause, MoreVertical } from "lucide-react";
import { useState } from "react";
import type { Song } from "@/lib/songs";
import { usePlayer } from "./PlayerContext";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";

export function SongRow({
  song,
  queue,
  onRemove,
}: {
  song: Song;
  queue: Song[];
  onRemove?: () => void;
}) {
  const { current, isPlaying, play, toggle, addToQueue, playNext } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const isCurrent = current?.id === song.id;

  return (
    <div className="relative flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent">
      <button
        type="button"
        onClick={() => {
          if (isCurrent) toggle();
          else play(song, queue);
        }}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
      <div
        className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md"
        style={{ background: song.cover ? undefined : "var(--gradient-card)" }}
      >
        {song.cover && <img src={song.cover} alt="" className="h-full w-full object-cover" />}
        {isCurrent && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            {isPlaying ? (
              <Pause className="h-5 w-5 text-primary fill-current" />
            ) : (
              <Play className="h-5 w-5 text-primary fill-current" />
            )}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-medium ${isCurrent ? "text-primary" : "text-foreground"}`}>
          {song.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">{song.artist}</div>
      </div>
      </button>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-background"
        aria-label="More actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-2 top-12 z-50 w-48 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
            <button
              type="button"
              onClick={() => { playNext(song); setMenuOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            >Play next</button>
            <button
              type="button"
              onClick={() => { addToQueue(song); setMenuOpen(false); }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            >Add to queue</button>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); setPlaylistOpen(true); }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            >Add to playlist…</button>
            {onRemove && (
              <button
                type="button"
                onClick={() => { onRemove(); setMenuOpen(false); }}
                className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
              >Remove from playlist</button>
            )}
          </div>
        </>
      )}
      {playlistOpen && (
        <AddToPlaylistMenu songId={song.id} onClose={() => setPlaylistOpen(false)} />
      )}
    </div>
  );
}