'use client'
import { useEffect, useState, useRef } from 'react'
import { Users, Download, Search, Calendar, NotebookPen, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BoothLead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string | null
  notes: string | null
  source: string
  createdAt: string
}

function age(dob: string | null): string {
  if (!dob) return '—'
  const diff = Date.now() - new Date(dob).getTime()
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    timeZone: 'America/New_York',
  })
}

function NotesCell({ lead, onSave }: { lead: BoothLead; onSave: (id: string, notes: string) => void }) {
  const [editing, setEditing]   = useState(false)
  const [draft,   setDraft]     = useState(lead.notes ?? '')
  const [saving,  setSaving]    = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/booth/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: draft.trim() || null }),
      })
      if (res.ok) { onSave(lead.id, draft.trim()); setEditing(false) }
    } finally { setSaving(false) }
  }

  const cancel = () => { setDraft(lead.notes ?? ''); setEditing(false) }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 py-1">
        <textarea
          ref={taRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          placeholder="Add a note…"
          className="w-full bg-zinc-800 border border-zinc-600 focus:border-blue-500 text-white text-xs px-3 py-2 outline-none resize-none rounded"
          onKeyDown={e => { if (e.key === 'Escape') cancel() }}
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
          >
            <Check size={12} /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'w-full text-left group flex items-start gap-2 py-1 rounded transition-colors hover:bg-zinc-800/60',
        lead.notes ? 'text-zinc-300' : 'text-zinc-600'
      )}
    >
      <NotebookPen size={13} className={cn('mt-0.5 shrink-0 transition-colors', lead.notes ? 'text-blue-400' : 'text-zinc-700 group-hover:text-zinc-500')} />
      <span className="text-xs leading-relaxed">
        {lead.notes || <span className="italic">Add note…</span>}
      </span>
    </button>
  )
}

export default function EventLeadsPage() {
  const [leads,   setLeads]   = useState<BoothLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetch('/api/admin/booth/leads')
      .then(r => r.json())
      .then(d => { setLeads(d.leads ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleNoteSave = (id: string, notes: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: notes || null } : l))
  }

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    return (
      l.firstName.toLowerCase().includes(q) ||
      l.lastName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.source.toLowerCase().includes(q) ||
      (l.notes ?? '').toLowerCase().includes(q)
    )
  })

  const groups = filtered.reduce<Record<string, BoothLead[]>>((acc, l) => {
    acc[l.source] = acc[l.source] ?? []
    acc[l.source].push(l)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-red-500" />
            <h1 className="font-montserrat font-extrabold uppercase text-xl tracking-tight text-white">Event Leads</h1>
          </div>
          <p className="text-zinc-500 text-sm">{leads.length} total lead{leads.length !== 1 ? 's' : ''} collected</p>
        </div>
        <a
          href="/api/admin/booth/leads?format=csv"
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-montserrat font-bold uppercase tracking-wider px-4 py-2.5 text-xs transition-colors"
        >
          <Download size={14} />
          Export CSV
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, notes, or event…"
          className="w-full bg-zinc-900 border border-white/10 focus:border-red-600 text-white pl-9 pr-4 py-3 outline-none transition-colors placeholder:text-zinc-600 text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 font-montserrat uppercase tracking-widest text-sm">
          No leads found
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([source, groupLeads]) => (
              <div key={source}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-red-500" />
                  <span className="font-montserrat font-bold uppercase tracking-widest text-xs text-white/60">
                    {source.replace('booth-', 'Event — ')}
                  </span>
                  <span className="text-zinc-700 text-xs ml-1">({groupLeads.length})</span>
                </div>

                <div className="border border-white/10 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-zinc-900/60">
                        <th className="text-left px-4 py-3 font-montserrat font-bold uppercase tracking-widest text-xs text-white/40 whitespace-nowrap">Name</th>
                        <th className="text-left px-4 py-3 font-montserrat font-bold uppercase tracking-widest text-xs text-white/40">Email</th>
                        <th className="text-left px-4 py-3 font-montserrat font-bold uppercase tracking-widest text-xs text-white/40">Phone</th>
                        <th className="text-left px-4 py-3 font-montserrat font-bold uppercase tracking-widest text-xs text-white/40 whitespace-nowrap">Age</th>
                        <th className="text-left px-4 py-3 font-montserrat font-bold uppercase tracking-widest text-xs text-white/40 whitespace-nowrap">Signed</th>
                        <th className="text-left px-4 py-3 font-montserrat font-bold uppercase tracking-widest text-xs text-white/40 min-w-[200px]">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupLeads.map((l, i) => (
                        <tr key={l.id} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-zinc-900/20'}`}>
                          <td className="px-4 py-3 font-montserrat font-bold text-white whitespace-nowrap">
                            {l.firstName} {l.lastName}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            <a href={`mailto:${l.email}`} className="hover:text-white transition-colors">{l.email}</a>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                            <a href={`tel:${l.phone}`} className="hover:text-white transition-colors">{l.phone}</a>
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{age(l.dateOfBirth)}</td>
                          <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{formatDate(l.createdAt)}</td>
                          <td className="px-4 py-3">
                            <NotesCell lead={l} onSave={handleNoteSave} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
