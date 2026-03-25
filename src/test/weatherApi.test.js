import { fetchCurrentWeather, fetchForecast, aggregateForecastWeek } from '../api/weatherApi';

const MOCK_CURRENT_RESPONSE = {
  current: {
    temp_f: 72.5,
    humidity: 55,
    precip_in: 0.1,
    wind_mph: 8.3,
    pressure_in: 30.01,
    uv: 5,
    condition: { text: 'Partly cloudy' },
  },
};

const MOCK_FORECAST_RESPONSE = {
  forecast: {
    forecastday: [
      { date: '2026-03-23', day: { maxtemp_f: 75, mintemp_f: 58, avgtemp_f: 66, avghumidity: 60, totalprecip_in: 0.0, maxwind_mph: 12, uv: 5, condition: { text: 'Sunny' } } },
      { date: '2026-03-24', day: { maxtemp_f: 70, mintemp_f: 55, avgtemp_f: 62, avghumidity: 65, totalprecip_in: 0.2, maxwind_mph: 10, uv: 4, condition: { text: 'Cloudy' } } },
      { date: '2026-03-25', day: { maxtemp_f: 68, mintemp_f: 50, avgtemp_f: 59, avghumidity: 70, totalprecip_in: 0.5, maxwind_mph: 15, uv: 3, condition: { text: 'Rain' } } },
    ],
  },
};

beforeEach(() => {
  process.env.REACT_APP_WEATHER_API_KEY = 'test-key';
});

afterEach(() => {
  delete process.env.REACT_APP_WEATHER_API_KEY;
  jest.restoreAllMocks();
});

describe('fetchCurrentWeather', () => {
  test('returns normalized current weather', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => MOCK_CURRENT_RESPONSE,
    });

    const result = await fetchCurrentWeather(41.66, -91.53);
    expect(result.temperatureF).toBe(72.5);
    expect(result.humidity).toBe(55);
    expect(result.rainfallIn).toBe(0.1);
    expect(result.windMph).toBe(8.3);
    expect(result.conditionText).toBe('Partly cloudy');
  });

  test('throws on HTTP error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 401 });
    await expect(fetchCurrentWeather(41.66, -91.53)).rejects.toThrow('Weather API error: 401');
  });

  test('throws when API key is missing', async () => {
    delete process.env.REACT_APP_WEATHER_API_KEY;
    await expect(fetchCurrentWeather(41.66, -91.53)).rejects.toThrow('REACT_APP_WEATHER_API_KEY is not set');
  });
});

describe('fetchForecast', () => {
  test('returns normalized forecast with daily array', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => MOCK_FORECAST_RESPONSE,
    });

    const result = await fetchForecast(41.66, -91.53);
    expect(result.days).toHaveLength(3);
    expect(result.days[0].date).toBe('2026-03-23');
    expect(result.days[0].avgTempF).toBe(66);
    expect(result.days[2].totalPrecipIn).toBe(0.5);
  });
});

describe('aggregateForecastWeek', () => {
  test('computes correct averages and totals', () => {
    const forecast = {
      days: [
        { avgTempF: 66, avgHumidity: 60, totalPrecipIn: 0.0, maxWindMph: 12, uvIndex: 5 },
        { avgTempF: 62, avgHumidity: 65, totalPrecipIn: 0.2, maxWindMph: 10, uvIndex: 4 },
        { avgTempF: 59, avgHumidity: 70, totalPrecipIn: 0.5, maxWindMph: 15, uvIndex: 3 },
      ],
    };
    const result = aggregateForecastWeek(forecast);
    expect(result.temperatureF).toBeCloseTo(62.3, 1);
    expect(result.humidity).toBeCloseTo(65, 1);
    expect(result.rainfallIn).toBeCloseTo(0.7, 2);
    expect(result.windMph).toBeCloseTo(12.3, 1);
    expect(result.uvIndex).toBeCloseTo(4, 1);
  });

  test('returns null for empty forecast', () => {
    expect(aggregateForecastWeek({ days: [] })).toBeNull();
  });
});
