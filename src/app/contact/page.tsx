"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors";

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
              {[
                { label: "Phone", value: "(703) 965-4184", href: "tel:+170****4184" }
                { label: "Address", value: "45 Centreport Pkwy, Suite 137\nFredericksburg, VA 22406", href: "https://maps.app.goo.gl/QRKu8SXYB48qPbB67" },
                { label: "Email", value: "info@honorboundfit.com", href: "mailto:info@honorboundfit.com" },
              ].map(({ label, value, href }) => (
                <div key={label}>
                  <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
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

            {/* Map */}
            <div className="mt-10">
              <div className="w-full h-56 overflow-hidden border border-zinc-800">
                <iframe
                  title="Honor Bound FIT Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3126.9861233950764!2d-77.4396841!3d38.3955699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x45f4da13023f0f91%3A0x8449981dcd1cf623!2sHonor%20Bound%20FIT!5e0!3m2!1sen!2sus!4v1785068418609!5m2!1sen!2sus"
                  width="100%" height="100%"
                  style={{ border: 0, filter: "grayscale(100%) invert(90%) contrast(90%)" }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href="https://maps.app.goo.gl/QRKu8SXYB48qPbB67" target="_blank" rel="noopener noreferrer"
                className="inline-block mt-3 text-zinc-400 hover:text-white font-montserrat text-xs uppercase tracking-widest transition-colors">
                Open in Google Maps →
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-montserrat font-black text-2xl uppercase tracking-wide mb-8">Send a Message</h2>

            {status === "success" ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 text-center">
                <div className="text-3xl mb-3">✓</div>
                <p className="font-montserrat font-bold text-white text-lg mb-2">Message Received</p>
                <p className="font-lora text-zinc-400 text-sm">
                  Thanks for reaching out. One of our coaches will get back to you soon.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 font-montserrat text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                >
                  Send Another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Membership question, GAP inquiry…"
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    className={`${inputClass} resize-none`}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    maxLength={2000}
                    required
                  />
                  <p className="text-right font-lora text-xs text-zinc-600 mt-1">
                    {form.message.length}/2000
                  </p>
                </div>

                {status === "error" && (
                  <p className="font-lora text-sm text-red-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-white text-black font-montserrat font-bold text-sm uppercase tracking-widest py-4 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
