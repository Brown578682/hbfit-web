"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, CheckCheck, Clock } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface KioskMessage {
  id: string;
  memberId: string;
  memberName: string;
  message: string;
  sentAt: string;
  readAt: string | null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [messages, setMessages] = useState<KioskMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    setMarkingId(id);
    try {
      await fetch(`/api/admin/messages/${id}/read`, { method: "POST" });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, readAt: new Date().toISOString() } : m
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } finally {
      setMarkingId(null);
    }
  };

  const markAllRead = async () => {
    const unread = messages.filter((m) => !m.readAt);
    for (const msg of unread) {
      await fetch(`/api/admin/messages/${msg.id}/read`, { method: "POST" });
    }
    setMessages((prev) =>
      prev.map((m) => ({ ...m, readAt: m.readAt ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare className="text-blue-400" size={28} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-montserrat font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">
              Messages
            </h1>
            <p className="font-lora text-zinc-400 mt-0.5 text-sm">
              Kiosk messages from members to coaches
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-sm font-semibold transition-colors border border-zinc-700"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {/* Unread badge */}
      {!loading && (
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-montserrat font-semibold ${
              unreadCount > 0
                ? "bg-red-500/10 text-red-400"
                : "bg-green-400/10 text-green-400"
            }`}
          >
            {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
          </span>
          <span className="text-xs text-zinc-500 font-montserrat">
            {messages.length} total message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-lora">
          Loading messages…
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center">
          <MessageSquare className="text-zinc-700 mx-auto mb-4" size={40} />
          <p className="font-montserrat font-bold text-lg text-white">
            No messages yet
          </p>
          <p className="font-lora text-zinc-500 mt-2">
            Member messages from the kiosk will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isUnread = !msg.readAt;
            const isMarking = markingId === msg.id;
            return (
              <div
                key={msg.id}
                className={`bg-zinc-900 border rounded-xl p-5 transition-all ${
                  isUnread
                    ? "border-blue-500/40"
                    : "border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-montserrat font-bold text-sm text-white">
                        {msg.memberName}
                      </span>
                      {isUnread && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-zinc-500 font-lora ml-auto">
                        <Clock size={11} />
                        {formatTime(msg.sentAt)}
                      </span>
                    </div>
                    <p
                      className={`font-lora text-sm leading-relaxed ${
                        isUnread ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {msg.message}
                    </p>
                    {msg.readAt && (
                      <p className="font-lora text-xs text-zinc-600">
                        Read {formatTime(msg.readAt)}
                      </p>
                    )}
                  </div>
                  {isUnread && (
                    <button
                      onClick={() => markRead(msg.id)}
                      disabled={isMarking}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-montserrat text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <CheckCheck size={13} />
                      {isMarking ? "…" : "Mark read"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
