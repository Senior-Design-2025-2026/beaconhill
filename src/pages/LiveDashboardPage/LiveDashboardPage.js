import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import dummyData from '../../data/dummy_measurements.json';
import './LiveDashboardPage.css';

const METRICS = ['Temperature', 'Moisture', 'Nitrogen', 'Phosphorus', 'Potassium'];

const TIMEFRAME_OPTIONS = [
  { label: 'Last 6 Hours', value: '6h' },
  { label: 'Last 12 Hours', value: '12h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

/**
 * Collect all unique timestamps from measurements for a set of nodes.
 * @param {string[]} nodeIds
 * @returns {string[]} sorted ISO timestamp strings
 */
function getTimestamps(nodeIds) {
  const set = new Set();
  dummyData.measurements.forEach((m) => {
    if (nodeIds.includes(m.nodeId)) set.add(m.timestamp);
  });
  return [...set].sort();
}

/**
 * Check whether a node has a measurement at a given timestamp.
 * @param {string} nodeId
 * @param {string} timestamp
 * @returns {boolean}
 */
function isNodeOnline(nodeId, timestamp) {
  return dummyData.measurements.some(
    (m) => m.nodeId === nodeId && m.timestamp === timestamp
  );
}

/**
 * LiveDashboardPage — ghost layout with header, filters, and tabbed content.
 * Tab 1 (Live View): Map, Slider, and per-node gauge sections with on/off status.
 * Tab 2 (Measurement Averages): per-node analytics card placeholders.
 */
function LiveDashboardPage() {
  const [selectedFarm, setSelectedFarm] = useState(dummyData.farms[0]?.farmId || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [activeTab, setActiveTab] = useState(0);

  const farmNodes = dummyData.nodes.filter((n) => n.farmId === selectedFarm);
  const nodeIds = farmNodes.map((n) => n.nodeId);
  const allTimestamps = getTimestamps(nodeIds);
  const currentTimestamp = allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : null;

  return (
    <div className="live-dashboard">
      {/* Header row: title left, filters right */}
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
              {dummyData.farms.map((farm) => (
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
          <Tab label="Live View" sx={{ fontWeight: activeTab === 0 ? 700 : 400 }} />
          <Tab label="Measurement Averages" sx={{ fontWeight: activeTab === 1 ? 700 : 400 }} />
        </Tabs>
      </div>

      {/* Live View tab */}
      {activeTab === 0 && (
        <div className="live-dashboard-tab-panel">
          {/* Map placeholder */}
          <div className="ghost-placeholder ghost-placeholder-map">
            <Typography variant="body1" className="ghost-placeholder-text">
              Map Component Placeholder
            </Typography>
          </div>

          {/* Slider placeholder */}
          <div className="ghost-placeholder ghost-placeholder-slider">
            <Typography variant="body1" className="ghost-placeholder-text">
              Slider Component Placeholder
            </Typography>
          </div>

          {/* Per-node sections */}
          {farmNodes.map((node) => {
            const online = currentTimestamp ? isNodeOnline(node.nodeId, currentTimestamp) : false;
            return (
              <div key={node.nodeId} className="node-section">
                <div className="node-section-header">
                  <Typography variant="h6" sx={{ color: '#2D2D2D' }}>
                    {node.nodeName}
                  </Typography>
                  <span className={`node-status-badge ${online ? 'node-status-badge--on' : 'node-status-badge--off'}`}>
                    {online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="node-gauges-row">
                  {METRICS.map((metric) => (
                    <div key={metric} className="ghost-placeholder-gauge">
                      <Typography variant="caption" className="ghost-placeholder-text">
                        {metric} Gauge
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Measurement Averages tab */}
      {activeTab === 1 && (
        <div className="live-dashboard-tab-panel">
          {farmNodes.map((node) => (
            <div key={node.nodeId} className="ghost-placeholder ghost-placeholder-analytics">
              <Typography variant="body1" className="ghost-placeholder-text">
                Analytics Card — {node.nodeName}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveDashboardPage;
