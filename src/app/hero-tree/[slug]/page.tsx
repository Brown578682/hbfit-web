import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHeroBySlug, HERO_ENTRIES } from '@/lib/hero-tree-data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getHeroBySlug(slug)
  if (!entry) return { title: 'Hero Not Found | Honor Bound FIT' }
  return {
    title: `${entry.name} | The Hero Tree | Honor Bound FIT`,
    description: `Honor Bound FIT honors ${entry.name} — ${entry.rank}, ${entry.branch}`,
  }
}

export function generateStaticParams() {
  return HERO_ENTRIES.map((e) => ({ slug: e.slug }))
}

export default async function HeroTreeEntryPage({ params }: Props) {
  const { slug } = await params
  const entry = getHeroBySlug(slug)
  if (!entry) notFound()

  const paragraphs = entry.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const isUSSCole = !!entry.sailors?.length

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero image */}
      <section className="relative w-full h-[55vh] min-h-[340px] max-h-[600px] overflow-hidden">
        <Image
          src={entry.imageSrc}
          alt={entry.name}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />

        {/* Back link */}
        <div className="absolute top-6 left-6">
          <Link
            href="/hero-tree"
            className="font-montserrat text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            ← The Hero Tree
          </Link>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 text-center">
          <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-400 mb-2">
            {entry.branch}
          </p>
          <h1 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tight drop-shadow-lg">
            {entry.name}
          </h1>
          <p className="font-montserrat text-sm uppercase tracking-widest text-zinc-300 mt-2">
            {entry.rank}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Meta details card — individual heroes only */}
          {!isUSSCole && (
            <div className="mb-10 border border-zinc-800 rounded-lg p-6 bg-zinc-950">
              <dl className="flex flex-col gap-3">
                {[
                  ['Rank', entry.rank],
                  ['Branch / Agency', entry.branch],
                  entry.hometown ? ['Hometown', entry.hometown] : null,
                  entry.unit ? ['Unit', entry.unit] : null,
                  entry.submittedBy ? ['Submitted by', entry.submittedBy] : null,
                ]
                  .filter((item): item is [string, string] => item !== null)
                  .map(([key, val]) => (
                    <div key={key} className="flex gap-3">
                      <dt className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 whitespace-nowrap pt-0.5 min-w-[130px]">
                        {key}
                      </dt>
                      <dd className="font-lora text-sm text-zinc-300">{val}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}

          {/* Intro paragraphs */}
          <div className="flex flex-col gap-5 mb-12">
            {paragraphs.map((para, i) => (
              <p key={i} className="font-lora text-zinc-300 text-base leading-relaxed">
                {para}
              </p>
            ))}
            {isUSSCole && entry.submittedBy && (
              <p className="font-lora text-zinc-500 text-sm italic">
                Submitted by: {entry.submittedBy}
              </p>
            )}
          </div>

          {/* USS Cole: individual sailor entries */}
          {isUSSCole && entry.sailors && (
            <div className="space-y-8">
              {entry.sailors.map((sailor, i) => (
                <div key={i} className="border-t border-zinc-800 pt-8">
                  <h2 className="font-montserrat font-bold text-lg text-white mb-1">
                    {sailor.name}
                  </h2>
                  <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">
                    {sailor.rank}
                  </p>
                  <p className="font-montserrat text-xs text-zinc-600 mb-3">
                    {sailor.hometown}
                  </p>
                  <p className="font-lora text-zinc-300 text-base leading-relaxed">
                    {sailor.summary}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="w-16 h-px bg-zinc-700 mx-auto my-12" />

          <div className="text-center">
            <Link
              href="/hero-tree"
              className="font-montserrat uppercase tracking-widest text-sm border border-zinc-700 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors duration-200"
            >
              ← Back to The Hero Tree
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
