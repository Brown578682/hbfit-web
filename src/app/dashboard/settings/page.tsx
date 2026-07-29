"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  KeyRound,
  User,
  UserCheck,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();

  // ── PIN state ──────────────────────────────────────────────────────────────
  const [memberCode, setMemberCode] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(true);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Coach state ────────────────────────────────────────────────────────────
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [coachSaving, setCoachSaving] = useState(false);
  const [coachMsg, setCoachMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Push notifications ─────────────────────────────────────────────────────
  const { permission, subscribed, loading: pushLoading, subscribe, unsubscribe } =
    usePushNotifications();

  // ── Load PIN info ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/member/pin")
      .then((r) => r.json())
      .then((d) => {
        setMemberCode(d.memberCode ?? null);
        setHasPin(!!d.hasPin);
      })
      .catch(() => {})
      .finally(() => setPinLoading(false));
  }, []);

  // ── Load coaches & current preferred coach ─────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/coaches").then((r) => r.json()),
      fetch("/api/member/preferred-coach").then((r) => r.json()),
    ])
      .then(([allCoaches, pref]) => {
        if (Array.isArray(allCoaches)) setCoaches(allCoaches);
        setSelectedCoachId(pref?.preferredCoachId ?? "");
      })
      .catch(() => {});
  }, []);

  // ── PIN submit ─────────────────────────────────────────────────────────────
  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPinMsg(null);

    if (!/^[0-9]{4}$/.test(newPin)) {
      setPinMsg({ ok: false, text: "New PIN must be exactly 4 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg({ ok: false, text: "PINs do not match." });
      return;
    }
    if (hasPin && !/^[0-9]{4}$/.test(currentPin)) {
      setPinMsg({ ok: false, text: "Current PIN must be exactly 4 digits." });
      return;
    }

    setPinSaving(true);
    try {
      const res = await fetch("/api/member/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: newPin, currentPin: hasPin ? currentPin : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPinMsg({ ok: false, text: data.error ?? "Failed to save PIN." });
      } else {
        setHasPin(true);
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
        setPinMsg({ ok: true, text: "PIN saved successfully!" });
      }
    } catch {
      setPinMsg({ ok: false, text: "Network error — please try again." });
    } finally {
      setPinSaving(false);
    }
  }

  // ── Coach submit ───────────────────────────────────────────────────────────
  const handleCoachSave = useCallback(async () => {
    setCoachSaving(true);
    setCoachMsg(null);
    try {
      const res = await fetch("/api/member/preferred-coach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCoachId: selectedCoachId }),
      });
      if (res.ok) {
        setCoachMsg({ ok: true, text: "Preferred coach updated." });
      } else {
        setCoachMsg({ ok: false, text: "Failed to save. Try again." });
      }
    } catch {
      setCoachMsg({ ok: false, text: "Network error — please try again." });
    } finally {
      setCoachSaving(false);
    }
  }, [selectedCoachId]);

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="font-montserrat font-bold text-sm uppercase tracking-wider">
          Account Settings
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-10">
        <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">
          Account Settings
        </h1>

        {/* ── Kiosk Access ──────────────────────────────────────────────── */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 space-y-6">
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest flex items-center gap-2">
            <KeyRound size={18} className="text-red-500" /> Kiosk Access
          </h2>

          {/* Member code */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-montserrat mb-1">
              Your Member Code
            </p>
            {pinLoading ? (
              <div className="h-10 w-24 bg-zinc-800 rounded animate-pulse" />
            ) : memberCode ? (
              <p className="font-mono text-4xl font-bold tracking-widest text-white">
                {memberCode}
              </p>
            ) : (
              <p className="text-zinc-500 text-sm italic">
                Not assigned yet — contact staff
              </p>
            )}
          </div>

          {/* PIN status */}
          <div className="flex items-center gap-2">
            {hasPin ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-sm font-montserrat font-bold">
                  PIN set
                </span>
              </>
            ) : (
              <>
                <span className="inline-block w-4 h-4 rounded-full border border-zinc-600" />
                <span className="text-zinc-400 text-sm">No PIN set</span>
              </>
            )}
          </div>

          {/* PIN form */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            {hasPin && (
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider font-montserrat mb-1.5">
                  Current PIN
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-32 bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-center text-xl tracking-widest font-mono placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                  autoComplete="current-password"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider font-montserrat mb-1.5">
                {hasPin ? "New PIN" : "Set PIN"}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="w-32 bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-center text-xl tracking-widest font-mono placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider font-montserrat mb-1.5">
                Confirm PIN
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="w-32 bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-center text-xl tracking-widest font-mono placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                autoComplete="new-password"
              />
            </div>

            {pinMsg && (
              <p
                className={`text-sm font-montserrat ${
                  pinMsg.ok ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {pinMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={pinSaving}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors text-white font-montserrat font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg text-sm"
            >
              {pinSaving ? "Saving…" : hasPin ? "Change PIN" : "Set PIN"}
            </button>
          </form>
        </section>

        {/* ── Personal Info ──────────────────────────────────────────────── */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 space-y-4">
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest flex items-center gap-2">
            <User size={18} className="text-red-500" /> Personal Info
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-montserrat mb-0.5">
                Name
              </p>
              <p className="text-white">{name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-montserrat mb-0.5">
                Email
              </p>
              <p className="text-white">{email || "—"}</p>
            </div>
          </div>

          <p className="text-zinc-500 text-sm border-t border-zinc-800 pt-4">
            To update your personal information, contact a staff member at the front desk.
          </p>
        </section>

        {/* ── Preferred Coach ────────────────────────────────────────────── */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 space-y-5">
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest flex items-center gap-2">
            <UserCheck size={18} className="text-red-500" /> Preferred Coach
          </h2>

          <div className="space-y-3">
            {/* No preference option */}
            <label
              className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                selectedCoachId === ""
                  ? "border-red-600 bg-red-950/20"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <input
                type="radio"
                name="preferredCoach"
                value=""
                checked={selectedCoachId === ""}
                onChange={() => setSelectedCoachId("")}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-400 text-lg font-bold shrink-0">
                  ?
                </div>
                <div>
                  <div className="text-white font-montserrat font-bold text-sm">
                    No preference
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    Assign me to any available coach
                  </div>
                </div>
              </div>
            </label>

            {coaches.map((coach) => {
              const initials = `${coach.firstName[0]}${coach.lastName[0]}`;
              const selected = selectedCoachId === coach.id;
              return (
                <label
                  key={coach.id}
                  className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                    selected
                      ? "border-red-600 bg-red-950/20"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredCoach"
                    value={coach.id}
                    checked={selected}
                    onChange={() => setSelectedCoachId(coach.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-white text-sm font-bold font-montserrat shrink-0 overflow-hidden">
                      {coach.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coach.photoUrl}
                          alt={coach.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-montserrat font-bold text-sm">
                        {coach.firstName} {coach.lastName}
                      </div>
                      {coach.title && (
                        <div className="text-red-400 text-xs font-montserrat mt-0.5">
                          {coach.title}
                        </div>
                      )}
                      {coach.bio && (
                        <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                          {coach.bio}
                        </p>
                      )}
                    </div>
                    {selected && (
                      <CheckCircle2 size={16} className="text-red-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {coachMsg && (
            <p
              className={`text-sm font-montserrat ${
                coachMsg.ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {coachMsg.text}
            </p>
          )}

          <button
            onClick={handleCoachSave}
            disabled={coachSaving}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors text-white font-montserrat font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg text-sm"
          >
            {coachSaving ? "Saving…" : "Save Preference"}
          </button>
        </section>

        {/* ── Notification Preferences ───────────────────────────────────── */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 space-y-4">
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest flex items-center gap-2">
            <Bell size={18} className="text-red-500" /> Notifications
          </h2>

          {permission === "unsupported" ? (
            <p className="text-zinc-500 text-sm">
              Push notifications are not supported in this browser.
            </p>
          ) : permission === "denied" ? (
            <p className="text-zinc-500 text-sm">
              Notifications are blocked. Update your browser settings to enable them.
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-montserrat font-bold">
                  Push Notifications
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {subscribed
                    ? "You'll receive check-in reminders and updates."
                    : "Get notified about check-ins, milestones, and news."}
                </p>
              </div>
              <button
                onClick={subscribed ? unsubscribe : subscribe}
                disabled={pushLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-montserrat font-bold transition-colors disabled:opacity-50 ${
                  subscribed
                    ? "border-emerald-700 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40"
                    : "border-zinc-600 text-zinc-400 bg-zinc-800 hover:border-zinc-400"
                }`}
              >
                {subscribed ? (
                  <>
                    <Bell size={14} /> On
                  </>
                ) : (
                  <>
                    <BellOff size={14} /> Off
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
