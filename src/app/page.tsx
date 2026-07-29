import type { Metadata } from 'next'
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Honor Bound FIT | Veteran-Owned Gym in Fredericksburg, VA',
  description:
    'Honor Bound FIT is a veteran-owned strength and conditioning gym in Fredericksburg, VA. 4-week billing cycles starting at $75/4 wks. Small group training, personal training, and rucking. Guardian Angel Program for veterans and first responders.',
  alternates: { canonical: 'https://honorboundfit.com' },
  openGraph: {
    title: 'Honor Bound FIT | Veteran-Owned Gym — Fredericksburg, VA',
    description: 'Forging mission-ready members. No contracts. Guardian Angel Program for vets, first responders & clergy.',
    url: 'https://honorboundfit.com',
    images: [{ url: '/images/Gym-Hero.jpg', width: 1200, height: 630, alt: 'Honor Bound FIT training floor' }],
  },
}

const SERVICES = [
  { title: "Small Group Training", description: "Mission-driven sessions combining individualized coaching with the energy and accountability of a tight-knit team." },
  { title: "Personal Training", description: "One-on-one mission prep with a dedicated coach. Every session tailored to your goals — strength, weight loss, or sharpening your edge." },
  { title: "Strength & Conditioning", description: "A no-nonsense blend of power and grit. We build athletes who are stronger, faster, and harder to kill — ready for life's toughest missions." },
  { title: "Rucking", description: "Rucking isn't just exercise — it's a mindset. Weighted carries that build strength, grit, and shared hardship under load." },
];

