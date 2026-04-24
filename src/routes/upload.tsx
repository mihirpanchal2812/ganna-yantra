import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { uploadSong } from "@/lib/songs";
import { Upload as UploadIcon, Music, Loader2 } from "lucide-react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function prettyTitle(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith("audio/") && !f.name.toLowerCase().endsWith(".mp3")) {
      setError("Please pick an audio file (MP3 recommended).");
      return;
    }
    setFile(f);
    if (!title) setTitle(prettyTitle(f.name));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await uploadSong(file, { title: title.trim(), artist: artist.trim() });
      navigate({ to: "/library" });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Upload music</h1>
        <p className="text-sm text-muted-foreground">Add MP3 files to your library.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-4 py-10 text-center transition-colors hover:border-primary hover:bg-accent"
        >
          {file ? (
            <>
              <Music className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB · tap to change
              </span>
            </>
          ) : (
            <>
              <UploadIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Tap to choose an MP3</span>
              <span className="text-xs text-muted-foreground">Audio file from your device</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/*,.mp3"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Artist
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Unknown Artist"
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!file || !title.trim() || busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            "Upload to library"
          )}
        </button>
      </form>
    </div>
  );
}
