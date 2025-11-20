import { useQuery } from '@tanstack/react-query';
import { Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { tariffService } from '../../services/tariffService';
import { useCartStore } from '../../store/cartStore';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import { useCurrencyStore } from '../../store/currencyStore';
import toast from 'react-hot-toast';

export default function Tariffs() {
  const { t } = useTranslation();
  const { formatPrice, preferredCurrency } = usePriceFormatter();
  const { addItem } = useCartStore();
  const { currency } = useCurrencyStore(); // Добавляем прямую зависимость для перерендера
  
  console.log('🎯 Tariffs render - Current currency:', preferredCurrency, 'Store currency:', currency);

  const { data: tariffsData, isLoading, error } = useQuery({
    queryKey: ['tariffs'],
    queryFn: async () => {
      console.log('🔄 Загружаем тарифы...');
      const result = await tariffService.getAllTariffs();
      console.log('✅ Тарифы получены:', result);
      return result;
    },
    retry: 1,
    retryDelay: 3000,
  });

  // Ensure tariffs is always an array - handle both formats
  const tariffs = Array.isArray(tariffsData?.tariffs) 
    ? tariffsData.tariffs 
    : Array.isArray(tariffsData) 
      ? tariffsData 
      : [];

  // Функция для получения локализованных данных тарифа
  const getLocalizedTariff = (tariff: any) => {
    const type = tariff.type?.toLowerCase() || 'hourly';
    
    const tariffMap: { [key: string]: string } = {
      'hourly': 'hourly',
      'daily': 'daily', 
      'weekly': 'weekly',
      'monthly': 'monthly',
    };
    
    const mappedType = tariffMap[type] || 'hourly';
    
    return {
      name: t(`tariff.plans.${mappedType}.name`),
      description: t(`tariff.plans.${mappedType}.description`),
      features: t(`tariff.plans.${mappedType}.features`, { returnObjects: true }) as string[] || []
    };
  };

  const handleAddToCart = (tariff: any) => {
    const localizedTariff = getLocalizedTariff(tariff);
    addItem({
      id: tariff._id,
      type: 'tariff',
      name: localizedTariff.name,
      description: localizedTariff.description,
      price: tariff.price,
      currency: 'MDL',
      data: { tariffId: tariff._id },
    });
    toast.success(t('cart.addedToCart', { name: localizedTariff.name }));
  };

  const getPopularIndex = () => {
    if (tariffs.length === 0) return -1;
    const midIndex = Math.floor(tariffs.length / 2);
    return midIndex;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">{t('tariff.title')}</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {t('tariff.description')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tariffs.map((tariff: any, index: number) => {
              const isPopular = index === getPopularIndex();
              
              return (
                <Card
                  key={tariff._id}
                  hover
                  className={`relative ${
                    isPopular ? 'ring-2 ring-primary-600 shadow-2xl scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      <Star size={14} className="inline mr-1" />
                      {t('tariff.popular')}
                    </div>
                  )}
                  <CardContent className="p-8">
                    {(() => {
                      const localizedTariff = getLocalizedTariff(tariff);
                      return (
                        <>
                          <CardTitle className="text-2xl mb-2">{localizedTariff.name}</CardTitle>
                          <p className="text-gray-600 mb-6">{localizedTariff.description}</p>
                          <div className="mb-6">
                            <span className="text-4xl font-bold text-primary-600">
                              {formatPrice(tariff.price)}
                            </span>
                            <span className="text-gray-600">{t(`tariff.per${tariff.type.charAt(0).toUpperCase() + tariff.type.slice(1)}`)}</span>
                          </div>
                          <ul className="space-y-3 mb-8">
                            {localizedTariff.features.map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center text-gray-700">
                                <Check size={20} className="text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })()}
                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => handleAddToCart(tariff)}
                    >
                      {t('tariff.selectPlan')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
