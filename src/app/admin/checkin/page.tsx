"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Delete, RotateCcw } from "lucide-react";

// ── Mock member database (keyed by 4-digit code) ──────────────────────────────

const MEMBER_DB: Record<string, { name: string; plan: string }> = {
  "1001": { name: "Randy Franklin",  plan: "Base Membership" },
  "1002": { name: "Cookie Ainsworth", plan: "GAP Program" },
  "1003": { name: "Richard Lim",     plan: "GAP Program" },
  "1004": { name: "Brandi Long",     plan: "Small Group Training" },
  "1005": { name: "Tamara Okafor",   plan: "Base Membership" },
  "1006": { name: "DeShawn Morris",  plan: "10-Class Pack" },
  "1007": { name: "Heather Valdez",  plan: "Small Group Training" },
  "1008": { name: "Marcus Webb",     plan: "GAP Program" },
  "1009": { name: "Jasmine Torres",  plan: "Base Membership" },
  "1010": { name: "Tyler Reeves",    plan: "Personal Training" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface CheckinRecord {
  name: string;
  plan: string;
  time: string;
  code: string;
}

type CheckinResult =
  | { ok: true; name: string; plan: string }
  | { ok: false }
  | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function lookupCode(code: string): CheckinResult {
  const member = MEMBER_DB[code];
  if (member) return { ok: true, ...member };
  return { ok: false };
}

// ── Component ─────────────────────────────────────────────────────────────────

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "GO"];

export default function CheckinPage() {
  const [code, setCode]           = useState("");
  const [result, setResult]       = useState<CheckinResult>(null);
  const [history, setHistory]     = useState<CheckinRecord[]>([]);

  function handleKey(key: string) {
    if (key === "CLR") {
      setCode("");
      setResult(null);
      return;
    }
    if (key === "GO") {
      submit(code);
      return;
    }
    if (code.length < 4) {
      setCode((c) => c + key);
    }
  }

  function submit(c: string) {
    const trimmed = c.trim();
    if (trimmed.length === 0) return;
    const res = lookupCode(trimmed);
    setResult(res);
    if (res && res.ok) {
      setHistory((prev) => [
        { name: res.name, plan: res.plan, time: nowTime(), code: trimmed },
        ...prev.slice(0, 9),
      ]);
    }
    // Auto-clear after 3 s
    setTimeout(() => {
      setCode("");
      setResult(null);
    }, 3000);
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(code);
  }

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col items-center gap-8">
      {/* Header */}
      <div className="text-center mt-4">
        <h1 className="font-montserrat font-black text-4xl uppercase tracking-widest text-white">
          Check-In
        </h1>
        <p className="font-lora text-zinc-500 mt-1 text-lg">
          Enter your 4-digit member code
        </p>
      </div>

      {/* Code Display */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-16 h-20 flex items-center justify-center rounded-xl border-2 text-4xl font-montserrat font-black transition-colors ${
              code[i]
                ? "border-red-500 bg-red-500/10 text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-700"
            }`}
          >
            {code[i] ? "●" : "—"}
          </div>
        ))}
      </div>

      {/* Result Card */}
      {result !== null && (
        <div
          className={`w-full max-w-sm rounded-2xl p-6 border-2 text-center transition-all ${
            result.ok
              ? "border-green-500 bg-green-500/10"
              : "border-red-500 bg-red-500/10"
          }`}
        >
          {result.ok ? (
            <>
              <CheckCircle2 className="text-green-400 mx-auto mb-3" size={48} />
              <p className="font-montserrat font-black text-2xl text-green-400">Welcome!</p>
              <p className="font-montserrat font-bold text-xl text-white mt-1">{result.name}</p>
              <p className="font-lora text-zinc-400 mt-1">{result.plan}</p>
            </>
          ) : (
            <>
              <XCircle className="text-red-400 mx-auto mb-3" size={48} />
              <p className="font-montserrat font-black text-2xl text-red-400">Not Found</p>
              <p className="font-lora text-zinc-400 mt-1">
                Code not recognised. Please try again or see the front desk.
              </p>
            </>
          )}
        </div>
      )}

      {/* Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3">
        {KEYPAD_KEYS.map((key) => {
          const isGo  = key === "GO";
          const isClr = key === "CLR";
          return (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={`h-18 py-5 rounded-2xl font-montserrat font-black text-2xl flex items-center justify-center transition-all active:scale-95 select-none ${
                isGo
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
                  : isClr
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
            >
              {isClr ? <Delete size={24} /> : key}
            </button>
          );
        })}
      </div>

      {/* Text Input fallback */}
      <form onSubmit={handleTextSubmit} className="flex items-center gap-3 w-full max-w-xs">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{1,4}"
          maxLength={4}
          value={code}
          onChange={(e) => {
            setResult(null);
            setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
          }}
          placeholder="or type code…"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center text-2xl font-montserrat font-bold text-white tracking-widest placeholder-zinc-700 focus:outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-montserrat font-bold transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={16} />
          Go
        </button>
      </form>

      {/* Today's Check-in History */}
      <div className="w-full max-w-lg">
        <h2 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-500 mb-3">
          Today&apos;s Check-ins ({history.length})
        </h2>
        {history.length === 0 ? (
          <p className="text-center font-lora text-zinc-600 py-6">No check-ins yet today.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3"
              >
                <div>
                  <p className="font-montserrat font-bold text-sm text-white">{h.name}</p>
                  <p className="font-lora text-xs text-zinc-500">{h.plan}</p>
                </div>
                <span className="font-montserrat text-sm text-zinc-400">{h.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
