'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GitBranch } from 'lucide-react'

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-green-400',
  LEAD: 'bg-amber-400',
  VISITOR: 'bg-amber-400',
  PENDING: 'bg-amber-400',
  INACTIVE: 'bg-red-400',
  SUSPENDED: 'bg-red-400',
}

type MemberNode = {
  id: string
  firstName: string
  lastName: string
  status: string
  joinedAt: string
  referredById: string | null
  _count: { referrals: number }
  children?: MemberNode[]
}

function TreeNode({ node, depth = 0 }: { node: MemberNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = (node.children?.length ?? 0) > 0

  return (
    <div className={depth > 0 ? 'ml-8 border-l border-zinc-800 pl-4' : ''}>
      <div className="flex items-center gap-3 py-2 group">
        {hasChildren && (
          <button onClick={() => setExpanded(e => !e)}
            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors font-mono text-xs">
            {expanded ? '−' : '+'}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[node.status] ?? 'bg-zinc-500'}`} />
        <Link href={`/coach/members/${node.id}`}
          className="font-montserrat font-semibold text-sm text-white hover:text-amber-400 transition-colors">
          {node.firstName} {node.lastName}
        </Link>
        <span className="font-montserrat text-xs uppercase tracking-wider text-zinc-600">{node.status}</span>
        {hasChildren && (
          <span className="font-montserrat text-xs text-zinc-600">
            {node.children!.length} referral{node.children!.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="font-lora text-xs text-zinc-700 ml-auto">
          {node.joinedAt ? new Date(node.joinedAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : ''}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

export default function ReferralTreePage() {
  const [members, setMembers] = useState<MemberNode[]>([])
  const [loading, setLoading] = useState(true)
  const [roots, setRoots] = useState<MemberNode[]>([])
  const [unlinked, setUnlinked] = useState<MemberNode[]>([])

  useEffect(() => {
    fetch('/api/coach/referrals')
      .then(r => r.json())
      .then((data: MemberNode[]) => {
        setMembers(data)
        // Build tree
        const byId: Record<string, MemberNode> = {}
        for (const m of data) byId[m.id] = { ...m, children: [] }
        const noRef: MemberNode[] = []
        for (const m of data) {
          if (m.referredById && byId[m.referredById]) {
            byId[m.referredById].children!.push(byId[m.id])
          } else if (!m.referredById) {
            noRef.push(byId[m.id])
          }
        }
        // Roots = members with no referredById who HAVE referrals
        const treeRoots = noRef.filter(m => (m.children?.length ?? 0) > 0)
        setRoots(treeRoots)
        // Unlinked = no referredById, no referrals
        setUnlinked(noRef.filter(m => (m.children?.length ?? 0) === 0))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalReferrals = members.filter(m => m.referredById).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Referral Tree</h1>
        <p className="text-zinc-400 text-sm mt-1 font-lora">{totalReferrals} members joined through a referral.</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-8">
        {[
          { color: 'bg-green-400', label: 'Active' },
          { color: 'bg-amber-400', label: 'Lead / Guest' },
          { color: 'bg-red-400', label: 'Inactive' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="font-montserrat text-xs uppercase tracking-wider text-zinc-500">{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-500 font-lora italic">Loading referral data...</p>
      ) : roots.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center">
          <GitBranch size={32} className="mx-auto text-zinc-600 mb-3" />
          <p className="font-montserrat font-bold text-zinc-400 uppercase tracking-wide text-sm">No referral chains yet</p>
          <p className="font-lora text-zinc-600 text-sm mt-2">Once members start referring others and the &ldquo;Referred by&rdquo; field is filled in, chains will appear here.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          {roots.map(root => <TreeNode key={root.id} node={root} />)}
        </div>
      )}

      {unlinked.length > 0 && (
        <div className="mt-8">
          <h2 className="font-montserrat font-bold text-sm uppercase tracking-wide text-zinc-500 mb-4">
            {unlinked.length} Members Without Referral Links
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {unlinked.map(m => (
              <Link key={m.id} href={`/coach/members/${m.id}`}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 hover:border-zinc-600 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[m.status] ?? 'bg-zinc-500'}`} />
                <span className="font-montserrat text-xs text-white truncate">{m.firstName} {m.lastName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
