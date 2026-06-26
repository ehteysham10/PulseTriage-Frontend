import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, socket } from '../apiClient';

export const SocketContext = createContext(null);

// Predefined agents with valid Mongoose ObjectIds to avoid database cast errors
export const AGENTS = [
  { id: '64b0f3e1a83c6b24d863f101', name: 'Agent Alice' },
  { id: '64b0f3e1a83c6b24d863f102', name: 'Agent Bob' }
];

export const SocketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [currentAgent, setCurrentAgentState] = useState(() => {
    const saved = localStorage.getItem('pt_agent');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return AGENTS[0]; // Default to Alice
  });

  const socketRef = useRef(null);

  const setCurrentAgent = (agent) => {
    setCurrentAgentState(agent);
    localStorage.setItem('pt_agent', JSON.stringify(agent));
    // If there is an active ticket, let's unlock it as agent identity has changed
    if (activeTicketId) {
      setActiveTicketId(null);
      setActiveMessages([]);
    }
  };

  // Fetch initial tickets
  const fetchTickets = useCallback(async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  }, []);

  // Fetch messages for active ticket
  const fetchMessages = useCallback(async (ticketId) => {
    if (!ticketId) return;
    try {
      const data = await api.getTicketMessages(ticketId);
      setActiveMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socketRef.current = socket;

    const onConnect = () => console.log('Connected to socket server:', socket.id);
    socket.on('connect', onConnect);

    // Handle real-time events from server
    socket.on('ticket:created', (newTicket) => {
      setTickets((prev) => {
        if (prev.some((t) => t._id === newTicket._id)) return prev;
        return [newTicket, ...prev];
      });
    });

    socket.on('ticket:locked', ({ ticketId, agentId }) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, lockedBy: agentId, lockedAt: new Date() } : t))
      );
    });

    socket.on('ticket:unlocked', ({ ticketId }) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, lockedBy: null, lockedAt: null } : t))
      );
    });

    socket.on('ticket:resolved', ({ ticketId }) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: 'Resolved', lockedBy: null, lockedAt: null } : t))
      );
    });

    socket.on('message:created', (newMessage) => {
      // If message is for active ticket, append to messages list
      setActiveTicketId((currentId) => {
        if (newMessage.ticketId === currentId) {
          setActiveMessages((prev) => {
            if (prev.some((m) => m._id === newMessage._id)) return prev;
            return [...prev, newMessage];
          });
        }
        return currentId;
      });
    });

    // Initial fetch
    fetchTickets();

    return () => {
      socket.off('connect', onConnect);
      socket.off('ticket:created');
      socket.off('ticket:locked');
      socket.off('ticket:unlocked');
      socket.off('ticket:resolved');
      socket.off('message:created');
    };
  }, [fetchTickets]);

  // Lock a ticket
  const lockTicket = useCallback((ticketId) => {
    if (socketRef.current) {
      socketRef.current.emit('ticket:lock', { ticketId, agentId: currentAgent.id });
    }
  }, [currentAgent]);

  // Unlock a ticket
  const unlockTicket = useCallback((ticketId) => {
    if (socketRef.current) {
      socketRef.current.emit('ticket:unlock', { ticketId, agentId: currentAgent.id });
    }
  }, [currentAgent]);

  // Select active ticket
  const selectTicket = useCallback(async (ticketId) => {
    // Unlock old ticket if there was one
    if (activeTicketId && activeTicketId !== ticketId) {
      unlockTicket(activeTicketId);
    }

    setActiveTicketId(ticketId);
    if (ticketId) {
      lockTicket(ticketId);
      fetchMessages(ticketId);
    } else {
      setActiveMessages([]);
    }
  }, [activeTicketId, lockTicket, unlockTicket, fetchMessages]);

  // Send a message
  const sendMessage = useCallback(async (ticketId, content) => {
    try {
      const newMessage = await api.createTicketMessage(ticketId, {
        senderType: 'Agent',
        senderId: currentAgent.name,
        content
      });
      setActiveMessages((prev) => {
        if (prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentAgent]);

  // Resolve a ticket
  const resolveTicket = useCallback(async (ticketId) => {
    try {
      await api.resolveTicket(ticketId);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: 'Resolved', lockedBy: null } : t))
      );
      if (activeTicketId === ticketId) {
        setActiveTicketId(null);
        setActiveMessages([]);
      }
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
    }
  }, [activeTicketId]);

  // Generate Mock Ticket helper
  const generateMockTicket = useCallback(async () => {
    const mockTickets = [
      {
        title: "Database connection timeout in production",
        description: "Getting connection timeout error (MongooseServerSelectionError) when trying to write to the main MongoDB cluster from backend server. Need immediate resolution as users are unable to login.",
        customerId: "client-developer@company.com"
      },
      {
        title: "Urgent: Billing issue - charged twice",
        description: "My subscription was renewed today but my credit card shows two identical pending charges of $49.00. Please refund the duplicate transaction.",
        customerId: "premium-user@gmail.com"
      },
      {
        title: "API endpoint returning 500 error",
        description: "The GET /api/v1/products endpoint is crashing when pagination parameter `page=3` is passed. Seems to be an offset out of bounds bug. Low priority.",
        customerId: "dev-team-lead@partner.io"
      },
      {
        title: "Reset password link not received",
        description: "I clicked 'forgot password' three times in the last hour but I have not received any password reset email in my inbox or spam folder.",
        customerId: "unhappy-customer@yahoo.com"
      }
    ];

    const randomMock = mockTickets[Math.floor(Math.random() * mockTickets.length)];

    try {
      await api.createTicket(randomMock);
      console.log('Mock ticket generated successfully');
    } catch (error) {
      console.error('Failed to generate mock ticket:', error);
    }
  }, []);

  const activeTicket = tickets.find((t) => t._id === activeTicketId) || null;

  return (
    <SocketContext.Provider
      value={{
        tickets,
        activeTicketId,
        activeTicket,
        activeMessages,
        currentAgent,
        setCurrentAgent,
        lockTicket,
        unlockTicket,
        selectTicket,
        sendMessage,
        resolveTicket,
        generateMockTicket,
        fetchTickets
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
