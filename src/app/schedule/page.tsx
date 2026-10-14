"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { X, Clock, User, CalendarDays, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDay, startOfWeek, addDays, format, addWeeks, subWeeks, isBefore, startOfDay } from "date-fns";
import { getEventsForWeek, type HBFITEvent } from "@/lib/events-data";

// ─── Types ────────────────────────────────────────────────────────────────────
type ClassEntry = {
  id: string;
  typeName: string;
  instructor: string;
  time: string;
  days: number[];
};

// ─── Days of week ─────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = [
  { label: "Monday",    short: "MON", dow: 1 },
  { label: "Tuesday",   short: "TUE", dow: 2 },
  { label: "Wednesday", short: "WED", dow: 3 },
  { label: "Thursday",  short: "THU", dow: 4 },
  { label: "Friday",    short: "FRI", dow: 5 },
  { label: "Saturday",  short: "SAT", dow: 6 },
];

type AvailState = {
  spotsLeft: number; isFull: boolean; confirmed: number;
  capacity: number; waitlisted: number;
  myBooking: { status: string; waitlistPosition: number | null } | null;
  sessionId: string | null;
  isCanceled: boolean;
  cancelReason: string | null;
} | null;

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ cls, onClose, isLoggedIn, isMember, selectedDate, recurringSlots, onRecurringChange }: {
  cls: ClassEntry | null;
  onClose: () => void;
  isLoggedIn: boolean;
  isMember: boolean;
  selectedDate: string;
  recurringSlots: Set<string>;
  onRecurringChange: (slotId: string, on: boolean) => void;
}) {
  const [avail, setAvail]     = useState<AvailState>(null);
  const [booking, setBooking] = useState(false);
  const [msg, setMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [recSaving, setRecSaving] = useState(false);

  const fetchAvail = useCallback(() => {
    if (!cls || !selectedDate) return;
    setAvail(null); setMsg(null);
    fetch(`/api/classes/availability?slotId=${cls.id}&date=${selectedDate}`)
      .then(r => r.json()).then(setAvail).catch(() => {});
  }, [cls, selectedDate]);

  useEffect(() => { fetchAvail(); }, [fetchAvail]);

  if (!cls) return null;

  const isHero       = cls.typeName === "Homeschool Heroes";
  const isOpenGym    = cls.typeName === "Open Gym";
  const isTribalElders = cls.typeName === "Tribal Elders";
  const isRecurring  = recurringSlots.has(cls.id);

  // Booking window: allow up to 14 days in advance, close 30 min after start
  const isPast = (() => {
    if (!avail) return false;
    // We check this server-side too; just show message locally if avail has error
    return false;
  })();

  const myStatus   = avail?.myBooking?.status;
  const isBooked   = myStatus === "CONFIRMED";
  const isWaitlisted = myStatus === "WAITLISTED";
  const isCanceled = avail?.isCanceled ?? false;
  const cancelReason = avail?.cancelReason ?? null;

  const handleBook = async () => {
    setBooking(true); setMsg(null);
    try {
      const r = await fetch("/api/classes/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: cls.id, date: selectedDate }),
      });
      const data = await r.json();
      if (!r.ok) { setMsg({ type: "err", text: data.error ?? "Booking failed." }); return; }
      setMsg({ type: "ok", text: data.booking.status === "CONFIRMED" ? "✓ Booked! See you there." : `Added to waitlist (#${data.booking.waitlistPosition})` });
      fetchAvail();
    } catch { setMsg({ type: "err", text: "Network error. Try again." }); }
    finally { setBooking(false); }
  };

  const handleCancel = async () => {
    setBooking(true); setMsg(null);
    try {
      const r = await fetch("/api/classes/book", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: cls.id, date: selectedDate }),
      });
      if (!r.ok) { const d = await r.json(); setMsg({ type: "err", text: d.error ?? "Cancel failed." }); return; }
      setMsg({ type: "ok", text: "Booking cancelled." });
      fetchAvail();
    } catch { setMsg({ type: "err", text: "Network error. Try again." }); }
    finally { setBooking(false); }
  };

  const handleToggleRecurring = async () => {
    setRecSaving(true);
    try {
      if (isRecurring) {
        await fetch("/api/member/recurring", {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId: cls.id }),
        });
        onRecurringChange(cls.id, false);
      } else {
        await fetch("/api/member/recurring", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId: cls.id }),
        });
        onRecurringChange(cls.id, true);
        // Also book this specific date right now if not already booked
        if (!isBooked && !isWaitlisted) { await handleBook(); return; }
      }
    } catch { /* ignore */ }
    finally { setRecSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 md:right-auto md:top-0 md:w-96 z-50 bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-auto md:h-full max-h-[90vh] md:max-h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-white/40 uppercase tracking-widest text-xs mb-1">Class Details</p>
            <h2 className={cn("font-montserrat font-extrabold text-xl uppercase leading-tight",
              isHero || isTribalElders ? "text-red-600" : isOpenGym ? "text-blue-700" : "text-white")}>
              {cls.typeName}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Cancelled banner */}
          {isCanceled && (
            <div className="flex items-start gap-3 bg-red-950/40 border-2 border-red-600 p-4">
              <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 font-montserrat font-extrabold text-sm uppercase tracking-widest">Class Cancelled</p>
                {cancelReason && (
                  <p className="text-red-300/70 text-xs mt-1 leading-relaxed">{cancelReason}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
              <Clock size={18} className="text-white/60" />
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Time</div>
              <div className="text-white font-montserrat font-bold text-lg">{cls.time} · {selectedDate}</div>
            </div>
          </div>

          {/* Coach */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
              <User size={18} className="text-white/60" />
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Coach</div>
              <div className="text-white font-montserrat font-bold text-lg">{cls.instructor || "Self-directed"}</div>
            </div>
          </div>

          {/* Availability bar */}
          {avail && !("error" in avail) ? (
            <div className="bg-white/5 border border-white/10 p-4 space-y-2">
              <div className="flex justify-between text-xs text-white/40 uppercase tracking-wider">
                <span>Availability</span>
                <span className={avail.isFull ? "text-red-400" : "text-emerald-400"}>
                  {avail.isFull ? `FULL · ${avail.waitlisted} waitlisted` : `${avail.spotsLeft} of ${avail.capacity} open`}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", avail.isFull ? "bg-red-500" : "bg-emerald-500")}
                  style={{ width: `${avail.capacity > 0 ? Math.min(100, (avail.confirmed / avail.capacity) * 100) : 0}%` }} />
              </div>
              {isBooked && <p className="text-emerald-400 text-xs font-bold">✓ You&apos;re booked for this class</p>}
              {isWaitlisted && <p className="text-amber-400 text-xs font-bold">⏳ Waitlist #{avail.myBooking?.waitlistPosition}</p>}
            </div>
          ) : avail && "error" in (avail as Record<string, unknown>) ? (
            <div className="bg-red-950/30 border border-red-800 p-3 text-red-400 text-sm">
              {(avail as Record<string, string>).error}
            </div>
          ) : isLoggedIn ? (
            <div className="h-12 bg-white/5 animate-pulse" />
          ) : null}

          {/* Class description */}
          {isOpenGym && (
            <p className="text-blue-300/80 text-sm leading-relaxed bg-blue-950/20 border border-blue-900/40 p-3">
              Open Gym time is available to all active members. Use the equipment freely, work on your own programming, or train with a partner. No coach-led instruction during this block.
            </p>
          )}
          {isHero && (
            <p className="text-red-300/80 text-sm leading-relaxed bg-red-950/20 border border-red-900/40 p-3">
              A fun, high-energy class designed for homeschool families. Kids and teens work alongside parents in age-appropriate workouts that build fitness, confidence, and teamwork.
            </p>
          )}

          {/* ── Recurring toggle (logged in only) ── */}
          {isMember && (
            <div className={cn("border p-4 space-y-2 transition-colors",
              isRecurring ? "border-blue-600 bg-blue-950/20" : "border-white/10 bg-white/5")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className={isRecurring ? "text-blue-400" : "text-white/40"} />
                  <span className={cn("text-sm font-montserrat font-bold uppercase tracking-wider",
                    isRecurring ? "text-blue-300" : "text-white/60")}>
                    Recurring
                  </span>
                </div>
                <button
                  onClick={handleToggleRecurring}
                  disabled={recSaving}
                  className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    isRecurring ? "bg-blue-600" : "bg-zinc-700", recSaving && "opacity-50")}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    isRecurring ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                {isRecurring
                  ? "We'll auto-book this class every week it runs. You'll get a push confirmation 7 days before."
                  : "Set it and forget it — we'll auto-book this slot every week. Toggle off anytime."}
              </p>
            </div>
          )}

          {/* Message */}
          {msg && (
            <div className={cn("p-3 text-sm font-bold", msg.type === "ok" ? "text-emerald-400 bg-emerald-950/20 border border-emerald-800" : "text-red-400 bg-red-950/20 border border-red-800")}>
              {msg.text}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {isMember && avail && !(("error" in avail)) && (
          <div className="p-6 border-t border-white/10">
            {isCanceled ? (
              <div className="w-full text-center border border-red-600/50 text-red-500/70 font-montserrat font-bold uppercase tracking-wider px-6 py-4 text-sm">
                Class Cancelled — No Booking Available
              </div>
            ) : isBooked || isWaitlisted ? (
              <button onClick={handleCancel} disabled={booking}
                className="w-full border border-red-600 text-red-500 hover:bg-red-950/30 font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors disabled:opacity-50">
                {booking ? "Cancelling..." : isWaitlisted ? "Leave Waitlist" : "Cancel Booking"}
              </button>
            ) : (
              <button onClick={handleBook} disabled={booking || avail.isFull}
                className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors">
                {booking ? "Booking..." : avail.isFull ? "Join Waitlist" : "Book This Class"}
              </button>
            )}
          </div>
        )}
        {!isLoggedIn && (
          <div className="p-6 border-t border-white/10 space-y-3">
            <p className="text-zinc-400 text-sm text-center leading-relaxed">
              Members can book and set recurring classes.<br />
              <span className="text-zinc-500 text-xs">Not a member yet? Join in minutes.</span>
            </p>
            <a href="/join" className="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors">
              Join Honor Bound FIT
            </a>
            <a href="/login" className="block w-full text-center border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-montserrat font-bold uppercase tracking-wider px-6 py-3 text-sm transition-colors">
              Member Login
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Events Banner ────────────────────────────────────────────────────────────
function EventsBanner({ events }: { events: HBFITEvent[] }) {
  if (!events.length) return null;
  return (
    <div className="mb-6 space-y-3">
      {events.map(ev => (
        <div key={ev.slug} className="flex items-start gap-3 bg-amber-950/30 border border-amber-700/50 p-4">
          <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 font-montserrat font-bold text-sm uppercase tracking-wide">{ev.title}</p>
            <p className="text-amber-200/60 text-xs mt-0.5">{ev.date ? format(new Date(ev.date), "EEEE, MMMM d") : "This week"}{ev.time ? ` · ${ev.time}` : ""}{ev.location ? ` · ${ev.location}` : ""}</p>
            {ev.description && <p className="text-amber-200/60 text-xs mt-1 leading-relaxed line-clamp-2">{ev.description}</p>}
          </div>
          {ev.runsignupUrl && (
            <a href={ev.runsignupUrl} target="_blank" rel="noopener noreferrer"
              className="text-amber-400 text-xs font-bold whitespace-nowrap hover:text-amber-300">
              Register →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  // Week state — always Monday-anchored
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dow = getDay(today); // 0=Sun
    // If Sunday after 8pm, pre-advance to next week so members can book Monday
    if (dow === 0 && today.getHours() >= 20) {
      return startOfWeek(addDays(today, 1), { weekStartsOn: 1 });
    }
    return startOfWeek(today, { weekStartsOn: 1 });
  });

  const [selectedCls,  setSelectedCls]  = useState<ClassEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [isMember,     setIsMember]     = useState(false);
  const [recurringSlots, setRecurringSlots] = useState<Set<string>>(new Set());
  const [bookedMap, setBookedMap]       = useState<Map<string, string>>(new Map());
  const [schedule, setSchedule]         = useState<ClassEntry[]>([]);
  const [cancelledMap, setCancelledMap] = useState<Map<string, string | null>>(new Map());

  // Today for past-day dimming
  const todayStart = startOfDay(new Date());

  // Week days
  const weekDays = useMemo(() =>
    DAYS_OF_WEEK.map(d => {
      const date = addDays(weekStart, d.dow - 1);
      return { ...d, date, dateStr: format(date, "yyyy-MM-dd"), displayDate: format(date, "MMM d") };
    }), [weekStart]);

  // Events for this week
  const weekEvents = useMemo(() => getEventsForWeek(weekStart), [weekStart]);
  // Load active slots from DB
  useEffect(() => {
    fetch("/api/classes/slots")
      .then(r => r.json())
      .then((slots: ClassEntry[]) => { if (Array.isArray(slots)) setSchedule(slots); })
      .catch(() => {});
  }, []);

  // Load cancelled sessions for the visible week
  useEffect(() => {
    const from = format(weekStart, "yyyy-MM-dd");
    const to   = format(addDays(weekStart, 5), "yyyy-MM-dd");
    fetch(`/api/classes/cancelled?from=${from}&to=${to}`)
      .then(r => r.json())
      .then((rows: Array<{ slotId: string; date: string; cancelReason: string | null }>) => {
        if (!Array.isArray(rows)) return;
        const map = new Map<string, string | null>();
        for (const r of rows) map.set(`${r.slotId}|${r.date}`, r.cancelReason ?? null);
        setCancelledMap(map);
      })
      .catch(() => {});
  }, [weekStart]);

  useEffect(() => {
    fetch("/api/me").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) {
        setIsLoggedIn(true);
        // Only MEMBER-role users have a Member DB row and can book
        if (data.user.role === 'MEMBER') {
          setIsMember(true);
          fetch("/api/member/recurring").then(r => r.json()).then((slots: string[]) => {
            setRecurringSlots(new Set(slots));
          }).catch(() => {});
          fetch("/api/classes/upcoming").then(r => r.json()).then((bookings: Array<{ slotId: string | null; startTime: string; status: string }>) => {
            const map = new Map<string, string>();
            for (const b of bookings) {
              if (b.slotId) {
                const dateStr = b.startTime.slice(0, 10);
                map.set(`${b.slotId}|${dateStr}`, b.status);
              }
            }
            setBookedMap(map);
          }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, []);

  const handleRecurringChange = useCallback((slotId: string, on: boolean) => {
    setRecurringSlots(prev => {
      const next = new Set(prev);
      on ? next.add(slotId) : next.delete(slotId);
      return next;
    });
  }, []);

  const prevWeek = () => setWeekStart(w => subWeeks(w, 1));
  const nextWeek = () => setWeekStart(w => addWeeks(w, 1));
  const goToday  = () => {
    const today = new Date();
    const dow = getDay(today);
    if (dow === 0 && today.getHours() >= 20) {
      setWeekStart(startOfWeek(addDays(today, 1), { weekStartsOn: 1 }));
    } else {
      setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    }
  };

  // Disable prev week if it would go before current week
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const canGoPrev = weekStart > currentWeekStart;

  // Allow booking up to 3 weeks out
  const maxWeekStart = addWeeks(currentWeekStart, 3);
  const canGoNext = weekStart < maxWeekStart;

  const openDrawer = (cls: ClassEntry, dateStr: string) => {
    setSelectedCls(cls);
    setSelectedDate(dateStr);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">Schedule</h1>
          <p className="text-zinc-500 text-sm mt-1">Book classes up to 3 weeks in advance. Set recurring slots and forget it.</p>
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={prevWeek} disabled={!canGoPrev}
            className="p-2 border border-white/10 hover:border-white/30 disabled:opacity-30 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <span className="font-montserrat font-bold text-sm uppercase tracking-widest">
              {format(weekStart, "MMM d")} — {format(addDays(weekStart, 5), "MMM d, yyyy")}
            </span>
          </div>
          <button onClick={nextWeek} disabled={!canGoNext}
            className="p-2 border border-white/10 hover:border-white/30 disabled:opacity-30 transition-colors">
            <ChevronRight size={18} />
          </button>
          <button onClick={goToday}
            className="text-xs font-montserrat font-bold uppercase tracking-wider px-3 py-2 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-colors">
            Today
          </button>
        </div>

        {/* Special events banner */}
        <EventsBanner events={weekEvents} />

        {/* Recurring legend */}
        {isLoggedIn && recurringSlots.size > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs text-blue-400">
            <RefreshCw size={12} />
            <span>{recurringSlots.size} recurring class{recurringSlots.size > 1 ? "es" : ""} active — auto-booked every week</span>
          </div>
        )}

        {/* Weekly grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {weekDays.map(day => {
            const isPastDay = isBefore(day.date, todayStart);
            const dayClasses = schedule.filter(c => c.days.includes(day.dow));
            const isToday = format(new Date(), "yyyy-MM-dd") === day.dateStr;

            return (
              <div key={day.dow} className={cn("space-y-2", isPastDay && "opacity-40")}>
                {/* Day header */}
                <div className={cn("text-center py-2 border-b", isToday ? "border-red-600" : "border-white/10")}>
                  <p className={cn("font-montserrat font-black text-xs uppercase tracking-widest", isToday ? "text-red-500" : "text-white/60")}>
                    {day.short}
                  </p>
                  <p className={cn("font-montserrat font-bold text-lg", isToday ? "text-white" : "text-white/80")}>
                    {format(day.date, "d")}
                  </p>
                  <p className="text-white/30 text-xs">{format(day.date, "MMM")}</p>
                </div>

                {/* Classes */}
                {dayClasses.map(cls => {
                  const isHero     = cls.typeName === "Homeschool Heroes";
                  const isOpenGym  = cls.typeName === "Open Gym";
                  const isTribal   = cls.typeName === "Tribal Elders";
                  const isRec      = recurringSlots.has(cls.id);
                  const bookStatus = bookedMap.get(`${cls.id}|${day.dateStr}`);
                  const isBooked   = bookStatus === "CONFIRMED";
                  const isWait     = bookStatus === "WAITLISTED";
                  const isCancelledCard = cancelledMap.has(`${cls.id}|${day.dateStr}`);

                  return (
                    <button
                      key={cls.id}
                      disabled={isPastDay}
                      onClick={() => !isPastDay && openDrawer(cls, day.dateStr)}
                      className={cn(
                        "w-full text-left p-2 border transition-all relative",
                        isPastDay ? "cursor-default" : "cursor-pointer hover:border-white/30 active:scale-95",
                        isCancelledCard ? "border-red-600 bg-red-950/20" :
                        isBooked  ? "border-emerald-600 bg-emerald-950/20" :
                        isWait    ? "border-amber-600 bg-amber-950/20" :
                        isRec     ? "border-blue-700 bg-blue-950/20" :
                        isHero || isTribal ? "border-red-900/50 bg-red-950/10" :
                        isOpenGym ? "border-blue-900/50 bg-blue-950/10" :
                        "border-white/10 bg-white/5 hover:bg-white/8"
                      )}
                    >
                      {/* Recurring badge */}
                      {isRec && (
                        <span className="absolute top-1 right-1">
                          <RefreshCw size={9} className="text-blue-400" />
                        </span>
                      )}
                      <p className={cn("text-xs font-montserrat font-bold leading-tight",
                        isBooked ? "text-emerald-400" :
                        isWait   ? "text-amber-400" :
                        isHero || isTribal ? "text-red-500" :
                        isOpenGym ? "text-blue-400" : "text-white")}>
                        {isOpenGym ? "Open Gym" : isHero ? "Heroes" : isTribal ? "Elders" : "Strength & Conditioning"}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5 leading-tight">{cls.time.split("–")[0].replace(" AM","a").replace(" PM","p")}</p>
                      {cls.instructor && <p className="text-white/30 text-xs mt-0.5 truncate">{cls.instructor.split(" ")[0]}</p>}
                      {isBooked && <p className="text-emerald-500 text-xs font-bold mt-0.5">✓ Booked</p>}
                      {isWait   && <p className="text-amber-500 text-xs font-bold mt-0.5">Waitlisted</p>}
                      {isCancelledCard && <p className="text-red-500 text-xs font-bold mt-0.5 uppercase tracking-wider">⚠ Cancelled</p>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white/10 border border-white/20 inline-block" /> Strength &amp; Conditioning</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-950/40 border border-blue-800/40 inline-block" /> Open Gym</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-950/30 border border-red-900/50 inline-block" /> Special Class</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-950/30 border border-emerald-700 inline-block" /> Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-950/30 border border-blue-700 inline-block" /> Recurring</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-950/30 border border-amber-700 inline-block" /> Waitlisted</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-950/30 border border-red-600 inline-block" /> Cancelled</span>
        </div>
      </main>

      {selectedCls && (
        <DetailDrawer
          cls={selectedCls}
          onClose={() => setSelectedCls(null)}
          isLoggedIn={isLoggedIn}
          isMember={isMember}
          selectedDate={selectedDate}
          recurringSlots={recurringSlots}
          onRecurringChange={handleRecurringChange}
        />
      )}
    </div>
  );
}
