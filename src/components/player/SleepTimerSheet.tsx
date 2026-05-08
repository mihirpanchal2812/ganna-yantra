import { X } from "lucide-react";
import { usePlayer } from "./PlayerContext";

const OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export function SleepTimerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sleepRemaining, setSleepTimer } = usePlayer();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-t-2xl bg-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Sleep timer</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setSleepTimer(m);
                onClose();
              }}
              className="rounded-lg border border-border bg-background py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              {m} min
            </button>
          ))}
        </div>
        {sleepRemaining != null && (
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={() => {
                setSleepTimer(null);
                onClose();
              }}
              className="w-full rounded-lg bg-destructive/10 py-2 text-sm font-medium text-destructive"
            >
              Cancel timer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}