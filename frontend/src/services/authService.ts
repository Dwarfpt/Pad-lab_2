import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language?: 'en' | 'ru' | 'ro';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  generateQRCode: async () => {
    const response = await api.post('/auth/qr-code');
    return response.data;
  },
};
