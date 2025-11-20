import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Parking from '../models/Parking';
import Tariff from '../models/Tariff';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Подключено к MongoDB');

    // Очистка существующих данных
    await User.deleteMany({});
    await Parking.deleteMany({});
    await Tariff.deleteMany({});

    // Создание администратора
    const admin = await User.create({
      email: 'admin@smartparking.com',
      password: 'admin123',
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'super-admin',
      isActive: true,
      isEmailVerified: true,
      language: 'ru',
      balance: {
        USD: 100,
        EUR: 50,
        MDL: 1000,
      },
      preferredCurrency: 'MDL',
    });

    console.log('✅ Создан администратор:', admin.email);

    // Создание парковок
    const parkings = await Parking.create([
      {
        name: 'Центральная Парковка A',
        address: 'ул. Штефан чел Маре, 1',
        city: 'Кишинёв',
        country: 'Молдова',
        coordinates: { lat: 47.0245, lng: 28.8322 },
        totalSlots: 50,
        availableSlots: 45,
        pricePerHour: 5,
        openingHours: { open: '00:00', close: '23:59' },
        isActive: true,
      },
      {
        name: 'Торговый Центр Parking B',
        address: 'бул. Дачия, 53',
        city: 'Кишинёв',
        country: 'Молдова',
        coordinates: { lat: 47.0167, lng: 28.8497 },
        totalSlots: 100,
        availableSlots: 87,
        pricePerHour: 4,
        openingHours: { open: '08:00', close: '22:00' },
        isActive: true,
      },
    ]);

    console.log('✅ Создано парковок:', parkings.length);

    // Создание тарифов
    const tariffs = await Tariff.create([
      {
        name: 'Почасовой',
        description: 'Идеально для коротких остановок',
        type: 'hourly',
        price: 5,
        duration: 60,
        currency: 'MDL',
        features: ['Оплата по факту', 'Без обязательств', 'Доступ 24/7'],
        isActive: true,
      },
      {
        name: 'Дневной',
        description: 'Лучший выбор для дневных поездок',
        type: 'daily',
        price: 30,
        duration: 1440,
        currency: 'MDL',
        features: [
          'Неограниченный вход/выход',
          'Круглосуточный доступ',
          'Приоритетные места',
        ],
        isActive: true,
      },
      {
        name: 'Недельный',
        description: 'Отлично для еженедельных поездок',
        type: 'weekly',
        price: 150,
        duration: 10080,
        currency: 'MDL',
        features: [
          'Скидка 28%',
          'Зарезервированное место',
          'Неограниченный доступ',
        ],
        isActive: true,
      },
      {
        name: 'Месячный',
        description: 'Лучшая цена для постоянных пользователей',
        type: 'monthly',
        price: 500,
        duration: 43200,
        currency: 'MDL',
        features: [
          'Скидка 50%',
          'Гарантированное место',
          'VIP поддержка',
          'Бесплатная мойка',
        ],
        isActive: true,
      },
    ]);

    console.log('✅ Создано тарифов:', tariffs.length);

    console.log('\n🎉 Начальные данные успешно загружены!');
    console.log('\n📧 Логин администратора: admin@smartparking.com');
    console.log('🔑 Пароль: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    process.exit(1);
  }
};

seedData();
