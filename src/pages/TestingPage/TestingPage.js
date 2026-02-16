import React, { useState } from 'react';
import { Box, Typography, Button, Divider, TextField, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import dummyData from '../../data/dummy_measurements.json';
import LinearGaugeComponent from '../../components/LinearGaugeComponent/LinearGaugeComponent';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import MapComponent from '../../components/MapComponent/MapComponent';
import AnalyticsCardComponent from '../../components/AnalyticsCardComponent/AnalyticsCardComponent';

/**
 * TestingPage — interactive storybook-style page for testing components.
 * Each section renders a component with input controls for quick verification.
 */
function TestingPage() {
  const [dummyOutput, setDummyOutput] = useState(null);

  const [gaugeValue, setGaugeValue] = useState(65);
  const [gaugeLow, setGaugeLow] = useState(0);
  const [gaugeMid, setGaugeMid] = useState(50);
  const [gaugeHigh, setGaugeHigh] = useState(100);

  const [headerTitle, setHeaderTitle] = useState('Live Dashboard');
  const [headerDescription, setHeaderDescription] = useState('Real-time farm measurements');
  const [headerIconChoice, setHeaderIconChoice] = useState('dashboard');

  const iconMap = {
    dashboard: <DashboardIcon />,
    analytics: <AnalyticsIcon />,
    settings: <SettingsIcon />,
    none: null,
  };

  const handleLoadDummyData = () => {
    setDummyOutput(dummyData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ color: '#2D2D2D', mb: 3 }}>
        Testing Page
      </Typography>

      {/* --- Dummy Data Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Dummy Data
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          Load and inspect the dummy_measurements.json data for all nodes.
        </Typography>
        <Button variant="contained" onClick={handleLoadDummyData} sx={{ backgroundColor: '#EEBE02', color: '#2D2D2D', '&:hover': { backgroundColor: '#d4a900' } }}>
          Load Dummy Data
        </Button>
        {dummyOutput && (
          <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Farms: {dummyOutput.farms.length} | Nodes: {dummyOutput.nodes.length} | Measurements: {dummyOutput.measurements.length}
            </Typography>
            {dummyOutput.nodes.map((node) => {
              const nodeMeasurements = dummyOutput.measurements.filter((m) => m.nodeId === node.nodeId);
              return (
                <Box key={node.nodeId} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    {node.nodeName} ({node.nodeId}) — {nodeMeasurements.length} measurements
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* --- Linear Gauge Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Linear Gauge Component
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          Adjust the value, low, mid, and high range to test the gauge display.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Value"
            type="number"
            size="small"
            value={gaugeValue}
            onChange={(e) => setGaugeValue(Number(e.target.value))}
          />
          <TextField
            label="Low"
            type="number"
            size="small"
            value={gaugeLow}
            onChange={(e) => setGaugeLow(Number(e.target.value))}
          />
          <TextField
            label="Mid"
            type="number"
            size="small"
            value={gaugeMid}
            onChange={(e) => setGaugeMid(Number(e.target.value))}
          />
          <TextField
            label="High"
            type="number"
            size="small"
            value={gaugeHigh}
            onChange={(e) => setGaugeHigh(Number(e.target.value))}
          />
        </Stack>
        <Box sx={{ maxWidth: 500 }}>
          <LinearGaugeComponent
            label="Test Gauge"
            value={gaugeValue}
            low={gaugeLow}
            mid={gaugeMid}
            high={gaugeHigh}
            unit=""
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* --- Header Component Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Header Component
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          Set the title, description, and icon to preview the header.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
          <TextField
            label="Title"
            size="small"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />
          <TextField
            label="Description (optional)"
            size="small"
            value={headerDescription}
            onChange={(e) => setHeaderDescription(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Icon</InputLabel>
            <Select
              label="Icon"
              value={headerIconChoice}
              onChange={(e) => setHeaderIconChoice(e.target.value)}
            >
              <MenuItem value="dashboard">Dashboard</MenuItem>
              <MenuItem value="analytics">Analytics</MenuItem>
              <MenuItem value="settings">Settings</MenuItem>
              <MenuItem value="none">None</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <HeaderComponent
            title={headerTitle}
            description={headerDescription || undefined}
            icon={iconMap[headerIconChoice]}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* --- Map Component Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Map Component
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          Displays the three dummy nodes from dummy_measurements.json on an interactive map.
        </Typography>
        <MapComponent nodes={dummyData.nodes} height={400} />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* --- Analytics Card Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Analytics Card Component
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          One line chart per node plotting all five metrics from dummy_measurements.json.
        </Typography>
        {dummyData.nodes.map((node) => {
          const nodeMeasurements = dummyData.measurements.filter(
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
      </Box>

      <Divider sx={{ mb: 4 }} />
    </Box>
  );
}

export default TestingPage;
