"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Hero Tree is only shown in the nav during December (11) and January (0)
const month = new Date().getMonth();
const isHeroTreeSeason = month === 11 || month === 0;

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/schedule", label: "Schedule" },
  { href: "/membership", label: "Membership" },
  { href: "/events", label: "Events" },
  { href: "/core-values", label: "Core Values" },
  ...(isHeroTreeSeason ? [{ href: "/hero-tree", label: "Hero Tree" }] : []),
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
  { href: "https://guidonfoundation.com", label: "The Guidon Foundation", external: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Honor Bound FIT"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors font-medium"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-white transition-colors font-medium"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <User size={16} />
              <span>Member Login</span>
            </Link>
            <Link
              href="/join"
              className="hidden sm:block bg-white text-black text-sm font-bold px-4 py-2 hover:bg-white/90 transition-colors"
            >
              JOIN NOW
            </Link>
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-white"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden bg-black border-t border-white/10">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white text-base font-medium"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white text-base font-medium"
                >
                  {link.label}
                </Link>
              )
            )}
            <hr className="border-white/10" />
            <Link href="/login" onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-base font-medium">
              Member Login
            </Link>
            <Link
              href="/join"
              onClick={() => setOpen(false)}
              className="bg-white text-black text-base font-bold px-4 py-3 text-center"
            >
              JOIN NOW
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
