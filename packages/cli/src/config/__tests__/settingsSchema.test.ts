/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { getSettingsSchema } from '../settingsSchema.js';

describe('settingsSchema', () => {
  it('includes ui.footer.showTokenCounts with default=false and showInDialog=true', () => {
    const schema = getSettingsSchema();
    const footerProps = schema.ui?.properties?.footer?.properties as
      | Record<string, unknown>
      | undefined;
    expect(footerProps).toBeDefined();
    type SettingSchemaProp = {
      type?: string;
      default?: unknown;
      showInDialog?: boolean;
      [k: string]: unknown;
    };
    const showTokenCounts = footerProps?.['showTokenCounts'] as
      | SettingSchemaProp
      | undefined;
    expect(showTokenCounts).toBeDefined();
    expect(showTokenCounts!.type).toBe('boolean');
    expect(showTokenCounts!.default).toBe(false);
    expect(showTokenCounts!.showInDialog).toBe(true);
  });
});
