/**
 * conversationService.ts
 * ----------------------
 * All API calls for the conversation + message endpoints.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")
const API_URL = API_BASE.endsWith("/api/v1") ? API_BASE : `${API_BASE}/api/v1`

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("kelana_token")
  // Normalize to "Bearer" (capital B) — backend requires "Bearer <token>"
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Conversation = {
  id: number
  title: string
  created_at: string
}

export type Message = {
  id?: number
  role: "user" | "assistant"
  content: string
  created_at?: string
}

export type SendMessageResponse = {
  message_id: number
  role: "assistant"
  content: string
  created_at: string
}

// ---------------------------------------------------------------------------
// POST /api/v1/conversations
// Create a new conversation and return its id
// ---------------------------------------------------------------------------
export async function createConversation(title?: string): Promise<number> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ title: title ?? "New Conversation" }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to create conversation")
  }

  const data = await res.json()
  return data.conversation_id as number
}

// ---------------------------------------------------------------------------
// GET /api/v1/conversations
// List all conversations for the current user
// ---------------------------------------------------------------------------
export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/conversations`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  })

  if (!res.ok) return []
  return res.json()
}

// ---------------------------------------------------------------------------
// POST /api/v1/conversations/{id}/messages
// Send a user message and receive the assistant reply
// ---------------------------------------------------------------------------
export async function sendMessage(
  conversationId: number,
  content: string
): Promise<SendMessageResponse> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to send message")
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// GET /api/v1/conversations/{id}/messages
// Load all messages for a conversation (to restore history in the UI)
// ---------------------------------------------------------------------------
export async function getMessages(conversationId: number): Promise<Message[]> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to load messages")
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/conversations/{id}
// Rename a conversation
// ---------------------------------------------------------------------------
export async function renameConversation(
  conversationId: number,
  title: string
): Promise<{ id: number; title: string }> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ title }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to rename conversation")
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/conversations/{id}
// Delete a conversation and all its messages
// ---------------------------------------------------------------------------
export async function deleteConversation(conversationId: number): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to delete conversation")
  }
}
