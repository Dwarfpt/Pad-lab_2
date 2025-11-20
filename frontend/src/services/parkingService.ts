import api from './api';

export interface CreateParkingData {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  totalSlots: number;
  pricePerHour: number;
  openingHours?: { open: string; close: string };
  amenities?: string[];
  description?: string;
}

export const parkingService = {
  getAllParkings: async () => {
    const response = await api.get('/parkings');
    return response.data;
  },

  getParkingById: async (id: string) => {
    const response = await api.get(`/parkings/${id}`);
    return response.data;
  },

  createParking: async (data: CreateParkingData) => {
    const response = await api.post('/parkings', data);
    return response.data;
  },

  updateParking: async (id: string, data: Partial<CreateParkingData>) => {
    const response = await api.put(`/parkings/${id}`, data);
    return response.data;
  },

  deleteParking: async (id: string) => {
    const response = await api.delete(`/parkings/${id}`);
    return response.data;
  },

  getNearbyParkings: async (lat: number, lng: number, radius?: number) => {
    const response = await api.get('/parkings/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },
};
