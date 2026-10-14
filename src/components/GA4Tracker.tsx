'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

function GA4NavigationTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!window.gtag) return
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: url,
      send_to: measurementId,
    })
  }, [pathname, searchParams, measurementId])

  return null
}

// Suspense boundary required for useSearchParams in App Router
export function GA4Tracker({ measurementId }: { measurementId: string }) {
  return (
    <Suspense fallback={null}>
      <GA4NavigationTracker measurementId={measurementId} />
    </Suspense>
  )
}
