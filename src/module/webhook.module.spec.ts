import 'reflect-metadata';

import type { DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { WEBHOOK_MODULE_OPTIONS } from './webhook.constants';
import type {
  ResolvedWebhookModuleOptions,
  WebhookModuleOptions,
} from './webhook-module-options';
import { WebhookModule } from './webhook.module';

class TestConfigService {
  getSecret(): string {
    return 'whsec_async';
  }
}

class TestConfigModule {}

const testConfigModule: DynamicModule = {
  module: TestConfigModule,
  providers: [TestConfigService],
  exports: [TestConfigService],
};

describe('WebhookModule', () => {
  it('registers resolved options in the NestJS container', async () => {
    const options: WebhookModuleOptions = {
      secret: 'whsec_test',
      signatureHeader: 'X-Custom-Signature',
      timeoutInMilliseconds: 5_000,
    };

    const testingModule = await Test.createTestingModule({
      imports: [WebhookModule.forRoot(options)],
    }).compile();

    expect(
      testingModule.get<ResolvedWebhookModuleOptions>(WEBHOOK_MODULE_OPTIONS),
    ).toEqual({
      secret: 'whsec_test',
      signatureHeader: 'x-custom-signature',
      timeoutInMilliseconds: 5_000,
    });

    await testingModule.close();
  });

  it('rejects invalid options during registration', () => {
    expect(() =>
      WebhookModule.forRoot({
        secret: '',
      }),
    ).toThrow('Webhook secret must not be empty');
  });

  it('registers options asynchronously', async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        WebhookModule.forRootAsync({
          imports: [testConfigModule],
          inject: [TestConfigService],
          useFactory: async (config: TestConfigService) => ({
            secret: config.getSecret(),
            timeoutInMilliseconds: 2_000,
          }),
        }),
      ],
    }).compile();

    expect(
      testingModule.get<ResolvedWebhookModuleOptions>(WEBHOOK_MODULE_OPTIONS),
    ).toEqual({
      secret: 'whsec_async',
      signatureHeader: 'x-webhook-signature',
      timeoutInMilliseconds: 2_000,
    });

    await testingModule.close();
  });

  it('registers asynchronous options without dependencies', async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        WebhookModule.forRootAsync({
          useFactory: () => ({
            secret: 'whsec_without_dependencies',
          }),
        }),
      ],
    }).compile();

    expect(
      testingModule.get<ResolvedWebhookModuleOptions>(WEBHOOK_MODULE_OPTIONS),
    ).toEqual({
      secret: 'whsec_without_dependencies',
      signatureHeader: 'x-webhook-signature',
      timeoutInMilliseconds: 10_000,
    });

    await testingModule.close();
  });
});
