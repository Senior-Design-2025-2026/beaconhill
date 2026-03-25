# AnalyticsTopControlsLayout

Two-column layout row for analytics page controls (farm selector, mode tabs, slider).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` | `ReactNode` | — | Left column content (farm select, tabs) |
| `right` | `ReactNode` | — | Right column content (slider, date controls) |

## Usage

```jsx
import AnalyticsTopControlsLayout from '../../components/AnalyticsTopControlsLayout/AnalyticsTopControlsLayout';

<AnalyticsTopControlsLayout
  left={<><AnalyticsFarmSelect /><AnalyticsModeTabs /></>}
  right={<AnalyticsDaySlider />}
/>
```

## CSS

Uses `analytics-day-toprow`, `analytics-day-toprow-left`, `analytics-day-toprow-right` from `AnalyticsPage.css`.
