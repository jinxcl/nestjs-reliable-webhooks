# NestJS Reliable Webhooks

Reliable, typed HTTP webhook delivery for NestJS with HMAC-SHA256 signing and verification.

## Installation

```bash
npm install nestjs-reliable-webhooks
```

## Current features

- Typed webhook input contract
- HMAC-SHA256 webhook signatures
- Deterministic timestamps for testing
- TypeScript declarations
- Unit tests
- HMAC-SHA256 signature verification
- Configurable timestamp tolerance to limit replay windows
- Timing-safe signature comparison
- Configurable NestJS module
- Synchronous and asynchronous module registration
- Validated signature header and HTTP timeout options
- Injectable HTTP webhook client
- Signed JSON `POST` delivery using native `fetch`
- Global or delivery-specific signing secrets
- Custom HTTP headers and configurable timeouts
- Structured delivery results for successful and failed responses

## Register the module

### Synchronous configuration

```ts
import { Module } from '@nestjs/common';
import { WebhookModule } from 'nestjs-reliable-webhooks';

@Module({
  imports: [
    WebhookModule.forRoot({
      secret: process.env.WEBHOOK_SECRET!,
      signatureHeader: 'x-webhook-signature',
      timeoutInMilliseconds: 10_000,
    }),
  ],
})
export class AppModule {}
```

### Asynchronous configuration

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookModule } from 'nestjs-reliable-webhooks';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WebhookModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('WEBHOOK_SECRET'),
        timeoutInMilliseconds: 10_000,
      }),
    }),
  ],
})
export class AppModule {}
```

## Send a webhook

```ts
import { Injectable } from '@nestjs/common';
import { WebhookClient } from 'nestjs-reliable-webhooks';

@Injectable()
export class OrderWebhookService {
  constructor(private readonly webhookClient: WebhookClient) {}

  async sendOrderCreated(orderId: string): Promise<void> {
    const result = await this.webhookClient.send({
      url: 'https://customer.example.com/webhooks',
      event: 'order.created',
      payload: {
        orderId,
      },
      headers: {
        'x-api-key': 'customer-api-key',
      },
    });

    if (!result.ok) {
      throw new Error(
        `Webhook delivery failed with status ${result.statusCode}`,
      );
    }
  }
}
```

The free client performs one immediate delivery attempt. Applications remain responsible for deciding how to handle network errors and unsuccessful HTTP responses.

The free version does not include persistence, automatic retries, delivery history, replay tools, metrics, or a management dashboard.

## Create a signature

```ts
import { createWebhookSignature } from 'nestjs-reliable-webhooks';

const signature = createWebhookSignature({
  payload: JSON.stringify({ orderId: 'order_123' }),
  secret: process.env.WEBHOOK_SECRET!,
});

console.log(signature);
```

The generated signature uses this format:

```text
t=<timestamp>,v1=<hmac-sha256>
```

Signatures are calculated from the exact serialized request body. Receivers must verify the signature using the raw body before parsing or modifying the JSON payload.

## Verify a signature

```ts
import { verifyWebhookSignature } from 'nestjs-reliable-webhooks';

const isValid = verifyWebhookSignature({
  payload,
  secret: process.env.WEBHOOK_SECRET!,
  signature,
  toleranceInSeconds: 300,
});

if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

## Requirements

- Node.js 20 or newer
- NestJS 11
- TypeScript

## Roadmap

- Testing utilities
- Additional integration examples

## License

MIT
