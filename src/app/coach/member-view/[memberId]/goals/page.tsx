'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Target, CheckCircle2, Plus, X, AlertCircle } from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string | null
  targetDate: string | null
  completedAt: string | null
  createdAt: string
}

export default function MemberViewGoalsPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const [memberName, setMemberName] = useState('')
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' })

  useEffect(() => {
    if (!memberId) return
    fetch(`/api/coach/members/${memberId}`)
      .then(r => r.json())
      .then(m => {
        setMemberName(`${m.firstName} ${m.lastName}`)
        setGoals(Array.isArray(m.goals) ? m.goals : [])
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [memberId])

  async function handleAdd() {
    if (!form.title.trim()) return
    setSaving(true)
    const res = await fetch(`/api/coach/members/${memberId}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const goal = await res.json()
    if (res.ok) {
      setGoals(prev => [goal, ...prev])
      setForm({ title: '', description: '', targetDate: '' })
      setAdding(false)
    }
    setSaving(false)
  }

  async function handleToggle(goal: Goal) {
    const res = await fetch(`/api/coach/members/${memberId}/goals`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId: goal.id, completedAt: goal.completedAt ? null : new Date().toISOString() }),
    })
    const updated = await res.json()
    if (res.ok) setGoals(prev => prev.map(g => g.id === updated.id ? updated : g))
  }

  if (loading) return <div className="p-8 text-zinc-500 text-sm font-montserrat">Loading...</div>

  const open = goals.filter(g => !g.completedAt)
  const done = goals.filter(g => g.completedAt)

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-3 bg-green-400/5 border border-green-400/20 px-4 py-3">
        <AlertCircle size={15} className="text-green-400 shrink-0" />
        <p className="text-green-400 text-xs font-montserrat font-bold uppercase tracking-wide">
          Coach View — {memberName}
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat font-black text-2xl uppercase tracking-tight flex items-center gap-3">
          <Target size={22} className="text-red-500" /> Goals
        </h1>
        <button
          onClick={() => setAdding(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
          {adding ? <X size={14} /> : <Plus size={14} />}
          {adding ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {adding && (
        <div className="bg-zinc-900 border border-zinc-700 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5">Goal Title *</label>
            <input
              className="w-full bg-black border border-zinc-700 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-white"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Run a 5K, Add 20 lbs to squat..."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              className="w-full bg-black border border-zinc-700 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-white resize-none"
              rows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-1.5">Target Date</label>
            <input
              type="date"
              className="bg-black border border-zinc-700 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-white"
              value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !form.title.trim()}
            className="bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Goal'}
          </button>
        </div>
      )}

      {/* Open goals */}
      {open.length > 0 && (
        <div className="mb-6">
          <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-3">Open ({open.length})</p>
          <div className="space-y-2">
            {open.map(g => (
              <div key={g.id} className="bg-zinc-900 border border-zinc-800 px-5 py-4 flex items-start gap-4">
                <button onClick={() => handleToggle(g)} className="mt-0.5 shrink-0 w-5 h-5 border border-zinc-600 hover:border-white transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-white text-sm">{g.title}</p>
                  {g.description && <p className="text-zinc-500 text-xs mt-0.5">{g.description}</p>}
                  {g.targetDate && (
                    <p className="text-zinc-600 text-xs mt-1">
                      Target: {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {done.length > 0 && (
        <div>
          <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-3">Completed ({done.length})</p>
          <div className="space-y-2">
            {done.map(g => (
              <div key={g.id} className="bg-zinc-900/50 border border-zinc-800/50 px-5 py-4 flex items-start gap-4 opacity-60">
                <button onClick={() => handleToggle(g)} className="mt-0.5 shrink-0">
                  <CheckCircle2 size={20} className="text-green-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-zinc-400 text-sm line-through">{g.title}</p>
                  {g.completedAt && (
                    <p className="text-zinc-600 text-xs mt-0.5">
                      Completed {new Date(g.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && !adding && (
        <div className="text-center py-16 text-zinc-600">
          <Target size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-montserrat text-sm">No goals set yet.</p>
        </div>
      )}
    </div>
  )
}
