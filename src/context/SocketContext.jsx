import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, socket } from '../apiClient';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  // Fetch tickets (first page or more)
  const fetchTickets = useCallback(async (newFilters = null, reset = false) => {
    setTicketsLoading(true);
    try {
      const activeFilters = newFilters || filters;
      const params = { limit: 20, ...activeFilters };
      if (!reset && cursor) params.cursor = cursor;
      const data = await api.getTickets(params);
      if (reset) {
        setTickets(data.tickets);
      } else {
        setTickets((prev) => {
          const ids = new Set(prev.map((t) => t._id));
          const fresh = data.tickets.filter((t) => !ids.has(t._id));
          return [...prev, ...fresh];
        });
      }
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  }, [cursor, filters]);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setCursor(null);
    setHasMore(true);
    fetchTickets(newFilters, true);
  }, [fetchTickets]);

  const loadMoreTickets = useCallback(() => {
    if (hasMore && !ticketsLoading) fetchTickets();
  }, [hasMore, ticketsLoading, fetchTickets]);

  // Fetch messages for active ticket
  const fetchMessages = useCallback(async (ticketId) => {
    if (!ticketId) return;
    try {
      const data = await api.getTicketMessages(ticketId);
      setActiveMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('ticket:created', (newTicket) => {
      setTickets((prev) => prev.some((t) => t._id === newTicket._id) ? prev : [newTicket, ...prev]);
    });

    socket.on('ticket:locked', ({ ticketId, lockedBy }) => {
      setTickets((prev) =>
        prev.map((t) => t._id === ticketId ? { ...t, lockedBy, lockedAt: new Date() } : t)
      );
    });

    socket.on('ticket:unlocked', ({ ticketId }) => {
      setTickets((prev) =>
        prev.map((t) => t._id === ticketId ? { ...t, lockedBy: null, lockedAt: null } : t)
      );
    });

    socket.on('ticket:resolved', ({ ticketId }) => {
      setTickets((prev) =>
        prev.map((t) => t._id === ticketId ? { ...t, status: 'Resolved', lockedBy: null } : t)
      );
    });

    socket.on('ticket:assigned', ({ ticketId, assignedTo }) => {
      setTickets((prev) =>
        prev.map((t) => t._id === ticketId ? { ...t, assignedTo, status: 'In-Progress' } : t)
      );
    });

    socket.on('message:created', (newMessage) => {
      setActiveTicketId((currentId) => {
        if (newMessage.ticketId === currentId) {
          setActiveMessages((prev) =>
            prev.some((m) => m._id === newMessage._id) ? prev : [...prev, newMessage]
          );
        }
        return currentId;
      });
    });

    // Initial load
    fetchTickets(filters, true);

    return () => {
      socket.off('ticket:created');
      socket.off('ticket:locked');
      socket.off('ticket:unlocked');
      socket.off('ticket:resolved');
      socket.off('ticket:assigned');
      socket.off('message:created');
    };
  }, []); // eslint-disable-line

  // Lock ticket via REST (not socket emit)
  const lockTicket = useCallback(async (ticketId) => {
    try {
      await api.lockTicket(ticketId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not lock ticket';
      throw new Error(msg);
    }
  }, []);

  // Unlock ticket via REST
  const unlockTicket = useCallback(async (ticketId) => {
    try {
      await api.unlockTicket(ticketId);
    } catch (err) {
      console.error('Unlock failed:', err);
    }
  }, []);

  // Select active ticket — unlock old, lock new
  const selectTicket = useCallback(async (ticketId) => {
    if (activeTicketId && activeTicketId !== ticketId) {
      await unlockTicket(activeTicketId);
    }
    setActiveTicketId(ticketId);
    if (ticketId) {
      try {
        await lockTicket(ticketId);
        fetchMessages(ticketId);
      } catch (err) {
        // Ticket locked by someone else — don't open it
        alert(err.message);
        setActiveTicketId(null);
      }
    } else {
      setActiveMessages([]);
    }
  }, [activeTicketId, lockTicket, unlockTicket, fetchMessages]);

  // Send message via REST (socket broadcasts automatically)
  const sendMessage = useCallback(async (ticketId, content, user) => {
    try {
      const newMessage = await api.createTicketMessage(ticketId, {
        senderType: 'Agent',
        senderId: user?._id || user?.name || 'Agent',
        content,
      });
      setActiveMessages((prev) =>
        prev.some((m) => m._id === newMessage._id) ? prev : [...prev, newMessage]
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, []);

  // Resolve ticket
  const resolveTicket = useCallback(async (ticketId) => {
    try {
      await api.resolveTicket(ticketId);
      setTickets((prev) =>
        prev.map((t) => t._id === ticketId ? { ...t, status: 'Resolved', lockedBy: null } : t)
      );
      if (activeTicketId === ticketId) {
        setActiveTicketId(null);
        setActiveMessages([]);
      }
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  }, [activeTicketId]);

  // Generate mock ticket (dev helper)
  const generateMockTicket = useCallback(async () => {
    const mocks = [
      { title: 'Database connection timeout', description: 'MongooseServerSelectionError when writing to MongoDB cluster.', customerId: 'dev@company.com' },
      { title: 'Charged twice on subscription', description: 'Two identical charges of $49.00 appeared on my card today.', customerId: 'user@gmail.com' },
      { title: 'API returning 500 on page=3', description: 'GET /api/v1/products crashes with pagination param page=3.', customerId: 'dev@partner.io' },
      { title: 'Password reset email not received', description: 'Clicked forgot password 3 times but no email received.', customerId: 'user@yahoo.com' },
    ];
    try {
      await api.createTicket(mocks[Math.floor(Math.random() * mocks.length)]);
    } catch (err) {
      console.error('Mock ticket failed:', err);
    }
  }, []);

  const activeTicket = tickets.find((t) => t._id === activeTicketId) || null;

  return (
    <SocketContext.Provider value={{
      tickets, activeTicketId, activeTicket, activeMessages,
      ticketsLoading, hasMore, filters,
      lockTicket, unlockTicket, selectTicket,
      sendMessage, resolveTicket, generateMockTicket,
      fetchTickets, applyFilters, loadMoreTickets,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
