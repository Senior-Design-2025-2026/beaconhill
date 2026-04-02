import React from 'react';
import { Typography, Box } from '@mui/material';
import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { useMeasurements } from '../../context/MeasurementsContext';

function ConfigurationPage() {
  const { farms, nodes, measurements } = useMeasurements();

  const farmColumns = useMemo(
    () => [
      {
        accessorKey: 'farmName',
        header: 'Farm Name',
        size: 150,
      },
      {
        accessorKey: 'farmId',
        header: 'Farm ID',
        size: 150,
      },
      {
        accessorKey: 'farmCity',
        header: 'City',
        size: 150,
      },
      {
        accessorKey: 'farmState',
        header: 'State',
        size: 150,
      },
      {
        accessorKey: 'lat',
        header: 'Latitude',
        size: 150,
      },
      {
        accessorKey: 'lon',
        header: 'Longitude',
        size: 150,
      },
    ],
    [],
  );

  const farmTable = useMaterialReactTable({
    columns: farmColumns,
    data: farms,
    renderTopToolbarCustomActions: () => (
      <Typography variant="h5" component="h2" sx={{ position: 'absolute', left: '50%' }}>
        Farms
      </Typography>
    ),
  });

  const nodeColumns = useMemo(
    () => [
      {
        accessorKey: 'nodeName',
        header: 'Node Name',
        size: 150,
      },
      {
        accessorKey: 'farmId',
        header: 'Farm ID',
        size: 150,
      },
      {
        accessorKey: 'lat',
        header: 'Latitude',
        size: 150,
      },
      {
        accessorKey: 'lon',
        header: 'Longitude',
        size: 150,
      },
    ],
    [],
  );

  const nodeTable = useMaterialReactTable({
    columns: nodeColumns,
    data: nodes,
    renderTopToolbarCustomActions: () => (
      <Typography variant="h5" component="h2" sx={{ position: 'absolute', left: '50%' }}>
        Nodes
      </Typography>
    ),
  });

  return (
    <div>
      <Typography variant='h1' fontSize='50px' align='center'>
        Configuration
      </Typography>
      <Box
        sx={{
          width: '100%',
          height: '50%',
          margin: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-light)',
        }}
      >
        <MaterialReactTable table={farmTable} />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '50%',
          margin: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-light)',
        }}
      >
        <MaterialReactTable table={nodeTable} />
      </Box>
    </div>
  );
}

export default ConfigurationPage;
