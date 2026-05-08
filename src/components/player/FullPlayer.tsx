import { ChevronDown, ListMusic, Moon, Pause, Play, Repeat, SkipBack, SkipForward } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "./PlayerContext";
import { formatTime } from "@/lib/songs";
import { QueueSheet } from "./QueueSheet";
import { SleepTimerSheet } from "./SleepTimerSheet";

export function FullPlayer() {
  const {
    current,
    isPlaying,
    toggle,
    next,
    prev,
    progress,
    duration,
    seek,
    repeat,
    toggleRepeat,
    expanded,
    setExpanded,
    sleepRemaining,
  } = usePlayer();
  const [queueOpen, setQueueOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);

  if (!current) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-transform duration-300 ${
        expanded ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ background: "var(--gradient-player)" }}
    >
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-white/10"
          aria-label="Close player"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Now Playing</div>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div
          className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: current.cover ? undefined : "var(--gradient-card)" }}
        >
          {current.cover && (
            <img src={current.cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="mt-8 w-full max-w-sm text-center">
          <h2 className="truncate text-2xl font-bold text-foreground">{current.title}</h2>
          <p className="mt-1 truncate text-base text-muted-foreground">{current.artist}</p>
        </div>
      </div>

      <div className="px-8 pb-10">
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.001)}
          step={0.1}
          value={Math.min(progress, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={prev}
            className="flex h-12 w-12 items-center justify-center rounded-full text-foreground hover:text-primary"
            aria-label="Previous"
          >
            <SkipBack className="h-7 w-7 fill-current" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
          </button>
          <button
            type="button"
            onClick={next}
            className="flex h-12 w-12 items-center justify-center rounded-full text-foreground hover:text-primary"
            aria-label="Next"
          >
            <SkipForward className="h-7 w-7 fill-current" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={toggleRepeat}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              repeat ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={repeat ? "Disable repeat" : "Enable repeat"}
            aria-pressed={repeat}
          >
            <Repeat className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setQueueOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Queue"
          >
            <ListMusic className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSleepOpen(true)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              sleepRemaining ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Sleep timer"
          >
            <Moon className="h-5 w-5" />
            {sleepRemaining != null && (
              <span className="absolute -bottom-4 text-[10px] font-semibold tabular-nums">
                {formatTime(sleepRemaining)}
              </span>
            )}
          </button>
        </div>
      </div>
      <QueueSheet open={queueOpen} onClose={() => setQueueOpen(false)} />
      <SleepTimerSheet open={sleepOpen} onClose={() => setSleepOpen(false)} />
    </div>
  );
}