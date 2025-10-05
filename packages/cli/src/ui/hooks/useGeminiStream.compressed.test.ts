/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { TokenUsageProvider, useTokenUsage } from '../TokenUsageContext.js';
import { useGeminiStream } from './useGeminiStream.js';

function Inner() {
  const snapshot = useTokenUsage();

  // Use the hook with minimal stubs; avoid `any` by using unknown casts and a
  // minimal local return type for the handler we need.
  type StreamHookReturn = {
    handleChatCompressionEvent?: (
      value: {
        originalTokenCount?: number;
        newTokenCount?: number;
        compressionThreshold?: number;
      },
      userMessageTimestamp: number,
    ) => void;
  };

  const callUseGeminiStream = useGeminiStream as unknown as (
    ...args: unknown[]
  ) => unknown;

  const streamHook = callUseGeminiStream(
    {} as unknown, // geminiClient
    [] as unknown, // history
    (() => {}) as unknown, // addItem
    {} as unknown, // config
    {} as unknown, // settings
    (() => {}) as unknown, // onDebugMessage
    (async () => false) as unknown, // handleSlashCommand
    false, // shellModeActive
    (() => undefined) as unknown, // getPreferredEditor
    (() => {}) as unknown, // onAuthError
    (async () => {}) as unknown, // performMemoryRefresh
    false, // modelSwitchedFromQuotaError
    (() => {}) as unknown, // setModelSwitchedFromQuotaError
    (() => {}) as unknown, // onEditorClose
    (() => {}) as unknown, // onCancelSubmit
    (() => {}) as unknown, // setShellInputFocused
    80, // terminalWidth
    24, // terminalHeight
  ) as unknown as StreamHookReturn;

  useEffect(() => {
    // Simulate ChatCompressed event payload
    const payload = {
      originalTokenCount: 1000,
      newTokenCount: 456,
      compressionThreshold: 123,
    };
    // Call the exposed handler on the hook (exists for testing/instrumentation).
    streamHook.handleChatCompressionEvent?.(payload, Date.now());
  }, [streamHook]);

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
    expect(el.textContent).toContain('123'); // compressionThreshold
    expect(el.textContent).toContain('456'); // lastSuccessfulRequestTokenCount (new/compressed count)
  });
});
