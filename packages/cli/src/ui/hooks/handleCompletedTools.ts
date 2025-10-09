/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TrackedToolCall } from './useReactToolScheduler.js';
import type {
  TokenUsageApi,
  ReadonlyTokenUsage,
} from '../TokenUsageContext.js';

type SaveMemoryResult = {
  memoryTokens?: number;
  memory_token_count?: number;
  tokenCount?: number;
  totalTokens?: number;
  total_token_count?: number;
  // allow other unknown properties
  [key: string]: unknown;
};

export async function handleCompletedToolsInstrumentation(
  completedToolCallsFromScheduler: TrackedToolCall[],
  tokenUsageApi: TokenUsageApi | undefined,
  performMemoryRefresh: () => Promise<void>,
  processedMemoryToolsRef: Set<string>,
): Promise<void> {
  if (
    !completedToolCallsFromScheduler ||
    completedToolCallsFromScheduler.length === 0
  ) {
    return;
  }

  // Identify new, successful save_memory calls that we haven't processed yet.
  const newSuccessfulMemorySaves = completedToolCallsFromScheduler.filter(
    (t) =>
      t.request?.name === 'save_memory' &&
      t.status === 'success' &&
      !processedMemoryToolsRef.has(t.request.callId),
  );

  if (newSuccessfulMemorySaves.length === 0) {
    return;
  }

  // Trigger a memory refresh so any upstream consumers can re-query storage.
  // Fire-and-forget is intentional; callers should not be blocked by instrumentation.
  void performMemoryRefresh();

  try {
    for (const t of newSuccessfulMemorySaves) {
      const response = (t as unknown as { response?: unknown }).response;
      let memoryTokensFromTool: number | undefined = undefined;
      let overallTokenCount: number | undefined = undefined;

      // Handle array shape e.g. [ { memoryTokens: 123 } ]
      if (Array.isArray(response) && response.length === 1) {
        const first = response[0];
        if (first && typeof first === 'object') {
          const f = first as SaveMemoryResult;
          if (typeof f.memoryTokens === 'number') {
            memoryTokensFromTool = f.memoryTokens;
          }
          if (typeof f.memory_token_count === 'number') {
            memoryTokensFromTool = f.memory_token_count;
          }
          if (typeof f.tokenCount === 'number') {
            overallTokenCount = f.tokenCount;
          }
          if (typeof f.totalTokens === 'number') {
            overallTokenCount = f.totalTokens;
          }
          if (typeof f.total_token_count === 'number') {
            overallTokenCount = f.total_token_count;
          }
        }
      } else if (response && typeof response === 'object') {
        const r = response as SaveMemoryResult;
        if (typeof r.memoryTokens === 'number') {
          memoryTokensFromTool = r.memoryTokens;
        }
        if (typeof r.memory_token_count === 'number') {
          memoryTokensFromTool = r.memory_token_count;
        }
        if (typeof r.tokenCount === 'number') {
          overallTokenCount = r.tokenCount;
        }
        if (typeof r.totalTokens === 'number') {
          overallTokenCount = r.totalTokens;
        }
        if (typeof r.total_token_count === 'number') {
          overallTokenCount = r.total_token_count;
        }
      }

      // Fallback: try to parse a number from a human-readable resultDisplay string
      if (memoryTokensFromTool === undefined) {
        const display = (
          t as unknown as { response?: { resultDisplay?: unknown } }
        )?.response?.resultDisplay;
        if (typeof display === 'string') {
          const m = display.match(/(\d{1,7})/);
          if (m) {
            const parsed = Number(m[1]);
            if (!Number.isNaN(parsed)) memoryTokensFromTool = parsed;
          }
        }
      }

      const updatePayload: Partial<ReadonlyTokenUsage> = {};
      if (memoryTokensFromTool !== undefined) {
        updatePayload.memoryTokens = memoryTokensFromTool;
      }
      if (overallTokenCount !== undefined) {
        updatePayload.lastSuccessfulRequestTokenCount = overallTokenCount;
      }

      if (Object.keys(updatePayload).length > 0) {
        try {
          tokenUsageApi?.update?.(updatePayload);
        } catch {
          // Swallow instrumentation errors to avoid affecting UX.
        }
      }
    }
  } catch {
    // Defensive: do not let instrumentation errors propagate.
  }

  // Mark them as processed
  newSuccessfulMemorySaves.forEach((t) =>
    processedMemoryToolsRef.add(t.request.callId),
  );
}
