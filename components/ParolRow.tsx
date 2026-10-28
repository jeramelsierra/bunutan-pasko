"use client";

import { useMusic } from "./MusicContext";

export function ParolRow({ count = 14 }: { count?: number }) {
  const { energy, playing } = useMusic();

  const colors = [
    "#B83232", // Red
    "#D4A12A", // Gold
    "#1F3D2B", // Green
    "#4B8BFF", // Blue
    "#FF69B4", // Pink
  ];

  return (
    <div className="relative w-full overflow-hidden pt-4 pb-12">
      {/* The sagging wire */}
      <svg className="absolute top-6 left-0 w-full h-16 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 50">
        <path 
          d="M 0 5 Q 50 30 100 5" 
          fill="transparent" 
          stroke="#1F3D2B" 
          strokeWidth="0.5" 
          opacity="0.4"
        />
      </svg>

      {/* The lights container */}
      <div className="relative flex justify-between items-start w-full px-4 sm:px-8">
        {Array.from({ length: count }).map((_, i) => {
          const color = colors[i % colors.length];
          
          const progress = i / (count - 1); 
          
          // The wire dips in the middle
          const sag = Math.sin(progress * Math.PI); 
          const yOffset = sag * 20; 
          
          const scale = playing ? 1 + energy * 0.6 : 1;
          const glow = playing ? 10 + energy * 20 : 6;
          
          return (
            <div 
              key={i} 
              className="flex flex-col items-center"
              style={{ transform: `translateY(${yOffset}px)` }}
            >
              {/* The dark socket (at the top, hanging from the wire) */}
              <div className="w-[6px] h-[6px] bg-[#2A1F14] rounded-t-sm z-10" />
              
              {/* The glowing bulb (teardrop shape pointing down) */}
              <div
                className={playing ? "transition-transform duration-75" : "animate-parol-idle"}
                style={{
                  width: "12px",
                  height: "22px",
                  borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%", // Teardrop shape!
                  backgroundColor: color,
                  boxShadow: `0 0 ${glow}px ${color}, 0 0 ${glow * 1.5}px ${color}`,
                  transform: `scale(${scale})`,
                  opacity: playing ? 0.7 + energy * 0.3 : 1,
                  animationDelay: `${i * 150}ms`,
                  marginTop: "-2px" // Pull it tight against the socket
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}