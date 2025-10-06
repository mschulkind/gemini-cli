/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TokenUsageProvider, useTokenUsage, useTokenUsageApi } from '../TokenUsageContext.js';
import { updateHighWaterMark } from './sendMessageStream.js';

function TestFooter() {
  const usage = useTokenUsage();
  return React.createElement('div', { 'data-testid': 'footer' }, String(usage.highWaterMark));
}

function Updater({ sentCount }: { sentCount: number }) {
  const api = useTokenUsageApi();
  React.useEffect(() => {
    updateHighWaterMark(api, sentCount);
  }, [api, sentCount]);
  return null;
}

describe('sendMessageStream integration (T014)', () => {
  it('updates highWaterMark when sendMessageStream resolves and footer reflects the change', async () => {
    const sentCount = 1234;
    render(
      React.createElement(
        TokenUsageProvider,
        null,
        React.createElement(Updater, { sentCount }),
        React.createElement(TestFooter, null),
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId('footer').textContent).toBe(String(sentCount));
    });
  });
});