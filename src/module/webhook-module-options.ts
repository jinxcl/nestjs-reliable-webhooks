import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export interface WebhookModuleOptions {
  readonly secret: string;
  readonly signatureHeader?: string;
  readonly timeoutInMilliseconds?: number;
}

export interface ResolvedWebhookModuleOptions {
  readonly secret: string;
  readonly signatureHeader: string;
  readonly timeoutInMilliseconds: number;
}

export interface WebhookModuleAsyncOptions
  extends
    Pick<ModuleMetadata, 'imports'>,
    Pick<FactoryProvider<WebhookModuleOptions>, 'inject' | 'useFactory'> {}
