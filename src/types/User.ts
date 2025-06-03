// src/types/User.ts

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isHost: boolean;
  isAdmin?: boolean;
  address?: string;
  emailVerified: boolean;
  createdAt: Date;
  stripeAccountId?: string; // Stripe Connect account ID for host payouts
} 