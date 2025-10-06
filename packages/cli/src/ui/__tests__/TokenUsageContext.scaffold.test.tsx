/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TokenUsageProvider, useTokenUsage, useTokenUsageApi } from '../../TokenUsageContext';

function Probe() {
  const usage = useTokenUsage();
  const api = useTokenUsageApi();
  const snapshot = api.get();
  return (
    <div>
      <span data-testid="current">{usage.currentInputTokens}</span>
      <span data-testid="high">{snapshot.highWaterMark}</span>
    </div>
  );
}

test('TokenUsageProvider scaffold mounts and exposes hooks', () => {
  render(
    <TokenUsageProvider>
      <Probe />
    </TokenUsageProvider>,
  );

  // Smoke assertions to ensure hooks are usable and provider mounted.
  expect(screen.getByTestId('current')).toBeTruthy();
  expect(screen.getByTestId('high')).toBeTruthy();
});