// Centralized API utilities for the Unified UI
// Reads base URL from Vite env and provides a helper for fetch

// Prefer Vite vars; fallback to process.env for tests/SSR
const RAW_API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof process !== 'undefined' ? process.env.VITE_API_URL || process.env.VITE_API_BASE_URL : '') ||
  '';

function normalizeBase(base: string): string {
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

const API_BASE = normalizeBase(String(RAW_API_BASE || ''));

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function resolveApiUrl(path: string): string {
  if (!path) return path;
  if (!API_BASE) return path; // relative path, rely on same-origin/proxy
  if (!path.startsWith('/')) return `${API_BASE}/${path}`; // safety for non-leading slash
  return `${API_BASE}${path}`;
}

export function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' || input instanceof URL ? input : String(input);
  const resolved = typeof url === 'string' ? resolveApiUrl(url) : url;
  return fetch(resolved as any, init);
}
