import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = 'https://pulsetriage-backend.onrender.com';

// ==========================================
// 1. Setup Axios (REST API Client)
// ==========================================
export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fully checked API endpoints based on your backend routes:
export const api = {
  // 🎫 TICKETS
  
  // Get all tickets
  // Endpoint: GET /api/tickets/
  // Expected Response: Array of ticket objects [ { _id, title, status... }, ... ]
  getTickets: async () => {
    const response = await apiClient.get('/tickets');
    return response.data;
  },
  
  // Create a new ticket
  // Endpoint: POST /api/tickets/create
  // Required Payload: { title: String, description: String, customerId: String }
  // Expected Response: { message: String, aiClassification: Object, ticket: Object }
  createTicket: async (ticketData) => {
    const response = await apiClient.post('/tickets/create', ticketData);
    return response.data;
  },

  // Resolve a ticket
  // Endpoint: PATCH /api/tickets/:ticketId/resolve
  // Expected Response: { message: String, ticket: Object }
  resolveTicket: async (ticketId) => {
    const response = await apiClient.patch(`/tickets/${ticketId}/resolve`);
    return response.data;
  },

  // 💬 MESSAGES

  // Get messages for a ticket
  // Endpoint: GET /api/tickets/:ticketId/messages
  // Expected Response: Array of message objects [ { _id, senderType, content... }, ... ]
  getTicketMessages: async (ticketId) => {
    const response = await apiClient.get(`/tickets/${ticketId}/messages`);
    return response.data;
  },

  // Send a message in a ticket
  // Endpoint: POST /api/tickets/:ticketId/messages
  // Required Payload: { senderType: String, senderId: String, content: String }
  // Note: senderType is usually 'Agent' or 'Customer'
  // Expected Response: The created message object { _id, senderType, content... }
  createTicketMessage: async (ticketId, messageData) => {
    const response = await apiClient.post(`/tickets/${ticketId}/messages`, messageData);
    return response.data;
  }
};


// ==========================================
// 2. Setup Socket.io (Real-Time Client)
// ==========================================
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
});

// Exact Socket Events emitted by the backend
export const setupSocketListeners = (callbacks = {}) => {
  socket.on('connect', () => {
    console.log('✅ Connected to PulseTriage Socket Server with ID:', socket.id);
  });

  // Listener for when a new ticket is created
  socket.on('ticket:created', (newTicket) => {
    console.log('🔔 New ticket created:', newTicket);
    if (callbacks.onTicketCreated) callbacks.onTicketCreated(newTicket);
  });

  // Listener for when a ticket is resolved
  socket.on('ticket:resolved', (data) => {
    console.log('✅ Ticket resolved:', data.ticketId);
    if (callbacks.onTicketResolved) callbacks.onTicketResolved(data.ticketId);
  });

  // Listener for when a ticket is unlocked
  socket.on('ticket:unlocked', (data) => {
    console.log('🔓 Ticket unlocked:', data.ticketId);
    if (callbacks.onTicketUnlocked) callbacks.onTicketUnlocked(data.ticketId);
  });

  // Listener for new messages inside a ticket
  socket.on('message:created', (newMessage) => {
    console.log('💬 New message received:', newMessage);
    if (callbacks.onNewMessage) callbacks.onNewMessage(newMessage);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from PulseTriage Socket Server');
  });
};

export default {
  api,
  socket,
  setupSocketListeners
};
