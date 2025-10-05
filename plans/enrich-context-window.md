# Enrich context window: show exact token counts (e.g. "12k / 768k")

## Purpose

Brief plan for adding exact token/usage numbers to the context/footer display instead of (or alongside) a percentage.

## Findings

- The CLI already surfaces chat-compression token counts in [`packages/cli/src/ui/hooks/useGeminiStream.ts`](packages/cli/src/ui/hooks/useGeminiStream.ts:584) (see the ChatCompressed message handling that includes `originalTokenCount` / `newTokenCount`).
- Quota and fallback messages are produced by [`packages/cli/src/ui/hooks/useQuotaAndFallback.ts`](packages/cli/src/ui/hooks/useQuotaAndFallback.ts:65) and will need consistent wording if token counts are shown.
- Footer visibility and model-info settings live in [`packages/cli/src/config/settingsSchema.ts`](packages/cli/src/config/settingsSchema.ts:319) and CLI config wiring in [`packages/cli/src/config/config.ts`](packages/cli/src/config/config.ts:662).
- Helpers for size formatting exist in [`packages/cli/src/ui/utils/formatters.ts`](packages/cli/src/ui/utils/formatters.ts:7) (used for memory/bytes). `formatMemoryUsage` demonstrates the formatting approach to reuse.
- Shell command binary output uses `formatMemoryUsage` in [`packages/cli/src/ui/hooks/shellCommandProcessor.ts`](packages/cli/src/ui/hooks/shellCommandProcessor.ts:190), a good precedent for reusing a small helper.
- The interactive UI root is rendered from [`packages/cli/src/gemini.tsx`](packages/cli/src/gemini.tsx:151); the `AppContainer` is the natural place to add footer/context UI changes.

## Design goals

- Display "used / limit" token counts (human-friendly shorthand: e.g., "12.3k / 768k") in the context/footer.
- Keep default behavior unchanged unless user enables the new display setting.
- Reuse existing formatting conventions and accessibility best practices (full numbers for screen readers).
- Source numbers from authoritative events/state rather than ad-hoc estimates.
- When the authoritative model max is unavailable, show the compression threshold that triggers automatic compression and surface a session high-water mark (largest successful context sent).

## Proposed changes (high-level)

1. Token-tracking in session state
   - Extend SessionStats (or add a small TokenUsageContext) to track:
     - currentInputTokens
     - memoryTokens
     - modelContextLimit (if available)
     - compressionThreshold (the token count at which the client/server requests compression)
     - highWaterMark (largest token count successfully sent to the API during this session)
   - Instrument sources of truth:
     - ChatCompressed events in [`packages/cli/src/ui/hooks/useGeminiStream.ts`](packages/cli/src/ui/hooks/useGeminiStream.ts:584) provide original/new token counts and can populate compressionThreshold and last-compressed values.
     - `save_memory` / memory-tool outcomes handled in `handleCompletedTools` should update memoryTokens when relevant.
     - Instrument the successful API-response path (where sendMessageStream resolves) to record the token count that was sent for that successful request and update highWaterMark.
2. Formatting helper
   - Add `formatTokenCount()` adjacent to [`packages/cli/src/ui/utils/formatters.ts`](packages/cli/src/ui/utils/formatters.ts:7) that returns short ("12.3k") and full forms for accessibility.
3. Footer / Context UI
   - Update `AppContainer` (or the dedicated footer component) to read token usage from SessionStats/TokenUsageContext and render:
     - used / limit (if modelContextLimit available)
     - compression threshold (label: "Compression at: X tokens") if authoritative limit unavailable
     - session high-water mark (label: "High: X tokens")
   - Respect existing settings `ui.footer.hideModelInfo` and `ui.hideContextSummary`.
   - Use shorthand on narrow terminals; expose full values to screen readers.
4. Settings
   - Add `ui.footer.showTokenCounts` (boolean, showInDialog: true) to [`packages/cli/src/config/settingsSchema.ts`](packages/cli/src/config/settingsSchema.ts:337).
   - Optionally add `ui.footer.showTokenHighWaterMark` (boolean) if separate control is desired.
   - Wire through `loadCliConfig` in [`packages/cli/src/config/config.ts`](packages/cli/src/config/config.ts:662).
