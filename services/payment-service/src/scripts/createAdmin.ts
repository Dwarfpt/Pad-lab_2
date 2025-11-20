import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-parking-system';

async function createAdmin() {
  try {
    console.log('Подключение к MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Подключено к MongoDB');

    // Проверяем, существует ли администратор
    const existingAdmin = await User.findOne({ email: 'admin@smartparking.com' });
    
    if (existingAdmin) {
      console.log('\n⚠️  Администратор уже существует!');
      console.log('Email:', existingAdmin.email);
      console.log('ID:', existingAdmin._id);
      console.log('Роль:', existingAdmin.role);
      
      // Обновляем пароль
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('\n✓ Пароль обновлен на: admin123');
    } else {
      // Создаем нового администратора
      const admin = await User.create({
        email: 'admin@smartparking.com',
        password: 'admin123',
        firstName: 'Администратор',
        lastName: 'Системы',
        role: 'super-admin',
        isActive: true,
        isEmailVerified: true,
        language: 'ru',
        preferredCurrency: 'MDL',
        balance: {
          USD: 0,
          EUR: 0,
          MDL: 0
        }
      });

      console.log('\n✓ Администратор создан успешно!');
      console.log('Email: admin@smartparking.com');
      console.log('Пароль: admin123');
      console.log('ID:', admin._id);
      console.log('Роль:', admin.role);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nОтключено от MongoDB');
  }
}

createAdmin();
