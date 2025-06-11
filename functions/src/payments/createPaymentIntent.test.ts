jest.mock('firebase-functions', () => {
  const original = jest.requireActual('firebase-functions');
  return {
    ...original,
    config: () => ({
      stripe: { secret_key: 'sk_test_123' }
    }),
    https: original.https,
    HttpsError: original.https.HttpsError,
  };
});

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
      })),
      add: jest.fn(),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => ({
            empty: true,
            docs: [],
          })),
        })),
      })),
    })),
  })),
}));

// Mock Stripe
const mockCreate = jest.fn();
const mockStripe = jest.fn().mockImplementation(() => ({
  paymentIntents: {
    create: mockCreate,
  },
}));
jest.mock('stripe', () => {
  return jest.fn().mockImplementation((...args) => mockStripe(...args));
});

import { createPaymentIntentHandler } from './createPaymentIntent';
import * as functions from 'firebase-functions';

describe('createPaymentIntent', () => {
  it('should be defined', () => {
    expect(createPaymentIntentHandler).toBeDefined();
  });

  it('should call Stripe paymentIntents.create', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pi_test',
      client_secret: 'secret_test',
      status: 'requires_payment_method',
      created: 1234567890,
    });
    const data = { amount: 1000, currency: 'usd' };
    const context: functions.https.CallableContext = { auth: { uid: 'user123' } } as functions.https.CallableContext;
    const result = await createPaymentIntentHandler(data, context);
    expect(mockCreate).toHaveBeenCalledWith({
      amount: 1000,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    expect(result).toEqual({ clientSecret: 'secret_test' });
  });

  // More comprehensive tests would mock context, data, and external services
}); 