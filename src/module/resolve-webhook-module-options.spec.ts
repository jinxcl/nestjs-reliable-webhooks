import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SIGNATURE_HEADER,
  DEFAULT_TIMEOUT_IN_MILLISECONDS,
} from './webhook.constants';
import { resolveWebhookModuleOptions } from './resolve-webhook-module-options';
import type { WebhookModuleOptions } from './webhook-module-options';

describe('resolveWebhookModuleOptions', () => {
  it('applies default values', () => {
    expect(
      resolveWebhookModuleOptions({
        secret: 'whsec_test',
      }),
    ).toEqual({
      secret: 'whsec_test',
      signatureHeader: DEFAULT_SIGNATURE_HEADER,
      timeoutInMilliseconds: DEFAULT_TIMEOUT_IN_MILLISECONDS,
    });
  });

  it('normalizes a custom signature header', () => {
    expect(
      resolveWebhookModuleOptions({
        secret: 'whsec_test',
        signatureHeader: 'X-Custom-Signature',
        timeoutInMilliseconds: 5_000,
      }),
    ).toEqual({
      secret: 'whsec_test',
      signatureHeader: 'x-custom-signature',
      timeoutInMilliseconds: 5_000,
    });
  });

  it('rejects an empty secret', () => {
    expect(() =>
      resolveWebhookModuleOptions({
        secret: '',
      }),
    ).toThrow('Webhook secret must not be empty');
  });

  it('rejects an invalid signature header', () => {
    expect(() =>
      resolveWebhookModuleOptions({
        secret: 'whsec_test',
        signatureHeader: 'invalid header',
      }),
    ).toThrow('Webhook signature header must be a valid HTTP header name');
  });

  it('rejects an invalid timeout', () => {
    expect(() =>
      resolveWebhookModuleOptions({
        secret: 'whsec_test',
        timeoutInMilliseconds: 0,
      }),
    ).toThrow('Webhook timeout must be a positive safe integer');
  });

  it('rejects missing or invalid options', () => {
    expect(() =>
      resolveWebhookModuleOptions(null as unknown as WebhookModuleOptions),
    ).toThrow('Webhook module options are required');

    expect(() =>
      resolveWebhookModuleOptions('invalid' as unknown as WebhookModuleOptions),
    ).toThrow('Webhook module options are required');
  });
});
