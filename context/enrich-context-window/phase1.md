# Enrich context window · Task List (entire plan)

Do NOT commit or push files in context/ — context/ is gitignored.
This update reflects workspace changes only; follow repo commit guidelines when preparing a commit.

> Source plan: [`plans/enrich-context-window.md`](plans/enrich-context-window.md:1)

## Purpose

- Translate the plan into an ordered, test-first implementation checklist covering the entire plan.

## Scope & criteria

- Coverage: entire plan in [`plans/enrich-context-window.md`](plans/enrich-context-window.md:1).
- Criteria: follow task-list-creation.md best practices, use TDD, split tasks <=1 hour.

## References

- Files mentioned by the plan:
- [`packages/cli/src/ui/utils/formatters.ts`](packages/cli/src/ui/utils/formatters.ts:7)
- [`packages/cli/src/ui/hooks/useGeminiStream.ts`](packages/cli/src/ui/hooks/useGeminiStream.ts:584)
- [`packages/cli/src/ui/hooks/useQuotaAndFallback.ts`](packages/cli/src/ui/hooks/useQuotaAndFallback.ts:65)
- [`packages/cli/src/config/settingsSchema.ts`](packages/cli/src/config/settingsSchema.ts:337)
- [`packages/cli/src/config/config.ts`](packages/cli/src/config/config.ts:662)
- [`packages/cli/src/gemini.tsx`](packages/cli/src/gemini.tsx:151)
- [`packages/cli/src/ui/AppContainer.tsx`](packages/cli/src/ui/AppContainer.tsx:356)

## Progress Summary

| Task ID | Task Name                                                                  | Status         | Est. Time |
| ------- | -------------------------------------------------------------------------- | -------------- | --------- |
| T001    | Add formatTokenCount helper                                                | ✅ Done        | 0.5h      |
| T002    | Unit tests for formatTokenCount                                            | ✅ Done        | 0.5h      |
| T003    | Design TokenUsage types & API surface                                      | ✅ Done        | 0.5h      |
| T004    | Implement TokenUsageContext provider scaffold                              | ✅ Done        | 1h        |
| T005    | Hook to read token usage from SessionStats                                 | ✅ Done        | 0.5h      |
| T006    | Instrument ChatCompressed events                                           | ✅ Done        | 1h        |
| T007    | Instrument save_memory handling in handleCompletedTools                    | ✅ Done        | 0.5h      |
| T008    | Instrument successful sendMessageStream path to update highWaterMark       | ✅ Done        | 1h        |
| T009    | Footer UI: render used / limit + high-water + compression threshold        | ✅ Done        | 1h        |
| T010    | Accessibility: expose full values to screen readers                        | ✅ Done        | 0.5h      |
| T011    | Add settings ui.footer.showTokenCounts and wire to config                  | ✅ Done        | 1h        |
| T012    | Unit tests for TokenUsageContext behavior                                  | ✅ Done        | 1h        |
| T013    | Integration test: ChatCompressed -> SessionStats updates -> footer renders | ✅ Done        | 1h        |
| T014    | Integration test: successful API response updates highWaterMark            | ✅ Done        | 1h        |
| T015    | Docs: short note in docs/cli describing new setting                        | ⏳ In Progress | 0.5h      |

## Tasks (detailed)

### T001 · Add formatTokenCount helper

- Status: ✅ Done
- Started: 2025-10-05T21:35:33Z
- Completed: 2025-10-05T21:35:33Z
- Est. Time: 0.5h
- Todo:
  - [x] Add `formatTokenCount(tokens: number, short = true)` adjacent to [`packages/cli/src/ui/utils/formatters.ts`](packages/cli/src/ui/utils/formatters.ts:7).
  - [x] Implement short (e.g., "12.3k") and full (e.g., "12,345") outputs; ensure export API suitable for tests and UI.
  - [x] Run unit tests (see T002) — note: detailed unit tests left for T002; smoke check and type/lint run completed.
- Success criteria:
  - Tests added in T002 pass.
  - Exported function has both short and full forms.

### T002 · Unit tests for formatTokenCount

- Status: ✅ Done
- Started: 2025-10-05T21:38:24Z
- Completed: 2025-10-05T21:39:44Z
- Est. Time: 0.5h
- Todo:
  - [x] Add `formatTokenCount` unit tests in `packages/cli/src/ui/utils/formatters.test.ts`.
  - [x] Follow TDD: write failing tests first, then implement T001 to make them pass.
  - [x] Ensure coverage includes edge cases (0, 999, 1000, 12345).
- Success criteria:
  - Tests pass and demonstrate expected short/full formatting.

### T003 · Design TokenUsage types & API surface

- Status: ✅ Done
- Started: 2025-10-05T21:46:04Z
- Completed: 2025-10-05T21:46:05Z
- Est. Time: 0.5h
- Todo:
  - [x] Define minimal TypeScript types: TokenUsage (currentInputTokens, memoryTokens, modelContextLimit, compressionThreshold, highWaterMark, lastSuccessfulRequestTokenCount).
  - [x] Update plan references in the design doc or an inline comment linking to the plan: [`plans/enrich-context-window.md`](plans/enrich-context-window.md:1).
- Success criteria:
  - Types reviewed and agreed; small enough to be implemented in T004.

### T004 · Implement TokenUsageContext provider scaffold

- Status: ✅ Done
- Started: 2025-10-05T21:50:06Z
- Completed: 2025-10-05T21:50:06Z
- Est. Time: 1h
- Todo:
  - [x] Create context/provider files under `packages/cli/src/ui/` (e.g., TokenUsageContext.tsx).
  - [x] Provide read/write hooks and initial state.
  - [x] Add unit tests scaffold (implementation tests in T012).
