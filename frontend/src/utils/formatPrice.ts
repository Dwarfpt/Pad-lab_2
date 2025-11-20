export const formatPrice = (
  amount: number,
  currency: string = 'MDL',
  locale: 'ro' | 'en' | 'ru' = 'ro'
): string => {
  const localeMap: Record<string, string> = {
    ro: 'ro-RO',
    en: 'en-US',
    ru: 'ru-RU'
  };

  return new Intl.NumberFormat(localeMap[locale] || 'ro-RO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};
