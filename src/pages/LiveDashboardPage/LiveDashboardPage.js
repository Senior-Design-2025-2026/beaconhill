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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import MapComponent from '../../components/MapComponent/MapComponent';
import LinearGaugeComponent from '../../components/LinearGaugeComponent/LinearGaugeComponent';
import { useMeasurements } from '../../context/MeasurementsContext';
import { isTestMode } from '../../config';
import beaconLogo from '../../assets/BeaconHill.svg';
import './LiveDashboardPage.css';

const TEST_DATE_MS = isTestMode ? 1771318800000 - 60 * 60 * 1000 : null;

const METRIC_CONFIG = {
  corn: [
    { key: 'temperature', label: 'Temperature', unit: '°C', low: 10, lowThreshold: 18, highThreshold: 30, high: 35 },
    { key: 'moisture',    label: 'Moisture',    unit: '%',  low: 15, lowThreshold: 20, highThreshold: 35, high: 45 },
    { key: 'nitrogen',    label: 'Nitrogen',    unit: 'ppm', low: 50, lowThreshold: 80, highThreshold: 150, high: 200 },
    { key: 'phosphorus',  label: 'Phosphorus',  unit: 'ppm', low: 15, lowThreshold: 25, highThreshold: 50, high: 80 },
    { key: 'potassium',   label: 'Potassium',   unit: 'ppm', low: 80, lowThreshold: 120, highThreshold: 200, high: 300 },
  ],
  soybean: [
    { key: 'temperature', label: 'Temperature', unit: '°C', low: 15, lowThreshold: 20, highThreshold: 30, high: 35 },
    { key: 'moisture',    label: 'Moisture',    unit: '%',  low: 15, lowThreshold: 20, highThreshold: 30, high: 40 },
    { key: 'nitrogen',    label: 'Nitrogen',    unit: 'ppm', low: 20, lowThreshold: 50, highThreshold: 100, high: 150 },
    { key: 'phosphorus',  label: 'Phosphorus',  unit: 'ppm', low: 10, lowThreshold: 20, highThreshold: 40, high: 70 },
    { key: 'potassium',   label: 'Potassium',   unit: 'ppm', low: 80, lowThreshold: 120, highThreshold: 200, high: 300 },
  ],
};

const NODE_COLORS = ['#1976d2', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#00acc1'];

const TIMEFRAME_OPTIONS = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days',   value: '7d' },
  { label: 'Last 30 Days',  value: '30d' },
];

function epochToDate(ts) {
  if (ts == null) return NaN;
  return typeof ts === 'number' ? ts * 1000 : new Date(ts * 1000).getTime();
}

