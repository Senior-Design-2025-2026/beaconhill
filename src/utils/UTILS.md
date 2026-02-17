# Utils

## High-level goals

Hold pure helpers and app-wide utilities that don’t belong in components, API, or hooks. This includes performance reporting, formatters, validators, and small shared functions used in multiple places.

## Contents

| File | Purpose |
|------|---------|
| `reportWebVitals.js` | CRA default: accepts a callback and reports Core Web Vitals (CLS, FID, FCP, LCP, TTFB) via the `web-vitals` library. |

## Purpose of files

- **reportWebVitals.js** - Optional performance reporting; called from `src/index.js` with no callback by default (so nothing is sent). Can be passed a function to log or send metrics to an analytics endpoint.
- **Other utils** - Add small, side-effect-free helpers here (e.g. date formatting, number formatting, validation, constants) that are used by multiple components or pages.

## How and where they are used

- **index.js** - Imports `reportWebVitals` and calls `reportWebVitals()` after the app is rendered. To actually use the metrics, pass a callback, e.g. `reportWebVitals(console.log)` or a function that sends to an analytics API.
- **Rest of app** - Any module can import from `src/utils/` for shared pure functions. Utils should not import React components, hooks, or API modules; they stay dependency-light.

## Conventions

- **Pure where possible** - Prefer pure functions (same inputs → same outputs, no side effects) so they are easy to unit test and reason about.
- **No UI or API coupling** - Utils must not import from `src/components/`, `src/pages/`, or `src/api/`; they can be used by those layers.
- **One concern per file** - e.g. `reportWebVitals.js` for vitals; add `formatDate.js`, `validation.js`, etc. as needed.
- **Named exports** - Export individual functions (e.g. `export default reportWebVitals` or `export function formatDate(...)`) so callers can import only what they need.
- **JSDoc** - Use JSDoc for parameters and return values when it improves clarity.
