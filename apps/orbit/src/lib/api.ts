// API utility for Nova Orbit frontend
// Handles ticket CRUD and feedback endpoints

const ORBIT_BASE = process.env.NEXT_PUBLIC_ORBIT_API_BASE || '/api/v1/orbit';
const HELIX_BASE = process.env.NEXT_PUBLIC_HELIX_API_BASE || '/api/v1/helix';
const LORE_BASE = process.env.NEXT_PUBLIC_LORE_API_BASE || '/api/v1/lore';
const SYNTH_BASE = process.env.NEXT_PUBLIC_SYNTH_API_BASE || '/api/v2/synth';

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
  const url = new URL(`${ORBIT_BASE}/tickets`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  return res.json();
}

export async function getTicket(token: string, ticketId: string) {
  const res = await fetch(`${ORBIT_BASE}/tickets/${ticketId}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  return res.json();
}

export async function createTicket(token: string, data: TicketCreateData) {
  const res = await fetch(`${ORBIT_BASE}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return res.json();
}

export async function getCategories(token: string) {
  const res = await fetch(`${ORBIT_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  return res.json();
}

export async function getCatalogItems(token: string) {
  const res = await fetch(`${ORBIT_BASE}/catalog`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  return res.json();
}

export async function submitCatalogItem(token: string, id: number, data: Record<string, unknown>) {
  const res = await fetch(`${ORBIT_BASE}/catalog/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return res.json();
}

export async function submitFeedback(token: string, data: FeedbackData) {
  const res = await fetch(`${ORBIT_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return res.json();
}

export async function getSession(token: string) {
  const res = await fetch(`${HELIX_BASE}/session`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function updateProfile(
  token: string,
  id: string,
  data: { name: string; email: string; org: string },
) {
  const res = await fetch(`${HELIX_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Failed to update profile: ${res.status} ${res.statusText} - ${errorDetails}`);
  }
  return res.json();
}

export async function searchKnowledge(token: string, query: string) {
  const url = new URL(`${LORE_BASE}/search`, window.location.origin);
  url.searchParams.set('q', query);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to search knowledge: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getServiceStatus(token: string) {
  const res = await fetch('/api/server/status', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch service status: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function sendCosmoMessage(token: string, message: string) {
  const res = await fetch(`${SYNTH_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorDetails = await res.text(); // Attempt to extract error details
    throw new Error(`Failed to send message: ${res.status} ${res.statusText} - ${errorDetails}`);
  }
  return res.json();
}

export async function getKnowledgeArticle(token: string, slug: string) {
  const res = await fetch(`${LORE_BASE}/articles/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
  return res.json();
}

export async function getKnowledgeArticles(token: string, params: { search?: string } = {}) {
  const url = new URL(`${LORE_BASE}/articles`, window.location.origin);
  if (params.search) url.searchParams.set('search', params.search);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function getKnowledgeVersions(token: string, articleId: number) {
  const res = await fetch(`${LORE_BASE}/articles/${articleId}/versions`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to fetch versions: ${res.status}`);
  return res.json();
}

export async function getKnowledgeComments(token: string, articleId: number) {
  const res = await fetch(`${LORE_BASE}/articles/${articleId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
  return res.json();
}

export async function createKnowledgeArticle(
  token: string,
  data: { title: string; content: string; tags?: string[] },
) {
  const res = await fetch(`${LORE_BASE}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function createKnowledgeVersion(
  token: string,
  slug: string,
  data: { content: string; tags?: string[] },
) {
  const res = await fetch(`${LORE_BASE}/articles/${slug}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function deleteKnowledgeArticle(token: string, slug: string) {
  const res = await fetch(`${LORE_BASE}/articles/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
