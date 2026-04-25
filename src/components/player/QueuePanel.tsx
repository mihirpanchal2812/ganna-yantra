import { ArrowDown, ArrowUp, Music, X } from "lucide-react";
import { usePlayer } from "./PlayerContext";

export function QueuePanel({ onClose }: { onClose: () => void }) {
  const { queue, index, jumpTo, removeFromQueue, reorderQueue } = usePlayer();

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Queue</h3>
          <p className="text-xs text-muted-foreground">{queue.length} songs</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-accent"
          aria-label="Close queue"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {queue.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Queue is empty.</p>
        ) : (
          <ul className="space-y-1">
            {queue.map((song, i) => {
              const active = i === index;
              return (
                <li
                  key={`${song.id}-${i}`}
                  className={`flex items-center gap-2 rounded-lg p-2 ${active ? "bg-accent" : "hover:bg-accent/60"}`}
                >
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className="h-10 w-10 flex-shrink-0 overflow-hidden rounded"
                      style={{ background: song.cover ? undefined : "var(--gradient-card)" }}
                    >
                      {song.cover ? (
                        <img src={song.cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music className="h-4 w-4 text-foreground/60" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`truncate text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}
                      >
                        {song.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{song.artist}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => reorderQueue(i, i - 1)}
                      disabled={i === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderQueue(i, i + 1)}
                      disabled={i === queue.length - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/20 hover:text-destructive"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
