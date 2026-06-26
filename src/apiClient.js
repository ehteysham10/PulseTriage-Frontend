import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://pulsetriage-backend.onrender.com';

// ==========================================
// 1. Axios REST Client with JWT Interceptors
// ==========================================
export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (expired/invalid token) — only if not already on a public page
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const publicPaths = ['/login', '/register', '/submit'];
    const isPublic = publicPaths.some((p) => window.location.pathname.startsWith(p));
    if (error.response?.status === 401 && !isPublic) {
      localStorage.removeItem('pt_token');
      localStorage.removeItem('pt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 2. All API Methods
// ==========================================
export const api = {

  // ── AUTH ────────────────────────────────

  /** POST /auth/login */
  login: async ({ email, password }) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  /** POST /auth/register */
  register: async ({ username, name, email, password }) => {
    const res = await apiClient.post('/auth/register', { username, name, email, password });
    return res.data;
  },

  /** GET /auth/pending — Admin only */
  getPendingAgents: async () => {
    const res = await apiClient.get('/auth/pending');
    return res.data;
  },

  /** GET /auth/agents — Admin only */
  getAllAgents: async () => {
    const res = await apiClient.get('/auth/agents');
    return res.data;
  },

  /** PATCH /auth/approve/:userId — Admin only */
  approveAgent: async (userId) => {
    const res = await apiClient.patch(`/auth/approve/${userId}`);
    return res.data;
  },

  /** PATCH /auth/reject/:userId — Admin only */
  rejectAgent: async (userId) => {
    const res = await apiClient.patch(`/auth/reject/${userId}`);
    return res.data;
  },

  /** PATCH /auth/promote/:userId — Super Admin only */
  promoteAgent: async (userId) => {
    const res = await apiClient.patch(`/auth/promote/${userId}`);
    return res.data;
  },

  /** PATCH /auth/demote/:userId — Super Admin only */
  demoteAgent: async (userId) => {
    const res = await apiClient.patch(`/auth/demote/${userId}`);
    return res.data;
  },

  // ── TICKETS ─────────────────────────────

  /**
   * GET /tickets — cursor-based pagination + filters
   * @param {Object} params — { cursor, limit, status, priority, tags, search }
   */
  getTickets: async (params = {}) => {
    const res = await apiClient.get('/tickets', { params });
    return res.data;
  },

  /** POST /tickets/create — Public */
  createTicket: async ({ title, description, customerId }) => {
    const res = await apiClient.post('/tickets/create', { title, description, customerId });
    return res.data;
  },

  /** GET /tickets/stats — Admin only */
  getTicketStats: async () => {
    const res = await apiClient.get('/tickets/stats');
    return res.data;
  },

  /** PATCH /tickets/:id/lock */
  lockTicket: async (ticketId) => {
    const res = await apiClient.patch(`/tickets/${ticketId}/lock`);
    return res.data;
  },

  /** PATCH /tickets/:id/unlock */
  unlockTicket: async (ticketId) => {
    const res = await apiClient.patch(`/tickets/${ticketId}/unlock`);
    return res.data;
  },

  /** PATCH /tickets/:id/assign — Admin only */
  assignTicket: async (ticketId, agentId) => {
    const res = await apiClient.patch(`/tickets/${ticketId}/assign`, { agentId });
    return res.data;
  },

  /** PATCH /tickets/:id/resolve */
  resolveTicket: async (ticketId) => {
    const res = await apiClient.patch(`/tickets/${ticketId}/resolve`);
    return res.data;
  },

  // ── MESSAGES ────────────────────────────

  /** GET /tickets/:id/messages */
  getTicketMessages: async (ticketId) => {
    const res = await apiClient.get(`/tickets/${ticketId}/messages`);
    return res.data;
  },

  /** POST /tickets/:id/messages */
  createTicketMessage: async (ticketId, { senderType, senderId, content }) => {
    const res = await apiClient.post(`/tickets/${ticketId}/messages`, { senderType, senderId, content });
    return res.data;
  },
};

// ==========================================
// 3. Socket.io Client (receive-only)
// ==========================================
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default { api, socket };
