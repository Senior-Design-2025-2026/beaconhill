import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * AnalyticsFarmSelect — MUI Select dropdown for choosing a farm.
 *
 * @param {{
 *  farms: Array<{ farmId: string, farmName: string }>,
 *  value: string,
 *  onChange: (value: string) => void,
 *  label?: string,
 *  size?: 'small'|'medium',
 * }} props
 */
export default function AnalyticsFarmSelect({
  farms = [],
  value,
  onChange,
  label = 'Farm',
  size = 'small',
}) {
  return (
    <div className="analytics-day-toprow-farm">
      <FormControl size={size} fullWidth sx={{ minWidth: 0 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          label={label}
          value={value}
          fullWidth
          onChange={(e) => onChange(e.target.value)}
        >
          {farms.map((farm) => (
            <MenuItem key={farm.farmId} value={farm.farmId}>
              {farm.farmName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
