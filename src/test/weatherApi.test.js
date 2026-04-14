import { fetchCurrentWeather, fetchForecast, aggregateForecastWeek } from '../api/weatherApi';

const MOCK_WEATHER_CURRENT = {
  current: {
    temperature_2m: 22.5,
    relative_humidity_2m: 55,
    precipitation: 2.54,
  },
};

const MOCK_AQ_CURRENT = {
  current: {
    us_aqi: 34,
    nitrogen_dioxide: 8.5,
  },
};

const MOCK_WEATHER_FORECAST = {
  daily: {
    time: ['2026-03-23', '2026-03-24', '2026-03-25'],
    temperature_2m_max: [24, 21, 20],
    temperature_2m_min: [14, 13, 10],
    temperature_2m_mean: [19, 17, 15],
    relative_humidity_2m_mean: [60, 65, 70],
    precipitation_sum: [0, 5.08, 12.7],
  },
};

const MOCK_AQ_FORECAST = {
  hourly: {
    time: [
      '2026-03-23T00:00', '2026-03-23T12:00',
      '2026-03-24T00:00', '2026-03-24T12:00',
      '2026-03-25T00:00', '2026-03-25T12:00',
    ],
    us_aqi: [30, 40, 50, 60, 20, 30],
    nitrogen_dioxide: [6.0, 10.0, 12.0, 14.0, 4.0, 8.0],
  },
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('fetchCurrentWeather', () => {
  test('returns normalized current weather with air quality and NO2', async () => {
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_WEATHER_CURRENT })
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_AQ_CURRENT });

    const result = await fetchCurrentWeather(41.66, -91.53);
    expect(result.temperatureF).toBeCloseTo(72.5, 1);
    expect(result.humidity).toBe(55);
    expect(result.rainfallIn).toBeCloseTo(0.1, 1);
    expect(result.nitrogenDioxide).toBe(8.5);
    expect(result.airQuality).toBe(34);
  });

  test('throws on HTTP error from weather API', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchCurrentWeather(41.66, -91.53)).rejects.toThrow('Open-Meteo API error: 500');
  });

  test('returns null AQ fields when AQ API fails', async () => {
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_WEATHER_CURRENT })
      .mockRejectedValue(new Error('network'));

    const result = await fetchCurrentWeather(41.66, -91.53);
    expect(result.temperatureF).toBeCloseTo(72.5, 1);
    expect(result.nitrogenDioxide).toBeNull();
    expect(result.airQuality).toBeNull();
  });
});

describe('fetchForecast', () => {
  test('returns normalized forecast with daily air quality and NO2', async () => {
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_WEATHER_FORECAST })
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_AQ_FORECAST });

    const result = await fetchForecast(41.66, -91.53);
    expect(result.days).toHaveLength(3);
    expect(result.days[0].date).toBe('2026-03-23');
    expect(result.days[0].airQuality).toBeCloseTo(35, 0);
    expect(result.days[0].nitrogenDioxide).toBeCloseTo(8, 0);
    expect(result.days[1].airQuality).toBeCloseTo(55, 0);
    expect(result.days[1].nitrogenDioxide).toBeCloseTo(13, 0);
  });
});

describe('aggregateForecastWeek', () => {
  test('computes correct averages and totals', () => {
    const forecast = {
      days: [
        { avgTempF: 66, avgHumidity: 60, totalPrecipIn: 0.0, nitrogenDioxide: 6, airQuality: 30 },
        { avgTempF: 62, avgHumidity: 65, totalPrecipIn: 0.2, nitrogenDioxide: 10, airQuality: 40 },
        { avgTempF: 59, avgHumidity: 70, totalPrecipIn: 0.5, nitrogenDioxide: 14, airQuality: 50 },
      ],
    };
    const result = aggregateForecastWeek(forecast);
    expect(result.temperatureF).toBeCloseTo(62.3, 1);
    expect(result.humidity).toBeCloseTo(65, 1);
    expect(result.rainfallIn).toBeCloseTo(0.7, 2);
    expect(result.nitrogenDioxide).toBe(10);
    expect(result.airQuality).toBe(40);
  });

  test('returns null for empty forecast', () => {
    expect(aggregateForecastWeek({ days: [] })).toBeNull();
  });
});
