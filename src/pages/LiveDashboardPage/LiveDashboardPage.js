import React, { useState, useMemo } from 'react';
import {
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Slider,
  Box,
  Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import MapComponent from '../../components/MapComponent/MapComponent';
import LinearGaugeComponent from '../../components/LinearGaugeComponent/LinearGaugeComponent';
import AnalyticsCardComponent from '../../components/AnalyticsCardComponent/AnalyticsCardComponent';
import { useMeasurements } from '../../context/MeasurementsContext';
import './LiveDashboardPage.css';

/**
 * Metric configuration: maps each measurement key to display props and
 * fixed low/mid/high ranges for LinearGaugeComponent.
 */
const METRIC_CONFIG = [
  { key: 'temperature', label: 'Temperature', unit: '°F', low: 0, mid: 50, high: 100 },
  { key: 'moisture',    label: 'Moisture',    unit: '%',  low: 0, mid: 50, high: 100 },
  { key: 'nitrogen',    label: 'Nitrogen',    unit: ' ppm', low: 0, mid: 25, high: 50 },
  { key: 'phosphorus',  label: 'Phosphorus',  unit: ' ppm', low: 0, mid: 15, high: 30 },
  { key: 'potassium',   label: 'Potassium',   unit: ' ppm', low: 0, mid: 100, high: 200 },
];

const TIMEFRAME_OPTIONS = [
  { label: 'Last 6 Hours',  value: '6h' },
  { label: 'Last 12 Hours', value: '12h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days',   value: '7d' },
  { label: 'Last 30 Days',  value: '30d' },
];

/** Convert a timeframe string to milliseconds. */
function getTimeWindowMs(tf) {
  const map = {
    '6h':  6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return map[tf] || map['24h'];
}

/**
 * Build an array of hourly UTC epoch-ms values from minMs to maxMs (inclusive).
 * Each value is snapped to the top of the hour in UTC.
 */
function buildHourlyTimeline(minMs, maxMs) {
  const start = new Date(minMs);
  start.setUTCMinutes(0, 0, 0);
  const end = new Date(maxMs);
  end.setUTCMinutes(0, 0, 0);

  const timeline = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    timeline.push(cursor.getTime());
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }
  return timeline;
}

/** Format a UTC epoch-ms value to a short label like "02/15 08:00". */
function formatTimestampLabel(ms) {
  const d = new Date(ms);
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

/** Format just the hour portion for slider tick marks. */
function formatHourLabel(ms) {
  const d = new Date(ms);
  return `${String(d.getUTCHours()).padStart(2, '0')}:00`;
}

/**
 * LiveDashboardPage — real components with header, filters, and tabbed content.
 * Tab 0 (Snapshot View): Map, Timestamp Slider, per-node gauges with on/off status.
 * Tab 1 (Timeframe Averages): per-node analytics line charts.
 */
function LiveDashboardPage() {
  const { farms, nodes, measurements } = useMeasurements();
  const navigate = useNavigate();

  const [selectedFarm, setSelectedFarm] = useState(farms[0]?.farmId || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [activeTab, setActiveTab] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(null);

  /* --- Derived data --- */

  const farmNodes = useMemo(
    () => nodes.filter((n) => n.farmId === selectedFarm),
    [nodes, selectedFarm]
  );

  const nodeIds = useMemo(() => farmNodes.map((n) => n.nodeId), [farmNodes]);

  /** All measurements for nodes in the selected farm. */
  const farmMeasurements = useMemo(
    () => measurements.filter((m) => nodeIds.includes(m.nodeId)),
    [measurements, nodeIds]
  );

  /** "now" = max timestamp in farm measurements (deterministic for dummy data). */
  const maxTimestampMs = useMemo(() => {
    if (farmMeasurements.length === 0) return Date.now();
    return Math.max(...farmMeasurements.map((m) => new Date(m.timestamp).getTime()));
  }, [farmMeasurements]);

  /** Measurements filtered by the selected timeframe window. */
  const timeFilteredMeasurements = useMemo(() => {
    const windowMs = getTimeWindowMs(selectedTimeframe);
    const cutoff = maxTimestampMs - windowMs;
    return farmMeasurements.filter((m) => new Date(m.timestamp).getTime() >= cutoff);
  }, [farmMeasurements, selectedTimeframe, maxTimestampMs]);

  /* --- Slider timeline (hourly, min→max of time-filtered data, in epoch-ms) --- */

  const timeline = useMemo(() => {
    if (timeFilteredMeasurements.length === 0) return [];
    const timestamps = timeFilteredMeasurements.map((m) => new Date(m.timestamp).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    return buildHourlyTimeline(minTs, maxTs);
  }, [timeFilteredMeasurements]);

  /** Set of epoch-ms values (snapped to hour) that have at least one measurement. */
  const timestampsWithData = useMemo(() => {
    const set = new Set();
    timeFilteredMeasurements.forEach((m) => {
      const d = new Date(m.timestamp);
      d.setUTCMinutes(0, 0, 0);
      set.add(d.getTime());
    });
    return set;
  }, [timeFilteredMeasurements]);

  const effectiveSliderIndex = sliderIndex != null ? sliderIndex : Math.max(0, timeline.length - 1);
  const selectedTimestampMs = timeline[effectiveSliderIndex] || null;

  /** Slider marks with the hour as the label for each tick. */
  const sliderMarks = useMemo(() => {
    return timeline.map((ms, i) => ({
      value: i,
      label: formatHourLabel(ms),
    }));
  }, [timeline]);

  /* --- Helpers for Snapshot View --- */

  /**
   * Get a node's measurement at the selected timestamp (compared by epoch-ms).
   * Snaps the measurement timestamp to the hour before comparing.
   */
  function getMeasurementAt(nodeId, targetMs) {
    if (targetMs == null) return null;
    return timeFilteredMeasurements.find((m) => {
      if (m.nodeId !== nodeId) return false;
      const mDate = new Date(m.timestamp);
      mDate.setUTCMinutes(0, 0, 0);
      return mDate.getTime() === targetMs;
    }) || null;
  }

  /* --- Render --- */

  return (
    <div className="live-dashboard">
      {/* Header row */}
      <div className="live-dashboard-header-row">
        <HeaderComponent
          title="Live Dashboard"
          description="Real-time farm measurement data"
        />

        <div className="live-dashboard-filters">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Farm</InputLabel>
            <Select
              label="Farm"
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
            >
              {farms.map((farm) => (
                <MenuItem key={farm.farmId} value={farm.farmId}>
                  {farm.farmName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              label="Timeframe"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              {TIMEFRAME_OPTIONS.map((tf) => (
                <MenuItem key={tf.value} value={tf.value}>
                  {tf.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Tabs */}
      <div className="live-dashboard-tabs">
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: '#EEBE02' } }}
        >
          <Tab label="Snapshot View" sx={{ fontWeight: activeTab === 0 ? 700 : 400 }} />
          <Tab label="Timeframe Averages" sx={{ fontWeight: activeTab === 1 ? 700 : 400 }} />
        </Tabs>
      </div>

      {/* ===== Snapshot View tab ===== */}
      {activeTab === 0 && (
        <div className="live-dashboard-tab-panel">
          {/* Map */}
          <MapComponent nodes={farmNodes} height={400} />

          {/* Timestamp Slider */}
          {timeline.length > 0 && (
            <Box className="snapshot-slider-wrapper">
              <Typography variant="subtitle2" sx={{ color: '#2D2D2D', mb: 1 }}>
                Timestamp: {selectedTimestampMs != null ? formatTimestampLabel(selectedTimestampMs) : '—'}
                {selectedTimestampMs != null && !timestampsWithData.has(selectedTimestampMs) && (
                  <span className="slider-no-data-hint"> (no data at this hour)</span>
                )}
              </Typography>
              <Slider
                value={effectiveSliderIndex}
                min={0}
                max={timeline.length - 1}
                step={1}
                marks={sliderMarks}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => formatTimestampLabel(timeline[v])}
                onChange={(e, v) => setSliderIndex(v)}
                sx={{
                  color: '#EEBE02',
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.6rem',
                    color: '#616161',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    mt: 1,
                  },
                }}
              />
            </Box>
          )}

          {/* Per-node sections */}
          {farmNodes.map((node) => {
            const measurement = getMeasurementAt(node.nodeId, selectedTimestampMs);
            const online = measurement != null;
            return (
              <div key={node.nodeId} className="node-section">
                <div className="node-section-header">
                  <div className="node-section-header-left">
                    <Typography variant="h6" sx={{ color: '#2D2D2D' }}>
                      {node.nodeName}
                    </Typography>
                    <span
                      className={`node-status-badge ${online ? 'node-status-badge--on' : 'node-status-badge--off'}`}
                    >
                      {online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => navigate('/configuration')}
                    sx={{
                      borderColor: '#EEBE02',
                      color: '#2D2D2D',
                      '&:hover': { borderColor: '#d4a900', backgroundColor: 'rgba(238,190,2,0.08)' },
                    }}
                  >
                    Configure
                  </Button>
                </div>

                <div className="node-gauges-row">
                  {METRIC_CONFIG.map((metric) => (
                    <div key={metric.key} className="node-gauge-item">
                      {online ? (
                        <LinearGaugeComponent
                          label={metric.label}
                          value={measurement[metric.key]}
                          low={metric.low}
                          mid={metric.mid}
                          high={metric.high}
                          unit={metric.unit}
                        />
                      ) : (
                        <div className="node-gauge-placeholder">
                          <Typography variant="subtitle2" sx={{ color: '#2D2D2D', mb: 0.5 }}>
                            {metric.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                            No Measurement Detected
                          </Typography>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Timeframe Averages tab ===== */}
      {activeTab === 1 && (
        <div className="live-dashboard-tab-panel">
          {farmNodes.map((node) => {
            const nodeMeasurements = timeFilteredMeasurements.filter(
              (m) => m.nodeId === node.nodeId
            );
            return (
              <AnalyticsCardComponent
                key={node.nodeId}
                nodeName={node.nodeName}
                measurements={nodeMeasurements}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LiveDashboardPage;
