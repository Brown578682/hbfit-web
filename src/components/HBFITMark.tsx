// Single source of truth for the HBFIT brand mark.
// Colors: HB = blue-700, F = red-600, I = white, T = red-600
// Usage: <HBFITMark /> or <HBFITMark suffix=" PORTAL" />

export function HBFITMark({ suffix, className }: { suffix?: string; className?: string }) {
  return (
    <span className={className}>
      <span className="text-blue-700">HB</span>
      <span className="text-red-600">F</span>
      <span className="text-white">I</span>
      <span className="text-red-600">T</span>
      {suffix && <span className="text-zinc-500">{suffix}</span>}
    </span>
  )
}

// Full wordmark: HONOR (blue) + BOUND FIT letter-by-letter alternating white/red
// HONOR=blue-600, B=white, O=red-500, U=white, N=red-500, D=white, F=red-500, I=white, T=red-500
// Usage: <HBFITWordmark /> or <HBFITWordmark className="text-xl font-black ..." />
export function HBFITWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-blue-600">HONOR</span>
      {" "}
      <span className="text-white">B</span>
      <span className="text-red-500">O</span>
      <span className="text-white">U</span>
      <span className="text-red-500">N</span>
      <span className="text-white">D</span>
      {" "}
      <span className="text-red-500">F</span>
      <span className="text-white">I</span>
      <span className="text-red-500">T</span>
    </span>
  )
}
