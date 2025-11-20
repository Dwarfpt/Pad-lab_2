import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import CartIcon from '../cart/CartIcon';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import CurrencySwitcher from '../ui/CurrencySwitcher';
import { useTranslation } from 'react-i18next';
import { usePriceFormatter } from '../../hooks/usePriceFormatter';

export default function Header() {
  const { t } = useTranslation();
  const { formatPrice } = usePriceFormatter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: t('header.home'), path: '/' },
    { name: t('header.parking'), path: '/parking' },
    { name: t('header.tariffs'), path: '/tariffs' },
    { name: t('header.about'), path: '/about' },
    { name: t('header.contact'), path: '/contact' },
    { name: t('header.blog'), path: '/blog' },
  ];

  // Получаем баланс пользователя в предпочитаемой валюте
  const getUserBalance = () => {
    if (!user) return 0;
    
    // Демо баланс только для специальных демо пользователей
    if (!user.balance) {
      if (user.email === 'demo@example.com' || user.firstName === 'Демо') {
        return 150; // Демо баланс только для демо пользователей
      }
      return 0; // Для обычных пользователей показываем 0 если нет баланса
    }
    
    const preferredCurrency = (user.preferredCurrency || 'MDL') as 'MDL' | 'USD' | 'EUR';
    return user.balance[preferredCurrency] || 0; // Возвращаем реальный баланс или 0
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Smart Parking</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Currency Switcher */}
            <CurrencySwitcher />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Cart */}
            <div className="relative text-gray-700 hover:text-primary-600 transition-colors">
              <CartIcon />
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Balance - используем formatPrice */}
                <Link
                  to="/profile?tab=balance"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="font-semibold">
                    {formatPrice(getUserBalance())}
                  </span>
                </Link>

                {/* Admin Panel Button - показываем только для админов */}
                {(user?.role === 'admin' || user?.role === 'super-admin') && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Админ-панель"
                  >
                    <span className="font-semibold text-sm">Админ</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Аватар" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-blue-600" />
                      )}
                    </div>
                    <span className="hidden md:block text-gray-700 font-medium">
                      {user?.firstName || user?.name || 'Пользователь'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-700 transition-transform ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('header.profile')}
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'super-admin') && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('header.adminPanel')}
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">{t('header.login')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">{t('header.register')}</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
