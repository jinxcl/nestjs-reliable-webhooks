import { afterEach, describe, expect, it, vi } from 'vitest';

import { verifyWebhookSignature } from '../crypto/verify-webhook-signature';
import type { ResolvedWebhookModuleOptions } from '../module/webhook-module-options';
import { WebhookClient } from './webhook.client';

const TIMESTAMP = 1_720_000_000;

const options: ResolvedWebhookModuleOptions = {
  secret: 'whsec_default',
  signatureHeader: 'x-webhook-signature',
  timeoutInMilliseconds: 5_000,
};

describe('WebhookClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sends a signed JSON webhook', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(TIMESTAMP * 1_000);
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('accepted', { status: 202 }));

    vi.stubGlobal('fetch', fetchMock);

    const client = new WebhookClient(options);

    const result = await client.send({
      url: 'https://customer.example.com/webhooks',
      event: 'order.created',
      payload: {
        orderId: 'order_123',
      },
    });

    expect(result).toEqual({
      url: 'https://customer.example.com/webhooks',
      event: 'order.created',
      ok: true,
      statusCode: 202,
      responseBody: 'accepted',
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(timeoutSpy).toHaveBeenCalledWith(5_000);

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] ?? [];

    expect(requestUrl).toBe('https://customer.example.com/webhooks');
    expect(requestOptions?.method).toBe('POST');

    const body = requestOptions?.body;

    if (typeof body !== 'string') {
      throw new Error('Expected webhook body to be a string');
    }

    expect(body).toBe(
      '{"event":"order.created","payload":{"orderId":"order_123"}}',
    );

    const headers = new Headers(requestOptions?.headers);
    const signature = headers.get('x-webhook-signature');

    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('x-webhook-event')).toBe('order.created');
    expect(signature).not.toBeNull();

    expect(
      verifyWebhookSignature({
        payload: body,
        secret: 'whsec_default',
        signature: signature!,
        currentTimestamp: TIMESTAMP,
      }),
    ).toBe(true);
  });

  it('supports a delivery-specific secret and custom headers', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(TIMESTAMP * 1_000);

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));

    vi.stubGlobal('fetch', fetchMock);

    const client = new WebhookClient(options);

    await client.send({
      url: 'https://customer.example.com/webhooks',
      event: 'invoice.paid',
      payload: {
        invoiceId: 'invoice_123',
      },
      secret: 'whsec_delivery',
      headers: {
        'x-api-key': 'api_test',
        'content-type': 'text/plain',
        'x-webhook-signature': 'invalid',
      },
    });

    const requestOptions = fetchMock.mock.calls[0]?.[1];
    const body = requestOptions?.body;

    if (typeof body !== 'string') {
      throw new Error('Expected webhook body to be a string');
    }

    const headers = new Headers(requestOptions?.headers);
    const signature = headers.get('x-webhook-signature');

    expect(headers.get('x-api-key')).toBe('api_test');
    expect(headers.get('content-type')).toBe('application/json');

    expect(
      verifyWebhookSignature({
        payload: body,
        secret: 'whsec_delivery',
        signature: signature!,
        currentTimestamp: TIMESTAMP,
      }),
    ).toBe(true);
  });

  it('returns unsuccessful HTTP responses without hiding them', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('service unavailable', { status: 503 }));

    vi.stubGlobal('fetch', fetchMock);

    const client = new WebhookClient(options);

    await expect(
      client.send({
        url: 'https://customer.example.com/webhooks',
        event: 'order.created',
        payload: {},
      }),
    ).resolves.toEqual({
      url: 'https://customer.example.com/webhooks',
      event: 'order.created',
      ok: false,
      statusCode: 503,
      responseBody: 'service unavailable',
    });
  });

  it('rejects invalid or unsupported URLs', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    const client = new WebhookClient(options);

    await expect(
      client.send({
        url: 'ftp://customer.example.com/webhooks',
        event: 'order.created',
        payload: {},
      }),
    ).rejects.toThrow('Webhook URL must be a valid HTTP or HTTPS URL');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
