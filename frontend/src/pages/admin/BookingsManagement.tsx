import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, User, Filter, X, Check, Ban } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  parkingId: {
    name: string;
    address: string;
  };
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
}

export default function BookingsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/bookings/admin/all${params}`);
      return response.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Бронирование отменено');
    },
    onError: () => {
      toast.error('Ошибка при отмене бронирования');
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.patch(`/bookings/${bookingId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Бронирование завершено');
    },
    onError: () => {
      toast.error('Ошибка при завершении бронирования');
    },
  });

  const bookings: Booking[] = bookingsData?.bookings || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активное';
      case 'pending':
        return 'Ожидает';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Оплачено';
      case 'pending':
        return 'Ожидает оплаты';
      case 'refunded':
        return 'Возврат';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => b.status === 'active').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    revenue: bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Управление бронированиями</h1>
        <p className="text-gray-600 mt-2">Просмотр и управление всеми бронированиями</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">Всего</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">Активные</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">Завершенные</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">Отмененные</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">Выручка</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.revenue} ₽</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">Фильтр по статусу:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Активные
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Завершенные
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Отмененные
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking._id}>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.parkingId?.name || 'Парковка не указана'}
                        </h3>
                        <p className="text-sm text-gray-600">Место: {booking.slotId || 'Не указано'}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {getPaymentStatusText(booking.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <div>
                          <p className="font-medium">
                            {booking.userId?.firstName || 'Не указано'} {booking.userId?.lastName || ''}
                          </p>
                          <p className="text-xs">{booking.userId?.email || 'Не указан'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2" />
                        {booking.parkingId?.address || 'Адрес не указан'}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <div>
                          <p>С: {new Date(booking.startTime).toLocaleString('ru-RU')}</p>
                          <p>До: {new Date(booking.endTime).toLocaleString('ru-RU')}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        <div>
                          <p className="font-medium">Цена: {booking.totalPrice} ₽</p>
                          <p className="text-xs">Создано: {new Date(booking.createdAt).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'active' && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => completeMutation.mutate(booking._id)}
                          disabled={completeMutation.isPending}
                        >
                          <Check size={16} className="mr-1" />
                          Завершить
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => cancelMutation.mutate(booking._id)}
                          disabled={cancelMutation.isPending}
                        >
                          <Ban size={16} className="mr-1" />
                          Отменить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <X size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Бронирования не найдены</p>
              <p className="text-gray-500 text-sm mt-2">
                {statusFilter !== 'all'
                  ? `Нет бронирований со статусом "${getStatusText(statusFilter)}"`
                  : 'В системе пока нет бронирований'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
