/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MutableRefObject } from 'react';
import { render } from 'ink-testing-library';
import { act } from 'react-dom/test-utils';
import { describe, it, expect, vi } from 'vitest';
import {
  TokenUsageProvider,
  useTokenUsage,
  useTokenUsageApi,
} from './TokenUsageContext.js';

const TestHarness = ({
  usageRef,
  apiRef,
}: {
  usageRef: MutableRefObject<ReturnType<typeof useTokenUsage> | undefined>;
  apiRef: MutableRefObject<ReturnType<typeof useTokenUsageApi> | undefined>;
}) => {
  usageRef.current = useTokenUsage();
  apiRef.current = useTokenUsageApi();
  return null;
};

describe('TokenUsageContext (scaffold)', () => {
  it('provides default values via useTokenUsage', () => {
    const usageRef: MutableRefObject<
      ReturnType<typeof useTokenUsage> | undefined
    > = { current: undefined };
    const apiRef: MutableRefObject<
      ReturnType<typeof useTokenUsageApi> | undefined
    > = { current: undefined };

    render(
      <TokenUsageProvider>
        <TestHarness usageRef={usageRef} apiRef={apiRef} />
      </TokenUsageProvider>,
    );

    const usage = usageRef.current!;
    expect(usage.currentInputTokens).toBe(0);
    expect(usage.memoryTokens).toBe(0);
    expect(usage.highWaterMark).toBe(0);
    expect(usage.modelContextLimit).toBeNull();
    expect(usage.compressionThreshold).toBeNull();
    expect(usage.lastSuccessfulRequestTokenCount).toBeNull();
  });

  it('updates via api.update and notifies subscribers', () => {
    const usageRef: MutableRefObject<
      ReturnType<typeof useTokenUsage> | undefined
    > = { current: undefined };
    const apiRef: MutableRefObject<
      ReturnType<typeof useTokenUsageApi> | undefined
    > = { current: undefined };

    const { unmount } = render(
      <TokenUsageProvider>
        <TestHarness usageRef={usageRef} apiRef={apiRef} />
      </TokenUsageProvider>,
    );

    const api = apiRef.current!;
    const cb = vi.fn();
    // subscribe should invoke immediately with current snapshot
    const unsubscribe = api.subscribe(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].highWaterMark).toBe(0);

    act(() => {
      api.update({ highWaterMark: 123 });
    });

    // subscriber should be notified with new value
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[1][0].highWaterMark).toBe(123);

    // consumer hook snapshot should reflect update (render triggered)
    expect(usageRef.current!.highWaterMark).toBe(123);

    // unsubscribe and ensure no further notifications
    unsubscribe();

    act(() => {
      api.update({ highWaterMark: 456 });
    });

    expect(cb).toHaveBeenCalledTimes(2);
    expect(usageRef.current!.highWaterMark).toBe(456);

    unmount();
  });
});
