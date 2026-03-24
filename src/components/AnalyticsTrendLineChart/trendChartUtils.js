/**
 * Pure math/data helpers shared by AnalyticsTrendLineChart and AnalyticsMetricTrendCard.
 */

const BULLET_COLORS = {
  excellent: '#4caf50',
  good: '#8bc34a',
  fair: '#ff9800',
  poor: '#f44336',
  na: '#bdbdbd',
};

export function classifyValue(value, threshold) {
  if (value == null || !threshold) return 'na';
  for (const key of ['excellent', 'good', 'fair']) {
    const band = threshold[key];
    if (band && value >= band.min && value <= band.max) return key;
  }
  return 'poor';
}

export function getBulletColor(classification) {
  return BULLET_COLORS[classification] || BULLET_COLORS.na;
}

export function average(values) {
  if (!values?.length) return null;
  const valid = values.filter((v) => v != null);
  if (!valid.length) return null;
  return +(valid.reduce((sum, val) => sum + val, 0) / valid.length).toFixed(1);
}

export function buildPoints(values, width, height, padding) {
  const valid = values.filter((v) => v != null);
  if (!valid.length) return { points: '', yScale: null };
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const xStep = values.length > 1 ? chartW / (values.length - 1) : chartW;
  const yScale = (value) => {
    if (max === min) return padding + chartH / 2;
    return padding + ((max - value) / (max - min)) * chartH;
  };
  const points = values
    .map((value, idx) => {
      if (value == null) return null;
      return `${padding + idx * xStep},${yScale(value)}`;
    })
    .filter(Boolean)
    .join(' ');
  return { points, yScale };
}

export function getThresholdGuides(threshold) {
  const ex = threshold?.excellent;
  const good = threshold?.good;
  const fair = threshold?.fair;
  if (!ex || !good || !fair) return [];
  const midpoint = (band) => (band.min + band.max) / 2;
  const span = Math.max(ex.max - ex.min, good.max - good.min, fair.max - fair.min, 0.1);
  return [
    { key: 'poor-low', label: 'Poor', value: fair.min - span * 0.5, state: 'poor' },
    { key: 'fair-mid', label: 'Fair', value: midpoint(fair), state: 'fair' },
    { key: 'good-mid', label: 'Good', value: midpoint(good), state: 'good' },
    { key: 'excellent-mid', label: 'Excellent', value: midpoint(ex), state: 'excellent' },
    { key: 'poor-high', label: 'Poor', value: ex.max + span * 0.5, state: 'poor' },
  ];
}

export function createYScale(values, minY, maxY, height, padding) {
  const valid = values.filter((v) => v != null);
  const dataMin = valid.length ? Math.min(...valid) : minY;
  const dataMax = valid.length ? Math.max(...valid) : maxY;
  const low = Math.min(dataMin, minY);
  const high = Math.max(dataMax, maxY);
  const chartH = height - padding * 2;
  const yScale = (value) => {
    if (high === low) return padding + chartH / 2;
    return padding + ((high - value) / (high - low)) * chartH;
  };
  return { yScale, low, high };
}
