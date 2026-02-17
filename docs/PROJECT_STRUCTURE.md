# Repository structure

This document describes the main directories and files at the project root. Do not move or delete the items that tooling depends on (see below).

## Root-level directories and files

| Item | Purpose |
|------|--------|
| **amplify/** | AWS Amplify backend (Cognito, API Gateway, Lambda, DynamoDB). Used by the Amplify CLI; must remain at project root. |
| **public/** | Create React App static assets: `index.html`, `manifest.json`, `robots.txt`, favicon, logos. Required for build; do not delete. |
| **src/** | React app source: components, pages, config, API, data, hooks, utils. |
| **img/** | Images used by the root README (e.g. logo, team photos). |
| **docs/** | Project documentation (this file, APPLICATION.md, DEVELOPMENT_MODES.md). |
| **amplify-meta.json** / **amplifyconfiguration.json** | Amplify-generated config (often gitignored); used by Amplify CLI and Hosting. Leave at root. |
| **.cursorrules** | Cursor IDE / AI rules for this project. |

## Do not move or delete

- **public/** - CRA requires it; build will fail without it.
- **amplify/** - Amplify CLI expects it at the project root.
- **amplify-meta.json**, **amplifyconfiguration.json** - Generated or expected at root by Amplify tooling.
