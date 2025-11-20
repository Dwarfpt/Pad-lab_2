import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import { useCurrencyStore } from '../../store/currencyStore';
import { useAuthStore } from '../../store/authStore';

interface BalanceCardProps {
  showActions?: boolean;
}

export default function BalanceCard({ showActions = true }: BalanceCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { formatPrice } = usePriceFormatter();
  const { setExchangeRates } = useCurrencyStore();
  const { updateUser } = useAuthStore();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);

  // Получаем баланс
  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await api.get('/balance/balance');
      return res.data;
    },
    retry: 1,
    staleTime: 0 // Всегда перезагружать данные для актуальности
  });

  // Обновляем курсы валют и баланс в store при получении данных
  useEffect(() => {
    if (balanceData?.exchangeRates) {
      setExchangeRates(balanceData.exchangeRates);
    }
    
    // Обновляем баланс пользователя в authStore
    if (balanceData?.balances) {
      updateUser({ balance: balanceData.balances });
    }
  }, [balanceData, setExchangeRates, updateUser]);

  // Мутация для пополнения баланса
  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await api.post('/balance/top-up', { 
        amount,
        currency: 'MDL',
        paymentMethod: 'card'
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Обновляем кеш React Query
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['user-operations'] });
      
      // Обновляем баланс в authStore для немедленного отображения в Header
      if (data.balances) {
        updateUser({ balance: data.balances });
      }
      
      toast.success(t('balance.topUpSuccess', 'Баланс успешно пополнен!'));
      setShowTopUpModal(false);
      setTopUpAmount(100);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('balance.topUpError', 'Ошибка пополнения баланса'));
    }
  });

  const handleTopUp = () => {
    if (topUpAmount < 10) {
      toast.error(t('balance.minAmount', 'Минимальная сумма пополнения: 10 MDL'));
      return;
    }
    topUpMutation.mutate(topUpAmount);
  };



  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="w-8 h-8" />
            <h3 className="text-xl font-bold">{t('balance.title', 'Баланс')}</h3>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-32 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-24"></div>
          </div>
        </div>
      </Card>
    );
  }

  const balance = balanceData?.balance || 0;
  const hasUsedFreeBooking = balanceData?.hasUsedFreeBooking || false;

  return (
    <>
      <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8" />
              <h3 className="text-xl font-bold">{t('balance.title', 'Баланс')}</h3>
            </div>
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTopUpModal(true)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('balance.topUp', 'Пополнить')}
              </Button>
            )}
          </div>

          <div className="mb-4">
            <div className="text-4xl font-bold mb-1">{formatPrice(balance)}</div>
            <div className="text-sm text-white/80">{t('balance.available', 'Доступно для использования')}</div>
          </div>

          {!hasUsedFreeBooking && (
            <div className="bg-white/20 rounded-lg p-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <div className="font-semibold">{t('balance.freeBooking', 'Бесплатное бронирование')}</div>
                <div className="text-sm text-white/80">{t('balance.firstHourFree', 'Первый час паркинга бесплатно')}</div>
              </div>
            </div>
          )}

          {showActions && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <a href="#transactions" className="flex items-center justify-between text-sm hover:text-white/80 transition">
                <span>{t('balance.viewTransactions', 'История транзакций')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{t('balance.topUpBalance', 'Пополнить баланс')}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('balance.amount', 'Сумма')} (MDL)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount)}
                  className={`py-2 px-3 rounded-lg border-2 transition ${
                    topUpAmount === amount
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('balance.amount', 'Сумма')}:</span>
                <span className="font-semibold">{formatPrice(topUpAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('balance.commission', 'Комиссия')}:</span>
                <span className="font-semibold">0 MDL</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">{t('balance.total', 'Итого')}:</span>
                  <span className="font-bold text-lg text-primary-600">{formatPrice(topUpAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleTopUp}
                disabled={topUpMutation.isPending}
                className="flex-1"
              >
                {topUpMutation.isPending ? t('balance.processing', 'Обработка...') : t('balance.pay', 'Оплатить')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTopUpModal(false)}
                disabled={topUpMutation.isPending}
              >
                {t('common.cancel', 'Отмена')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
