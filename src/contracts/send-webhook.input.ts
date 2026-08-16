export interface SendWebhookInput<TPayload = unknown> {
  readonly url: string;
  readonly event: string;
  readonly payload: TPayload;
}