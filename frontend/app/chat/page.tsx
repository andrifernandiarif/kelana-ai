"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { getStoredToken } from "@/services/authService";
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  renameConversation,
  deleteConversation,
  type Conversation,
  type Message,
} from "@/services/conversationService";

// ---------------------------------------------------------------------------
// Icons — inline SVG helpers
// ---------------------------------------------------------------------------

function IconPlus({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconSearch({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
    </svg>
  );
}

function IconChat({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function IconPencil({ className = "h-3.5 w-3.5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconTrash({ className = "h-3.5 w-3.5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconCheck({ className = "h-3.5 w-3.5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconClose({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconMenu({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconSidebarOpen({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l3-3-3-3" />
    </svg>
  );
}

function IconSidebarClose({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 19l-3-3 3-3" />
    </svg>
  );
}

function IconSend({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function IconSpinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return "";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return ts;

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) return timeStr;

  const dateStr = date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
  return `${dateStr}, ${timeStr}`;
}

// ---------------------------------------------------------------------------
// Chat Page
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const router = useRouter();

  // ── Sidebar state ─────────────────────────────────────────────────────────
  // sidebarOpen drives BOTH mobile overlay AND desktop collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Conversations ─────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  // ── Rename ────────────────────────────────────────────────────────────────
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Delete confirm ────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scrollBehavior = useRef<ScrollBehavior>("instant");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!getStoredToken()) router.replace("/login");
  }, [router]);

  // ── Load conversation list ────────────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    try {
      const list = await getConversations();
      setConversations(list);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { refreshConversations(); }, [refreshConversations]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: scrollBehavior.current });
  }, [messages, sending]);

  // ── Focus rename input ────────────────────────────────────────────────────
  useEffect(() => {
    if (renamingId !== null) {
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 50);
    }
  }, [renamingId]);

  // ── Filtered conversations ─────────────────────────────────────────────────
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelectConversation = useCallback(async (conv: Conversation) => {
    if (conv.id === activeConvId) {
      // On mobile, close sidebar when tapping active conv
      if (window.innerWidth < 1024) setSidebarOpen(false);
      return;
    }
    setActiveConvId(conv.id);
    setMessages([]);
    setError("");
    setLoadingMessages(true);
    scrollBehavior.current = "instant";
    // Close on mobile after selecting
    if (window.innerWidth < 1024) setSidebarOpen(false);

    try {
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
    } catch {
      setError("Could not load messages for this conversation.");
    } finally {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConvId]);

  // ── New conversation ──────────────────────────────────────────────────────
  const handleNewConversation = async () => {
    try {
      const id = await createConversation();
      const newConv: Conversation = {
        id,
        title: "New Chat",
        created_at: new Date().toLocaleString("id-ID", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit",
        }),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(id);
      setMessages([]);
      setError("");
      setSearchQuery("");
      if (window.innerWidth < 1024) setSidebarOpen(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      setError("Could not create a new conversation. Please try again.");
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setError("");

    let convId = activeConvId;
    if (!convId) {
      try {
        convId = await createConversation();
        const newConv: Conversation = {
          id: convId,
          title: "New Chat",
          created_at: new Date().toLocaleString("id-ID", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
          }),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(convId);
      } catch {
        setError("Could not start a conversation. Please try again.");
        return;
      }
    }

    scrollBehavior.current = "smooth";
    const userMsg: Message = {
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const reply = await sendMessage(convId, text);
      const assistantMsg: Message = {
        id: reply.message_id,
        role: "assistant",
        content: reply.content,
        created_at: reply.created_at,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      await refreshConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Rename ────────────────────────────────────────────────────────────────
  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const commitRename = async () => {
    if (renamingId === null) return;
    const trimmed = renameValue.trim().slice(0, 100);
    if (!trimmed) { setRenamingId(null); return; }
    try {
      await renameConversation(renamingId, trimmed);
      setConversations((prev) =>
        prev.map((c) => c.id === renamingId ? { ...c, title: trimmed } : c)
      );
    } catch { /* revert silently */ }
    finally { setRenamingId(null); }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); commitRename(); }
    if (e.key === "Escape") { setRenamingId(null); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (convId: number) => {
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) { setActiveConvId(null); setMessages([]); }
    } catch {
      setError("Could not delete conversation. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const messageCount = messages.length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================================
          SIDEBAR
          ================================================================ */}
      <aside
        className={`
          flex flex-col border-r border-white/10 bg-slate-900
          transition-all duration-300 ease-in-out overflow-hidden
          fixed inset-y-0 left-0 z-30
          lg:relative lg:inset-auto lg:z-auto
          ${sidebarOpen
            ? "w-72 translate-x-0"
            : "w-0 -translate-x-full lg:translate-x-0 lg:w-0"
          }
        `}
      >
        {/* ── Sidebar header — STICKY ── */}
        <div className="sticky top-0 z-10 flex-shrink-0 border-b border-white/10 bg-slate-900">

          {/* Top row: branding + new chat button */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <IconChat className="h-5 w-5 flex-shrink-0 text-blue-400" />
              <span className="truncate text-sm font-semibold text-white">KelanaAI Chat</span>
            </div>
            <button
              onClick={handleNewConversation}
              title="New chat"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                         text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <IconPlus />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 pb-3">
            <div className={`
              flex items-center gap-2 rounded-xl border px-3 py-2 transition
              ${searchFocused
                ? "border-blue-500 bg-slate-800 ring-2 ring-blue-500/20"
                : "border-white/10 bg-slate-800/60"
              }
            `}>
              <IconSearch className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search chats..."
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none
                           placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                  className="flex-shrink-0 rounded p-0.5 text-slate-500 hover:text-white transition"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Conversation list — scrollable ── */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-slate-600">
              No conversations yet.<br />Click + to start one.
            </p>
          ) : filteredConversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-600">
              No results for &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                isRenaming={renamingId === conv.id}
                isDeleting={deletingId === conv.id}
                renameValue={renameValue}
                renameInputRef={renameInputRef}
                onSelect={handleSelectConversation}
                onStartRename={startRename}
                onRenameChange={setRenameValue}
                onRenameKeyDown={handleRenameKeyDown}
                onRenameBlur={commitRename}
                onRenameCommit={commitRename}
                onDeleteRequest={(id) => setDeletingId(id)}
                onDeleteCancel={() => setDeletingId(null)}
                onDeleteConfirm={handleDelete}
              />
            ))
          )}
        </nav>
      </aside>

      {/* ================================================================
          MAIN CHAT AREA
          ================================================================ */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* ── Chat header — STICKY ── */}
        <header className="sticky top-0 z-10 flex flex-shrink-0 items-center gap-3
                           border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur">

          {/* Toggle sidebar button — works on both mobile and desktop */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                       text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {sidebarOpen ? <IconSidebarClose /> : <IconSidebarOpen />}
          </button>

          {/* Conversation title + message count */}
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">
              {activeConv ? activeConv.title : "KelanaAI Chat"}
            </h1>
            {activeConv && (
              <p className="mt-0.5 text-xs leading-tight text-slate-500">
                {messageCount > 0
                  ? `${messageCount} message${messageCount !== 1 ? "s" : ""}`
                  : "No messages yet"}
              </p>
            )}
          </div>

          {/* Online pill */}
          <span className="flex flex-shrink-0 items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Online</span>
          </span>

          {/* Close → home */}
          <button
            onClick={() => router.push("/")}
            title="Go to home"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
                       text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <IconClose />
          </button>
        </header>

        {/* ── Message list — scrollable ── */}
        <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-6 space-y-4">

          {/* Loading */}
          {loadingMessages && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <IconSpinner />
              Loading messages...
            </div>
          )}

          {/* Empty state */}
          {!loadingMessages && messages.length === 0 && !sending && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 max-w-sm mx-auto">
                <div className="mb-4 text-4xl">✈️</div>
                <h2 className="text-base font-semibold sm:text-lg">Start a Chat</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ask KelanaAI to plan a trip, suggest destinations, or help
                  you build a travel itinerary.
                </p>
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {!loadingMessages && messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}

          {/* Typing indicator */}
          {sending && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3
                            text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 border-t border-white/10 bg-slate-900/90 p-3 sm:p-4 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-slate-800
                            px-4 py-3 transition focus-within:border-blue-500
                            focus-within:ring-2 focus-within:ring-blue-500/20">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 resize-none bg-transparent text-sm text-white outline-none
                           placeholder:text-slate-500 disabled:opacity-50"
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl
                           bg-blue-600 text-white transition hover:bg-blue-500
                           disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? <IconSpinner /> : <IconSend />}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-700">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConversationItem
// ---------------------------------------------------------------------------

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isRenaming: boolean;
  isDeleting: boolean;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (conv: Conversation) => void;
  onStartRename: (conv: Conversation, e: React.MouseEvent) => void;
  onRenameChange: (v: string) => void;
  onRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRenameBlur: () => void;
  onRenameCommit: () => void;
  onDeleteRequest: (id: number) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: (id: number) => void;
}

function ConversationItem({
  conv, isActive, isRenaming, isDeleting,
  renameValue, renameInputRef,
  onSelect, onStartRename, onRenameChange, onRenameKeyDown,
  onRenameBlur, onRenameCommit,
  onDeleteRequest, onDeleteCancel, onDeleteConfirm,
}: ConversationItemProps) {
  if (isRenaming) {
    return (
      <div className="flex items-center gap-1 rounded-xl bg-blue-600/20 px-3 py-2">
        <input
          ref={renameInputRef}
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={onRenameKeyDown}
          onBlur={onRenameBlur}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); onRenameCommit(); }}
          className="flex-shrink-0 rounded p-0.5 text-blue-300 hover:text-white transition"
          title="Save"
        >
          <IconCheck />
        </button>
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/30
                      bg-red-500/10 px-3 py-2.5">
        <p className="min-w-0 flex-1 truncate text-xs text-red-300">
          Delete &ldquo;{conv.title}&rdquo;?
        </p>
        <button
          onClick={() => onDeleteConfirm(conv.id)}
          className="flex-shrink-0 rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold
                     text-white transition hover:bg-red-500"
        >
          Delete
        </button>
        <button
          onClick={onDeleteCancel}
          className="flex-shrink-0 rounded-lg border border-white/10 px-2 py-1
                     text-xs text-slate-400 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(conv)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(conv)}
      className={`
        group flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 transition
        ${isActive
          ? "bg-blue-600/20 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <IconChat
        className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-600"}`}
      />
      <div className="ml-2 min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{conv.title}</p>
        <p className="mt-0.5 text-xs text-slate-600">{conv.created_at}</p>
      </div>

      {/* Action buttons — visible on hover or when active */}
      <div className={`
        ml-1 flex flex-shrink-0 items-center gap-0.5
        opacity-0 group-hover:opacity-100 transition-opacity
        ${isActive ? "opacity-100" : ""}
      `}>
        <button
          onClick={(e) => onStartRename(conv, e)}
          title="Rename"
          className="rounded p-1 text-slate-600 transition hover:text-white"
        >
          <IconPencil />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteRequest(conv.id); }}
          title="Delete"
          className="rounded p-1 text-slate-600 transition hover:text-red-400"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const ts = formatTimestamp(message.created_at);

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6
        sm:max-w-[75%]
        ${isUser
          ? "rounded-br-sm bg-blue-600 text-white"
          : "rounded-bl-sm border border-white/10 bg-white/[0.06] text-slate-200"
        }
      `}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none
            prose-p:my-1 prose-p:leading-6
            prose-headings:text-white prose-headings:font-semibold
            prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
            prose-strong:text-white
            prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
            prose-ol:my-1 prose-ol:pl-4
            prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5
            prose-code:rounded prose-code:text-xs
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {ts && (
        <span className={`px-1 text-[10px] text-slate-600 ${isUser ? "text-right" : "text-left"}`}>
          {ts}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TypingIndicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-slate-500">KelanaAI is typing...</span>
        </div>
      </div>
    </div>
  );
}
