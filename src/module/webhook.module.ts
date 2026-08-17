import { Module } from '@nestjs/common';
import type { DynamicModule, FactoryProvider } from '@nestjs/common';

import { WebhookClient } from '../client/webhook.client';
import { resolveWebhookModuleOptions } from './resolve-webhook-module-options';
import { WEBHOOK_MODULE_OPTIONS } from './webhook.constants';
import type {
  ResolvedWebhookModuleOptions,
  WebhookModuleAsyncOptions,
  WebhookModuleOptions,
} from './webhook-module-options';

const webhookClientProvider: FactoryProvider<WebhookClient> = {
  provide: WebhookClient,
  inject: [WEBHOOK_MODULE_OPTIONS],
  useFactory: (options: ResolvedWebhookModuleOptions): WebhookClient =>
    new WebhookClient(options),
};

@Module({})
export class WebhookModule {
  static forRoot(options: WebhookModuleOptions): DynamicModule {
    const resolvedOptions = resolveWebhookModuleOptions(options);

    return {
      module: WebhookModule,
      providers: [
        {
          provide: WEBHOOK_MODULE_OPTIONS,
          useValue: resolvedOptions,
        },
        webhookClientProvider,
      ],
      exports: [WEBHOOK_MODULE_OPTIONS, WebhookClient],
    };
  }

  static forRootAsync(options: WebhookModuleAsyncOptions): DynamicModule {
    return {
      module: WebhookModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: WEBHOOK_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: async (...dependencies: unknown[]) => {
            const moduleOptions = await options.useFactory(...dependencies);

            return resolveWebhookModuleOptions(moduleOptions);
          },
        },
        webhookClientProvider,
      ],
      exports: [WEBHOOK_MODULE_OPTIONS, WebhookClient],
    };
  }
}
