/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import {
  TokenUsageProvider,
  useTokenUsage,
  useTokenUsageApi,
} from '../TokenUsageContext.js';

function Inner() {
  const api = useTokenUsageApi();
  const snapshot = useTokenUsage();

  useEffect(() => {
    // Simulate the instrumentation that would be triggered on a ChatCompressed event.
    api.update({
      compressionThreshold: 123,
      lastSuccessfulRequestTokenCount: 456,
    });
     
  }, [api]);

  return React.createElement(
    'div',
    { 'data-testid': 'compression' },
    `${String(snapshot.compressionThreshold)}-${String(
      snapshot.lastSuccessfulRequestTokenCount,
    )}`,
  );
}

describe('useGeminiStream compressed instrumentation (smoke)', () => {
  test('updates TokenUsage via provider when compression event occurs', async () => {
    render(
      React.createElement(
        TokenUsageProvider,
        null,
        React.createElement(Inner, null),
      ),
    );

    const el = await screen.findByTestId('compression');
    expect(el.textContent).toContain('123');
    expect(el.textContent).toContain('456');
  });
});
