# AnalyticsViewShell

Outer wrapper for analytics tab content. Applies the `analytics-rows` base class and an optional variant modifier.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | — | Produces `analytics-{variant}-view` class (e.g. `"day"`) |
| `className` | `string` | — | Additional CSS class |
| `children` | `ReactNode` | — | Tab content |

## Usage

```jsx
import AnalyticsViewShell from '../../components/AnalyticsViewShell/AnalyticsViewShell';

<AnalyticsViewShell variant="day">
  {/* controls and sections */}
</AnalyticsViewShell>
```

## CSS

Uses `analytics-rows`, `analytics-rows--week`, and variant classes from `AnalyticsPage.css`.
