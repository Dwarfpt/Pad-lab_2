import React from 'react';
import { Settings, Users, MessageCircle, Bell, Database, Shield } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
        <p className="text-gray-600">Управление настройками приложения Smart Parking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3 mb-4">
              <Settings size={24} className="text-blue-600" />
              <h3 className="text-xl font-semibold">Основные настройки</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название системы
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Smart Parking"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email поддержки
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="support@smartparking.md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон поддержки
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="+373 60 123 456"
                />
              </div>
            </div>
            
            <Button className="w-full mt-4">Сохранить</Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3 mb-4">
              <Users size={24} className="text-green-600" />
              <h3 className="text-xl font-semibold">Управление пользователями</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Автоматическое подтверждение регистрации</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Разрешить гостевые бронирования</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Двухфакторная аутентификация</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">Настроить права доступа</Button>
          </CardContent>
        </Card>

        {/* Support Chat Management */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle size={24} className="text-purple-600" />
              <h3 className="text-xl font-semibold">Управление поддержкой</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Активные чаты поддержки</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Открытые обращения</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">В работе</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Решенные</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">24</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Автоответы включены</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">Управлять чатами</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3 mb-4">
              <Bell size={24} className="text-orange-600" />
              <h3 className="text-xl font-semibold">Уведомления</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email уведомления</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">SMS уведомления</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Push уведомления</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Шаблон email уведомления
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  defaultValue="Здравствуйте, {name}! Ваше бронирование {booking_id} подтверждено."
                />
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">Тестировать уведомления</Button>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3 mb-4">
              <Database size={24} className="text-indigo-600" />
              <h3 className="text-xl font-semibold">База данных</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Статистика БД</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Пользователи</span>
                    <span className="text-sm font-medium">1,248</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Бронирования</span>
                    <span className="text-sm font-medium">5,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Размер БД</span>
                    <span className="text-sm font-medium">156 MB</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Создать резервную копию
              </Button>
              
              <Button variant="outline" size="sm" className="w-full">
                Очистить старые данные
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-3 mb-4">
              <Shield size={24} className="text-red-600" />
              <h3 className="text-xl font-semibold">Безопасность</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Логирование действий</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Ограничение по IP</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время сессии (минуты)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={60}
                />
              </div>
              
              <Button variant="outline" className="w-full">Просмотреть логи</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}