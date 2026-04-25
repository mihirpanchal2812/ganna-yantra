import { useEffect, useRef, useState } from "react";
import { Moon } from "lucide-react";
import { usePlayer } from "./PlayerContext";

const OPTIONS = [5, 10, 15, 30, 45, 60];

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SleepTimerMenu() {
  const { sleepRemaining, setSleepTimer } = usePlayer();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const active = sleepRemaining > 0;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${
          active
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
        }`}
        aria-label="Sleep timer"
      >
        <Moon className="h-4 w-4" />
        {active && <span className="font-mono tabular-nums">{fmt(sleepRemaining)}</span>}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-20 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sleep timer
          </div>
          {OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setSleepTimer(m);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <span>{m} minutes</span>
            </button>
          ))}
          {active && (
            <button
              type="button"
              onClick={() => {
                setSleepTimer(0);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              Cancel timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
