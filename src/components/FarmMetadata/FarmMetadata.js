import React from 'react';
import { Typography } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import SensorsIcon from '@mui/icons-material/Sensors';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreIcon from '@mui/icons-material/Explore';
import './FarmMetadata.css';

/**
 * FarmMetadata — displays key metadata about the selected farm.
 * @param {{
 *  farm: {
 *    farmName?: string,
 *    farmCropType?: string,
 *    numberOfNodes?: number,
 *    lat?: number,
 *    lon?: number,
 *    farmAddress?: string,
 *    farmCity?: string,
 *    farmState?: string,
 *    farmZipCode?: string,
 *  } | null,
 * }} props
 */
export default function FarmMetadata({ farm }) {
  if (!farm) return null;

  const fullAddress = [farm.farmAddress, farm.farmCity, farm.farmState, farm.farmZipCode]
    .filter(Boolean)
    .join(', ');

  const items = [
    { icon: <AgricultureIcon fontSize="small" />, label: 'Farm', value: farm.farmName || '—' },
    { icon: <GrassIcon fontSize="small" />, label: 'Crop', value: farm.farmCropType || '—' },
    { icon: <SensorsIcon fontSize="small" />, label: 'Nodes', value: farm.numberOfNodes ?? '—' },
    {
      icon: <ExploreIcon fontSize="small" />,
      label: 'Coordinates',
      value:
        farm.lat != null && farm.lon != null
          ? `${farm.lat.toFixed(4)}, ${farm.lon.toFixed(4)}`
          : '—',
    },
    { icon: <LocationOnIcon fontSize="small" />, label: 'Address', value: fullAddress || '—' },
  ];

  return (
    <div className="farm-metadata">
      <Typography className="farm-metadata-heading" variant="subtitle2">
        Farm Metadata
      </Typography>
      <div className="farm-metadata-grid">
        {items.map((item) => (
          <div key={item.label} className="farm-metadata-item">
            <span className="farm-metadata-icon">{item.icon}</span>
            <div className="farm-metadata-text">
              <span className="farm-metadata-label">{item.label}</span>
              <span className="farm-metadata-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
