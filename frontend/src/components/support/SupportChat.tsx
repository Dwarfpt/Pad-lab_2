import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: string;
  isRead: boolean;
}

interface SupportChat {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function SupportChatComponent() {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Получаем список чатов пользователя
  const { data: chatsData, isLoading } = useQuery({
    queryKey: ['support-chats'],
    queryFn: async () => {
      const response = await api.get('/contact');
      return response.data;
    },
    refetchInterval: 10000, // Обновляем каждые 10 секунд
  });

  const chats: SupportChat[] = chatsData?.chats || [];

  // Мутация для создания нового чата
  const createChatMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const response = await api.post('/contact', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-chats'] });
      toast.success('Обращение создано!');
      setShowNewChatForm(false);
      setSubject('');
      setMessage('');
    },
    onError: () => {
      toast.error('Ошибка при создании обращения');
    },
  });

  // Мутация для отправки сообщения в существующий чат
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const response = await api.post(`/contact/${chatId}/messages`, { 
        message,
        sender: 'user'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-chats'] });
      setMessage('');
      toast.success('Сообщение отправлено!');
    },
    onError: () => {
      toast.error('Ошибка при отправке сообщения');
    },
  });

  // Скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    createChatMutation.mutate({ subject, message });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !message.trim()) return;
    sendMessageMutation.mutate({ chatId: selectedChat._id, message });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Открыто';
      case 'in-progress':
        return 'В обработке';
      case 'resolved':
        return 'Решено';
      case 'closed':
        return 'Закрыто';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Кнопка создания нового чата */}
      {!showNewChatForm && !selectedChat && (
        <Button onClick={() => setShowNewChatForm(true)} className="mb-4">
          <MessageCircle size={20} className="mr-2" />
          Создать новое обращение
        </Button>
      )}

      {/* Форма создания нового чата */}
      {showNewChatForm && (
        <Card>
          <CardContent>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Новое обращение</h3>
            <form onSubmit={handleCreateChat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тема обращения
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Опишите проблему кратко"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                  placeholder="Опишите проблему подробно"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" disabled={createChatMutation.isPending}>
                  {createChatMutation.isPending ? 'Отправка...' : 'Отправить'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewChatForm(false);
                    setSubject('');
                    setMessage('');
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список чатов */}
      {!showNewChatForm && !selectedChat && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Ваши обращения</h3>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <Card
                key={chat._id}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => setSelectedChat(chat)}
              >
                <CardContent>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{chat.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                      {getStatusText(chat.status)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <MessageCircle size={16} className="mr-1" />
                      {chat.messages.length} сообщений
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {new Date(chat.updatedAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">У вас пока нет обращений</p>
                <p className="text-sm text-gray-500">Создайте новое обращение, если у вас есть вопросы</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Окно чата */}
      {selectedChat && (
        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedChat.subject}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedChat.status)} mt-2`}>
                  {getStatusText(selectedChat.status)}
                </span>
              </div>
              <Button variant="outline" onClick={() => setSelectedChat(null)}>
                Назад к списку
              </Button>
            </div>

            {/* Сообщения */}
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Форма отправки сообщения */}
            {selectedChat.status !== 'closed' && (
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Введите сообщение..."
                />
                <Button type="submit" disabled={sendMessageMutation.isPending || !message.trim()}>
                  <Send size={20} />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
