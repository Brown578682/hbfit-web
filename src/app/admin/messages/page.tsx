"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Users, Mail, CheckCheck, Clock, ChevronLeft, Send } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContactMsg {
  id: string; name: string; email: string; subject: string | null;
  message: string; sentAt: string; readAt: string | null; repliedAt: string | null;
}

interface ThreadSummary {
  id: string; subject: string; memberName: string; updatedAt: string; hasUnread: boolean;
  lastEntry: { body: string; senderType: "MEMBER" | "COACH"; sentAt: string } | null;
}

interface Entry {
  id: string; senderType: "MEMBER" | "COACH"; senderName: string; body: string; sentAt: string;
}

interface Thread { id: string; subject: string; memberName: string; entries: Entry[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminMessagesPage() {
  const [tab, setTab] = useState<"threads" | "contact">("threads");

  // ── Contact state
  const [contacts, setContacts]           = useState<ContactMsg[]>([]);
  const [contactUnread, setContactUnread] = useState(0);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [replyingContact, setReplyingContact] = useState<string | null>(null);
  const [contactReplyBody, setContactReplyBody] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  // ── Thread state
  const [threads, setThreads]             = useState<ThreadSummary[]>([]);
  const [threadUnread, setThreadUnread]   = useState(0);
  const [activeThread, setActiveThread]   = useState<Thread | null>(null);
  const [replyBody, setReplyBody]         = useState("");
  const [replying, setReplying]           = useState(false);

  const loadContacts = useCallback(async () => {
    const res = await fetch("/api/admin/messages/contact");
    const data = await res.json();
    setContacts(data.messages ?? []);
    setContactUnread(data.unreadCount ?? 0);
  }, []);

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/admin/threads");
    const data = await res.json();
    setThreads(data.threads ?? []);
    setThreadUnread(data.unreadCount ?? 0);
  }, []);

  useEffect(() => { loadContacts(); loadThreads(); }, [loadContacts, loadThreads]);

  const markContactRead = async (id: string) => {
    await fetch(`/api/admin/messages/contact/${id}/read`, { method: "POST" });
    setContacts((prev) => prev.map((m) => m.id === id ? { ...m, readAt: new Date().toISOString() } : m));
    setContactUnread((p) => Math.max(0, p - 1));
  };

