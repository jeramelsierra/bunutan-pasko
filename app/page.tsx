import Link from "next/link";
import { ParolRow } from "@/components/ParolRow";
import { MusicToggle } from "@/components/MusicToggle";
import { CopyBlock } from "@/components/CopyBlock";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,200,87,0.28) 0%, transparent 60%)",
        }}
      />

      <section className="relative pt-8">
        <ParolRow count={7} />
      </section>

      <section className="relative mx-auto max-w-3xl px-6 pt-4 pb-16 text-center animate-fade-up">
        <p className="mb-3 inline-block rounded-full border border-pasko-gold/40 bg-pasko-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-pasko-red">
          Maligayang Pasko po!
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight text-pasko-forest">
          Bunutan
          <span className="block text-pasko-red">Pasko</span>
        </h1>

        <p className="mt-4 font-display text-lg sm:text-2xl italic text-pasko-forest">
          A Filipino Christmas tradition, made easier to share.
        </p>

        <p className="mt-6 text-sm sm:text-lg leading-relaxed text-pasko-ink/80 max-w-2xl mx-auto">
          I created Bunutan Pasko to bring our familiar exchange-gift tradition into a simpler, more accessible space. Whether you're celebrating with family, friends, or your barkada, you can organize your bunutan, share your wishlists, and look forward to the big reveal—all in one place.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/create" className="btn-primary text-base">
            🎁 Gumawa ng Room
          </Link>
          <Link href="/join" className="btn-secondary text-base">
            🔑 Sumali sa Room
          </Link>
        </div>

        <div className="mt-6 flex justify-center items-center gap-2">
          <span className="text-pasko-ink/40 text-sm">Are you the host?</span>
          <Link
            href="/admin/login"
            className="text-sm font-semibold text-pasko-red hover:text-pasko-red-soft underline decoration-pasko-red/30 underline-offset-4 transition-all hover:decoration-pasko-red"
          >
            Admin Login →
          </Link>
        </div>

        <p className="mt-6 text-sm text-pasko-ink/60 max-w-md mx-auto">
          No sign-up needed. Just a room code, your name, and a{" "}
          <span className="font-semibold text-pasko-forest">6-digit PIN</span>{" "}
          to keep your wishes private and rejoin the room again.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <CopyBlock />
      </section>

      <section className="mx-auto max-w-4xl px-6 pt-8 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="card text-left relative overflow-hidden">
            <div className="mb-4 font-display text-4xl font-bold text-pasko-gold/30 absolute right-4 top-2">01</div>
            <h3 className="mb-2 font-display text-lg font-semibold text-pasko-forest relative z-10">Create a Room</h3>
            <p className="text-sm leading-relaxed text-pasko-ink/75 relative z-10">
              Ikaw ang magiging host! Set your group's budget and reveal date, then create a room where everyone can join the Christmas bunutan.
            </p>
          </div>

          <div className="card text-left relative overflow-hidden">
            <div className="mb-4 font-display text-4xl font-bold text-pasko-gold/30 absolute right-4 top-2">02</div>
            <h3 className="mb-2 font-display text-lg font-semibold text-pasko-forest relative z-10">Invite Your Group</h3>
            <p className="text-sm leading-relaxed text-pasko-ink/75 relative z-10">
              Share your 5-character room code with your family or barkada. Each member can set up a personal 6-digit PIN and add their wishlist before the draw.
            </p>
          </div>

          <div className="card text-left relative overflow-hidden">
            <div className="mb-4 font-display text-4xl font-bold text-pasko-gold/30 absolute right-4 top-2">03</div>
            <h3 className="mb-2 font-display text-lg font-semibold text-pasko-forest relative z-10">Draw and Reveal</h3>
            <p className="text-sm leading-relaxed text-pasko-ink/75 relative z-10">
              Once everyone's ready, it's time for the bunutan! Find out kung sino ang iyong monito o monita, prepare your gifts, and look forward to sharing the excitement of the reveal.
            </p>
          </div>
        </div>

        <p className="mt-16 text-center text-sm text-pasko-ink/50">
          Made with love and joy by Asteor Studios, para sa tradisyong Paskong Pinoy. 🇵🇭🎄
        </p>
      </section>

      <MusicToggle />
    </main>
  );
}