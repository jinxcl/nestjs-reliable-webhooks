import { DynamicModule, Module } from '@nestjs/common';

import { resolveWebhookModuleOptions } from './resolve-webhook-module-options';
import { WEBHOOK_MODULE_OPTIONS } from './webhook.constants';
import {
  WebhookModuleAsyncOptions,
  WebhookModuleOptions,
} from './webhook-module-options';

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
      ],
      exports: [WEBHOOK_MODULE_OPTIONS],
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
      ],
      exports: [WEBHOOK_MODULE_OPTIONS],
    };
  }
}
