// src/types/ParkingSpot.ts

export interface ParkingSpot {
  id?: string;
  eventId: string;
  address: string;
  description: string;
  price: number;
  images: string[];
  availability: {
    start: string;
    end: string;
  };
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: string;
} 