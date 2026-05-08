import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Song } from "@/lib/songs";

const RECENT_KEY = "tunes:recent";
const MAX_RECENT = 12;

interface PlayerState {
  current: Song | null;
  queue: Song[];
  index: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  recentIds: string[];
  expanded: boolean;
  repeat: boolean;
  sleepRemaining: number | null;
  play: (song: Song, queue?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  toggleRepeat: () => void;
  setExpanded: (v: boolean) => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (idx: number) => void;
  jumpTo: (idx: number) => void;
  setSleepTimer: (minutes: number | null) => void;
}

const Ctx = createContext<PlayerState | null>(null);

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const repeatRef = useRef(false);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const sleepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lazy-init audio on client only
  useEffect(() => {
    if (audioRef.current) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    setRecentIds(loadRecent());

    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (repeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      // auto-advance
      setIndex((i) => i + 1);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  const current = index >= 0 && index < queue.length ? queue[index] : null;

  // When index changes, swap source and play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    audio.src = current.url;
    audio.play().catch(() => {
      /* autoplay may be blocked */
    });
    setRecentIds((prev) => {
      const next = [current.id, ...prev.filter((id) => id !== current.id)].slice(0, MAX_RECENT);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [current]);

  // Media Session API — enables CarPlay / lock-screen controls and metadata.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!current) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const artwork = current.cover
      ? [
          { src: current.cover, sizes: "96x96", type: "image/png" },
          { src: current.cover, sizes: "192x192", type: "image/png" },
          { src: current.cover, sizes: "512x512", type: "image/png" },
        ]
      : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: "Library",
      artwork,
    });
  }, [current]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const handlers: Array<[MediaSessionAction, (() => void) | ((d: any) => void)]> = [
      ["play", () => audioRef.current?.play().catch(() => {})],
      ["pause", () => audioRef.current?.pause()],
      ["previoustrack", () => prevRef.current()],
      ["nexttrack", () => nextRef.current()],
      ["seekto", (d: any) => {
        const a = audioRef.current; if (!a || d?.seekTime == null) return;
        a.currentTime = d.seekTime;
      }],
    ];
    handlers.forEach(([action, h]) => {
      try { ms.setActionHandler(action, h as any); } catch { /* noop */ }
    });
    return () => {
      handlers.forEach(([action]) => {
        try { ms.setActionHandler(action, null); } catch { /* noop */ }
      });
    };
  }, []);

  // keep mediaSession state in sync
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : current ? "paused" : "none";
  }, [isPlaying, current]);

  const play = useCallback((song: Song, list?: Song[]) => {
    const q = list && list.length > 0 ? list : [song];
    setQueue(q);
    const idx = q.findIndex((s) => s.id === song.id);
    setIndex(idx >= 0 ? idx : 0);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1 < queue.length ? i + 1 : 0));
  }, [queue.length]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 >= 0 ? i - 1 : queue.length - 1));
  }, [queue.length]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setProgress(seconds);
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min((audio.duration || 0), audio.currentTime + seconds));
    audio.currentTime = target;
    setProgress(target);
  }, []);

  const toggleRepeat = useCallback(() => setRepeat((r) => !r), []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((q) => (q.some((s) => s.id === song.id) ? q : [...q, song]));
  }, []);

  const playNext = useCallback((song: Song) => {
    setQueue((q) => {
      const filtered = q.filter((s) => s.id !== song.id);
      const insertAt = Math.max(0, index) + 1;
      const next = [...filtered.slice(0, insertAt), song, ...filtered.slice(insertAt)];
      return next;
    });
  }, [index]);

  const removeFromQueue = useCallback((idx: number) => {
    setQueue((q) => {
      const next = q.filter((_, i) => i !== idx);
      return next;
    });
    setIndex((i) => {
      if (idx < i) return i - 1;
      if (idx === i) return i; // current removed; effect will reset src; user can pick next
      return i;
    });
  }, []);

  const jumpTo = useCallback((idx: number) => {
    setIndex(idx);
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
    if (!minutes) {
      setSleepRemaining(null);
      return;
    }
    let remaining = minutes * 60;
    setSleepRemaining(remaining);
    sleepIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (sleepIntervalRef.current) {
          clearInterval(sleepIntervalRef.current);
          sleepIntervalRef.current = null;
        }
        setSleepRemaining(null);
        audioRef.current?.pause();
      } else {
        setSleepRemaining(remaining);
      }
    }, 1000);
  }, []);

  // Refs to avoid stale closures in mediaSession handlers
  const nextRef = useRef(() => {});
  const prevRef = useRef(() => {});
  useEffect(() => {
    nextRef.current = next;
    prevRef.current = prev;
  }, [next, prev]);

  const value = useMemo<PlayerState>(
    () => ({
      current,
      queue,
      index,
      isPlaying,
      progress,
      duration,
      recentIds,
      expanded,
      repeat,
      sleepRemaining,
      play,
      toggle,
      next,
      prev,
      seek,
      skip,
      toggleRepeat,
      setExpanded,
      addToQueue,
      playNext,
      removeFromQueue,
      jumpTo,
      setSleepTimer,
    }),
    [current, queue, index, isPlaying, progress, duration, recentIds, expanded, repeat, sleepRemaining, play, toggle, next, prev, seek, skip, toggleRepeat, addToQueue, playNext, removeFromQueue, jumpTo, setSleepTimer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}