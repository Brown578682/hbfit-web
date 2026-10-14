// Admin sub-pages (/admin/billing, /admin/gap, etc.) are now accessed through
// the Coach portal sidebar. This layout is intentionally minimal — just passes children through.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
