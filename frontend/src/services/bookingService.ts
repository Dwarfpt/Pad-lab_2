import api from './api';

interface CreateBookingPayload {
  parkingId: string;
  spotNumber: string;
  tariffId: string;
  startTime: string;
  useFreeBooking?: boolean;
}

interface BookingResponse {
  success: boolean;
  message: string;
  booking?: any;
}

class BookingService {
  /**
   * Создание нового бронирования
   */
  async createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
    try {
      const response = await api.post('/bookings', payload);
      return {
        success: true,
        message: response.data.message || 'Booking created successfully',
        booking: response.data.booking
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Получение списка бронирований пользователя
   */
  async getUserBookings() {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Получение активных бронирований
   */
  async getActiveBookings() {
    try {
      const response = await api.get('/bookings/active');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Отмена бронирования
   */
  async cancelBooking(bookingId: string) {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Завершение бронирования
   */
  async completeBooking(bookingId: string) {
    try {
      const response = await api.post(`/bookings/${bookingId}/complete`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Получение деталей бронирования
   */
  async getBookingDetails(bookingId: string) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const bookingService = new BookingService();
