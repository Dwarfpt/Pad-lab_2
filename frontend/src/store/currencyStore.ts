import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Только валюты, поддерживаемые backend
export type Currency = 'MDL' | 'USD' | 'EUR';

interface CurrencyState {
  currency: Currency;
  exchangeRates: Record<string, number>;
  setCurrency: (currency: Currency) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  convertAmount: (amount: number, fromCurrency: Currency) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'MDL',
      exchangeRates: {},
      setCurrency: (currency) => set({ currency }),
      setExchangeRates: (rates) => set({ exchangeRates: rates }),
      convertAmount: (amount: number, fromCurrency: Currency = 'MDL') => {
        const { currency, exchangeRates } = get();
        const currentCurrency = currency || 'MDL';
        
        if (fromCurrency === currentCurrency || Object.keys(exchangeRates).length === 0) {
          return amount;
        }

        // Конвертируем через MDL
        let amountInMDL = amount;
        if (fromCurrency !== 'MDL') {
          const rateToMDL = 1 / (exchangeRates[fromCurrency] || 1);
          amountInMDL = amount * rateToMDL;
        }

        if (currentCurrency !== 'MDL') {
          const targetRate = exchangeRates[currentCurrency] || 1;
          return amountInMDL * targetRate;
        }

        return amountInMDL;
      },
    }),
    {
      name: 'currency-storage',
    }
  )
);
