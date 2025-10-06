/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { test } from 'vitest';
import { renderWithProviders as render } from '../../test-utils/render.js';
import { TokenUsageProvider, useTokenUsage, useTokenUsageApi } from '../TokenUsageContext.js';
import { SessionStatsProvider } from '../contexts/SessionContext.js';

function TestApp() {
  const usage = useTokenUsage();
  const api = useTokenUsageApi();
  React.useEffect(() => {
    // Simulate a save_memory tool completing with returned token counts.
    api.update({ memoryTokens: 789, lastSuccessfulRequestTokenCount: 1000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  // Use React.createElement to avoid JSX parsing issues in .ts files.
  return React.createElement('pre', { 'data-testid': 'usage' }, JSON.stringify(usage));
}

test('save_memory updates TokenUsage.memoryTokens', async () => {
  const result = render(
    // Create elements without JSX to keep the file compatible with .ts extension.
    React.createElement(
      SessionStatsProvider,
      null,
      React.createElement(
        TokenUsageProvider,
        null,
        React.createElement(TestApp, null),
      ),
    ),
  );

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

  await waitForCondition(() => {
    const frame = result.lastFrame();
    const usage = JSON.parse(frame || '{}');
    return usage.memoryTokens === 789 && usage.lastSuccessfulRequestTokenCount === 1000;
  });
});