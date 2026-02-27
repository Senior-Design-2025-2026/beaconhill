# Live Dashboard Page

The Live Dashboard Page is the landing page of the BeaconHill web-application. It displays real-time and historical measurement data for the selected farm.

## Filters

The page provides two global filters that apply to both tabs:

1. **Farm** — selects which farm's nodes and measurements to display.
2. **Timeframe** — restricts measurements to a rolling window (6h, 12h, 24h, 7d, 30d). "Now" is defined as the maximum timestamp among the farm's measurements so filtering is deterministic with dummy data.

## Tabs

### Snapshot View (Tab 1)

Displays a point-in-time snapshot of all nodes for the selected farm:

- **Map** — interactive Leaflet map (`MapComponent`) showing pins for each node in the farm.
- **Timestamp Slider** — MUI `Slider` with 1-hour increments from the earliest to the latest measurement within the selected timeframe. Marks indicate whether any node has data at that hour (filled = data exists, hollow = no data). Moving the slider selects a single timestamp.
- **Per-Node Sections** — for each node:
  - **Status badge** — "Online" (green) if the node has a measurement at the slider timestamp; "Offline" (red) otherwise.
  - **Configure button** — navigates to the Configuration page.
  - **Linear Gauges** — five `LinearGaugeComponent` instances (Temperature, Moisture, Nitrogen, Phosphorus, Potassium) showing the measurement values at the selected timestamp. Gauges are hidden when the node is offline.

The slider only affects Snapshot View; it does not filter Timeframe Averages.

### Timeframe Averages (Tab 2)

Displays one `AnalyticsCardComponent` per node. Each card contains a Plotly line chart plotting all five metrics over time, using measurements filtered by Farm and Timeframe only (no slider influence).

## Data

Measurement data is provided by a shared React Context (`MeasurementsContext`) initialized from `dummy_measurements.json`. The context also exposes `addMeasurements()` so the Testing Page can inject new records at runtime, which are immediately visible on both tabs.

DynamoDB Tables Used (production):
- Measurements

## Components

- Header: [HEADER_COMPONENT.md](./../../components/HeaderComponent/HEADER_COMPONENT.md)
- Tab: MUI `Tabs` / `Tab`

Snapshot View:
- Map: [MAP_COMPONENT.md](./../../components/MapComponent/MAP_COMPONENT.md)
- Timestamp Slider: MUI `Slider` (inline, 1-hour increments)
- Linear Gauge: [LINEAR_GAUGE_COMPONENT.md](./../../components/LinearGaugeComponent/LINEAR_GAUGE_COMPONENT.md)

Timeframe Averages:
- Analytics Card: [ANALYTICS_CARD.md](./../../components/AnalyticsCardComponent/ANALYTICS_CARD.md)
