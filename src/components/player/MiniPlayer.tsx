import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "./MiniPlayer.context";
import { cn } from "@/lib/utils";

export function MiniPlayer() {
  const { current, isPlaying, toggle, next, setExpanded, progress, duration } = usePlayer();
  if (!current) return null;
  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 mx-2 mb-2 overflow-hidden rounded-xl border border-border bg-card/95 backdrop-blur-md"
      style={{ boxShadow: "var(--shadow-player)" }}
    >
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-3 p-2 text-left"
      >
        <div
          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted"
          style={{ background: current.cover ? undefined : "var(--gradient-card)" }}
        >
          {current.cover && (
            <img src={current.cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{current.title}</div>
          <div className="truncate text-xs text-muted-foreground">{current.artist}</div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-primary"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:text-primary"
          aria-label="Next"
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>
      </button>
      <div className="h-0.5 w-full bg-muted">
        <div
          className={cn("h-full bg-primary transition-all")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}