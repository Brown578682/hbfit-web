import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Core Values | Honor Bound FIT',
  description:
    'Explore the 14 Core Values that define Honor Bound FIT—principles forged in service and lived out every day.',
}

const posts = [
  {
    number: 11,
    title: 'Respect Is Given Before It Is Earned',
    slug: 'respect-is-given-before-it-is-earned',
    excerpt:
      'Respect is not a reward for proven performance—it is the baseline we extend to every human being we encounter.',
  },
  {
    number: 10,
    title: 'Compare Yourself to Who You Were Yesterday…',
    slug: 'compare-yourself',
    excerpt:
      'The only competition that matters is the one between who you are today and who you were yesterday.',
  },
  {
    number: 9,
    title: 'Relentlessly Pursue The Things You Suck At…',
    slug: 'relentlessly-pursue',
    excerpt:
      "Today's greatest weaknesses are tomorrow's warm-ups—if you show up willing to do the uncomfortable work.",
  },
  {
    number: 8,
    title: 'Surround Yourself With Good People…',
    slug: 'surround-yourself',
    excerpt:
      'The people in your life either reinforce your values and commitments—or erode them. Choose deliberately.',
  },
  {
    number: 7,
    title: 'Regardless of Environment…Individuals are Responsible…',
    slug: 'regardless-of-environment',
    excerpt:
      'No matter the circumstances, opposition, or environment, you own your attitude, your behavior, and your outcomes.',
  },
  {
    number: 6,
    title: 'Good Friends Have Hard Conversations',
    slug: 'good-friends',
    excerpt:
      'A real friend tells you the truth—even when it costs them social comfort. Comfort is not the same as care.',
  },
  {
    number: 5,
    title: 'Children Belong to Their Parents',
    slug: 'children-belong-to-parents',
    excerpt:
      'The family unit is the foundational building block of any lasting civilization. Parents bear the sacred responsibility of raising the next generation.',
  },
  {
    number: 4,
    title: 'The Obstacle is the Way. Growth is Found in Suffering.',
    slug: 'the-obstacle-is-the-way',
    excerpt:
      'The resistance you face is not in your way—it is the way. Forging a stronger self requires heat.',
  },
  {
    number: 3,
    title: "A Man's Most Sacred Duty is to Protect Women and Children",
    slug: 'mans-most-sacred-duty',
    excerpt:
      "Strength is only meaningful when it is ordered toward protection. A man's greatest calling is to stand between the vulnerable and harm.",
  },
  {
    number: 1,
    title: 'Acknowledge Obey and Be Grateful',
    slug: 'acknowledge-obey-grateful',
    excerpt:
      'It is the duty of all nations to acknowledge, obey, and be grateful to almighty God—the source of all order and blessing.',
  },
  {
    number: 2,
    title: 'The Greatest Political Document Ever Written',
    slug: 'greatest-political-document',
    excerpt:
      'The United States Constitution stands alone as the greatest political document ever conceived—a covenant of ordered liberty.',
  },
]

export default function CoreValuesPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="py-28 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">
          Honor Bound FIT
        </p>
        <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-6">
          Core Values
        </h1>
        <div className="w-16 h-1 bg-white mx-auto mb-8" />
        <p className="font-lora text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed italic">
          Fourteen principles forged in service and lived out every day—on the ruck, in the gym,
          and in life.
        </p>
      </section>

      {/* Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/core-values/${post.slug}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-lg p-7 hover:border-zinc-500 hover:bg-zinc-800 transition-all duration-200 flex flex-col"
              >
                {/* Number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-montserrat font-black text-sm text-black bg-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {post.number}
                  </span>
                  <span className="font-montserrat text-xs tracking-widest uppercase text-zinc-500">
                    Core Value #{post.number}
                  </span>
                </div>

                <h2 className="font-montserrat font-bold text-lg leading-snug mb-3 group-hover:text-zinc-200 transition-colors">
                  {post.title}
                </h2>

                <p className="font-lora text-sm text-zinc-400 leading-relaxed flex-1 mb-5">
                  {post.excerpt}
                </p>

                <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors mt-auto">
                  Read More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Back to About CTA */}
      <section className="py-16 px-6 border-t border-zinc-800 text-center">
        <Link
          href="/about"
          className="font-montserrat uppercase tracking-widest text-sm border border-zinc-600 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors duration-200"
        >
          ← Back to About Us
        </Link>
      </section>
    </main>
  )
}
