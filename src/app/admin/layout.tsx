import Link from "next/link";
import {
  Users,
  ScanLine,
  CreditCard,
  CalendarDays,
  BarChart3,
  Shield,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Members",       href: "/admin/members",  icon: Users },
  { label: "Check-in",      href: "/admin/checkin",  icon: ScanLine },
  { label: "GAP Approvals", href: "/admin/gap",       icon: ShieldCheck },
  { label: "Messages",      href: "/admin/messages",  icon: MessageSquare },
  { label: "Billing",       href: "/admin/billing",  icon: CreditCard },
  { label: "Classes",       href: "/admin/classes",  icon: CalendarDays },
  { label: "Reports",       href: "/admin/reports",  icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-6 border-b border-zinc-800">
          <Shield className="text-red-500" size={22} />
          <span className="font-montserrat font-bold text-sm tracking-widest uppercase text-white">
            HB<span className="text-red-500">FIT</span> Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-montserrat text-sm font-semibold tracking-wide"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800">
          <Link
            href="/"
            className="text-xs text-zinc-600 hover:text-zinc-400 font-montserrat transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-black">
        {children}
      </main>
    </div>
  );
}
