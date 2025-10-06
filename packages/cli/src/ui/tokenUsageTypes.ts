/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Token usage types for the CLI UI.
 *
 * Designed per T003: minimal TokenUsage interface + TokenUsageApi surface.
 * Nullable fields are used where a value may be unknown.
 *
 * Reference: plans/enrich-context-window.md
 */

export interface TokenUsage {
  /**
   * Number of tokens in the current input (user message) that will be / were sent.
   * Nullable when unknown.
   */
  currentInputTokens: number | null;

  /**
   * Tokens used/stored in memory (e.g., saved memories token footprint).
   * Nullable when unknown.
   */
  memoryTokens: number | null;

  /**
   * The model context limit (e.g., 32768).
   * Nullable when unknown.
   */
  modelContextLimit: number | null;

  /**
   * Compression threshold (token count where compression should be considered).
   * Nullable when unknown.
   */
  compressionThreshold: number | null;

  /**
   * Highest observed sent token count recorded for the session.
   * Nullable when unknown.
   */
  highWaterMark: number | null;

  /**
   * Token count recorded for the last successful request (used to update highWaterMark).
   * Nullable when unknown.
   */
  lastSuccessfulRequestTokenCount: number | null;
}

/**
 * Minimal API surface for reading/updating TokenUsage.
 * Implementations may extend or provide stronger typing as needed.
 */
export interface TokenUsageApi {
  /**
   * Get the current TokenUsage snapshot.
   */
  get(): TokenUsage;

  /**
   * Subscribe to TokenUsage updates.
   * Returns an unsubscribe callback.
   */
  subscribe(cb: (usage: TokenUsage) => void): () => void;

  /**
   * Apply a partial update to the TokenUsage state.
   */
  update(partial: Partial<TokenUsage>): void;

  /**
   * Reset to defaults (optional).
   */
  reset?(): void;
}

/**
 * Conservative defaults where values are unknown.
 */
export const DEFAULT_TOKEN_USAGE: TokenUsage = {
  currentInputTokens: null,
  memoryTokens: null,
  modelContextLimit: null,
  compressionThreshold: null,
  highWaterMark: null,
  lastSuccessfulRequestTokenCount: null,
};