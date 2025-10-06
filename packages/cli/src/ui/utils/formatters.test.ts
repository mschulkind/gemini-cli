/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { formatTokenCount } from './formatters.js';

describe('formatTokenCount', () => {
  it('returns "0" for zero', () => {
    expect(formatTokenCount(0)).toBe('0');
  });

  it('returns "999" for 999', () => {
    expect(formatTokenCount(999)).toBe('999');
  });

  it('returns "1.0k" for 1000 (short form)', () => {
    expect(formatTokenCount(1000)).toBe('1.0k');
  });

  it('returns "12.3k" for 12345 (short form)', () => {
    expect(formatTokenCount(12345)).toBe('12.3k');
  });

  it('returns "12,345" for 12345 when short=false (full form)', () => {
    expect(formatTokenCount(12345, false)).toBe('12,345');
  });
});
