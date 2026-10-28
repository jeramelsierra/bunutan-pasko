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
      
      // Safely load the data directly
      setData(json);
      setWishlist(json.ownWishlist || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      alert("Wish list saved!");
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
  const isWishlistLocked = room.wishlistLocked;
  const showWishlist = room.giftMode === "wishlist" || room.giftMode === "both";

  return (
    <main className="relative min-h-screen pb-24">
      <section className="relative pt-4 opacity-50 pointer-events-none">
        <ParolRow count={5} />
      </section>

      <div className="mx-auto max-w-2xl px-6 pt-8 space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-pasko-red">{room.name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-pasko-forest">
            {room.revealPassed ? "Maligayang Pasko!" : timeLeft}
          </h1>
          <p className="mt-2 text-pasko-ink/60">
            Budget: {room.priceRange} • Joined as {data.me.name}
          </p>
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
                      {w.url && (
                        <a href={w.url} target="_blank" rel="noreferrer" className="text-sm text-pasko-gold underline break-all mt-1 block">
                          View Link
                        </a>
                      )}
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
            {isWishlistLocked ? (
              <p className="text-sm text-pasko-red font-semibold mb-4">🔒 Wishlist is locked (deadline passed).</p>
            ) : (
              <p className="text-sm text-pasko-ink/60 mb-4">Only your monito will see this after the reveal.</p>
            )}
            
            <div className="space-y-4">
              {[1, 2, 3].map((pos) => {
                const item = wishlist.find(w => w.position === pos) || { position: pos, text: "", url: "" };
                return (
                  <div key={pos} className="flex gap-3">
                    <div className="font-display text-2xl text-pasko-gold pt-2">{pos}.</div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="What do you want?"
                        disabled={isWishlistLocked}
                        className="input py-2 text-sm"
                        value={item.text}
                        onChange={(e) => {
                          const newW = wishlist.filter(w => w.position !== pos);
                          newW.push({ ...item, text: e.target.value });
                          setWishlist(newW);
                        }}
                      />
                      <input
                        type="url"
                        placeholder="Link (optional)"
                        disabled={isWishlistLocked}
                        className="input py-1 text-xs"
                        value={item.url || ""}
                        onChange={(e) => {
                          const newW = wishlist.filter(w => w.position !== pos);
                          newW.push({ ...item, url: e.target.value });
                          setWishlist(newW);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {!isWishlistLocked && (
              <button
                onClick={handleSaveWishlist}
                disabled={savingWish}
                className="btn-secondary w-full mt-6"
              >
                {savingWish ? "Saving..." : "Save Wish List"}
              </button>
            )}
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