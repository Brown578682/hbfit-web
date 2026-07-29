'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

interface Props {
  url: string
  title: string
  excerpt: string
}

export function ShareButtons({ url, title, excerpt }: Props) {
  const [copied, setCopied] = useState(false)

  const encoded = {
    url: encodeURIComponent(url),
    text: encodeURIComponent(`${title} — ${excerpt}`),
  }

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`
  const xUrl  = `https://twitter.com/intent/tweet?url=${encoded.url}&text=${encoded.text}&via=honorboundfit`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select a temp input
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3 pt-10 mt-10 border-t border-zinc-800">
      <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-600 mr-1">
        Share
      </span>

      {/* Facebook */}
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="flex items-center justify-center w-8 h-8 border border-zinc-700 text-zinc-500 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </a>

      {/* X / Twitter */}
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex items-center justify-center w-8 h-8 border border-zinc-700 text-zinc-500 hover:border-white hover:text-white transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="flex items-center gap-1.5 px-3 h-8 border border-zinc-700 text-zinc-500 hover:border-zinc-400 hover:text-zinc-300 transition-colors font-montserrat text-xs uppercase tracking-widest"
      >
        {copied
          ? <><Check size={12} className="text-green-400" /><span className="text-green-400">Copied</span></>
          : <><Link2 size={12} /><span>Copy Link</span></>
        }
      </button>
    </div>
  )
}
