# AnalyticsDaySlider

Labeled MUI `Slider` for navigating a discrete list of items (e.g. available dates).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `string[]` | `[]` | Ordered list of selectable values |
| `index` | `number` | `0` | Currently selected index |
| `onIndexChange` | `(index: number) => void` | — | Called when the slider moves |
| `title` | `string` | `"Day"` | Label prefix (e.g. "Day", "Week") |
| `labelFormatter` | `(item) => string` | — | Custom display formatter for the active item |

## Usage

```jsx
import AnalyticsDaySlider from '../../components/AnalyticsDaySlider/AnalyticsDaySlider';

<AnalyticsDaySlider
  items={['2025-06-01', '2025-06-02', '2025-06-03']}
  index={dayIndex}
  onIndexChange={setDayIndex}
/>
```

## CSS

Uses `analytics-day-slider-centered` and `analytics-day-slider-label` from `AnalyticsPage.css`.
