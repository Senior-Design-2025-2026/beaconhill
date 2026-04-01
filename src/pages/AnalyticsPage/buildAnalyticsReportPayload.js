import { FARM_METRICS, AMBIENT_METRICS } from '../../data/analyticsDummyFarm';

/**
 * Compute the ISO date of the Sunday ending the week that starts on mondayISO.
 * @param {string} mondayISO - e.g. "2026-03-23"
 * @returns {string}
 */
function weekSunday(mondayISO) {
  const d = new Date(mondayISO + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Build the JSON payload for the /analyticsReport API from current Analytics
 * view state. Works for both day and week modes.
 *
 * @param {{
 *   viewMode: 'day'|'week',
 *   selectedFarm: object|null,
 *   selectedDate: string|null,
 *   nodes: Array,
 *   farmTrend: Object,
 *   nodeTrends: Object,
 *   ambientTrend: Object|null,
 * }} params
 * @returns {Object} POST body for /analyticsReport
 */
export default function buildAnalyticsReportPayload({
  viewMode,
  selectedFarm,
  selectedDate,
  nodes,
  farmTrend,
  nodeTrends,
  ambientTrend,
}) {
  const farmId = selectedFarm?.farmId ?? '';

  const farmNodes = (nodes || [])
    .filter((n) => String(n.farmId) === String(farmId))
    .map((n) => ({ nodeId: n.nodeId, nodeName: n.nodeName || `Node ${n.nodeId}` }));

  const location = [
    selectedFarm?.farmAddress,
    selectedFarm?.farmCity,
    selectedFarm?.farmState,
    selectedFarm?.farmZipCode,
  ].filter(Boolean).join(', ') || 'Unknown';

  let reportingPeriod = selectedDate || 'Unknown';
  if (viewMode === 'week' && selectedDate) {
    reportingPeriod = `${selectedDate} to ${weekSunday(selectedDate)}`;
  }

  const farmMetrics = {};
  for (const m of FARM_METRICS) {
    farmMetrics[m.key] = {
      label: m.label,
      unit: m.unit,
      trend: farmTrend?.[m.key] || [],
      nodeTrends: nodeTrends?.[m.key] || [],
    };
  }

  const ambientMetrics = {};
  for (const m of AMBIENT_METRICS) {
    ambientMetrics[m.key] = {
      label: m.label,
      unit: m.unit,
      trend: ambientTrend?.[m.key] || [],
    };
  }

  return {
    viewMode,
    reportingPeriod,
    farm: {
      id: farmId,
      name: selectedFarm?.farmName || 'Unknown',
      cropType: selectedFarm?.farmCropType || 'Unknown',
      lat: selectedFarm?.lat ?? null,
      lon: selectedFarm?.lon ?? null,
      location,
      numberOfNodes: selectedFarm?.numberOfNodes ?? farmNodes.length,
    },
    nodes: farmNodes,
    farmMetrics,
    ambientMetrics,
  };
}
