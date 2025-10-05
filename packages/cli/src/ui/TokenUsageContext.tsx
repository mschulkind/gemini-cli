/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';

/**
 * Minimal in-file TokenUsage types (scaffold).
 * The original design referenced packages/cli/src/ui/TokenUsageTypes.ts;
 * that file was not present in the repository, so the provider exposes
 * the same minimal shapes here for the scaffold and tests.
 */

export type ReadonlyTokenUsage = {
  currentInputTokens: number;
  memoryTokens: number;
  modelContextLimit: number | null;
  compressionThreshold: number | null;
  highWaterMark: number;
  lastSuccessfulRequestTokenCount: number | null;
};

export type TokenUsageApi = {
  get(): ReadonlyTokenUsage;
  subscribe(cb: (s: ReadonlyTokenUsage) => void): () => void;
  update(patch: Partial<ReadonlyTokenUsage>): void;
};

const DEFAULT_TOKEN_USAGE: ReadonlyTokenUsage = {
  currentInputTokens: 0,
  memoryTokens: 0,
  modelContextLimit: null,
  compressionThreshold: null,
  highWaterMark: 0,
  lastSuccessfulRequestTokenCount: null,
};

const ApiContext = createContext<TokenUsageApi | undefined>(undefined);
const SnapshotContext = createContext<ReadonlyTokenUsage | undefined>(
  undefined,
);

/**
 * TokenUsageProvider
 *
 * Provides a minimal, well-typed TokenUsage API:
 * - read hook: useTokenUsage() -> snapshot (readonly)
 * - api hook: useTokenUsageApi() -> get/subscribe/update (internal)
 *
 * Implementation notes:
 * - local state via useState for rerenders
 * - ref to current snapshot for synchronous reads
 * - Set of subscribers to notify on updates
 */
export function TokenUsageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] =
    useState<ReadonlyTokenUsage>(DEFAULT_TOKEN_USAGE);
  const snapshotRef = useRef<ReadonlyTokenUsage>(DEFAULT_TOKEN_USAGE);
  const subscribersRef = useRef(new Set<(s: ReadonlyTokenUsage) => void>());

  const get = useCallback(() => snapshotRef.current, []);

  const subscribe = useCallback((cb: (s: ReadonlyTokenUsage) => void) => {
    subscribersRef.current.add(cb);
    // Call immediately with current snapshot for convenience
    cb(snapshotRef.current);
    return () => {
      subscribersRef.current.delete(cb);
    };
  }, []);

  const update = useCallback((patch: Partial<ReadonlyTokenUsage>) => {
    const next = { ...snapshotRef.current, ...patch };
    // Update ref first for synchronous reads
    snapshotRef.current = next;
    // Update React state to trigger rerenders
    setSnapshot(next);
    // Notify subscribers
    for (const cb of Array.from(subscribersRef.current)) {
      try {
        cb(next);
      } catch {
        // swallow subscriber errors to avoid affecting update flow
      }
    }
  }, []);

  const api: TokenUsageApi = {
    get,
    subscribe,
    update,
  };

  return (
    <ApiContext.Provider value={api}>
      <SnapshotContext.Provider value={snapshot}>
        {children}
      </SnapshotContext.Provider>
    </ApiContext.Provider>
  );
}

/**
 * Hook: useTokenUsage
 * Consumer-facing read-only hook returning the current snapshot.
 */
export function useTokenUsage(): ReadonlyTokenUsage {
  const ctx = useContext(SnapshotContext);
  if (!ctx) {
    throw new Error('useTokenUsage must be used within a TokenUsageProvider');
  }
  return ctx;
}

/**
 * Hook: useTokenUsageApi
 * Internal API for updating and subscribing (for tests/instrumentation).
 */
export function useTokenUsageApi(): TokenUsageApi {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error(
      'useTokenUsageApi must be used within a TokenUsageProvider',
    );
  }
  return api;
}
