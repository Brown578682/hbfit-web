"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Zap, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DropInPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail]     = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [error, setError]     = useState<string | null>(null);

  // If logged in, we already have their identity — no fields needed
  const isLoggedIn = !!session?.user;

  const purchase = async (type: "drop-in" | "ten-pack") => {
    // For 10-pack: require email + name if not logged in
    if (type === "ten-pack" && !isLoggedIn) {
      if (!email.trim()) { setError("Email is required to track your credits."); return; }
      if (!firstName.trim() || !lastName.trim()) { setError("First and last name are required."); return; }
    }
    setLoading(type);
    setError(null);
    try {
      const res  = await fetch("/api/drop-in/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          email:     isLoggedIn ? (session?.user?.email ?? undefined) : (email.trim() || undefined),
          firstName: isLoggedIn ? (session?.user?.name?.split(" ")[0] ?? undefined) : (firstName.trim() || undefined),
          lastName:  isLoggedIn ? (session?.user?.name?.split(" ").slice(1).join(" ") ?? undefined) : (lastName.trim() || undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-red-500 font-montserrat font-bold text-xs uppercase tracking-widest mb-2">No Commitment</p>
          <h1 className="font-montserrat text-4xl font-extrabold uppercase tracking-tight">Drop-In & Class Packs</h1>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Not ready for a membership? Pay per class or stock up with a 10-pack. No expiration, no contracts.
          </p>
        </div>

        {/* Identity fields — only shown when not logged in */}
        {!isLoggedIn && (
          <div className="mb-8 space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Kathleen"
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="King"
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">
                Email <span className="text-red-500">*</span>
                <span className="text-white/30 normal-case font-normal ml-1">— your credits are tied to this address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <p className="text-zinc-500 text-xs leading-relaxed">
              We&apos;ll create a free member account so you can track credits, book classes, and check your balance.
              {" "}<a href="/login" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">Already have an account? Sign in.</a>
            </p>
          </div>
        )}

        {/* Logged-in identity badge */}
        {isLoggedIn && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-white/10 text-sm text-zinc-300">
            <span className="text-green-500">✓</span>
            Signed in as <span className="text-white font-medium">{session?.user?.email}</span> — credits will be added to your account.
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Drop-In */}
          <div className="border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 flex items-center justify-center">
                <Zap size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-montserrat font-extrabold text-white uppercase tracking-wide text-sm">Drop-In</p>
                <p className="text-white/40 text-xs">Single class · 1 credit</p>
              </div>
            </div>
            <div>
              <span className="font-montserrat font-black text-4xl text-white">$10</span>
            </div>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> One class of your choice</li>
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> Book through the schedule</li>
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> Never expires</li>
            </ul>
            <button
              onClick={() => purchase("drop-in")}
              disabled={loading !== null}
              className={cn(
                "mt-auto w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors",
                loading === "drop-in" && "opacity-60 cursor-wait"
              )}
            >
              {loading === "drop-in" ? "Redirecting…" : "Buy Drop-In — $10"}
            </button>
          </div>

          {/* 10-Pack */}
          <div className="border border-red-600 bg-red-950/10 p-6 flex flex-col gap-4 relative">
            <div className="absolute top-3 right-3">
              <span className="bg-red-600 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-2 py-0.5">Best Value</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 flex items-center justify-center">
                <Package size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-montserrat font-extrabold text-white uppercase tracking-wide text-sm">10-Class Pack</p>
                <p className="text-white/40 text-xs">Ten classes · 10 credits</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-montserrat font-black text-4xl text-white">$50</span>
              <span className="text-zinc-400 text-sm mb-1.5">$5/class</span>
            </div>
            <ul className="space-y-1.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> 10 classes — use anytime</li>
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> Save 50% vs. drop-in rate</li>
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> Book through the schedule</li>
              <li className="flex items-center gap-2"><span className="text-red-500">✓</span> Never expires</li>
            </ul>
            <button
              onClick={() => purchase("ten-pack")}
              disabled={loading !== null}
              className={cn(
                "mt-auto w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors",
                loading === "ten-pack" && "opacity-60 cursor-wait"
              )}
            >
              {loading === "ten-pack" ? "Redirecting…" : "Buy 10-Pack — $50"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-800 text-red-400 text-sm">{error}</div>
        )}

        {/* Footer note */}
        <p className="mt-8 text-zinc-600 text-xs text-center leading-relaxed">
          Credits never expire and are tied to your account.
          Questions? <a href="/contact" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">Contact us.</a>
        </p>
      </main>
    </div>
  );
}
