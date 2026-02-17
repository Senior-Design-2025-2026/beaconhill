import React, { useState, useMemo, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Slider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  ListItemText,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import ScienceIcon from '@mui/icons-material/Science';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import MapComponent from '../../components/MapComponent/MapComponent';
import LinearGaugeComponent from '../../components/LinearGaugeComponent/LinearGaugeComponent';
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

/** Colors assigned to nodes in multi-node line charts. */
const NODE_COLORS = ['#1976d2', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#00acc1'];

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

/** Format timestamp in Chicago time for display (e.g. "2/15 6:00 PM CST"). */
function formatChicagoTime(ms) {
  if (ms == null) return '';
  const d = new Date(ms);
  return d.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

/** Descriptive label for a snapshot: index (1-based) + Chicago time. */
function formatSnapshotLabel(index, ms) {
  if (ms == null) return `Snapshot ${index + 1}`;
  const chicago = formatChicagoTime(ms);
  return `Snapshot ${index + 1} • ${chicago}`;
}

/**
 * LiveDashboardPage — real components with header, filters, and tabbed content.
 * Tab 0 (Snapshot View): Map + Measurements side-by-side, Snapshots slider below.
 * Tab 1 (Timeframe Averages): bento grid of per-metric charts + farm averages table.
 */
function LiveDashboardPage() {
  const { farms, nodes, measurements } = useMeasurements();
  const navigate = useNavigate();

  const [selectedFarm, setSelectedFarm] = useState(() => farms[0]?.farmId || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [activeTab, setActiveTab] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);

  /** Keep selectedFarm in sync when farms loads or when current selection is no longer in the list. */
  useEffect(() => {
    if (farms.length === 0) return;
    const found = farms.some((f) => f.farmId === selectedFarm);
    if (!selectedFarm || !found) {
      setSelectedFarm(farms[0].farmId);
    }
  }, [farms, selectedFarm]);

  /* --- Derived data --- */
  const farmNodes = useMemo(
    () => nodes.filter((n) => n.farmId === selectedFarm),
    [nodes, selectedFarm]
  );

  const selectedFarmData = useMemo(() => {
    return farms.find((f) => f.farmId === selectedFarm) || null;
  }, [farms, selectedFarm]);

  const selectedFarmName = selectedFarmData ? selectedFarmData.farmName : '';

  /** Reset selected nodes when the farm changes. */
  useEffect(() => {
    setSelectedNodeIds(farmNodes.map((n) => n.nodeId));
  }, [farmNodes]);

  const nodeIds = useMemo(() => farmNodes.map((n) => n.nodeId), [farmNodes]);

  /** Nodes that are currently selected via the filter. */
  const filteredNodes = useMemo(
    () => farmNodes.filter((n) => selectedNodeIds.includes(n.nodeId)),
    [farmNodes, selectedNodeIds]
  );

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

  /** Number of nodes with at least one measurement in the current timeframe. */
  const activeNodeCount = useMemo(() => {
    const nodeIdsWithData = new Set(timeFilteredMeasurements.map((m) => m.nodeId));
    return nodeIdsWithData.size;
  }, [timeFilteredMeasurements]);

  /* --- Slider timeline (hourly, min to max of time-filtered data, in epoch-ms) --- */

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

  /** Slider marks: index (1-based) + Chicago time. */
  const sliderMarks = useMemo(() => {
    return timeline.map((ms, i) => ({
      value: i,
      label: String(i + 1),
    }));
  }, [timeline]);

  /* --- Helpers for Snapshot View --- */
  function getMeasurementAt(nodeId, targetMs) {
    if (targetMs == null) return null;
    return timeFilteredMeasurements.find((m) => {
      if (m.nodeId !== nodeId) return false;
      const mDate = new Date(m.timestamp);
      mDate.setUTCMinutes(0, 0, 0);
      return mDate.getTime() === targetMs;
    }) || null;
  }

  /** Annotate ALL farm nodes with online/selected for the map. */
  const mapNodes = useMemo(() => {
    return farmNodes.map((node) => ({
      ...node,
      online: getMeasurementAt(node.nodeId, selectedTimestampMs) != null,
      selected: selectedNodeIds.includes(node.nodeId),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmNodes, selectedNodeIds, selectedTimestampMs, timeFilteredMeasurements]);

  /** Measurements for selected nodes only, filtered by timeframe. */
  const selectedTimeFilteredMeasurements = useMemo(
    () => timeFilteredMeasurements.filter((m) => selectedNodeIds.includes(m.nodeId)),
    [timeFilteredMeasurements, selectedNodeIds]
  );

  /* --- Render --- */
  return (
    <div className="live-dashboard">
      {/* Row 1: Header + Tab/Filter box */}
      <div className="live-dashboard-header-row">
        <div className="live-dashboard-header">
          <div className="live-dashboard-header-container">
            <HeaderComponent
              title={selectedFarmData.farmName}
              titleVariant="h4"
            >
              {selectedFarmData && (
                <>
                  <div className="live-dashboard-header-meta">
                    <div>
                      <strong>Address: </strong> {selectedFarmData.farmAddress}, {selectedFarmData.farmCity}, {selectedFarmData.farmState} {selectedFarmData.farmZipCode}
                    </div>
                    <div>
                      <strong>Crop: </strong> {selectedFarmData.farmCropType}
                      <span className="live-dashboard-header-sep" aria-hidden="true"> | </span>
                      <strong>Total Nodes: </strong> {selectedFarmData.numberOfNodes ?? farmNodes.length}
                      <span className="live-dashboard-header-sep" aria-hidden="true"> | </span>
                      <strong>Active Nodes: </strong> {selectedFarmData.numberOfNodes ?? farmNodes.length}  {/* TODO: add active nodes count */}
                    </div>
                  </div>
                </>
              )}
            </HeaderComponent>
          </div>
        </div>
        <div className="live-dashboard-tab-filter-box">
          <div className="live-dashboard-tabs">
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="fullWidth"
              textColor="inherit"
              TabIndicatorProps={{ style: { backgroundColor: '#EEBE02' } }}
            >
              <Tab label="Snapshot View" sx={{ fontWeight: activeTab === 0 ? 700 : 400 }} />
              <Tab label="Timeframe Averages" sx={{ fontWeight: activeTab === 1 ? 700 : 400 }} />
            </Tabs>
          </div>
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

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Node(s)</InputLabel>
              <Select
                label="Node(s)"
                multiple
                value={selectedNodeIds}
                onChange={(e) => setSelectedNodeIds(e.target.value)}
                renderValue={(sel) =>
                  farmNodes
                    .filter((n) => sel.includes(n.nodeId))
                    .map((n) => n.nodeName)
                    .join(', ')
                }
              >
                {farmNodes.map((node) => (
                  <MenuItem key={node.nodeId} value={node.nodeId}>
                    <Checkbox checked={selectedNodeIds.includes(node.nodeId)} />
                    <ListItemText primary={node.nodeName} />
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
      </div>

      {/* ===== Snapshot View tab ===== */}
      {activeTab === 0 && (
        <div className="snapshot-layout">
          {/* Top row: Snapshots slider */}
          {timeline.length > 0 && (
            <div className="snapshot-slider-box">
              <HeaderComponent
                title={`Snapshot ${effectiveSliderIndex + 1}`}
                titleVariant="h6"
              />
              <Slider
                value={effectiveSliderIndex}
                min={0}
                max={timeline.length - 1}
                step={1}
                marks={sliderMarks}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `Snapshot ${v + 1}`}
                onChange={(e, v) => setSliderIndex(v)}
                sx={{
                  color: '#9e9e9e',
                  '& .MuiSlider-rail': {
                    backgroundColor: '#bdbdbd',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#9e9e9e',
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#EEBE02',
                    '&:hover, &.Mui-focusVisible': {
                      backgroundColor: '#d4a900',
                    },
                  },
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: '#EEBE02',
                    color: '#2D2D2D',
                  },
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.75rem',
                    color: '#616161',
                  },
                }}
              />
            </div>
          )}

          {/* Map (25%) + Measurements (75%) */}
          <div className="snapshot-top-row">
            {/* Map box */}
            <div className="snapshot-left">
              <div className="snapshot-panel-box">
                <HeaderComponent
                  title="Map"
                  titleVariant="h6"
                />
                <div className="snapshot-map-fill">
                  <MapComponent nodes={mapNodes} height="100%" />
                </div>
              </div>
            </div>

            {/* Measurements box */}
            <div className="snapshot-right">
              <div className="snapshot-panel-box">
                <HeaderComponent
                  title="Measurements"
                  titleVariant="h6"
                />
                <div className="snapshot-nodes-scroll">
                  {filteredNodes.map((node) => {
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Timeframe Averages tab ===== */}
      {activeTab === 1 && (
        <div className="live-dashboard-tab-panel">
          <div className="averages-bento-grid">
            {/* Top-left: Farm Averages table */}
            <div className="bento-box">
              <Typography variant="h6" sx={{ color: '#2D2D2D', mb: 1 }}>
                Farm Averages
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Measurement</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Farm Avg</TableCell>
                      {filteredNodes.map((n) => (
                        <TableCell key={n.nodeId} sx={{ fontWeight: 700 }} align="right">
                          {n.nodeName}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {METRIC_CONFIG.map((metric) => {
                      const allValues = selectedTimeFilteredMeasurements.map((m) => m[metric.key]);
                      const farmAvg = allValues.length > 0
                        ? (allValues.reduce((s, v) => s + v, 0) / allValues.length).toFixed(1)
                        : '—';
                      return (
                        <TableRow key={metric.key}>
                          <TableCell>{metric.label} ({metric.unit.trim()})</TableCell>
                          <TableCell align="right">{farmAvg}</TableCell>
                          {filteredNodes.map((node) => {
                            const nodeVals = selectedTimeFilteredMeasurements
                              .filter((m) => m.nodeId === node.nodeId)
                              .map((m) => m[metric.key]);
                            const avg = nodeVals.length > 0
                              ? (nodeVals.reduce((s, v) => s + v, 0) / nodeVals.length).toFixed(1)
                              : '—';
                            return (
                              <TableCell key={node.nodeId} align="right">{avg}</TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {/* 5 per-metric line charts — each plots selected nodes */}
            {METRIC_CONFIG.map((metric) => {
              const traces = filteredNodes.map((node, idx) => {
                const nodeMeasurements = selectedTimeFilteredMeasurements
                  .filter((m) => m.nodeId === node.nodeId)
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                return {
                  x: nodeMeasurements.map((m) => m.timestamp),
                  y: nodeMeasurements.map((m) => m[metric.key]),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: node.nodeName,
                  line: { color: NODE_COLORS[idx % NODE_COLORS.length], width: 2 },
                  marker: { size: 4 },
                };
              });

              const layout = {
                title: { text: `${metric.label} (${metric.unit.trim()})`, font: { size: 13, color: '#2D2D2D' } },
                xaxis: { type: 'date', tickformat: '%H:%M' },
                yaxis: { title: metric.unit.trim() },
                legend: { orientation: 'h', y: -0.3 },
                margin: { l: 48, r: 16, t: 36, b: 72 },
                autosize: true,
                height: 300,
              };

              return (
                <div key={metric.key} className="bento-box">
                  <Plot
                    data={traces}
                    layout={layout}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler
                    style={{ width: '100%' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDashboardPage;
