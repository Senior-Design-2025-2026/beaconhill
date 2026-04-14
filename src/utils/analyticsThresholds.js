import thresholds from '../data/thresholds.json';

function normalizeCropType(cropType) {
  const raw = String(cropType || '').trim().toLowerCase();
  if (raw.startsWith('soy')) return 'soybean';
  if (raw.startsWith('corn')) return 'corn';
  return 'corn';
}

export function getThreshold(metricKey, cropType, source) {
  const cropKey = normalizeCropType(cropType);
  return thresholds?.[cropKey]?.[source]?.[metricKey] || null;
}

/**
 * Returns visual indicator metadata for a metric value.
 * @param {number|null|undefined} value
 * @param {{
 *  excellent?: {min:number,max:number},
 *  good?: {min:number,max:number},
 *  fair?: {min:number,max:number}
 * }|null} ranges
 * @returns {{state: 'excellent'|'good'|'fair'|'poor'|'na', label: string}}
 */
export function getMetricIndicator(value, ranges) {
  if (value == null || !ranges) return { state: 'na', label: 'N/A' };

  const order = ['excellent', 'good', 'fair'];
  for (const key of order) {
    const band = ranges[key];
    if (band && value >= band.min && value <= band.max) {
      const label = thresholds?.classifications?.[key]?.label || key;
      return { state: key, label };
    }
  }

  return {
    state: 'poor',
    label: thresholds?.classifications?.poor?.label || 'Poor',
  };
}
