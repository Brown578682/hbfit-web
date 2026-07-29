"use client";
export default function NewsletterForm() {
  return (
    <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
      <input
        type="email"
        placeholder="your@email.com"
        className="flex-1 bg-white/5 border border-white/20 text-white placeholder:text-white/30 text-sm px-3 py-2 focus:outline-none focus:border-white/50"
      />
      <button
        type="submit"
        className="bg-white text-black text-sm font-bold px-4 py-2 hover:bg-white/90 transition-colors"
      >
        GO
      </button>
    </form>
  );
}
