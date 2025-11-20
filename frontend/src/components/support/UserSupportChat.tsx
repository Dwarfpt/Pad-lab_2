import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import { MessageCircle, Plus, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supportAPI, SupportTicket, ChatMessage } from '../../services/supportAPI';

const UserSupportChat: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  // Fetch user's tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['user', 'support-tickets'],
    queryFn: () => supportAPI.getUserTickets(),
  });

  // Fetch messages for selected ticket
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['user', 'chat-messages', selectedTicket],
    queryFn: () => supportAPI.getUserTicketMessages(selectedTicket!),
    enabled: !!selectedTicket
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: (data: { subject: string; message: string; priority: string }) => 
      supportAPI.createTicket(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'support-tickets'] });
      setShowCreateForm(false);
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      setSelectedTicket(data.id);
      toast.success('Обращение создано');
    },
    onError: () => {
      toast.error('Ошибка создания обращения');
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) => 
      supportAPI.sendUserMessage(ticketId, message),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['user', 'chat-messages', selectedTicket] });
      queryClient.invalidateQueries({ queryKey: ['user', 'support-tickets'] });
      toast.success('Сообщение отправлено');
    },
    onError: () => {
      toast.error('Ошибка отправки сообщения');
    }
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    createTicketMutation.mutate(newTicket);
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !message.trim()) return;
    
    sendMessageMutation.mutate({
      ticketId: selectedTicket,
      message: message.trim()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Поддержка</h2>
          <p className="text-gray-600">Обращения в службу поддержки</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Новое обращение
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Создать обращение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема обращения
              </label>
              <Input
                placeholder="Кратко опишите проблему"
                value={newTicket.subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewTicket({ ...newTicket, subject: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание проблемы
              </label>
              <Textarea
                placeholder="Подробно опишите проблему"
                value={newTicket.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setNewTicket({ ...newTicket, message: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateTicket}
                disabled={createTicketMutation.isPending}
              >
                Отправить
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Мои обращения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>У вас пока нет обращений</p>
                </div>
              ) : (
                tickets.map((ticket: SupportTicket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedTicket === ticket.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status === 'open' ? 'Открыт' :
                           ticket.status === 'in_progress' ? 'В работе' : 'Закрыт'}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority === 'high' ? 'Высокий' :
                           ticket.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{ticket.subject}</h4>
                    <p className="text-xs text-gray-500">{formatTime(ticket.createdAt)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-[500px] flex flex-col">
              <CardHeader className="border-b">
                <div>
                  <CardTitle className="text-lg">
                    {tickets.find(t => t.id === selectedTicket)?.subject}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <Badge className={`text-xs ${getStatusColor(tickets.find(t => t.id === selectedTicket)?.status || '')}`}>
                      {(() => {
                        const status = tickets.find(t => t.id === selectedTicket)?.status;
                        return status === 'open' ? 'Открыт' :
                               status === 'in_progress' ? 'В работе' : 'Закрыт';
                      })()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.senderType === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {msg.senderName}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {tickets.find(t => t.id === selectedTicket)?.status !== 'closed' && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Введите сообщение..."
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      className="flex-1 min-h-[60px]"
                      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                <p>Выберите обращение для просмотра переписки</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSupportChat;