"use client"

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { ChevronRight, CheckCircle2 } from 'lucide-react'

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  numberOfFosterChildren?: string
  fosteringDuration?: string
  consent?: string
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const FOSTERING_DURATION_OPTIONS = [
  'Less than 1 year',
  '1–3 years',
  '3–5 years',
  '5+ years',
]

const inputClass =
  'w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 font-lora text-base focus:outline-none focus:border-red-600 transition-colors duration-200'

const errorClass = 'mt-1 text-red-500 text-sm font-lora'

const labelClass =
  'block font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-400 mb-2'

export default function F3ApplyPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    numberOfFosterChildren: '',
    fosteringDuration: '',
    agencyName: '',
    heardAboutUs: '',
    additionalNotes: '',
    consent: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required.'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.'
    if (!form.email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.'
    }
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    if (!form.address.trim()) errs.address = 'Address is required.'
    if (!form.city.trim()) errs.city = 'City is required.'
    if (!form.state) errs.state = 'State is required.'
    if (!form.zip.trim()) errs.zip = 'ZIP code is required.'
    if (form.numberOfFosterChildren === '') {
      errs.numberOfFosterChildren = 'Please enter the number of foster children.'
    } else if (isNaN(Number(form.numberOfFosterChildren)) || Number(form.numberOfFosterChildren) < 0) {
      errs.numberOfFosterChildren = 'Please enter a valid number.'
    }
    if (!form.fosteringDuration) errs.fosteringDuration = 'Please select how long you have been fostering.'
    if (!form.consent) errs.consent = 'You must confirm your eligibility to apply.'
    return errs
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error]')
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const res = await fetch('/api/f3/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          zip: form.zip.trim(),
          numberOfFosterChildren: Number(form.numberOfFosterChildren),
          fosteringDuration: form.fosteringDuration,
          agencyName: form.agencyName.trim() || undefined,
          heardAboutUs: form.heardAboutUs.trim() || undefined,
          additionalNotes: form.additionalNotes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      setServerError('A network error occurred. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function field(
    id: keyof typeof form & keyof FormErrors,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    type = 'text',
  ) {
    return (
      <div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass}${errors[id] ? ' border-red-500' : ''}`}
          autoComplete="off"
        />
        {errors[id] && (
          <p className={errorClass} data-error>
            {errors[id]}
          </p>
        )}
      </div>
    )
  }

  // ── Success State ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="bg-black text-white min-h-screen">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
        <section className="min-h-screen flex items-center justify-center px-6 py-28">
          <div className="max-w-2xl w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-8 h-8 text-red-500" />
            </div>
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-4">
              Application Submitted
            </p>
            <h1 className="font-montserrat font-black text-4xl md:text-5xl uppercase tracking-tight mb-6 leading-none">
              WE&apos;VE GOT YOUR APPLICATION
            </h1>
            <div className="bg-zinc-950 border border-zinc-800 p-8 mb-8 text-left">
              <p className="font-lora text-zinc-300 text-lg leading-relaxed mb-4">
                Thank you, <span className="text-white font-semibold">{form.firstName}</span>. We&apos;ve received your F3 application.
                Our team will verify your foster family status and reach out within{' '}
                <strong className="text-white">48 hours</strong>.
              </p>
              <p className="font-lora text-zinc-400 leading-relaxed">
                Check your inbox — we&apos;ve sent a confirmation to <span className="text-zinc-300">{form.email}</span>.
                If you have questions in the meantime, email us at{' '}
                <a href="mailto:Rich@HonorBoundFIT.com" className="text-red-500 hover:text-red-400 transition-colors">
                  Rich@HonorBoundFIT.com
                </a>.
              </p>
            </div>
            <Link
              href="/f3"
              className="font-montserrat font-black uppercase tracking-widest text-sm text-zinc-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2"
            >
              ← Back to F3
            </Link>
          </div>
        </section>
      </main>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <main className="bg-black text-white min-h-screen">

      {/* ── Top accent bar ───────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />

      {/* ── Hero / Title ─────────────────────────────────────────────────── */}
      <section className="relative bg-black border-b border-zinc-900 pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-4">
            Foster Families Free
          </p>
          <h1 className="font-montserrat font-black text-5xl md:text-6xl uppercase tracking-tight mb-6 leading-none">
            APPLY NOW
          </h1>
          <p className="font-lora text-lg text-zinc-400 italic leading-relaxed max-w-xl mx-auto">
            Fill out the form below. We&apos;ll verify your foster family status and be in touch within 48 hours.
            No cost. No catch. Just community.
          </p>
        </div>
      </section>

      {/* ── Form Section ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} noValidate>

            {/* Hidden honeypot */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Server error */}
            {serverError && (
              <div className="mb-8 bg-red-950 border border-red-700 p-4">
                <p className="font-lora text-red-300 text-sm">{serverError}</p>
              </div>
            )}

            {/* ── Personal Info ──────────────────────────────────────────── */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-montserrat font-black text-red-600 text-2xl leading-none">01</span>
                <h2 className="font-montserrat font-black text-xl uppercase tracking-wide">Personal Information</h2>
              </div>

              {/* First / Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className={labelClass}>First Name *</label>
                  {field('firstName', form.firstName, (v) => setForm((f) => ({ ...f, firstName: v })), 'John')}
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>Last Name *</label>
                  {field('lastName', form.lastName, (v) => setForm((f) => ({ ...f, lastName: v })), 'Smith')}
                </div>
              </div>

              {/* Email / Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="email" className={labelClass}>Email Address *</label>
                  {field('email', form.email, (v) => setForm((f) => ({ ...f, email: v })), 'john@example.com', 'email')}
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number *</label>
                  {field('phone', form.phone, (v) => setForm((f) => ({ ...f, phone: v })), '(540) 555-0123', 'tel')}
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label htmlFor="address" className={labelClass}>Street Address *</label>
                {field('address', form.address, (v) => setForm((f) => ({ ...f, address: v })), '123 Main Street')}
              </div>

              {/* City / State / Zip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label htmlFor="city" className={labelClass}>City *</label>
                  {field('city', form.city, (v) => setForm((f) => ({ ...f, city: v })), 'Fredericksburg')}
                </div>
                <div>
                  <label htmlFor="state" className={labelClass}>State *</label>
                  <select
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className={`${inputClass}${errors.state ? ' border-red-500' : ''}`}
                  >
                    <option value="">—</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className={errorClass} data-error>{errors.state}</p>}
                </div>
                <div>
                  <label htmlFor="zip" className={labelClass}>ZIP *</label>
                  {field('zip', form.zip, (v) => setForm((f) => ({ ...f, zip: v })), '22401')}
                </div>
              </div>
            </div>

            {/* ── Fostering Details ──────────────────────────────────────── */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-montserrat font-black text-red-600 text-2xl leading-none">02</span>
                <h2 className="font-montserrat font-black text-xl uppercase tracking-wide">Fostering Details</h2>
              </div>

              {/* Number of foster children */}
              <div className="mb-4">
                <label htmlFor="numberOfFosterChildren" className={labelClass}>
                  Number of Foster Children Currently in Your Home *
                </label>
                <input
                  id="numberOfFosterChildren"
                  type="number"
                  min="0"
                  max="20"
                  value={form.numberOfFosterChildren}
                  onChange={(e) => setForm((f) => ({ ...f, numberOfFosterChildren: e.target.value }))}
                  placeholder="e.g. 2"
                  className={`${inputClass} max-w-xs${errors.numberOfFosterChildren ? ' border-red-500' : ''}`}
                />
                {errors.numberOfFosterChildren && (
                  <p className={errorClass} data-error>{errors.numberOfFosterChildren}</p>
                )}
              </div>

              {/* Fostering duration */}
              <div className="mb-4">
                <label htmlFor="fosteringDuration" className={labelClass}>
                  How Long Have You Been a Licensed Foster Family? *
                </label>
                <select
                  id="fosteringDuration"
                  value={form.fosteringDuration}
                  onChange={(e) => setForm((f) => ({ ...f, fosteringDuration: e.target.value }))}
                  className={`${inputClass} max-w-xs${errors.fosteringDuration ? ' border-red-500' : ''}`}
                >
                  <option value="">Select…</option>
                  {FOSTERING_DURATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.fosteringDuration && (
                  <p className={errorClass} data-error>{errors.fosteringDuration}</p>
                )}
              </div>

              {/* Agency name (optional) */}
              <div className="mb-4">
                <label htmlFor="agencyName" className={labelClass}>
                  Foster Agency Name <span className="text-zinc-600 normal-case font-normal tracking-normal">(optional)</span>
                </label>
                <input
                  id="agencyName"
                  type="text"
                  value={form.agencyName}
                  onChange={(e) => setForm((f) => ({ ...f, agencyName: e.target.value }))}
                  placeholder="e.g. Fredericksburg DSS"
                  className={`${inputClass} max-w-md`}
                />
              </div>
            </div>

            {/* ── Additional Info ────────────────────────────────────────── */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-montserrat font-black text-red-600 text-2xl leading-none">03</span>
                <h2 className="font-montserrat font-black text-xl uppercase tracking-wide">A Little More</h2>
              </div>

              {/* Heard about us (optional) */}
              <div className="mb-4">
                <label htmlFor="heardAboutUs" className={labelClass}>
                  How Did You Hear About Us? <span className="text-zinc-600 normal-case font-normal tracking-normal">(optional)</span>
                </label>
                <input
                  id="heardAboutUs"
                  type="text"
                  value={form.heardAboutUs}
                  onChange={(e) => setForm((f) => ({ ...f, heardAboutUs: e.target.value }))}
                  placeholder="e.g. Social media, a friend, DSS referral…"
                  className={inputClass}
                />
              </div>

              {/* Additional notes (optional) */}
              <div>
                <label htmlFor="additionalNotes" className={labelClass}>
                  Anything Else You&apos;d Like Us to Know? <span className="text-zinc-600 normal-case font-normal tracking-normal">(optional)</span>
                </label>
                <textarea
                  id="additionalNotes"
                  rows={4}
                  value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                  placeholder="Tell us anything that would help us serve your family well."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* ── Consent Checkbox ───────────────────────────────────────── */}
            <div className="mb-10 bg-zinc-900 border border-zinc-800 p-6">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border flex items-center justify-center transition-colors duration-200 ${
                      form.consent
                        ? 'bg-red-600 border-red-600'
                        : errors.consent
                        ? 'border-red-500 bg-transparent'
                        : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'
                    }`}
                  >
                    {form.consent && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-lora text-zinc-300 text-sm leading-relaxed">
                  I understand this membership is for licensed foster families and consent to verification of foster family status.
                </span>
              </label>
              {errors.consent && (
                <p className="mt-3 ml-9 text-red-500 text-sm font-lora" data-error>{errors.consent}</p>
              )}
            </div>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                type="submit"
                disabled={submitting}
                className="font-montserrat font-black uppercase tracking-widest text-sm bg-red-600 text-white px-10 py-4 inline-flex items-center gap-2 hover:bg-red-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>Submitting…</>
                ) : (
                  <>Submit Application <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
              <Link
                href="/f3"
                className="font-montserrat font-bold uppercase tracking-widest text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200 self-center"
              >
                ← Cancel
              </Link>
            </div>

            <p className="mt-6 font-lora text-zinc-600 text-sm leading-relaxed">
              By submitting this form you agree to be contacted by Honor Bound FIT staff regarding
              your F3 application. We will never sell your information.
            </p>

          </form>
        </div>
      </section>

    </main>
  )
}
