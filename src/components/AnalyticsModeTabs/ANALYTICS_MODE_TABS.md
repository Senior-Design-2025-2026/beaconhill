# AnalyticsModeTabs

MUI `ToggleButtonGroup` for switching between Day / Week / Forecast analytics views.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Active mode (e.g. `"day"`) |
| `onChange` | `(mode: string) => void` | — | Called with the newly selected mode |
| `options` | `{ value, label }[]` | Day/Week/Forecast | Override available tabs |

## Usage

```jsx
import AnalyticsModeTabs from '../../components/AnalyticsModeTabs/AnalyticsModeTabs';

<AnalyticsModeTabs value={mode} onChange={setMode} />
```

## CSS

Wraps in `analytics-day-toprow-tabs` from `AnalyticsPage.css`.
