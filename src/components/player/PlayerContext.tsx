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
  play: (song: Song, queue?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  toggleRepeat: () => void;
  setExpanded: (v: boolean) => void;
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
      play,
      toggle,
      next,
      prev,
      seek,
      skip,
      toggleRepeat,
      setExpanded,
    }),
    [current, queue, index, isPlaying, progress, duration, recentIds, expanded, repeat, play, toggle, next, prev, seek, skip, toggleRepeat],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}