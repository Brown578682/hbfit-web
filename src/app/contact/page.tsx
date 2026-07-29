import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact | Honor Bound FIT',
  description:
    'Contact Honor Bound FIT in Fredericksburg, VA. Call (540) 737-8337 or visit us at 45 Centreport Pkwy, Suite 137. Veteran-owned gym with 4-week billing cycle memberships.',
  alternates: { canonical: 'https://honorboundfit.com/contact' },
  openGraph: {
    title: 'Contact Honor Bound FIT | Fredericksburg, VA',
    description: 'Get in touch with our team. (540) 737-8337 · 45 Centreport Pkwy Suite 137, Fredericksburg VA',
  },
}

const INFO = [
  { label: 'Phone', value: '(540) 737-8337', href: 'tel:+15407378337' },
  { label: 'Address', value: '45 Centreport Pkwy, Suite 137\nFredericksburg, VA 22406', href: 'https://maps.app.goo.gl/QRKu8SXYB48qPbB67' },
  { label: 'Email', value: 'info@honorboundfit.com', href: 'mailto:info@honorboundfit.com' },
]

export default function ContactPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="py-24 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">Get In Touch</p>
        <h1 className="font-montserrat font-black text-5xl md:text-6xl uppercase tracking-tight mb-4">Contact Us</h1>
        <p className="font-lora text-xl text-zinc-400 italic max-w-xl mx-auto">
          Questions about membership, the Guardian Angel Program, or just want to stop by — we&apos;re here.
        </p>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-montserrat font-black text-2xl uppercase tracking-wide mb-8">Find Us</h2>
            <div className="space-y-6">
              {INFO.map(({ label, value, href }) => (
                <div key={label}>
                  <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-lora text-zinc-200 text-base whitespace-pre-line hover:text-white transition-colors"
                  >
                    {value}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-3">Follow Us</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/61559090918724/" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors font-montserrat text-sm uppercase tracking-wider">
                  Facebook
                </a>
                <span className="text-zinc-700">·</span>
                <a href="https://instagram.com/honorboundfit" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors font-montserrat text-sm uppercase tracking-wider">
                  Instagram
                </a>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-800">
              <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-4">Ready to Join?</p>
              <Link
                href="/join"
                className="inline-block bg-white text-black font-montserrat font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-zinc-200 transition-colors"
              >
                Start Your Mission →
              </Link>
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="font-montserrat font-black text-2xl uppercase tracking-wide mb-8">Location</h2>
            <div className="w-full h-72 rounded-lg overflow-hidden border border-zinc-800">
              <iframe
                title="Honor Bound FIT Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3126.9861233950764!2d-77.4396841!3d38.3955699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x45f4da13023f0f91%3A0x8449981dcd1cf623!2sHonor%20Bound%20FIT!5e0!3m2!1sen!2sus!4v1785068418609!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(90%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/QRKu8SXYB48qPbB67"
              target="_blank" rel="noopener noreferrer"
              className="inline-block mt-4 text-zinc-400 hover:text-white font-montserrat text-xs uppercase tracking-widest transition-colors"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
