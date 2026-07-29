"use client";
import { useState, useMemo, useEffect } from "react";
import { X, Clock, User, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday, getDay, startOfWeek, addDays, format } from "date-fns";
import { getEventsForWeek, type HBFITEvent } from "@/lib/events-data";
// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const SCHEDULE = [
  { id: "1", type: "Strength & Conditioning Group Class", instructor: "Heather Traves", time: "5:00 AM",  days: [1, 2, 3, 4, 5] },
  { id: "2", type: "Strength & Conditioning Group Class", instructor: "Heather Traves", time: "6:00 AM",  days: [1, 2, 3, 4, 5] },
  { id: "3", type: "Strength & Conditioning Group Class", instructor: "Heather Traves", time: "9:30 AM",  days: [1, 2, 3, 4, 5] },
  { id: "4", type: "Homeschool Heroes",                  instructor: "Randy Franklin",  time: "1:00 PM",  days: [2, 4] },
  { id: "5", type: "Strength & Conditioning Group Class", instructor: "Heather Traves", time: "4:00 PM",  days: [1, 2, 3, 4, 5] },
  { id: "6", type: "Strength & Conditioning Group Class", instructor: "Heather Traves", time: "5:00 PM",  days: [1, 2, 3, 4, 5] },
  { id: "7", type: "Strength & Conditioning Group Class", instructor: "Randy Franklin",  time: "6:00 PM",  days: [1, 4] },
  { id: "8", type: "Strength & Conditioning Group Class", instructor: "Randy Franklin",  time: "8:30 AM",  days: [6] },
];

const DAYS_OF_WEEK = [
  { label: "Monday",    short: "MON", dow: 1 },
  { label: "Tuesday",   short: "TUE", dow: 2 },
  { label: "Wednesday", short: "WED", dow: 3 },
  { label: "Thursday",  short: "THU", dow: 4 },
  { label: "Friday",    short: "FRI", dow: 5 },
  { label: "Saturday",  short: "SAT", dow: 6 },
];

type ClassEntry = typeof SCHEDULE[0];

function isDayToday(dow: number) {
  if (typeof window === "undefined") return false; // SSR: never highlight
  return getDay(new Date()) === dow;
}

function ClassRow({ cls, onClick }: { cls: ClassEntry; onClick: () => void }) {
  const isHero = cls.type === "Homeschool Heroes";
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center justify-between gap-4 px-5 py-4",
        "border-b border-white/5 last:border-0",
        "hover:bg-white/5 active:bg-white/10 transition-colors group"
      )}
    >
      {/* Time */}
      <div className="w-20 shrink-0">
        <span className="font-montserrat font-bold text-white text-base tabular-nums">
          {cls.time}
        </span>
      </div>

      {/* Class info */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-montserrat font-bold text-sm uppercase tracking-wide",
          isHero ? "text-amber-400" : "text-white"
        )}>
          {cls.type}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-white/50 text-xs">
          <User size={11} />
          <span>{cls.instructor}</span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={16}
        className="shrink-0 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all"
      />
    </button>
  );
}

// ── Booking state types ───────────────────────────────────────────────────────
type AvailabilityState = {
  spotsLeft: number
  isFull: boolean
  confirmed: number
  capacity: number
  waitlisted: number
  myBooking: { status: string; waitlistPosition: number | null } | null
  sessionId: string | null
} | null

