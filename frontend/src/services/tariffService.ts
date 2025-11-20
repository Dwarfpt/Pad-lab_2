import api from './api';

export interface TariffData {
  name: string;
  description: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  price: number;
  duration: number;
  features?: string[];
}

export const tariffService = {
  getAllTariffs: async () => {
    const response = await api.get('/tariffs');
    return response.data;
  },

  getTariffById: async (id: string) => {
    const response = await api.get(`/tariffs/${id}`);
    return response.data;
  },

  createTariff: async (data: TariffData) => {
    const response = await api.post('/tariffs', data);
    return response.data;
  },

  updateTariff: async (id: string, data: Partial<TariffData>) => {
    const response = await api.put(`/tariffs/${id}`, data);
    return response.data;
  },

  deleteTariff: async (id: string) => {
    const response = await api.delete(`/tariffs/${id}`);
    return response.data;
  },
};
