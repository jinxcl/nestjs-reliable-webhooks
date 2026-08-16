# NestJS Reliable Webhooks

Typed webhook delivery utilities for NestJS with HMAC signing and extensible transports.

> This project is currently under active development and is not yet published to npm.

## Current features

- Typed webhook input contract
- HMAC-SHA256 webhook signatures
- Deterministic timestamps for testing
- TypeScript declarations
- Unit tests

## Example

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

## Requirements

- Node.js 20 or newer
- NestJS 11
- TypeScript

## Roadmap

- Signature verification
- Configurable NestJS module
- HTTP webhook transport
- Typed webhook client
- Testing utilities

## License

MIT