// Simple in-memory store for test/dev mode
// Not for production use

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const users = new Map(); // email -> { id, email, passwordHash, role }
const tickets = new Map(); // id -> ticket

export const memoryDB = {
  users,
  tickets,
  async createUser({ email, password, first_name, last_name, role = 'user' }) {
    if (users.has(email)) throw new Error('User already exists');
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id, email, first_name, last_name, role, passwordHash };
    users.set(email, user);
    return { id, email, first_name, last_name, role };
  },
  async getUserByEmail(email) {
    return users.get(email) || null;
  },
  async createTicket({ title, description, priority, category, requester_email, is_vip = false }) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const vip_priority_score = is_vip ? 100 : 0;
    const ticket = {
      id,
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      requester_email,
      status: 'open',
      comments: [],
      created_at: now,
      updated_at: now,
      is_vip: !!is_vip,
      vip_priority_score
    };
    tickets.set(id, ticket);
    return ticket;
  },
  async getTicket(id) {
    return tickets.get(id) || null;
  },
  async updateTicket(id, data) {
    const t = tickets.get(id);
    if (!t) return null;
    const updated = { ...t, ...data, updated_at: new Date().toISOString() };
    tickets.set(id, updated);
    return updated;
  },
  async addComment(id, { content, type = 'internal' }) {
    const t = tickets.get(id);
    if (!t) return null;
    const comment = { id: uuidv4(), content, type, created_at: new Date().toISOString() };
    t.comments.push(comment);
    t.updated_at = new Date().toISOString();
    tickets.set(id, t);
    return comment;
  },
  async listTickets() {
    return Array.from(tickets.values());
  }
};