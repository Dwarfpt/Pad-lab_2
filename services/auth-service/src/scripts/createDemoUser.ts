import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const createDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-parking');
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingDemo = await User.findOne({ email: 'demo@example.com' });
    if (existingDemo) {
      console.log('Demo user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Create demo user
    const demoUser = new User({
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
      language: 'ro',
      isActive: true,
      emailVerified: true
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@example.com');
    console.log('🔑 Password: demo123');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createDemoUser();