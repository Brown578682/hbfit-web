"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Check,
  ShoppingCart,
  Loader2,
  X,
  LogOut,
  MessageSquare,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HBFITWordmark } from "@/components/HBFITMark";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "code"
  | "pin"
  | "home"
  | "shop"
  | "personalize"
  | "confirm"
  | "done"
  | "checkin-done"
  | "no-card"
  | "message";

interface MemberSession {
  id: string;
  firstName: string;
  lastName: string;
  memberCode: string;
  householdId: string | null;
  status: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string; // personalization text (Tumbler only)
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNTDOWN_SECONDS = 30;
const TUMBLER_NAME = "Coffee-4-Life Tumbler";
const PERSONALIZATION_NAME = "Personalization";

// ─── Numpad ───────────────────────────────────────────────────────────────────
function Numpad({
  value,
  onChange,
  maxLen,
  masked,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLen: number;
  masked?: boolean;
}) {
  const press = (ch: string) => {
    if (ch === "⌫") { onChange(value.slice(0, -1)); return; }
    if (value.length >= maxLen) return;
    onChange(value + ch);
  };

  const dots = Array.from({ length: maxLen }, (_, i) =>
    i < value.length ? (masked ? "●" : value[i]) : "○"
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 text-4xl font-mono tracking-widest text-white min-h-[3rem]">
        {dots.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-3 gap-3 w-64">
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              className={cn(
                "h-16 text-2xl font-bold rounded-lg transition-all active:scale-95",
                k === "⌫"
                  ? "bg-zinc-700 text-white/60 hover:bg-zinc-600"
                  : "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10"
              )}
            >
              {k}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Countdown Timer Hook ─────────────────────────────────────────────────────
function useCountdown(active: boolean, onExpire: () => void): [number, () => void] {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const reset = useCallback(() => setCountdown(COUNTDOWN_SECONDS), []);

  useEffect(() => {
    if (!active) { setCountdown(COUNTDOWN_SECONDS); return; }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return [countdown, reset];
}

// ─── Main Kiosk Page ──────────────────────────────────────────────────────────
export default function KioskPage() {
  const [screen, setScreen] = useState<Screen>("code");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [member, setMember] = useState<MemberSession | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Personalization state
  const [pendingTumbler, setPendingTumbler] = useState<Product | null>(null);
  const [personalizationText, setPersonalizationText] = useState("");

  // Message a Coach state
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const reset = useCallback(() => {
    setScreen("code");
    setCode("");
    setPin("");
    setMember(null);
    setCart([]);
    setError("");
    setLoading(false);
    setMessageText("");
    setMessageSent(false);
    setPendingTumbler(null);
    setPersonalizationText("");
  }, []);

  const countdownActive = screen === "home" || screen === "message";
  const [countdown, resetCountdown] = useCountdown(countdownActive, reset);

  const handleInteraction = useCallback(() => {
    if (countdownActive) resetCountdown();
  }, [countdownActive, resetCountdown]);

  useEffect(() => {
    // PIN auto-advances at exactly 4 digits; member code uses a confirm button
  }, [code]);

  const handleCodeConfirm = useCallback(() => {
    if (code.length >= 4) { setScreen("pin"); setError(""); }
  }, [code]);

  useEffect(() => {
    if (pin.length === 4) handlePinSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handlePinSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kiosk/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberCode: code, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no_pin") {
          setError(`Hi ${data.firstName}! You haven't set up a kiosk PIN yet. Log in to your member portal at honorboundfit.com and go to Settings → PIN to create one.`);
        } else {
          setError(data.error ?? "Invalid code or PIN");
        }
        setPin("");
        setLoading(false);
        return;
      }
      setMember(data.member);
      setScreen("home");
      fetch("/api/kiosk/products").then((r) => r.json()).then(setProducts);
    } catch {
      setError("Connection error. Try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!member) return;
    setLoading(true);
    try {
      await fetch("/api/kiosk/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
      setScreen("checkin-done");
      setTimeout(reset, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!member || !messageText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/kiosk/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, message: messageText }),
      });
      if (res.ok) {
        setMessageSent(true);
        setTimeout(() => {
          setMessageSent(false);
          setMessageText("");
          setScreen("home");
          resetCountdown();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Cart helpers ─────────────────────────────────────────────────────────────

  // Look up the Personalization add-on product
  const personalizationProduct = products.find((p) => p.name === PERSONALIZATION_NAME);

  const addToCart = (product: Product) => {
    // If it's the Tumbler, prompt for personalization first
    if (product.name === TUMBLER_NAME) {
      setPendingTumbler(product);
      setPersonalizationText("");
      setScreen("personalize");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const confirmPersonalization = (wantsPersonalization: boolean, text: string) => {
    if (!pendingTumbler) return;
    setCart((prev) => {
      const updated = [...prev, { product: pendingTumbler, quantity: 1, notes: wantsPersonalization ? text : undefined }];
      // Auto-add Personalization product if opted in
      if (wantsPersonalization && personalizationProduct) {
        const existing = updated.find((c) => c.product.id === personalizationProduct.id);
        if (existing) {
          return updated.map((c) => c.product.id === personalizationProduct.id ? { ...c, quantity: c.quantity + 1 } : c);
        }
        return [...updated, { product: personalizationProduct, quantity: 1 }];
      }
      return updated;
    });
    setPendingTumbler(null);
    setPersonalizationText("");
    setScreen("shop");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.priceCents * c.quantity, 0);

  const handlePurchase = async () => {
    if (!member || !cart.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/kiosk/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            notes: c.notes,
          })),
        }),
      });
      const data = await res.json();
      if (data.noCard) {
        setScreen("no-card");
        return;
      }
      if (res.ok && data.ok) {
        setScreen("done");
        setTimeout(reset, 5000);
      } else {
        setError(data.error ?? "Purchase failed. Please see a coach.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Screens ────────────────────────────────────────────────────────────────

  if (screen === "code")
    return (
      <KioskShell>
        <h1 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest mb-2">
          Enter Member Code
        </h1>
        <p className="text-white/40 text-sm mb-8">Your member ID number</p>
        <Numpad value={code} onChange={setCode} maxLen={7} />
        <button
          type="button"
          onClick={handleCodeConfirm}
          disabled={code.length < 4}
          className="mt-6 w-64 bg-white text-black py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </KioskShell>
    );

  if (screen === "pin")
    return (
      <KioskShell>
        <h1 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest mb-2">
          Enter PIN
        </h1>
        <p className="text-white/40 text-sm mb-8">Your 4-digit PIN</p>
        {loading ? (
          <Loader2 className="animate-spin text-white/40" size={40} />
        ) : (
          <Numpad value={pin} onChange={setPin} maxLen={4} masked />
        )}
        {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
        <button
          type="button"
          onClick={() => { setScreen("code"); setCode(""); setPin(""); setError(""); }}
          className="mt-8 text-white/30 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
      </KioskShell>
    );

  if (screen === "home" && member)
    return (
      <div
        className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12"
        onPointerMove={handleInteraction}
        onPointerDown={handleInteraction}
      >
        <div className="mb-8 text-center">
          <HBFITWordmark className="font-montserrat font-extrabold text-xl uppercase tracking-[0.3em]" />
        </div>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <h1 className="text-3xl font-bold font-montserrat text-white">
            Welcome, {member.firstName}!
          </h1>
          <p className="text-white/40 text-sm mt-1">Member #{member.memberCode}</p>
        </div>

        {member.status === "LEAD" && (
          <div className="w-full max-w-md bg-amber-950/60 border border-amber-500 rounded-xl px-5 py-4 mb-6 text-center">
            <p className="font-montserrat font-bold text-amber-400 uppercase tracking-wider text-sm mb-1">
              ⚠ Trial Expired
            </p>
            <p className="text-white/60 text-sm">
              Please select a membership plan to continue. See the front desk or visit{" "}
              <span className="text-white font-semibold">honorboundfit.com/join</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <HomeTile icon={<Check size={28} />} label="Check In" onClick={handleCheckIn} disabled={loading} loading={loading} accent="green" onInteract={handleInteraction} />
          <HomeTile icon={<ShoppingCart size={28} />} label="Shop" onClick={() => { resetCountdown(); setScreen("shop"); }} onInteract={handleInteraction} />
          <HomeTile icon={<MessageSquare size={28} />} label="Message a Coach" onClick={() => { resetCountdown(); setScreen("message"); }} onInteract={handleInteraction} />
          <HomeTile icon={<LogOut size={28} />} label="Log Out" onClick={reset} accent="red" onInteract={handleInteraction} />
        </div>

        <p className="mt-8 text-white/25 text-xs tracking-wider">
          Auto-logout in{" "}
          <span className={cn("font-bold tabular-nums", countdown <= 10 ? "text-red-400/60" : "text-white/40")}>
            {countdown}s
          </span>
        </p>
      </div>
    );

  // ── Message a Coach ──────────────────────────────────────────────────────────
  if (screen === "message" && member)
    return (
      <div
        className="min-h-screen bg-black flex flex-col"
        onPointerMove={handleInteraction}
        onPointerDown={handleInteraction}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button type="button" onClick={() => { resetCountdown(); setScreen("home"); }} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="font-montserrat font-bold text-white uppercase tracking-widest text-sm">Message a Coach</span>
          <button type="button" onClick={reset} className="text-white/30 hover:text-white transition-colors"><LogOut size={18} /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-6">
          {messageSent ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-900/40 border border-green-500/40 flex items-center justify-center">
                <Check size={36} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest">Message Sent!</h2>
              <p className="text-white/40 text-sm">Returning to home…</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest mb-2">Message a Coach</h2>
                <p className="text-white/40 text-sm">Your message will be sent to staff.</p>
              </div>
              <textarea
                className={cn("w-full max-w-lg min-h-[180px] bg-zinc-900 border border-white/10 rounded-lg", "text-white placeholder-white/20 p-4 text-base resize-none", "focus:outline-none focus:border-white/30 transition-colors")}
                placeholder="Type your message here…"
                value={messageText}
                onChange={(e) => { setMessageText(e.target.value); resetCountdown(); }}
                maxLength={2000}
                autoFocus
              />
              <div className="flex w-full max-w-lg gap-3">
                <button type="button" onClick={() => { resetCountdown(); setScreen("home"); }} className="flex-1 border border-white/20 text-white py-4 font-bold text-sm uppercase tracking-widest hover:border-white/40 transition-all">Cancel</button>
                <button type="button" onClick={handleSendMessage} disabled={loading || !messageText.trim()} className={cn("flex-1 py-4 font-bold text-sm uppercase tracking-widest transition-all", "bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed")}>
                  {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="pb-6 text-center">
          <p className="text-white/20 text-xs tracking-wider">
            Auto-logout in{" "}
            <span className={cn("font-bold tabular-nums", countdown <= 10 ? "text-red-400/50" : "text-white/30")}>
              {countdown}s
            </span>
          </p>
        </div>
      </div>
    );

  // ── Check-In Confirmation ────────────────────────────────────────────────────
  if (screen === "checkin-done")
    return (
      <KioskShell>
        <div className="flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-green-900/40 border-2 border-green-500/60 flex items-center justify-center">
            <Check size={44} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold font-montserrat text-white uppercase tracking-widest text-center">Checked In!</h1>
          <p className="text-white/60 text-lg text-center">See you out there.</p>
          <p className="text-white/20 text-xs mt-4 tracking-wider">Logging out…</p>
        </div>
      </KioskShell>
    );

  // ── Tumbler Personalization ──────────────────────────────────────────────────
  if (screen === "personalize" && pendingTumbler)
    return (
      <KioskShell>
        <h1 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest mb-2 text-center">
          Personalization
        </h1>
        <p className="text-white/40 text-sm mb-6 text-center">
          Add custom engraving to your Tumbler for <span className="text-white font-semibold">+$5</span>?
        </p>
        <textarea
          className={cn(
            "w-full max-w-sm min-h-[100px] bg-zinc-900 border border-white/10 rounded-lg",
            "text-white placeholder-white/20 p-4 text-base resize-none",
            "focus:outline-none focus:border-white/30 transition-colors mb-6"
          )}
          placeholder="Enter engraving text (name, motto, etc.)"
          value={personalizationText}
          onChange={(e) => setPersonalizationText(e.target.value)}
          maxLength={80}
          autoFocus
        />
        <div className="flex flex-col w-full max-w-sm gap-3">
          <button
            type="button"
            disabled={!personalizationText.trim()}
            onClick={() => confirmPersonalization(true, personalizationText.trim())}
            className="w-full bg-white text-black py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Yes, Add Personalization (+$5)
          </button>
          <button
            type="button"
            onClick={() => confirmPersonalization(false, "")}
            className="w-full border border-white/20 text-white py-4 font-bold text-sm uppercase tracking-widest hover:border-white/40 transition-all"
          >
            No Thanks
          </button>
          <button
            type="button"
            onClick={() => { setPendingTumbler(null); setScreen("shop"); }}
            className="text-white/30 hover:text-white text-sm transition-colors text-center mt-1"
          >
            ← Back to Shop
          </button>
        </div>
      </KioskShell>
    );

  // ── Shop ─────────────────────────────────────────────────────────────────────
  if (screen === "shop" && member)
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button type="button" onClick={() => setScreen("home")} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-white font-bold font-montserrat uppercase tracking-widest text-sm">Shop</span>
          <button type="button" onClick={reset} className="text-white/30 hover:text-white transition-colors"><LogOut size={18} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Products grid — hide Personalization (it's auto-added) */}
          <div className="flex-1 p-6 overflow-y-auto">
            {products.filter((p) => p.name !== PERSONALIZATION_NAME).length === 0 ? (
              <p className="text-white/30 text-center mt-12">No items available</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {products
                  .filter((p) => p.name !== PERSONALIZATION_NAME)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="border border-white/10 hover:border-white/40 p-4 text-left transition-all active:scale-95"
                    >
                      {p.imageUrl && (
                        <div className="relative w-full h-24 mb-3 bg-zinc-900">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-contain" />
                        </div>
                      )}
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      {p.description && <div className="text-white/40 text-xs mt-0.5">{p.description}</div>}
                      <div className="text-white font-bold mt-2">${(p.priceCents / 100).toFixed(2)}</div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="w-64 border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <ShoppingCart size={16} className="text-white/60" />
              <span className="text-white font-bold text-sm uppercase tracking-wider">Cart</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-white/30 text-xs text-center mt-4">Empty</p>
              ) : (
                cart.map((c, idx) => (
                  <div key={`${c.product.id}-${idx}`} className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-white text-xs font-medium">{c.product.name}</div>
                      {c.notes && <div className="text-white/30 text-xs italic mt-0.5">"{c.notes}"</div>}
                      <div className="text-white/40 text-xs">
                        ×{c.quantity} — ${(c.product.priceCents * c.quantity / 100).toFixed(2)}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFromCart(c.product.id)} className="text-white/20 hover:text-red-400 transition-colors mt-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-white/60">Total</span>
                  <span className="text-white font-bold">${(cartTotal / 100).toFixed(2)}</span>
                </div>
                <button type="button" onClick={() => setScreen("confirm")} className="w-full bg-white text-black py-3 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all">
                  Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );

  // ── Confirm Purchase ─────────────────────────────────────────────────────────
  if (screen === "confirm" && member)
    return (
      <KioskShell>
        <h1 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest mb-6">
          Confirm Purchase
        </h1>
        <div className="w-full max-w-sm border border-white/10 p-4 mb-6 space-y-2">
          {cart.map((c, idx) => (
            <div key={`${c.product.id}-${idx}`} className="flex justify-between text-sm">
              <span className="text-white/70">
                {c.product.name} ×{c.quantity}
                {c.notes && <span className="block text-white/30 text-xs italic">"{c.notes}"</span>}
              </span>
              <span className="text-white">${(c.product.priceCents * c.quantity / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-white">${(cartTotal / 100).toFixed(2)}</span>
          </div>
          <p className="text-white/30 text-xs pt-1">
            Charged to your card on file. A receipt will be emailed to you.
          </p>
        </div>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <div className="flex gap-3 w-full max-w-sm">
          <button type="button" onClick={() => setScreen("shop")} className="flex-1 border border-white/20 text-white py-4 font-bold text-sm uppercase tracking-widest hover:border-white/40 transition-all">
            Back
          </button>
          <button type="button" onClick={handlePurchase} disabled={loading} className="flex-1 bg-white text-black py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Confirm"}
          </button>
        </div>
      </KioskShell>
    );

  // ── No Card on File ──────────────────────────────────────────────────────────
  if (screen === "no-card")
    return (
      <KioskShell>
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-24 h-24 rounded-full bg-amber-900/40 border-2 border-amber-500/40 flex items-center justify-center">
            <UserCheck size={44} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest">
            See a Coach
          </h1>
          <p className="text-white/60 text-base max-w-xs">
            No card on file or payment couldn't be processed. A coach will help you complete your purchase.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 border border-white/20 text-white px-8 py-3 font-bold text-sm uppercase tracking-widest hover:border-white/40 transition-all"
          >
            Done
          </button>
        </div>
      </KioskShell>
    );

  // ── Purchase Done ────────────────────────────────────────────────────────────
  if (screen === "done")
    return (
      <KioskShell>
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-green-900/40 border border-green-500/40 flex items-center justify-center">
            <Check size={36} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold font-montserrat text-white uppercase tracking-widest">All Set!</h1>
          <p className="text-white/40 text-sm">Your card has been charged. Check your email for a receipt.</p>
          <p className="text-white/20 text-xs mt-4">Returning to start…</p>
        </div>
      </KioskShell>
    );

  return null;
}

// ─── KioskShell ───────────────────────────────────────────────────────────────
function KioskShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <HBFITWordmark className="font-montserrat font-extrabold text-xl uppercase tracking-[0.3em]" />
      </div>
      <div className="flex flex-col items-center w-full max-w-sm">{children}</div>
    </div>
  );
}

// ─── HomeTile ─────────────────────────────────────────────────────────────────
function HomeTile({
  icon, label, onClick, disabled, loading, accent, onInteract,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  accent?: "green" | "red";
  onInteract?: () => void;
}) {
  const accentClasses =
    accent === "green"
      ? "border-green-500/20 hover:border-green-400/50 text-green-400"
      : accent === "red"
      ? "border-red-500/20 hover:border-red-400/50 text-red-400/80 hover:text-red-400"
      : "border-white/10 hover:border-white/40 text-white";

  return (
    <button
      type="button"
      onClick={() => { onInteract?.(); onClick(); }}
      onPointerEnter={onInteract}
      disabled={disabled}
      className={cn(
        "min-h-24 flex flex-col items-center justify-center gap-3 p-6",
        "border rounded-xl transition-all active:scale-95",
        "font-montserrat font-bold text-sm uppercase tracking-widest",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        accentClasses
      )}
    >
      {loading ? <Loader2 size={28} className="animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}
