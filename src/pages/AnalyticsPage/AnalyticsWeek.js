import React from 'react';
import { CircularProgress } from '@mui/material';
import useFarmWeather from '../../hooks/useFarmWeather';
import {
  FARM_METRICS,
  AMBIENT_METRICS,
  DUMMY_FARM_WEEK_SERIES_BY_CROP,
} from '../../data/analyticsDummyFarm';
import AnalyticsViewShell from '../../components/AnalyticsViewShell/AnalyticsViewShell';
import AnalyticsSection from '../../components/AnalyticsSection/AnalyticsSection';
import AnalyticsBentoGrid from '../../components/AnalyticsBentoGrid/AnalyticsBentoGrid';
import AnalyticsMetricTrendCard from '../../components/AnalyticsMetricTrendCard/AnalyticsMetricTrendCard';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDayLabel(dateValue, idx) {
  if (!dateValue) return WEEK_LABELS[idx] || `D${idx + 1}`;
  const dt = new Date(dateValue);
  if (Number.isNaN(dt.getTime())) return WEEK_LABELS[idx] || `D${idx + 1}`;
  return dt.toLocaleDateString('en-US', { weekday: 'short' });
}

function weekAxisLabels(trend) {
  const labels = (trend || []).map((p, idx) => formatDayLabel(p.x, idx));
  return { start: labels[0] || '—', end: labels[labels.length - 1] || '—' };
}

/**
 * Week-aggregate tab: farm ground-truth values + ambient weather values.
 * @param {{ lat: number|null, lon: number|null, cropType?: string }} props
 */
export default function AnalyticsWeek({ lat, lon, cropType }) {
  const { ambientTrend, loading, error } = useFarmWeather(lat, lon, 'week');
  const cropKey = String(cropType || '').toLowerCase().startsWith('soy') ? 'soybean' : 'corn';
  const farmSeries = DUMMY_FARM_WEEK_SERIES_BY_CROP[cropKey] || DUMMY_FARM_WEEK_SERIES_BY_CROP.corn;

  const farmTrend = FARM_METRICS.reduce((acc, metric) => {
    acc[metric.key] = (farmSeries[metric.key] || []).map((value, idx) => ({
      x: WEEK_LABELS[idx] || `D${idx + 1}`,
      y: value,
    }));
    return acc;
  }, {});

  return (
    <AnalyticsViewShell>
      <AnalyticsSection title="Farm">
        {cropType ? <p className="analytics-message">Crop Type: {cropType}</p> : null}
        <AnalyticsBentoGrid variant="farm">
          {FARM_METRICS.map((m) => (
            <AnalyticsMetricTrendCard
              key={m.key}
              metric={m}
              trend={farmTrend[m.key]}
              cropType={cropType}
              source="farm"
              axisLabels={weekAxisLabels(farmTrend[m.key])}
            />
          ))}
        </AnalyticsBentoGrid>
      </AnalyticsSection>

      <AnalyticsSection title="Ambient" subtitle="via Open Meteo">
        {loading && <CircularProgress size={24} />}
        {error && <p className="analytics-error">{error}</p>}
        {!loading && !error && !ambientTrend && (
          <p className="analytics-message">
            {lat == null ? 'Farm has no coordinates — cannot fetch weather.' : 'No weather data available.'}
          </p>
        )}
        <AnalyticsBentoGrid variant="ambient">
          {AMBIENT_METRICS.map((m) => {
            const trend = ambientTrend?.[m.key] || [];
            return (
              <AnalyticsMetricTrendCard
                key={m.key}
                metric={m}
                trend={trend}
                cropType={cropType}
                source="ambient"
                axisLabels={weekAxisLabels(trend)}
              />
            );
          })}
        </AnalyticsBentoGrid>
      </AnalyticsSection>
    </AnalyticsViewShell>
  );
}
