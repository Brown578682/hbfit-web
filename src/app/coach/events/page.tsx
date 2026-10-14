'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { Plus, X, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED'

interface HbEvent {
  id: string
  title: string
  slug: string
  status: EventStatus
  startDate: string
  endDate?: string
  location?: string
  cost?: string
  deadline?: string
  collaborators?: string
  description?: string
  externalUrl?: string
  permitRequired?: boolean
  permitApplied?: string
  permitApproved?: string
  equipmentRequired?: string
  imageAssets?: Record<string, boolean>
  postingChannels?: Record<string, boolean>
  bookingLinks?: Record<string, boolean>
  operationalCosts?: OpCostRow[]
  marketingPlan?: MarketingRow[]
  sponsorships?: SponsorRow[]
  attendance?: AttendanceRow[]
  afterActionNotes?: string
  finalCba?: Record<string, string | number>
}

interface OpCostRow    { type: string; source: string; required: string; budget: string; cost: string }
interface MarketingRow { type: string; description: string; beginDate: string; endDate: string; budget: string; location: string }
interface SponsorRow   { type: string; sponsor: string; fee: string; due: string; paid: string }
interface AttendanceRow{ type: string; source: string; ipa: string; projected: string; actual: string }

// ── Constants ─────────────────────────────────────────────────────────────────
const IMAGE_ASSETS = [
  { key: 'poster',          label: 'Poster',            dim: '13in × 19in' },
  { key: 'banner',          label: 'Banner',            dim: '1535×827' },
  { key: 'square',          label: 'Square',            dim: '2160×2160' },
  { key: 'vertical',        label: 'Vertical',          dim: '1080×1920' },
  { key: 'runsignupBanner', label: 'RunSignUp Banner',  dim: '2400×800' },
  { key: 'facebookBanner',  label: 'Facebook Banner',   dim: '1920×1050' },
  { key: 'eventbriteBanner',label: 'Eventbrite Banner', dim: '2160×1080' },
]

const POSTING_CHANNELS = [
  { key: 'eventsPage',             label: 'Events Page' },
  { key: 'facebookEvents',         label: 'Facebook Events' },
  { key: 'eventbrite',             label: 'Eventbrite' },
  { key: 'runsignup',              label: 'RunSignUp' },
  { key: 'fredericksburgFreePress',label: 'Fredericksburg Free Press' },
  { key: 'lakeAnnaGuide',          label: 'Lake Anna Guide' },
  { key: 'rallyPoint',             label: 'Rally Point' },
  { key: 'allEventsIn',            label: 'AllEvents.in' },
  { key: 'teamRwbApp',             label: 'Team RWB App' },
  { key: 'goruck',                 label: 'GORUCK' },
  { key: 'scso',                   label: 'SCSO' },
  { key: 'fxbgNeighbors',          label: 'FXBG Neighbors' },
  { key: 'newsletter',             label: 'Newsletter' },
  { key: 'radioEvents',            label: 'Radio Events' },
  { key: 'gymDesk',                label: 'Gym Desk' },
]

const BOOKING_LINKS = [
  { key: 'gymDesk',    label: 'Gym Desk' },
  { key: 'runSignUp',  label: 'RunSignUp' },
  { key: 'facebook',   label: 'Facebook' },
  { key: 'eventbrite', label: 'Eventbrite' },
]

const FINAL_CBA_FIELDS = [
  { key: 'firstTime',            label: 'First-Time Participants' },
  { key: 'returning',            label: 'Returning Participants' },
  { key: 'sponsors',             label: 'Sponsors' },
  { key: 'vendors',              label: 'Vendors' },
  { key: 'partners',             label: 'Partners' },
  { key: 'totalAttendance',      label: 'Total Attendance' },
  { key: 'volunteersPresent',    label: 'Volunteers Present' },
  { key: 'volunteersRecruited',  label: 'Volunteers Recruited' },
  { key: 'mentorSignups',        label: 'Mentor Signups' },
  { key: 'menteeSignups',        label: 'Mentee Signups' },
  { key: 'ysaRegistrations',     label: 'YSA Registrations' },
  { key: 'contactRegistrations', label: 'Contact Registrations' },
  { key: 'sponsorshipIncome',    label: 'Sponsorship Income ($)' },
  { key: 'eventRegistration',    label: 'Event Registration ($)' },
  { key: 'donationsPrior',       label: 'Donations Received Prior ($)' },
  { key: 'donationsDuring',      label: 'Donations Received During ($)' },
  { key: 'foodRaffleIncome',     label: 'Food & Raffle Income ($)' },
  { key: 'totalIncome',          label: 'Total Income ($)' },
]