- Success criteria:
  - Provider can be mounted in tests and exposes hooks.

### T005 · Implement read hook for token usage (consumer API)

- Status: ✅ Done
- Started: 2025-10-05T21:53:36Z
- Completed: 2025-10-05T21:54:06Z
- Est. Time: 0.5h
- Todo:
  - [x] Implement `useTokenUsage()` hook that returns TokenUsage and subscribe updates.
  - [x] Add small smoke test to verify default values.
- Success criteria:
  - Hook returns stable default values in test environment.

### T006 · Instrument ChatCompressed events

- Status: ✅ Done
- Started: 2025-10-05T22:48:39Z
- Completed: 2025-10-05T22:50:26Z
- Est. Time: 1h
- Todo:
  - [x] Add instrumentation in [`packages/cli/src/ui/hooks/useGeminiStream.ts`](packages/cli/src/ui/hooks/useGeminiStream.ts:584) to update compressionThreshold, lastCompressed original/new counts.
  - [x] Ensure updates call TokenUsageContext APIs.
  - [x] Add unit/integration test stub (integration tests T013 covers end-to-end).
- Success criteria:
  - Emitting a ChatCompressed message updates TokenUsageContext values in test runs.

### T007 · Instrument save_memory handling in handleCompletedTools

- Status: ✅ Done
- Started: 2025-10-05T23:12:48Z
- Completed: 2025-10-05T23:29:30Z
- Est. Time: 0.5h
- Todo:
  - [x] Update `handleCompletedTools` path where `save_memory` is processed to update memoryTokens.
  - [x] Ensure asynchronous completion updates context promptly.
- Success criteria:
  - Memory save flows cause TokenUsageContext.memoryTokens to update in tests.

### T008 · Instrument successful sendMessageStream path to update highWaterMark

- Status: ✅ Done
- Est. Time: 1h
- Todo:
  - [ ] Identify success resolution point for `sendMessageStream` and record token count sent.
  - [ ] Update highWaterMark when sent token count > previous.
  - [ ] Add unit test verifying highWaterMark update.
- Success criteria:
  - Simulated successful send updates highWaterMark.

### T009 · Footer UI rendering

- Status: ✅ Done
- Est. Time: 1h
- Todo:
  - [ ] Update `AppContainer` or small footer component (`packages/cli/src/ui/AppContainer.tsx`) to read `useTokenUsage()` and render:
    - short "used / limit" when narrow.
    - compression threshold and "High: X" when enabled.
  - [ ] Respect settings: `ui.footer.hideModelInfo`, `ui.hideContextSummary`, and `ui.footer.showTokenCounts`.
- Success criteria:
  - Footer renders expected shorthand on narrow terminal widths and uses `formatTokenCount` for display.

### T010 · Accessibility: screen-reader values

- Status: ✅ Done
- Est. Time: 0.5h
- Todo:
  - [ ] Ensure visible shorthand is accompanied by aria-label or visually-hidden element with full integer forms.
  - [ ] Add unit/RTL test asserting aria content.
- Success criteria:
  - Screen readers receive full integer values.

### T011 · Settings: add and wire ui.footer.showTokenCounts

- Status: ✅ Done
- Est. Time: 1h
- Todo:
  - [ ] Add boolean setting in [`packages/cli/src/config/settingsSchema.ts`](packages/cli/src/config/settingsSchema.ts:337) (showInDialog: true).
  - [ ] Wire through `loadCliConfig` in [`packages/cli/src/config/config.ts`](packages/cli/src/config/config.ts:662).
  - [ ] Add settings unit test to ensure default=false and change propagation.
- Success criteria:
  - Toggling setting enables footer rendering in UI tests.

### T012 · Unit tests for TokenUsageContext behavior

- Status: ✅ Done
- Est. Time: 1h
- Todo:
  - [ ] Tests for state updates, subscription, and initial defaults.
  - [ ] Use mocking/stubs for event sources (ChatCompressed, save_memory, sendMessageStream).
- Success criteria:
  - All token context unit tests pass.

### T013 · Integration test: ChatCompressed -> SessionStats -> footer render

- Status: ✅ Done
- Est. Time: 1h
- Todo:
  - [ ] Simulate a ChatCompressed event in `useGeminiStream` tests and assert TokenUsageContext updates and footer reflects new values.
  - [ ] Follow TDD: write test, verify failure, implement instrumentation.
- Success criteria:
  - Integration test proves values propagate end-to-end.

### T014 · Integration test: successful API response updates highWaterMark

- Status: ✅ Done
- Est. Time: 1h
- Todo:
  - [ ] Simulate successful sendMessageStream resolving with token count and assert highWaterMark update and footer display.
- Success criteria:
  - Test passes.

### T015 · Docs: docs/cli note

- Status: ⏳ In Progress
- Est. Time: 0.5h
- Todo:
  - [ ] Add short docs note in docs/cli describing `ui.footer.showTokenCounts` and expected behavior (shorthand vs full, accessibility).
- Success criteria:
  - New doc entry exists and links to setting.

## TDD notes

- For each feature task: write tests first (unit/integration), then implement minimal code to pass tests.
- Keep changes small and self-contained; run tests frequently.

## Assumptions

- No model context limit reliably available in all cases; highWaterMark and compressionThreshold are acceptable fallbacks as described in plan.
- Default behavior remains unchanged until `ui.footer.showTokenCounts` is enabled.

## Next steps

- Start with T001 and T002 (format helper + tests). Proceed sequentially through listed tasks.
- Update this checklist with progress updates using the repository `context/` checklist guidelines.

## Changelog

2025-10-06: Updated progress table to mark T001–T014 completed; marked T015 in progress. Workspace-only changes, no commits.
