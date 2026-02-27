# Test

## High-level goals

Run the test suite with Jest and React Testing Library so that behavior and UI stay reliable as the app changes. Tests live under `src/test/` (and `src/setupTests.js` at repo root in `src/`); they should pass with the project’s test mode and mocked data.

## Contents

| File | Purpose |
|------|---------|
| `App.test.js` | Renders `App` and asserts that welcome text appears when in test mode (expects `REACT_APP_MODE=test`). |
| `setupTests.js` | (In `src/`) Loads `@testing-library/jest-dom` for DOM matchers (e.g. `toBeInTheDocument()`). |

## Purpose of files

- **Test files** - `*.test.js` files that import components or modules, render them (e.g. `render(<App />)`), and assert on output or behavior. They may use mocked API or auth so tests don’t hit real backends.
- **setupTests.js** - Runs once before each test file; extends Jest with jest-dom matchers used across the suite.

## How and where they are used

- **CI / local** - Run with `npm run test:ci` or `REACT_APP_MODE=test npm test` so the app runs in test mode and `App.test.js` sees the authenticated-style UI (welcome text) without a real login.
- **Jest** - Discover tests under `src/` (e.g. `src/test/**/*.test.js`); `setupTests.js` is referenced in the Jest config (CRA default).

## Conventions

- **Stack** - Jest + React Testing Library; use `render`, `screen`, `userEvent` from `@testing-library/react`; avoid testing implementation details.
- **Test mode** - For tests that depend on the app’s mode, run with `REACT_APP_MODE=test` so login is bypassed and mock data is used (see `.cursorrules` and `DEVELOPMENT_MODES.md`).
- **Data mocking** - Use the same mock data contract as the app (e.g. `src/data/mockData.js`). Unit tests for business logic (e.g. calculations) should be written and pass with mocked data.
- **Placement** - Test files in `src/test/**/*.test.js`; component- or page-specific tests can live next to the code or in `src/test/` (e.g. `App.test.js` in `src/test/`).
- **Naming** - `*.test.js` for Jest to pick them up; descriptive test names (e.g. `'renders welcome text when in test mode'`).
