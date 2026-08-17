import type { SendWebhookInput } from '../contracts/send-webhook.input';
import type { WebhookDeliveryResult } from '../contracts/webhook-delivery-result';
import { createWebhookSignature } from '../crypto/create-webhook-signature';
import type { ResolvedWebhookModuleOptions } from '../module/webhook-module-options';
import { createWebhookBody } from './create-webhook-body';

export class WebhookClient {
  constructor(private readonly options: ResolvedWebhookModuleOptions) {}

  async send<TPayload>(
    input: SendWebhookInput<TPayload>,
  ): Promise<WebhookDeliveryResult> {
    this.validateUrl(input.url);

    const body = createWebhookBody(input.event, input.payload);
    const secret = input.secret ?? this.options.secret;
    const signature = createWebhookSignature({
      payload: body,
      secret,
    });

    const headers = new Headers(input.headers);
    headers.set('content-type', 'application/json');
    headers.set('x-webhook-event', input.event);
    headers.set(this.options.signatureHeader, signature);

    const response = await fetch(input.url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(this.options.timeoutInMilliseconds),
    });

    return {
      url: input.url,
      event: input.event,
      ok: response.ok,
      statusCode: response.status,
      responseBody: await response.text(),
    };
  }

  private validateUrl(value: string): void {
    try {
      const url = new URL(value);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error();
      }
    } catch {
      throw new Error('Webhook URL must be a valid HTTP or HTTPS URL');
    }
  }
}
