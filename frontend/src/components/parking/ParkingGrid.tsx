import React, { useState } from 'react';
import { X, Clock, Calendar, CreditCard, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ParkingSpot from './ParkingSpot';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import api from '../../services/api';
import { bookingService } from '../../services/bookingService';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';
import { getLocalizedParkingName } from '../../utils/parkingTranslations';

interface ParkingGridProps {
  parkingName: string;
  totalSpots?: number;
  rows?: number;
  cols?: number;
  parkingId?: string;
  onSlotSelect?: (spotNumber: string) => void;
  selectionMode?: 'booking' | 'selection';
}

interface BookingData {
  spotNumber: string;
  duration: 'hourly' | 'daily' | 'monthly';
  hours?: number;
  startTime?: string;
  useFreeBooking?: boolean;
}

export default function ParkingGrid({ 
  parkingName, 
  totalSpots = 20, 
  cols = 5,
  parkingId,
  onSlotSelect,
  selectionMode = 'booking'
}: ParkingGridProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { currency } = useCurrencyStore();
  const { formatPrice } = usePriceFormatter();
  
  // Получаем тарифы для парковки
  const { data: tariffsData } = useQuery({
    queryKey: ['tariffs', parkingId],
    queryFn: async () => {
      const res = await api.get('/tariffs');
      return res.data;
    },
    enabled: !!parkingId
  });

  // Получаем занятые места парковки
  const { data: occupiedSpotsData } = useQuery({
    queryKey: ['occupied-spots', parkingId],
    queryFn: async () => {
      const res = await api.get(`/parkings/${parkingId}/occupied-spots`);
      return res.data;
    },
    enabled: !!parkingId,
    refetchInterval: 10000, // Обновляем каждые 10 секунд
  });

  const tariffs = tariffsData?.tariffs || [];
  const occupiedSpots = occupiedSpotsData?.occupiedSpots || [];
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    spotNumber: '',
    duration: 'hourly',
    hours: 1,
    useFreeBooking: false
  });

  // Получаем информацию о бесплатном бронировании
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await api.get('/balance/balance');
      return res.data;
    },
    retry: false,
    enabled: isAuthenticated // Запрашиваем только если пользователь авторизован
  });

  const hasUsedFreeBooking = balanceData?.hasUsedFreeBooking ?? true; // По умолчанию true если не авторизован
  const canUseFreeBooking = isAuthenticated && !hasUsedFreeBooking;

  // Генерируем статусы мест с учетом реальных бронирований
  const generateSpots = () => {
    const spots = [];
    for (let i = 1; i <= totalSpots; i++) {
      const spotNumber = `${String.fromCharCode(65 + Math.floor((i - 1) / cols))}-${((i - 1) % cols) + 1}`;
      
      // Проверяем, занято ли место
      const isOccupied = occupiedSpots.some((os: any) => os.spotNumber === spotNumber);
      
      spots.push({
        number: spotNumber,
        isOccupied: isOccupied,
        isReserved: false // Можно добавить логику для забронированных мест
      });
    }
    return spots;
  };

  // Пересоздаем spots при изменении occupiedSpots
  const spots = generateSpots();

  // Получаем динамические цены из тарифов
  const prices = React.useMemo(() => {
    if (!tariffs || tariffs.length === 0) {
      // Fallback значения если тарифы не загружены
      return {
        hourly: 50,
        daily: 800,
        monthly: 15000
      };
    }
    
    const hourlyTariff = tariffs.find((t: any) => t.type === 'hourly');
    const dailyTariff = tariffs.find((t: any) => t.type === 'daily'); 
    const monthlyTariff = tariffs.find((t: any) => t.type === 'monthly');
    
    return {
      hourly: hourlyTariff?.price || 50,
      daily: dailyTariff?.price || 800,
      monthly: monthlyTariff?.price || 15000
    };
  }, [tariffs, currency]);

  const handleSpotClick = (spotNumber: string) => {
    // Проверяем, не занято ли место
    const spot = spots.find(s => s.number === spotNumber);
    if (spot?.isOccupied) {
      alert(t('booking.spotTaken', { spot: spotNumber }));
      return;
    }
    
    if (spot?.isReserved) {
      alert(t('booking.spotReserved', { spot: spotNumber }));
      return;
    }
    
    if (selectionMode === 'selection' && onSlotSelect) {
      setSelectedSpot(spotNumber);
      onSlotSelect(spotNumber);
      return;
    }

    setSelectedSpot(spotNumber);
    setBookingData({ 
      ...bookingData, 
      spotNumber,
      useFreeBooking: canUseFreeBooking 
    });
    setShowBookingModal(true);
  };

  const calculatePrice = () => {
    // Если используется бесплатное бронирование - всегда 0
    if (bookingData.useFreeBooking && canUseFreeBooking) {
      return 0;
    }
    
    if (bookingData.duration === 'hourly') {
      return prices.hourly * (bookingData.hours || 1);
    }
    return prices[bookingData.duration];
  };

  const handleBooking = async () => {
    try {
      if (!parkingId) {
        alert(t('messages.error.parkingIdNotFound'));
        return;
      }

      console.log('Tariffs data:', tariffsData);
      console.log('Tariffs array:', tariffs);
      console.log('Booking duration:', bookingData.duration);

      if (!Array.isArray(tariffs) || tariffs.length === 0) {
        alert(t('messages.error.tariffsNotLoaded'));
        return;
      }

      // Находим tariffId по типу duration
      const selectedTariff = tariffs.find((t: any) => t.type === bookingData.duration);
      console.log('Selected tariff:', selectedTariff);

      if (!selectedTariff) {
        alert(t('messages.error.tariffNotFound', { 
          duration: bookingData.duration,
          available: tariffs.map(t => t.type).join(', ')
        }));
        return;
      }

      const bookingPayload = {
        parkingId,
        spotNumber: bookingData.spotNumber,
        tariffId: selectedTariff._id,
        startTime: bookingData.startTime || new Date().toISOString(),
        useFreeBooking: bookingData.useFreeBooking && canUseFreeBooking
      };

      const response = await bookingService.createBooking(bookingPayload);
      
      alert(response.message || t('messages.success.bookingCreated'));
      setShowBookingModal(false);
      
      // Обновляем место как занятое
      const spotIndex = spots.findIndex(s => s.number === bookingData.spotNumber);
      if (spotIndex !== -1) {
        spots[spotIndex].isOccupied = true;
        spots[spotIndex].isReserved = false;
      }
      
      // Обновляем данные о балансе после бронирования
      // queryClient.invalidateQueries(['balance']);
      
    } catch (error: any) {
      console.error('Ошибка бронирования:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании бронирования';
      
      // Проверяем, не занято ли место
      if (errorMessage.includes('занято') || errorMessage.includes('уже занят')) {
        alert(`❌ Место ${bookingData.spotNumber} уже занято! Пожалуйста, выберите другое место.`);
        
        // Обновляем визуальное состояние места
        const spotIndex = spots.findIndex(s => s.number === bookingData.spotNumber);
        if (spotIndex !== -1) {
          spots[spotIndex].isOccupied = true;
          spots[spotIndex].isReserved = false;
        }
        
        setShowBookingModal(false);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    }
  };

  const availableSpots = spots.filter(s => !s.isOccupied && !s.isReserved).length;
  const occupiedSpotsCount = spots.filter(s => s.isOccupied).length;
  const reservedSpots = spots.filter(s => s.isReserved).length;

  return (
    <div className="w-full">
      {/* Header with stats */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{getLocalizedParkingName(parkingName, t)}</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{availableSpots}</div>
            <div className="text-sm text-gray-600">{t('parking.availableSpots')}</div>
          </div>
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{occupiedSpotsCount}</div>
            <div className="text-sm text-gray-600">{t('parking.occupiedSpots')}</div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{reservedSpots}</div>
            <div className="text-sm text-gray-600">{t('parking.reservedSpots')}</div>
          </div>
        </div>

        {/* Pricing info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💰 {t('tariff.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span><strong>{formatPrice(prices.hourly)}</strong> / {t('tariff.perHour')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span><strong>{formatPrice(prices.daily)}</strong> / {t('tariff.perDay')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span><strong>{formatPrice(prices.monthly)}</strong> / {t('tariff.perMonth')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parking grid */}
      <div className="bg-gray-100 rounded-xl p-6 border-4 border-gray-300">
        <div className="flex justify-center items-start gap-4 flex-wrap">
          {spots.map((spot, index) => (
            <ParkingSpot
              key={index}
              spotNumber={spot.number}
              isOccupied={spot.isOccupied}
              isReserved={spot.isReserved}
              onBook={handleSpotClick}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
          <span>{t('parking.available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 border border-yellow-600 rounded"></div>
          <span>{t('parking.reserved')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
          <span>{t('parking.occupied')}</span>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('booking.bookingSpot', { spot: selectedSpot })}</h2>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Free booking badge */}
              {canUseFreeBooking && bookingData.useFreeBooking && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg flex items-center gap-3">
                  <Gift className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="font-bold text-green-900 text-lg">🎉 {t('booking.firstHourFree')}</div>
                    <div className="text-sm text-green-700">{t('booking.freeBookingDescription')}</div>
                  </div>
                </div>
              )}

              {/* Free booking toggle */}
              {canUseFreeBooking && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.useFreeBooking}
                      onChange={(e) => setBookingData({ 
                        ...bookingData, 
                        useFreeBooking: e.target.checked,
                        hours: e.target.checked ? 1 : bookingData.hours,
                        duration: e.target.checked ? 'hourly' : bookingData.duration
                      })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-green-900">{t('booking.useFreeBooking')}</div>
                      <div className="text-sm text-green-700">{t('booking.bookForFree')}</div>
                    </div>
                  </label>
                </div>
              )}

              {/* Advance booking time selector */}
              <div>
                <label className="form-label">{t('booking.startTime')}</label>
                <input
                  type="datetime-local"
                  value={bookingData.startTime || ''}
                  onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="form-input w-full"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('booking.selectStartTime')}
                </p>
              </div>

              {/* Duration selection */}
              {!bookingData.useFreeBooking && (
                <div>
                  <label className="form-label">{t('booking.selectTariff')}</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setBookingData({ ...bookingData, duration: 'hourly' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        bookingData.duration === 'hourly'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Clock className="w-5 h-5 text-blue-600 mb-1" />
                          <div className="font-semibold">{t('booking.hourly')}</div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(prices.hourly)} / {t('tariff.perHour')}
                          </div>
                        </div>
                        {bookingData.duration === 'hourly' && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setBookingData({ ...bookingData, duration: 'daily' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        bookingData.duration === 'daily'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Calendar className="w-5 h-5 text-blue-600 mb-1" />
                          <div className="font-semibold">{t('booking.daily')}</div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(prices.daily)} / {t('tariff.perDay')}
                          </div>
                        </div>
                        {bookingData.duration === 'daily' && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setBookingData({ ...bookingData, duration: 'monthly' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        bookingData.duration === 'monthly'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CreditCard className="w-5 h-5 text-blue-600 mb-1" />
                          <div className="font-semibold">{t('booking.monthly')}</div>
                          <div className="text-sm text-gray-600">
                            {formatPrice(prices.monthly)} / {t('tariff.perMonth')}
                          </div>
                        </div>
                        {bookingData.duration === 'monthly' && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Hours selector for hourly */}
              {bookingData.duration === 'hourly' && !bookingData.useFreeBooking && (
                <div>
                  <label className="form-label">{t('booking.numberOfHours')}</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={bookingData.hours}
                    onChange={(e) => setBookingData({ ...bookingData, hours: parseInt(e.target.value) || 1 })}
                    className="form-input"
                  />
                </div>
              )}

              {/* Total price */}
              <div className={bookingData.useFreeBooking && canUseFreeBooking ? 'p-4 rounded-lg bg-green-50 border-2 border-green-500' : 'p-4 rounded-lg bg-gray-50'}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{t('booking.totalAmount')}:</span>
                  {bookingData.useFreeBooking && canUseFreeBooking ? (
                    <span className="text-2xl font-bold text-green-600">{t('booking.free').toUpperCase()} 🎉</span>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(calculatePrice())}</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleBooking} className="flex-1 btn-primary">
                  {bookingData.useFreeBooking && canUseFreeBooking ? t('booking.bookForFree') : t('booking.bookAndPay')}
                </Button>
                <Button onClick={() => setShowBookingModal(false)} className="btn-secondary">
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
