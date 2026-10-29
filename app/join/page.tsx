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
      <section className="relative pt-4 opacity-50 pointer-events-none">
        <ParolRow count={5} />
      </section>

      <div className="mx-auto max-w-md px-6 pt-8 animate-fade-up">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-pasko-forest hover:text-pasko-red">
          ← Back to Home
        </Link>

        <h1 className="font-display text-3xl font-bold text-pasko-forest">Sumali sa Room</h1>
        <p className="mt-2 text-pasko-ink/70">Enter the 5-character code from your admin.</p>

        {/* ADD THIS NEW BANNER */}
        <div className="mt-4 rounded-lg bg-pasko-gold/10 border border-pasko-gold/30 p-3 text-xs text-pasko-forest/80 text-center">
          💡 <strong>Tip:</strong> If you are opening this link from Messenger or Viber, tap the three dots (<strong>⋮</strong>) at the top right and choose <strong>"Open in Browser"</strong> to ensure your login works correctly.
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-pasko-red/10 p-4 text-sm text-pasko-red border border-pasko-red/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="label">Room Code</label>
            <input
              required
              type="text"
              placeholder="e.g. X7K2M"
              maxLength={5}
              className="input font-mono text-lg uppercase tracking-widest text-center"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className="label">Your Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Maria"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">6-Digit PIN for Relogin</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="••••••"
              className="input font-mono tracking-widest"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
            />
            <p className="mt-1 text-xs text-pasko-ink/60">
              Use this PIN to log back in if you clear your browser or use a new device. Make sure your PIN is unique.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-secondary w-full py-4 text-lg">
            <span>{loading ? "Joining..." : "Join Room"}</span>
          </button>

          <div className="mt-6 text-center border-t border-pasko-forest/10 pt-6">
            <p className="text-sm text-pasko-ink/60">
              Already joined this room?{" "}
              <Link
                href="/member/login"
                className="font-semibold text-pasko-red hover:underline"
              >
                Log in here
              </Link>
            </p>
          </div>
        </form>
      </div>
      <MusicToggle />
    </main>
  );
}