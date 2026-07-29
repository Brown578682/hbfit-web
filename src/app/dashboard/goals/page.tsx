"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Trophy, Trash2 } from "lucide-react";
import GoalSelector, { type SelectedGoal } from "@/components/GoalSelector";
import { GOAL_CATEGORIES } from "@/lib/goalSuggestions";

interface SavedGoal {
  id: string;
  title: string;
  description: string | null;
  completedAt: string | null;
  createdAt: string;
  milestones: Array<{ achievedAt: string | null }>;
}

interface HouseholdMemberGoals {
  id: string;
  firstName: string;
  lastName: string;
  goals: Array<{
    id: string;
    title: string;
    description: string | null;
    targetDate: string | null;
    createdAt: string;
    milestones: Array<{ achievedAt: string | null }>;
  }>;
}

function parseMeta(description: string | null) {
  if (!description) return { text: "", category: "", sport: "" };
  const cat = description.match(/\[category:([^\]]+)\]/)?.[1] ?? "";
  const sport = description.match(/\[sport:([^\]]+)\]/)?.[1] ?? "";
  const text = description.replace(/\[\w+:[^\]]+\]/g, "").trim();
  return { text, category: cat, sport };
}

const TABS = [
  { id: "current" as const, label: "My Goals" },
  { id: "household" as const, label: "Family" },
  { id: "pick" as const, label: "Add Goals" },
];

export default function GoalsPage() {
  const [saved, setSaved] = useState<SavedGoal[]>([]);
  const [selected, setSelected] = useState<SelectedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [tab, setTab] = useState<"pick" | "current" | "household">("current");
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMemberGoals[]>([]);
  const [householdLoaded, setHouseholdLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/member/goals")
      .then((r) => r.json())
      .then((data: SavedGoal[]) => { if (Array.isArray(data)) setSaved(data); })
      .finally(() => setLoading(false));
  }, []);

  async function saveGoals() {
    if (selected.length === 0) return;
    setSaving(true);
    setSavedOk(false);
    try {
      const res = await fetch("/api/member/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: selected }),
      });
      if (res.ok) {
        const created = await res.json();
        setSaved((prev) => [...prev, ...created]);
        setSelected([]);
        setSavedOk(true);
        setTab("current");
        setTimeout(() => setSavedOk(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeGoal(goalId: string) {
    setRemoving(goalId);
    try {
      await fetch("/api/member/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });
      setSaved((prev) => prev.filter((g) => g.id !== goalId));
    } finally {
      setRemoving(null);
    }
  }

  const handleTabClick = (id: typeof tab) => {
    setTab(id);
    if (id === "household" && !householdLoaded) {
      fetch("/api/member/household/goals")
        .then((r) => r.json())
        .then((d) => { setHouseholdMembers(Array.isArray(d) ? d : []); setHouseholdLoaded(true); });
    }
  };

  const active = saved.filter((g) => !g.completedAt);
  const completed = saved.filter((g) => g.completedAt);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-montserrat font-bold">
          <ChevronLeft size={16} /> Dashboard
        </Link>
        <span className="font-montserrat font-bold text-sm uppercase tracking-wider">My Goals</span>
        <div className="w-24" />
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div>
          <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">90-Day Goals</h1>
          <p className="mt-1 text-zinc-400 text-sm">
            {active.length} active goal{active.length !== 1 ? "s" : ""} · {completed.length} completed
          </p>
        </div>

        {savedOk && (
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl px-5 py-4 text-emerald-400 text-sm font-montserrat font-bold">
            ✓ Goals saved. Your coaches can see them now.
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabClick(t.id)}
              className={`px-5 py-3 text-sm font-montserrat font-bold uppercase tracking-wider border-b-2 transition-colors ${
                tab === t.id
                  ? "border-red-600 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── My Goals ── */}
        {tab === "current" && (
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && active.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <p className="text-zinc-500">No active goals yet.</p>
                <button type="button" onClick={() => setTab("pick")}
                  className="bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-3 rounded-lg text-sm transition-colors">
                  Pick Your Goals
                </button>
              </div>
            )}
            {active.map((goal) => {
              const { text, category, sport } = parseMeta(goal.description);
              const cat = GOAL_CATEGORIES.find((c) => c.id === category);
              const sportObj = cat?.sports?.find((s) => s.id === sport);
              return (
                <div key={goal.id} className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {cat && <span className="text-base">{cat.emoji}</span>}
                      {sportObj && <span className="text-xs text-zinc-500 font-montserrat">{sportObj.emoji} {sportObj.label}</span>}
                      {cat && !sportObj && <span className="text-xs text-zinc-500 font-montserrat">{cat.label}</span>}
                    </div>
                    <p className="font-semibold text-white text-sm leading-snug">{goal.title}</p>
                    {text && <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{text}</p>}
                  </div>
                  <button type="button" onClick={() => removeGoal(goal.id)} disabled={removing === goal.id}
                    className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40 mt-0.5" title="Remove goal">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            {completed.length > 0 && (
              <div className="mt-8">
                <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-500" /> Completed
                </h2>
                <div className="space-y-3">
                  {completed.map((goal) => {
                    const { category } = parseMeta(goal.description);
                    const cat = GOAL_CATEGORIES.find((c) => c.id === category);
                    return (
                      <div key={goal.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 flex items-start gap-3 opacity-70">
                        {cat && <span className="text-base mt-0.5">{cat.emoji}</span>}
                        <div>
                          <p className="font-semibold text-zinc-400 text-sm line-through">{goal.title}</p>
                          <p className="text-emerald-600 text-xs mt-0.5">
                            Completed {new Date(goal.completedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Family Goals ── */}
        {tab === "household" && (
          <div className="space-y-8">
            {!householdLoaded && (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {householdLoaded && householdMembers.length === 0 && (
              <p className="text-zinc-500 text-center py-12">No other household members found.</p>
            )}
            {householdMembers.map((m) => (
              <div key={m.id}>
                <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  {m.firstName} {m.lastName}
                </h2>
                {m.goals.length === 0 ? (
                  <p className="text-zinc-600 text-sm">No active goals.</p>
                ) : (
                  <div className="space-y-3">
                    {m.goals.map((goal) => {
                      const { text, category, sport } = parseMeta(goal.description);
                      const cat = GOAL_CATEGORIES.find((c) => c.id === category);
                      const sportObj = cat?.sports?.find((s) => s.id === sport);
                      return (
                        <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {cat && <span className="text-base">{cat.emoji}</span>}
                            {sportObj && <span className="text-xs text-zinc-500 font-montserrat">{sportObj.emoji} {sportObj.label}</span>}
                            {cat && !sportObj && <span className="text-xs text-zinc-500 font-montserrat">{cat.label}</span>}
                          </div>
                          <p className="font-semibold text-white text-sm leading-snug">{goal.title}</p>
                          {text && <p className="text-zinc-500 text-xs mt-1">{text}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Add Goals ── */}
        {tab === "pick" && (
          <div className="space-y-6">
            <p className="text-zinc-400 text-sm">
              Select up to 5 goals to add to your active list. Your coaches will see these and tailor their guidance accordingly.
            </p>
            <GoalSelector onChange={useCallback((goals: SelectedGoal[]) => setSelected(goals), [])} />
            {selected.length > 0 && (
              <div className="sticky bottom-6 pt-4">
                <button type="button" onClick={saveGoals} disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xl">
                  <Save size={16} />
                  {saving ? "Saving..." : `Save ${selected.length} Goal${selected.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
