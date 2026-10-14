"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { MEMBERSHIP_PLANS } from "@/lib/plans";

const SELECTABLE = MEMBERSHIP_PLANS.filter(p => !p.joinHidden && !p.requiresApproval && p.stripePriceId);

export default function SelectPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const choose = async (slug: string) => {
    setLoading(slug);
    setError("");
    try {
      const res = await fetch("/api/member/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: slug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(null);
      }
    } catch {
      setError("Network error — please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back */}
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 font-montserrat text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={13} /> Back to Settings
        </Link>

        {/* Header */}
        <div>
          <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">Choose Your Plan</h1>
          <p className="font-lora text-zinc-400 mt-2">
            Select the membership that fits your training goals. You'll be taken to a secure checkout to set up billing.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 font-montserrat text-sm">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4">
          {SELECTABLE.map(plan => (
            <div
              key={plan.slug}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-montserrat font-bold text-lg text-white">{plan.name}</h2>
                </div>
                <p className="font-lora text-zinc-400 text-sm leading-relaxed">{plan.description}</p>
                <p className="font-montserrat font-bold text-white mt-1">
                  ${(plan.price / 100).toFixed(0)}<span className="text-zinc-500 font-normal text-xs">/28 days</span>
                </p>
              </div>
              <button
                onClick={() => choose(plan.slug)}
                disabled={!!loading}
                className="shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors"
              >
                {loading === plan.slug
                  ? <><Loader2 size={13} className="animate-spin" /> Redirecting…</>
                  : <><CheckCircle2 size={13} /> Select</>
                }
              </button>
            </div>
          ))}
        </div>

        {/* GAP note */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex gap-4">
          <ShieldCheck size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-montserrat font-bold text-sm text-white">Guardian Angel Program (GAP)</p>
            <p className="font-lora text-zinc-400 text-sm mt-1">
              GAP memberships ($75/cycle) are available for veterans, active duty, first responders, medical students, and clergy.
              They require staff verification — <Link href="/contact" className="text-amber-400 hover:underline">contact us</Link> or speak to a coach to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
