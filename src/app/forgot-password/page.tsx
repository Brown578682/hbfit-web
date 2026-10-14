'use client'
import { useState, Suspense } from 'react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <NextImage src="/images/logo.png" alt="Honor Bound FIT" width={140} height={40} className="h-10 w-auto mx-auto mb-6" />
          <h1 className="font-montserrat font-black text-2xl uppercase tracking-wide text-white">Reset Password</h1>
          <p className="text-white/40 text-sm mt-2">We&apos;ll send you a link to set a new one.</p>
        </div>

        {submitted ? (
          <div className="bg-green-950/50 border border-green-500/30 text-green-400 p-6 text-center space-y-3">
            <CheckCircle size={28} className="mx-auto" />
            <p className="text-sm font-semibold">Check your email</p>
            <p className="text-xs text-green-400/70">
              If an account exists for <span className="text-green-300">{email}</span>, a reset link is on its way. Check your spam folder if you don&apos;t see it within a few minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-4 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <NextLink href="/login" className="text-white/40 text-xs hover:text-white/70 transition-colors">
            ← Back to Login
          </NextLink>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
