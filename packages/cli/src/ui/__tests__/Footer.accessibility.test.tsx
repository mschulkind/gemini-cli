/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { render } from 'ink-testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from '../components/Footer.js';
import * as useTerminalSize from '../hooks/useTerminalSize.js';
import { type UIState, UIStateContext } from '../contexts/UIStateContext.js';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { SettingsContext } from '../contexts/SettingsContext.js';
import { VimModeProvider } from '../contexts/VimModeContext.js';

vi.mock('../hooks/useTerminalSize.js');
const useTerminalSizeMock = vi.mocked(useTerminalSize.useTerminalSize);

const createMockConfig = (overrides = {}) => ({
  getModel: vi.fn(() => 'gemini-pro'),
  getTargetDir: vi.fn(() => '/Users/test/project'),
  getDebugMode: vi.fn(() => false),
  ...overrides,
});

const createMockUIState = (overrides: Partial<UIState> = {}): UIState =>
  ({
    sessionStats: {
      lastPromptTokenCount: 12345,
    },
    branchName: 'main',
    ...overrides,
  }) as UIState;

const createDefaultSettings = (
  options: {
    showMemoryUsage?: boolean;
    hideCWD?: boolean;
    hideSandboxStatus?: boolean;
    hideModelInfo?: boolean;
  } = {},
) =>
  ({
    merged: {
      ui: {
        showMemoryUsage: options.showMemoryUsage,
        footer: {
          hideCWD: options.hideCWD,
          hideSandboxStatus: options.hideSandboxStatus,
          hideModelInfo: options.hideModelInfo,
        },
      },
    },
  } as never);

const renderWithWidth = (width: number, uiState: UIState, settings = createDefaultSettings()) => {
  useTerminalSizeMock.mockReturnValue({ columns: width, rows: 24 });
  return render(
    <ConfigContext.Provider value={createMockConfig() as never}>
      <SettingsContext.Provider value={settings as never}>
        <VimModeProvider settings={settings as never}>
          <UIStateContext.Provider value={uiState}>
            <Footer />
          </UIStateContext.Provider>
        </VimModeProvider>
      </SettingsContext.Provider>
    </ConfigContext.Provider>,
  );
};

describe('<Footer /> accessibility', () => {
  it('renders both shorthand and full integer token counts for screen readers', () => {
    const uiState = createMockUIState();
    const { lastFrame } = renderWithWidth(120, uiState);
    const output = lastFrame();

    // Short form should appear (e.g., "12.3k") and full integer with commas (e.g., "12,345")
    expect(output).toContain('12.3k');
    expect(output).toContain('12,345');
  });
});