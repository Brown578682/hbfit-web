"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import {
  GOAL_CATEGORIES,
  CATEGORY_COLORS,
  TARGET_GOAL_COUNT,
  type GoalSuggestion,
  type GoalCategory,
} from "@/lib/goalSuggestions";

export interface SelectedGoal {
  suggestionId: string;
  title: string;
  description?: string;
  targetValue?: number;
  unit?: string;
  category: GoalCategory;
  sport?: string;
}

interface GoalSelectorProps {
  initial?: SelectedGoal[];
  onChange: (goals: SelectedGoal[]) => void;
  maxGoals?: number;
}

export default function GoalSelector({
  initial = [],
  onChange,
  maxGoals = TARGET_GOAL_COUNT,
}: GoalSelectorProps) {
  const [selected, setSelected] = useState<SelectedGoal[]>(initial);
  const [openCategory, setOpenCategory] = useState<GoalCategory | null>("strength");
  const [openSport, setOpenSport] = useState<string | null>(null);

  function toggle(goal: GoalSuggestion, category: GoalCategory, sport?: string) {
    const exists = selected.find((s) => s.suggestionId === goal.id);
    let next: SelectedGoal[];
    if (exists) {
      next = selected.filter((s) => s.suggestionId !== goal.id);
    } else {
      if (selected.length >= maxGoals) return; // at cap — must deselect first
      next = [
        ...selected,
        {
          suggestionId: goal.id,
          title: goal.title,
          description: goal.description,
          targetValue: goal.targetValue,
          unit: goal.unit,
          category,
          sport,
        },
      ];
    }
    setSelected(next);
    onChange(next);
  }

  function removeSelected(id: string) {
    const next = selected.filter((s) => s.suggestionId !== id);
    setSelected(next);
    onChange(next);
  }

  const atCap = selected.length >= maxGoals;

  return (
    <div className="space-y-6">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm">
          Select <span className="text-white font-bold">{maxGoals}</span> goals to focus on
          over the next 90 days.
        </p>
        <span
          className={`font-montserrat font-bold text-sm px-3 py-1 rounded-full ${
            atCap ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300"
          }`}
        >
          {selected.length} / {maxGoals}
        </span>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => {
            const cat = GOAL_CATEGORIES.find((c) => c.id === s.category)!;
            const colors = CATEGORY_COLORS[cat.color];
            return (
              <span
                key={s.suggestionId}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold ${colors.badge}`}
              >
                {cat.emoji} {s.title.length > 35 ? s.title.slice(0, 35) + "…" : s.title}
                <button
                  type="button"
                  onClick={() => removeSelected(s.suggestionId)}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Category accordions */}
      <div className="space-y-3">
        {GOAL_CATEGORIES.map((cat) => {
          const colors = CATEGORY_COLORS[cat.color];
          const isOpen = openCategory === cat.id;
          const selectedInCat = selected.filter((s) => s.category === cat.id).length;

          return (
            <div
              key={cat.id}
              className={`rounded-xl border ${isOpen ? colors.border : "border-zinc-700"} overflow-hidden transition-colors`}
            >
              {/* Category header */}
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                className={`w-full flex items-center justify-between px-5 py-4 ${isOpen ? colors.bg : "bg-zinc-900"} hover:bg-opacity-80 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <div className="text-left">
                    <p className={`font-montserrat font-bold text-sm uppercase tracking-wider ${isOpen ? colors.text : "text-white"}`}>
                      {cat.label}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {selectedInCat > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {selectedInCat} selected
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp size={16} className="text-zinc-400" />
                  ) : (
                    <ChevronDown size={16} className="text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Category body */}
              {isOpen && (
                <div className={`${colors.bg} border-t ${colors.border} p-4 space-y-4`}>

                  {/* Direct goals */}
                  {cat.goals && (
                    <GoalGrid
                      goals={cat.goals}
                      selected={selected}
                      atCap={atCap}
                      colors={colors}
                      onToggle={(g) => toggle(g, cat.id)}
                    />
                  )}

                  {/* Sports sub-selector */}
                  {cat.sports && (
                    <div className="space-y-3">
                      {/* Sport picker */}
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-montserrat font-bold">
                        Choose a sport
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cat.sports.map((sport) => (
                          <button
                            key={sport.id}
                            type="button"
                            onClick={() => setOpenSport(openSport === sport.id ? null : sport.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-montserrat font-semibold border transition-colors ${
                              openSport === sport.id
                                ? `${colors.border} ${colors.text} ${colors.bg}`
                                : "border-zinc-700 text-zinc-400 bg-zinc-900 hover:border-zinc-500"
                            }`}
                          >
                            <span>{sport.emoji}</span>
                            {sport.label}
                            {selected.filter((s) => s.sport === sport.id).length > 0 && (
                              <CheckCircle2 size={12} className={colors.text} />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Sport goals */}
                      {openSport && (() => {
                        const sport = cat.sports!.find((s) => s.id === openSport);
                        if (!sport) return null;
                        return (
                          <div className="mt-3">
                            <p className="text-xs text-zinc-500 mb-3">{sport.emoji} {sport.label} goals</p>
                            <GoalGrid
                              goals={sport.goals}
                              selected={selected}
                              atCap={atCap}
                              colors={colors}
                              onToggle={(g) => toggle(g, cat.id, sport.id)}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cap warning */}
      {atCap && (
        <p className="text-center text-zinc-500 text-sm">
          You&apos;ve picked {maxGoals} goals. Remove one to swap it out.
        </p>
      )}
    </div>
  );
}

// ── Sub-component: goal grid ──────────────────────────────────────────────────
function GoalGrid({
  goals,
  selected,
  atCap,
  colors,
  onToggle,
}: {
  goals: GoalSuggestion[];
  selected: SelectedGoal[];
  atCap: boolean;
  colors: { border: string; bg: string; text: string; badge: string };
  onToggle: (g: GoalSuggestion) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {goals.map((goal) => {
        const isSelected = selected.some((s) => s.suggestionId === goal.id);
        const disabled = atCap && !isSelected;

        return (
          <button
            key={goal.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(goal)}
            className={`text-left p-4 rounded-lg border transition-all ${
              isSelected
                ? `${colors.border} ${colors.bg} ring-1 ${colors.border}`
                : disabled
                ? "border-zinc-800 bg-zinc-900/50 opacity-40 cursor-not-allowed"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-semibold leading-snug ${isSelected ? colors.text : "text-white"}`}>
                {goal.title}
              </p>
              {isSelected ? (
                <CheckCircle2 size={16} className={`${colors.text} shrink-0 mt-0.5`} />
              ) : (
                <Plus size={16} className="text-zinc-600 shrink-0 mt-0.5" />
              )}
            </div>
            <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">{goal.description}</p>
            {goal.unit && (
              <span className="mt-2 inline-block text-xs text-zinc-600 font-montserrat">
                Tracked in: {goal.unit}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
