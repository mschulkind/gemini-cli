/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { tokenLimit } from '@google/gemini-cli-core';
import { formatTokenCount } from '../utils/formatters.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useConfig } from '../contexts/ConfigContext.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { isNarrowWidth } from '../utils/isNarrowWidth.js';

export const ContextUsageDisplay = ({
  promptTokenCount,
  model,
}: {
  promptTokenCount: number;
  model: string;
}) => {
  const settings = useSettings();
  const config = useConfig();
  const { columns: terminalWidth } = useTerminalSize();

  // Prefer explicit user setting; fallback to the runtime-wired config property
  const showTokenCounts =
    settings.merged.ui?.footer?.showTokenCounts ??
    (config as unknown as { showTokenCounts?: boolean }).showTokenCounts ??
    false;

  const screenReaderMode =
    !!settings.merged.ui?.accessibility?.screenReader || false;

  // Fallback: original percentage display
  const percentage = promptTokenCount / tokenLimit(model);

  if (!showTokenCounts) {
    return (
      <Text color={theme.text.secondary}>
        ({((1 - percentage) * 100).toFixed(0)}% context left)
      </Text>
    );
  }

  const narrow = isNarrowWidth(terminalWidth);
  const useShort = narrow;

  const usedShort = formatTokenCount(promptTokenCount, useShort);
  const limit = tokenLimit(model);
  const limitShort = formatTokenCount(limit, useShort);

  if (screenReaderMode) {
    // Expose both short (visible) and full integers (for screen readers)
    const usedFull = formatTokenCount(promptTokenCount, false);
    const limitFull = formatTokenCount(limit, false);
    return (
      <Text color={theme.text.secondary}>
        ({usedShort} / {limitShort} — {usedFull} out of {limitFull})
      </Text>
    );
  }

  return (
    <Text color={theme.text.secondary}>
      ({usedShort} / {limitShort})
    </Text>
  );
};
