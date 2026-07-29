'use client';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <img
        src="/images/logo.png"
        alt="Honor Bound FIT"
        className="w-28 h-auto mb-8 opacity-90"
      />

      {/* Icon */}
      <div className="text-6xl mb-6">📡</div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
        You&apos;re Offline
      </h1>

      {/* Subtext */}
      <p className="text-gray-400 text-lg max-w-sm mb-8">
        No connection detected. Check your signal and try again — we&apos;ll be
        here when you&apos;re back online.
      </p>

      {/* Retry button */}
      <button
        onClick={() => window.location.reload()}
        className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
      >
        Try Again
      </button>

      {/* Footer note */}
      <p className="mt-12 text-gray-600 text-sm">
        Honor Bound FIT · Fredericksburg, VA
      </p>
    </main>
  );
}
