import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import Plot from 'react-plotly.js';

/**
 * Metric display configuration: colors and labels for each measurement type.
 */
const METRIC_CONFIG = {
  temperature: { label: 'Temperature (°F)', color: '#f44336' },
  moisture:    { label: 'Moisture (%)',      color: '#2196f3' },
  nitrogen:    { label: 'Nitrogen (ppm)',    color: '#4caf50' },
  phosphorus:  { label: 'Phosphorus (ppm)',  color: '#ff9800' },
  potassium:   { label: 'Potassium (ppm)',   color: '#9c27b0' },
};

const METRIC_KEYS = Object.keys(METRIC_CONFIG);

/**
 * AnalyticsCardComponent — Card wrapping a Plotly line chart for a single node.
 * Plots all five measurement metrics over time.
 *
 * @param {Object} props
 * @param {string} props.nodeName - Display name for the node (e.g. "Node 1")
 * @param {Array<Object>} props.measurements - Array of measurement objects for this node,
 *   each with timestamp, temperature, moisture, nitrogen, phosphorus, potassium.
 */
function AnalyticsCardComponent({ nodeName, measurements = [] }) {
  const sorted = [...measurements].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const timestamps = sorted.map((m) => m.timestamp);

  const traces = METRIC_KEYS.map((key) => ({
    x: timestamps,
    y: sorted.map((m) => m[key]),
    type: 'scatter',
    mode: 'lines+markers',
    name: METRIC_CONFIG[key].label,
    line: { color: METRIC_CONFIG[key].color, width: 2 },
    marker: { size: 4 },
  }));

  const layout = {
    title: { text: nodeName, font: { size: 14, color: '#2D2D2D' } },
    xaxis: {
      title: 'Time',
      type: 'date',
      tickformat: '%H:%M',
    },
    yaxis: { title: 'Value' },
    legend: { orientation: 'h', y: -0.25 },
    margin: { l: 50, r: 20, t: 40, b: 80 },
    autosize: true,
    height: 350,
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#2D2D2D', mb: 1 }}>
          {nodeName}
        </Typography>
        {measurements.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#616161' }}>
            No measurement data available.
          </Typography>
        ) : (
          <Plot
            data={traces}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%' }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsCardComponent;
