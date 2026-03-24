import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

jest.mock('../hooks/useFarmWeather', () => {
  return function useFarmWeather() {
    const hourly = Array.from({ length: 24 }, (_, idx) => ({
      x: `${String(idx).padStart(2, '0')}:00`,
      y: idx < 12 ? 72.5 : 72.5,
    }));
    return {
      ambientValues: {
        temperatureF: 72.5,
        humidity: 55,
        rainfallIn: 0.1,
        windMph: 8.3,
        uvIndex: 5,
      },
      ambientTrend: {
        temperatureF: hourly,
        humidity: hourly.map((p) => ({ ...p, y: 55 })),
        rainfallIn: hourly.map((p) => ({ ...p, y: 0.1 })),
        windMph: hourly.map((p) => ({ ...p, y: 8.3 })),
        uvIndex: hourly.map((p) => ({ ...p, y: 5 })),
      },
      forecast: {
        days: [
          { date: '2026-03-23', avgTempF: 66, avgHumidity: 60, totalPrecipIn: 0.0, maxWindMph: 12, uvIndex: 5 },
          { date: '2026-03-24', avgTempF: 62, avgHumidity: 65, totalPrecipIn: 0.2, maxWindMph: 10, uvIndex: 4 },
        ],
      },
      loading: false,
      error: null,
    };
  };
});

const MOCK_WEATHER_RESPONSE = {
  current: {
    temperature_2m: 18.5,
    relative_humidity_2m: 65,
    precipitation: 0.2,
    evapotranspiration: 0.8,
    vapour_pressure_deficit: 1.2,
    soil_temperature_0cm: 16.3,
    soil_moisture_0_to_1cm: 0.32,
  },
};

const MOCK_AIR_QUALITY_RESPONSE = {
  current: {
    ammonia: 5.2,
    nitrogen_dioxide: 12.1,
  },
};

const MOCK_ELEVATION_RESPONSE = {
  elevation: [220],
};

async function navigateToAnalytics() {
  render(<App />);
  await act(async () => {
    await userEvent.click(screen.getByRole('link', { name: /Analytics/i }));
  });
}

describe('AnalyticsPage', () => {
  test('renders the Analytics heading', async () => {
    await navigateToAnalytics();
    expect(screen.getByRole('heading', { name: /Analytics/i })).toBeInTheDocument();
  });

  test('shows Farm and Ambient section titles', async () => {
    await navigateToAnalytics();
    expect(screen.getByRole('heading', { name: /^Farm$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ambient/i })).toBeInTheDocument();
    expect(screen.getByText('via Open Meteo')).toBeInTheDocument();
  });

  test('farm dropdown defaults to first farm and shows options', async () => {
    await navigateToAnalytics();
    expect(screen.getByText('Hubbard Park')).toBeInTheDocument();
  });

  test('displays farm metric cards', async () => {
    await navigateToAnalytics();
    expect(screen.getAllByText('Temperature').length).toBeGreaterThan(0);
    expect(screen.getByText('Moisture')).toBeInTheDocument();
    expect(screen.getByText('Nitrogen')).toBeInTheDocument();
  });

  test('displays mocked ambient metric values', async () => {
    await navigateToAnalytics();
    expect(screen.getByText('72.5')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  test('Day / Week / Forecast toggle is present', async () => {
    await navigateToAnalytics();
    expect(screen.getByRole('button', { name: /Day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Forecast/i })).toBeInTheDocument();
  });

  test('Forecast tab shows placeholder content', async () => {
    await navigateToAnalytics();

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Forecast/i }));
    });

    expect(screen.getByRole('heading', { name: /Forecast/i })).toBeInTheDocument();
    expect(screen.getByText('Forecast content coming soon.')).toBeInTheDocument();
  });
});
