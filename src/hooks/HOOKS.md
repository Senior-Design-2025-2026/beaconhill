# Hooks

## High-level goals

Encapsulate reusable state and side-effect logic so components and pages stay simple. Hooks fetch or transform data, subscribe to auth, or provide shared behavior without duplicating logic across the tree.

## Contents

| File | Purpose |
|------|---------|
| `useFarmData.js` | Placeholder for a hook that will load and expose farm/items data (e.g. from `src/api/`) and loading/error state. Currently empty. |

## Purpose of files

- **Custom hooks** - Functions whose names start with `use` and that call React hooks internally. They return state, setters, and/or callbacks (e.g. `{ data, loading, error, refetch }`) for consumption by components or pages.
- **Data-fetching hooks** - Should call API modules in `src/api/` rather than using Amplify `get()` directly; handle loading and error state so the UI can show spinners and messages.

## How and where they are used

- **Pages** - Import hooks (e.g. `useFarmData`) to get data and bind it to the page. Pages remain presentational where possible; hooks own the data layer.
- **Components** - May use hooks when they need shared behavior (e.g. `useLocation` from React Router is built-in; custom hooks like `useFarmData` live here).
- **App.js** - May use hooks for app-level state (e.g. theme, user preferences) as the app grows. Currently app-level mock state is local `useState` in `App.js`; that could be moved to a hook if reused.

## Conventions

- **Naming** - Prefix with `use`, camelCase (e.g. `useFarmData`, `useAuthState`).
- **One concern per hook** - e.g. `useFarmData` for farm/items data only; separate hooks for auth, weather, or settings.
- **Call API layer** - Hooks should call functions from `src/api/`, not `get()` from `aws-amplify/api` directly.
- **Return a consistent shape** - For data hooks, consider returning `{ data, loading, error, refetch }` (or similar) so callers can branch on loading/error and render accordingly.
- **JSDoc** - Use JSDoc for parameters and return types where it clarifies contract for other developers.
