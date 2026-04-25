import { ListPlus, Pause, Play } from "lucide-react";
import type { Song } from "@/lib/songs";
import { usePlayer } from "./PlayerContext";

export function SongRow({ song, queue }: { song: Song; queue: Song[] }) {
  const { current, isPlaying, play, toggle, enqueue } = usePlayer();
  const isCurrent = current?.id === song.id;

  return (
    <div className="group flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent">
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
        onClick={(e) => {
          e.stopPropagation();
          enqueue(song);
        }}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
        aria-label="Add to queue"
        title="Add to queue"
      >
        <ListPlus className="h-5 w-5" />
      </button>
    </div>
  );
}