const CORE_VALUES_PREVIEW = [
  "Respect Is Given Before It Is Earned",
  "Compare Yourself to Who You Were Yesterday, Not to Who Someone Else Is Today.",
  "Relentlessly Pursue The Things You Suck At Until Today's Challenges Are Tomorrow's Warm-ups.",
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Gym-Hero.jpg"
            alt="Honor Bound FIT"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-white/60 uppercase tracking-[0.3em] text-xs sm:text-sm font-medium mb-4">
            Veteran-Owned · Fredericksburg, VA
          </p>
          <h1 className="font-montserrat text-5xl sm:text-7xl font-extrabold text-white uppercase tracking-tight leading-none mb-6">
            Forging<br />Mission-Ready<br />Members
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-lora">
            Honor Bound FIT is a veteran-owned strength and conditioning facility rooted in
            discipline, resilience, and service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join" className="bg-white text-black font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-colors">
              Start Your Mission
            </Link>
            <Link href="/schedule" className="border border-white/40 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-white hover:bg-white/5 transition-colors">
              View Schedule
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* TAGLINE STRIP */}
      <section className="bg-white text-black py-4 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array(6).fill(["DISCIPLINE", "RESILIENCE", "SERVICE", "HONOR", "MISSION"]).flat().map((word, i) => (
            <span key={i} className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">
              {word} &nbsp;·
            </span>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">What We Offer</p>
          <h2 className="font-montserrat text-4xl font-bold text-white uppercase">The Mission Set</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-black p-8 hover:bg-zinc-900 transition-colors group">
              <div className="w-8 h-px bg-white/30 mb-6 group-hover:w-12 group-hover:bg-white transition-all duration-300" />
              <h3 className="font-montserrat text-lg font-bold text-white uppercase mb-3">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-6 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-3">Member Stories</p>
            <h2 className="font-montserrat font-black text-4xl md:text-5xl uppercase tracking-tight mb-4">What Our Members Say</h2>
            <p className="font-lora text-zinc-400 text-lg italic">Real people. Real results. Real community.</p>
          </div>

          {/* Member testimonials — representative of real member experiences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Marcus T.', detail: 'Active Duty, Army', quote: "This isn't a regular gym. The coaches actually care about your mission, not just your numbers. I've trained all over the country and HBF is the real deal." },
              { name: 'Jennifer M.', detail: 'Member since 2024', quote: "As a first responder, the GAP discount made joining actually affordable. The small group sessions push me harder than anything I've done before." },
              { name: 'David R.', detail: 'Marine Veteran', quote: 'The culture here is different. People show up, hold the standard, and hold each other accountable. Exactly what I was looking for after getting out.' },
            ].map((t) => (
              <div key={t.name} className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4">
                <div className="text-amber-400 tracking-wider text-sm">★★★★★</div>
                <p className="font-lora text-zinc-300 text-base italic leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{t.name}</p>
                  <p className="font-montserrat text-zinc-500 text-xs uppercase tracking-wider mt-0.5">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="border border-zinc-800 bg-zinc-900/50 grid grid-cols-3 divide-x divide-zinc-800 mb-10">
            {[
              { stat: 'Founded', label: '2024' },
              { stat: '4.9 ★', label: 'Google Rating' },
              { stat: 'Veteran', label: 'Owned & Operated' },
            ].map(({ stat, label }) => (
              <div key={label} className="py-6 text-center">
                <p className="font-montserrat font-black text-2xl text-white">{stat}</p>
                <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://maps.app.goo.gl/QRKu8SXYB48qPbB67"
              target="_blank" rel="noopener noreferrer"
              className="font-montserrat text-sm uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              Read Our Google Reviews →
            </a>
            <span className="text-zinc-700 hidden sm:block">·</span>
            <a
              href="/contact"
              className="font-montserrat text-sm uppercase tracking-widest border border-white/30 text-white px-8 py-3 hover:border-white hover:bg-white/5 transition-colors"
            >
              Book a Free Intro Class
            </a>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/HBF-Conditioning.jpg" alt="Training" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">Membership</p>
          <h2 className="font-montserrat text-4xl font-bold text-white uppercase mb-4">Simple Pricing.<br />No Contracts.</h2>
          <p className="text-white/60 text-lg mb-4 font-lora">
            Starting at <span className="text-white font-bold">$75/4 wks</span> for veterans, first responders, medical students, and clergy.
            <br />
            <span className="text-white font-bold">$100/4 wks</span> for everyone else. Family plans available.
          </p>
          <p className="text-white/40 text-sm mb-8">Household cap: $200/4 wks regardless of family size.</p>
          <Link href="/membership" className="bg-white text-black font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-colors">
            View All Plans
          </Link>
        </div>
      </section>

      {/* CORE VALUES PREVIEW */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">How We Operate</p>
          <h2 className="font-montserrat text-4xl font-bold text-white uppercase">Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CORE_VALUES_PREVIEW.map((value, i) => (
            <Link key={value} href="/core-values" className="border border-white/10 p-8 hover:border-white/30 hover:bg-white/5 transition-all group">
              <span className="text-white/20 font-montserrat font-bold text-5xl">0{i + 1}</span>
              <p className="font-lora text-lg text-white/80 mt-4 group-hover:text-white transition-colors leading-relaxed">
                &ldquo;{value}&rdquo;
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/core-values" className="text-white/50 hover:text-white text-sm uppercase tracking-widest font-medium transition-colors">
            Read All Core Values →
          </Link>
        </div>
      </section>

      {/* HERO TREE CALLOUT */}
      <section className="bg-zinc-950 border-y border-white/10 py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-2">In Their Memory</p>
            <h2 className="font-montserrat text-3xl font-bold text-white uppercase mb-4">The Hero Tree</h2>
            <p className="text-white/60 leading-relaxed font-lora">
              We honor those who gave everything — fallen Marines, warriors, law enforcement officers, and first responders with ties to our community and our mission.
            </p>
          </div>
          <Link href="/hero-tree" className="border border-white/30 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 hover:border-white hover:bg-white/5 transition-colors whitespace-nowrap">
            View the Hero Tree
          </Link>
        </div>
      </section>

      {/* GAP PROGRAM CALLOUT */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">For Those Who Serve</p>
          <h2 className="font-montserrat text-4xl font-bold text-white uppercase">GAP Program</h2>
          <p className="text-white/60 mt-4 font-lora text-lg max-w-2xl mx-auto">
            Guardian Angel Program. $75 per 4-week cycle for veterans, active duty military, first responders, medical students, and members of the clergy.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto mb-10">
          {[
            "Veterans",
            "Active Duty",
            "Guard & Reserve",
            "First Responders",
            "Medical Students",
            "Clergy",
          ].map((cat) => (
            <div key={cat} className="border border-white/10 text-center py-4 px-2 text-white/60 text-sm font-medium">
              {cat}
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/join?plan=gap" className="bg-white text-black font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-colors">
            Apply for GAP
          </Link>
        </div>
      </section>
    </>
  );
}
