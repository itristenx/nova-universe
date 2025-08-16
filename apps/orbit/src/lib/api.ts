// API utility for Nova Orbit frontend
// Handles ticket CRUD and feedback endpoints

const ORBIT_BASE = process.env.NEXT_PUBLIC_ORBIT_API_BASE || "/api/v1/orbit";
const HELIX_BASE = process.env.NEXT_PUBLIC_HELIX_API_BASE || "/api/v1/helix";
const LORE_BASE = process.env.NEXT_PUBLIC_LORE_API_BASE || "/api/v1/lore";
const SYNTH_BASE = process.env.NEXT_PUBLIC_SYNTH_API_BASE || "/api/v2/synth";

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

export async function _getTickets(token: string, params: TicketParams = {}) {
  const url = new URL(`${ORBIT_BASE}/tickets`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include"
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _getTicket(token: string, ticketId: string) {
  const res = await fetch(`${ORBIT_BASE}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include"
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _createTicket(token: string, data: TicketCreateData) {
  const res = await fetch(`${ORBIT_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: "include"
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _getCategories(token: string) {
  const res = await fetch(`${ORBIT_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include"
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _getCatalogItems(token: string) {
  const res = await fetch(`${ORBIT_BASE}/catalog`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _submitCatalogItem(token: string, id: number, data: _any) {
  const res = await fetch(`${ORBIT_BASE}/catalog/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: 'include'
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _submitFeedback(token: string, data: FeedbackData) {
  const res = await fetch(`${ORBIT_BASE}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: "include"
  }); // TODO-LINT: move to async function
  return res.json();
}

export async function _getSession(token: string) {
  const res = await fetch(`${HELIX_BASE}/session`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function _updateProfile(token: string, id: string, data: { _name: string; email: string; _org: string }) {
  const res = await fetch(`${HELIX_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) {
    const errorDetails = await res.text(); // TODO-LINT: move to async function
    throw new Error(`Failed to update profile: ${res.status} ${res.statusText} - ${errorDetails}`);
  }
  return res.json();
}

export async function _searchKnowledge(token: string, query: string) {
  const url = new URL(`${LORE_BASE}/search`, window.location.origin);
  url.searchParams.set('q', query);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) {
    throw new Error(`Failed to search knowledge: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function _getServiceStatus(token: string) {
  const res = await fetch('/api/server/status', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) {
    throw new Error(`Failed to fetch service status: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function _sendCosmoMessage(token: string, message: string) {
  const res = await fetch(`${SYNTH_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message }),
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) {
    const errorDetails = await res.text(); // TODO-LINT: move to async function // Attempt to extract error details
    throw new Error(`Failed to send message: ${res.status} ${res.statusText} - ${errorDetails}`);
  }
  return res.json();
}

export async function _getKnowledgeArticle(token: string, slug: string) {
  const res = await fetch(`${LORE_BASE}/articles/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
  return res.json();
}

export async function _getKnowledgeArticles(token: string, params: { search?: string } = {}) {
  const url = new URL(`${LORE_BASE}/articles`, window.location.origin);
  if (params.search) url.searchParams.set('search', params.search);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(await res.text()); // TODO-LINT: move to async function
  return await res.json(); // TODO-LINT: move to async function
}

export async function _getKnowledgeVersions(token: string, articleId: number) {
  const res = await fetch(`${LORE_BASE}/articles/${articleId}/versions`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(`Failed to fetch versions: ${res.status}`);
  return res.json();
}

export async function _getKnowledgeComments(token: string, articleId: number) {
  const res = await fetch(`${LORE_BASE}/articles/${articleId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
  return res.json();
}

export async function _createKnowledgeArticle(token: string, data: { title: string; content: string; tags?: string[] }) {
  const res = await fetch(`${LORE_BASE}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(await res.text()); // TODO-LINT: move to async function
  return await res.json(); // TODO-LINT: move to async function
}

export async function _createKnowledgeVersion(token: string, slug: string, data: { content: string; tags?: string[] }) {
  const res = await fetch(`${LORE_BASE}/articles/${slug}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(await res.text()); // TODO-LINT: move to async function
  return await res.json(); // TODO-LINT: move to async function
}

export async function _deleteKnowledgeArticle(token: string, slug: string) {
  const res = await fetch(`${LORE_BASE}/articles/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error(await res.text()); // TODO-LINT: move to async function
  return await res.json(); // TODO-LINT: move to async function
}
