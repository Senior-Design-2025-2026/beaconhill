# Data

## High-level goals

Provide mock data and shared data shapes for local development and test mode so the app can run without the real backend. This directory is the single place for mock factories and initial data; tests and the UI should use the same contract so behavior stays consistent. As the app grows, you may add type-like shapes or constants that describe DynamoDB/API payloads here.

## Contents

| File | Purpose |
|------|---------|
| `mockData.js` | Mock item factory and initial list: `getInitialMockItems()`, `createMockItem()`. Used when `REACT_APP_MODE=test`. |
| `DATA.md` | This file - directory overview and conventions. |

## Purpose of files

- **mockData.js** - Exports functions that return mock items compatible with the app’s expectations (e.g. objects with `id`). `getInitialMockItems()` returns the starting list (e.g. `[]`); `createMockItem()` returns a single new item with a unique id (using `crypto.randomUUID()` when available, otherwise a fallback). Used so test mode and tests don’t depend on Cognito or the real API.
- **Future data modules** - You can add shared shapes, constants, or sample payloads that mirror the backend (DynamoDB/API) so components, hooks, and tests all use the same contract.

## How and where they are used

- **App.js** - Imports `createMockItem` and `getInitialMockItems` from `./data/mockData`. Uses `getInitialMockItems` as initial state for mock items and `createMockItem` in the “Add mock item” handler when `isTestMode` is true (see [APPLICATION.md](../../docs/APPLICATION.md) and config’s `REACT_APP_MODE=test`).
- **Tests** - Should use the same mock data (e.g. import from `src/data/mockData`) so unit and integration tests pass with a known data contract; see `src/test/TEST.md`.
- **Hooks / API** - In test mode, hooks or API wrappers may return data from `src/data/` instead of calling the real backend; production uses the API layer (`src/api/`).

## Conventions

- **Match backend shape** - Mock items should mirror the structure returned by the real API (e.g. DynamoDB items) so switching between mock and real data doesn’t break the UI.
- **No side effects** - Mock data functions should be pure (or only use safe built-ins like `crypto.randomUUID`); no network or storage.
- **Named exports** - Export specific functions (e.g. `getInitialMockItems`, `createMockItem`) so callers import only what they need.
- **Tests** - Write unit tests for any business logic in data helpers (e.g. id generation fallback); tests should pass with this mocked data.
- **Single source of truth** - Keep mock item shape and initial data in this directory; avoid duplicating mock structures in test files or components.
