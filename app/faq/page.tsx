import Link from "next/link";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";

export default function FAQPage() {
    return (
        <main className="relative min-h-screen pb-24">
            <section className="relative pt-4 opacity-50 pointer-events-none">
                <ParolRow count={5} />
            </section>

            <div className="mx-auto max-w-2xl px-6 pt-8 animate-fade-up">
                <Link href="/" className="mb-6 inline-block text-sm font-semibold text-pasko-forest hover:text-pasko-red">
                    ← Back to Home
                </Link>

                <h1 className="font-display text-4xl font-bold text-pasko-forest mb-2">Mga Tanong (FAQs)</h1>
                <p className="text-pasko-ink/70 mb-8">Everything you need to know about Bunutan Pasko.</p>

                <div className="space-y-4">

                    <div className="card">
                        <h2 className="font-display text-xl font-bold text-pasko-red mb-2">1. How do I log back in if I lost my PIN or cleared my browser?</h2>
                        <p className="text-sm text-pasko-ink/80">
                            Go to the <Link href="/member/login" className="text-pasko-forest font-semibold underline">Member Login</Link> page. Enter your 5-character Room Code and the 6-digit PIN you created when you first joined. If you forgot your PIN, ask your Admin to remove you from the room so you can join again.
                        </p>
                    </div>

                    <div className="card">
                        <h2 className="font-display text-xl font-bold text-pasko-red mb-2">2. Why does the link say "Failed to load room data" or "Site can't be reached"?</h2>
                        <p className="text-sm text-pasko-ink/80">
                            If you opened the link inside Messenger, Viber, or Facebook, the in-app browser sometimes blocks the login cookies. Tap the three dots (<strong>⋮</strong>) at the top right and choose <strong>"Open in Browser"</strong> (Chrome or Safari).
                        </p>
                    </div>

                    <div className="card">
                        <h2 className="font-display text-xl font-bold text-pasko-red mb-2">3. When and how do I see who my Monito/Monita is?</h2>
                        <p className="text-sm text-pasko-ink/80">
                            You will see their name automatically on your dashboard exactly at the <strong>Reveal Date & Time</strong> set by your Admin. Until then, you will just see a countdown timer!
                        </p>
                    </div>

                    <div className="card">
                        <h2 className="font-display text-xl font-bold text-pasko-red mb-2">4. Can I change my wishlist after saving it?</h2>
                        <p className="text-sm text-pasko-ink/80">
                            Yes! As long as the Wishlist Deadline hasn't passed. Just go to your dashboard and click the <strong>"✏️ Edit"</strong> button on your Wishlist card.
                        </p>
                    </div>

                    <div className="card">
                        <h2 className="font-display text-xl font-bold text-pasko-red mb-2">5. What does "Theme Only" mean?</h2>
                        <p className="text-sm text-pasko-ink/80">
                            Instead of a specific wishlist, your Admin might set a theme (e.g., "Something Red" or "A gift that reminds you of them"). You don't need to add a wishlist—just follow the theme when buying the gift!
                        </p>
                    </div>

                </div>

                <div className="text-center mt-12 space-y-4">
                    <p className="text-base text-pasko-forest font-semibold">
                        Got more questions not answered in the FAQs?
                    </p>
                    <p className="text-sm text-pasko-ink/70">
                        Contact us at <a href="mailto:hello@asteorstudios.com" className="text-pasko-red font-semibold hover:underline">hello@asteorstudios.com</a>
                    </p>
                    <div className="divider-hand mx-auto max-w-xs my-6">
                        <span className="text-xl text-pasko-gold">✦</span>
                    </div>
                    <p className="text-sm text-pasko-ink/50">
                        Still have questions? Message your Admin! 🎄
                    </p>
                </div>
            </div>
            <MusicToggle />
        </main>
    );
}