import buildAnalyticsReportPayload from '../pages/AnalyticsPage/buildAnalyticsReportPayload';

const MOCK_FARM = {
  farmId: 'farm-001',
  farmName: 'Hubbard Park',
  farmCropType: 'corn',
  lat: 41.6611,
  lon: -91.5302,
  numberOfNodes: 3,
  farmAddress: '100 Iowa Ave',
  farmCity: 'Iowa City',
  farmState: 'IA',
  farmZipCode: '52240',
};

const MOCK_NODES = [
  { nodeId: 'n1', nodeName: 'Node A', farmId: 'farm-001' },
  { nodeId: 'n2', nodeName: 'Node B', farmId: 'farm-001' },
  { nodeId: 'n3', nodeName: 'Node C', farmId: 'farm-002' },
];

const MOCK_FARM_TREND = {
  temperature: [{ x: '00:00', y: 70 }, { x: '01:00', y: 71 }],
  moisture: [{ x: '00:00', y: 50 }],
  nitrogen: [],
  phosphorus: [],
  potassium: [],
};

const MOCK_AMBIENT_TREND = {
  temperatureF: [{ x: '00:00', y: 72.5 }],
  humidity: [{ x: '00:00', y: 55 }],
  rainfallIn: [{ x: '00:00', y: 0.1 }],
  nitrogenDioxide: [{ x: '00:00', y: 8.5 }],
  airQuality: [{ x: '00:00', y: 34 }],
};

describe('buildAnalyticsReportPayload', () => {
  test('builds correct day payload with all fields', () => {
    const payload = buildAnalyticsReportPayload({
      viewMode: 'day',
      selectedFarm: MOCK_FARM,
      selectedDate: '2026-03-26',
      nodes: MOCK_NODES,
      farmTrend: MOCK_FARM_TREND,
      nodeTrends: {},
      ambientTrend: MOCK_AMBIENT_TREND,
    });

    expect(payload.viewMode).toBe('day');
    expect(payload.reportingPeriod).toBe('2026-03-26');
    expect(payload.farm.id).toBe('farm-001');
    expect(payload.farm.name).toBe('Hubbard Park');
    expect(payload.farm.cropType).toBe('corn');
    expect(payload.farm.lat).toBe(41.6611);
    expect(payload.farm.location).toContain('Iowa City');
    expect(payload.nodes).toHaveLength(2);
    expect(payload.nodes[0].nodeName).toBe('Node A');
    expect(payload.farmMetrics.temperature.trend).toEqual(MOCK_FARM_TREND.temperature);
    expect(payload.ambientMetrics.temperatureF.trend).toEqual(MOCK_AMBIENT_TREND.temperatureF);
  });

  test('builds correct week payload with reporting period range', () => {
    const payload = buildAnalyticsReportPayload({
      viewMode: 'week',
      selectedFarm: MOCK_FARM,
      selectedDate: '2026-03-23',
      nodes: MOCK_NODES,
      farmTrend: MOCK_FARM_TREND,
      nodeTrends: {},
      ambientTrend: null,
    });

    expect(payload.viewMode).toBe('week');
    expect(payload.reportingPeriod).toBe('2026-03-23 to 2026-03-29');
  });

  test('handles missing farm gracefully', () => {
    const payload = buildAnalyticsReportPayload({
      viewMode: 'day',
      selectedFarm: null,
      selectedDate: null,
      nodes: [],
      farmTrend: {},
      nodeTrends: {},
      ambientTrend: null,
    });

    expect(payload.farm.id).toBe('');
    expect(payload.farm.name).toBe('Unknown');
    expect(payload.nodes).toHaveLength(0);
    expect(payload.reportingPeriod).toBe('Unknown');
  });

  test('filters nodes to selected farm only', () => {
    const payload = buildAnalyticsReportPayload({
      viewMode: 'day',
      selectedFarm: MOCK_FARM,
      selectedDate: '2026-03-26',
      nodes: MOCK_NODES,
      farmTrend: {},
      nodeTrends: {},
      ambientTrend: null,
    });

    expect(payload.nodes).toHaveLength(2);
    expect(payload.nodes.every((n) => n.nodeId !== 'n3')).toBe(true);
  });

  test('includes all FARM_METRICS and AMBIENT_METRICS keys', () => {
    const payload = buildAnalyticsReportPayload({
      viewMode: 'day',
      selectedFarm: MOCK_FARM,
      selectedDate: '2026-03-26',
      nodes: [],
      farmTrend: MOCK_FARM_TREND,
      nodeTrends: {},
      ambientTrend: MOCK_AMBIENT_TREND,
    });

    expect(Object.keys(payload.farmMetrics)).toEqual(
      expect.arrayContaining(['temperature', 'moisture', 'nitrogen', 'phosphorus', 'potassium']),
    );
    expect(Object.keys(payload.ambientMetrics)).toEqual(
      expect.arrayContaining(['temperatureF', 'humidity', 'rainfallIn', 'nitrogenDioxide', 'airQuality']),
    );
  });
});
