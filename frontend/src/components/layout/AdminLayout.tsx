import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Панель управления', path: '/admin' },
    { icon: Users, label: 'Пользователи', path: '/admin/users' },
    { icon: Car, label: 'Парковки', path: '/admin/parkings' },
    { icon: CreditCard, label: 'Тарифы', path: '/admin/tariffs' },
    { icon: Calendar, label: 'Бронирования', path: '/admin/bookings' },
    { icon: FileText, label: 'Блог', path: '/admin/blog' },
    { icon: MessageCircle, label: 'Чат поддержки', path: '/admin/support' },
    { icon: Settings, label: 'Настройки', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 fixed h-full z-10`}>
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <div className="mb-3">
            {isSidebarOpen && (
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin'}
                </p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm p-4 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                На сайт →
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
