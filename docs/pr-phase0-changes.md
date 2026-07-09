# PR Draft: Phase 0 — Observations, AI Log, UI review flow

## Summary
This PR collects Phase 0 work done with the coding agent: observations, AI log entry, fixture annotations for manual review, and UI additions to surface verification and review cues.

## Changes (high level)
- Documentation
  - Updated [docs/phase0-observations.md](docs/phase0-observations.md) with a Phase 0 observations draft.
  - Appended a usage entry in [docs/ai-log.md](docs/ai-log.md) recording agent actions and human decisions.
- Fixtures
  - Annotated review-focused fields in [src/fixtures/phase-0/messy-reports.json](src/fixtures/phase-0/messy-reports.json): added `annotationsNeeded`, `reviewNotes`, and `sensitive` flags to selected records.
- Frontend behavior/UI
  - `App.tsx`: lifted `records` into state and added `updateRecord(recordId, changes)` handler.
  - `Phase0Workbench.tsx`: added verification action buttons (mark `verified` / `needs_review` / `unverified`) that update the local UI state.
  - `RecordCard.tsx` and `Phase0RawInfoPanel.tsx`: show `annotationsNeeded` badges and `sensitive` marker.

## Files changed (main)
- [docs/phase0-observations.md](docs/phase0-observations.md)
- [docs/ai-log.md](docs/ai-log.md)
- [src/fixtures/phase-0/messy-reports.json](src/fixtures/phase-0/messy-reports.json)
- [src/app/App.tsx](src/app/App.tsx)
- [src/features/phase-0/Phase0Workbench.tsx](src/features/phase-0/Phase0Workbench.tsx)
- [src/features/phase-0/Phase0RawInfoPanel.tsx](src/features/phase-0/Phase0RawInfoPanel.tsx)
- [src/components/RecordCard.tsx](src/components/RecordCard.tsx)

(See repo diff for exact edits.)

## Rationale
- Make manual review cues explicit in fixtures so reviewers know what to verify.
- Provide a minimal UI workflow for human verification without adding persistent storage or backend.
- Keep automated heuristics conservative: tests still expect `needs_review` for certain records, so fixtures remain non-destructive.

## How to test locally
1. Install & run dev server:

```bash
pnpm install
pnpm dev
```

2. Open the app at `http://localhost:5173/` (or the port printed, e.g. `5174`).
3. Go to **原始資訊** and **整理工作台** to see `需確認` badges and `敏感資訊` markers.
4. Select a record in the workbench and use the **驗證操作** buttons to change `verificationStatus` in the UI.
5. Run the test suite:

```bash
pnpm test
pnpm build
pnpm check
```

All tests should pass.

## Suggested PR title
Phase 0: observations, AI-log entry, review annotations & basic verification UI

## Suggested reviewers
- @maintainers

## Notes
- Current verification actions update in-memory UI state only and do not persist to a backend. If you want persistence, we should add a small API or save to a local JSON file via a script/utility.

---

If this draft looks good I can:
- Create a feature branch and commit the changes locally (provide git commands), or
- Draft the PR body on GitHub for you (requires push to a branch). 
