/**
 * Утилита для форматирования валют с учетом локализации
 * 
 * Поддерживаемые валюты:
 * - USD (Доллар США) - символ $
 * - EUR (Евро) - символ €
 * - MDL (Молдавский лей) - символ L
 * 
 * @example
 * formatCurrency(100, 'USD', 'en') // "$100.00"
 * formatCurrency(100, 'EUR', 'ru') // "€100,00"
 * formatCurrency(100, 'MDL', 'ro') // "100,00 L"
 */

export type Currency = 'USD' | 'EUR' | 'MDL';
export type Locale = 'en' | 'ru' | 'ro';

/**
 * Символы валют для каждого типа
 */
export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  MDL: 'L',
};

/**
 * Названия валют на разных языках
 */
export const currencyNames = {
  en: {
    USD: 'US Dollar',
    EUR: 'Euro',
    MDL: 'Moldovan Leu',
  },
  ru: {
    USD: 'Доллар США',
    EUR: 'Евро',
    MDL: 'Молдавский лей',
  },
  ro: {
    USD: 'Dolar american',
    EUR: 'Euro',
    MDL: 'Leu moldovenesc',
  },
};

/**
 * Курсы обмена валют (базовая валюта - MDL)
 */
export const exchangeRates = {
  USD_TO_EUR: 0.92,
  USD_TO_MDL: 17.5,
  EUR_TO_USD: 1.09,
  EUR_TO_MDL: 19.0,
  MDL_TO_USD: 0.057,
  MDL_TO_EUR: 0.053,
};

/**
 * Форматирует сумму в соответствии с валютой и локалью
 * 
 * @param amount - Сумма для форматирования
 * @param currency - Код валюты (USD, EUR, MDL)
 * @param locale - Код языка (en, ru, ro)
 * @param options - Дополнительные опции форматирования
 * @returns Отформатированная строка с суммой
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'MDL',
  locale: Locale = 'en',
  options?: {
    showSymbol?: boolean; // Показывать символ валюты
    showCode?: boolean;   // Показывать код валюты
    decimals?: number;    // Количество знаков после запятой
  }
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
  } = options || {};

  // Округляем до нужного количества знаков
  const roundedAmount = Number(amount.toFixed(decimals));

  // Форматируем число с учетом локали
  let formattedNumber: string;
  
  if (locale === 'en') {
    // Английский: 1,234.56
    formattedNumber = roundedAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } else if (locale === 'ru') {
    // Русский: 1 234,56
    formattedNumber = roundedAmount.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } else {
    // Румынский: 1.234,56
    formattedNumber = roundedAmount.toLocaleString('ro-RO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Составляем финальную строку
  let result = formattedNumber;

  if (showSymbol) {
    const symbol = currencySymbols[currency];
    // Для MDL символ ставим после суммы, для остальных - перед
    if (currency === 'MDL') {
      result = `${result} ${symbol}`;
    } else {
      result = `${symbol}${result}`;
    }
  }

  if (showCode) {
    result = `${result} ${currency}`;
  }

  return result;
}

/**
 * Конвертирует сумму из одной валюты в другую
 * 
 * @param amount - Исходная сумма
 * @param from - Исходная валюта
 * @param to - Целевая валюта
 * @returns Сконвертированная сумма
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;

  // Конвертируем через курсы
  const key = `${from}_TO_${to}` as keyof typeof exchangeRates;
  const rate = exchangeRates[key];

  if (!rate) {
    console.error(`Exchange rate not found for ${from} to ${to}`);
    return amount;
  }

  return amount * rate;
}

/**
 * Получает название валюты на нужном языке
 * 
 * @param currency - Код валюты
 * @param locale - Код языка
 * @returns Название валюты
 */
export function getCurrencyName(
  currency: Currency,
  locale: Locale = 'en'
): string {
  return currencyNames[locale][currency];
}

/**
 * Форматирует цену для отображения в карточках и списках
 * Краткий формат без кода валюты
 * 
 * @example
 * formatPrice(100, 'USD') // "$100"
 * formatPrice(100.50, 'EUR') // "€100.50"
 */
export function formatPrice(
  amount: number,
  currency: Currency = 'MDL',
  locale: Locale = 'en'
): string {
  return formatCurrency(amount, currency, locale, {
    showSymbol: true,
    showCode: false,
    decimals: amount % 1 === 0 ? 0 : 2, // Не показываем .00 для целых чисел
  });
}

/**
 * Форматирует баланс с полной информацией
 * Длинный формат с кодом валюты
 * 
 * @example
 * formatBalance(100, 'USD') // "$100.00 USD"
 */
export function formatBalance(
  amount: number,
  currency: Currency = 'MDL',
  locale: Locale = 'en'
): string {
  return formatCurrency(amount, currency, locale, {
    showSymbol: true,
    showCode: true,
    decimals: 2,
  });
}

/**
 * Получает компактное отображение цены для кнопок и меток
 * 
 * @example
 * getCompactPrice(1500, 'MDL') // "1.5K L"
 * getCompactPrice(50, 'USD') // "$50"
 */
export function getCompactPrice(
  amount: number,
  currency: Currency = 'MDL'
): string {
  const symbol = currencySymbols[currency];
  
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${symbol}`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${symbol}`;
  }
  
  if (currency === 'MDL') {
    return `${amount} ${symbol}`;
  }
  return `${symbol}${amount}`;
}

/**
 * Парсит строку с валютой в число
 * 
 * @param value - Строка типа "$100.50" или "100,50 €"
 * @returns Числовое значение
 */
export function parseCurrency(value: string): number {
  // Удаляем все символы кроме цифр, точки и запятой
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Заменяем запятую на точку
  const normalized = cleaned.replace(',', '.');
  
  return parseFloat(normalized) || 0;
}
