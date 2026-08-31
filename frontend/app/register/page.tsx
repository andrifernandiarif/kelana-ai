"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerUser } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /*
   * ==========================================
   * PASSWORD STRENGTH
   * ==========================================
   */

  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 6)   return { label: "Too short", color: "bg-red-500",    width: "25%" };
    if (pw.length < 8)   return { label: "Weak",      color: "bg-orange-400", width: "50%" };
    if (!/[0-9]/.test(pw) || !/[^a-zA-Z0-9]/.test(pw))
                          return { label: "Good",      color: "bg-yellow-400", width: "75%" };
    return               { label: "Strong",    color: "bg-emerald-500", width: "100%" };
  };

  const strength = getPasswordStrength(password);

  /*
   * ==========================================
   * HANDLE REGISTER
   * ==========================================
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name.trim(), email.trim(), password);

      setSuccess(true);

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * SUCCESS STATE
   * ==========================================
   */

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-100px] top-[-100px] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-[-100px] right-[-100px] h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md text-center">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-10 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
              ✅
            </div>
            <h2 className="mt-5 text-2xl font-bold">Account Created!</h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome to KelanaAI, <span className="font-semibold text-white">{name}</span>!
              Redirecting you to the login page...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full animate-[grow_2s_ease-in-out_forwards] rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">

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

          <h2 className="text-xl font-bold">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Join KelanaAI and start planning your trips.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            {/* NAME */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Budi Santoso"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
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
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  maxLength={72}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Strength:{" "}
                    <span
                      className={
                        strength.label === "Strong"
                          ? "text-emerald-400"
                          : strength.label === "Good"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }
                    >
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full rounded-xl border bg-slate-900 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 ${
                    confirmPassword.length > 0
                      ? password === confirmPassword
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                />
                <EyeToggle
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                />
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p
                  className={`mt-1 text-xs ${
                    password === confirmPassword
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
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
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Log in
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}

/*
 * ==========================================
 * EYE TOGGLE COMPONENT
 * ==========================================
 */

function EyeToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition hover:text-slate-300"
    >
      {show ? (
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
  );
}
