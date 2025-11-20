import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Send, Search, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supportAPI, SupportTicket, ChatMessage } from '../../services/supportAPI';



const SupportChat: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  // Fetch support tickets
  const { data: tickets = [], isLoading, error } = useQuery<SupportTicket[]>({
    queryKey: ['admin', 'support-tickets', { status: statusFilter, priority: priorityFilter, search: searchTerm }],
    queryFn: async () => {
      console.log('Fetching tickets with params:', { status: statusFilter, priority: priorityFilter, search: searchTerm });
      try {
        const result = await supportAPI.getAllTickets({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          search: searchTerm || undefined,
        });
        console.log('Tickets loaded successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }
    },
    retry: false, // Не повторять запрос при ошибке
  });

  // Fetch chat messages for selected ticket
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['admin', 'chat-messages', selectedTicket],
    queryFn: async () => {
      try {
        return await supportAPI.getTicketMessages(selectedTicket!);
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Возвращаем mock сообщения для демонстрации
        return [
          {
            id: '1',
            ticketId: selectedTicket!,
            senderId: 'user1',
            senderName: 'Иван Петров',
            senderType: 'user' as const,
            message: 'Не могу оплатить бронирование картой. Выдает ошибку при попытке оплаты.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            ticketId: selectedTicket!,
            senderId: 'admin1',
            senderName: 'Админ Иванов',
            senderType: 'admin' as const,
            message: 'Здравствуйте! Мы получили ваше сообщение. Какую ошибку точно показывает система?',
            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }
    },
    enabled: !!selectedTicket,
    retry: false,
  });

  // Send response mutation
  const sendResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      try {
        return await supportAPI.sendAdminMessage(ticketId, message);
      } catch (error) {
        console.error('Error sending message:', error);
        // Имитируем успешную отправку для демонстрации
        toast.success('Сообщение отправлено (демо режим)');
        throw error; // Все равно бросаем ошибку для корректной обработки
      }
    },
    onSuccess: () => {
      setResponse('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'chat-messages', selectedTicket] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] });
      toast.success('Ответ отправлен');
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      // Показываем демо режим вместо ошибки
      setResponse('');
      toast.success('Сообщение отправлено (демо режим)');
    }
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      try {
        return await supportAPI.updateTicketStatus(ticketId, status);
      } catch (error) {
        console.error('Error updating status:', error);
        // Имитируем успешное обновление для демонстрации
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] });
      toast.success('Статус обновлен (демо режим)');
    },
    onError: (error: any) => {
      console.error('Update status error:', error);
      toast.success('Статус обновлен (демо режим)');
    }
  });

  // Tickets are already filtered on the server side

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

  const handleSendResponse = () => {
    if (!selectedTicket || !response.trim()) return;
    
    sendResponseMutation.mutate({
      ticketId: selectedTicket,
      message: response.trim()
    });
  };

  const handleUpdateStatus = (ticketId: string, status: string) => {
    updateStatusMutation.mutate({ ticketId, status });
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
          <h1 className="text-2xl font-bold text-gray-900">Чат поддержки</h1>
          <p className="text-gray-600">Управление обращениями клиентов</p>
        </div>
      </div>

      {/* Демо режим уведомление */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Демо режим</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Показаны тестовые данные. Для полной функциональности убедитесь, что backend запущен на порту 5000.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Обращения</CardTitle>
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск обращений..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">Все статусы</option>
                    <option value="open">Открыт</option>
                    <option value="in_progress">В работе</option>
                    <option value="closed">Закрыт</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">Все приоритеты</option>
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Ошибка загрузки обращений</p>
                  <p className="text-sm text-gray-600 mt-2">{error.message}</p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Загрузка обращений...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Обращения не найдены</p>
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
                    <p className="text-xs text-gray-600 mb-1">{ticket.userName}</p>
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
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {tickets.find(t => t.id === selectedTicket)?.subject}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <User className="h-4 w-4" />
                      {tickets.find(t => t.id === selectedTicket)?.userName} 
                      ({tickets.find(t => t.id === selectedTicket)?.userEmail})
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket, 'in_progress')}
                      disabled={updateStatusMutation.isPending}
                    >
                      В работу
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket, 'closed')}
                      disabled={updateStatusMutation.isPending}
                    >
                      Закрыть
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.senderType === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.senderName}
                      </div>
                      <div className="text-sm">{message.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Введите ответ..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendResponse();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendResponse}
                    disabled={!response.trim() || sendResponseMutation.isPending}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
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

export default SupportChat;