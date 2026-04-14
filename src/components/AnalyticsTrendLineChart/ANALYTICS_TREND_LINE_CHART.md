# AnalyticsTrendLineChart

SVG sparkline with optional threshold guide lines, axes, and a data polyline.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `values` | `number[]` | `[]` | Y-values for the line (nulls create gaps) |
| `threshold` | `object\|null` | `null` | Threshold bands (`{ excellent, good, fair }`) from `analyticsThresholds` |
| `width` | `number` | `220` | SVG viewBox width |
| `height` | `number` | `92` | SVG viewBox height |
| `padding` | `number` | `16` | Inner padding for chart area |
| `xStartLabel` | `string` | — | Label below the left edge of the x-axis |
| `xEndLabel` | `string` | — | Label below the right edge of the x-axis |
| `ariaLabel` | `string` | — | Accessible label for the chart container |

## Usage

```jsx
import AnalyticsTrendLineChart from '../../components/AnalyticsTrendLineChart/AnalyticsTrendLineChart';

<AnalyticsTrendLineChart
  values={[5.2, 5.8, 6.1, 5.9]}
  threshold={getThreshold('ph', 'corn', 'farm')}
  xStartLabel="00:00"
  xEndLabel="23:00"
  ariaLabel="pH day trend"
/>
```

## CSS

Relies on classes from `AnalyticsPage.css` (`analytics-trend-wrap`, `analytics-trend-svg`, `analytics-trend-line`, etc.).
