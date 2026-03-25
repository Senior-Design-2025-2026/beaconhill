# AnalyticsSection

Titled section wrapper for analytics content groups (Farm, Ambient, etc.).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading text |
| `subtitle` | `string` | — | Optional subtitle displayed beside the title |
| `children` | `ReactNode` | — | Section body |

## Usage

```jsx
import AnalyticsSection from '../../components/AnalyticsSection/AnalyticsSection';

<AnalyticsSection title="Ambient" subtitle="via Open Meteo">
  <AnalyticsBentoGrid variant="ambient">...</AnalyticsBentoGrid>
</AnalyticsSection>
```

## CSS

Uses `analytics-section`, `analytics-section-title`, `analytics-ambient-title`, `analytics-ambient-subtitle` from `AnalyticsPage.css`.
