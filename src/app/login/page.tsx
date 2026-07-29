'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const notice = searchParams.get('notice')
  const noticeMessage = notice === 'password-set'
    ? 'Password created! Log in below to access your portal.'
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()

      // POST credentials
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken,
          callbackUrl: '/dashboard',
          json: 'true',
        }),
        redirect: 'follow',
      })

      if (res.ok || res.redirected) {
        const from = searchParams.get('from')
        router.push(from === 'admin' ? '/admin' : '/dashboard')
        router.refresh()
      } else {
        const text = await res.text()
        if (text.includes('CredentialsSignin') || res.status === 401) {
          setError('Invalid email or password.')
        } else {
          setError('Sign in failed. Please try again.')
        }
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image src="/images/logo.png" alt="Honor Bound FIT" width={140} height={40} className="h-10 w-auto mx-auto mb-6" />
          <h1 className="font-montserrat font-black text-2xl uppercase tracking-wide text-white">Member Login</h1>
          <p className="text-white/40 text-sm mt-2">Access your Member Profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {noticeMessage && (
            <div className="bg-green-950/50 border border-green-500/30 text-green-400 text-sm p-3">
              {noticeMessage}
            </div>
          )}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-500/30 text-red-400 text-sm p-3 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-4 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing In...</> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-white/30 text-xs">Not a member yet?</p>
          <Link href="/join" className="text-white text-sm underline underline-offset-2 hover:text-white/70 transition-colors">
            Join Honor Bound FIT →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  )
}
