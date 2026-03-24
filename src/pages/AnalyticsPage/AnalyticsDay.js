import React, { useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import useFarmWeather from '../../hooks/useFarmWeather';
import {
  FARM_METRICS,
  AMBIENT_METRICS,
} from '../../data/analyticsDummyFarm';
import AnalyticsViewShell from '../../components/AnalyticsViewShell/AnalyticsViewShell';
import AnalyticsTopControlsLayout from '../../components/AnalyticsTopControlsLayout/AnalyticsTopControlsLayout';
import AnalyticsFarmSelect from '../../components/AnalyticsFarmSelect/AnalyticsFarmSelect';
import AnalyticsModeTabs from '../../components/AnalyticsModeTabs/AnalyticsModeTabs';
import AnalyticsDaySlider from '../../components/AnalyticsDaySlider/AnalyticsDaySlider';
import AnalyticsSection from '../../components/AnalyticsSection/AnalyticsSection';
import AnalyticsBentoGrid from '../../components/AnalyticsBentoGrid/AnalyticsBentoGrid';
import AnalyticsMetricTrendCard from '../../components/AnalyticsMetricTrendCard/AnalyticsMetricTrendCard';

const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);

function toLocalDateISO(dateInput) {
  const date = new Date(dateInput);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function buildFarmDayTrend(measurements, farmId, dateISO) {
  if (!dateISO) {
    return FARM_METRICS.reduce((acc, metric) => {
      acc[metric.key] = HOURS.map((label) => ({ x: label, y: null }));
      return acc;
    }, {});
  }
  const byHour = {};
  measurements
    .filter((m) => String(m.farmId) === String(farmId))
    .forEach((m) => {
      const dt = new Date((m.timestamp || 0) * 1000);
      if (toLocalDateISO(dt) !== dateISO) return;
      const hour = dt.getHours();
      if (!byHour[hour]) byHour[hour] = [];
      byHour[hour].push(m);
    });

  return FARM_METRICS.reduce((acc, metric) => {
    acc[metric.key] = HOURS.map((label, hour) => {
      const samples = byHour[hour] || [];
      const values = samples.map((s) => s[metric.key]).filter((v) => typeof v === 'number');
      const value = values.length ? +(values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1) : null;
      return { x: label, y: value };
    });
    return acc;
  }, {});
}

/**
 * Day tab: farm daily hourly metrics + ambient hourly weather values.
 * @param {{
 *  lat: number|null,
 *  lon: number|null,
 *  farms: Array,
 *  nodes: Array,
 *  cropType?: string,
 *  selectedFarmId: string,
 *  onSelectedFarmIdChange: (value: string) => void,
 *  mode: 'day'|'week'|'forecast',
 *  onModeChange: (value: 'day'|'week'|'forecast') => void,
 *  measurements: Array,
 * }} props
 */
export default function AnalyticsDay({
  farms,
  lat,
  lon,
  cropType,
  selectedFarmId,
  onSelectedFarmIdChange,
  mode,
  onModeChange,
  measurements,
}) {
  const availableDates = useMemo(() => {
    const dates = new Set(
      (measurements || [])
        .filter((m) => String(m.farmId) === String(selectedFarmId))
        .map((m) => toLocalDateISO(new Date((m.timestamp || 0) * 1000))),
    );
    return Array.from(dates).sort((a, b) => a.localeCompare(b));
  }, [measurements, selectedFarmId]);

  const [dayIndex, setDayIndex] = React.useState(0);
  React.useEffect(() => {
    if (availableDates.length) setDayIndex(availableDates.length - 1);
    else setDayIndex(0);
  }, [availableDates]);

  const activeDate = availableDates[dayIndex] || null;
  const { ambientTrend, loading, error } = useFarmWeather(lat, lon, 'day', activeDate);
  const farmTrend = useMemo(
    () => buildFarmDayTrend(measurements || [], selectedFarmId, activeDate),
    [measurements, selectedFarmId, activeDate],
  );

  return (
    <AnalyticsViewShell variant="day">
      <AnalyticsTopControlsLayout
        left={
          <>
            <AnalyticsFarmSelect
              farms={farms}
              value={selectedFarmId}
              onChange={onSelectedFarmIdChange}
            />
            <AnalyticsModeTabs value={mode} onChange={onModeChange} />
          </>
        }
        right={
          <AnalyticsDaySlider
            items={availableDates}
            index={dayIndex}
            onIndexChange={setDayIndex}
          />
        }
      />

      <AnalyticsSection title="Farm" subtitle="via Sensor Data">
        <AnalyticsBentoGrid variant="farm">
          {FARM_METRICS.map((m) => (
            <AnalyticsMetricTrendCard
              key={m.key}
              metric={m}
              trend={farmTrend[m.key]}
              cropType={cropType}
              source="farm"
            />
          ))}
        </AnalyticsBentoGrid>
      </AnalyticsSection>

      <AnalyticsSection title="Ambient" subtitle="via Open Meteo">
        {loading && <CircularProgress size={24} />}
        {error && <p className="analytics-error">{error}</p>}
        {!loading && !error && !ambientTrend && (
          <p className="analytics-message">
            {lat == null ? 'Farm has no coordinates — cannot fetch weather.' : 'No day weather data available.'}
          </p>
        )}
        <AnalyticsBentoGrid variant="ambient">
          {AMBIENT_METRICS.map((m) => (
            <AnalyticsMetricTrendCard
              key={m.key}
              metric={m}
              trend={ambientTrend?.[m.key] || []}
              cropType={cropType}
              source="ambient"
            />
          ))}
        </AnalyticsBentoGrid>
      </AnalyticsSection>
    </AnalyticsViewShell>
  );
}
