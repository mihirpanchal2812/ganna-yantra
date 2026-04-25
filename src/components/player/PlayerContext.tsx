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
  sleepRemaining: number; // seconds, 0 = off
  analyser: AnalyserNode | null;
  play: (song: Song, queue?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  toggleRepeat: () => void;
  setExpanded: (v: boolean) => void;
  enqueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  jumpTo: (index: number) => void;
  setSleepTimer: (minutes: number) => void; // 0 cancels
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState(0);

  const repeatRef = useRef(false);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  // Lazy-init audio + Web Audio graph
  useEffect(() => {
    if (audioRef.current) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
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
      setIndex((i) => i + 1);
    };
    const onPlay = () => {
      setIsPlaying(true);
      // Init / resume Web Audio on first user-driven play
      try {
        if (!audioCtxRef.current) {
          const Ctor =
            (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
              .AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (Ctor) {
            const ctx = new Ctor();
            const src = ctx.createMediaElementSource(audio);
            const an = ctx.createAnalyser();
            an.fftSize = 128; // 64 frequency bins
            an.smoothingTimeConstant = 0.8;
            src.connect(an);
            an.connect(ctx.destination);
            audioCtxRef.current = ctx;
            sourceRef.current = src;
            setAnalyser(an);
          }
        }
        audioCtxRef.current?.resume().catch(() => {});
      } catch {
        /* ignore */
      }
    };
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    audio.src = current.url;
    audio.play().catch(() => {});
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

  // Sleep timer countdown
  useEffect(() => {
    if (sleepRemaining <= 0) return;
    const t = setInterval(() => {
      setSleepRemaining((s) => {
        if (s <= 1) {
          audioRef.current?.pause();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [sleepRemaining]);

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
    const target = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    audio.currentTime = target;
    setProgress(target);
  }, []);

  const toggleRepeat = useCallback(() => setRepeat((r) => !r), []);

  const enqueue = useCallback((song: Song) => {
    setQueue((q) => {
      if (q.length === 0) {
        // start playing it
        setIndex(0);
        return [song];
      }
      return [...q, song];
    });
  }, []);

  const removeFromQueue = useCallback((removeIdx: number) => {
    setQueue((q) => {
      const next = q.filter((_, i) => i !== removeIdx);
      setIndex((curr) => {
        if (removeIdx < curr) return curr - 1;
        if (removeIdx === curr) {
          // current removed: stay at same idx (next song slides in), clamp
          return Math.min(curr, next.length - 1);
        }
        return curr;
      });
      return next;
    });
  }, []);

  const reorderQueue = useCallback((from: number, to: number) => {
    setQueue((q) => {
      if (from === to || from < 0 || to < 0 || from >= q.length || to >= q.length) return q;
      const next = q.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setIndex((curr) => {
        if (curr === from) return to;
        if (from < curr && to >= curr) return curr - 1;
        if (from > curr && to <= curr) return curr + 1;
        return curr;
      });
      return next;
    });
  }, []);

  const jumpTo = useCallback((i: number) => {
    setIndex(i);
  }, []);

  const setSleepTimer = useCallback((minutes: number) => {
    setSleepRemaining(Math.max(0, Math.floor(minutes * 60)));
  }, []);

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
      analyser,
      play,
      toggle,
      next,
      prev,
      seek,
      skip,
      toggleRepeat,
      setExpanded,
      enqueue,
      removeFromQueue,
      reorderQueue,
      jumpTo,
      setSleepTimer,
    }),
    [current, queue, index, isPlaying, progress, duration, recentIds, expanded, repeat, sleepRemaining, analyser, play, toggle, next, prev, seek, skip, toggleRepeat, enqueue, removeFromQueue, reorderQueue, jumpTo, setSleepTimer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
