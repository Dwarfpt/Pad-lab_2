import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
}

// Mock data storage (replace with database in production)
let tickets: SupportTicket[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Иван Петров',
    userEmail: 'ivan@example.com',
    subject: 'Проблема с оплатой',
    message: 'Не могу оплатить бронирование картой. Выдает ошибку при попытке оплаты.',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Мария Сидорова',
    userEmail: 'maria@example.com',
    subject: 'Вопрос по тарифам',
    message: 'Какие скидки доступны для постоянных клиентов?',
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    adminResponse: 'Рассматриваем ваш вопрос...',
    adminName: 'Админ Иванов',
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Петр Козлов',
    userEmail: 'petr@example.com',
    subject: 'Ошибка в приложении',
    message: 'Приложение зависает при попытке найти свободное место.',
    status: 'closed',
    priority: 'low',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    adminResponse: 'Проблема исправлена в новой версии приложения.',
    adminName: 'Админ Петров',
  }
];

let messages: ChatMessage[] = [
  {
    id: '1',
    ticketId: '1',
    senderId: 'user1',
    senderName: 'Иван Петров',
    senderType: 'user',
    message: 'Не могу оплатить бронирование картой. Выдает ошибку при попытке оплаты.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    ticketId: '1',
    senderId: 'admin1',
    senderName: 'Админ Иванов',
    senderType: 'admin',
    message: 'Здравствуйте! Мы получили ваше сообщение. Какую ошибку точно показывает система?',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    ticketId: '1',
    senderId: 'user1',
    senderName: 'Иван Петров',
    senderType: 'user',
    message: 'Пишет "Ошибка обработки платежа. Попробуйте позже."',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '4',
    ticketId: '2',
    senderId: 'user2',
    senderName: 'Мария Сидорова',
    senderType: 'user',
    message: 'Какие скидки доступны для постоянных клиентов?',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  }
];

// Get all support tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query;
    
    let filteredTickets = tickets;
    
    // Filter by status
    if (status && status !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    
    // Filter by priority
    if (priority && priority !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.userName.toLowerCase().includes(searchTerm) ||
        ticket.userEmail.toLowerCase().includes(searchTerm) ||
        ticket.message.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json({ tickets: filteredTickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Ошибка получения обращений' });
  }
};

// Get ticket by ID
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = tickets.find(t => t.id === id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Обращение не найдено' });
    }
    
    res.json({ ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Ошибка получения обращения' });
  }
};

// Update ticket status
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Неверные данные', errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    const adminUser = (req as any).user;
    
    const ticketIndex = tickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ message: 'Обращение не найдено' });
    }
    
    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      status,
      updatedAt: new Date(),
      adminId: adminUser.id,
      adminName: `${adminUser.firstName} ${adminUser.lastName}`
    };
    
    res.json({ 
      message: 'Статус обращения обновлен',
      ticket: tickets[ticketIndex]
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Ошибка обновления статуса' });
  }
};

// Get messages for a ticket
export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    
    const ticketMessages = messages
      .filter(msg => msg.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    res.json({ messages: ticketMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Ошибка получения сообщений' });
  }
};

// Send message to ticket
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Неверные данные', errors: errors.array() });
    }
    
    const { ticketId } = req.params;
    const { message } = req.body;
    const adminUser = (req as any).user;
    
    // Check if ticket exists
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Обращение не найдено' });
    }
    
    // Create new message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      ticketId,
      senderId: adminUser.id,
      senderName: `${adminUser.firstName} ${adminUser.lastName}`,
      senderType: 'admin',
      message: message.trim(),
      createdAt: new Date()
    };
    
    messages.push(newMessage);
    
    // Update ticket status to in_progress if it was open
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (tickets[ticketIndex].status === 'open') {
      tickets[ticketIndex] = {
        ...tickets[ticketIndex],
        status: 'in_progress',
        updatedAt: new Date(),
        adminId: adminUser.id,
        adminName: `${adminUser.firstName} ${adminUser.lastName}`
      };
    }
    
    res.json({ 
      message: 'Сообщение отправлено',
      chatMessage: newMessage,
      ticket: tickets[ticketIndex]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Ошибка отправки сообщения' });
  }
};

// Create new support ticket (for users)
export const createTicket = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Неверные данные', errors: errors.array() });
    }
    
    const { subject, message, priority = 'medium' } = req.body;
    const user = (req as any).user;
    
    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tickets.push(newTicket);
    
    // Create initial message
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      ticketId: newTicket.id,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderType: 'user',
      message: message.trim(),
      createdAt: new Date()
    };
    
    messages.push(initialMessage);
    
    res.status(201).json({ 
      message: 'Обращение создано',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Ошибка создания обращения' });
  }
};

// Get user's own tickets
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const userTickets = tickets
      .filter(ticket => ticket.userId === user.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json({ tickets: userTickets });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Ошибка получения обращений' });
  }
};

// Get support statistics for admin dashboard
export const getSupportStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
      closedTickets: tickets.filter(t => t.status === 'closed').length,
      highPriorityTickets: tickets.filter(t => t.priority === 'high').length,
      avgResponseTime: '2.5 часа', // Mock data
      customerSatisfaction: '4.8/5', // Mock data
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({ message: 'Ошибка получения статистики' });
  }
};