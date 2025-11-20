import { create } from 'zustand';

interface ParkingSlot {
  id: string;
  slotNumber: string;
  isOccupied: boolean;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'standard' | 'disabled' | 'electric' | 'family';
}

interface Parking {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  slots?: ParkingSlot[];
}

interface ParkingState {
  parkings: Parking[];
  selectedParking: Parking | null;
  setParkings: (parkings: Parking[]) => void;
  setSelectedParking: (parking: Parking | null) => void;
  updateParkingSlots: (parkingId: string, availableSlots: number) => void;
  updateSlot: (parkingId: string, slotId: string, data: Partial<ParkingSlot>) => void;
}

export const useParkingStore = create<ParkingState>((set) => ({
  parkings: [],
  selectedParking: null,
  setParkings: (parkings) => set({ parkings }),
  setSelectedParking: (parking) => set({ selectedParking: parking }),
  updateParkingSlots: (parkingId, availableSlots) =>
    set((state) => ({
      parkings: state.parkings.map((p) =>
        p.id === parkingId ? { ...p, availableSlots } : p
      ),
    })),
  updateSlot: (parkingId, slotId, data) =>
    set((state) => ({
      selectedParking:
        state.selectedParking?.id === parkingId
          ? {
              ...state.selectedParking,
              slots: state.selectedParking.slots?.map((s) =>
                s.id === slotId ? { ...s, ...data } : s
              ),
            }
          : state.selectedParking,
    })),
}));
