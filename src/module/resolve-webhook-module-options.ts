import { validateHeaderName } from 'node:http';

import {
  DEFAULT_SIGNATURE_HEADER,
  DEFAULT_TIMEOUT_IN_MILLISECONDS,
} from './webhook.constants';
import {
  ResolvedWebhookModuleOptions,
  WebhookModuleOptions,
} from './webhook-module-options';

export function resolveWebhookModuleOptions(
  options: WebhookModuleOptions,
): ResolvedWebhookModuleOptions {
  if (options === null || typeof options !== 'object') {
    throw new Error('Webhook module options are required');
  }

  if (typeof options.secret !== 'string' || options.secret.length === 0) {
    throw new Error('Webhook secret must not be empty');
  }

  const signatureHeader = options.signatureHeader ?? DEFAULT_SIGNATURE_HEADER;

  try {
    validateHeaderName(signatureHeader);
  } catch {
    throw new Error(
      'Webhook signature header must be a valid HTTP header name',
    );
  }

  const timeoutInMilliseconds =
    options.timeoutInMilliseconds ?? DEFAULT_TIMEOUT_IN_MILLISECONDS;

  if (
    !Number.isSafeInteger(timeoutInMilliseconds) ||
    timeoutInMilliseconds <= 0
  ) {
    throw new Error('Webhook timeout must be a positive safe integer');
  }

  return Object.freeze({
    secret: options.secret,
    signatureHeader: signatureHeader.toLowerCase(),
    timeoutInMilliseconds,
  });
}
