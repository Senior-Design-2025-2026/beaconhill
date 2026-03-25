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
import AnalyticsForecastCalendar from '../../components/AnalyticsForecastCalendar/AnalyticsForecastCalendar';
import FarmMetadata from '../../components/FarmMetadata/FarmMetadata';
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
 * Build per-node hourly trends for a single day.
 * Returns { [metricKey]: [ { nodeId, nodeName, trend: [{x,y}] }, ... ] }
 */
function buildNodeDayTrends(measurements, nodes, farmId, dateISO) {
  const farmNodes = nodes.filter((n) => String(n.farmId) === String(farmId));
  if (!dateISO || !farmNodes.length) {
    return FARM_METRICS.reduce((acc, metric) => {
      acc[metric.key] = [];
      return acc;
    }, {});
  }

  const byNodeHour = {};
  measurements
    .filter((m) => String(m.farmId) === String(farmId))
    .forEach((m) => {
      const dt = new Date((m.timestamp || 0) * 1000);
      if (toLocalDateISO(dt) !== dateISO) return;
      const hour = dt.getHours();
      const nid = String(m.nodeId);
      if (!byNodeHour[nid]) byNodeHour[nid] = {};
      if (!byNodeHour[nid][hour]) byNodeHour[nid][hour] = [];
      byNodeHour[nid][hour].push(m);
    });

  return FARM_METRICS.reduce((acc, metric) => {
    acc[metric.key] = farmNodes.map((node) => {
      const nid = String(node.nodeId);
      const trend = HOURS.map((label, hour) => {
        const samples = byNodeHour[nid]?.[hour] || [];
        const vals = samples.map((s) => s[metric.key]).filter((v) => typeof v === 'number');
        const value = vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : null;
        return { x: label, y: value };
      });
      return { nodeId: nid, nodeName: node.nodeName || `Node ${nid}`, trend };
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
 *  selectedFarm: object|null,
 *  selectedFarmId: string,
 *  onSelectedFarmIdChange: (value: string) => void,
 *  mode: 'day'|'week'|'forecast',
 *  onModeChange: (value: 'day'|'week'|'forecast') => void,
 *  measurements: Array,
 * }} props
 */
export default function AnalyticsDay({
  farms,
  nodes = [],
  lat,
  lon,
  cropType,
  selectedFarm,
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

  const [selectedDate, setSelectedDate] = React.useState(null);
  React.useEffect(() => {
    if (availableDates.length) setSelectedDate(availableDates[availableDates.length - 1]);
    else setSelectedDate(null);
  }, [availableDates]);

  const activeDate = selectedDate;
  const { ambientTrend, loading, error } = useFarmWeather(lat, lon, 'day', activeDate);
  const farmTrend = useMemo(
    () => buildFarmDayTrend(measurements || [], selectedFarmId, activeDate),
    [measurements, selectedFarmId, activeDate],
  );
  const nodeTrends = useMemo(
    () => buildNodeDayTrends(measurements || [], nodes, selectedFarmId, activeDate),
    [measurements, nodes, selectedFarmId, activeDate],
  );

  return (
    <AnalyticsViewShell variant="day">
      <AnalyticsTopControlsLayout
        left={
          <>
            <div className="analytics-day-toprow-controls">
              <AnalyticsFarmSelect
                farms={farms}
                value={selectedFarmId}
                onChange={onSelectedFarmIdChange}
              />
              <AnalyticsModeTabs value={mode} onChange={onModeChange} />
            </div>
            <FarmMetadata farm={selectedFarm} />
          </>
        }
        right={
          <AnalyticsForecastCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            availableDates={availableDates}
          />
        }
      />

      <AnalyticsSection title="Farm Metrics" subtitle='(via Sensor Data)'>
        <AnalyticsBentoGrid variant="farm">
          {FARM_METRICS.map((m) => (
            <AnalyticsMetricTrendCard
              key={m.key}
              metric={m}
              trend={farmTrend[m.key]}
              nodeTrends={nodeTrends[m.key]}
              cropType={cropType}
              source="farm"
              farmName={selectedFarm?.farmName}
            />
          ))}
        </AnalyticsBentoGrid>
      </AnalyticsSection>

      <AnalyticsSection title="Ambient Metrics" subtitle='(via Open Meteo)'>
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
              lat={lat}
              lon={lon}
            />
          ))}
        </AnalyticsBentoGrid>
      </AnalyticsSection>
    </AnalyticsViewShell>
  );
}
