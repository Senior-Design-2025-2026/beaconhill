# Analytics Card Metrics

This document describes the metrics and chart behavior used by the Analytics cards, with a focus on the Week view line charts.

## Card Groups

Analytics cards are rendered in two groups:

- **Farm metrics** (sensor/soil-side):
  - `temperature` (deg F)
  - `moisture` (%)
  - `nitrogen` (ppm)
  - `phosphorus` (ppm)
  - `potassium` (ppm)
- **Ambient metrics** (Open-Meteo):
  - `temperatureF` (deg F)
  - `humidity` (%)
  - `rainfallIn` (in)
  - `windMph` (mph)
  - `uvIndex` (index)

## Timeframes

- **Current tab**: point-in-time value cards.
- **Week tab**: line-chart cards using weekly trend data.
  - Farm cards use the crop-specific weekly dummy series.
  - Ambient cards use the previous 7 complete days from Open-Meteo (`past_days=7`).

## Week Chart Structure

Each Week card includes:

- metric label
- weekly average value with unit
- status pill (`Excellent`, `Good`, `Fair`, `Poor`, or `N/A`)
- SVG line chart for the 7-day trend
- explicit axes
  - y-axis and x-axis lines
  - y-axis ticks (min, midpoint, max of plotted domain)
- threshold guide lines with labels
  - `Excellent`
  - `Good`
  - `Fair`
  - `Poor` (inferred out-of-band region)

## Threshold Source and Classification

Threshold definitions come from:

- `src/data/thresholds.json`

Selection logic:

- crop type is normalized to `corn` or `soybean`
- source is `farm` or `ambient`
- metric key selects the threshold band object

Band model from `thresholds.json`:

- `excellent`: `{ min, max }`
- `good`: `{ min, max }`
- `fair`: `{ min, max }`

Classification behavior:

- value inside `excellent` -> `Excellent`
- else inside `good` -> `Good`
- else inside `fair` -> `Fair`
- otherwise -> `Poor`
- missing value/threshold -> `N/A`

## Poor Threshold Rendering in Week Charts

`thresholds.json` defines explicit numeric bands for excellent/good/fair.  
To visualize poor on charts, poor guides are inferred as out-of-range zones:

- lower poor guide below the fair band
- upper poor guide above the excellent band

This ensures each Week chart visually includes all four classes:

- `Excellent`, `Good`, `Fair`, `Poor`

## Data and Utility References

- metric key definitions: `src/data/analyticsDummyFarm.js`
- threshold lookup and indicator logic: `src/pages/AnalyticsPage/analyticsThresholds.js`
- weather transforms and weekly aggregation: `src/api/weatherApi.js`
- ambient trend + values hook: `src/hooks/useFarmWeather.js`
- Week chart rendering: `src/pages/AnalyticsPage/AnalyticsWeek.js`
