/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { estimateTokenCount, updateHighWaterMark } from './sendMessageStream.js';

describe('estimateTokenCount', () => {
  it('estimates tokens for a short string', () => {
    // "Hello" => 5 chars -> ceil(5/4) = 2
    expect(estimateTokenCount('Hello')).toBe(2);
  });

  it('returns 0 for empty or whitespace-only string', () => {
    expect(estimateTokenCount('')).toBe(0);
    expect(estimateTokenCount('   ')).toBe(0);
  });

  it('estimates tokens for parts array', () => {
    const parts = [{ text: 'This is a test' } as any];
    // 14 chars -> ceil(14/4) = 4
    expect(estimateTokenCount(parts as any)).toBe(4);
  });

  it('returns null for unknown part shapes with no text-like fields', () => {
    const parts = [{ foo: 'bar' } as any];
    expect(estimateTokenCount(parts as any)).toBeNull();
  });
});

describe('updateHighWaterMark', () => {
  it('updates when sentCount is greater than current highWaterMark', () => {
    const update = vi.fn();
    const api = {
      get: () => ({ highWaterMark: 5 }),
      update,
    } as any;

    updateHighWaterMark(api, 10);
    expect(update).toHaveBeenCalledWith({ highWaterMark: 10 });
  });

  it('does not update when sentCount is not greater', () => {
    const update = vi.fn();
    const api = {
      get: () => ({ highWaterMark: 10 }),
      update,
    } as any;

    updateHighWaterMark(api, 5);
    expect(update).not.toHaveBeenCalled();
  });

  it('sets highWaterMark when current value is not a sensible number', () => {
    const update = vi.fn();
    const api = {
      get: () => ({}),
      update,
    } as any;

    updateHighWaterMark(api, 7);
    expect(update).toHaveBeenCalledWith({ highWaterMark: 7 });
  });

  it('no-ops when api is undefined or sentCount invalid', () => {
    // Should not throw
    updateHighWaterMark(undefined, 5);
    updateHighWaterMark({ get: () => ({ highWaterMark: 1 }), update: () => {} } as any, NaN);
  });
});