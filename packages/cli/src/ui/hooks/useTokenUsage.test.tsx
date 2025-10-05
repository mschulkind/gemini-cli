/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  TokenUsageProvider,
  useTokenUsage,
  useTokenUsageApi,
} from '../TokenUsageContext.js';

function SnapshotView() {
  const s = useTokenUsage();
  return <div data-testid="values">{JSON.stringify(s)}</div>;
}

function UpdaterButton() {
  const api = useTokenUsageApi();
  return (
    <button
      data-testid="updater"
      onClick={() =>
        api.update({
          currentInputTokens: 123,
          memoryTokens: 456,
        })
      }
    >
      update
    </button>
  );
}

describe('useTokenUsage hook', () => {
  it('returns default values and updates when api.update is called', () => {
    render(
      <TokenUsageProvider>
        <SnapshotView />
        <UpdaterButton />
      </TokenUsageProvider>,
    );

    const values = screen.getByTestId('values').textContent || '';
    expect(values).toContain('"currentInputTokens":0');
    expect(values).toContain('"memoryTokens":0');

    // trigger update
    fireEvent.click(screen.getByTestId('updater'));

    const updated = screen.getByTestId('values').textContent || '';
    expect(updated).toContain('"currentInputTokens":123');
    expect(updated).toContain('"memoryTokens":456');
  });
});
