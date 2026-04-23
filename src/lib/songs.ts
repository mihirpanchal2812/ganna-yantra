export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover?: string;
  duration?: number;
}

// Mock data — will be replaced by /api/songs once R2 is wired up.
export const MOCK_SONGS: Song[] = [
  {
    id: "sample-1",
    title: "Sunset Drive",
    artist: "Aurora Wave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/song1/400/400",
  },
  {
    id: "sample-2",
    title: "Midnight Bloom",
    artist: "Neon Garden",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/song2/400/400",
  },
  {
    id: "sample-3",
    title: "Glass Skyline",
    artist: "Echo Field",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/song3/400/400",
  },
  {
    id: "sample-4",
    title: "Paper Moon",
    artist: "Lunar Tide",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://picsum.photos/seed/song4/400/400",
  },
  {
    id: "sample-5",
    title: "Velvet Static",
    artist: "Hollow Coast",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover: "https://picsum.photos/seed/song5/400/400",
  },
  {
    id: "sample-6",
    title: "Saltwater Heart",
    artist: "Pale Harbor",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    cover: "https://picsum.photos/seed/song6/400/400",
  },
];

export async function fetchSongs(): Promise<Song[]> {
  try {
    const res = await fetch("/api/songs");
    if (!res.ok) throw new Error("bad status");
    const data = (await res.json()) as { songs?: Song[] };
    if (Array.isArray(data.songs) && data.songs.length > 0) return data.songs;
  } catch {
    // fall through to mock
  }
  return MOCK_SONGS;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}