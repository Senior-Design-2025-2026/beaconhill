import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import LinearGaugeComponent from '../../components/LinearGaugeComponent/LinearGaugeComponent';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import MapComponent from '../../components/MapComponent/MapComponent';
import AnalyticsCardComponent from '../../components/AnalyticsCardComponent/AnalyticsCardComponent';
import { useMeasurements } from '../../context/MeasurementsContext';

/** Generate plausible random values for a measurement record. */
function randomMeasurementValues() {
  return {
    temperature: +(55 + Math.random() * 20).toFixed(1),
    moisture:    +(35 + Math.random() * 20).toFixed(1),
    nitrogen:    +(25 + Math.random() * 20).toFixed(1),
    phosphorus:  +(12 + Math.random() * 15).toFixed(1),
    potassium:   +(120 + Math.random() * 60).toFixed(1),
  };
}

/**
 * TestingPage — interactive storybook-style page for testing components.
 * Each section renders a component with input controls for quick verification.
 */
function TestingPage() {
  const { farms, nodes, measurements, addMeasurements } = useMeasurements();

  const [dummyOutput, setDummyOutput] = useState(null);

  const [gaugeValue, setGaugeValue] = useState(65);
  const [gaugeLow, setGaugeLow] = useState(0);
  const [gaugeMid, setGaugeMid] = useState(50);
  const [gaugeHigh, setGaugeHigh] = useState(100);

  const [headerTitle, setHeaderTitle] = useState('Live Dashboard');
  const [headerDescription, setHeaderDescription] = useState('Real-time farm measurements');
  const [headerIconChoice, setHeaderIconChoice] = useState('dashboard');

  /* Add-measurements state */
  const [nodeChecks, setNodeChecks] = useState({ 'node-1': true, 'node-2': true, 'node-3': true });
  const [newTimestamp, setNewTimestamp] = useState('');

  const iconMap = {
    dashboard: <DashboardIcon />,
    analytics: <AnalyticsIcon />,
    settings: <SettingsIcon />,
    none: null,
  };

  const handleLoadDummyData = () => {
    setDummyOutput({ farms, nodes, measurements });
  };

  const handleAddMeasurements = () => {
    if (!newTimestamp) return;
    const isoTs = new Date(newTimestamp).toISOString();
    const newEntries = Object.entries(nodeChecks)
      .filter(([, checked]) => checked)
      .map(([nodeId]) => ({
        measurementId: `m-${nodeId.split('-')[1]}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        farmId: 'farm-1',
        nodeId,
        timestamp: isoTs,
        ...randomMeasurementValues(),
      }));
    if (newEntries.length > 0) {
      addMeasurements(newEntries);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ color: '#2D2D2D', mb: 3 }}>
        Testing Page
      </Typography>

      {/* --- Add New Measurements Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Add New Measurements
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          Select which nodes should receive a new measurement, set a timestamp, and click the button.
          The new data will appear on the Live Dashboard immediately.
        </Typography>

        <FormGroup row sx={{ mb: 2 }}>
          {nodes.map((node) => (
            <FormControlLabel
              key={node.nodeId}
              control={
                <Checkbox
                  checked={!!nodeChecks[node.nodeId]}
                  onChange={(e) =>
                    setNodeChecks((prev) => ({ ...prev, [node.nodeId]: e.target.checked }))
                  }
                  sx={{ color: '#EEBE02', '&.Mui-checked': { color: '#EEBE02' } }}
                />
              }
              label={node.nodeName}
            />
          ))}
        </FormGroup>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            label="Timestamp"
            type="datetime-local"
            size="small"
            value={newTimestamp}
            onChange={(e) => setNewTimestamp(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 240 }}
          />
          <Button
            variant="contained"
            onClick={handleAddMeasurements}
            disabled={!newTimestamp || !Object.values(nodeChecks).some(Boolean)}
            sx={{
              backgroundColor: '#EEBE02',
              color: '#2D2D2D',
              '&:hover': { backgroundColor: '#d4a900' },
            }}
          >
            Add New Measurements
          </Button>
        </Stack>
        <Typography variant="caption" sx={{ color: '#616161' }}>
          Total measurements in context: {measurements.length}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* --- Dummy Data Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Dummy Data
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          Load and inspect the current measurement data (including any added entries).
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
          Displays the nodes on an interactive map.
        </Typography>
        <MapComponent nodes={nodes} height={400} />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* --- Analytics Card Section --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#2D2D2D', mb: 1 }}>
          Analytics Card Component
        </Typography>
        <Typography variant="body2" sx={{ color: '#616161', mb: 2 }}>
          One line chart per node plotting all five metrics.
        </Typography>
        {nodes.map((node) => {
          const nodeMeasurements = measurements.filter(
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
