import type { ReactNode } from "react";
import { PlayerProvider, usePlayer } from "@/components/player/PlayerContext";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { FullPlayer } from "@/components/player/FullPlayer";
import { BottomNav } from "./BottomNav";
import { LoginGate } from "@/components/auth/LoginGate";

function ShellInner({ children }: { children: ReactNode }) {
  const { current } = usePlayer();
  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-background">
      <main className={`pb-${current ? "40" : "20"} px-4 pt-6`} style={{ paddingBottom: current ? 160 : 80 }}>
        {children}
      </main>
      <MiniPlayer />
      <BottomNav />
      <FullPlayer />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LoginGate>
      <PlayerProvider>
        <ShellInner>{children}</ShellInner>
      </PlayerProvider>
    </LoginGate>
  );
}