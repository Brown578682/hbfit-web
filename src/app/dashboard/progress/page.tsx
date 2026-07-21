'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, ChevronDown, TrendingUp } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ProgressEntry {
  id:          number;
  date:        string;
  weight:      string;
  bodyFat:     string;
  chest:       string;
  waist:       string;
  hips:        string;
  biceps:      string;
  thighs:      string;
  bench:       string;
  squat:       string;
  deadlift:    string;
  pullUps:     string;
  pushUps:     string;
  mileTime:    string;
  notes:       string;
}

// ---------------------------------------------------------------------------
// Mock history data
// ---------------------------------------------------------------------------
const INITIAL_HISTORY: ProgressEntry[] = [
  { id: 10, date: '2026-07-17', weight: '194', bodyFat: '18.2', chest: '41',  waist: '34', hips: '40', biceps: '15',   thighs: '24', bench: '225', squat: '275', deadlift: '315', pullUps: '12', pushUps: '45', mileTime: '7:42', notes: 'Felt strong today.'        },
  { id: 9,  date: '2026-07-10', weight: '195', bodyFat: '18.6', chest: '41',  waist: '34', hips: '40', biceps: '14.75',thighs: '24', bench: '215', squat: '265', deadlift: '305', pullUps: '11', pushUps: '42', mileTime: '7:55', notes: ''                            },
  { id: 8,  date: '2026-07-03', weight: '196', bodyFat: '19.0', chest: '40.5',waist: '35', hips: '40', biceps: '14.5', thighs: '24', bench: '215', squat: '260', deadlift: '305', pullUps: '10', pushUps: '40', mileTime: '8:05', notes: 'July 4th week — stayed on track.' },
  { id: 7,  date: '2026-06-26', weight: '197', bodyFat: '19.3', chest: '40.5',waist: '35', hips: '40', biceps: '14.5', thighs: '23', bench: '205', squat: '255', deadlift: '295', pullUps: '10', pushUps: '38', mileTime: '8:10', notes: ''                            },
  { id: 6,  date: '2026-06-19', weight: '198', bodyFat: '19.7', chest: '40',  waist: '35', hips: '40', biceps: '14',   thighs: '23', bench: '205', squat: '250', deadlift: '295', pullUps: '9',  pushUps: '36', mileTime: '8:22', notes: 'Started creatine this week.' },
  { id: 5,  date: '2026-06-12', weight: '200', bodyFat: '20.1', chest: '40',  waist: '36', hips: '41', biceps: '14',   thighs: '23', bench: '195', squat: '245', deadlift: '285', pullUps: '8',  pushUps: '35', mileTime: '8:30', notes: ''                            },
  { id: 4,  date: '2026-06-05', weight: '201', bodyFat: '20.4', chest: '40',  waist: '36', hips: '41', biceps: '13.75',thighs: '23', bench: '195', squat: '240', deadlift: '285', pullUps: '8',  pushUps: '33', mileTime: '8:41', notes: ''                            },
  { id: 3,  date: '2026-05-29', weight: '202', bodyFat: '20.8', chest: '39.5',waist: '36', hips: '41', biceps: '13.5', thighs: '23', bench: '185', squat: '235', deadlift: '275', pullUps: '7',  pushUps: '30', mileTime: '8:55', notes: 'Memorial Day weekend — good food, good workouts.' },
  { id: 2,  date: '2026-05-15', weight: '204', bodyFat: '21.2', chest: '39.5',waist: '37', hips: '42', biceps: '13.5', thighs: '22', bench: '175', squat: '225', deadlift: '265', pullUps: '6',  pushUps: '28', mileTime: '9:12', notes: ''                            },
  { id: 1,  date: '2026-05-01', weight: '206', bodyFat: '22.0', chest: '39',  waist: '37', hips: '42', biceps: '13',   thighs: '22', bench: '165', squat: '215', deadlift: '255', pullUps: '5',  pushUps: '25', mileTime: '9:30', notes: 'First entry — starting fresh!' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const emptyForm = (): Omit<ProgressEntry, 'id' | 'date'> => ({
  weight: '', bodyFat: '', chest: '', waist: '', hips: '', biceps: '', thighs: '',
  bench: '', squat: '', deadlift: '', pullUps: '', pushUps: '', mileTime: '', notes: '',
});

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------
function Field({
  label, name, value, unit, onChange,
}: {
  label: string; name: string; value: string; unit?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-400 uppercase tracking-wider font-montserrat">{label}</label>
      <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none"
          placeholder="—"
        />
        {unit && <span className="px-3 text-xs text-zinc-500 border-l border-zinc-700">{unit}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProgressPage() {
  const [history, setHistory]     = useState<ProgressEntry[]>(INITIAL_HISTORY);
  const [form, setForm]           = useState(emptyForm());
  const [showHistory, setShowHistory] = useState(true);
  const [saved, setSaved]         = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: ProgressEntry = {
      id:   (history[0]?.id ?? 0) + 1,
      date: new Date().toISOString().split('T')[0],
      ...form,
    };
    setHistory([entry, ...history]);
    setForm(emptyForm());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Header ── */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} />
          Dashboard
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="font-montserrat font-bold uppercase tracking-widest text-sm">Progress Tracker</span>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        <div className="flex items-center gap-3">
          <TrendingUp size={24} className="text-red-500" />
          <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">
            Progress Tracker
          </h1>
        </div>

        {/* ── Chart placeholder ── */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 flex flex-col items-center justify-center gap-2 min-h-[160px]">
          <TrendingUp size={32} className="text-zinc-600" />
          <p className="text-zinc-500 text-sm font-montserrat">Chart coming soon</p>
          <p className="text-zinc-600 text-xs">Weight &amp; body-fat trend over time will display here.</p>
        </div>

        {/* ── Log new entry ── */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-5">
            Log New Entry
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Body stats */}
            <div>
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Body Stats
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Weight"   name="weight"  value={form.weight}  unit="lbs" onChange={set('weight')}  />
                <Field label="Body Fat" name="bodyFat" value={form.bodyFat} unit="%"   onChange={set('bodyFat')} />
              </div>
            </div>

            {/* Measurements */}
            <div>
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Measurements (inches)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <Field label="Chest"  name="chest"  value={form.chest}  onChange={set('chest')}  />
                <Field label="Waist"  name="waist"  value={form.waist}  onChange={set('waist')}  />
                <Field label="Hips"   name="hips"   value={form.hips}   onChange={set('hips')}   />
                <Field label="Biceps" name="biceps" value={form.biceps} onChange={set('biceps')} />
                <Field label="Thighs" name="thighs" value={form.thighs} onChange={set('thighs')} />
              </div>
            </div>

            {/* PRs */}
            <div>
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Personal Records
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Bench Press" name="bench"    value={form.bench}    unit="lbs" onChange={set('bench')}    />
                <Field label="Squat"       name="squat"    value={form.squat}    unit="lbs" onChange={set('squat')}    />
                <Field label="Deadlift"    name="deadlift" value={form.deadlift} unit="lbs" onChange={set('deadlift')} />
                <Field label="Pull-Ups"    name="pullUps"  value={form.pullUps}  unit="reps" onChange={set('pullUps')} />
                <Field label="Push-Ups"    name="pushUps"  value={form.pushUps}  unit="reps" onChange={set('pushUps')} />
                <Field label="Mile Time"   name="mileTime" value={form.mileTime} unit="mm:ss" onChange={set('mileTime')} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider font-montserrat mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes')(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none resize-none focus:border-red-500 transition-colors"
                placeholder="How did today feel? Any wins or struggles?"
              />
            </div>

            {/* Photo upload */}
            <div>
              <h3 className="font-montserrat text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Progress Photo (optional)
              </h3>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-zinc-600 hover:border-zinc-400 px-5 py-4 transition-colors">
                <Camera size={18} className="text-zinc-400" />
                <span className="text-sm text-zinc-400">
                  {photoName ? photoName : 'Upload photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
              {photoName && (
                <p className="mt-2 text-xs text-zinc-500">
                  Photo saved locally — cloud sync coming soon.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="rounded-lg bg-red-600 hover:bg-red-500 transition-colors px-8 py-3 font-montserrat font-bold uppercase tracking-widest text-sm"
            >
              Save Entry
            </button>

            {saved && (
              <p className="text-emerald-400 text-sm font-semibold animate-pulse">
                ✓ Entry saved!
              </p>
            )}
          </form>
        </section>

        {/* ── History table ── */}
        <section>
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            className="flex items-center gap-2 font-montserrat text-lg font-bold uppercase tracking-widest mb-4 hover:text-red-400 transition-colors"
          >
            <ChevronDown
              size={18}
              className={`text-red-500 transition-transform ${showHistory ? '' : '-rotate-90'}`}
            />
            History (last {Math.min(history.length, 10)} entries)
          </button>

          {showHistory && (
            <div className="overflow-x-auto rounded-xl border border-zinc-700">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 uppercase tracking-widest font-montserrat">
                    {['Date','Wt','BF%','Bench','Squat','DL','Pull-ups','Push-ups','Mile','Notes'].map((h) => (
                      <th key={h} className="px-3 py-3 text-left whitespace-nowrap font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((e, i) => (
                    <tr
                      key={e.id}
                      className={`border-t border-zinc-800 transition-colors hover:bg-zinc-800 ${i % 2 === 0 ? 'bg-black' : 'bg-zinc-950'}`}
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-zinc-300">{e.date}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.weight || '—'} lbs</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.bodyFat || '—'}%</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.bench || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.squat || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.deadlift || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.pullUps || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.pushUps || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{e.mileTime || '—'}</td>
                      <td className="px-3 py-3 max-w-[160px] truncate text-zinc-500">{e.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
