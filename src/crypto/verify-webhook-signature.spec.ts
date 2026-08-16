import { describe, expect, it } from 'vitest';

import { createWebhookSignature } from './create-webhook-signature';
import { verifyWebhookSignature } from './verify-webhook-signature';

describe('verifyWebhookSignature', () => {
  const payload = '{"orderId":"order_123"}';
  const secret = 'whsec_test';
  const timestamp = 1720000000;

  const signature = createWebhookSignature({
    payload,
    secret,
    timestamp,
  });

  it('accepts a valid signature', () => {
    expect(
      verifyWebhookSignature({
        payload,
        secret,
        signature,
        currentTimestamp: timestamp,
      }),
    ).toBe(true);
  });

  it('rejects an altered payload', () => {
    expect(
      verifyWebhookSignature({
        payload: '{"orderId":"order_456"}',
        secret,
        signature,
        currentTimestamp: timestamp,
      }),
    ).toBe(false);
  });

  it('rejects an expired signature', () => {
    expect(
      verifyWebhookSignature({
        payload,
        secret,
        signature,
        toleranceInSeconds: 300,
        currentTimestamp: timestamp + 301,
      }),
    ).toBe(false);
  });

  it('rejects a malformed signature', () => {
    expect(
      verifyWebhookSignature({
        payload,
        secret,
        signature: 'invalid-signature',
        currentTimestamp: timestamp,
      }),
    ).toBe(false);
  });

  it('rejects an incorrect secret', () => {
    expect(
      verifyWebhookSignature({
        payload,
        secret: 'whsec_different',
        signature,
        currentTimestamp: timestamp,
      }),
    ).toBe(false);
  });

  it('rejects an invalid current timestamp', () => {
    expect(() =>
      verifyWebhookSignature({
        payload,
        secret,
        signature,
        currentTimestamp: Number.NaN,
      }),
    ).toThrow('Current timestamp must be a non-negative safe integer');
  });

  it('rejects an empty secret', () => {
    expect(() =>
      verifyWebhookSignature({
        payload,
        secret: '',
        signature,
        currentTimestamp: timestamp,
      }),
    ).toThrow('Webhook secret must not be empty');
  });

  it('rejects an invalid tolerance', () => {
    expect(() =>
      verifyWebhookSignature({
        payload,
        secret,
        signature,
        toleranceInSeconds: -1,
        currentTimestamp: timestamp,
      }),
    ).toThrow('Signature tolerance must be a non-negative integer');
  });
});
