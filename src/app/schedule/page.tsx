"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Users, Clock, MapPin, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, isPast } from "date-fns";

const CLASS_COLORS: Record<string, string> = {
  "Strength & Conditioning": "border-l-white",
  "Small Group Training": "border-l-zinc-400",
  "Open Gym": "border-l-zinc-600",
  "Homeschool Heroes": "border-l-zinc-300",
  "Tribal Elders": "border-l-zinc-500",
  "Rucking": "border-l-zinc-400",
};

// Mock schedule data — will be replaced by API/DB
const MOCK_CLASSES = [
  { id: "1", type: "Strength & Conditioning", instructor: "Coach Keith", time: "05:30", duration: 60, capacity: 12, enrolled: 8, days: [1, 2, 3, 4, 5] },
  { id: "2", type: "Small Group Training", instructor: "Coach Rich", time: "07:00", duration: 60, capacity: 12, enrolled: 6, days: [1, 2, 3, 4, 5] },
  { id: "3", type: "Open Gym", instructor: null, time: "09:00", duration: 120, capacity: 20, enrolled: 4, days: [1, 2, 3, 4, 5, 6] },
  { id: "4", type: "Homeschool Heroes", instructor: "Coach Keith", time: "13:00", duration: 60, capacity: 12, enrolled: 7, days: [2, 4] },
  { id: "5", type: "Tribal Elders", instructor: "Coach Keith", time: "10:00", duration: 60, capacity: 12, enrolled: 3, days: [1, 3, 5] },
  { id: "6", type: "Strength & Conditioning", instructor: "Coach Rich", time: "17:00", duration: 60, capacity: 12, enrolled: 11, days: [1, 2, 3, 4, 5] },
  { id: "7", type: "Small Group Training", instructor: "Coach Keith", time: "18:15", duration: 60, capacity: 12, enrolled: 9, days: [1, 2, 3, 4, 5] },
  { id: "8", type: "Rucking", instructor: "Coach Rich", time: "07:00", duration: 90, capacity: 20, enrolled: 5, days: [6] },
];

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function ClassCard({ cls, date, isLoggedIn }: { cls: typeof MOCK_CLASSES[0]; date: Date; isLoggedIn: boolean }) {
  const [booked, setBooked] = useState(false);
  const spotsLeft = cls.capacity - cls.enrolled;
  const isFull = spotsLeft === 0;
  const isPastClass = isPast(new Date(`${format(date, "yyyy-MM-dd")}T${cls.time}`));

  return (
    <div className={cn(
      "bg-zinc-900 border-l-2 p-4 hover:bg-zinc-800 transition-colors",
      CLASS_COLORS[cls.type] || "border-l-zinc-600",
      isPastClass && "opacity-50"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-white font-montserrat font-bold text-sm truncate">{cls.type}</div>
          {cls.instructor && (
            <div className="text-white/40 text-xs mt-0.5">{cls.instructor}</div>
          )}
          <div className="flex items-center gap-3 mt-2 text-white/50 text-xs">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatTime(cls.time)} · {cls.duration}min
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {spotsLeft > 0 ? `${spotsLeft} spots` : "Full"}
            </span>
          </div>
        </div>
        {!isPastClass && (
          isLoggedIn ? (
            <button
              onClick={() => setBooked(!booked)}
              disabled={isFull && !booked}
              className={cn(
                "flex-shrink-0 text-xs font-bold uppercase tracking-wide px-3 py-1.5 transition-colors",
                booked
                  ? "bg-white/10 text-white/60 border border-white/20"
                  : isFull
                  ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-white/90"
              )}
            >
              {booked ? "Cancel" : isFull ? "Full" : "Book"}
            </button>
          ) : (
            <a href="/login?redirect=/schedule" className="flex-shrink-0 text-xs font-bold uppercase tracking-wide px-3 py-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
              Login
            </a>
          )
        )}
      </div>
      {booked && (
        <div className="flex items-center gap-1.5 mt-2 text-green-400 text-xs">
          <CheckCircle size={12} />
          <span>Booked</span>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isLoggedIn] = useState(false); // will wire to session

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getClassesForDay = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...
    return MOCK_CLASSES
      .filter(c => c.days.includes(dayOfWeek))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="pt-16 min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-white/10 py-10 px-4 text-center">
        <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-2">Book Your Session</p>
        <h1 className="font-montserrat text-4xl font-extrabold text-white uppercase">Schedule</h1>
        {!isLoggedIn && (
          <p className="text-white/50 text-sm mt-3">
            <a href="/login" className="text-white underline underline-offset-2">Log in</a> to book classes.{" "}
            <a href="/join" className="text-white underline underline-offset-2">Not a member?</a>
          </p>
        )}
      </div>

      {/* Week Navigation */}
      <div className="sticky top-16 z-30 bg-black border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-montserrat text-white font-bold text-sm uppercase tracking-wide">
              {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
            <button
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day tabs */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "text-center py-2 text-xs font-medium",
                  isToday(day) ? "text-white border-b-2 border-white" : "text-white/40"
                )}
              >
                <div className="uppercase tracking-wider">{format(day, "EEE")}</div>
                <div className={cn("text-lg font-montserrat font-bold", isToday(day) ? "text-white" : "text-white/60")}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Grid — Desktop */}
      <div className="max-w-6xl mx-auto px-4 py-6 hidden md:block">
        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const classes = getClassesForDay(day);
            return (
              <div key={day.toISOString()} className="space-y-2">
                {classes.length === 0 ? (
                  <div className="text-white/20 text-xs text-center py-8">Rest</div>
                ) : (
                  classes.map((cls) => (
                    <ClassCard key={`${cls.id}-${day.toISOString()}`} cls={cls} date={day} isLoggedIn={isLoggedIn} />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule List — Mobile */}
      <div className="max-w-xl mx-auto px-4 py-6 md:hidden space-y-6">
        {days.map((day) => {
          const classes = getClassesForDay(day);
          return (
            <div key={day.toISOString()}>
              <h3 className={cn(
                "font-montserrat font-bold uppercase text-sm mb-2",
                isToday(day) ? "text-white" : "text-white/40"
              )}>
                {format(day, "EEEE, MMM d")}
              </h3>
              {classes.length === 0 ? (
                <div className="text-white/20 text-xs py-2">No classes</div>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <ClassCard key={`${cls.id}-${day.toISOString()}`} cls={cls} date={day} isLoggedIn={isLoggedIn} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="border-t border-white/10 pt-6 flex flex-wrap gap-4">
          {Object.entries(CLASS_COLORS).map(([name, cls]) => (
            <div key={name} className={cn("flex items-center gap-2 text-xs text-white/50 border-l-2 pl-2", cls)}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
