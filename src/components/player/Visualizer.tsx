import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";

const BAR_COUNT = 48;

export function Visualizer({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const { analyser, isPlaying } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // resize to device pixels
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const buffer = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    // pick BAR_COUNT bins biased to lower frequencies (more interesting)
    const binCount = analyser?.frequencyBinCount ?? BAR_COUNT;
    const indices = Array.from({ length: BAR_COUNT }, (_, i) => {
      const t = i / (BAR_COUNT - 1);
      // exponential mapping
      return Math.min(binCount - 1, Math.floor(Math.pow(t, 1.6) * binCount));
    });

    // resolve --primary for fill
    const cssPrimary =
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() ||
      "oklch(0.78 0.18 145)";

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const gap = 3;
      const barW = Math.max(2, (w - gap * (BAR_COUNT - 1)) / BAR_COUNT);
      const midY = h / 2;
      const radius = Math.min(barW / 2, 4);

      let values: number[];
      if (analyser && buffer && isPlaying) {
        analyser.getByteFrequencyData(buffer);
        values = indices.map((idx) => buffer[idx] / 255);
      } else {
        // idle: gentle sine animation
        const now = performance.now() / 600;
        values = Array.from({ length: BAR_COUNT }, (_, i) =>
          0.08 + 0.04 * Math.sin(now + i * 0.4),
        );
      }

      ctx.fillStyle = cssPrimary;
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = values[i];
        const half = Math.max(2, v * (h / 2) * 0.95);
        const x = i * (barW + gap);
        // mirrored: top + bottom
        const y = midY - half;
        const totalH = half * 2;
        // rounded-rect
        const rx = Math.min(radius, barW / 2, totalH / 2);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barW, totalH, rx);
        } else {
          ctx.rect(x, y, barW, totalH);
        }
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} className={className} />;
}