function DetailDrawer({ cls, onClose, isLoggedIn, selectedDate }: {
  cls: ClassEntry | null
  onClose: () => void
  isLoggedIn: boolean
  selectedDate: string   // YYYY-MM-DD
}) {
  const [avail, setAvail]     = useState<AvailabilityState>(null)
  const [booking, setBooking] = useState(false)
  const [msg, setMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Fetch availability when drawer opens
  useEffect(() => {
    if (!cls || !selectedDate) return
    setAvail(null); setMsg(null)
    fetch(`/api/classes/availability?slotId=${cls.id}&date=${selectedDate}`)
      .then(r => r.json())
      .then(setAvail)
      .catch(() => {})
  }, [cls, selectedDate])

  if (!cls) return null
  const isHero = cls.type === 'Homeschool Heroes'

  const handleBook = async () => {
    setBooking(true); setMsg(null)
    try {
      const r = await fetch('/api/classes/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: cls.id, date: selectedDate }),
      })
      const data = await r.json()
      if (!r.ok) { setMsg({ type: 'err', text: data.error ?? 'Booking failed.' }); return }
      const status = data.booking.status
      setMsg({ type: 'ok', text: status === 'CONFIRMED' ? '✓ Booked! See you there.' : `Added to waitlist (#${data.booking.waitlistPosition})` })
      // Refresh availability
      fetch(`/api/classes/availability?slotId=${cls.id}&date=${selectedDate}`).then(r => r.json()).then(setAvail)
    } catch { setMsg({ type: 'err', text: 'Network error. Try again.' }) }
    finally { setBooking(false) }
  }

  const handleCancel = async () => {
    setBooking(true); setMsg(null)
    try {
      const r = await fetch('/api/classes/book', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: cls.id, date: selectedDate }),
      })
      if (!r.ok) { const d = await r.json(); setMsg({ type: 'err', text: d.error ?? 'Cancel failed.' }); return }
      setMsg({ type: 'ok', text: 'Booking cancelled.' })
      fetch(`/api/classes/availability?slotId=${cls.id}&date=${selectedDate}`).then(r => r.json()).then(setAvail)
    } catch { setMsg({ type: 'err', text: 'Network error. Try again.' }) }
    finally { setBooking(false) }
  }

  const myStatus = avail?.myBooking?.status
  const isBooked = myStatus === 'CONFIRMED'
  const isWaitlisted = myStatus === 'WAITLISTED'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 md:right-auto md:top-0 md:left-auto md:right-0 md:w-96 z-50 bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-auto md:h-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-white/40 uppercase tracking-widest text-xs mb-1">Class Details</p>
            <h2 className={cn('font-montserrat font-extrabold text-xl uppercase leading-tight', isHero ? 'text-amber-400' : 'text-white')}>
              {cls.type}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
              <Clock size={18} className="text-white/60" />
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Time</div>
              <div className="text-white font-montserrat font-bold text-lg">{cls.time} · {selectedDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
              <User size={18} className="text-white/60" />
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Coach</div>
              <div className="text-white font-montserrat font-bold text-lg">{cls.instructor}</div>
            </div>
          </div>

          {/* Availability bar */}
          {avail ? (
            <div className="bg-white/5 border border-white/10 p-4 space-y-2">
              <div className="flex justify-between text-xs text-white/40 uppercase tracking-wider">
                <span>Availability</span>
                <span className={avail.isFull ? 'text-red-400' : 'text-emerald-400'}>
                  {avail.isFull ? `FULL · ${avail.waitlisted} waitlisted` : `${avail.spotsLeft} of ${avail.capacity} open`}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', avail.isFull ? 'bg-red-500' : 'bg-emerald-500')}
                  style={{ width: `${Math.min(100, (avail.confirmed / avail.capacity) * 100)}%` }}
                />
              </div>
              {isBooked && <p className="text-emerald-400 text-xs font-bold">✓ You&apos;re booked for this class</p>}
              {isWaitlisted && <p className="text-amber-400 text-xs font-bold">⏳ Waitlist #{avail.myBooking?.waitlistPosition} — you&apos;ll be auto-promoted if a spot opens</p>}
            </div>
          ) : isLoggedIn ? (
            <div className="h-12 bg-white/5 animate-pulse" />
          ) : null}

          {isHero && (
            <div className="bg-amber-400/10 border border-amber-400/20 p-4">
              <p className="text-amber-400 text-sm leading-relaxed">
                Homeschool Heroes is a specialized class designed for homeschool families.
                Contact us to learn more about eligibility and enrollment.
              </p>
            </div>
          )}

          {msg && (
            <div className={cn('p-3 text-sm font-bold', msg.type === 'ok' ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-400' : 'bg-red-950/50 border border-red-500/30 text-red-400')}>
              {msg.text}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="p-6 border-t border-white/10 space-y-3">
          {isLoggedIn ? (
            <>
              {isBooked || isWaitlisted ? (
                <button
                  onClick={handleCancel}
                  disabled={booking}
                  className="w-full border border-red-500/40 text-red-400 font-montserrat font-bold uppercase tracking-wide text-sm py-3.5 text-center hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                  {booking ? 'Cancelling...' : isWaitlisted ? 'Leave Waitlist' : 'Cancel Booking'}
                </button>
              ) : (
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="w-full bg-white text-black font-montserrat font-extrabold uppercase tracking-wide text-sm py-3.5 text-center hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {booking ? 'Booking...' : avail?.isFull ? 'Join Waitlist' : 'Book This Class'}
                </button>
              )}
            </>
          ) : (
            <a
              href="/login?redirect=/schedule"
              className="block w-full bg-white text-black font-montserrat font-extrabold uppercase tracking-wide text-sm py-3.5 text-center hover:bg-white/90 transition-colors"
            >
              Log In to Book
            </a>
          )}
          {!isLoggedIn && (
            <a
              href="/join"
              className="block w-full border border-white/20 text-white font-montserrat font-bold uppercase tracking-wide text-sm py-3 text-center hover:border-white/50 hover:bg-white/5 transition-colors"
            >
              Not a Member? Join Now
            </a>
          )}
        </div>
      </div>
    </>
  );
}

const CLASS_TYPES = ["All Classes", "Strength & Conditioning Group Class", "Homeschool Heroes"];
const INSTRUCTORS  = ["All Coaches", "Heather Traves", "Randy Franklin"];

function EventRow({ ev }: { ev: HBFITEvent }) {
  return (
    <a
      href={`/events/${ev.slug}`}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-sky-950/40 active:bg-sky-900/40 transition-colors group"
    >
      {/* Left accent */}
      <div className="w-1 self-stretch bg-sky-400 shrink-0 rounded-full" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-montserrat font-bold text-xs uppercase tracking-widest text-sky-400">
            Event
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs">{ev.category}</span>
        </div>
        <div className="font-montserrat font-bold text-sm text-white truncate">{ev.title}</div>
        {ev.location && (
          <div className="flex items-center gap-1 mt-0.5 text-white/40 text-xs">
            <MapPin size={10} />
            <span>{ev.location}</span>
          </div>
        )}
      </div>

      <ArrowRight size={14} className="shrink-0 text-sky-400/40 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
    </a>
  );
}


function FilterPills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "px-4 py-1.5 text-xs font-montserrat font-bold uppercase tracking-wide border transition-colors",
            value === opt
              ? "bg-white text-black border-white"
              : "bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function SchedulePage() {
  const [selected, setSelected]       = useState<ClassEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [classFilter, setClassFilter] = useState("All Classes");
  const [coachFilter, setCoachFilter] = useState("All Coaches");
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [thisWeekEvents, setThisWeekEvents] = useState<HBFITEvent[]>([]);

  useEffect(() => {
    fetch("/api/me").then(r => { if (r.ok) setIsLoggedIn(true) }).catch(() => {})
  }, []);

  useEffect(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    setThisWeekEvents(getEventsForWeek(weekStart));
  }, []);

  // Map dow → events that fall on that day
  const eventsByDow = useMemo(() => {
    const map: Record<number, HBFITEvent[]> = {};
    thisWeekEvents.forEach((ev) => {
      if (!ev.date) return;
      const d = new Date(ev.date + "T12:00:00");
      const dow = getDay(d); // 0=Sun … 6=Sat
      if (!map[dow]) map[dow] = [];
      map[dow].push(ev);
    });
    return map;
  }, [thisWeekEvents]);

  const matches = (cls: ClassEntry) => {
    const classOk = classFilter === "All Classes" || cls.type === classFilter;
    const coachOk = coachFilter === "All Coaches" || cls.instructor === coachFilter;
    return classOk && coachOk;
  };

  return (
    <div className="pt-16 min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-white/10 py-12 px-4 text-center">
        <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-2">
          Honor Bound FIT · Fredericksburg, VA
        </p>
        <h1 className="font-montserrat text-4xl font-extrabold text-white uppercase">
          Class Schedule
        </h1>
        <p className="text-white/40 text-sm mt-3">
          Tap any class to book or learn more.
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-white/10 bg-zinc-950">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          <div>
            <p className="text-white/30 uppercase tracking-widest text-xs mb-2">Class</p>
            <FilterPills options={CLASS_TYPES} value={classFilter} onChange={(v) => { setClassFilter(v); }} />
          </div>
          <div>
            <p className="text-white/30 uppercase tracking-widest text-xs mb-2">Coach</p>
            <FilterPills options={INSTRUCTORS} value={coachFilter} onChange={(v) => { setCoachFilter(v); }} />
          </div>
        </div>
      </div>

      {/* Day sections */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {DAYS_OF_WEEK.map(({ label, short, dow }) => {
          // Compute the actual calendar date for this dow in the current week
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
          // dow: 1=Mon…6=Sat; weekStart is Monday
          const dayDate = addDays(weekStart, dow - 1)
          const dayDateStr = format(dayDate, 'yyyy-MM-dd')

          const classes = SCHEDULE
            .filter(c => c.days.includes(dow) && matches(c))
            .sort((a, b) => {
              // Sort by 24h time (parse from display string)
              const toMins = (t: string) => {
                const [time, period] = t.split(" ");
                let [h, m] = time.split(":").map(Number);
                if (period === "PM" && h !== 12) h += 12;
                if (period === "AM" && h === 12) h = 0;
                return h * 60 + m;
              };
              return toMins(a.time) - toMins(b.time);
            });

          const dayEvents = eventsByDow[dow] ?? [];
          const today = isDayToday(dow);
          const totalItems = classes.length + dayEvents.length;

          if (totalItems === 0) return null;

          return (
            <div key={dow} className={cn(
              "border",
              today ? "border-white/30" : "border-white/10"
            )}>
              {/* Day header */}
              <div className={cn(
                "flex items-center gap-3 px-5 py-3 border-b",
                today ? "bg-white text-black border-white/10" : "bg-zinc-950 text-white/60 border-white/10"
              )}>
                <span className={cn(
                  "font-montserrat font-extrabold text-xs uppercase tracking-widest",
                  today ? "text-black" : "text-white/40"
                )}>
                  {short}
                </span>
                <span className={cn(
                  "font-montserrat font-bold text-sm",
                  today ? "text-black" : "text-white"
                )}>
                  {label}
                </span>
                {today && (
                  <span className="ml-auto text-xs font-bold uppercase tracking-wider text-black/60">
                    Today
                  </span>
                )}
                <span className={cn(
                  "ml-auto text-xs",
                  today ? "text-black/50 ml-0" : "text-white/30"
                )}>
                  {classes.length} {classes.length === 1 ? "class" : "classes"}
                  {dayEvents.length > 0 && ` · ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`}
                </span>
              </div>

              {/* Classes + Events */}
              <div className="divide-y divide-white/5">
                {classes.map(cls => (
                  <ClassRow key={cls.id} cls={cls} onClick={() => { setSelected(cls); setSelectedDate(dayDateStr) }} />
                ))}
                {dayEvents.map(ev => (
                  <EventRow key={ev.slug} ev={ev} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Sunday — only show when no filters active */}
        {classFilter === "All Classes" && coachFilter === "All Coaches" && (
          <div className="border border-white/5">
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-950 border-b border-white/5">
              <span className="font-montserrat font-extrabold text-xs uppercase tracking-widest text-white/20">SUN</span>
              <span className="font-montserrat font-bold text-sm text-white/30">Sunday</span>
            </div>
            <div className="px-5 py-6 text-white/20 text-sm italic">Rest Day</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-6 flex flex-wrap gap-6 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full" />
            Strength &amp; Conditioning Group Class
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Homeschool Heroes
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-sky-400 rounded-full" />
            Event (this week)
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      <DetailDrawer cls={selected} onClose={() => setSelected(null)} isLoggedIn={isLoggedIn} selectedDate={selectedDate} />
    </div>
  );
}
