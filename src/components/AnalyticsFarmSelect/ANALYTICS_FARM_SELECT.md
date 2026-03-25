# AnalyticsFarmSelect

MUI `Select` dropdown for choosing a farm.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `farms` | `{ farmId, farmName }[]` | `[]` | Available farms |
| `value` | `string` | — | Currently selected farm ID |
| `onChange` | `(farmId: string) => void` | — | Called with the new farm ID |
| `label` | `string` | `"Farm"` | Select label |
| `size` | `'small'\|'medium'` | `'small'` | MUI size |

## Usage

```jsx
import AnalyticsFarmSelect from '../../components/AnalyticsFarmSelect/AnalyticsFarmSelect';

<AnalyticsFarmSelect
  farms={[{ farmId: '1', farmName: 'North Field' }]}
  value={selectedFarmId}
  onChange={setSelectedFarmId}
/>
```

## CSS

Wraps in `analytics-day-toprow-farm` from `AnalyticsPage.css`.
