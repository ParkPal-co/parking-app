export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isHost: boolean;
  isAdmin?: boolean;
  address?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  startDate: Date;
  endDate: Date;
  expectedAttendance: number;
  imageUrl?: string;
  createdAt: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface ParkingSpot {
  id: string;
  hostId: string;
  address: string;
  description: string;
  price: number;
  images: string[];
  availability: {
    start: Date;
    end: Date;
  };
  amenities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  eventId?: string; // Reference to the event this spot is listed for
}

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

export interface Review {
  id: string;
  parkingSpotId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
} 