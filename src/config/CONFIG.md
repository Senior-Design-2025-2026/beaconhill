# Config

## High-level goals

Provide a single place for environment-dependent configuration and feature flags so the rest of the app does not read `process.env` or hardcode environment checks. Config is consumed at runtime by the app entrypoint, auth flow, and any code that needs to branch on mode (e.g. test vs production).

## Contents

| File | Purpose |
|------|---------|
| `index.js` | Exports runtime flags, e.g. `isTestMode` (`true` when `REACT_APP_MODE === 'test'`). |
| `aws-exports.json` | Amplify-generated config (API endpoints, auth, etc.). Often gitignored; provided by Amplify CLI or CI. |

## Purpose of files

- **index.js** - Re-exports or defines app-wide config (e.g. `isTestMode`) so components and `App.js` import from `./config` instead of touching `process.env` directly.
- **aws-exports.json** - Used by `Amplify.configure(awsconfig)` in `App.js` to bootstrap Amplify (Auth, API). Not committed when it contains secrets or environment-specific URLs.

## How and where they are used

- **App.js** - Imports `awsconfig` from `./config/aws-exports.json` for `Amplify.configure()` and `isTestMode` from `./config` to decide between test mode (mock user, mock data) and production (Authenticator, real API).
- **Tests** - Run with `REACT_APP_MODE=test` (e.g. `npm run test:ci`) so the app renders without Cognito and uses mock data.
- **Local dev** - Start with `npm run start:test` (or equivalent) to set `REACT_APP_MODE=test` for bypass login and mock data.

## Conventions

- **No secrets in repo** - Do not commit `aws-exports.json` or any file with API keys/tokens; use env vars or Amplify CLI for local config.
- **Single entry** - Other modules should import config from `src/config` or `src/config/index.js`, not from `aws-exports.json` directly (except the Amplify bootstrap in `App.js` if desired).
- **Env vars** - Use `REACT_APP_*` for any value that must be available in the browser; document required variables in README or `DEVELOPMENT_MODES.md`.
