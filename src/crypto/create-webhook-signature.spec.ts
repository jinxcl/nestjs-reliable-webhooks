import { describe, expect, it } from 'vitest';

import { createWebhookSignature } from './create-webhook-signature';

describe('createWebhookSignature', () => {
  it('creates a deterministic HMAC-SHA256 signature', () => {
    const signature = createWebhookSignature({
      payload: '{"orderId":"order_123"}',
      secret: 'whsec_test',
      timestamp: 1720000000,
    });

    expect(signature).toBe(
      't=1720000000,v1=bfd8ac4cb3bd522dee654b6483bf8dd3992e7651293cdaaeeb11aa5aaaa19cb1',
    );
  });

  it('rejects an empty secret', () => {
    expect(() =>
      createWebhookSignature({
        payload: '{}',
        secret: '',
        timestamp: 1720000000,
      }),
    ).toThrow('Webhook secret must not be empty');
  });
});