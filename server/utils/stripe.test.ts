import { describe, it, expect } from 'vitest';
import { isRegistrationEvent } from './stripe';
import type Stripe from 'stripe';

// Mock event structure
const createMockEvent = (type: string, payment_status?: string) => ({
  type,
  data: {
    object: {
      payment_status,
    }
  }
} as unknown as Stripe.Event);

describe('isRegistrationEvent', () => {
  it('should return true for checkout.session.completed with payment_status="paid"', () => {
    const event = createMockEvent('checkout.session.completed', 'paid');
    expect(isRegistrationEvent(event)).toBe(true);
  });

  it('should return false for checkout.session.completed with payment_status="unpaid"', () => {
    const event = createMockEvent('checkout.session.completed', 'unpaid');
    expect(isRegistrationEvent(event)).toBe(false);
  });

  it('should return true for checkout.session.async_payment_succeeded', () => {
    const event = createMockEvent('checkout.session.async_payment_succeeded');
    expect(isRegistrationEvent(event)).toBe(true);
  });

  it('should return false for checkout.session.async_payment_failed', () => {
    const event = createMockEvent('checkout.session.async_payment_failed');
    expect(isRegistrationEvent(event)).toBe(false);
  });
});
