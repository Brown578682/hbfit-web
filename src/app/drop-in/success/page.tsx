import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function DropInSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle size={56} className="text-emerald-500" />
        </div>
        <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">You&apos;re In</h1>
        <p className="text-zinc-400 leading-relaxed">
          Payment confirmed. Your class credits have been added to your account — book a class anytime through the schedule.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/schedule" className="bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors text-sm">
            Book a Class
          </Link>
          <Link href="/dashboard" className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 transition-colors text-sm">
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
