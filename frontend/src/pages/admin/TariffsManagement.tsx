
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { tariffService } from '../../services/tariffService';

interface TariffForm {
  name: string;
  description: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  price: number;
  duration: number;
  currency: string;
  features: string;
}

export default function TariffsManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<any>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TariffForm>();

  const { data: tariffsData, isLoading } = useQuery({
    queryKey: ['tariffs'],
    queryFn: tariffService.getAllTariffs,
  });

  const createMutation = useMutation({
    mutationFn: tariffService.createTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      toast.success('Тариф создан успешно');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Ошибка создания тарифа');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tariffService.updateTariff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      toast.success('Тариф обновлён успешно');
      setIsModalOpen(false);
      setEditingTariff(null);
      reset();
    },
    onError: () => {
      toast.error('Ошибка обновления тарифа');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tariffService.deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      toast.success('Тариф удалён успешно');
    },
    onError: () => {
      toast.error('Ошибка удаления тарифа');
    },
  });

  const tariffs = tariffsData?.tariffs || [];

  const onSubmit = (data: TariffForm) => {
    const tariffData = {
      name: data.name,
      description: data.description,
      type: data.type,
      price: Number(data.price),
      duration: Number(data.duration),
      currency: data.currency || 'MDL',
      features: data.features ? data.features.split(',').map(f => f.trim()) : [],
    };

    if (editingTariff) {
      updateMutation.mutate({ id: editingTariff._id, data: tariffData });
    } else {
      createMutation.mutate(tariffData);
    }
  };

  const handleEdit = (tariff: any) => {
    setEditingTariff(tariff);
    reset({
      name: tariff.name,
      description: tariff.description,
      type: tariff.type,
      price: tariff.price,
      duration: tariff.duration,
      currency: tariff.currency || 'MDL',
      features: Array.isArray(tariff.features) ? tariff.features.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление тарифами</h1>
          <p className="text-gray-600 mt-1">Управление ценовыми планами и подписками</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTariff(null);
            reset({
              name: '',
              description: '',
              type: 'hourly',
              price: 0,
              duration: 60,
              currency: 'MDL',
              features: '',
            });
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Добавить тариф
        </Button>
      </div>

      {/* Tariffs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Загрузка...</div>
        ) : tariffs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Нет тарифов. Создайте первый тариф!
          </div>
        ) : (
          tariffs.map((tariff: any) => (
            <Card key={tariff._id} hover className="relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleEdit(tariff)}
                  className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
                >
                  <Edit size={16} className="text-gray-700" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Удалить этот тариф?')) {
                      deleteMutation.mutate(tariff._id);
                    }
                  }}
                  className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>

            <div className="text-center pt-8 pb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-primary-600" size={32} />
              </div>
              <CardTitle className="mb-2">{tariff.name}</CardTitle>
              <p className="text-sm text-gray-600 mb-4">{tariff.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary-600">
                  {tariff.price}
                </span>
                <span className="text-gray-600 ml-2">{tariff.currency || 'MDL'}</span>
              </div>
            </div>

            <CardContent>
              <ul className="space-y-2 mb-4">
                {Array.isArray(tariff.features) &&
                  tariff.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
              </ul>

              <div className="pt-4 border-t">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    tariff.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {tariff.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingTariff ? 'Редактировать тариф' : 'Добавить новый тариф'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTariff(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <Input
                label="Название тарифа"
                placeholder="Месячный абонемент"
                error={errors.name?.message}
                {...register('name', { required: 'Название обязательно' })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  rows={3}
                  placeholder="Опишите тариф..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('description', { required: 'Описание обязательно' })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('type', { required: 'Тип обязателен' })}
                  >
                    <option value="hourly">Почасовой</option>
                    <option value="daily">Дневной</option>
                    <option value="weekly">Недельный</option>
                    <option value="monthly">Месячный</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <Input
                  label="Цена"
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  error={errors.price?.message}
                  {...register('price', {
                    required: 'Цена обязательна',
                    min: { value: 0, message: 'Должно быть положительным' },
                  })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('currency')}
                  >
                    <option value="MDL">MDL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <Input
                label="Длительность (минут)"
                type="number"
                placeholder="60"
                error={errors.duration?.message}
                {...register('duration', {
                  required: 'Длительность обязательна',
                  min: { value: 1, message: 'Минимум 1 минута' },
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Особенности (через запятую)
                </label>
                <textarea
                  rows={4}
                  placeholder="Особенность 1, Особенность 2, Особенность 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('features')}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTariff(null);
                    reset();
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  {editingTariff ? 'Обновить' : 'Создать'} тариф
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
