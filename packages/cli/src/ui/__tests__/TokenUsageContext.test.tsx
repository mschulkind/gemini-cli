/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { describe, it, expect, vi } from 'vitest';
import {
  TokenUsageProvider,
  useTokenUsage,
  useTokenUsageApi,
} from '../TokenUsageContext.js';

function Probe({
  usageRef,
  apiRef,
}: {
  usageRef?: { current?: unknown };
  apiRef?: { current?: unknown };
}) {
  const usage = useTokenUsage();
  const api = useTokenUsageApi();
  if (usageRef) usageRef.current = usage;
  if (apiRef) apiRef.current = api;
  return (
    <div>
      <span data-testid="current">{String(usage.currentInputTokens)}</span>
      <span data-testid="high">{String(api.get().highWaterMark)}</span>
    </div>
  );
}

describe('TokenUsageContext (behavior tests)', () => {
  it('provides default values via useTokenUsage', () => {
    render(
      <TokenUsageProvider>
        <Probe />
      </TokenUsageProvider>,
    );

    expect(screen.getByTestId('current').textContent).toBe('0');
    // snapshot via api.get() should reflect defaults
    // Render another Probe to access api.get() indirectly
    const usageText = screen.getByTestId('current').textContent || '';
    expect(usageText).toContain('0');
  });

  it('notifies subscribers and updates consumer snapshot when api.update is called', () => {
    const usageRef: { current?: unknown } = {};
    const apiRef: { current?: unknown } = {};

    render(
      <TokenUsageProvider>
        <Probe usageRef={usageRef} apiRef={apiRef} />
      </TokenUsageProvider>,
    );

    const api = apiRef.current!;
    const cb = vi.fn();
    // subscribe should invoke immediately with current snapshot
    const unsubscribe = api.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].highWaterMark).toBe(0);

    act(() => {
      api.update({ highWaterMark: 900 });
    });

    // subscriber should be notified with new value
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[1][0].highWaterMark).toBe(900);

    // consumer hook snapshot should reflect update (render triggered)
    expect(usageRef.current!.highWaterMark).toBe(900);

    // unsubscribe and ensure no further notifications
    unsubscribe();

    act(() => {
      api.update({ highWaterMark: 1000 });
    });

    expect(cb).toHaveBeenCalledTimes(2);
    // usageRef should still reflect latest update because consumer hook updates on provider render
    expect(usageRef.current!.highWaterMark).toBe(1000);
  });
});
