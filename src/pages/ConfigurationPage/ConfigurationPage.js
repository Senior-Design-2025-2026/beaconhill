import React from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import ConfigurationTableSection from './ConfigurationTableSection';
import { useMeasurements } from '../../context/MeasurementsContext';

const FARM_COLUMNS = [
  { key: 'farmId',        label: 'Farm ID' },
  { key: 'farmName',      label: 'Name' },
  { key: 'farmOwner',     label: 'Owner' },
  { key: 'farmAddress',   label: 'Address' },
  { key: 'farmCity',      label: 'City' },
  { key: 'farmState',     label: 'State' },
  { key: 'farmZipCode',   label: 'Zip Code' },
  { key: 'farmCropType',  label: 'Crop Type' },
  { key: 'farmNumber',    label: 'Farm Number' },
  { key: 'lat',           label: 'Latitude' },
  { key: 'lon',           label: 'Longitude' },
  { key: 'numberOfNodes', label: 'Nodes' },
];

const NODE_COLUMNS = [
  { key: 'nodeId',   label: 'Node ID' },
  { key: 'nodeName', label: 'Name' },
  { key: 'farmId',   label: 'Farm ID' },
  { key: 'lat',      label: 'Latitude' },
  { key: 'lon',      label: 'Longitude' },
];

const MEASUREMENT_COLUMNS = [
  { key: 'measurementId', label: 'Measurement ID' },
  { key: 'farmId',        label: 'Farm ID' },
  { key: 'nodeId',        label: 'Node ID' },
  { key: 'timestamp',     label: 'Timestamp' },
  { key: 'temperature',   label: 'Temperature' },
  { key: 'moisture',      label: 'Moisture' },
  { key: 'nitrogen',      label: 'Nitrogen' },
  { key: 'phosphorus',    label: 'Phosphorus' },
  { key: 'potassium',     label: 'Potassium' },
];

function ConfigurationPage() {
  const { farms, nodes, measurements, loading, error } = useMeasurements();

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <HeaderComponent
        title="Database"
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <ConfigurationTableSection title="Farms" columns={FARM_COLUMNS} rows={farms} />
      <ConfigurationTableSection title="Nodes" columns={NODE_COLUMNS} rows={nodes} />
      <ConfigurationTableSection title="Measurements" columns={MEASUREMENT_COLUMNS} rows={measurements} />
    </Box>
  );
}

export default ConfigurationPage;
