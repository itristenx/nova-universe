// API utility for Nova Orbit frontend
// Handles ticket CRUD and feedback endpoints

const API_BASE = process.env.NEXT_PUBLIC_ORBIT_API_BASE || "/api/v1/orbit";

// Types for API data
export type TicketParams = {
  status?: string;
  limit?: number;
  offset?: number;
};

export type TicketCreateData = {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  contactMethod?: 'email' | 'phone' | 'in_person';
  contactInfo?: string;
  attachments?: string[];
};

export type FeedbackData = {
  subject: string;
  message: string;
  type: 'feedback' | 'suggestion' | 'complaint' | 'compliment';
  anonymous?: boolean;
};

export async function getTickets(token: string, params: TicketParams = {}) {
  const url = new URL(`${API_BASE}/tickets`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include"
  });
  return res.json();
}

export async function getTicket(token: string, ticketId: string) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include"
  });
  return res.json();
}

export async function createTicket(token: string, data: TicketCreateData) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res.json();
}

export async function getCategories(token: string) {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include"
  });
  return res.json();
}

export async function submitFeedback(token: string, data: FeedbackData) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res.json();
}

export async function getSession(token: string) {
  const res = await fetch('/api/v1/helix/session', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function updateProfile(token: string, id: string, data: { name: string; email: string; org: string }) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  return res.json();
}

export async function searchKnowledge(token: string, query: string) {
  const url = new URL('/api/v1/lore/search', window.location.origin);
  url.searchParams.set('q', query);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  });
  return res.json();
}

export async function getServiceStatus(token: string) {
  const res = await fetch('/api/server/status', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  });
  return res.json();
}

export async function sendCosmoMessage(token: string, message: string) {
  const res = await fetch('/api/v1/synth/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message }),
    credentials: 'include'
  });
  return res.json();
}
