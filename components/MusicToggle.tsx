"use client";
import { useMusic } from "./MusicContext";
export function MusicToggle() {
  const { playing, muted, toggle, setMuted, error } = useMusic();
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-50 flex flex-col items-center sm:items-end gap-2 w-[calc(100%-2rem)] sm:w-auto">
      {error && (
        <div className="max-w-xs rounded-lg bg-pasko-red/95 px-3 py-2 text-xs text-pasko-cream shadow-lg text-center sm:text-left">
          {error}. Drop <code className="font-mono">public/audio/pasko.mp3</code> to enable music.
        </div>
      )}
      <div className="flex items-center justify-between w-full sm:w-auto gap-2 rounded-full bg-white/30 backdrop-blur-md border border-white/50 px-2 py-1 shadow-lg">
        <button type="button" onClick={toggle} className="rounded-full bg-pasko-gold/90 px-4 py-2 text-sm font-semibold text-pasko-forest transition hover:bg-pasko-gold focus:outline-none">
          {playing ? "⏸ Pause" : "🎵 Patugtugin ang Pasko"}
        </button>
        <button type="button" onClick={() => setMuted(!muted)} className="rounded-full p-2 text-pasko-forest transition hover:bg-white/20 focus:outline-none">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}