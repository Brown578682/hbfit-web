'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Settings, RefreshCw, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react'

function fmt(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const INPUT = 'w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-600'
const BTN_PRIMARY = 'bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2'
const BTN_DANGER = 'bg-red-950 border border-red-800 text-red-400 font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2'

type ClassType = { id: string; name: string; color: string; duration: number }
type Staff = { id: string; firstName: string; lastName: string; title: string | null }
type Session = {
  id: string; classTypeId: string; instructorId?: string | null
  startTime: string; endTime: string; capacity: number
  location?: string | null; notes?: string | null; isCanceled: boolean
  classType?: { name: string; color: string }
  instructor?: { firstName: string; lastName: string } | null
  _count?: { bookings: number }
  bookings?: any[]
}

// ── Recurring Schedule Tab ─────────────────────────────────────────────────────

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

type SlotRecord = {
  id: string
  slotKey: string
  isActive: boolean
  startHour: number
  startMinute: number
  durationMin: number
  days: number[]
  capacity: number
  classType: { id: string; name: string; color: string }
  instructor: { id: string; firstName: string; lastName: string } | null
}

function fmtSlotTime(h: number, m: number) {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function RecurringScheduleTab({ myRole, myStaffId }: { myRole: string | null; myStaffId: string | null }) {
  const [slots, setSlots] = useState<SlotRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ slotId: string; slotLabel: string; bookingCount: number } | null>(null)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [staffList, setStaffList] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [editSlot, setEditSlot] = useState<SlotRecord | null>(null)
  const [editForm, setEditForm] = useState({ instructorId: '', capacity: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/schedule-slots')
    setSlots(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (myRole === 'ADMIN') {
      fetch('/api/coach/staff').then(r => r.json()).then(d => setStaffList(Array.isArray(d) ? d : []))
    }
  }, [myRole])

  const visibleSlots = myRole === 'ADMIN'
    ? slots
    : slots.filter(s => s.instructor?.id === myStaffId)

  const toggleActive = async (slot: SlotRecord) => {
    if (!slot.isActive) {
      setSaving(slot.id)
      await fetch(`/api/admin/schedule-slots/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })
      await load()
      setSaving(null)
    } else {
      // Fetch how many members are booked before showing confirm
      setLoadingBookings(true)
      const res = await fetch(`/api/admin/schedule-slots/${slot.id}/bookings`)
      const { count } = await res.json()
      setLoadingBookings(false)
      setConfirm({
        slotId: slot.id,
        slotLabel: `${slot.classType.name} @ ${fmtSlotTime(slot.startHour, slot.startMinute)} (${slot.days.map(d => DAY_LABELS[d]).join('/')})`,
        bookingCount: count,
      })
    }
  }

  const confirmDeactivate = async () => {
    if (!confirm) return
    setSaving(confirm.slotId)
    setConfirm(null)
    const res = await fetch(`/api/admin/schedule-slots/${confirm.slotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    })
    const data = await res.json()
    await load()
    setSaving(null)
    if (data.canceledCount > 0) {
      const memberNote = data.affectedMembers > 0 ? ` ${data.affectedMembers} member${data.affectedMembers !== 1 ? 's' : ''} notified by push + email.` : ''
      alert(`Done. ${data.canceledCount} future session${data.canceledCount !== 1 ? 's' : ''} canceled.${memberNote}`)
    }
  }

  const openEdit = (slot: SlotRecord) => {
    setEditSlot(slot)
    setEditForm({ instructorId: slot.instructor?.id ?? '', capacity: String(slot.capacity) })
  }

  const saveEdit = async () => {
    if (!editSlot) return
    setSaving(editSlot.id)
    await fetch(`/api/admin/schedule-slots/${editSlot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructorId: editForm.instructorId || null,
        capacity: parseInt(editForm.capacity) || editSlot.capacity,
      }),
    })
    setEditSlot(null)
    await load()
    setSaving(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-zinc-500 font-montserrat text-sm">Loading…</div>
  )

  const grouped: Record<string, SlotRecord[]> = {}
  for (const s of visibleSlots) {
    const key = s.instructor ? `${s.instructor.firstName} ${s.instructor.lastName}` : 'Unassigned'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-montserrat font-bold text-lg uppercase tracking-wide">Recurring Schedule</h2>
          <p className="font-lora text-zinc-500 text-sm mt-0.5">
            Toggle a slot off to permanently remove it from the rotation and cancel all future sessions.
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-zinc-500 hover:text-white font-montserrat text-xs uppercase tracking-widest transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {Object.entries(grouped).map(([instructor, instructorSlots]) => (
        <div key={instructor}>
          <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-3">{instructor}</p>
          <div className="space-y-2">
            {[...instructorSlots]
              .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute))
              .map(slot => (
              <div
                key={slot.id}
                className={`flex items-center gap-4 border rounded-lg px-5 py-4 transition-colors ${
                  slot.isActive ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-800/50 opacity-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slot.classType.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-montserrat font-bold text-sm text-white">{slot.classType.name}</span>
                    <span className="font-montserrat text-xs text-zinc-500">
                      {fmtSlotTime(slot.startHour, slot.startMinute)} · {slot.durationMin}min
                    </span>
                    <span className="font-montserrat text-xs text-zinc-600">
                      {slot.days.map(d => DAY_LABELS[d]).join(' / ')}
                    </span>
                    <span className="font-montserrat text-xs text-zinc-600">Cap: {slot.capacity}</span>
                  </div>
                  {!slot.isActive && (
                    <p className="font-montserrat text-xs text-amber-500/70 mt-0.5">Deactivated — not generating new sessions</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {myRole === 'ADMIN' && (
                    <button
                      onClick={() => openEdit(slot)}
                      className="font-montserrat text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => toggleActive(slot)}
                    disabled={saving === slot.id || loadingBookings}
                    className="flex items-center gap-1.5 font-montserrat text-xs transition-colors disabled:opacity-40"
                    title={slot.isActive ? 'Deactivate this recurring slot' : 'Reactivate'}
                  >
                    {saving === slot.id || loadingBookings ? (
                      <RefreshCw size={18} className="animate-spin text-zinc-500" />
                    ) : slot.isActive ? (
                      <ToggleRight size={24} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={24} className="text-zinc-600" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Confirm deactivate dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 max-w-md w-full mx-4 space-y-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-montserrat font-bold text-white text-base mb-2">Deactivate recurring slot?</h3>
                <p className="font-lora text-zinc-400 text-sm leading-relaxed">
                  This will remove <span className="text-white font-semibold">{confirm.slotLabel}</span> from
                  the rotation and cancel all future sessions for this slot. Past sessions are unaffected.
                </p>
                {confirm.bookingCount > 0 && (
                  <div className="mt-3 bg-red-950/40 border border-red-700/60 rounded-lg px-4 py-3">
                    <p className="text-red-300 text-sm font-montserrat font-bold">
                      ⚠ {confirm.bookingCount} member{confirm.bookingCount !== 1 ? 's' : ''} currently booked
                    </p>
                    <p className="text-red-400/70 text-xs mt-1">
                      They will be automatically notified by push notification and email.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={confirmDeactivate}
                className="flex-1 bg-red-900/60 hover:bg-red-800/60 border border-red-700 text-red-300 font-montserrat font-bold text-xs uppercase tracking-widest py-3 transition-colors">
                Yes, Deactivate{confirm.bookingCount > 0 ? ' & Notify Members' : ''}
              </button>
              <button onClick={() => setConfirm(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-montserrat font-bold text-xs uppercase tracking-widest py-3 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit slot panel (admin only) */}
      {editSlot && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditSlot(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col gap-5 z-50">
            <div className="flex items-center justify-between">
              <h3 className="font-montserrat font-bold text-sm uppercase tracking-widest text-white">Edit Slot</h3>
              <button onClick={() => setEditSlot(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="font-lora text-zinc-400 text-sm">
              {editSlot.classType.name} · {fmtSlotTime(editSlot.startHour, editSlot.startMinute)}
              <br />{editSlot.days.map(d => DAY_LABELS[d]).join(' / ')}
            </p>
            <div>
              <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Instructor</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none"
                value={editForm.instructorId}
                onChange={e => setEditForm(f => ({ ...f, instructorId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Capacity</label>
              <input
                type="number" min="1"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none"
                value={editForm.capacity}
                onChange={e => setEditForm(f => ({ ...f, capacity: e.target.value }))}
              />
            </div>
            <button onClick={saveEdit} disabled={saving === editSlot.id}
              className="bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest py-3 disabled:opacity-50 hover:bg-zinc-200 transition-colors">
              {saving === editSlot.id ? 'Saving…' : 'Save Changes'}
            </button>
            <p className="font-lora text-zinc-600 text-xs">
              Changes apply to new sessions going forward. Existing future sessions keep their current settings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Schedule Page ─────────────────────────────────────────────────────────

export default function CoachSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0,0,0,0)
    return d
  })
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [myRole, setMyRole] = useState<string | null>(null)
  const [myStaffId, setMyStaffId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'recurring'>('calendar')

  // New class panel
  const [showNewClass, setShowNewClass] = useState(false)
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [newForm, setNewForm] = useState({
    classTypeId: '', date: '', startTime: '06:00', endTime: '07:00',
    instructorId: '', capacity: '12', location: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Edit session panel
  const [editSession, setEditSession] = useState<Session | null>(null)
  const [editForm, setEditForm] = useState<{
    startTime: string; endTime: string; capacity: string
    instructorId: string; notes: string; location: string
    cancelReason: string;
  }>({ startTime: '', endTime: '', capacity: '', instructorId: '', notes: '', location: '', cancelReason: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Class types management
  const [showManageTypes, setShowManageTypes] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeColor, setNewTypeColor] = useState('#f59e0b')
  const [newTypeDuration, setNewTypeDuration] = useState('60')
  const [newTypeDesc, setNewTypeDesc] = useState('')
  const [typesSaving, setTypesSaving] = useState(false)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const loadSessions = useCallback(() => {
    setLoading(true)
    fetch(`/api/coach/sessions?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then(r => r.json())
      .then(data => { setSessions(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.toISOString()])

  useEffect(() => { loadSessions() }, [loadSessions])

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      setMyRole(d?.user?.role ?? null)
      setMyStaffId(d?.user?.staffId ?? null)
    }).catch(() => {})
    fetch('/api/coach/class-types').then(r => r.json()).then(d => setClassTypes(Array.isArray(d) ? d : []))
    fetch('/api/coach/staff').then(r => r.json()).then(d => setStaff(Array.isArray(d) ? d : []))
  }, [])

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d) }
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d) }

  const byDay: Record<number, Session[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]}
  for (const s of sessions) {
    // startTime is UTC ISO — convert to ET to get the correct local day
    const etDate = new Date(new Date(s.startTime).toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const day = etDate.getDay()
    byDay[day].push(s)
  }

  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })

  async function handleNewClass(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveError('')
    const startTime = new Date(`${newForm.date}T${newForm.startTime}:00`).toISOString()
    const endTime   = new Date(`${newForm.date}T${newForm.endTime}:00`).toISOString()
    const res = await fetch('/api/coach/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classTypeId: newForm.classTypeId,
        instructorId: newForm.instructorId || null,
        startTime, endTime,
        capacity: parseInt(newForm.capacity) || 12,
        location: newForm.location || null,
        notes: newForm.notes || null,
      }),
    })
    setSaving(false)
    if (!res.ok) { setSaveError('Failed to create session'); return }
    setShowNewClass(false)
    setNewForm({ classTypeId: '', date: '', startTime: '06:00', endTime: '07:00', instructorId: '', capacity: '12', location: '', notes: '' })
    loadSessions()
  }

  function openEdit(s: Session) {
    setEditSession(s)
    setEditError('')
    const st = new Date(s.startTime)
    const et = new Date(s.endTime)
    const pad = (n: number) => n.toString().padStart(2,'0')
    setEditForm({
      startTime: `${pad(st.getHours())}:${pad(st.getMinutes())}`,
      endTime:   `${pad(et.getHours())}:${pad(et.getMinutes())}`,
      capacity: String(s.capacity),
      instructorId: s.instructorId ?? '',
      notes: s.notes ?? '',
      location: s.location ?? '',
      cancelReason: '',
    })
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editSession) return
    setEditSaving(true); setEditError('')
    const dateStr = editSession.startTime.slice(0,10)
    const startTime = new Date(`${dateStr}T${editForm.startTime}:00`).toISOString()
    const endTime   = new Date(`${dateStr}T${editForm.endTime}:00`).toISOString()
    const res = await fetch(`/api/coach/sessions/${editSession.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime, endTime,
        capacity: parseInt(editForm.capacity) || editSession.capacity,
        instructorId: editForm.instructorId || null,
        notes: editForm.notes || null,
        location: editForm.location || null,
      }),
    })
    setEditSaving(false)
    if (!res.ok) { setEditError('Failed to save'); return }
    setEditSession(null)
    loadSessions()
  }

  async function handleCancel() {
    if (!editSession) return
    setEditSaving(true); setEditError('')
    const res = await fetch(`/api/coach/sessions/${editSession.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCanceled: true, cancelReason: editForm.cancelReason || null }),
    })
    setEditSaving(false)
    if (!res.ok) { setEditError('Failed to cancel session'); return }
    setEditSession(null)
    loadSessions()
  }

  async function handleAddType(e: React.FormEvent) {
    e.preventDefault()
    setTypesSaving(true)
    const res = await fetch('/api/coach/class-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTypeName, color: newTypeColor, duration: parseInt(newTypeDuration)||60, description: newTypeDesc||null }),
    })
    setTypesSaving(false)
    if (res.ok) {
      const t = await res.json()
      setClassTypes(prev => [...prev, t])
      setNewTypeName(''); setNewTypeDesc(''); setNewTypeColor('#f59e0b'); setNewTypeDuration('60')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
          <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Schedule</h1>
        </div>
        <div className="flex items-center gap-3">
          {myRole === 'ADMIN' && activeTab === 'calendar' && (
            <button
              onClick={() => setShowManageTypes(v => !v)}
              className="flex items-center gap-1.5 text-xs font-montserrat font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors border border-amber-400/30 px-3 py-2"
            >
              <Settings size={13} /> Manage Class Types
            </button>
          )}
          {activeTab === 'calendar' && (
            <button
              onClick={() => setShowNewClass(true)}
              className="flex items-center gap-1.5 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2"
            >
              <Plus size={13} /> New Class
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-8">
        {[
          { key: 'calendar',  label: 'Calendar' },
          { key: 'recurring', label: 'Recurring Schedule' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'calendar' | 'recurring')}
            className={`px-5 py-3 font-montserrat text-sm font-semibold border-b-2 transition-colors ${
              activeTab === key
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Recurring Schedule Tab ── */}
      {activeTab === 'recurring' && (
        <RecurringScheduleTab myRole={myRole} myStaffId={myStaffId} />
      )}

      {/* ── Calendar Tab ── */}
      {activeTab === 'calendar' && (
        <>
          {/* Manage Class Types (ADMIN inline section) */}
          {showManageTypes && myRole === 'ADMIN' && (
            <div className="mb-8 bg-zinc-900 border border-zinc-800 p-5">
              <h2 className="font-montserrat font-bold text-sm uppercase tracking-widest text-amber-400 mb-4">Class Types</h2>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {classTypes.map(ct => (
                  <div key={ct.id} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ct.color }} />
                    <span className="text-white text-xs font-montserrat font-bold">{ct.name}</span>
                    <span className="text-zinc-500 text-xs ml-auto">{ct.duration}min</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddType} className="flex flex-col gap-2">
                <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Add New Type</p>
                <div className="flex gap-2">
                  <input className={INPUT + ' flex-1'} placeholder="Name" value={newTypeName}
                    onChange={e => setNewTypeName(e.target.value)} required />
                  <input type="color" className="w-10 h-9 bg-zinc-900 border border-zinc-800 cursor-pointer"
                    value={newTypeColor} onChange={e => setNewTypeColor(e.target.value)} />
                  <input type="number" className={INPUT + ' w-20'} placeholder="min" value={newTypeDuration}
                    onChange={e => setNewTypeDuration(e.target.value)} />
                </div>
                <input className={INPUT} placeholder="Description (optional)" value={newTypeDesc}
                  onChange={e => setNewTypeDesc(e.target.value)} />
                <button type="submit" disabled={typesSaving} className={BTN_PRIMARY + ' mt-1 disabled:opacity-50'}>
                  {typesSaving ? 'Saving...' : 'Add Type'}
                </button>
              </form>
            </div>
          )}

          {/* Week nav */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={prevWeek} className="p-2 border border-zinc-700 hover:border-white hover:text-white text-zinc-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="font-montserrat text-sm text-white min-w-[160px] text-center">
              {MONTHS[weekStart.getMonth()]} {weekStart.getDate()} – {MONTHS[weekEnd.getMonth()]} {weekEnd.getDate()}, {weekEnd.getFullYear()}
            </span>
            <button onClick={nextWeek} className="p-2 border border-zinc-700 hover:border-white hover:text-white text-zinc-400 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="text-zinc-500 font-lora italic text-center py-20">Loading schedule...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                const isToday = day.toDateString() === new Date().toDateString()
                return (
                  <div key={i} className="min-h-[200px]">
                    <div className={`text-center py-2 mb-2 font-montserrat text-xs uppercase tracking-wider ${
                      isToday ? 'bg-white text-black font-bold' : 'text-zinc-500'
                    }`}>
                      <div>{DAYS[day.getDay()]}</div>
                      <div className="text-lg font-bold leading-none mt-0.5">{day.getDate()}</div>
                    </div>
                    <div className="space-y-1.5">
                      {(byDay[day.getDay()] || []).map((s) => {
                        const isMySession = myRole === 'ADMIN' || s.instructorId === myStaffId
                        return (
                          <button
                            key={s.id}
                            onClick={() => isMySession ? openEdit(s) : undefined}
                            disabled={!isMySession}
                            className={`w-full text-left block bg-zinc-900 border p-2 transition-colors ${
                              isMySession
                                ? 'border-zinc-800 hover:border-amber-400/50 cursor-pointer'
                                : 'border-zinc-800/50 opacity-50 cursor-default'
                            }`}
                          >
                            <div className="font-montserrat text-xs font-bold text-white truncate">{s.classType?.name}</div>
                            <div className="text-zinc-500 text-xs mt-0.5">{fmt(new Date(s.startTime))}</div>
                            <div className="text-zinc-600 text-xs">{s._count?.bookings ?? 0}/{s.capacity}</div>
                            {s.instructor && <div className="text-zinc-600 text-xs truncate">{s.instructor.firstName} {s.instructor.lastName}</div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── New Class slide-over ── */}
      {showNewClass && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNewClass(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat font-bold text-sm uppercase tracking-widest text-white">New Class</h2>
              <button onClick={() => setShowNewClass(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleNewClass} className="flex flex-col gap-4">
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Class Type *</label>
                <select required className={INPUT} value={newForm.classTypeId}
                  onChange={e => setNewForm(f => ({...f, classTypeId: e.target.value}))}>
                  <option value="">Select type...</option>
                  {classTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Date *</label>
                <input type="date" required className={INPUT} value={newForm.date}
                  onChange={e => setNewForm(f => ({...f, date: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Start Time *</label>
                  <input type="time" required className={INPUT} value={newForm.startTime}
                    onChange={e => setNewForm(f => ({...f, startTime: e.target.value}))} />
                </div>
                <div>
                  <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">End Time *</label>
                  <input type="time" required className={INPUT} value={newForm.endTime}
                    onChange={e => setNewForm(f => ({...f, endTime: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Instructor</label>
                {myRole === 'ADMIN' ? (
                  <select className={INPUT} value={newForm.instructorId}
                    onChange={e => setNewForm(f => ({...f, instructorId: e.target.value}))}>
                    <option value="">No instructor assigned</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}{s.title ? ` — ${s.title}` : ''}</option>)}
                  </select>
                ) : (
                  <p className="text-zinc-400 text-sm py-2 font-montserrat">Auto-assigned to you</p>
                )}
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Capacity *</label>
                <input type="number" required min="1" className={INPUT} value={newForm.capacity}
                  onChange={e => setNewForm(f => ({...f, capacity: e.target.value}))} />
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Location</label>
                <input type="text" className={INPUT} placeholder="Optional" value={newForm.location}
                  onChange={e => setNewForm(f => ({...f, location: e.target.value}))} />
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
                <textarea rows={3} className={INPUT} value={newForm.notes}
                  onChange={e => setNewForm(f => ({...f, notes: e.target.value}))} />
              </div>
              {saveError && <p className="text-red-400 text-xs font-montserrat">{saveError}</p>}
              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={saving} className={BTN_PRIMARY + ' flex-1 disabled:opacity-50'}>
                  {saving ? 'Saving...' : 'Create Class'}
                </button>
                <button type="button" onClick={() => setShowNewClass(false)}
                  className="text-zinc-500 hover:text-white text-xs font-montserrat uppercase tracking-widest px-4 py-2 border border-zinc-800">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Session slide-over ── */}
      {editSession && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditSession(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat font-bold text-sm uppercase tracking-widest text-white">
                {editSession.classType?.name ?? 'Session'}
              </h2>
              <button onClick={() => setEditSession(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 flex-1 text-center">
                <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Booked</p>
                <p className="font-montserrat font-black text-2xl text-white">
                  {editSession._count?.bookings ?? 0}
                  <span className="text-zinc-500 text-base font-normal">/{editSession.capacity}</span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 flex-1 text-center">
                <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Date</p>
                <p className="font-montserrat font-bold text-sm text-white">
                  {new Date(editSession.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <form onSubmit={handleEditSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Start Time</label>
                  <input type="time" className={INPUT} value={editForm.startTime}
                    onChange={e => setEditForm(f => ({...f, startTime: e.target.value}))} />
                </div>
                <div>
                  <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">End Time</label>
                  <input type="time" className={INPUT} value={editForm.endTime}
                    onChange={e => setEditForm(f => ({...f, endTime: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Capacity</label>
                <input type="number" min="1" className={INPUT} value={editForm.capacity}
                  onChange={e => setEditForm(f => ({...f, capacity: e.target.value}))} />
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Instructor</label>
                {myRole === 'ADMIN' ? (
                  <select className={INPUT} value={editForm.instructorId}
                    onChange={e => setEditForm(f => ({...f, instructorId: e.target.value}))}>
                    <option value="">No instructor assigned</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                ) : (
                  <p className="text-zinc-400 text-sm py-2 font-montserrat">
                    {editSession?.instructor ? `${editSession.instructor.firstName} ${editSession.instructor.lastName}` : 'Unassigned'}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Location</label>
                <input type="text" className={INPUT} value={editForm.location}
                  onChange={e => setEditForm(f => ({...f, location: e.target.value}))} />
              </div>
              <div>
                <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
                <textarea rows={3} className={INPUT} value={editForm.notes}
                  onChange={e => setEditForm(f => ({...f, notes: e.target.value}))} />
              </div>
              {editError && <p className="text-red-400 text-xs font-montserrat">{editError}</p>}
              <button type="submit" disabled={editSaving} className={BTN_PRIMARY + ' disabled:opacity-50'}>
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Cancel Session</p>
              {(editSession._count?.bookings ?? 0) > 0 && (
                <div className="mb-3 bg-red-950/40 border border-red-700/60 rounded-lg px-4 py-3">
                  <p className="text-red-300 text-sm font-montserrat font-bold">
                    ⚠ {editSession._count?.bookings} member{editSession._count?.bookings !== 1 ? 's' : ''} booked
                  </p>
                  <p className="text-red-400/70 text-xs mt-1">
                    They will be notified by push notification and email.
                  </p>
                </div>
              )}
              <input type="text" className={INPUT + ' mb-3'} placeholder="Reason (optional)"
                value={editForm.cancelReason}
                onChange={e => setEditForm(f => ({...f, cancelReason: e.target.value}))} />
              <button onClick={handleCancel} disabled={editSaving} className={BTN_DANGER + ' disabled:opacity-50'}>
                {editSaving ? 'Canceling...' : 'Cancel This Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
