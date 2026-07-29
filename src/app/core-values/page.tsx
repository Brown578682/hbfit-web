import type { Metadata } from "next";
import Link from "next/link";
import { CORE_VALUES } from "@/lib/coreValues";

export const metadata: Metadata = {
  title: "Core Values | Honor Bound FIT",
  description:
    "Fourteen principles forged in service and lived out every day—on the ruck, in the gym, and in life.",
};

export default function CoreValuesPage() {
  const sorted = [...CORE_VALUES].sort((a, b) => a.number - b.number);

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
          Fourteen principles forged in service and lived out every day—on the
          ruck, in the gym, and in life.
        </p>
      </section>

      {/* List */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <ol className="space-y-0">
            {sorted.map((value, idx) => (
              <li key={value.slug}>
                <Link
                  href={`/core-values/${value.slug}`}
                  className="group flex items-start gap-6 py-6 border-b border-zinc-800 hover:bg-zinc-950 -mx-4 px-4 transition-colors"
                >
                  {/* Number */}
                  <span className="font-montserrat font-black text-4xl text-zinc-700 group-hover:text-zinc-500 transition-colors w-10 shrink-0 leading-none mt-1 select-none">
                    {String(value.number).padStart(2, "0")}
                  </span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-montserrat font-bold text-lg text-white leading-snug mb-1 group-hover:text-zinc-200 transition-colors">
                      {value.title}
                    </h2>
                    <p className="font-lora text-sm text-zinc-500 leading-relaxed">
                      {value.excerpt}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="font-montserrat text-zinc-700 group-hover:text-white transition-colors text-lg mt-1 shrink-0">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Back */}
      <section className="py-16 px-6 border-t border-zinc-800 text-center">
        <Link
          href="/about"
          className="font-montserrat uppercase tracking-widest text-sm border border-zinc-600 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors duration-200"
        >
          ← Back to About Us
        </Link>
      </section>
    </main>
  );
}
