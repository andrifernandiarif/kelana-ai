"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

import { getStoredToken } from "@/services/authService";
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  renameConversation,
  type Conversation,
  type Message,
} from "@/services/conversationService";

// ---------------------------------------------------------------------------
// Chat Page
//
// Features:
//   • Conversation sidebar — list, select, auto-load messages, new button
//   • Load previous messages when clicking a past conversation
//   • Inline rename — double-click or pencil icon on any conversation
//   • Message bubbles + typing indicator + auto-scroll
//   • Footer at the bottom
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const router = useRouter();

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]     = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  // ── Rename state ──────────────────────────────────────────────────────────
  const [renamingId, setRenamingId]         = useState<number | null>(null);
  const [renameValue, setRenameValue]       = useState("");
  const renameInputRef                      = useRef<HTMLInputElement>(null);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [messages, setMessages]             = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput]                   = useState("");
  const [sending, setSending]               = useState(false);
  const [error, setError]                   = useState("");

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!getStoredToken()) router.replace("/login");
  }, [router]);

  // ── Load conversation list ────────────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    try {
      const list = await getConversations();
      setConversations(list);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => { refreshConversations(); }, [refreshConversations]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // ── Focus rename input when entering rename mode ──────────────────────────
  useEffect(() => {
    if (renamingId !== null) {
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 50);
    }
  }, [renamingId]);

  // ── Select a conversation and load its messages ───────────────────────────
  const handleSelectConversation = useCallback(async (conv: Conversation) => {
    if (conv.id === activeConvId) { setSidebarOpen(false); return; }

    setActiveConvId(conv.id);
    setMessages([]);
    setError("");
    setSidebarOpen(false);
    setLoadingMessages(true);

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
        title: "New Conversation",
        created_at: new Date().toLocaleString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(id);
      setMessages([]);
      setError("");
      setSidebarOpen(false);
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
          title: "New Conversation",
          created_at: new Date().toLocaleString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(convId);
      } catch {
        setError("Could not start a conversation. Please try again.");
        return;
      }
    }

    const userMsg: Message = { role: "user", content: text };
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

  // ── Rename helpers ────────────────────────────────────────────────────────
  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const commitRename = async () => {
    if (renamingId === null) return;
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }

    try {
      await renameConversation(renamingId, trimmed);
      setConversations((prev) =>
        prev.map((c) => c.id === renamingId ? { ...c, title: trimmed } : c)
      );
    } catch {
      // revert silently — original title stays
    } finally {
      setRenamingId(null);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); commitRename(); }
    if (e.key === "Escape") { setRenamingId(null); }
  };

  // ── Active conversation metadata ──────────────────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col bg-slate-950 text-white" style={{ minHeight: "calc(100vh - 0px)" }}>

      {/* ── main area (sidebar + chat) fills remaining viewport ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ==============================================================
            SIDEBAR
            ============================================================== */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/10
            bg-slate-900 transition-transform duration-300
            lg:relative lg:translate-x-0 lg:z-auto lg:top-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{ top: "0" }}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <span className="text-sm font-semibold">New Chat</span>
            </div>
            <button
              onClick={handleNewConversation}
              title="New chat"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {/* Conversation list */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {conversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-slate-600">
                No conversations yet.<br />Click + to start one.
              </p>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id} className="group relative">
                  {renamingId === conv.id ? (
                    /* ── Inline rename input ── */
                    <div className="flex items-center gap-1 rounded-xl bg-blue-600/20 px-3 py-2">
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={commitRename}
                        maxLength={256}
                        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                      />
                      <button
                        onMouseDown={(e) => { e.preventDefault(); commitRename(); }}
                        className="flex-shrink-0 rounded p-0.5 text-blue-300 hover:text-white"
                        title="Save"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* ── Normal conversation row ── */
                    <div
                      onClick={() => handleSelectConversation(conv)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleSelectConversation(conv)}
                      className={`
                        flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left transition
                        ${conv.id === activeConvId
                          ? "bg-blue-600/20 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={1.5}
                        className={`h-4 w-4 flex-shrink-0 ${conv.id === activeConvId ? "text-blue-400" : "text-slate-600"}`}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <div className="ml-2 min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-snug">{conv.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{conv.created_at}</p>
                      </div>
                      {/* Pencil icon — separate clickable element, not nested inside a button */}
                      <button
                        onClick={(e) => startRename(conv, e)}
                        title="Rename"
                        className={`
                          ml-1 flex-shrink-0 rounded p-1 transition
                          text-slate-600 hover:text-white
                          opacity-0 group-hover:opacity-100
                          ${conv.id === activeConvId ? "opacity-100" : ""}
                        `}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </aside>

        {/* ==============================================================
            MAIN CHAT AREA
            ============================================================== */}
        <div className="flex flex-1 flex-col min-w-0">

          {/* Chat header */}
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>

            <h1 className="flex-1 truncate text-sm font-semibold">
              {activeConv ? activeConv.title : "KelanaAI Chat"}
            </h1>

            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

            {/* Loading messages spinner */}
            {loadingMessages && (
              <div className="flex items-center justify-center py-12 text-slate-500 gap-2 text-sm">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading messages...
              </div>
            )}

            {/* Empty state */}
            {!loadingMessages && messages.length === 0 && !sending && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 max-w-sm">
                  <div className="text-4xl mb-4">✈️</div>
                  <h2 className="text-lg font-semibold">Start a Chat</h2>
                  <p className="mt-2 text-sm text-slate-500 leading-6">
                    Ask KelanaAI to plan a trip, suggest destinations, or help
                    you build a travel itinerary.
                  </p>
                  {/* <div className="mt-4 space-y-2">
                    {[
                      "Plan a family trip to Japan",
                      "Best budget destinations in Southeast Asia",
                      "5-day itinerary for Bali",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="block w-full rounded-xl border border-white/10 bg-white/5
                                   px-3 py-2 text-left text-xs text-slate-400
                                   transition hover:bg-white/10 hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div> */}
                </div>
              </div>
            )}

            {/* Messages */}
            {!loadingMessages && messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {sending && <TypingIndicator />}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 border-t border-white/10 bg-slate-900/80 p-4 backdrop-blur">
            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-slate-800 px-4 py-3
                            focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
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
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-700">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`
        max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6
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
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
