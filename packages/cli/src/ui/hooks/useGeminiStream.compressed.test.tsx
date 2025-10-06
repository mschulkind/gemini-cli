import React from 'react';
import { test } from 'vitest';
import { renderWithProviders as render } from '../../test-utils/render.js';
import { TokenUsageProvider, useTokenUsage } from '../TokenUsageContext.js';
import { SessionStatsProvider } from '../contexts/SessionContext.js';
import { useGeminiStream } from './useGeminiStream.js';
import type { GeminiClient } from '@google/gemini-cli-core';
import { GeminiEventType as ServerGeminiEventType } from '@google/gemini-cli-core';

function makeMockGeminiClient(eventValue: {
  originalTokenCount?: number;
  newTokenCount?: number;
  compressionThreshold?: number;
}) {
  return {
    sendMessageStream: (
      _query: unknown,
      _signal: AbortSignal,
      _promptId?: string,
    ): AsyncIterable<unknown> => {
      async function* gen() {
        yield { type: ServerGeminiEventType.ChatCompressed, value: eventValue };
      }
      return gen();
    },
  };
}

function TestApp({
  client,
  eventValue,
}: {
  client: { sendMessageStream: (q: unknown, s: AbortSignal, p?: string) => AsyncIterable<unknown> };
  eventValue?: { originalTokenCount?: number; newTokenCount?: number; compressionThreshold?: number };
}) {
  const history: unknown[] = [];
  const addItem = (_item: unknown, _ts?: number) => {};
  const config = {
    getModel: () => 'test-model',
    setQuotaErrorOccurred: (_b: boolean) => {},
    getContentGeneratorConfig: () => ({ authType: 'none' as const }),
    getSessionId: () => 'sess',
    getMaxSessionTurns: () => 10,
    getCheckpointingEnabled: () => false,
  };
  const settings: unknown = {};
  const stream = useGeminiStream(
    client as unknown as GeminiClient,
    history as unknown as import('../types.js').HistoryItem[],
    addItem as any,
    config as unknown as Config,
    settings as unknown as LoadedSettings,
    () => {},
    async () => false,
    false,
    () => undefined,
    () => {},
    async () => {},
    false,
    () => {},
    () => {},
    () => {},
    80,
    24,
    undefined,
  );

  React.useEffect(() => {
    // Call the compression handler directly to exercise instrumentation deterministically.
    if (eventValue) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Promise.resolve().then(() =>
        // use a numeric timestamp similar to real usage
        stream.handleChatCompressionEvent(eventValue as any, Date.now()),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventValue]);

  const usage = useTokenUsage();
  return <pre data-testid="usage">{JSON.stringify(usage)}</pre>;
}

async function waitForCondition(predicate: () => boolean, timeout = 2000) {
  const start = Date.now();
  while (true) {
    try {
      if (predicate()) return;
    } catch {
      // swallow
    }
    if (Date.now() - start > timeout) throw new Error('Timed out waiting for condition');
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 20));
  }
}

test('ChatCompressed updates TokenUsage fields', async () => {
  const eventValue = {
    originalTokenCount: 5000,
    newTokenCount: 1200,
    compressionThreshold: 4000,
  };
  const client = makeMockGeminiClient(eventValue);

  const result = render(
    <SessionStatsProvider>
      <TokenUsageProvider>
        <TestApp client={client} eventValue={eventValue} />
      </TokenUsageProvider>
    </SessionStatsProvider>,
  );

  await waitForCondition(() => {
    const frame = result.lastFrame();
    const usage = JSON.parse(frame || '{}');
    return (
      usage.compressionThreshold === 4000 &&
      usage.lastSuccessfulRequestTokenCount === 5000
    );
  });
});