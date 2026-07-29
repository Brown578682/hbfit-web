'use client'
import { useEffect, useRef, useState } from 'react'

export default function MemberMapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapData, setMapData] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [stats, setStats] = useState({ active: 0, lead: 0, inactive: 0 })

  useEffect(() => {
    fetch('/api/coach/map')
      .then(r => r.json())
      .then(data => {
        setMapData(data)
        const s = { active: 0, lead: 0, inactive: 0 }
        for (const z of data) { s.active += z.active; s.lead += z.lead; s.inactive += z.inactive }
        setStats(s)
      })
  }, [])

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    // Load Leaflet JS
    if ((window as any).L) { setLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current || !mapData.length) return
    const L = (window as any).L
    if ((mapRef.current as any)._leaflet_id) return // already initialized

    const map = L.map(mapRef.current).setView([38.35, -77.45], 10)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap, &copy; CartoDB',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map)

    for (const z of mapData) {
      // Add dots for each category at slightly jittered positions
      const addDots = (count: number, dotColor: string) => {
        for (let i = 0; i < count; i++) {
          const jitter = () => (Math.random() - 0.5) * 0.02
          const icon = L.divIcon({
            html: `<div style="width:10px;height:10px;border-radius:50%;background:${dotColor};opacity:0.85;border:1.5px solid rgba(0,0,0,0.3)"></div>`,
            className: '',
            iconSize: [10, 10],
          })
          L.marker([z.lat + jitter(), z.lng + jitter()], { icon }).addTo(map)
        }
      }

      addDots(z.active, '#4ade80')
      addDots(z.lead, '#fbbf24')
      addDots(z.inactive, '#f87171')
    }
  }, [loaded, mapData])

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Member Map</h1>
        <p className="text-zinc-400 text-sm mt-1 font-lora">Anonymous. Shows ZIP code centroids — no individual addresses.</p>
      </div>

      {/* Legend + stats */}
      <div className="flex items-center gap-8 mb-6">
        {[
          { color: 'bg-green-400', label: 'Active Members', count: stats.active },
          { color: 'bg-amber-400', label: 'Guests / Visitors', count: stats.lead },
          { color: 'bg-red-400', label: 'Inactive / Past', count: stats.inactive },
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
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}
