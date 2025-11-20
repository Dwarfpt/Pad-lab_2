import { useState, useRef, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const currencies = [
  {
    code: 'MDL' as const,
    name: 'Moldovan Leu',
    symbol: 'L',
    flag: '🇲🇩',
  },
  {
    code: 'USD' as const,
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
  },
  {
    code: 'EUR' as const,
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
  },
];

export default function CurrencySwitcher() {
  const { currency, setCurrency, setExchangeRates } = useCurrencyStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Получаем курсы валют
  const { data: exchangeRates } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: async () => {
      try {
        const response = await api.get('/balance/exchange-rates');
        return response.data.rates || response.data;
      } catch (error) {
        // Тихо возвращаем дефолтные курсы, если API недоступен
        return {
          MDL: 1,
          USD: 0.055,
          EUR: 0.051,
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    refetchInterval: 10 * 60 * 1000, // Обновлять каждые 10 минут
    retry: 0, // Не делать ретраи - используем fallback
    retryDelay: 5000,
  });

  // Обновляем курсы валют в сторе
  useEffect(() => {
    if (exchangeRates) {
      setExchangeRates(exchangeRates);
    }
  }, [exchangeRates, setExchangeRates]);

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  const changeCurrency = (currencyCode: typeof currency) => {
    setCurrency(currencyCode);
    setIsOpen(false);
    console.log(`💱 Валюта изменена на: ${currencyCode}`);
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label="Select currency"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg font-bold text-gray-600">
          {currentCurrency.symbol}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {currentCurrency.code}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {currencies.map((curr) => {
            const isSelected = curr.code === currency;
            const rate = exchangeRates?.[curr.code] || 1;

            return (
              <button
                key={curr.code}
                onClick={() => changeCurrency(curr.code)}
                className={`
                  w-full px-4 py-3 text-left flex items-center gap-3
                  hover:bg-gray-50 transition-colors duration-150
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
                role="menuitem"
                aria-current={isSelected ? 'true' : 'false'}
              >
                <span className="text-xl font-bold text-gray-600 w-8 text-center">
                  {curr.symbol}
                </span>

                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {curr.code}
                    <span className="text-sm" role="img" aria-label={curr.name}>
                      {curr.flag}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {curr.name}
                    {curr.code !== 'MDL' && exchangeRates && (
                      <span className="ml-2">
                        (1 MDL = {(1 / rate).toFixed(2)} {curr.code})
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
