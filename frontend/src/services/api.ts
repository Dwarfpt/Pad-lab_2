import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Таймаут 10 секунд
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Ошибка запроса:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Превышено время ожидания запроса');
    } else if (!error.response) {
      toast.error('Ошибка сети. Проверьте подключение к интернету');
    } else if (error.response?.status === 401) {
      toast.error('Сеанс истёк. Войдите снова');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('Доступ запрещён');
    } else if (error.response?.status === 404) {
      toast.error('Ресурс не найден');
    } else if (error.response?.status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже');
    }
    
    console.error('❌ Ошибка ответа:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
