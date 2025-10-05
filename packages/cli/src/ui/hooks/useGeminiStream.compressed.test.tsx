import React from 'react';
import { render, screen, waitFor } from '../../test-utils/render';
import { TokenUsageProvider, useTokenUsage } from '../../TokenUsageContext';
import { useGeminiStream } from './useGeminiStream';
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
}: {
  client: { sendMessageStream: (q: unknown, s: AbortSignal, p?: string) => AsyncIterable<unknown> };
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
    client,
    history,
    addItem,
    config,
    settings,
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
  );

  React.useEffect(() => {
    void stream.submitQuery('hi');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usage = useTokenUsage();
  return <pre data-testid="usage">{JSON.stringify(usage)}</pre>;
}

test('ChatCompressed updates TokenUsage fields', async () => {
  const eventValue = {
    originalTokenCount: 5000,
    newTokenCount: 1200,
    compressionThreshold: 4000,
  };
  const client = makeMockGeminiClient(eventValue);

  render(
    <TokenUsageProvider>
      <TestApp client={client} />
    </TokenUsageProvider>,
  );

  await waitFor(() => {
    const pre = screen.getByTestId('usage');
    const usage = JSON.parse(pre.textContent || '{}');
    if (
      usage.compressionThreshold !== 4000 ||
      usage.lastSuccessfulRequestTokenCount !== 5000
    ) {
      throw new Error('TokenUsage not updated yet');
    }
  });
});