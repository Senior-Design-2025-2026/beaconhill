# AnalyticsForecastCalendar

Mini month calendar for the Forecast tab. Shows today with a solid dark-yellow dot and the next 7 days with a transparent yellow highlight. Clicking a forecast day fires a selection callback.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedDate` | `string\|null` | — | Currently selected ISO date (e.g. `"2026-03-25"`) |
| `onDateSelect` | `(iso: string) => void` | — | Called when a forecast day or today is clicked |
| `forecastDays` | `number` | `7` | Number of days after today to highlight |

## Usage

```jsx
import AnalyticsForecastCalendar from '../../components/AnalyticsForecastCalendar/AnalyticsForecastCalendar';

<AnalyticsForecastCalendar
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
/>
```

## CSS

Self-contained in `AnalyticsForecastCalendar.css`. Placed in the `analytics-day-toprow-right` slot to occupy 50% of the controls row.
