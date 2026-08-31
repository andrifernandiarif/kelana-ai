"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  clearSession,
  getStoredToken,
  getStoredUser,
  logoutUser,
  type AuthUser,
} from "@/services/authService";

export default function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  // Prevent hydration mismatch — render auth-dependent UI only after mount
  const [mounted, setMounted] = useState(false);

  const syncUser = () => setUser(getStoredUser());

  useEffect(() => {
    setMounted(true);
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("kelana_session_changed", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("kelana_session_changed", syncUser);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    const token = getStoredToken();
    if (token) {
      await logoutUser(token).catch(() => {});
    }
    clearSession();
    setUser(null);
    closeMenu();
    router.push("/login");
    router.refresh();
  };

  // Whether the current user is authenticated (only evaluated after mount)
  const isLoggedIn = mounted && !!user;

  return (
    <nav className="border-b border-white/10 bg-slate-950">
      <div className="mx-auto max-w-6xl px-5">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between py-5">

          {/* LOGO */}
          <Link
            href={isLoggedIn ? "/" : "/login"}
            onClick={closeMenu}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl">✈️</span>
            <div className="text-xl font-bold text-white">
              Kelana
              <span className="text-blue-400">AI</span>
              <span className="ml-2 text-xs text-slate-500">
                Plan Smarter. Travel Better.
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <div className="hidden items-center gap-3 text-sm sm:flex">

            {/* Nav links — only shown when logged in */}
            {isLoggedIn && (
              <>
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
              </>
            )}

            {/* Auth section */}
            {mounted && (
              <>
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      Hi,{" "}
                      <span className="font-semibold text-white">
                        {user!.name.split(" ")[0]}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl border border-white/10 px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="rounded-xl px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

          </div>

          {/* ── HAMBURGER — MOBILE ── */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

        </div>

        {/* ── MOBILE MENU ── */}
        {isMenuOpen && (
          <div className="border-t border-white/10 py-4 sm:hidden">
            <div className="flex flex-col gap-2">

              {/* Nav links — only when logged in */}
              {isLoggedIn && (
                <>
                  <Link href="/" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                    Home
                  </Link>
                  <Link href="/#about" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                    About
                  </Link>
                  <Link href="/#planner" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                    Planner
                  </Link>
                  <Link href="/trips" onClick={closeMenu} className="mt-1 rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                    My Trips
                  </Link>
                </>
              )}

              {/* Auth — mobile */}
              {mounted && (
                <>
                  {isLoggedIn ? (
                    <>
                      <p className="px-4 py-2 text-sm text-slate-500">
                        Logged in as{" "}
                        <span className="font-semibold text-white">{user!.name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl border border-white/10 px-4 py-3 text-left font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={closeMenu} className="rounded-xl border border-white/10 px-4 py-3 text-center font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                        Login
                      </Link>
                      <Link href="/register" onClick={closeMenu} className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
