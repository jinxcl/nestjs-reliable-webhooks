import { timingSafeEqual } from 'node:crypto';

import { createWebhookSignature } from './create-webhook-signature';

const SIGNATURE_PATTERN = /^t=(\d+),v1=([a-f0-9]{64})$/i;

export interface VerifyWebhookSignatureOptions {
  readonly payload: string;
  readonly secret: string;
  readonly signature: string;
  readonly toleranceInSeconds?: number;
  readonly currentTimestamp?: number;
}

export function verifyWebhookSignature({
  payload,
  secret,
  signature,
  toleranceInSeconds = 300,
  currentTimestamp = Math.floor(Date.now() / 1000),
}: VerifyWebhookSignatureOptions): boolean {
  if (secret.length === 0) {
    throw new Error('Webhook secret must not be empty');
  }

  if (!Number.isSafeInteger(toleranceInSeconds) || toleranceInSeconds < 0) {
    throw new Error('Signature tolerance must be a non-negative integer');
  }

  if (!Number.isSafeInteger(currentTimestamp) || currentTimestamp < 0) {
    throw new Error('Current timestamp must be a non-negative safe integer');
  }

  const match = SIGNATURE_PATTERN.exec(signature);

  if (match === null) {
    return false;
  }

  const timestampValue = match[1];
  const providedValue = match[2];

  if (timestampValue === undefined || providedValue === undefined) {
    return false;
  }

  const timestamp = Number(timestampValue);

  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(currentTimestamp - timestamp) > toleranceInSeconds
  ) {
    return false;
  }

  const expectedHeader = createWebhookSignature({
    payload,
    secret,
    timestamp,
  });

  const expectedValue = expectedHeader.slice(expectedHeader.indexOf('v1=') + 3);
  const providedBuffer = Buffer.from(providedValue, 'hex');
  const expectedBuffer = Buffer.from(expectedValue, 'hex');

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}
