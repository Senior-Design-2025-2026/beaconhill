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

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toLocalDateISO(dateInput) {
  const date = new Date(dateInput);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Returns the ISO-week Monday (YYYY-MM-DD) for a given Date or ISO string. */
function getWeekMonday(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toLocalDateISO(d);
}

/** Aggregate measurements into 7 daily buckets (Mon-Sun) for the given week. */
function buildFarmWeekTrend(measurements, farmId, mondayISO) {
  if (!mondayISO) {
    return FARM_METRICS.reduce((acc, metric) => {
      acc[metric.key] = DAY_NAMES.map((label) => ({ x: label, y: null }));
      return acc;
    }, {});
  }

  const mon = new Date(mondayISO + 'T00:00:00');
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    return toLocalDateISO(d);
  });

  const byDay = {};
  weekDates.forEach((iso, idx) => { byDay[iso] = idx; });

  const buckets = Array.from({ length: 7 }, () => []);
  (measurements || [])
    .filter((m) => String(m.farmId) === String(farmId))
    .forEach((m) => {
      const iso = toLocalDateISO(new Date((m.timestamp || 0) * 1000));
      const idx = byDay[iso];
      if (idx != null) buckets[idx].push(m);
    });

  return FARM_METRICS.reduce((acc, metric) => {
    acc[metric.key] = DAY_NAMES.map((label, dayIdx) => {
      const samples = buckets[dayIdx];
      const values = samples.map((s) => s[metric.key]).filter((v) => typeof v === 'number');
      const value = values.length
        ? +(values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
        : null;
      return { x: label, y: value };
    });
    return acc;
  }, {});
}

/**
 * Week tab: farm weekly metrics (aggregated by day) + ambient weekly weather.
 * @param {{
 *  lat: number|null,
 *  lon: number|null,
 *  farms: Array,
 *  cropType?: string,
 *  selectedFarm: object|null,
 *  selectedFarmId: string,
 *  onSelectedFarmIdChange: (value: string) => void,
 *  mode: 'day'|'week'|'forecast',
 *  onModeChange: (value: 'day'|'week'|'forecast') => void,
 *  measurements: Array,
 * }} props
 */
export default function AnalyticsWeek({
  farms,
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
  const availableWeeks = useMemo(() => {
    const mondays = new Set(
      (measurements || [])
        .filter((m) => String(m.farmId) === String(selectedFarmId))
        .map((m) => getWeekMonday(new Date((m.timestamp || 0) * 1000))),
    );
    return Array.from(mondays).sort((a, b) => a.localeCompare(b));
  }, [measurements, selectedFarmId]);

  const availableWeekDates = useMemo(() => {
    const dates = [];
    availableWeeks.forEach((mondayISO) => {
      const mon = new Date(mondayISO + 'T00:00:00');
      for (let i = 0; i < 7; i++) {
        const d = new Date(mon);
        d.setDate(d.getDate() + i);
        dates.push(toLocalDateISO(d));
      }
    });
    return dates;
  }, [availableWeeks]);

  const [selectedDate, setSelectedDate] = React.useState(null);
  React.useEffect(() => {
    if (availableWeeks.length) setSelectedDate(availableWeeks[availableWeeks.length - 1]);
    else setSelectedDate(null);
  }, [availableWeeks]);

  const activeMonday = selectedDate ? getWeekMonday(selectedDate) : null;
  const { ambientTrend, loading, error } = useFarmWeather(lat, lon, 'week');
  const farmTrend = useMemo(
    () => buildFarmWeekTrend(measurements || [], selectedFarmId, activeMonday),
    [measurements, selectedFarmId, activeMonday],
  );

  return (
    <AnalyticsViewShell variant="week">
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
            availableDates={availableWeekDates}
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
            {lat == null ? 'Farm has no coordinates — cannot fetch weather.' : 'No weekly weather data available.'}
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
