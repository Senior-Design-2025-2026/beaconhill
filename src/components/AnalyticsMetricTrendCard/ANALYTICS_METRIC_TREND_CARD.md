# AnalyticsMetricTrendCard

Card showing a metric's average value, health-status indicator, and an embedded SVG sparkline with threshold bands.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `metric` | `{ key, label, unit }` | — | Metric definition from `FARM_METRICS` or `AMBIENT_METRICS` |
| `trend` | `{ x: string, y: number\|null }[]` | `[]` | Time-series data points |
| `cropType` | `string` | — | Crop type used for threshold lookup |
| `source` | `'farm'\|'ambient'` | — | Metric source for threshold lookup |
| `axisLabels` | `{ start, end }` | — | Override x-axis labels (defaults to first/last `x` in `trend`) |

## Usage

```jsx
import AnalyticsMetricTrendCard from '../../components/AnalyticsMetricTrendCard/AnalyticsMetricTrendCard';

<AnalyticsMetricTrendCard
  metric={{ key: 'temperature', label: 'Temperature', unit: '°F' }}
  trend={[{ x: '00:00', y: 72.1 }, { x: '01:00', y: 71.8 }]}
  cropType="corn"
  source="farm"
/>
```

## CSS

Relies on `analytics-card`, `analytics-card--*`, and trend classes from `AnalyticsPage.css`.
