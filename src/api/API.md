# API

## High-level goals

Centralize all outbound HTTP and Amplify API calls. This directory is the single place for backend integration so that components and pages do not call AWS/Amplify or external APIs directly.

## Contents

| File | Purpose |
|------|---------|
| `weatherApi.js` | Placeholder for weather-related API logic (currently empty). |

## Purpose of files

- **API modules** - Encapsulate REST/Amplify `get()` (and future `post()`, etc.) calls, auth token handling, and response shaping. Keep try/catch and error logging here so callers receive clean data or handled errors.

## How and where they are used

- **App.js** currently performs the secure API call inline (`callSecureApi` with `apiGet` and `/items`). As the app grows, that logic should move into a module under `src/api/` (e.g. `itemsApi.js` or `farmApi.js`) and be imported by `App.js`, hooks, or pages.
- **Hooks** (e.g. `useFarmData`) and **pages** should call functions exported from `src/api/` rather than using `get()` from `aws-amplify/api` directly.

## Conventions

- **One concern per file** - e.g. `weatherApi.js` for weather, a separate file for items/farm data.
- **Export named functions** that return promises (or use async/await). Example: `export async function fetchItems() { ... }`.
- **Use Amplify REST client** - `get({ apiName: 'apiGet', path: '...', options: { headers: { Authorization: token.toString() } } })`. Get the token via `fetchAuthSession()` from `aws-amplify/auth` inside the API layer.
- **Wrap all external calls in try/catch**; log errors and either rethrow or return a consistent error shape for the UI.
- **No UI imports** - API modules must not import React components or hooks that depend on the DOM.
