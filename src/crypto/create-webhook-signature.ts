import { createHmac } from 'node:crypto';

export interface CreateWebhookSignatureOptions {
  readonly payload: string;
  readonly secret: string;
  readonly timestamp?: number;
}

export function createWebhookSignature({
  payload,
  secret,
  timestamp = Math.floor(Date.now() / 1000),
}: CreateWebhookSignatureOptions): string {
  if (secret.length === 0) {
    throw new Error('Webhook secret must not be empty');
  }

  if (!Number.isInteger(timestamp) || timestamp < 0) {
    throw new Error('Webhook timestamp must be a positive integer');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return `t=${timestamp},v1=${signature}`;
}
