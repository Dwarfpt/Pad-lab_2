import { io, Socket } from 'socket.io-client';
import { useParkingStore } from '../store/parkingStore';

class SocketService {
  private socket: Socket | null = null;
  private connectionAttempts = 0;
  private maxAttempts = 3;

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3003', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true, // Changed to true
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        this.connectionAttempts = 0;
      });

      this.socket.on('connect_error', () => {
        this.connectionAttempts++;
        if (this.connectionAttempts >= this.maxAttempts) {
          console.warn('⚠️ Socket connection unavailable (server offline). Real-time updates disabled.');
          // Gracefully handle - don't spam errors
          this.socket?.disconnect();
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });
      
      this.socket.on('parkingUpdate', (data: any) => {
        useParkingStore.getState().updateParkingSlots(data.parkingId, data.availableSlots);
      });

      this.socket.on('slotUpdate', (data: any) => {
        useParkingStore.getState().updateSlot(data.parkingId, data.slotId, {
          isOccupied: data.isOccupied,
          status: data.status,
        });
      });

      // Only connect when explicitly called
      try {
        this.socket.connect();
      } catch (error) {
        console.warn('⚠️ Failed to initialize socket connection');
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinParking(parkingId: string) {
    if (this.socket) {
      this.socket.emit('joinParking', parkingId);
    }
  }

  leaveParking(parkingId: string) {
    if (this.socket) {
      this.socket.emit('leaveParking', parkingId);
    }
  }
}

export default new SocketService();
