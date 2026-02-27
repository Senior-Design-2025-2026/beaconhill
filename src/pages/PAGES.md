# Pages

## High-level goals

Each page is a top-level route view that fills the main content area. Pages compose components and hooks and are the primary place for screen-specific layout and data binding. They should stay focused on structure and wiring, not low-level API or styling details.

## Contents

| Directory | Purpose |
|-----------|---------|
| `LiveDashboardPage/` | Route `/` - Live Dashboard. Main file: `LiveDashboardPage.js`. |
| `AnalyticsPage/` | Route `/analytics` - Analytics view. Main file: `AnalyticsPage.js`. |
| `ConfigurationPage/` | Route `/configuration` - Configuration view. Main file: `ConfigurationPage.js`. |
| `SettingsPage/` | Route `/settings` - Settings view. Main file: `SettingsPage.js`. |

Each page folder can also contain a `*.md` (e.g. `LIVE_DASHBOARD_PAGE.md`) describing the page’s purpose and planned content.

## Purpose of files

- **Page components** - Default-exported functional components that render the screen for one route. They use Material UI (e.g. `Typography` for headings) and may import components from `src/components/` and hooks from `src/hooks/`.
- **Page docs** - Markdown files describe what the page is for, what it displays, and which components it uses or will use (see also `docs/APPLICATION.md` and planning in `planning/pages/`).

## How and where they are used

- **App.js** - Renders pages inside `<Routes>`: `<Route path="/" element={<LiveDashboardPage />} />`, etc. The router is in `App.js`; `NavigationPanel` links to these paths.
- **Navigation** - `NavigationPanel` links to `/`, `/analytics`, `/configuration`, `/settings`; the active route determines which page is mounted.

## Conventions

- **One folder per page** - Folder name is PascalCase and matches the page component name (e.g. `LiveDashboardPage/LiveDashboardPage.js`).
- **Default export** - Export the page component as default from its main file.
- **Functional components** - Use function declarations and hooks; no class components.
- **Material UI** - Use MUI for layout and typography; build page-specific blocks from `src/components/` where possible.
- **Data** - Prefer hooks (e.g. `useFarmData`) for data; pages should not call `get()` or `fetchAuthSession()` directly - use `src/api/` via hooks.
- **Styling** - Prefer `className` and shared CSS or Tailwind; use MUI `sx`/theme when appropriate. Avoid large inline style objects.
