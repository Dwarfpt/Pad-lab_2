import mongoose from 'mongoose';
import User from '../models/User';

async function checkDatabases() {
  const databases = [
    'mongodb://127.0.0.1:27017/smart-parking',
    'mongodb://127.0.0.1:27017/smart-parking-system'
  ];

  for (const dbUri of databases) {
    try {
      console.log(`\n=== Проверка: ${dbUri} ===`);
      await mongoose.connect(dbUri);
      
      const admin = await User.findOne({ email: 'admin@smartparking.com' });
      
      if (admin) {
        console.log('✓ Найден пользователь admin@smartparking.com');
        console.log('  Имя:', admin.firstName, admin.lastName);
        console.log('  Роль:', admin.role);
        console.log('  ID:', admin._id);
      } else {
        console.log('✗ Пользователь admin@smartparking.com не найден');
      }
      
      const userCount = await User.countDocuments();
      console.log(`  Всего пользователей: ${userCount}`);
      
      await mongoose.disconnect();
    } catch (error: any) {
      console.log('✗ Ошибка подключения:', error.message);
    }
  }
}

checkDatabases();
