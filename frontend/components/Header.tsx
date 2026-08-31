"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="border-b border-white/10 bg-slate-950">
      <div className="mx-auto max-w-6xl px-5">

        {/* HEADER */}
        <div className="flex items-center justify-between py-5">

          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl">
              ✈️
            </span>

            <div>
              <div className="text-xl font-bold text-white">
                Kelana
                <span className="text-blue-400">
                  AI
                </span>
                <span className="ml-2 text-xs text-slate-500">
                Plan Smarter. Travel Better.
                </span>
              </div>

            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-3 text-sm sm:flex">

            <Link
              href="/"
              className="rounded-xl px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/#about"
              className="rounded-xl px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              About
            </Link>

            <Link
              href="/#planner"
              className="rounded-xl px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Planner
            </Link>

            <Link
              href="/trips"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              My Trips
            </Link>

          </div>

          {/* HAMBURGER BUTTON - MOBILE */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              // X ICON
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // HAMBURGER ICON
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="border-t border-white/10 py-4 sm:hidden">

            <div className="flex flex-col gap-2">

              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/#about"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                About
              </Link>

              <Link
                href="/#planner"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Planner
              </Link>

              <Link
                href="/trips"
                onClick={closeMenu}
                className="mt-1 rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                My Trips
              </Link>

            </div>

          </div>
        )}

      </div>
    </nav>
  );
}


