import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const DEFAULT_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
];

/**
 * AnalyticsModeTabs — toggle button group for switching analytics time range.
 *
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  options?: Array<{ value: string, label: string }>,
 * }} props
 */
export default function AnalyticsModeTabs({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}) {
  return (
    <div className="analytics-day-toprow-tabs">
      <ToggleButtonGroup
        fullWidth
        value={value}
        exclusive
        onChange={(_, v) => { if (v) onChange(v); }}
        size="small"
        sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}
