// src/types/Review.ts

export interface Review {
  id: string;
  parkingSpotId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
} 