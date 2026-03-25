import React from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import ConfigurationTableSection from './ConfigurationTableSection';
import { useMeasurements } from '../../context/MeasurementsContext';

const FARM_COLUMNS = [
  { key: 'farmId',       label: 'Farm ID',        editable: false },
  { key: 'farmName',     label: 'Name' },
  { key: 'farmOwner',    label: 'Owner' },
  { key: 'farmAddress',  label: 'Address' },
  { key: 'farmCity',     label: 'City' },
  { key: 'farmState',    label: 'State' },
  { key: 'farmZipCode',  label: 'Zip Code' },
  { key: 'farmCropType', label: 'Crop Type' },
  { key: 'farmNumber',   label: 'Farm Number' },
  { key: 'lat',          label: 'Latitude',  type: 'number' },
  { key: 'lon',          label: 'Longitude', type: 'number' },
  { key: 'numberOfNodes', label: 'Nodes',    editable: false },
];

const NODE_COLUMNS = [
  { key: 'nodeId',   label: 'Node ID',  editable: false },
  { key: 'nodeName', label: 'Name' },
  { key: 'farmId',   label: 'Farm ID' },
  { key: 'lat',      label: 'Latitude',  type: 'number' },
  { key: 'lon',      label: 'Longitude', type: 'number' },
];

function nextId(rows, key) {
  const maxId = rows.reduce((max, r) => {
    const n = parseInt(r[key], 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return String(maxId + 1);
}

function ConfigurationPage() {
  const {
    farms, nodes, loading, error,
    addFarm, updateFarm, deleteFarm,
    addNode, updateNode, deleteNode,
  } = useMeasurements();

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <HeaderComponent
        title="Configuration"
        description="Manage farm and node settings"
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <ConfigurationTableSection
        title="Farms"
        columns={FARM_COLUMNS}
        rows={farms}
        idKey="farmId"
        onAdd={addFarm}
        onUpdate={updateFarm}
        onDelete={deleteFarm}
        createEmptyRow={(rows) => ({
          farmId: nextId(rows, 'farmId'),
          farmName: '',
          farmOwner: '',
          farmAddress: '',
          farmCity: '',
          farmState: '',
          farmZipCode: '',
          farmCropType: '',
          farmNumber: '',
          lat: 0,
          lon: 0,
          numberOfNodes: 0,
        })}
      />

      <ConfigurationTableSection
        title="Nodes"
        columns={NODE_COLUMNS}
        rows={nodes}
        idKey="nodeId"
        onAdd={addNode}
        onUpdate={updateNode}
        onDelete={deleteNode}
        createEmptyRow={(rows) => ({
          nodeId: nextId(rows, 'nodeId'),
          nodeName: '',
          farmId: '',
          lat: 0,
          lon: 0,
        })}
      />
    </Box>
  );
}

export default ConfigurationPage;
