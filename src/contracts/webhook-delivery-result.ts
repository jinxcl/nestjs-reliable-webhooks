export interface WebhookDeliveryResult {
  readonly url: string;
  readonly event: string;
  readonly ok: boolean;
  readonly statusCode: number;
  readonly responseBody: string;
}
