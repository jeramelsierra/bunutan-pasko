"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";

export default function AdminDashboard() {
  const { code } = useParams();
  const router = useRouter();
  
  // STATE DECLARATIONS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [drawing, setDrawing] = useState(false);

  const loadData = async () => {
    try {
      // 1. Fetch members (this will fail with 401 if you aren't the admin)
      const res = await fetch(`/api/rooms/${code}/members`);
      const json = await res.json();
      
      if (res.status === 401) {
        throw new Error("You are not the admin of this room. Please go back to the home page and create a new room.");
      }
      if (!res.ok) throw new Error(json.error || "Failed to load room");

      // 2. Fetch room details
      const meRes = await fetch("/api/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        // Handle response shape safely
        setRoom(meData.room || meData.data?.room);
      } else {
        // If the admin isn't a member yet, we just fallback
        setRoom({ code, name: "Admin Room", revealAt: new Date().toISOString(), drawnAt: null, revealPassed: false });
      }
      
      setMembers(json.members || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [code]);

  const handleDraw = async () => {
    if (!confirm("Are you sure? This will assign the monitos.")) return;
    setDrawing(true);
    try {
      const res = await fetch(`/api/rooms/${code}/draw`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to draw");
      alert("Bunutan successful! 🎉");
      loadData(); // Refresh the list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDrawing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-pasko-forest">Loading...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <p className="text-pasko-red font-semibold mb-4">{error}</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  );

  const isDrawn = !!room?.drawnAt;

  return (
    <main className="relative min-h-screen pb-24">
      <section className="relative pt-4 opacity-50 pointer-events-none"><ParolRow count={5} /></section>
      
      <div className="mx-auto max-w-3xl px-6 pt-8 space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-pasko-red">Admin Dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-pasko-forest">{room?.name || `Room ${code}`}</h1>
        </div>

        {/* Room Code Card */}
        <div className="card bg-pasko-gold/10 border-pasko-gold text-center py-8">
          <p className="text-sm text-pasko-forest/80 uppercase tracking-widest mb-2">Share this code with your group</p>
          <h2 className="font-mono text-6xl font-bold tracking-widest text-pasko-red">{code}</h2>
        </div>

        {/* Draw Button */}
        <div className="card">
          <h3 className="font-display text-xl font-bold text-pasko-forest mb-4">Bunutan Draw</h3>
          {room?.revealPassed ? (
            <p className="text-pasko-red font-semibold">The reveal date has passed. You cannot re-draw.</p>
          ) : isDrawn ? (
            <div className="space-y-4">
              <p className="text-pasko-forest font-semibold">✅ The bunutan has been drawn!</p>
              <p className="text-sm text-pasko-ink/70">Everyone will see their monito on {new Date(room.revealAt).toLocaleString()}</p>
              <button onClick={handleDraw} disabled={drawing} className="btn-secondary w-full">
                {drawing ? "Re-drawing..." : "Re-draw (only before reveal)"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-pasko-ink/70">Once all members have joined, trigger the draw to assign monitos anonymously.</p>
              <button onClick={handleDraw} disabled={drawing || members.length < 2} className="btn-primary w-full py-4 text-lg">
                {drawing ? "Drawing..." : "🎲 Trigger Bunutan"}
              </button>
              {members.length < 2 && <p className="text-sm text-pasko-red text-center">Need at least 2 members to draw.</p>}
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="card">
          <h3 className="font-display text-xl font-bold text-pasko-forest mb-4">Members ({members.length})</h3>
          <div className="divide-y divide-pasko-forest/10">
            {members.map((m: any) => (
              <div key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-pasko-forest">{m.name} {m.isAdmin && <span className="text-xs bg-pasko-gold/20 text-pasko-red px-2 py-0.5 rounded ml-2">Admin</span>}</p>
                  <p className="text-xs text-pasko-ink/60">Joined {new Date(m.joinedAt).toLocaleDateString()} • {m.wishCount} wishes</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${m.hasPin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {m.hasPin ? 'PIN set' : 'No PIN'}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-pasko-ink/60 py-4">No members have joined yet.</p>}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href={`/room/${code}`} className="text-sm font-semibold text-pasko-forest hover:text-pasko-red underline">
            Go to Member View →
          </Link>
        </div>
      </div>
      <MusicToggle />
    </main>
  );
}