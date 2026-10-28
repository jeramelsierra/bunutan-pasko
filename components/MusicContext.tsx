"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAudioController } from "@/lib/audio";

const MusicCtx = createContext<any>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const controller = useAudioController();
  return <MusicCtx.Provider value={controller}>{children}</MusicCtx.Provider>;
}

export function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) {
    throw new Error("useMusic must be used inside <MusicProvider>");
  }
  return ctx;
}