import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';

export type Currency = 'MDL' | 'USD' | 'EUR';

const EXCHANGE_RATES: Record<Currency, number> = {
  // Значения — курс: 1 MDL = X <CURRENCY> (обратные курсы для правильной конвертации)
  MDL: 1,
  USD: 0.054, // 1 MDL = 0.054 USD (1/18.5)
  EUR: 0.050, // 1 MDL = 0.050 EUR (1/20.0)
};

const LOCALE_MAP: Record<Currency, string> = {
  MDL: 'ro-MD',
  USD: 'en-US',
  EUR: 'de-DE',
};

const toFixedNumber = (n: number, digits = 2) =>
  Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits);

/**
 * Конвертация суммы из одной валюты в другую (через MDL как базовую)
 */
export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number> = EXCHANGE_RATES
): number => {
  if (from === to) return amount;
  
  // Если исходная валюта MDL, то просто умножаем на курс
  if (from === 'MDL') {
    const converted = amount * (rates[to] || 1);
    return toFixedNumber(converted, 2);
  }
  
  // Если целевая валюта MDL, то делим на курс исходной валюты
  if (to === 'MDL') {
    const converted = amount / (rates[from] || 1);
    return toFixedNumber(converted, 2);
  }
  
  // Если обе валюты не MDL, то сначала конвертируем в MDL, потом в целевую
  const amountInMDL = amount / (rates[from] || 1);
  const converted = amountInMDL * (rates[to] || 1);
  return toFixedNumber(converted, 2);
};

/**
 * Форматирование суммы в заданной валюте
 */
export const formatAmount = (
  amount: number,
  currency: Currency = 'MDL',
  localeMap: Record<Currency, string> = LOCALE_MAP
): string => {
  const locale = localeMap[currency] || 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * React hook: возвращает formatPrice и preferredCurrency (берётся из currencyStore)
 */
export const usePriceFormatter = () => {
  const { currency, exchangeRates } = useCurrencyStore();
  
  const formatPrice = useMemo(
    () => (amountMDL: number, targetCurrency?: Currency) => {
      const selectedCurrency = (targetCurrency || currency) as Currency;
      
      // Используем актуальные курсы из store или fallback
      const currentRates = Object.keys(exchangeRates).length > 0 ? exchangeRates : EXCHANGE_RATES;
      const converted = convertCurrency(amountMDL, 'MDL', selectedCurrency, currentRates);
      
      return formatAmount(converted, selectedCurrency);
    },
    [currency, exchangeRates]
  );

  return { formatPrice, preferredCurrency: currency };
};

/**
 * Утилита для получения конвертированной суммы (например, для вычислений вне компонента)
 */
export const useConvertedAmount = (
  amount: number,
  fromCurrency: Currency = 'MDL',
  toCurrency: Currency = 'MDL',
  rates: Record<Currency, number> = EXCHANGE_RATES
): number => {
  return convertCurrency(amount, fromCurrency, toCurrency, rates);
};
