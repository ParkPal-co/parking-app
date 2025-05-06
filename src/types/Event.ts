// src/types/Event.ts

export interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate: Date;
  expectedAttendance: number;
  imageUrl?: string;
  createdAt: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  distance?: number; // Distance from user's location in kilometers
} 