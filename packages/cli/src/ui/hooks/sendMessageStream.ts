/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Helper utilities related to sendMessageStream instrumentation.
 *
 * These helpers provide a conservative token-count estimator (cheap heuristic)
 * and a function to update the TokenUsage API's highWaterMark. The heuristics
 * are intentionally conservative and defensive so instrumentation cannot
 * destabilize UX or tests.
 *
 * NOTE: This file is a minimal, proposed helper to centralize the logic used
 * by useGeminiStream instrumentation (T008).
 */
import type { PartListUnion, Part } from '@google/genai';
import type { TokenUsageApi, ReadonlyTokenUsage } from '../TokenUsageContext.js';

/**
 * Estimate token count for a query. This is a cheap heuristic used only for
 * UI instrumentation (highWaterMark); do not rely on it for correctness.
 *
 * Returns a positive integer or null when an estimate is not possible.
 */
export function estimateTokenCount(query: PartListUnion): number | null {
  if (typeof query === 'string') {
    const len = query.trim().length;
    if (len === 0) return 0;
    // Conservative heuristic: 1 token per ~4 chars.
    return Math.max(1, Math.ceil(len / 4));
  }

  if (Array.isArray(query)) {
    let chars = 0;
    for (const p of query as Part[]) {
      // Part shapes vary; attempt to read common text-like fields.
      const maybeText = (p as any).text ?? (p as any).value ?? (p as any).content;
      if (typeof maybeText === 'string') {
        chars += maybeText.length;
      }
    }
    if (chars === 0) return null;
    return Math.max(1, Math.ceil(chars / 4));
  }

  // Unknown shape: no estimate.
  return null;
}

/**
 * Safely update the TokenUsageApi.highWaterMark when the provided sentCount
 * is greater than the currently stored highWaterMark.
 *
 * This function is defensive: it will no-op if tokenUsageApi is undefined or its
 * getters/setters throw. It accepts undefined values for sentCount and will
 * not attempt updates in that case.
 */
export function updateHighWaterMark(
  tokenUsageApi: TokenUsageApi | undefined,
  sentCount: number | null | undefined,
): void {
  if (!tokenUsageApi) return;
  if (sentCount === null || sentCount === undefined) return;
  if (typeof sentCount !== 'number' || Number.isNaN(sentCount) || sentCount < 0) {
    return;
  }

  try {
    const snapshot: ReadonlyTokenUsage | undefined = tokenUsageApi.get?.();
    const currentHigh = snapshot?.highWaterMark;
    if (typeof currentHigh !== 'number' || Number.isNaN(currentHigh)) {
      // If no sensible current value, set to sentCount.
      tokenUsageApi.update?.({ highWaterMark: sentCount });
      return;
    }

    if (sentCount > currentHigh) {
      tokenUsageApi.update?.({ highWaterMark: sentCount });
    }
  } catch {
    // Swallow errors to avoid affecting UX/tests.
  }
}