# AnalyticsBentoGrid

Grid container for analytics metric trend cards.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'farm'\|'ambient'` | — | Adds `analytics-bento--{variant}` modifier |
| `className` | `string` | — | Additional CSS class |
| `children` | `ReactNode` | — | Card elements |

## Usage

```jsx
import AnalyticsBentoGrid from '../../components/AnalyticsBentoGrid/AnalyticsBentoGrid';

<AnalyticsBentoGrid variant="farm">
  <AnalyticsMetricTrendCard ... />
</AnalyticsBentoGrid>
```

## CSS

Uses `analytics-bento` and variant classes from `AnalyticsPage.css`.
