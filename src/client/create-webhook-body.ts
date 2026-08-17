export function createWebhookBody<TPayload>(
  event: string,
  payload: TPayload,
): string {
  if (typeof event !== 'string' || event.trim().length === 0) {
    throw new Error('Webhook event must not be empty');
  }

  if (payload === undefined) {
    throw new Error('Webhook payload must be defined');
  }

  try {
    return JSON.stringify({
      event,
      payload,
    });
  } catch (error) {
    throw new Error('Webhook payload must be JSON serializable', {
      cause: error,
    });
  }
}
