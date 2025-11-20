export const APP_NAME = 'Smart Parking System';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
} as const;

export const PARKING_SLOT_TYPES = {
  STANDARD: 'standard',
  DISABLED: 'disabled',
  ELECTRIC: 'electric',
  FAMILY: 'family',
} as const;

export const PARKING_SLOT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const TARIFF_TYPES = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export const LANGUAGES = {
  EN: 'en',
  RU: 'ru',
  RO: 'ro',
} as const;
