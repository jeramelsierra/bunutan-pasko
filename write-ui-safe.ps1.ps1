$ErrorActionPreference = "Stop"

function Write-File {
    param([string]$RelPath, [string]$Content)
    $full = Join-Path (Get-Location) $RelPath
    $dir = Split-Path $full -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    
    # Using Out-File with utf8 (no BOM) is the safest cross-version method
    $Content | Out-File -FilePath $full -Encoding utf8 -NoNewline
    Write-Host "  + $RelPath" -ForegroundColor Green
}

Write-Host "Writing components..." -ForegroundColor Yellow

Write-File "components\Parol.tsx" @'
"use client";

import { useEffect, useRef } from "react";
import { useMusic } from "./MusicContext";

type ParolProps = {
  size?: number;
  color?: string;
  idleDelay?: number;
};

export function Parol({ size = 96, color = "#D4A12A", idleDelay = 0 }: ParolProps) {
  const { energy, playing } = useMusic();
  const glowRef = useRef<SVGCircleElement | null>(null);
  const starRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const star = starRef.current;
    if (!glow || !star) return;

    let raf = 0;
    const tick = () => {
      const e = playing ? energy : 0;
      const glowOpacity = 0.35 + e * 0.6;
      const glowRadius = 22 + e * 8;
      const scale = 1 + e * 0.06;

      glow.setAttribute("opacity", String(glowOpacity));
      glow.setAttribute("r", String(glowRadius));
      star.setAttribute("transform", `translate(50 50) scale(${scale}) translate(-50 -50)`);

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
            <radialGradient id={`glow-grad-${color.replace("#", "")}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="60%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle ref={glowRef} cx="50" cy="50" r="22" fill={`url(#glow-grad-${color.replace("#", "")})`} opacity="0.35" />
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
'@

Write-File "components\ParolRow.tsx" @'
"use client";

import { Parol } from "./Parol";

export function ParolRow({ count = 7 }: { count?: number }) {
  const variants = [
    { size: 72, color: "#D4A12A", offset: -6, delay: 0 },
    { size: 96, color: "#B83232", offset: 0, delay: 400 },
    { size: 64, color: "#E8C468", offset: -10, delay: 800 },
    { size: 108, color: "#D4A12A", offset: 4, delay: 200 },
    { size: 64, color: "#B83232", offset: -10, delay: 600 },
    { size: 96, color: "#E8C468", offset: 0, delay: 1000 },
    { size: 72, color: "#D4A12A", offset: -6, delay: 300 },
    { size: 88, color: "#B83232", offset: 2, delay: 500 },
    { size: 68, color: "#E8C468", offset: -8, delay: 900 },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute left-0 right-0 top-6 h-px bg-gradient-to-r from-transparent via-pasko-red/40 to-transparent" aria-hidden />
      <div className="relative flex flex-wrap justify-center items-start gap-4 sm:gap-8 px-4 pt-2 pb-4">
        {Array.from({ length: count }).map((_, i) => {
          const v = variants[i % variants.length];
          return (
            <div key={i} style={{ transform: `translateY(${v.offset}px)` }}>
              <Parol size={v.size} color={v.color} idleDelay={v.delay} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
'@

Write-File "components\MusicToggle.tsx" @'
"use client";

import { useMusic } from "./MusicContext";

export function MusicToggle() {
  const { playing, muted, toggle, setMuted, error } = useMusic();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {error && (
        <div className="max-w-xs rounded-lg bg-pasko-red/95 px-3 py-2 text-xs text-pasko-cream shadow-lg">
          {error}. Drop <code className="font-mono">public/audio/pasko.mp3</code> to enable music.
        </div>
      )}
      <div className="flex items-center gap-2 rounded-full bg-pasko-forest/90 px-2 py-1 shadow-lg backdrop-blur-sm">
        <button type="button" onClick={toggle} className="rounded-full bg-pasko-gold px-4 py-2 text-sm font-semibold text-pasko-forest transition hover:bg-pasko-gold-soft focus:outline-none">
          {playing ? "⏸ Pause" : "🎵 Patugtugin ang Pasko"}
        </button>
        <button type="button" onClick={() => setMuted(!muted)} className="rounded-full p-2 text-pasko-cream transition hover:bg-white/10 focus:outline-none">
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
'@

Write-File "components\CopyBlock.tsx" @'
export function CopyBlock() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="divider-hand mx-auto max-w-xs">
        <span className="text-2xl">✦</span>
      </div>
      <p className="font-display text-xl leading-relaxed text-pasko-forest sm:text-2xl">
        Bawat Pasko, may isang taong naghihintay.<br />
        Sa bunutan, ikaw ang magiging Pasko nila —<br />
        at may isa ring magiging Pasko mo.
      </p>
      <p className="text-base leading-relaxed text-pasko-ink/80">
        Every Christmas, one person is waiting for a small sign that they are seen. The <em>bunutan</em> was never just about gifts — it was our lola&apos;s way of teaching us to notice each other. To remember that in a family, or a barkada, no one is forgotten.
      </p>
      <p className="font-display text-lg italic text-pasko-red">
        Ipagpatuloy natin ang tradisyon. 🎄
      </p>
      <div className="divider-hand mx-auto max-w-xs">
        <span className="text-2xl">✦</span>
      </div>
    </div>
  );
}
'@

Write-Host "Writing pages..." -ForegroundColor Yellow

Write-File "app\create\page.tsx" @'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";
import type { GiftMode } from "@/lib/validation";

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    priceRange: "₱300 - ₱500",
    revealAt: "",
    wishlistDeadline: "",
    adminName: "",
    giftMode: "wishlist" as GiftMode,
    theme: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");
      router.push(`/room/${data.room.code}/admin`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen pb-24">
      <section className="relative pt-4 opacity-50 pointer-events-none"><ParolRow count={5} /></section>
      <div className="mx-auto max-w-xl px-6 pt-8">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-pasko-forest hover:text-pasko-red">← Back to Home</Link>
        <h1 className="font-display text-3xl font-bold text-pasko-forest">Gumawa ng Room</h1>
        <p className="mt-2 text-pasko-ink/70">Set up your monito monita group.</p>

        {error && <div className="mt-6 rounded-lg bg-pasko-red/10 p-4 text-sm text-pasko-red border border-pasko-red/20">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="label">Your Name (Admin)</label>
            <input required type="text" placeholder="e.g. Maria" className="input" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
          </div>
          <div>
            <label className="label">Room Name</label>
            <input required type="text" placeholder="e.g. Cruz Family Pasko 2025" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Price Range / Budget</label>
            <input required type="text" placeholder="e.g. ₱500 max" className="input" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} />
          </div>
          <div>
            <label className="label">Gift Mode</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "wishlist", title: "Wish Lists", desc: "Members list up to 3 wishes." },
                { id: "theme", title: "Theme Only", desc: "No wishlists, just a theme." },
                { id: "both", title: "Both", desc: "Wishlists + a theme." },
              ].map((mode) => (
                <div key={mode.id} onClick={() => setForm({ ...form, giftMode: mode.id as GiftMode })} className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${form.giftMode === mode.id ? "border-pasko-gold bg-pasko-gold/10 shadow-sm" : "border-pasko-forest/20 hover:border-pasko-gold/50"}`}>
                  <div className="font-semibold text-pasko-forest">{mode.title}</div>
                  <div className="mt-1 text-xs text-pasko-ink/60">{mode.desc}</div>
                </div>
              ))}
            </div>
          </div>
          {form.giftMode !== "wishlist" && (
            <div className="animate-fade-in">
              <label className="label">Theme</label>
              <input required={form.giftMode === "theme"} type="text" placeholder="e.g. something red, a gift that reminds you of them..." className="input" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Wishlist Deadline</label>
              <input required type="datetime-local" className="input" value={form.wishlistDeadline} onChange={(e) => setForm({ ...form, wishlistDeadline: e.target.value })} />
            </div>
            <div>
              <label className="label">Reveal Date & Time</label>
              <input required type="datetime-local" className="input" value={form.revealAt} onChange={(e) => setForm({ ...form, revealAt: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">{loading ? "Creating..." : "Create Room"}</button>
        </form>
      </div>
      <MusicToggle />
    </main>
  );
}
'@

Write-File "app\join\page.tsx" @'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";

export default function JoinRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", name: "", pin: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${form.code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, pin: form.pin || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room");
      router.push(`/room/${form.code.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen pb-24">
      <section className="relative pt-4 opacity-50 pointer-events-none"><ParolRow count={5} /></section>
      <div className="mx-auto max-w-md px-6 pt-8">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-pasko-forest hover:text-pasko-red">← Back to Home</Link>
        <h1 className="font-display text-3xl font-bold text-pasko-forest">Sumali sa Room</h1>
        <p className="mt-2 text-pasko-ink/70">Enter the 5-character code from your admin.</p>
        {error && <div className="mt-6 rounded-lg bg-pasko-red/10 p-4 text-sm text-pasko-red border border-pasko-red/20">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="label">Room Code</label>
            <input required type="text" placeholder="e.g. X7K2M" maxLength={5} className="input font-mono text-lg uppercase tracking-widest text-center" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="label">Your Name</label>
            <input required type="text" placeholder="e.g. Juan" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">6-Digit PIN (Optional)</label>
            <input type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="e.g. 123456" className="input font-mono" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} />
            <p className="mt-1 text-xs text-pasko-ink/60">Keeps your wish list private if someone else uses your device.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-secondary w-full py-4 text-lg">{loading ? "Joining..." : "Join Room"}</button>
        </form>
      </div>
      <MusicToggle />
    </main>
  );
}
'@

Write-File "app\room\[code]\page.tsx" @'
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";

type WishlistItem = { position: number; text: string; url: string | null };

export default function MemberDashboard() {
  const { code } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [savingWish, setSavingWish] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        if (res.status === 401) return router.push("/join");
        throw new Error("Failed to load room data");
      }
      const json = await res.json();
      setData(json.data);
      setWishlist(json.data.ownWishlist || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!data?.room?.revealAt) return;
    const revealTime = new Date(data.room.revealAt).getTime();
    const tick = () => {
      const now = new Date().getTime();
      const diff = revealTime - now;
      if (diff <= 0) {
        setTimeLeft("Revealed!");
        if (data.room.revealPassed === false) loadData();
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data?.room?.revealAt, data?.room?.revealPassed]);

  const handleSaveWishlist = async () => {
    setSavingWish(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: wishlist.filter(w => w.text.trim()) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingWish(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-pasko-forest">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-pasko-red">{error}</div>;

  const { room, assignment } = data;
  const isLocked = room.wishlistLocked;
  const showWishlist = room.giftMode === "wishlist" || room.giftMode === "both";

  return (
    <main className="relative min-h-screen pb-24">
      <section className="relative pt-4 opacity-50 pointer-events-none"><ParolRow count={5} /></section>
      <div className="mx-auto max-w-2xl px-6 pt-8 space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-pasko-red">{room.name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-pasko-forest">{room.revealPassed ? "Maligayang Pasko!" : timeLeft}</h1>
          <p className="mt-2 text-pasko-ink/60">Budget: {room.priceRange} • Joined as {data.me.name}</p>
        </div>
        {room.theme && (
          <div className="card bg-pasko-gold/10 border-pasko-gold text-center py-6">
            <h3 className="font-display text-xl font-bold text-pasko-red mb-2">🎨 Theme</h3>
            <p className="text-lg text-pasko-forest italic">"{room.theme}"</p>
          </div>
        )}
        {room.revealPassed && assignment && (
          <div className="card bg-pasko-forest text-pasko-cream shadow-xl animate-fade-up">
            <div className="text-center space-y-4">
              <p className="text-sm uppercase tracking-widest text-pasko-gold">You are the Monito/Monita of</p>
              <h2 className="font-display text-5xl font-bold text-white">{assignment.monitoName}</h2>
              <div className="my-6 h-px w-24 mx-auto bg-pasko-gold/30"></div>
              {assignment.wishlist.length > 0 ? (
                <div className="text-left space-y-3 max-w-md mx-auto">
                  <h3 className="text-sm uppercase tracking-widest text-pasko-gold">Their Wish List</h3>
                  {assignment.wishlist.map((w: any) => (
                    <div key={w.position} className="bg-black/20 p-3 rounded-lg">
                      <p>{w.text}</p>
                      {w.url && <a href={w.url} target="_blank" rel="noreferrer" className="text-sm text-pasko-gold underline break-all mt-1 block">View Link</a>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-pasko-cream/60 italic">They didn't add a wish list. Follow the theme!</p>
              )}
            </div>
          </div>
        )}
        {!room.revealPassed && showWishlist && (
          <div className="card">
            <h3 className="font-display text-xl font-bold text-pasko-forest mb-4">My Wish List (Max 3)</h3>
            {isLocked ? <p className="text-sm text-pasko-red font-semibold mb-4">🔒 Wishlist is locked (deadline passed).</p> : <p className="text-sm text-pasko-ink/60 mb-4">Only your monito will see this after the reveal.</p>}
            <div className="space-y-4">
              {[1, 2, 3].map((pos) => {
                const item = wishlist.find(w => w.position === pos) || { position: pos, text: "", url: "" };
                return (
                  <div key={pos} className="flex gap-3">
                    <div className="font-display text-2xl text-pasko-gold pt-2">{pos}.</div>
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="What do you want?" disabled={isLocked} className="input py-2 text-sm" value={item.text} onChange={(e) => { const newW = wishlist.filter(w => w.position !== pos); newW.push({ ...item, text: e.target.value }); setWishlist(newW); }} />
                      <input type="url" placeholder="Link (optional)" disabled={isLocked} className="input py-1 text-xs" value={item.url || ""} onChange={(e) => { const newW = wishlist.filter(w => w.position !== pos); newW.push({ ...item, url: e.target.value }); setWishlist(newW); }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {!isLocked && <button onClick={handleSaveWishlist} disabled={savingWish} className="btn-secondary w-full mt-6">{savingWish ? "Saving..." : "Save Wish List"}</button>}
          </div>
        )}
        {room.drawnAt && !room.revealPassed && (
           <div className="text-center p-6 bg-white/50 rounded-2xl border border-pasko-gold/20">
             <p className="text-pasko-forest font-semibold">🎉 The bunutan has been drawn!</p>
             <p className="text-sm text-pasko-ink/70 mt-1">Waiting for the reveal date to see who you got...</p>
           </div>
        )}
      </div>
      <MusicToggle />
    </main>
  );
}
'@

Write-Host ""
Write-Host "✅ UI files written successfully." -ForegroundColor Green