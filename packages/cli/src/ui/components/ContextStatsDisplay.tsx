/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { useSessionStats } from '../contexts/SessionContext.js';
import { formatDuration } from '../utils/formatters.js';

export const ContextStatsDisplay: React.FC = () => {
  const { stats } = useSessionStats();
  const {
    metrics,
    sessionStartTime,
    sessionId,
    promptCount,
    lastPromptTokenCount,
  } = stats;

  const now = Date.now();
  const wallMs = now - new Date(sessionStartTime).getTime();
  const modelCount = metrics?.models ? Object.keys(metrics.models).length : 0;
  const toolCalls = metrics?.tools?.totalCalls ?? 0;
  const totalLinesAdded = metrics?.files?.totalLinesAdded ?? 0;
  const totalLinesRemoved = metrics?.files?.totalLinesRemoved ?? 0;

  return (
    <Box
      borderStyle="round"
      borderColor={theme.border.default}
      flexDirection="column"
      paddingY={1}
      paddingX={2}
    >
      <Text bold color={theme.text.accent}>
        Context Stats (debug)
      </Text>
      <Box height={1} />

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Session ID:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>{sessionId}</Text>
        </Box>
      </Box>

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Wall Time:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>{formatDuration(wallMs)}</Text>
        </Box>
      </Box>

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Models Tracked:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>{modelCount}</Text>
        </Box>
      </Box>

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Tool Calls:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>{toolCalls}</Text>
        </Box>
      </Box>

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Code Changes:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>
            <Text color={theme.status.success}>+{totalLinesAdded}</Text>{' '}
            <Text color={theme.status.error}>-{totalLinesRemoved}</Text>
          </Text>
        </Box>
      </Box>

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Prompts Sent:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>{promptCount}</Text>
        </Box>
      </Box>

      <Box>
        <Box width={28}>
          <Text color={theme.text.link}>Last Prompt Tokens:</Text>
        </Box>
        <Box>
          <Text color={theme.text.primary}>{lastPromptTokenCount ?? '--'}</Text>
        </Box>
      </Box>
    </Box>
  );
};
