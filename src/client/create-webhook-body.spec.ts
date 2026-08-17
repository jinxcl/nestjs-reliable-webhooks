import { describe, expect, it } from 'vitest';

import { createWebhookBody } from './create-webhook-body';

describe('createWebhookBody', () => {
  it('creates a deterministic JSON body', () => {
    expect(
      createWebhookBody('order.created', {
        orderId: 'order_123',
        total: 49_990,
      }),
    ).toBe(
      '{"event":"order.created","payload":{"orderId":"order_123","total":49990}}',
    );
  });

  it('rejects an empty event', () => {
    expect(() => createWebhookBody('   ', {})).toThrow(
      'Webhook event must not be empty',
    );
  });

  it('rejects an undefined payload', () => {
    expect(() => createWebhookBody('order.created', undefined)).toThrow(
      'Webhook payload must be defined',
    );
  });

  it('rejects a non-serializable payload', () => {
    expect(() =>
      createWebhookBody('order.created', {
        total: 1n,
      }),
    ).toThrow('Webhook payload must be JSON serializable');
  });
});