const TABS = ['Overview', 'Promotion', 'Logistics', 'Costs', 'Sponsorships', 'Attendance', 'After Action']

const STATUS_STYLE: Record<EventStatus, string> = {
  DRAFT:     'bg-zinc-800 text-zinc-400',
  PUBLISHED: 'bg-green-950 text-green-400 border border-green-800',
  CANCELED:  'bg-red-950 text-red-400 border border-red-800',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-zinc-500 text-xs font-montserrat uppercase tracking-wider block mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
    </div>
  )
}

function Textarea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <div>
      <label className="text-zinc-500 text-xs font-montserrat uppercase tracking-wider block mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-600 resize-none" />
    </div>
  )
}

function CheckRow({ label, checked, onChange, sub }: { label: string; checked: boolean; onChange: (v: boolean) => void; sub?: string }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={cn('flex items-center gap-3 px-3 py-2.5 w-full text-left border transition-colors',
        checked ? 'border-green-800 bg-green-950/30' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600')}>
      <div className={cn('w-4 h-4 border flex items-center justify-center shrink-0',
        checked ? 'border-green-500 bg-green-500' : 'border-zinc-600')}>
        {checked && <Check size={10} className="text-black" strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <span className="text-white text-sm font-montserrat">{label}</span>
        {sub && <span className="text-zinc-500 text-xs ml-2">{sub}</span>}
      </div>
    </button>
  )
}

function emptyEvent(): Partial<HbEvent> {
  return {
    title: '', status: 'DRAFT', startDate: '', location: '', cost: '',
    deadline: '', collaborators: '', description: '', externalUrl: '',
    permitRequired: false, equipmentRequired: '',
    imageAssets: {}, postingChannels: {}, bookingLinks: {},
    operationalCosts: [], marketingPlan: [], sponsorships: [], attendance: [],
    afterActionNotes: '',
    finalCba: {},
  }
}

// ── Table editors ─────────────────────────────────────────────────────────────
function OpCostTable({ rows, onChange }: { rows: OpCostRow[]; onChange: (r: OpCostRow[]) => void }) {
  const add = () => onChange([...rows, { type: '', source: '', required: '', budget: '', cost: '' }])
  const upd = (i: number, k: keyof OpCostRow, v: string) => { const r = [...rows]; r[i] = { ...r[i], [k]: v }; onChange(r) }
  const del = (i: number) => onChange(rows.filter((_, x) => x !== i))
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-1 text-zinc-500 text-xs font-montserrat uppercase tracking-wider px-1">
        {['Type','Source','Required?','Budget','Cost'].map(h => <div key={h}>{h}</div>)}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-5 gap-1 items-center">
          {(['type','source','required','budget','cost'] as (keyof OpCostRow)[]).map(k => (
            <input key={k} value={r[k]} onChange={e => upd(i, k, e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white px-2 py-1.5 text-xs focus:outline-none focus:border-zinc-600" />
          ))}
          <button onClick={() => del(i)} className="text-zinc-600 hover:text-red-400 transition-colors col-span-5 text-right text-xs pr-1">remove</button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-montserrat uppercase tracking-widest text-amber-400 hover:text-white transition-colors flex items-center gap-1">
        <Plus size={12} /> Add Row
      </button>
    </div>
  )
}

function MarketingTable({ rows, onChange }: { rows: MarketingRow[]; onChange: (r: MarketingRow[]) => void }) {
  const add = () => onChange([...rows, { type: '', description: '', beginDate: '', endDate: '', budget: '', location: '' }])
  const upd = (i: number, k: keyof MarketingRow, v: string) => { const r = [...rows]; r[i] = { ...r[i], [k]: v }; onChange(r) }
  const del = (i: number) => onChange(rows.filter((_, x) => x !== i))
  const fields: { k: keyof MarketingRow; label: string }[] = [
    { k: 'type', label: 'Type' }, { k: 'description', label: 'Description' },
    { k: 'beginDate', label: 'Begin' }, { k: 'endDate', label: 'End' },
    { k: 'budget', label: 'Budget' }, { k: 'location', label: 'Location' },
  ]
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {fields.map(({ k, label }) => (
              <div key={k}>
                <label className="text-zinc-600 text-xs block mb-0.5">{label}</label>
                <input value={r[k]} onChange={e => upd(i, k, e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-2 py-1 text-xs focus:outline-none" />
              </div>
            ))}
          </div>
          <button onClick={() => del(i)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">remove</button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-montserrat uppercase tracking-widest text-amber-400 hover:text-white transition-colors flex items-center gap-1">
        <Plus size={12} /> Add Row
      </button>
    </div>
  )
}

function SponsorTable({ rows, onChange }: { rows: SponsorRow[]; onChange: (r: SponsorRow[]) => void }) {
  const add = () => onChange([...rows, { type: '', sponsor: '', fee: '', due: '', paid: '' }])
  const upd = (i: number, k: keyof SponsorRow, v: string) => { const r = [...rows]; r[i] = { ...r[i], [k]: v }; onChange(r) }
  const del = (i: number) => onChange(rows.filter((_, x) => x !== i))
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-1 text-zinc-500 text-xs font-montserrat uppercase tracking-wider px-1">
        {['Type','Sponsor','Fee','Due','Paid'].map(h => <div key={h}>{h}</div>)}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="space-y-1">
          <div className="grid grid-cols-5 gap-1">
            {(['type','sponsor','fee','due','paid'] as (keyof SponsorRow)[]).map(k => (
              <input key={k} value={r[k]} onChange={e => upd(i, k, e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white px-2 py-1.5 text-xs focus:outline-none focus:border-zinc-600" />
            ))}
          </div>
          <button onClick={() => del(i)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">remove</button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-montserrat uppercase tracking-widest text-amber-400 hover:text-white transition-colors flex items-center gap-1">
        <Plus size={12} /> Add Row
      </button>
    </div>
  )
}

function AttendanceTable({ rows, onChange }: { rows: AttendanceRow[]; onChange: (r: AttendanceRow[]) => void }) {
  const add = () => onChange([...rows, { type: '', source: '', ipa: '', projected: '', actual: '' }])
  const upd = (i: number, k: keyof AttendanceRow, v: string) => { const r = [...rows]; r[i] = { ...r[i], [k]: v }; onChange(r) }
  const del = (i: number) => onChange(rows.filter((_, x) => x !== i))
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-1 text-zinc-500 text-xs font-montserrat uppercase tracking-wider px-1">
        {['Type','Source','IPA','Projected','Actual'].map(h => <div key={h}>{h}</div>)}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="space-y-1">
          <div className="grid grid-cols-5 gap-1">
            {(['type','source','ipa','projected','actual'] as (keyof AttendanceRow)[]).map(k => (
              <input key={k} value={r[k]} onChange={e => upd(i, k, e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white px-2 py-1.5 text-xs focus:outline-none focus:border-zinc-600" />
            ))}
          </div>
          <button onClick={() => del(i)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">remove</button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-montserrat uppercase tracking-widest text-amber-400 hover:text-white transition-colors flex items-center gap-1">
        <Plus size={12} /> Add Row
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CoachEventsPage() {
  const [events, setEvents]   = useState<HbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<HbEvent | null>(null)
  const [draft, setDraft]     = useState<Partial<HbEvent>>(emptyEvent())
  const [tab, setTab]         = useState(0)
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')
  const [isNew, setIsNew]     = useState(false)

  const load = useCallback(() => {
    fetch('/api/coach/events').then(r => r.json()).then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setSelected(null)
    setDraft(emptyEvent())
    setTab(0)
    setIsNew(true)
    setErr('')
  }

  const openEdit = (ev: HbEvent) => {
    setSelected(ev)
    setDraft({ ...ev })
    setTab(0)
    setIsNew(false)
    setErr('')
  }

  const closePanel = () => { setSelected(null); setIsNew(false); setErr('') }

  const set = (k: keyof HbEvent, v: any) => setDraft(d => ({ ...d, [k]: v }))

  const setCheck = (field: 'imageAssets' | 'postingChannels' | 'bookingLinks', key: string, val: boolean) => {
    setDraft(d => ({ ...d, [field]: { ...(d[field] as Record<string, boolean> || {}), [key]: val } }))
  }

  const save = async () => {
    if (!draft.title) { setErr('Event name is required'); return }
    if (!draft.startDate) { setErr('Date is required'); return }
    setSaving(true); setErr('')
    try {
      const url  = isNew ? '/api/coach/events' : `/api/coach/events/${selected!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed') }
      load(); closePanel()
    } catch (e: any) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const cancel = async () => {
    if (!selected) return
    if (!confirm('Mark this event as Canceled?')) return
    await fetch(`/api/coach/events/${selected.id}`, { method: 'DELETE' })
    load(); closePanel()
  }

  const panelOpen = isNew || !!selected

  // ── Tab content ────────────────────────────────────────────────────────────
  const tabContent = () => {
    switch (tab) {
      case 0: return ( // Overview
        <div className="space-y-4">
          <Input label="Event Name *" value={draft.title ?? ''} onChange={v => set('title', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" value={draft.startDate ? draft.startDate.slice(0,16) : ''} type="datetime-local" onChange={v => set('startDate', v)} />
            <Input label="End Date" value={draft.endDate ? draft.endDate.slice(0,16) : ''} type="datetime-local" onChange={v => set('endDate', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={draft.location ?? ''} onChange={v => set('location', v)} />
            <Input label="Cost" value={draft.cost ?? ''} onChange={v => set('cost', v)} placeholder="Free, $25, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Deadline" value={draft.deadline ? draft.deadline.slice(0,10) : ''} type="date" onChange={v => set('deadline', v)} />
            <div>
              <label className="text-zinc-500 text-xs font-montserrat uppercase tracking-wider block mb-1">Status</label>
              <select value={draft.status ?? 'DRAFT'} onChange={e => set('status', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-600">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
          <Input label="Collaborators" value={draft.collaborators ?? ''} onChange={v => set('collaborators', v)} placeholder="Names or organizations" />
          <Textarea label="Description" value={draft.description ?? ''} onChange={v => set('description', v)} rows={4} />
          <Input label="External URL / Website" value={draft.externalUrl ?? ''} onChange={v => set('externalUrl', v)} />
        </div>
      )
      case 1: return ( // Promotion
        <div className="space-y-6">
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-2">Image Assets</h3>
            <div className="space-y-1">
              {IMAGE_ASSETS.map(({ key, label, dim }) => (
                <CheckRow key={key} label={label} sub={dim}
                  checked={!!(draft.imageAssets as Record<string, boolean> | undefined)?.[key]}
                  onChange={v => setCheck('imageAssets', key, v)} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-2">Posting Channels</h3>
            <div className="space-y-1">
              {POSTING_CHANNELS.map(({ key, label }) => (
                <CheckRow key={key} label={label}
                  checked={!!(draft.postingChannels as Record<string, boolean> | undefined)?.[key]}
                  onChange={v => setCheck('postingChannels', key, v)} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-2">Booking Links</h3>
            <div className="space-y-1">
              {BOOKING_LINKS.map(({ key, label }) => (
                <CheckRow key={key} label={label}
                  checked={!!(draft.bookingLinks as Record<string, boolean> | undefined)?.[key]}
                  onChange={v => setCheck('bookingLinks', key, v)} />
              ))}
            </div>
          </div>
        </div>
      )
      case 2: return ( // Logistics
        <div className="space-y-5">
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-2">Permit</h3>
            <div className="flex gap-3 mb-3">
              {[{ v: true, label: 'Required' }, { v: false, label: 'Not Required' }].map(({ v, label }) => (
                <button key={String(v)} onClick={() => set('permitRequired', v)}
                  className={cn('px-4 py-2 text-xs font-montserrat font-bold uppercase tracking-widest border transition-colors',
                    draft.permitRequired === v ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500')}>
                  {label}
                </button>
              ))}
            </div>
            {draft.permitRequired && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Applied" value={draft.permitApplied ? draft.permitApplied.slice(0,10) : ''} type="date" onChange={v => set('permitApplied', v)} />
                <Input label="Approved" value={draft.permitApproved ? draft.permitApproved.slice(0,10) : ''} type="date" onChange={v => set('permitApproved', v)} />
              </div>
            )}
          </div>
          <Textarea label="Equipment Required" value={draft.equipmentRequired ?? ''} onChange={v => set('equipmentRequired', v)} rows={4} />
        </div>
      )
      case 3: return ( // Costs
        <div className="space-y-8">
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-3">Operational Costs</h3>
            <OpCostTable rows={(draft.operationalCosts as OpCostRow[]) ?? []} onChange={v => set('operationalCosts', v)} />
          </div>
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-3">Marketing Plan</h3>
            <MarketingTable rows={(draft.marketingPlan as MarketingRow[]) ?? []} onChange={v => set('marketingPlan', v)} />
          </div>
        </div>
      )
      case 4: return ( // Sponsorships
        <div>
          <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-3">Sponsorships</h3>
          <SponsorTable rows={(draft.sponsorships as SponsorRow[]) ?? []} onChange={v => set('sponsorships', v)} />
        </div>
      )
      case 5: return ( // Attendance
        <div>
          <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-3">Attendance</h3>
          <AttendanceTable rows={(draft.attendance as AttendanceRow[]) ?? []} onChange={v => set('attendance', v)} />
        </div>
      )
      case 6: return ( // After Action
        <div className="space-y-6">
          <Textarea label="After Action Notes" value={draft.afterActionNotes ?? ''} onChange={v => set('afterActionNotes', v)} rows={8} />
          <div>
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-3">Final CBA</h3>
            <div className="grid grid-cols-2 gap-3">
              {FINAL_CBA_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-zinc-600 text-xs block mb-0.5">{label}</label>
                  <input
                    value={(draft.finalCba as Record<string, string | number> | undefined)?.[key] ?? ''}
                    onChange={e => set('finalCba', { ...(draft.finalCba as Record<string, string | number> || {}), [key]: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white px-2 py-1.5 text-xs focus:outline-none focus:border-zinc-600" />
                </div>
              ))}
            </div>
          </div>
          {/* Danger zone */}
          {!isNew && (
            <div className="border border-red-900 p-4 mt-6">
              <p className="text-red-400 text-xs font-montserrat font-bold uppercase tracking-widest mb-2">Danger Zone</p>
              <button onClick={cancel}
                className="bg-red-950 border border-red-800 text-red-400 font-montserrat font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-red-900 transition-colors">
                Cancel Event
              </button>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* List */}
      <div className={cn('flex-1 p-8 transition-all', panelOpen ? 'hidden' : '')}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
            <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Events</h1>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-white/90 transition-colors">
            <Plus size={14} /> New Event
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-zinc-600" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 font-montserrat text-sm">No events yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(ev => (
              <button key={ev.id} onClick={() => openEdit(ev)}
                className={cn('w-full flex items-center justify-between bg-zinc-900 border px-5 py-4 hover:border-zinc-600 transition-colors text-left',
                  selected?.id === ev.id ? 'border-amber-400/40' : 'border-zinc-800')}>
                <div>
                  <div className="font-montserrat font-bold text-white">{ev.title}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{fmtDate(ev.startDate)}{ev.location ? ` · ${ev.location}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-montserrat font-bold uppercase tracking-wider px-2 py-0.5', STATUS_STYLE[ev.status])}>
                    {ev.status}
                  </span>
                  <ChevronRight size={14} className="text-zinc-600" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over panel */}
      {panelOpen && (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col z-40 max-w-3xl mx-auto border-x border-zinc-800">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
            <div>
              <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500">
                {isNew ? 'New Event' : 'Edit Event'}
              </p>
              <h2 className="font-montserrat font-bold text-white text-sm truncate max-w-[320px]">
                {draft.title || 'Untitled'}
              </h2>
            </div>
            <button onClick={closePanel} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 shrink-0 overflow-x-auto">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={cn('px-4 py-3 text-xs font-montserrat font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors',
                  tab === i ? 'text-white border-b-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-300')}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {tabContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-800 shrink-0 space-y-2">
            {err && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-montserrat">
                <AlertCircle size={12} /> {err}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={save} disabled={saving}
                className="flex-1 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest py-3 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : (isNew ? 'Create Event' : 'Save Changes')}
              </button>
              <button onClick={closePanel}
                className="px-4 py-3 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-montserrat font-bold text-xs uppercase tracking-widest transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
