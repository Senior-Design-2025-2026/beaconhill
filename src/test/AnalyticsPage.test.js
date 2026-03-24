import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

jest.mock('../hooks/useFarmWeather', () => {
  return function useFarmWeather() {
    return {
      ambientValues: {
        temperatureF: 72.5,
        humidity: 55,
        rainfallIn: 0.1,
        windMph: 8.3,
        uvIndex: 5,
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
    expect(screen.getByText(/Farm — Values/)).toBeInTheDocument();
    expect(screen.getByText(/Ambient — Values/)).toBeInTheDocument();
    expect(screen.getByText(/Farm — Projections/)).toBeInTheDocument();
    expect(screen.getByText(/Ambient — Projections/)).toBeInTheDocument();
  });

  test('farm dropdown defaults to first farm and shows options', async () => {
    await navigateToAnalytics();
    expect(screen.getByText('Hubbard Park')).toBeInTheDocument();
  });

  test('displays dummy farm metric values', async () => {
    await navigateToAnalytics();
    expect(screen.getByText('72.4')).toBeInTheDocument();
    expect(screen.getByText('48.1')).toBeInTheDocument();
  });

  test('displays mocked ambient metric values', async () => {
    await navigateToAnalytics();
    expect(screen.getByText('72.5')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  test('Current / Week toggle is present', async () => {
    await navigateToAnalytics();
    expect(screen.getByRole('button', { name: /Current/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument();
  });
});
