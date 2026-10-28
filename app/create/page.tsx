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
    adminPin: "", // <-- ADDED
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
          
          {/* NEW: Admin PIN Input */}
          <div>
            <label className="label">Create Admin PIN (6 digits)</label>
            <input required type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="••••••" className="input font-mono tracking-widest" value={form.adminPin} onChange={(e) => setForm({ ...form, adminPin: e.target.value.replace(/\D/g, "") })} />
            <p className="mt-1 text-xs text-pasko-ink/60">Use this PIN to log back into the Admin Dashboard later.</p>
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