  const sendContactReply = async (id: string) => {
    const body = contactReplyBody[id]?.trim();
    if (!body) return;
    setSendingReply(id);
    try {
      const res = await fetch(`/api/admin/messages/contact/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, fromName: "Honor Bound FIT" }),
      });
      if (res.ok) {
        setContacts(prev => prev.map(m => m.id === id ? { ...m, repliedAt: new Date().toISOString(), readAt: m.readAt ?? new Date().toISOString() } : m));
        setContactReplyBody(prev => ({ ...prev, [id]: "" }));
        setReplyingContact(null);
      }
    } finally {
      setSendingReply(null);
    }
  };

  const openThread = async (threadId: string) => {
    const res = await fetch(`/api/admin/threads/${threadId}`);
    const data = await res.json();
    setActiveThread(data);
    setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, hasUnread: false } : t));
    setThreadUnread((p) => Math.max(0, p - 1));
  };

  const sendReply = async () => {
    if (!replyBody.trim() || !activeThread) return;
    setReplying(true);
    try {
      await fetch(`/api/admin/threads/${activeThread.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, coachName: "Coach" }),
      });
      const res = await fetch(`/api/admin/threads/${activeThread.id}`);
      setActiveThread(await res.json());
      setReplyBody("");
      loadThreads();
    } finally {
      setReplying(false);
    }
  };

  const totalUnread = contactUnread + threadUnread;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <MessageSquare className="text-blue-400" size={28} />
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-montserrat font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">Messages</h1>
          <p className="font-lora text-zinc-400 text-sm mt-0.5">Member conversations + contact form submissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {[
          { key: "threads", label: "Member Messages", icon: Users, badge: threadUnread },
          { key: "contact", label: "Contact Form",    icon: Mail,  badge: contactUnread },
        ].map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => { setTab(key as "threads" | "contact"); setActiveThread(null); }}
            className={`flex items-center gap-2 px-5 py-3 font-montserrat text-sm font-semibold border-b-2 transition-colors ${
              tab === key ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={15} />
            {label}
            {badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── MEMBER THREADS TAB ──────────────────────────────────────────────── */}
      {tab === "threads" && !activeThread && (
        <div className="space-y-3">
          {threads.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center">
              <Users className="text-zinc-700 mx-auto mb-4" size={36} />
              <p className="font-montserrat font-bold text-white">No member messages yet</p>
            </div>
          ) : threads.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              className={`w-full text-left bg-zinc-900 border rounded-xl p-5 hover:border-zinc-600 transition-all ${
                t.hasUnread ? "border-blue-500/40" : "border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-montserrat font-bold text-sm text-white">{t.memberName}</span>
                    {t.hasUnread && (
                      <span className="bg-blue-500/20 text-blue-400 text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                  <p className="font-montserrat text-xs text-zinc-500 mb-1">{t.subject}</p>
                  {t.lastEntry && (
                    <p className="font-lora text-xs text-zinc-600 truncate">
                      {t.lastEntry.senderType === "COACH" ? "You: " : `${t.memberName}: `}{t.lastEntry.body}
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

      {/* ── THREAD DETAIL ────────────────────────────────────────────────────── */}
      {tab === "threads" && activeThread && (
        <div className="space-y-6 max-w-2xl">
          <button
            onClick={() => setActiveThread(null)}
            className="flex items-center gap-2 font-montserrat text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Back to Threads
          </button>
          <div>
            <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-1">Thread with</p>
            <h2 className="font-montserrat font-bold text-xl text-white">{activeThread.memberName}</h2>
            <p className="font-lora text-zinc-400 text-sm">{activeThread.subject}</p>
          </div>

          <div className="space-y-4">
            {activeThread.entries.map((e) => {
              const isCoach = e.senderType === "COACH";
              return (
                <div key={e.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-5 py-4 ${
                    isCoach ? "bg-blue-600 text-white" : "bg-zinc-900 border border-zinc-800 text-white"
                  }`}>
                    {!isCoach && (
                      <p className="font-montserrat text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2">{e.senderName}</p>
                    )}
                    <p className="font-lora text-sm leading-relaxed">{e.body}</p>
                    <p className={`font-lora text-xs mt-2 ${isCoach ? "text-blue-200" : "text-zinc-600"}`}>{timeAgo(e.sentAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <textarea
              rows={4}
              placeholder="Write a reply to the member…"
              className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors resize-none"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={sendReply}
                disabled={replying || !replyBody.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-3 transition-colors disabled:opacity-40"
              >
                <Send size={13} />{replying ? "Sending…" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTACT FORM TAB ─────────────────────────────────────────────────── */}
      {tab === "contact" && (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center">
              <Mail className="text-zinc-700 mx-auto mb-4" size={36} />
              <p className="font-montserrat font-bold text-white">No contact submissions yet</p>
              <p className="font-lora text-zinc-500 mt-2 text-sm">Messages from the Contact page will appear here.</p>
            </div>
          ) : (
            <>
              {contactUnread > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      const unread = contacts.filter((m) => !m.readAt);
                      for (const m of unread) await fetch(`/api/admin/messages/contact/${m.id}/read`, { method: "POST" });
                      setContacts((prev) => prev.map((m) => ({ ...m, readAt: m.readAt ?? new Date().toISOString() })));
                      setContactUnread(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                </div>
              )}
              {contacts.map((m) => (
                <div key={m.id}
                  className={`bg-zinc-900 border rounded-xl transition-all ${!m.readAt ? "border-blue-500/40" : "border-zinc-800"}`}>
                  <button
                    className="w-full text-left px-5 pt-5 pb-3"
                    onClick={() => {
                      setExpandedContact(expandedContact === m.id ? null : m.id);
                      if (!m.readAt) markContactRead(m.id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-montserrat font-bold text-sm text-white">{m.name}</span>
                          <span className="font-lora text-xs text-zinc-500">{m.email}</span>
                          {!m.readAt && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        {m.subject && <p className="font-montserrat text-xs text-zinc-500 mb-1">{m.subject}</p>}
                        <p className="font-lora text-xs text-zinc-600 truncate">{m.message}</p>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 font-lora text-xs text-zinc-600">
                        <Clock size={11} />{timeAgo(m.sentAt)}
                      </span>
                    </div>
                  </button>
                  {expandedContact === m.id && (
                    <div className="px-5 pb-5 border-t border-zinc-800 pt-4">
                      <p className="font-lora text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap mb-4">{m.message}</p>
                      {m.repliedAt && (
                        <p className="font-montserrat text-xs text-green-400 mb-3 flex items-center gap-1.5">
                          <CheckCheck size={13} /> Replied {timeAgo(m.repliedAt)}
                        </p>
                      )}
                      {replyingContact === m.id ? (
                        <div className="space-y-3">
                          <textarea
                            rows={4}
                            placeholder={`Reply to ${m.name}…`}
                            value={contactReplyBody[m.id] ?? ""}
                            onChange={e => setContactReplyBody(prev => ({ ...prev, [m.id]: e.target.value }))}
                            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 font-lora text-sm px-4 py-3 focus:outline-none focus:border-white transition-colors resize-none"
                            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendContactReply(m.id); }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendContactReply(m.id)}
                              disabled={!contactReplyBody[m.id]?.trim() || sendingReply === m.id}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-montserrat font-bold text-xs uppercase tracking-widest px-5 py-2.5 transition-colors disabled:opacity-40"
                            >
                              <Send size={13} />{sendingReply === m.id ? "Sending…" : "Send"}
                            </button>
                            <button
                              onClick={() => setReplyingContact(null)}
                              className="text-zinc-500 hover:text-zinc-300 font-montserrat text-xs uppercase tracking-widest px-4 py-2.5 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingContact(m.id)}
                          className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-montserrat text-xs font-semibold uppercase tracking-widest px-5 py-2.5 border border-zinc-700 transition-colors"
                        >
                          <Mail size={13} /> {m.repliedAt ? "Reply Again" : "Reply"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
