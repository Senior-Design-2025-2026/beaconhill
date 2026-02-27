# Components

## High-level goals

Reusable UI building blocks used across the app. Components live here so that pages and `App.js` stay thin and consistent. All shared UI (navigation, forms, cards, sidebars, etc.) belongs in this directory.

## Contents
Each component directory houses three files. (Note some may not include image file)
| File| | Purpose |
|--|----------------|---------|
| 1. | `[component].js` | Component Implementation|
| 2. | `[component]Component/[COMPONENT]_COMPONENT.md` | Component Documentation |
| 3. | `[component]Component/[component]Component.png` | Figma Sketch |

## Purpose of files

- **Component modules** - Presentational or small stateful pieces (e.g. `NavigationPanel`) that are imported by `App.js` or by pages. Each component is in its own folder with the main file named to match the component (e.g. `NavigationPanel.js`).
- **Component docs** - Per-component markdown (e.g. `BUTTON_COMPONENT.md`) describes appearance, behavior, and variants for developers and design.

## How and where they are used

- **App.js** - Imports `NavigationPanel` and renders it in the authenticated layout above the `<Routes>` and page content.
- **Pages** - May import shared components from `src/components/` for repeated UI (e.g. cards, tables, forms). Pages compose these components rather than duplicating markup.

## Conventions

- **Functional components only** - Use function declarations and hooks; no class components.
- **Material UI first** - Use MUI components (e.g. `Button`, `Stack`, `Typography`) when applicable; build BeaconHill-specific components inside `src/components/` on top of MUI.
- **Icons** - Use Material UI icons (e.g. `@mui/icons-material`).
- **One main component per folder** - Folder name matches component name (PascalCase), e.g. `NavigationPanel/NavigationPanel.js`.
- **Default export** - Export the component as default from its main file (e.g. `export default NavigationPanel`).
- **Styling** - Prefer `className` and shared CSS or Tailwind over inline styles; use MUI `sx` or `theme` when appropriate.
- **Documentation** - For non-trivial or shared components, add a `*.md` in the same folder describing the component’s purpose, props, and usage.
