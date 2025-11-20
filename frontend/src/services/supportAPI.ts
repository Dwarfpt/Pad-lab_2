import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  adminId?: string;
  adminName?: string;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
  highPriorityTickets: number;
  avgResponseTime: string;
  customerSatisfaction: string;
}

// Admin API functions
export const supportAPI = {
  // Admin functions
  async getAllTickets(params?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<SupportTicket[]> {
    const response = await api.get('/support/admin/tickets', { params });
    return response.data.tickets;
  },

  async getTicketById(id: string): Promise<SupportTicket> {
    const response = await api.get(`/support/admin/tickets/${id}`);
    return response.data.ticket;
  },

  async updateTicketStatus(id: string, status: string): Promise<SupportTicket> {
    const response = await api.put(`/support/admin/tickets/${id}/status`, { status });
    return response.data.ticket;
  },

  async getTicketMessages(ticketId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/support/admin/tickets/${ticketId}/messages`);
    return response.data.messages;
  },

  async sendAdminMessage(ticketId: string, message: string): Promise<ChatMessage> {
    const response = await api.post(`/support/admin/tickets/${ticketId}/messages`, { message });
    return response.data.chatMessage;
  },

  async getSupportStats(): Promise<SupportStats> {
    const response = await api.get('/support/admin/stats');
    return response.data.stats;
  },

  // User functions
  async createTicket(data: {
    subject: string;
    message: string;
    priority?: string;
  }): Promise<SupportTicket> {
    const response = await api.post('/support/tickets', data);
    return response.data.ticket;
  },

  async getUserTickets(): Promise<SupportTicket[]> {
    const response = await api.get('/support/tickets');
    return response.data.tickets;
  },

  async getUserTicketMessages(ticketId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/support/tickets/${ticketId}/messages`);
    return response.data.messages;
  },

  async sendUserMessage(ticketId: string, message: string): Promise<ChatMessage> {
    const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data.chatMessage;
  },
};

export default supportAPI;