/**
 * Компонент переключателя языков
 * 
 * Позволяет пользователю выбрать один из доступных языков интерфейса:
 * - 🇬🇧 English (en)
 * - 🇷🇺 Русский (ru)
 * - 🇷🇴 Română (ro)
 * 
 * Выбранный язык сохраняется в localStorage и применяется ко всему приложению
 * 
 * @component
 * @example
 * <LanguageSwitcher />
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

// Список поддерживаемых языков с метаданными
const languages = [
  {
    code: 'en',        // Код языка для i18next
    name: 'English',   // Название на родном языке
    flag: '🇬🇧',       // Флаг (emoji)
    country: 'US',     // Код страны
  },
  {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺',
    country: 'RU',
  },
  {
    code: 'ro',
    name: 'Română',
    flag: '🇷🇴',
    country: 'RO',
  },
];

/**
 * Компонент выпадающего списка для выбора языка
 */
export default function LanguageSwitcher() {
  // Хук для доступа к функциям i18next
  const { i18n } = useTranslation();
  
  // Состояние открытия/закрытия выпадающего списка
  const [isOpen, setIsOpen] = useState(false);
  
  // Реф для обработки кликов вне компонента
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  /**
   * Находим текущий выбранный язык по коду
   * Если язык не найден (например, 'en-US'), используем первые 2 символа ('en')
   */
  const currentLanguageCode = i18n.language.split('-')[0]; // 'en-US' → 'en'
  const currentLang = languages.find(l => l.code === currentLanguageCode) || languages[0];
  
  /**
   * Обработчик смены языка
   * 
   * @param langCode - Код языка ('en' | 'ru' | 'ro')
   */
  const changeLanguage = (langCode: string) => {
    // Меняем язык через i18next
    i18n.changeLanguage(langCode);
    
    // Закрываем выпадающий список
    setIsOpen(false);
    
    // localStorage обновится автоматически через i18next-browser-languagedetector
    console.log(`Language changed to: ${langCode}`);
  };
  
  /**
   * Эффект для закрытия выпадающего списка при клике вне компонента
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Если клик был вне dropdown, закрываем его
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    // Добавляем слушатель только когда dropdown открыт
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup функция для удаления слушателя
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  /**
   * Обработчик нажатия Escape для закрытия dropdown
   */
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
      {/* Кнопка для открытия выпадающего списка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Иконка глобуса */}
        <Globe className="w-5 h-5 text-gray-600" />
        
        {/* Флаг текущего языка */}
        <span className="text-xl" role="img" aria-label={currentLang.name}>
          {currentLang.flag}
        </span>
        
        {/* Стрелка вниз/вверх */}
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
      
      {/* Выпадающий список языков */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {languages.map((lang) => {
            // Проверяем, выбран ли текущий язык
            const isSelected = lang.code === currentLanguageCode;
            
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`
                  w-full px-4 py-2.5 text-left flex items-center gap-3
                  hover:bg-gray-50 transition-colors duration-150
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
                role="menuitem"
                aria-current={isSelected ? 'true' : 'false'}
              >
                {/* Флаг */}
                <span className="text-2xl" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                
                {/* Название языка */}
                <span className="flex-1 font-medium">
                  {lang.name}
                </span>
                
                {/* Галочка для выбранного языка */}
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
