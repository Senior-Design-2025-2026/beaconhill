import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * LinearGaugeComponent — displays a horizontal gauge bar with low, mid, and high zones.
 * A marker indicates the current value along the range.
 *
 * @param {Object} props
 * @param {string} props.label - Label displayed above the gauge (e.g. "Temperature")
 * @param {number} props.value - Current value to mark on the gauge
 * @param {number} props.low - Low threshold (start of green zone)
 * @param {number} props.mid - Mid threshold (transition from green/yellow to yellow/red)
 * @param {number} props.high - High threshold (end of range)
 * @param {string} [props.unit] - Optional unit string (e.g. "°F", "%", "ppm")
 */
function LinearGaugeComponent({ label, value, low, lowThreshold, highThreshold, high, unit = '' }) {
  const min = low;
  const max = high;
  const range = max - min || 1;

  const clampedValue = Math.max(min, Math.min(max, value));
  const markerPercent = ((clampedValue - min) / range) * 100;

  const lowThresholdPercent = ((lowThreshold - min) / range) * 100;
  const highThresholdPercent = ((highThreshold - min) / range) * 100;

  return (
    <Box sx={{ mb: 2, width: '100%' }}>
      {label && (
        <Typography variant="subtitle2" sx={{ color: '#2D2D2D', mb: 0.5 }}>
          {label + ' (' + unit + ')'}
        </Typography>
      )}
      <Box sx={{ position: 'relative', width: '100%', height: 24, borderRadius: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Low-to-lowThreshold zone (red to yellow gradient) */}
        <Box sx={{ width: `${lowThresholdPercent}%`, height: '100%', background: 'linear-gradient(to right, #f44336,  #EEBE02)' }} />
        {/* lowThreshold-to-highThreshold zone (green) */}
        <Box sx={{ width: `${highThresholdPercent - lowThresholdPercent}%`, height: '100%', background: '#4caf50' }} />
        {/* highThreshold-to-high zone (yellow to red gradient) */}
        <Box sx={{ width: `${100 - highThresholdPercent}%`, height: '100%', background: 'linear-gradient(to right, #EEBE02, #f44336)' }} />
      </Box>
      {/* Marker */}
      <Box sx={{ position: 'relative', width: '100%', height: 0 }}>
        <Box
          sx={{
            position: 'absolute',
            left: `${markerPercent}%`,
            top: -28,
            transform: 'translateX(-50%)',
            width: 3,
            height: 32,
            backgroundColor: '#2D2D2D',
            borderRadius: 1,
          }}
        />
      </Box>
      {/* Labels row */}
      <Box sx={{ position: 'relative', left: `${markerPercent}%`, transform: 'translateX(-50%)', display: 'flex', justifyContent: 'center', mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#2D2D2D', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default LinearGaugeComponent;
