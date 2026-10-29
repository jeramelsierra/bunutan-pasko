"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";

export default function MemberLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", pin: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/member-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Failed to login");
      
      router.push(`/room/${form.code.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen pb-24">
      <section className="relative pt-4 opacity-50 pointer-events-none"><ParolRow count={5} /></section>
      
      <div className="mx-auto max-w-md px-6 pt-8 animate-fade-up">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-pasko-forest hover:text-pasko-red">← Back to Home</Link>
        
        <h1 className="font-display text-3xl font-bold text-pasko-forest">Member Login</h1>
        <p className="mt-2 text-pasko-ink/70">Enter your room code and 6-digit PIN to rejoin.</p>

        {error && (
          <div className="mt-6 rounded-lg bg-pasko-red/10 p-4 text-sm text-pasko-red border border-pasko-red/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="label">Room Code</label>
            <input required type="text" placeholder="e.g. X7K2M" maxLength={5} className="input font-mono text-lg uppercase tracking-widest text-center" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="label">6-Digit PIN</label>
            <input required type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} placeholder="••••••" className="input font-mono text-center text-xl tracking-[0.5em]" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
      <MusicToggle />
    </main>
  );
}