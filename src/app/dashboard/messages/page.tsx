"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, ChevronLeft, Plus, Clock } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ThreadSummary {
  id: string;
  subject: string;
  coachName: string | null;
  updatedAt: string;
  hasUnread: boolean;
  lastEntry: { body: string; senderType: "MEMBER" | "COACH"; sentAt: string } | null;
}

interface Entry {
  id: string;
  senderType: "MEMBER" | "COACH";
  senderName: string;
  body: string;
  sentAt: string;
}

interface Thread { id: string; subject: string; entries: Entry[]; }

interface Coach { id: string; firstName: string; lastName: string; title: string | null; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MemberMessagesPage() {
  const [threads, setThreads]           = useState<ThreadSummary[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [view, setView]                 = useState<"list" | "thread" | "new">("list");
  const [loading, setLoading]           = useState(true);
  const [replyBody, setReplyBody]       = useState("");
  const [sending, setSending]           = useState(false);
  const [newSubject, setNewSubject]     = useState("");
  const [newBody, setNewBody]           = useState("");
  const [coaches, setCoaches]           = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setThreads(data.threads ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
    fetch("/api/coaches").then(r => r.json()).then(d => setCoaches(Array.isArray(d) ? d : [])).catch(() => {});
  }, [loadThreads]);

  const openThread = async (threadId: string) => {
    const res = await fetch(`/api/messages/${threadId}`);
    const data = await res.json();
    setActiveThread(data);
    setView("thread");
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, hasUnread: false } : t));
  };

  const sendReply = async () => {
    if (!replyBody.trim() || !activeThread) return;
    setSending(true);
    try {
      await fetch(`/api/messages/${activeThread.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      const res = await fetch(`/api/messages/${activeThread.id}`);
      setActiveThread(await res.json());
      setReplyBody("");
      loadThreads();
    } finally {
      setSending(false);
    }
  };

  const startNewThread = async () => {
    if (!newSubject.trim() || !newBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          body: newBody,
          coachId: selectedCoachId || null,
        }),
      });
      const data = await res.json();
      setNewSubject(""); setNewBody(""); setSelectedCoachId("");
      await loadThreads();
      await openThread(data.threadId);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = threads.filter(t => t.hasUnread).length;

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  if (view === "list") return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare size={26} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center font-montserrat">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-montserrat font-bold text-2xl text-white">Messages</h2>
            <p className="font-lora text-zinc-400 text-sm">Chat directly with your coaches</p>
          </div>
        </div>
        <button
          onClick={() => setView("new")}
          className="flex items-center gap-2 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-zinc-200 transition-colors"
        >
          <Plus size={14} /> New Message
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500 font-lora">Loading…</div>
      ) : threads.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <MessageSquare size={36} className="text-zinc-700 mx-auto mb-4" />
          <p className="font-montserrat font-bold text-white mb-2">No messages yet</p>
          <p className="font-lora text-zinc-500 text-sm mb-6">Have a question for a coach? Start a conversation.</p>
          <button onClick={() => setView("new")}
            className="bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-zinc-200 transition-colors">
            Start a Conversation →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              className={`w-full text-left bg-zinc-900 border rounded-xl p-5 hover:border-zinc-600 transition-all ${
                t.hasUnread ? "border-red-500/40" : "border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-montserrat font-bold text-sm text-white truncate">{t.subject}</span>
                    {t.hasUnread && (
                      <span className="shrink-0 bg-red-500/20 text-red-400 text-xs font-montserrat font-bold px-2 py-0.5 rounded-full">New reply</span>
                    )}
                  </div>
                  {t.coachName && (
                    <p className="font-montserrat text-xs text-blue-400/70 mb-0.5">Coach {t.coachName}</p>
                  )}
                  {t.lastEntry && (
                    <p className="font-lora text-xs text-zinc-500 truncate">
                      {t.lastEntry.senderType === "COACH" ? "Coach: " : "You: "}{t.lastEntry.body}
                    </p>
                  )}
                </div>
                <span className="shrink-0 flex items-center gap-1 font-lora text-xs text-zinc-600">
                  <Clock size={11} />{timeAgo(t.updatedAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── NEW THREAD VIEW ─────────────────────────────────────────────────────────
  if (view === "new") return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => setView("list")} className="flex items-center gap-2 font-montserrat text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
        <ChevronLeft size={14} /> Back
      </button>
      <div>
        <h2 className="font-montserrat font-bold text-2xl text-white mb-1">New Message</h2>
        <p className="font-lora text-zinc-400 text-sm">Your coach will see this and respond in this thread.</p>
      </div>

      <div className="space-y-4">
        {/* Coach selector */}
        <div>
          <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Send To</label>
          <select
            className="w-full bg-zinc-900 border border-zinc-700 text-white font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors"
            value={selectedCoachId}
            onChange={e => setSelectedCoachId(e.target.value)}
          >
            <option value="">Any available coach</option>
            {coaches.map(c => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}{c.title ? ` — ${c.title}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Subject</label>
          <input
            type="text"
            placeholder="What's on your mind?"
            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Message</label>
          <textarea
            rows={6}
            placeholder="Write your message here…"
            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors resize-none"
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
          />
        </div>
        <button
          onClick={startNewThread}
          disabled={sending || !newSubject.trim() || !newBody.trim()}
          className="flex items-center gap-2 bg-white text-black font-montserrat font-bold text-sm uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-40"
        >
          <Send size={14} /> {sending ? "Sending…" : "Send Message"}
        </button>
      </div>
    </div>
  );

  // ── THREAD VIEW ─────────────────────────────────────────────────────────────
  if (view === "thread" && activeThread) return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => setView("list")} className="flex items-center gap-2 font-montserrat text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
        <ChevronLeft size={14} /> Back to Messages
      </button>
      <h2 className="font-montserrat font-bold text-xl text-white">{activeThread.subject}</h2>

      <div className="space-y-4">
        {activeThread.entries.map(e => {
          const isMe = e.senderType === "MEMBER";
          return (
            <div key={e.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-5 py-4 ${
                isMe ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800 text-white"
              }`}>
                {!isMe && (
                  <p className="font-montserrat text-xs font-bold uppercase tracking-wide text-red-400 mb-2">{e.senderName}</p>
                )}
                <p className="font-lora text-sm leading-relaxed">{e.body}</p>
                <p className={`font-lora text-xs mt-2 ${isMe ? "text-zinc-500" : "text-zinc-600"}`}>{timeAgo(e.sentAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <textarea
          rows={4}
          placeholder="Write a reply…"
          className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors resize-none"
          value={replyBody}
          onChange={e => setReplyBody(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={sendReply}
            disabled={sending || !replyBody.trim()}
            className="flex items-center gap-2 bg-white text-black font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-zinc-200 transition-colors disabled:opacity-40"
          >
            <Send size={13} /> {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );

  return null;
}
