import React, { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import { DUMMY_FARM_CURRENT } from '../../data/analyticsDummyFarm';

const DEFAULT_LAT = 41.6611;
const DEFAULT_LON = -91.5302;

const COMPARISON_METRICS = [
  { label: 'Ground Temperature',      nodeKey: 'temperature',  nodeUnit: '°F',   apiKey: 'soil_temperature_0cm',    apiUnit: '°F', convertCtoF: true, context: 'Soil temp at surface' },
  { label: 'Ground Moisture',          nodeKey: 'moisture',     nodeUnit: '%',    apiKey: 'soil_moisture_0_to_1cm',  apiUnit: 'm³/m³', context: 'Volumetric soil water 0–1 cm' },
  { label: 'Ambient Temperature',      nodeKey: null,           nodeUnit: '',     apiKey: 'temperature_2m',          apiUnit: '°F', convertCtoF: true, context: 'Air temp at 2 m height' },
  { label: 'Relative Humidity',        nodeKey: null,           nodeUnit: '',     apiKey: 'relative_humidity_2m',    apiUnit: '%',     context: 'At 2 m height' },
  { label: 'Precipitation',            nodeKey: null,           nodeUnit: '',     apiKey: 'precipitation',           apiUnit: 'mm',    context: 'Nutrient runoff / leaching indicator' },
  { label: 'Evapotranspiration',       nodeKey: null,           nodeUnit: '',     apiKey: 'evapotranspiration',      apiUnit: 'mm',    context: 'Soil drying rate' },
  { label: 'Vapour Pressure Deficit',  nodeKey: null,           nodeUnit: '',     apiKey: 'vapour_pressure_deficit', apiUnit: 'kPa',   context: 'Atmospheric drying power' },
  { label: 'Nitrogen (N)',             nodeKey: 'nitrogen',     nodeUnit: 'ppm',  apiKey: null,                      apiUnit: '',      context: 'Soil nutrient — no direct API equivalent' },
  { label: 'Phosphorus (P)',           nodeKey: 'phosphorus',   nodeUnit: 'ppm',  apiKey: null,                      apiUnit: '',      context: 'Soil nutrient — no direct API equivalent' },
  { label: 'Potassium (K)',            nodeKey: 'potassium',    nodeUnit: 'ppm',  apiKey: null,                      apiUnit: '',      context: 'Soil nutrient — no direct API equivalent' },
];

const AIR_QUALITY_METRICS = [
  { label: 'Ammonia (NH\u2083)',          apiKey: 'ammonia',          apiUnit: '\u00b5g/m\u00b3', context: 'Atmospheric nitrogen impact' },
  { label: 'Nitrogen Dioxide (NO\u2082)', apiKey: 'nitrogen_dioxide', apiUnit: '\u00b5g/m\u00b3', context: 'Atmospheric nitrogen impact' },
];

function buildProjectionUrls(lat, lon) {
  return {
    weather: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,evapotranspiration,vapour_pressure_deficit,soil_temperature_0cm,soil_moisture_0_to_1cm`,
    airQuality: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=ammonia,nitrogen_dioxide`,
    elevation: `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`,
  };
}

function cToF(celsius) {
  return celsius * 9 / 5 + 32;
}

function formatVal(value, unit, shouldConvert = false) {
  if (value == null) return '—';
  let num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '—';
  if (shouldConvert) num = cToF(num);
  const rounded = Math.round(num * 100) / 100;
  return unit ? `${rounded} ${unit}` : `${rounded}`;
}

/**
 * Forecast tab: side-by-side comparison of hardware node vs Open-Meteo modeled data.
 * @param {{ lat: number|null, lon: number|null }} props
 */
export default function AnalyticsProjection({ lat, lon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLat = lat ?? DEFAULT_LAT;
  const fetchLon = lon ?? DEFAULT_LON;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const urls = buildProjectionUrls(fetchLat, fetchLon);

    try {
      const [weatherRes, airRes, elevRes] = await Promise.allSettled([
        fetch(urls.weather).then((r) => {
          if (!r.ok) throw new Error(`Weather: HTTP ${r.status}`);
          return r.json();
        }),
        fetch(urls.airQuality).then((r) => {
          if (!r.ok) throw new Error(`Air Quality: HTTP ${r.status}`);
          return r.json();
        }),
        fetch(urls.elevation).then((r) => {
          if (!r.ok) throw new Error(`Elevation: HTTP ${r.status}`);
          return r.json();
        }),
      ]);

      setData({
        weather: weatherRes.status === 'fulfilled' ? weatherRes.value : { error: weatherRes.reason?.message },
        airQuality: airRes.status === 'fulfilled' ? airRes.value : { error: airRes.reason?.message },
        elevation: elevRes.status === 'fulfilled' ? elevRes.value : { error: elevRes.reason?.message },
        coordinates: { lat: fetchLat, lon: fetchLon },
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch forecast data');
    } finally {
      setLoading(false);
    }
  }, [fetchLat, fetchLon]);

  useEffect(() => { load(); }, [load]);

  function getApiValue(apiKey) {
    if (!apiKey || !data) return null;
    const wc = data.weather?.current;
    if (wc && wc[apiKey] != null) return wc[apiKey];
    const aq = data.airQuality?.current;
    if (aq && aq[apiKey] != null) return aq[apiKey];
    return null;
  }

  function renderContent() {
    if (!data) return null;

    const nodeData = DUMMY_FARM_CURRENT;
    const elevRaw = data.elevation?.elevation;
    const elevationVal = Array.isArray(elevRaw) ? elevRaw[0] : elevRaw ?? null;
    const latDir = data.coordinates.lat >= 0 ? 'N' : 'S';
    const lonDir = data.coordinates.lon >= 0 ? 'E' : 'W';

    return (
      <>
        <div className="analytics-site-info">
          <Typography variant="subtitle2" className="analytics-site-info-title">
            Site Info
          </Typography>
          <div className="analytics-site-info-grid">
            <span className="analytics-site-info-label">Coordinates</span>
            <span className="analytics-site-info-value">
              {Math.abs(data.coordinates.lat).toFixed(4)}°{latDir},{' '}
              {Math.abs(data.coordinates.lon).toFixed(4)}°{lonDir}
            </span>
            <span className="analytics-site-info-label">Elevation</span>
            <span className="analytics-site-info-value">
              {elevationVal != null ? `${elevationVal} m` : '—'}
            </span>
          </div>
        </div>

        <div className="analytics-compare-card">
          <Typography variant="subtitle2" className="analytics-compare-card-title">
            Soil &amp; Weather Comparison
          </Typography>
          <table className="analytics-compare-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Node (Ground Truth)</th>
                <th>Open-Meteo (Modeled)</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_METRICS.map((m) => {
                const nodeVal = m.nodeKey ? nodeData[m.nodeKey] : null;
                const apiVal = getApiValue(m.apiKey);
                return (
                  <tr key={m.label}>
                    <td className="analytics-compare-metric">{m.label}</td>
                    <td className="analytics-compare-node-val">{formatVal(nodeVal, m.nodeUnit)}</td>
                    <td className="analytics-compare-api-val">{formatVal(apiVal, m.apiUnit, m.convertCtoF)}</td>
                    <td className="analytics-compare-context">{m.context}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="analytics-compare-card">
          <Typography variant="subtitle2" className="analytics-compare-card-title">
            Air Quality
          </Typography>
          <table className="analytics-compare-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              {AIR_QUALITY_METRICS.map((m) => {
                const val = getApiValue(m.apiKey);
                return (
                  <tr key={m.label}>
                    <td className="analytics-compare-metric">{m.label}</td>
                    <td className="analytics-compare-api-val">{formatVal(val, m.apiUnit)}</td>
                    <td className="analytics-compare-context">{m.context}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.weather?.error && (
          <p className="analytics-error">Weather API: {data.weather.error}</p>
        )}
        {data.airQuality?.error && (
          <p className="analytics-error">Air Quality API: {data.airQuality.error}</p>
        )}
        {data.elevation?.error && (
          <p className="analytics-error">Elevation API: {data.elevation.error}</p>
        )}
      </>
    );
  }

  return (
    <div className="analytics-projection">
      <Typography className="analytics-section-title" variant="h6" sx={{ mb: 2 }}>
        <span className="analytics-ambient-title">Forecast</span>
        <span className="analytics-ambient-subtitle">Node vs. Open-Meteo</span>
      </Typography>
      {loading && <CircularProgress size={28} />}
      {error && <p className="analytics-error">{error}</p>}
      {!loading && !error && renderContent()}
    </div>
  );
}
