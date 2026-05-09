import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KEY = "tunes:auth";
const USER = "mihir2811";
const PASS = "pasword4826";

export function LoginGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem(KEY) === "1");
    } catch {
      setAuthed(false);
    }
  }, []);

  if (authed === null) return null;
  if (authed) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (u.trim() === USER && p === PASS) {
      try { localStorage.setItem(KEY, "1"); } catch {}
      setAuthed(true);
    } else {
      setErr("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Ganna-Yantra</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="u">Username</Label>
          <Input id="u" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p">Password</Label>
          <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
    </div>
  );
}