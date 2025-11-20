import axios from 'axios';

const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'your_api_key_here';
const EXCHANGE_API_URL = 'https://v6.exchangerate-api.com/v6';

// Fallback rates if API fails or key is invalid
const FALLBACK_RATES = {
  MDL: { MDL: 1, USD: 0.056, EUR: 0.052, RON: 0.26 },
  USD: { MDL: 17.8, USD: 1, EUR: 0.92, RON: 4.6 },
  EUR: { MDL: 19.2, USD: 1.08, EUR: 1, RON: 4.97 },
};

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
}

// Кэш курсов валют (обновляется раз в день)
let cachedRates: ExchangeRateResponse | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 86400000; // 24 часа в миллисекундах

/**
 * Получение актуальных курсов валют от базовой валюты
 */
export const getExchangeRates = async (baseCurrency: string = 'MDL'): Promise<ExchangeRateResponse> => {
  try {
    const now = Date.now();
    
    // Возвращаем кэш, если он свежий
    if (cachedRates && cachedRates.base_code === baseCurrency && (now - lastFetch) < CACHE_DURATION) {
      return cachedRates;
    }

    // Запрашиваем новые курсы только если есть валидный ключ
    if (EXCHANGE_API_KEY !== 'your_api_key_here') {
      const response = await axios.get<ExchangeRateResponse>(
        `${EXCHANGE_API_URL}/${EXCHANGE_API_KEY}/latest/${baseCurrency}`
      );

      if (response.data.result === 'success') {
        cachedRates = response.data;
        lastFetch = now;
        console.log(`✅ Exchange rates updated for ${baseCurrency}:`, {
          USD: response.data.conversion_rates.USD,
          EUR: response.data.conversion_rates.EUR,
        });
        return response.data;
      }
    }
    
    throw new Error('API key not configured or request failed');
  } catch (error) {
    console.error('Error fetching exchange rates (using fallback):', error instanceof Error ? error.message : 'Unknown error');
    
    // Возвращаем кэш, если есть, даже если устарел
    if (cachedRates) {
      console.log('⚠️ Using cached exchange rates due to API error');
      return cachedRates;
    }
    
    // Fallback на статические курсы
    console.log('⚠️ Using fallback exchange rates');
    const rates = FALLBACK_RATES[baseCurrency as keyof typeof FALLBACK_RATES] || FALLBACK_RATES.MDL;
    
    return {
      result: 'success',
      base_code: baseCurrency,
      conversion_rates: rates,
      time_last_update_unix: Date.now() / 1000,
      time_last_update_utc: new Date().toUTCString(),
      time_next_update_unix: (Date.now() / 1000) + 3600,
      time_next_update_utc: new Date(Date.now() + 3600000).toUTCString()
    };
  }
};

/**
 * Конвертация суммы из одной валюты в другую
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await getExchangeRates(fromCurrency);
    const rate = rates.conversion_rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Conversion rate not found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

/**
 * Получение курса валюты
 */
export const getConversionRate = async (
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const rates = await getExchangeRates(fromCurrency);
  return rates.conversion_rates[toCurrency] || 1;
};

export default {
  getExchangeRates,
  convertCurrency,
  getConversionRate
};
