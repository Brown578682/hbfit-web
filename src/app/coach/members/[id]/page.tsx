'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Check, Target, MessageSquare, TrendingUp } from 'lucide-react'
import CoreMetricsEntry, { CoreMetricsCard, CoreMetricsDelta } from '@/components/CoreMetricsEntry'
import { ASSESSMENT_LABELS, type AssessmentType } from '@/lib/coreMetrics'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10 border-green-800/40',
  LEAD: 'text-amber-400 bg-amber-400/10 border-amber-800/40',
  VISITOR: 'text-amber-400 bg-amber-400/10 border-amber-800/40',
  PENDING: 'text-amber-400 bg-amber-400/10 border-amber-800/40',
  INACTIVE: 'text-red-400 bg-red-400/10 border-red-800/40',
  SUSPENDED: 'text-red-400 bg-red-400/10 border-red-800/40',
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'progress'|'notes'|'goals'>('overview')
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [addingGoal, setAddingGoal] = useState(false)
  const [coreMetrics, setCoreMetrics] = useState<any[]>([])
  const [metricsLoaded, setMetricsLoaded] = useState(false)
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [metricsAssessmentType, setMetricsAssessmentType] = useState<AssessmentType>('ONBOARDING')

  useEffect(() => { params.then(p => setId(p.id)) }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/coach/members/${id}`)
      .then(r => r.json())
      .then(d => { setMember(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || tab !== 'progress' || metricsLoaded) return
    fetch(`/api/coach/members/${id}/core-metrics`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCoreMetrics(d); setMetricsLoaded(true) })
  }, [id, tab, metricsLoaded])

  const submitNote = async () => {
    if (!newNote.trim() || !id) return
    setAddingNote(true)
    const res = await fetch(`/api/coach/members/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    })
    const note = await res.json()
    setMember((prev: any) => ({ ...prev, coachNotes: [note, ...(prev.coachNotes || [])] }))
    setNewNote('')
    setAddingNote(false)
  }

  const submitGoal = async () => {
    if (!newGoal.trim() || !id) return
    setAddingGoal(true)
    const res = await fetch(`/api/coach/members/${id}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newGoal }),
    })
    const goal = await res.json()
    setMember((prev: any) => ({ ...prev, goals: [goal, ...(prev.goals || [])] }))
    setNewGoal('')
    setAddingGoal(false)
  }

  const toggleGoal = async (goalId: string, completedAt: string | null) => {
    if (!id) return
    const res = await fetch(`/api/coach/members/${id}/goals`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, completedAt: completedAt ? null : new Date().toISOString() }),
    })
    const updated = await res.json()
    setMember((prev: any) => ({ ...prev, goals: prev.goals.map((g: any) => g.id === goalId ? updated : g) }))
  }

  if (loading) return <div className="p-8 text-zinc-500 font-lora italic">Loading member...</div>
  if (!member || member.error) return <div className="p-8 text-red-400 font-montserrat">Member not found.</div>

  const currentPlan = member.memberships?.[0]

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/coach/members" className="flex items-center gap-2 text-zinc-500 hover:text-white font-montserrat text-xs uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft size={14} /> All Members
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-montserrat font-black text-4xl uppercase tracking-tight">
            {member.firstName} {member.lastName}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`font-montserrat text-xs uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_COLORS[member.status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
              {member.status}
            </span>
            {member.gapEligible && (
              <span className="font-montserrat text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-400">GAP</span>
            )}
            {currentPlan && (
              <span className="text-zinc-400 text-sm font-lora">{currentPlan.plan?.name}</span>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-zinc-400 font-lora">
          <div>Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—'}</div>
          {member.lastVisit && <div>Last visit {new Date(member.lastVisit).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-zinc-800">
        {(['overview','progress','notes','goals'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 font-montserrat text-xs uppercase tracking-wider transition-colors ${
              tab === t ? 'text-white border-b-2 border-white -mb-px' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {t}
            {t === 'notes' && member.coachNotes?.length ? ` (${member.coachNotes.length})` : ''}
            {t === 'goals' && member.goals?.length ? ` (${member.goals.length})` : ''}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="font-montserrat font-bold text-sm uppercase tracking-wide text-zinc-400 mb-4">Contact Info</h3>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['Email', member.user?.email],
                ['Phone', member.phone],
                ['Address', [member.address, member.city, member.state, member.zip].filter(Boolean).join(', ')],
                ['Date of Birth', member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : null],
                ['Check-in Code', member.checkInCode],
                ['Source', member.source],
              ].filter(([,v]) => v).map(([k,v]) => (
                <div key={String(k)}>
                  <dt className="font-montserrat text-xs uppercase tracking-wider text-zinc-500">{k}</dt>
                  <dd className="font-lora text-zinc-200 text-sm mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Check-ins', value: member.checkIns?.length ?? 0 },
              { label: 'Classes Booked', value: member.bookings?.length ?? 0 },
              { label: 'Referrals Made', value: member.referrals?.length ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 text-center">
                <div className="font-montserrat font-black text-3xl text-white">{value}</div>
                <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Referred by / Referrals */}
          {(member.referredBy || member.referrals?.length > 0) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-montserrat font-bold text-sm uppercase tracking-wide text-zinc-400 mb-4">Referrals</h3>
              {member.referredBy && (
                <div className="mb-3">
                  <span className="text-zinc-500 text-xs font-montserrat uppercase tracking-wider">Referred by: </span>
                  <Link href={`/coach/members/${member.referredBy.id}`} className="text-white hover:text-amber-400 font-montserrat font-semibold text-sm transition-colors">
                    {member.referredBy.firstName} {member.referredBy.lastName}
                  </Link>
                </div>
              )}
              {member.referrals?.length > 0 && (
                <div>
                  <span className="text-zinc-500 text-xs font-montserrat uppercase tracking-wider">Referred: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.referrals.map((r: any) => (
                      <Link key={r.id} href={`/coach/members/${r.id}`}
                        className={`font-montserrat text-xs px-2 py-1 rounded border transition-colors ${
                          r.status === 'ACTIVE' ? 'border-green-800/40 text-green-400 hover:border-green-400' :
                          r.status === 'INACTIVE' ? 'border-red-800/40 text-red-400' :
                          'border-amber-800/40 text-amber-400'
                        }`}>
                        {r.firstName} {r.lastName}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent check-ins */}
          {member.checkIns?.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="font-montserrat font-bold text-sm uppercase tracking-wide text-zinc-400 mb-4">Recent Check-ins</h3>
              <div className="space-y-2">
                {member.checkIns.slice(0,10).map((c: any) => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className="font-lora text-zinc-300">{new Date(c.checkedAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span>
                    <span className="font-montserrat text-xs uppercase text-zinc-500">{c.method}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {tab === 'progress' && (
        <div className="space-y-6">

          {/* Record new assessment */}
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <TrendingUp size={14} className="text-red-500" /> Core Metrics
            </h2>
            <button
              onClick={() => setShowMetricsForm(f => !f)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-lg text-xs transition-colors"
            >
              <Plus size={13} /> Record Assessment
            </button>
          </div>

          {showMetricsForm && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-widest font-montserrat mb-2">Assessment Type</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(ASSESSMENT_LABELS) as [AssessmentType, string][]).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => setMetricsAssessmentType(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold border transition-colors ${
                        metricsAssessmentType === val
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <CoreMetricsEntry
                assessmentType={metricsAssessmentType}
                apiPath={`/api/coach/members/${id}/core-metrics`}
                compact={false}
                allowSkip={true}
                onSaved={(entry) => {
                  setCoreMetrics(prev => [entry as any, ...prev])
                  setShowMetricsForm(false)
                }}
              />
            </div>
          )}

          {/* No baseline yet */}
          {!metricsLoaded && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {metricsLoaded && coreMetrics.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-8 text-center space-y-3">
              <p className="text-zinc-400 text-sm">No assessments recorded yet.</p>
              <p className="text-zinc-600 text-xs">
                Complete the member&apos;s baseline assessment once they&apos;ve learned the
                lifts and movements — typically 1–2 weeks after joining.
              </p>
              <button
                onClick={() => { setMetricsAssessmentType('ONBOARDING'); setShowMetricsForm(true) }}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-xs transition-colors mt-2"
              >
                <Plus size={13} /> Record Baseline Assessment
              </button>
            </div>
          )}

          {/* Delta: baseline vs latest */}
          {coreMetrics.length >= 2 && (() => {
            const baseline = [...coreMetrics].reverse().find(m => m.assessmentType === 'ONBOARDING') ?? coreMetrics[coreMetrics.length - 1]
            const latest = coreMetrics[0]
            if (baseline.id === latest.id) return null
            return (
              <div>
                <p className="font-montserrat text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">📈 Progress vs Baseline</p>
                <CoreMetricsDelta
                  baseline={baseline}
                  current={latest}
                />
              </div>
            )
          })()}

          {/* Assessment history */}
          {coreMetrics.length > 0 && (
            <div className="space-y-4">
              <p className="font-montserrat text-xs font-bold uppercase tracking-widest text-zinc-500">Assessment History</p>
              {coreMetrics.map((m: any) => (
                <CoreMetricsCard
                  key={m.id}
                  metrics={m}
                  label={`${ASSESSMENT_LABELS[m.assessmentType as AssessmentType] ?? m.assessmentType}${m.recordedBy ? ' (Coach)' : ' (Self)'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <textarea
              value={newNote} onChange={e => setNewNote(e.target.value)}
              placeholder="Add a coach note..."
              rows={3}
              className="w-full bg-transparent text-white font-lora text-sm resize-none focus:outline-none placeholder-zinc-600"
            />
            <div className="flex justify-end mt-3">
              <button onClick={submitNote} disabled={addingNote || !newNote.trim()}
                className="flex items-center gap-2 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-zinc-200 transition-colors disabled:opacity-40">
                <Plus size={14} /> Add Note
              </button>
            </div>
          </div>
          {!member.coachNotes?.length ? (
            <p className="text-zinc-500 font-lora italic">No notes yet.</p>
          ) : member.coachNotes.map((note: any) => (
            <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <p className="font-lora text-zinc-200 text-sm leading-relaxed">{note.content}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="font-montserrat text-xs text-zinc-600">
                  {note.coach?.firstName} {note.coach?.lastName} · {new Date(note.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                </span>
                {note.isPrivate && <span className="font-montserrat text-xs uppercase tracking-wider text-zinc-600">Private</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goals Tab */}
      {tab === 'goals' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex gap-3">
            <input
              value={newGoal} onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitGoal()}
              placeholder="Add a goal..."
              className="flex-1 bg-transparent text-white font-lora text-sm focus:outline-none placeholder-zinc-600"
            />
            <button onClick={submitGoal} disabled={addingGoal || !newGoal.trim()}
              className="flex items-center gap-2 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-zinc-200 transition-colors disabled:opacity-40">
              <Target size={14} /> Add
            </button>
          </div>
          {!member.goals?.length ? (
            <p className="text-zinc-500 font-lora italic">No goals set yet.</p>
          ) : member.goals.map((goal: any) => (
            <div key={goal.id} className={`flex items-start gap-4 bg-zinc-900 border rounded-lg p-5 transition-colors ${
              goal.completedAt ? 'border-green-800/40' : 'border-zinc-800'
            }`}>
              <button onClick={() => toggleGoal(goal.id, goal.completedAt)} className="mt-0.5 transition-colors">
                {goal.completedAt
                  ? <Check size={20} className="text-green-400" />
                  : <div className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-zinc-400" />}
              </button>
              <div className="flex-1">
                <p className={`font-montserrat font-semibold text-sm ${goal.completedAt ? 'line-through text-zinc-500' : 'text-white'}`}>{goal.title}</p>
                {goal.description && <p className="font-lora text-zinc-400 text-xs mt-1">{goal.description}</p>}
                {goal.targetDate && <p className="font-montserrat text-xs text-zinc-600 mt-1">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>}
                {goal.completedAt && <p className="font-montserrat text-xs text-green-600 mt-1">Completed {new Date(goal.completedAt).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
