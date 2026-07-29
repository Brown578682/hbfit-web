import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CORE_VALUES, getCoreValueBySlug } from "@/lib/coreValues";
import { ShareButtons } from "@/components/ShareButtons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CORE_VALUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const value = getCoreValueBySlug(slug);
  if (!value) return {};
  const url = `https://honorboundfit.com/core-values/${value.slug}`;
  const image = value.imageUrl ?? 'https://honorboundfit.com/wp-content/uploads/2025/06/Honor-Bound-FIT-logo-med.png';
  return {
    title: `Core Value #${value.number}: ${value.title} | Honor Bound FIT`,
    description: value.excerpt,
    openGraph: {
      title: `Core Value #${value.number}: ${value.title}`,
      description: value.excerpt,
      url,
      siteName: 'Honor Bound FIT',
      images: [{ url: image, width: 1200, height: 630, alt: value.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Core Value #${value.number}: ${value.title}`,
      description: value.excerpt,
      images: [image],
    },
  };
}

export default async function CoreValuePost({ params }: Props) {
  const { slug } = await params;
  const value = getCoreValueBySlug(slug);
  if (!value) notFound();

  const sorted = [...CORE_VALUES].sort((a, b) => a.number - b.number);
  const currentIdx = sorted.findIndex((v) => v.slug === slug);
  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <main className="bg-black text-white min-h-screen">

      {/* Hero — full bleed if image, plain header if not */}
      {value.imageUrl ? (
        <section className="relative w-full h-[55vh] min-h-[340px] max-h-[600px] overflow-hidden">
          <Image
            src={value.imageUrl}
            alt={value.title}
            fill
            priority
            className="object-cover object-center"
            unoptimized
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />

          {/* Back link */}
          <div className="absolute top-6 left-6">
            <Link
              href="/core-values"
              className="font-montserrat text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            >
              ← Core Values
            </Link>
          </div>

          {/* Counter */}
          <div className="absolute top-6 right-6">
            <span className="font-montserrat text-xs uppercase tracking-widest text-white/40">
              #{value.number} of {CORE_VALUES.length}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 text-center">
            <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-400 mb-2">
              Core Value #{value.number}
            </p>
            <h1 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tight leading-tight drop-shadow-lg">
              {value.title}
            </h1>
          </div>
        </section>
      ) : (
        <div className="border-b border-zinc-800 bg-zinc-950">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <Link
              href="/core-values"
              className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              ← Core Values
            </Link>
            <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mt-8 mb-4">
              Core Value #{value.number}
            </p>
            <h1 className="font-montserrat font-black text-4xl md:text-5xl uppercase tracking-tight leading-tight">
              {value.title}
            </h1>
          </div>
        </div>
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-16">

        {/* Lede */}
        <p className="font-lora text-xl text-zinc-300 leading-relaxed italic mb-12 border-l-4 border-zinc-700 pl-6">
          {value.excerpt}
        </p>

        {/* Body paragraphs */}
        <div className="space-y-6">
          {value.body.map((paragraph, i) => (
            <p
              key={i}
              className="font-lora text-base md:text-lg text-zinc-300 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share */}
        <ShareButtons
          url={`https://honorboundfit.com/core-values/${value.slug}`}
          title={`Core Value #${value.number}: ${value.title}`}
          excerpt={value.excerpt}
        />
      </article>

      {/* Prev / Next navigation */}
      <nav className="border-t border-zinc-800 mt-8">
        <div className="max-w-3xl mx-auto px-6 py-10 grid grid-cols-2 gap-6">
          {prev ? (
            <Link
              href={`/core-values/${prev.slug}`}
              className="group flex flex-col gap-1"
            >
              <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                ← Previous
              </span>
              <span className="font-montserrat font-bold text-sm text-zinc-400 group-hover:text-white transition-colors leading-snug">
                #{prev.number} — {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/core-values/${next.slug}`}
              className="group flex flex-col gap-1 text-right ml-auto"
            >
              <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                Next →
              </span>
              <span className="font-montserrat font-bold text-sm text-zinc-400 group-hover:text-white transition-colors leading-snug">
                #{next.number} — {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>

      {/* Back to list */}
      <div className="border-t border-zinc-800 py-12 text-center">
        <Link
          href="/core-values"
          className="font-montserrat uppercase tracking-widest text-sm border border-zinc-600 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors"
        >
          View All Core Values
        </Link>
      </div>
    </main>
  );
}
