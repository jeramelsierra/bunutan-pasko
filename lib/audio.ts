"use client";

import { useEffect, useRef, useState } from "react";

export type AudioController = {
  playing: boolean;
  muted: boolean;
  toggle: () => Promise<void>;
  setMuted: (m: boolean) => void;
  energy: number;
  ready: boolean;
  error: string | null;
};

const AUDIO_SRC = "/audio/pasko.mp3";
const MUTE_STORAGE_KEY = "bunutan_muted";

export function useAudioController(): AudioController {
  const [playing, setPlaying] = useState(false);
  const [muted, setMutedState] = useState(true);
  const [energy, setEnergy] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const smoothedRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (saved === "false") setMutedState(false);
  }, []);

  const ensureSetup = async () => {
    if (ctxRef.current && audioRef.current && analyserRef.current) return;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.muted = muted;
    audioRef.current = audio;

    await new Promise<void>((resolve, reject) => {
      const onReady = () => { cleanup(); resolve(); };
      const onErr = () => { cleanup(); reject(new Error("Could not load /audio/pasko.mp3")); };
      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", onReady);
        audio.removeEventListener("error", onErr);
      };
      audio.addEventListener("loadedmetadata", onReady);
      audio.addEventListener("error", onErr);
    });

    const Ctx =
      window.AudioContext ||
      (window as any).webkitAudioContext as typeof AudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.75;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(ctx.destination);

    setReady(true);
    startLoop();
  };

  const startLoop = () => {
    if (rafRef.current != null) return;
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buf = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(buf);
      const bassBins = Math.max(1, Math.floor(buf.length * 0.2));
      let sum = 0;
      for (let i = 0; i < bassBins; i++) sum += buf[i];
      const raw = sum / (bassBins * 255);

      const prev = smoothedRef.current;
      const next = raw > prev ? raw : prev * 0.92 + raw * 0.08;
      smoothedRef.current = next;

      setEnergy(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const toggle = async () => {
    setError(null);
    try {
      await ensureSetup();
      const ctx = ctxRef.current!;
      const audio = audioRef.current!;

      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        // Force the browser to wake up the AudioContext
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        audio.muted = muted;
        await audio.play();
        setPlaying(true);
      }
    } catch (e: any) {
      setError(e?.message ?? "Could not play audio.");
    }
  };

  const setMuted = (m: boolean) => {
    setMutedState(m);
    if (audioRef.current) audioRef.current.muted = m;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MUTE_STORAGE_KEY, String(m));
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      ctxRef.current?.close();
    };
  }, []);

  return { playing, muted, toggle, setMuted, energy, ready, error };
}