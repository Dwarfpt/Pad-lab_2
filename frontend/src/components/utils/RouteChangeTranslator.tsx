import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { translationService } from '../../services/translationService';

/**
 * Компонент для автоматического перевода страницы при навигации
 * Использует React Router useLocation для отслеживания смены маршрута
 */
export function RouteChangeTranslator() {
  const location = useLocation();

  useEffect(() => {
    // Переводим страницу при каждой навигации
    const currentLang = translationService.getLanguage();
    
    if (currentLang !== 'ru') {
      // Короткая задержка для завершения рендера React
      const timer = setTimeout(() => {
        translationService.translatePage();
      }, 50); // Уменьшили с 100ms до 50ms для более быстрого перевода

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.search, location.hash]); // Срабатывает при смене любой части URL

  return null; // Этот компонент не рендерит ничего
}
