import React from 'react';
import { Typography, Slider } from '@mui/material';

/**
 * AnalyticsDaySlider — labeled MUI Slider over a discrete set of items.
 *
 * @param {{
 *  items: string[],
 *  index: number,
 *  onIndexChange: (index: number) => void,
 *  title?: string,
 *  labelFormatter?: (item: string|undefined) => string,
 * }} props
 */
export default function AnalyticsDaySlider({
  items = [],
  index = 0,
  onIndexChange,
  title = 'Day',
  labelFormatter,
}) {
  const activeItem = items[index];
  const displayLabel = labelFormatter
    ? labelFormatter(activeItem)
    : activeItem || 'No dates available';

  return (
    <div className="analytics-day-slider-centered">
      <Typography className="analytics-day-slider-label" align="center">
        {title}: {displayLabel}
      </Typography>
      <Slider
        size="small"
        disabled={items.length <= 1}
        min={0}
        max={Math.max(items.length - 1, 0)}
        value={index}
        step={1}
        marks={
          items.length
            ? [
                { value: 0, label: labelFormatter ? labelFormatter(items[0]) : items[0] },
                { value: items.length - 1, label: labelFormatter ? labelFormatter(items[items.length - 1]) : items[items.length - 1] },
              ]
            : []
        }
        onChange={(_, value) => onIndexChange(Array.isArray(value) ? value[0] : value)}
        valueLabelDisplay="off"
        sx={{
          color: '#facc15',
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
          '& .MuiSlider-thumb': { width: 12, height: 12 },
          '& .MuiSlider-rail': { opacity: 0.45 },
          '& .MuiSlider-markLabel': {
            fontSize: '0.68rem',
            whiteSpace: 'nowrap',
          },
        }}
      />
    </div>
  );
}
