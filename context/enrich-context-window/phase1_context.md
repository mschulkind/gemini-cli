Working on T001..T015 from phase1 task list; this file records any higher-level decisions or notes for future subtasks.

## Notes / History

- 2025-10-05T21:36:21Z · Added formatTokenCount helper and updated task list status.
  - Files touched: packages/cli/src/ui/utils/formatters.ts, context/enrich-context-window/phase1.md
  - Decision: use 1 decimal place for shorthand values under 10 (e.g., "1.0k", "12.3k") and no decimals for values >= 10 (e.g., "12k"). Export function as `formatTokenCount(tokens: number, short = true)`.
- 2025-10-05T21:38:55Z · Added unit tests for formatTokenCount (T002).
  - Files touched: packages/cli/src/ui/utils/formatters.test.ts, context/enrich-context-window/phase1.md
  - Decision: Confirmed shorthand uses 1 decimal for values <10 (e.g., "1.0k", "4.5k") and no decimals for values >=10 (e.g., "12k"). Tests cover 0, 999, 1000, 12345.
- 2025-10-05T21:46:05Z · Designed TokenUsage types & API surface (T003).
  - Files touched: packages/cli/src/ui/TokenUsageTypes.ts, context/enrich-context-window/phase1.md
  - Decision: Minimal TokenUsage interface + TokenUsageApi surface; nullable fields used where value may be unknown.
- 2025-10-05T21:50:06Z · Implemented TokenUsageProvider scaffold, exported useTokenUsage & useTokenUsageApi. Files: packages/cli/src/ui/TokenUsageContext.tsx, packages/cli/src/ui/TokenUsageContext.test.tsx
- 2025-10-05T21:54:06Z · Implemented read hook + smoke test (T005).
  - Files touched: packages/cli/src/ui/hooks/useTokenUsage.test.tsx, context/enrich-context-window/phase1.md
  - Note: timestamps recorded in ISO 8601 UTC (Z).
- 2025-10-05T21:59:22Z · Instrumented ChatCompressed handling to update TokenUsage fields; files touched: packages/cli/src/ui/hooks/useGeminiStream.ts, packages/cli/src/ui/hooks/useGeminiStream.compressed.test.ts
- 2025-10-05T22:47:02Z · Fixed T006 test syntax and ensured TokenUsageProvider wrapping in tests (T006).
- 2025-10-05T22:50:01Z · Instrumented ChatCompressed handling to update TokenUsage fields; files: packages/cli/src/ui/hooks/useGeminiStream.ts, packages/cli/src/ui/hooks/useGeminiStream.compressed.test.ts
- 2025-10-05T23:29:30Z · Stabilized instrumentation types and tests: tightened useGeminiStream types, stabilized tokenUsageApi usage via ref, and marked T007 done.
- 2025-10-06T01:25:09Z · Tightened local instrumentation types (ChatCompressedPayload, SaveMemoryResult), added defensive parsing and test wrappers to stabilize unit tests (T006/T007).
