import { X, Trash2, Play } from "lucide-react";
import { usePlayer } from "./PlayerContext";

export function QueueSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { queue, index, jumpTo, removeFromQueue } = usePlayer();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="max-h-[75vh] w-full max-w-md overflow-hidden rounded-t-2xl bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Queue</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Queue is empty.</p>
          ) : (
            queue.map((song, i) => (
              <div
                key={`${song.id}-${i}`}
                className={`flex items-center gap-2 rounded-lg p-2 ${i === index ? "bg-accent" : ""}`}
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
                    {song.cover && <img src={song.cover} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm ${i === index ? "text-primary font-semibold" : "text-foreground"}`}>
                      {song.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{song.artist}</div>
                  </div>
                  {i === index && <Play className="h-4 w-4 text-primary fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeFromQueue(i)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
                  aria-label="Remove from queue"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}