"use client";
import { useEffect, useRef } from "react";
import { useMusic } from "./MusicContext";
export function Parol({ size = 96, color = "#D4A12A", idleDelay = 0 }: { size?: number, color?: string, idleDelay?: number }) {
  const { energy, playing } = useMusic();
  const glowRef = useRef<SVGCircleElement | null>(null);
  const starRef = useRef<SVGGElement | null>(null);
  useEffect(() => {
    const glow = glowRef.current; const star = starRef.current;
    if (!glow || !star) return;
    let raf = 0;
    const tick = () => {
      // If playing but energy is flat 0 (browser blocked audio analysis), 
      // give it a gentle fake pulse so it's not totally dead.
      const e = playing ? (energy > 0 ? energy : 0.2) : 0;
      glow.setAttribute("opacity", String(0.35 + e * 0.6));
      glow.setAttribute("r", String(22 + e * 8));
      star.setAttribute("transform", `translate(50 50) scale(${1 + e * 0.06}) translate(-50 -50)`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [energy, playing]);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className={playing ? "" : "animate-parol-idle"} style={{ animationDelay: `${idleDelay}ms`, width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }} aria-hidden>
          <defs>
            <radialGradient id={`glow-${color.replace("#", "")}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="60%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle ref={glowRef} cx="50" cy="50" r="22" fill={`url(#glow-${color.replace("#", "")})`} opacity="0.35" />
          <g ref={starRef} transform="translate(50 50) scale(1) translate(-50 -50)">
            <polygon points="50,12 58,38 86,38 63,55 72,82 50,65 28,82 37,55 14,38 42,38" fill={color} stroke="#8B1E1E" strokeWidth="0.8" strokeLinejoin="round" />
            <polygon points="50,24 55,40 72,40 58,51 63,68 50,58 37,68 42,51 28,40 45,40" fill="#FFE9A8" opacity="0.85" />
            <circle cx="50" cy="47" r="3" fill="#FFF7DC" />
          </g>
          <line x1="50" y1="0" x2="50" y2="12" stroke="#8B1E1E" strokeWidth="0.6" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}