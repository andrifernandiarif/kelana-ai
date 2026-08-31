"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginUser, saveSession } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * ==========================================
   * HANDLE LOGIN
   * ==========================================
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      // Simpan token & user ke localStorage
      saveSession(data);

      // Redirect ke homepage
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-100px] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">✈️</div>
          <h1 className="text-3xl font-bold">
            Kelana<span className="text-blue-400">AI</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Plan Smarter. Travel Better.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl backdrop-blur-xl sm:p-10">

          <h2 className="text-xl font-bold">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">
            Log in to continue planning your trips.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition hover:text-slate-300"
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7a9.77 9.77 0 0 1 2.168-3.334M6.343 6.343A9.77 9.77 0 0 1 12 5c5 0 9 4 9 7a9.77 9.77 0 0 1-1.558 2.917M15 12a3 3 0 0 1-3 3m0 0a3 3 0 0 1-3-3m3 3v.01M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 font-semibold shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:from-blue-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}