function getTimeWindowMilliseconds(tf) {
  const map = {
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return map[tf] || map['24h'];
}

/**
 * Each value is snapped to the top of the hour in UTC.
 */
function buildHourlyTimeline(minMs, maxMs) {
  const start = new Date(minMs);
  start.setUTCMinutes(0, 0, 0);
  const end = TEST_DATE_MS ? new Date(TEST_DATE_MS) : new Date();
  end.setUTCMinutes(0, 0, 0);
  end.setUTCHours(end.getUTCHours() - 1);
  
  const timeline = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    timeline.push(cursor.getTime());
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }
  return timeline;
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

/** Format timestamp in Chicago time for display (e.g. "2/15\n6:00 PM CST"). */
function formatChicagoTimeLineSplit(ms) {
  if (ms == null) return '';
  const d = new Date(ms);
  const tz = { timeZone: 'America/Chicago' };
  const dateStr = d.toLocaleString('en-US', {
    ...tz,
    month: 'numeric',
    day: 'numeric',
  });
  const timeStr = d.toLocaleString('en-US', {
    ...tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
  return `${dateStr}\n${timeStr}`;
}

/**
 * LiveDashboardPage — real components with header, filters, and tabbed content.
 * Tab 0 (Snapshot View): Map + Measurements side-by-side, Snapshots slider below.
 * Tab 1 (Timeframe Averages): bento grid of per-metric charts + farm averages table.
 */
function LiveDashboardPage() {
  const { farms, nodes, measurements } = useMeasurements();
  const navigate = useNavigate();

  const [selectedFarm, setSelectedFarm] = useState(() => farms[0] || null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [activeTab, setActiveTab] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(METRIC_CONFIG['corn']);

  function changeSelectedFarm(farmId) {
    const newFarm = farms.find((f) => f.farmId === farmId);
    if (newFarm) {
      setSelectedFarm(newFarm);
    } else {
      setSelectedFarm(farms[0] || null);
    }
  }

  /** Keep selectedFarm in sync when farms loads or when current selection is no longer in the list. */
  useEffect(() => {
    if (farms.length === 0) return;
    const found = farms.some((f) => f.farmId === selectedFarm?.farmId);
    if (!selectedFarm || !found) {
      setSelectedFarm(farms[0]);
    }
  }, [farms, selectedFarm]);

  /* --- Derived data --- */
  const farmNodes = useMemo(
    () => nodes.filter((n) => n.farmId === selectedFarm?.farmId),
    [nodes, selectedFarm]
  );

  const nodeIds = useMemo(() => farmNodes.map((n) => n.nodeId), [farmNodes]);

  const farmMeasurements = useMemo(
    () => measurements.filter((m) => nodeIds.includes(m.nodeId)),
    [measurements, nodeIds]
  );

  const maxTimestampMs = useMemo(() => {
    if (farmMeasurements.length === 0) return Date.now();
    return Math.max(...farmMeasurements.map((m) => epochToDate(m.timestamp)));
  }, [farmMeasurements]);

  /** Measurements filtered by the selected timeframe window. */
  const timeFilteredMeasurements = useMemo(() => {
    const windowMs = getTimeWindowMilliseconds(selectedTimeframe);
    const cutoff = (TEST_DATE_MS ?? Date.now()) - windowMs;
    return farmMeasurements.filter((m) => epochToDate(m.timestamp) >= cutoff);
  }, [farmMeasurements, selectedTimeframe]);


  const timeline = useMemo(() => {
    const minimumTime = (TEST_DATE_MS ? new Date(TEST_DATE_MS) : new Date()) - getTimeWindowMilliseconds(selectedTimeframe);

    return buildHourlyTimeline(minimumTime, TEST_DATE_MS ? new Date(TEST_DATE_MS) : new Date());
  }, [timeFilteredMeasurements]);

  const effectiveSliderIndex = sliderIndex != null ? sliderIndex : Math.max(0, timeline.length - 1);
  const selectedTimestampMs = timeline[effectiveSliderIndex] || null;

  /** Slider marks: index (1-based) + Chicago time. */
  const sliderMarks = useMemo(() => {
    if (timeline.length === 0) return [];
    return timeline.map((ms, i) => {
      const isFirst = i === 0;
      const isLast = i === timeline.length - 1;
      const label = isFirst || isLast
        ? formatChicagoTimeLineSplit(ms)
        : '';
      return { value: i, label };
    });
  }, [timeline]);

  /* --- Helpers for Snapshot View --- */
  function getMeasurementAt(nodeId, targetMs) {
    if (targetMs == null) return null;
    return timeFilteredMeasurements.find((m) => {
      if (m.nodeId !== nodeId) return false;
      const mDate = new Date(epochToDate(m.timestamp));
      mDate.setUTCMinutes(0, 0, 0);
      return mDate.getTime() === targetMs;
    }) || null;
  }

  /** Annotate ALL farm nodes with online/selected for the map. */
  const mapNodes = useMemo(() => {
    return farmNodes.map((node) => ({
      ...node,
      online: getMeasurementAt(node.nodeId, selectedTimestampMs) != null,
    }));
  }, [farmNodes, nodeIds, selectedTimestampMs, timeFilteredMeasurements]);

  const traces = useMemo(() => {
    return farmNodes.map((node, idx) => {
      const nodeMeasurements = timeFilteredMeasurements
        .filter((m) => m.nodeId === node.nodeId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
      return {
        x: nodeMeasurements.map((m) => epochToDate(m.timestamp)),
        y: nodeMeasurements.map((m) => m[selectedMetric.key]),
        type: 'scatter',
        mode: 'lines+markers',
        name: node.nodeName,
        line: { color: NODE_COLORS[idx % NODE_COLORS.length], width: 2 },
        marker: { size: 4 },
      };
    });
  }, [farmNodes, timeFilteredMeasurements, selectedMetric]);
  
  const layout = useMemo(() => ({
    title: { text: `${selectedMetric.label} (${selectedMetric.unit})`, font: { size: 13, color: '#2D2D2D' } },
    xaxis: { type: 'date', tickformat: '%H:%M', title: { text: "Timestamp" } },
    yaxis: { title: { text: selectedMetric.unit } },
    legend: { orientation: 'h', y: -0.3 },
    margin: { l: 40, r: 24, t: 36, b: 16 },
    height: 300,
  }), [selectedMetric]);

  /* --- Render --- */
  return (
    <div className="live-dashboard">
      {/* Row 1: Header + Tab/Filter box */}
      <div className="live-dashboard-header-row">
        <div className="live-dashboard-header">
          <HeaderComponent
              title={selectedFarm?.farmName || 'Select a farm'}
              titleVariant="h4"
              titleSx={{ color: '#EEBE02' }}
            >
              {selectedFarm && (
                <div className="live-dashboard-header-meta">
                  <div>
                    <strong>Address: </strong> {selectedFarm.farmAddress}, {selectedFarm.farmCity}, {selectedFarm.farmState}
                  </div>
                  <div>
                    <strong>Nodes: </strong> {farmNodes.length}
                  </div>
                  <div>
                    <strong>Crop: </strong> {selectedFarm.farmCropType}
                  </div>
                  <div>
                    <strong>Last Updated: </strong> {maxTimestampMs ? formatChicagoTime(maxTimestampMs) : 'No measurements'}
                  </div>
                </div>
              )}
            </HeaderComponent>
        </div>
        <div className="live-dashboard-tab-filter-box">
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="fullWidth"
            textColor="inherit"
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTabs-indicator': {
                backgroundColor: '#EEBE02',
              },
            }}
            
          >
            <Tab label="Snapshot View" sx={{ fontWeight: activeTab === 0 ? 700 : 400 }} />
            <Tab label="Timeframe Averages" sx={{ fontWeight: activeTab === 1 ? 700 : 400 }} />
          </Tabs>
          <div className="live-dashboard-filters">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Farm</InputLabel>
              <Select
                label="Farm"
                value={selectedFarm?.farmId ?? ''}
                onChange={(e) => changeSelectedFarm(e.target.value)}
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
          {/* Snapshot slider - visible in both tabs */}
          {timeline.length > 0 && (
            <div className="live-dashboard-slider">
              <Slider
                value={effectiveSliderIndex}
                track={false}
                min={0}
                max={timeline.length - 1}
                step={1}
                marks={sliderMarks}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => formatChicagoTime(timeline[v])}
                onChange={(e, v) => setSliderIndex(v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== Snapshot View tab ===== */}
      {activeTab === 0 && (
        <div className="snapshot-row">
          {/* Map box */}
          <div className="snapshot-left">
            <div className="snapshot-panel-box">
              <div className="snapshot-map-fill">
                <MapComponent nodes={mapNodes} height={400} />
                <img
                  src={beaconLogo}
                  alt=""
                  height={40}
                  style={{ display: 'block', width: 'auto', alignSelf: 'flex-start' }}
                />
              </div>
            </div>
          </div>

          {/* Measurements box */}
          <div className="snapshot-right">
            <div className="snapshot-panel-box">
              <HeaderComponent
                title={timeline.length > 0 ? `Snapshot: ${formatChicagoTime(selectedTimestampMs)}` : 'Measurements'}
                titleVariant="h6"
              />
              <div className="snapshot-nodes-scroll">
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
                        {METRIC_CONFIG[selectedFarm?.farmCropType?.toLowerCase()]?.map((metric) => (
                          <div key={metric.key} className="node-gauge-item">
                            {online ? (
                              <LinearGaugeComponent
                                label={metric.label}
                                value={measurement[metric.key]}
                                low={metric.low}
                                lowThreshold={metric.lowThreshold}
                                highThreshold={metric.highThreshold}
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
      )}

      {/* ===== Timeframe Averages tab ===== */}
      {activeTab === 1 && (
        <div className="averages-row">
          {/* Top-left: Farm Averages table */}
          <div className="table-box">
            <Typography variant="h6" sx={{ color: '#2D2D2D', mb: 1 }}>
              Farm Averages
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Measurement</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Farm Avg</TableCell>
                    {farmNodes.map((n) => (
                      <TableCell key={n.nodeId} sx={{ fontWeight: 700 }} align="right">
                        {n.nodeName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {METRIC_CONFIG[selectedFarm?.farmCropType?.toLowerCase()]?.map((metric) => {
                    const allValues = timeFilteredMeasurements.map((m) => m[metric.key]);
                    const farmAvg = allValues.length > 0
                      ? (allValues.reduce((s, v) => s + v, 0) / allValues.length).toFixed(1)
                      : '—';
                    return (
                      <TableRow key={metric.key}>
                        <TableCell>{metric.label} ({metric.unit})</TableCell>
                        <TableCell align="right">{farmAvg}</TableCell>
                        {farmNodes.map((node) => {
                          const nodeVals = timeFilteredMeasurements
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

          {/* Line charts */}
          <div className="line-chart-box">
            <div className="metric-filter">
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Measurement</InputLabel>
                <Select
                  label="Measurement"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  {METRIC_CONFIG[selectedFarm?.farmCropType?.toLowerCase()]?.map((metric) => (
                    <MenuItem key={metric.key} value={metric}>
                      {metric.label + ' (' + metric.unit + ')'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="line-chart">
              <Plot
                data={traces}
                layout={layout}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDashboardPage;
