import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
} from '@mui/material';
import Plot from 'react-plotly.js';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import { useMeasurements } from '../../context/MeasurementsContext';
import useFarmWeather from '../../hooks/useFarmWeather';
import {
  FARM_METRICS,
  AMBIENT_METRICS,
  DUMMY_FARM_CURRENT,
  DUMMY_FARM_WEEK,
  DUMMY_FARM_PROJECTION,
} from '../../data/analyticsDummyFarm';
import './AnalyticsPage.css';

const SPARKLINE_LAYOUT = {
  margin: { l: 4, r: 4, t: 4, b: 18 },
  height: 90,
  xaxis: { visible: true, tickfont: { size: 9 }, tickangle: 0 },
  yaxis: { visible: false },
  showlegend: false,
};

const SPARKLINE_CONFIG = { displayModeBar: false, responsive: true };

function AnalyticsPage() {
  const { farms } = useMeasurements();

  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [mode, setMode] = useState('current');

  useEffect(() => {
    if (farms.length && !farms.some((f) => f.farmId === selectedFarmId)) {
      setSelectedFarmId(farms[0].farmId);
    }
  }, [farms, selectedFarmId]);

  const selectedFarm = useMemo(
    () => farms.find((f) => f.farmId === selectedFarmId) || null,
    [farms, selectedFarmId],
  );

  const lat = selectedFarm?.lat ?? null;
  const lon = selectedFarm?.lon ?? null;

  const { ambientValues, forecast, loading: weatherLoading, error: weatherError } =
    useFarmWeather(lat, lon, mode);

  const farmValues = mode === 'week' ? DUMMY_FARM_WEEK : DUMMY_FARM_CURRENT;

  /* ---------- Render helpers ---------- */

  function renderValueCard(metric, value) {
    const display = value != null ? value : '—';
    return (
      <div className="analytics-card" key={metric.key}>
        <span className="analytics-card-label">{metric.label}</span>
        <span className="analytics-card-value">
          {display}
          {value != null && <span className="analytics-card-unit">{metric.unit}</span>}
        </span>
      </div>
    );
  }

  function renderFarmProjectionCard(metric) {
    const xLabels = DUMMY_FARM_PROJECTION.map((d) => d.day);
    const yValues = DUMMY_FARM_PROJECTION.map((d) => d[metric.key]);
    return (
      <div className="analytics-proj-card" key={metric.key}>
        <span className="analytics-card-label">{metric.label} ({metric.unit})</span>
        <Plot
          data={[{
            x: xLabels,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#EEBE02', width: 2 },
            marker: { size: 4 },
          }]}
          layout={SPARKLINE_LAYOUT}
          config={SPARKLINE_CONFIG}
          useResizeHandler
          style={{ width: '100%' }}
        />
      </div>
    );
  }

  function renderAmbientProjectionCard(metric) {
    if (!forecast || !forecast.days?.length) return null;
    const xLabels = forecast.days.map((d) => d.date);

    const keyMap = {
      temperatureF: 'avgTempF',
      humidity: 'avgHumidity',
      rainfallIn: 'totalPrecipIn',
      windMph: 'maxWindMph',
      uvIndex: 'uvIndex',
    };
    const forecastKey = keyMap[metric.key];
    if (!forecastKey) return null;

    const yValues = forecast.days.map((d) => d[forecastKey]);

    return (
      <div className="analytics-proj-card" key={metric.key}>
        <span className="analytics-card-label">{metric.label} ({metric.unit})</span>
        <Plot
          data={[{
            x: xLabels,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#2196f3', width: 2 },
            marker: { size: 4 },
          }]}
          layout={SPARKLINE_LAYOUT}
          config={SPARKLINE_CONFIG}
          useResizeHandler
          style={{ width: '100%' }}
        />
      </div>
    );
  }

  /* ---------- Main render ---------- */

  return (
    <div className="analytics-page">
      <HeaderComponent
        title="Analytics"
        description="Compare farm soil metrics against ambient conditions"
      >
        <div className="analytics-filters">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Farm</InputLabel>
            <Select
              label="Farm"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
            >
              {farms.map((f) => (
                <MenuItem key={f.farmId} value={f.farmId}>{f.farmName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => { if (v) setMode(v); }}
            size="small"
          >
            <ToggleButton value="current">Current</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </HeaderComponent>

      <div className="analytics-columns">
        {/* ===== Column 1: Values ===== */}
        <div className="analytics-col">
          <Typography className="analytics-section-title" variant="subtitle1">
            Farm &mdash; Values
          </Typography>
          <div className="analytics-bento">
            {FARM_METRICS.map((m) => renderValueCard(m, farmValues[m.key]))}
          </div>

          <Typography className="analytics-section-title" variant="subtitle1" sx={{ mt: 2 }}>
            Ambient &mdash; Values
          </Typography>
          {weatherLoading && <CircularProgress size={24} />}
          {weatherError && <p className="analytics-error">{weatherError}</p>}
          {!weatherLoading && !weatherError && !ambientValues && (
            <p className="analytics-message">
              {lat == null ? 'Farm has no coordinates — cannot fetch weather.' : 'No weather data available.'}
            </p>
          )}
          <div className="analytics-bento">
            {!weatherLoading && ambientValues &&
              AMBIENT_METRICS.map((m) => renderValueCard(m, ambientValues[m.key]))}
          </div>
        </div>

        {/* ===== Column 2: Projections ===== */}
        <div className="analytics-col">
          <Typography className="analytics-section-title" variant="subtitle1">
            Farm &mdash; Projections
          </Typography>
          <div className="analytics-bento">
            {FARM_METRICS.map((m) => renderFarmProjectionCard(m))}
          </div>

          <Typography className="analytics-section-title" variant="subtitle1" sx={{ mt: 2 }}>
            Ambient &mdash; Projections
          </Typography>
          {weatherLoading && <CircularProgress size={24} />}
          {weatherError && <p className="analytics-error">{weatherError}</p>}
          {!weatherLoading && !weatherError && !forecast?.days?.length && (
            <p className="analytics-message">
              {lat == null ? 'Farm has no coordinates.' : 'No forecast data available.'}
            </p>
          )}
          <div className="analytics-bento">
            {!weatherLoading && forecast?.days?.length > 0 &&
              AMBIENT_METRICS.map((m) => renderAmbientProjectionCard(m))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
