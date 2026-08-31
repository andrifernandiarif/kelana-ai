const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")
const API_URL = API_BASE.endsWith("/api/v1") ? API_BASE : `${API_BASE}/api/v1`

export type AuthUser = {
  id: number
  name: string
  email: string
}

export type LoginResponse = {
  access_token: string
  token_type: string
  user: AuthUser
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Login failed")
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ message: string; user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Registration failed")
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function logoutUser(token: string): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ---------------------------------------------------------------------------
// localStorage + cookie helpers
// ---------------------------------------------------------------------------

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export function saveSession(data: LoginResponse): void {
  localStorage.setItem("kelana_token", data.access_token)
  localStorage.setItem("kelana_token_type", data.token_type)
  localStorage.setItem("kelana_user", JSON.stringify(data.user))

  // Also write a cookie so Next.js middleware can read it on the Edge
  document.cookie = `kelana_token=${data.access_token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

  // Notify same-tab listeners (e.g. Header) that the session changed
  window.dispatchEvent(new Event("kelana_session_changed"))
}

export function clearSession(): void {
  localStorage.removeItem("kelana_token")
  localStorage.removeItem("kelana_token_type")
  localStorage.removeItem("kelana_user")

  // Expire the cookie
  document.cookie = "kelana_token=; path=/; max-age=0; SameSite=Lax"

  // Notify same-tab listeners
  window.dispatchEvent(new Event("kelana_session_changed"))
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("kelana_user")
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("kelana_token")
}
