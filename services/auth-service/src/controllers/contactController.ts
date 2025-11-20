import { Request, Response, NextFunction } from 'express';
import SupportChat from '../models/SupportChat';
import { sendEmail } from '../services/emailService';

export const createSupportMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = (req as any).user?.id;
    const user = (req as any).user;

    // Если пользователь авторизован, используем его данные
    const userName = name || (user ? `${user.firstName} ${user.lastName}` : 'Гость');
    const userEmail = email || (user ? user.email : '');

    if (!subject || !message) {
      return res.status(400).json({ message: 'Тема и сообщение обязательны для заполнения' });
    }

    // Создаем новое сообщение поддержки
    const supportChat = await SupportChat.create({
      userId: userId || undefined,
      userName,
      userEmail,
      subject,
      message,
      messages: [
        {
          sender: 'user',
          message,
          timestamp: new Date(),
        },
      ],
    });

    // Отправляем email уведомление администратору
    try {
      const adminEmailHtml = `
        <h2>Новое сообщение в поддержку</h2>
        <p><strong>От:</strong> ${name} (${email})</p>
        <p><strong>Тема:</strong> ${subject}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Перейдите в админ-панель для ответа на сообщение.</p>
      `;

      await sendEmail(process.env.ADMIN_EMAIL || 'admin@smartparking.com', `Новое сообщение: ${subject}`, adminEmailHtml);
    } catch (emailError) {
      console.error('Ошибка отправки email администратору:', emailError);
      // Не прерываем выполнение, если email не отправился
    }

    res.status(201).json({
      message: 'Сообщение отправлено успешно. Мы свяжемся с вами в ближайшее время.',
      supportChat,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSupportChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userEmail = req.query.email as string;

    if (!userId && !userEmail) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const filter: any = {};
    if (userId) {
      filter.userId = userId;
    } else if (userEmail) {
      filter.userEmail = userEmail;
    }

    const chats = await SupportChat.find(filter)
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    next(error);
  }
};

export const getSupportChatById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const chat = await SupportChat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

export const addMessageToChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;

    if (!message || !sender) {
      return res.status(400).json({ message: 'Сообщение и отправитель обязательны' });
    }

    const chat = await SupportChat.findById(id);

    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Добавляем новое сообщение
    chat.messages.push({
      sender,
      message,
      timestamp: new Date(),
    });

    chat.updatedAt = new Date();

    // Если сообщение от поддержки, меняем статус на in-progress
    if (sender === 'support' && chat.status === 'open') {
      chat.status = 'in-progress';
    }

    await chat.save();

    res.json({
      message: 'Сообщение добавлено',
      chat,
    });
  } catch (error) {
    next(error);
  }
};

// Admin functions
export const getAllSupportChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const chats = await SupportChat.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    next(error);
  }
};

export const updateChatStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in-progress', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Неверный статус' });
    }

    const chat = await SupportChat.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    res.json({ message: 'Статус обновлен', chat });
  } catch (error) {
    next(error);
  }
};