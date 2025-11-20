import { TFunction } from 'i18next';

/**
 * Функция для локализации названий парковок
 * Переводит названия парковок с бэкенда на текущий язык
 */
export const getLocalizedParkingName = (parkingName: string, t: TFunction): string => {
  // Создаем маппинг русских названий на ключи переводов
  const nameMapping: { [key: string]: string } = {
    'Центральная Парковка А': 'parking.parkingNames.centralParkingA',
    'Торговый Центр Parking B': 'parking.parkingNames.shoppingCenterParkingB',
    // Можно добавить больше парковок по мере необходимости
  };

  // Пробуем найти соответствие по точному названию
  const translationKey = nameMapping[parkingName];
  
  if (translationKey) {
    // Если нашли ключ перевода, используем его
    const translated = t(translationKey);
    // Если перевод существует и не равен ключу, возвращаем его
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  // Если точного соответствия нет, пробуем по частям названия
  if (parkingName.includes('Центральная Парковка') || parkingName.includes('Central Parking')) {
    return t('parking.parkingNames.centralParkingA');
  }
  
  if (parkingName.includes('Торговый Центр') || parkingName.includes('Shopping Center')) {
    return t('parking.parkingNames.shoppingCenterParkingB');
  }

  // Если ничего не подходит, возвращаем оригинальное название
  return parkingName;
};

/**
 * Альтернативная функция для маппинга по ID парковки
 */
export const getLocalizedParkingNameById = (parkingId: string, t: TFunction): string | null => {
  const idMapping: { [key: string]: string } = {
    // Добавьте ID парковок, если они известны
    // 'parking_id_1': 'parking.parkingNames.centralParkingA',
    // 'parking_id_2': 'parking.parkingNames.shoppingCenterParkingB',
  };

  const translationKey = idMapping[parkingId];
  return translationKey ? t(translationKey) : null;
};