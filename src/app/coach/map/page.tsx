'use client'
import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useView } from '../view-context'

type MapMember = { name: string; zip: string; status: string; lat: number; lng: number }

const DOT_COLOR: Record<string, string> = {
  ACTIVE: '#4ade80',
  LEAD: '#fbbf24',
  VISITOR: '#fbbf24',
  PENDING: '#fbbf24',
  INACTIVE: '#f87171',
  SUSPENDED: '#f87171',
}

export default function MemberMapPage() {
  const { mode } = useView()
  const mapRef = useRef<HTMLDivElement>(null)
  const [members, setMembers] = useState<MapMember[]>([])
  const [loaded, setLoaded] = useState(false)
  const mapInitialized = useRef(false)

  const stats = {
    active:   members.filter(m => m.status === 'ACTIVE').length,
    lead:     members.filter(m => ['LEAD','VISITOR','PENDING'].includes(m.status)).length,
    inactive: members.filter(m => ['INACTIVE','SUSPENDED'].includes(m.status)).length,
  }

  useEffect(() => {
    if (mode !== 'manager') return
    fetch('/api/coach/map')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMembers(data) })
      .catch(() => {})
  }, [mode])

  // Load Leaflet
  useEffect(() => {
    if (mode !== 'manager') return
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if ((window as any).L) { setLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [mode])

  // Initialize / refresh map when data arrives
  useEffect(() => {
    if (!loaded || !mapRef.current || !members.length) return
    const L = (window as any).L

    // Destroy existing map instance before re-initializing
    if (mapInitialized.current && (mapRef.current as any)._leaflet_id) {
      (L as any).map(mapRef.current).remove?.()
      // Leaflet doesn't always expose .remove() cleanly this way —
      // clear the internal id flag instead
      delete (mapRef.current as any)._leaflet_id
    }

    const map = L.map(mapRef.current).setView([38.35, -77.45], 10)
    mapInitialized.current = true

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Small jitter per zip so overlapping dots don't stack
    const zipCount: Record<string, number> = {}

    for (const m of members) {
      const color = DOT_COLOR[m.status] ?? '#94a3b8'
      const key = m.zip

      // Jitter radius grows slightly with count so dots fan out, not pile up
      zipCount[key] = (zipCount[key] ?? 0) + 1
      const idx = zipCount[key]
      const angle = (idx * 137.5 * Math.PI) / 180 // golden angle spread
      const radius = Math.min(0.008 * Math.sqrt(idx), 0.035)
      const jLat = idx === 1 ? 0 : radius * Math.sin(angle)
      const jLng = idx === 1 ? 0 : radius * Math.cos(angle)

      const icon = L.divIcon({
        html: `<div style="width:11px;height:11px;border-radius:50%;background:${color};opacity:0.9;border:1.5px solid rgba(0,0,0,0.4);box-shadow:0 0 4px ${color}55"></div>`,
        className: '',
        iconSize: [11, 11],
        iconAnchor: [5, 5],
      })

      const statusLabel = m.status.charAt(0) + m.status.slice(1).toLowerCase()

      L.marker([m.lat + jLat, m.lng + jLng], { icon })
        .bindPopup(
          `<div style="font-family:'Montserrat',sans-serif;min-width:120px">
            <div style="font-weight:700;font-size:13px;color:#fff;margin-bottom:4px">${m.name}</div>
            <div style="font-size:11px;color:#a1a1aa">ZIP ${m.zip}</div>
            <div style="font-size:11px;margin-top:2px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:4px;vertical-align:middle"></span>
              <span style="color:${color}">${statusLabel}</span>
            </div>
          </div>`,
          { className: 'hbfit-popup' }
        )
        .addTo(map)
    }

    // Inject popup styles once
    if (!document.getElementById('hbfit-map-styles')) {
      const style = document.createElement('style')
      style.id = 'hbfit-map-styles'
      style.textContent = `
        .hbfit-popup .leaflet-popup-content-wrapper {
          background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; color: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.6);
        }
        .hbfit-popup .leaflet-popup-tip { background: #18181b; }
        .hbfit-popup .leaflet-popup-close-button { color: #71717a !important; }
      `
      document.head.appendChild(style)
    }
  }, [loaded, members])

  // Not in manager mode — access blocked
  if (mode !== 'manager') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldCheck size={48} className="text-amber-400/40 mb-4" />
        <h2 className="font-montserrat font-black text-2xl uppercase tracking-tight text-zinc-400 mb-2">Manager View Required</h2>
        <p className="text-zinc-600 font-lora text-sm max-w-sm">
          Switch to <span className="text-amber-400 font-semibold">Manager</span> mode in the sidebar to access the Member Map.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Member Map</h1>
        <p className="text-zinc-400 text-sm mt-1 font-lora">
          Shows ZIP code centroids — no individual addresses. Click a dot for name.
        </p>
      </div>

      {/* Legend + stats */}
      <div className="flex items-center gap-8 mb-6">
        {[
          { color: 'bg-green-400',  label: 'Active Members',  count: stats.active },
          { color: 'bg-amber-400',  label: 'Guests / Visitors', count: stats.lead },
          { color: 'bg-red-400',    label: 'Inactive / Past', count: stats.inactive },
        ].map(({ color, label, count }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="font-montserrat text-xs uppercase tracking-wider text-zinc-400">{label}</span>
            <span className="font-montserrat font-bold text-white text-sm">{count}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        {members.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 font-lora italic text-sm">
            Loading map data…
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}
