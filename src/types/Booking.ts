// src/types/Booking.ts

export interface Booking {
  id: string;
  parkingSpotId: string;
  userId: string;
  hostId: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
} 