5. Tests
   - Unit tests for `formatTokenCount` in `packages/cli/src/ui/utils/formatters.test.ts`.
   - Unit tests for TokenUsageContext behavior.
   - Integration tests simulating ChatCompressed events in `useGeminiStream` to ensure SessionStats update and footer rendering.
   - Integration test that simulates successful API responses to verify highWaterMark updates.

## Implementation plan (step-by-step)

- Step 1 (1–2h): Add `formatTokenCount()` to [`packages/cli/src/ui/utils/formatters.ts`](packages/cli/src/ui/utils/formatters.ts:7) and accompanying unit tests.
- Step 2 (1–2h): Extend SessionStats or add a `TokenUsageContext` that components can read. Include fields:
  - currentInputTokens, memoryTokens, modelContextLimit, compressionThreshold, highWaterMark, lastSuccessfulRequestTokenCount.
- Step 3 (1–3h): Emit token updates:
  - From ChatCompressed handling in [`packages/cli/src/ui/hooks/useGeminiStream.ts`](packages/cli/src/ui/hooks/useGeminiStream.ts:584) to update compressionThreshold and to record original/new counts.
  - From `handleCompletedTools` where `save_memory` is processed to update memoryTokens.
  - From the success path after `sendMessageStream` resolves to update lastSuccessfulRequestTokenCount and potentially highWaterMark.
- Step 4 (1h): UI: update footer rendering in `AppContainer` (or a footer component) to show "used / limit", compression threshold, and session high-water mark when enabled. Ensure screen-reader friendly labels.
- Step 5 (1h): Add settings `ui.footer.showTokenCounts` (and optional `ui.footer.showTokenHighWaterMark`) to [`packages/cli/src/config/settingsSchema.ts`](packages/cli/src/config/settingsSchema.ts:337) and wire through `loadCliConfig`.
- Step 6 (2h): Add tests + run integration tests.
- Step 7 (0.5–1h): Update docs (short note in docs/cli) describing new setting / behavior.

## Backward compatibility & UX notes

- Default: maintain current behavior unless the user enables the new setting.
- Terminal width constraints: show shorthand ("12.3k / 768k") on narrow displays; show full integers on wide displays.
- Accessibility: always expose full integer values and clear labels for screen readers.
- If the authoritative model context limit cannot be obtained, show compression threshold (when automatic compression triggers) and the session high-water mark as useful fallback information.

## Risks and open questions

- Where to derive authoritative model context limit:
  - Preferred: read it from the model metadata if exposed by the Gemini client / config.
  - Fallback: maintain a model-limit mapping in code/config.
- Ensuring asynchronous memory saves (`save_memory`) are reflected promptly in the counters.
- Confirm whether any other components render a percent and need synchronizing (search identified `useQuotaAndFallback` and compression messages).
- Persistence: decide whether highWaterMark should persist across sessions (suggestion: persist to local storage or Settings if desired).

## Candidate files to change

- [`packages/cli/src/ui/utils/formatters.ts`](packages/cli/src/ui/utils/formatters.ts:7)
- [`packages/cli/src/ui/hooks/useGeminiStream.ts`](packages/cli/src/ui/hooks/useGeminiStream.ts:584)
- [`packages/cli/src/ui/hooks/useQuotaAndFallback.ts`](packages/cli/src/ui/hooks/useQuotaAndFallback.ts:65)
- [`packages/cli/src/ui/hooks/shellCommandProcessor.ts`](packages/cli/src/ui/hooks/shellCommandProcessor.ts:190)
- [`packages/cli/src/config/settingsSchema.ts`](packages/cli/src/config/settingsSchema.ts:337)
- [`packages/cli/src/config/config.ts`](packages/cli/src/config/config.ts:662)
- [`packages/cli/src/gemini.tsx`](packages/cli/src/gemini.tsx:151) (AppContainer wiring)
- Footer component / `AppContainer`: [`packages/cli/src/ui/AppContainer.tsx`](packages/cli/src/ui/AppContainer.tsx:356)

## Estimate

- Total dev: ~9–16 hours (includes adding high-water mark and compression-threshold plumbing)
- Testing + docs: ~2–3 hours

## Next actions

- Implement Step 1 and Step 2, run unit tests, then proceed with UI wiring and integration tests.
- After Step 3, verify compression-threshold and high-water mark appear in test flows (ChatCompressed and successful API responses).
