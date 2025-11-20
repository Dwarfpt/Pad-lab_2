import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Calendar, Clock, MapPin, CreditCard, Settings, History, 
  Wallet, MessageCircle, QrCode, Phone, Mail, Lock, Bell, 
  Trash2, Edit2, Eye, EyeOff, Plus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../services/api';
import BalanceCard from '../../components/balance/BalanceCard';
import UserSupportChat from '../../components/support/UserSupportChat';
import { bookingService } from '../../services/bookingService';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = usePriceFormatter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('bookings');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);

  // Обработка URL параметров для переключения вкладок
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['bookings', 'operations', 'settings', 'balance', 'support'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Показываем загрузку пока authStore не инициализирован
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем форму входа
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Профиль пользователя</h1>
          <p className="text-gray-600 text-center mb-4">
            Для доступа к профилю необходимо войти в систему
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Войти в систему
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/register')}
              className="w-full"
            >
              Регистрация
            </Button>
            <div className="text-center text-gray-500 text-sm mt-4">или</div>
            <Button 
              variant="secondary"
              onClick={() => {
                // Создаем демо пользователя локально
                const demoUser = {
                  id: 'demo-user',
                  email: 'demo@example.com',
                  firstName: 'Демо',
                  lastName: 'Пользователь',
                  role: 'user' as const,
                  language: 'ru' as const,
                  balance: {
                    MDL: 150,
                    USD: 8,
                    EUR: 7
                  },
                  preferredCurrency: 'MDL' as const
                };
                
                useAuthStore.getState().setAuth(demoUser, 'demo-token');
                toast.success('Вход в demo режим успешен!');
                // Принудительная перезагрузка для обновления всех компонентов
                window.location.reload();
              }}
              className="w-full"
            >
              🚀 Demo режим (без регистрации)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch user's bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    enabled: !!user, // Выполнять запрос только если пользователь авторизован
    staleTime: 0, // Всегда перезагружать данные
    queryFn: async () => {
      // Только для специальных демо пользователей показываем демо данные
      if (user?.email === 'demo@example.com' || user?.firstName === 'Демо') {
      const demoBookings = [
          {
            _id: 'demo-booking-1',
            parking: {
              name: 'Центральная Парковка A',
              address: 'ул. Центральная, 1'
            },
            spot: 'A-15',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 часа
            totalPrice: 10,
            status: 'active'
          },
          {
            _id: 'demo-booking-2',
            parking: {
              name: 'Парковка у ТЦ', 
              address: 'ул. Торговая, 5'
            },
            spot: 'B-03',
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // вчера
            endTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // вчера +2 часа
            totalPrice: 15,
            status: 'completed'
          }
        ];
        return demoBookings;
      }
      
      // Для обычных пользователей загружаем реальные данные из API
      try {
        const response = await api.get('/bookings/my-bookings');
        return response.data.bookings || [];
      } catch (error) {
        console.error('Ошибка загрузки бронирований:', error);
        return [];
      }
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success(t('profile.bookingCancelled', 'Booking cancelled successfully'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm(t('profile.confirmCancel'))) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  // Убеждаемся что bookings - это массив
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  // Fetch operations history - ВСЕ операции пользователя
  const { data: operations = [], isLoading: operationsLoading } = useQuery({
    queryKey: ['user-operations', user?.id],
    enabled: !!user, // Выполнять запрос только если пользователь авторизован
    staleTime: 0, // Всегда перезагружать данные
    queryFn: async () => {
      console.log('Fetching operations for user:', user?.id);
      console.log('User object:', user);
      
      try {
        // Сначала пытаемся загрузить реальные транзакции
        const response = await api.get('/balance/transactions');
        console.log('Real transactions loaded:', response.data);
        
        // Преобразуем формат данных для совместимости
        const transactions = response.data.transactions || [];
        return transactions.map((tx: any) => {
          // Определяем знак операции
          let amount = tx.amount;
          if (['withdrawal', 'payment', 'penalty'].includes(tx.type)) {
            amount = -Math.abs(tx.amount);
          } else if (['deposit', 'refund', 'bonus'].includes(tx.type)) {
            amount = Math.abs(tx.amount);
          }

          return {
            id: tx._id,
            type: tx.type,
            description: tx.description,
            amount: amount,
            currency: tx.currency,
            timestamp: tx.createdAt,
            status: tx.status
          };
        });
      } catch (error) {
        console.log('Failed to load real transactions, falling back to demo data for demo users');
        
        // Только для специальных демо пользователей показываем демо данные
        if (user?.email === 'demo@example.com' || user?.firstName === 'Демо') {
        const demoOperations = [
          {
            id: 'op-1',
            type: 'payment',
            description: 'Пополнение баланса через карту',
            amount: 200,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'op-2',
            type: 'tariff',
            description: 'Покупка тарифа "Премиум" на месяц',
            amount: -50,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'op-3',
            type: 'booking',
            description: 'Бронирование места B-03 (завершено)',
            amount: -15,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'op-4',
            type: 'payment',
            description: 'Пополнение через терминал',
            amount: 100,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'op-5', 
            type: 'booking',
            description: 'Бронирование места A-15 (активное)',
            amount: -10,
            currency: 'MDL', 
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          {
            id: 'op-6',
            type: 'refund',
            description: 'Возврат за отмену бронирования C-22',
            amount: 12,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
            status: 'completed'
          },
          {
            id: 'op-7',
            type: 'penalty',
            description: 'Штраф за превышение времени',
            amount: -25,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          },
          {
            id: 'op-8',
            type: 'bonus',
            description: 'Бонус за регулярное использование',
            amount: 20,
            currency: 'MDL',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ];
        console.log('Returning demo operations:', demoOperations);
        return demoOperations;
      }
      
      // Для обычных пользователей возвращаем пустой массив если API недоступен
      console.log('No transactions available for regular user');
      return [];
      }
    },
  });

  // Tab configuration
  const tabs = [
    { id: 'bookings', name: t('profile.tabs.bookings', 'Бронирования'), icon: Calendar },
    { id: 'operations', name: t('profile.tabs.operations', 'История операций'), icon: History },
    { id: 'settings', name: t('profile.tabs.settings', 'Настройки'), icon: Settings },
    { id: 'balance', name: t('profile.tabs.balance', 'Баланс'), icon: Wallet },
    { id: 'support', name: t('profile.tabs.support', 'Поддержка'), icon: MessageCircle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Активные</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookingsArray.filter((b: any) => b.status === 'active').length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Всего</p>
                    <p className="text-2xl font-bold text-gray-900">{bookingsArray.length}</p>
                  </div>
                </CardContent>
              </Card>


            </div>

            {/* Bookings List */}
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Мои бронирования
                </h3>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка...</p>
                  </div>
                ) : bookingsArray.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Нет бронирований
                    </h3>
                    <p className="text-gray-500 mb-4">
                      У вас пока нет активных или завершенных бронирований
                    </p>
                    <Button variant="primary" onClick={() => navigate('/parking-slots')}>
                      Забронировать место
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingsArray.map((booking: any) => (
                      <div
                        key={booking._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {booking.parking?.name || 'N/A'}
                            </h3>
                            <p className="text-gray-600">
                              Место: {booking.spot || 'N/A'}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status === 'active' ? 'Активно' :
                             booking.status === 'completed' ? 'Завершено' : 'Отменено'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <p className="font-medium">Начало:</p>
                            <p>{new Date(booking.startTime).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Окончание:</p>
                            <p>{new Date(booking.endTime).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-xl font-bold text-primary-600">
                            {formatPrice(booking.totalPrice)}
                          </span>
                          {booking.status === 'active' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              Отменить
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'operations':
        return (
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <History className="mr-2" size={20} />
                История операций
              </h3>
              
              <div className="space-y-4">
                {operationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка операций...</p>
                  </div>
                ) : operations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Нет операций
                    </h3>
                    <p className="text-gray-500">
                      История ваших операций появится здесь
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Debug: operations array length = {operations.length}, user = {user?.id}
                    </p>
                  </div>
                ) : (
                  operations.map((operation: any) => (
                    <div
                      key={operation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            operation.type === 'payment' ? 'bg-green-100' :
                            operation.type === 'booking' ? 'bg-blue-100' :
                            operation.type === 'refund' ? 'bg-orange-100' :
                            operation.type === 'tariff' ? 'bg-purple-100' :
                            operation.type === 'penalty' ? 'bg-red-100' :
                            operation.type === 'bonus' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            {operation.type === 'payment' && <Plus size={16} className="text-green-600" />}
                            {operation.type === 'booking' && <Calendar size={16} className="text-blue-600" />}
                            {operation.type === 'refund' && <History size={16} className="text-orange-600" />}
                            {operation.type === 'tariff' && <Settings size={16} className="text-purple-600" />}
                            {operation.type === 'penalty' && <CreditCard size={16} className="text-red-600" />}
                            {operation.type === 'bonus' && <Wallet size={16} className="text-yellow-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{operation.description}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(operation.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            operation.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {operation.amount > 0 ? '+' : ''}{formatPrice(Math.abs(operation.amount))}
                          </p>
                          <p className={`text-sm px-2 py-1 rounded ${
                            operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            operation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            operation.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {operation.status === 'completed' ? 'Завершено' :
                             operation.status === 'pending' ? 'В обработке' :
                             operation.status === 'active' ? 'Активно' : 'Отклонено'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Profile Avatar */}
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Фото профиля
                </h3>
                
                <div className="flex items-center space-x-6">
                  {/* Current Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Аватар" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-blue-600" />
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">Загрузить новое фото</p>
                      <p className="text-sm text-gray-500">JPG, PNG или GIF. Максимум 5MB.</p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Создаем URL для превью
                            const imageUrl = URL.createObjectURL(file);
                            // Обновляем аватар пользователя
                            useAuthStore.getState().updateUser({ avatar: imageUrl });
                            toast.success('Фото профиля обновлено!');
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        Выбрать файл
                      </Button>
                      {user?.avatar && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            useAuthStore.getState().updateUser({ avatar: undefined });
                            toast.success('Фото профиля удалено');
                          }}
                        >
                          Удалить фото
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Данные профиля
                </h3>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-gray-500" />
                      <div>
                        <p className="font-medium">Имя</p>
                        <p className="text-gray-600">{user?.firstName} {user?.lastName}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} className="mr-1" />
                      Изменить
                    </Button>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-gray-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} className="mr-1" />
                      Изменить
                    </Button>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone size={20} className="text-gray-500" />
                      <div>
                        <p className="font-medium">Телефон</p>
                        <p className="text-gray-600">{user?.phone || 'Не указан'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} className="mr-1" />
                      {user?.phone ? 'Изменить' : 'Добавить'}
                    </Button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock size={20} className="text-gray-500" />
                      <div>
                        <p className="font-medium">Пароль</p>
                        <p className="text-gray-600">••••••••</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                      <Edit2 size={16} className="mr-1" />
                      Изменить
                    </Button>
                  </div>

                  {showPasswordForm && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Текущий пароль
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Новый пароль
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Подтвердите пароль
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">Сохранить</Button>
                        <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(false)}>
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Bell className="mr-2" size={20} />
                  Уведомления
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email уведомления</p>
                      <p className="text-sm text-gray-600">Получать уведомления о бронированиях на email</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS уведомления</p>
                      <p className="text-sm text-gray-600">Получать SMS о статусе бронирований</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push уведомления</p>
                      <p className="text-sm text-gray-600">Получать push уведомления в браузере</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Lock className="mr-2" size={20} />
                  Приватность
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Показывать историю бронирований</p>
                      <p className="text-sm text-gray-600">Другие пользователи могут видеть вашу активность</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Аналитика использования</p>
                      <p className="text-sm text-gray-600">Помочь улучшить сервис, передавая анонимные данные</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-6">
            <BalanceCard showActions={true} />
            
            {/* Balance History */}
            <Card>
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <History className="mr-2" size={20} />
                  История баланса
                </h3>
                
                <div className="space-y-4">
                  {operationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Загрузка истории баланса...</p>
                    </div>
                  ) : operations.filter((op: any) => op.type === 'payment' || op.type === 'refund' || op.type === 'bonus').length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Нет операций пополнения баланса</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Debug: операций всего = {operations.length}, пользователь = {user?.id}
                      </p>
                    </div>
                  ) : (
                    operations.filter((op: any) => op.type === 'payment' || op.type === 'refund' || op.type === 'bonus').map((operation: any) => (
                      <div
                        key={operation.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            operation.type === 'payment' ? 'bg-green-100' : 
                            operation.type === 'refund' ? 'bg-orange-100' :
                            operation.type === 'bonus' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            {operation.type === 'payment' ? 
                              <Plus size={16} className="text-green-600" /> :
                              operation.type === 'refund' ? 
                              <History size={16} className="text-orange-600" /> :
                              operation.type === 'bonus' ?
                              <Wallet size={16} className="text-yellow-600" /> :
                              <Wallet size={16} className="text-gray-600" />
                            }
                          </div>
                          <div>
                            <h4 className="font-medium">{operation.description}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(operation.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className={`text-lg font-semibold ${
                          operation.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {operation.amount > 0 ? '+' : ''}{formatPrice(Math.abs(operation.amount))}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'support':
        return (
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MessageCircle className="mr-2" size={20} />
                Поддержка
              </h3>
              
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="p-6 h-auto">
                    <div className="text-center">
                      <Phone className="mx-auto mb-2" size={24} />
                      <p className="font-medium">Позвонить</p>
                      <p className="text-sm text-gray-600">+373 60 123 456</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="p-6 h-auto">
                    <div className="text-center">
                      <Mail className="mx-auto mb-2" size={24} />
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">support@smartparking.md</p>
                    </div>
                  </Button>
                </div>

                {/* Chat */}
                <div className="h-96 overflow-y-auto border rounded-lg">
                  <UserSupportChat />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Аватар" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">
                Член с {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowQR(user?.id || '')}
          >
            <QrCode size={16} className="mr-2" />
            QR Code
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchParams({ tab: tab.id });
                    }}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent size={16} className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* QR Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">QR Code профиля</h3>
                <div className="flex justify-center mb-4">
                  <QRCode value={showQR} size={200} />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Покажите этот код для быстрой идентификации
                </p>
                <Button onClick={() => setShowQR(null)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}