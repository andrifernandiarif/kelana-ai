"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Citation {
  source: string;
  snippet: string;
}

interface AskResponse {
  question: string;
  answer: string;
  citations: Citation[];
}

export default function AskKelanaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when panel opens, reset state when panel closes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuestion("");
      setResult(null);
      setError("");
    }
  }, [isOpen]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const API_URL = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
      ).replace(/\/$/, "");

      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to get an answer.");
      }

      const data: AskResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setResult(null);
    setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    /* ── Sticky wrapper — fixed to bottom-right corner ── */
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="flex max-h-[calc(100vh-6rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 backdrop-blur-xl sm:w-[400px]">

          {/* Header — always visible, never scrolls */}
          <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-white">Ask KelanaAI</h3>
              <p className="mt-0.5 text-xs text-blue-100">Powered by your trusted travel documents</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ask KelanaAI"
              className="rounded-lg p-1 text-blue-100 transition hover:bg-white/20 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body — scrollable when content overflows */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">

            {/* Loading state */}
            {loading && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <svg className="h-4 w-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Searching knowledge base...
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Answer */}
            {result && !loading && (
              <div className="rounded-xl bg-gradient-to-br from-blue-600/80 to-teal-600/80 p-4 space-y-3">

                {/* AI Answer */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-1.5">
                    AI Answer
                  </p>
                  <div className="prose prose-sm prose-invert max-w-none
                    prose-p:text-white prose-p:leading-6 prose-p:my-1.5
                    prose-headings:text-white prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1
                    prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
                    prose-strong:text-white prose-strong:font-semibold
                    prose-em:text-blue-100
                    prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-white
                    prose-ol:my-1.5 prose-ol:pl-4
                    [&_li::marker]:text-white [&_li::marker]:font-normal
                    prose-code:text-blue-200 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                    prose-blockquote:border-blue-300 prose-blockquote:text-blue-100
                    prose-hr:border-white/20
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{result.answer}</ReactMarkdown>
                  </div>
                </div>

                {/* Citations */}
                {result.citations.length > 0 && (
                  <>
                    <div className="border-t border-white/20" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-2">
                        Source
                      </p>
                      <ul className="space-y-1.5">
                        {result.citations
                          .filter((c, i, arr) =>
                            arr.findIndex((x) => x.source === c.source) === i
                          )
                          .slice(0, 3)
                          .map((citation, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-blue-100">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-200">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <span className="font-mono break-all">
                                {citation.source.replace(/^.*\//, "")}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Ask another */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-1 text-[11px] text-blue-200 underline underline-offset-2 hover:text-white transition"
                >
                  Ask another question →
                </button>
              </div>
            )}

          </div>

          {/* Input form — pinned at bottom, never scrolls away */}
          <div className="flex-shrink-0 border-t border-white/10 bg-slate-900 p-4">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Hi, what would you like to ask?"
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <>
                    Ask
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FAB Toggle Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Ask KelanaAI" : "Open Ask KelanaAI"}
        className="flex items-center gap-2.5 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 px-5 py-3 shadow-lg shadow-blue-900/50 transition hover:scale-105 hover:from-blue-500 hover:to-blue-400 active:scale-95"
      >
        {isOpen ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 flex-shrink-0 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-semibold text-white">Close</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 flex-shrink-0 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            <span className="text-sm font-semibold text-white">Ask KelanaAI</span>
          </>
        )}
      </button>

    </div>
  );
}
