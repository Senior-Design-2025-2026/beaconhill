import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentWeather, fetchForecast, aggregateForecastWeek } from '../api/weatherApi';

/**
 * Fetches current + forecast weather for the given coordinates and
 * derives ambient values depending on mode ("current" | "week").
 *
 * @param {number|null} lat
 * @param {number|null} lon
 * @param {'current'|'week'} mode
 * @returns {{ ambientValues: Object|null, forecast: Object|null, loading: boolean, error: string|null }}
 */
export default function useFarmWeather(lat, lon, mode) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (lat == null || lon == null) return;
    setLoading(true);
    setError(null);
    try {
      const [cur, fc] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
      ]);
      setCurrentWeather(cur);
      setForecast(fc);
    } catch (err) {
      console.error('Weather fetch failed:', err);
      setError(err.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => { load(); }, [load]);

  let ambientValues = null;
  if (mode === 'week' && forecast) {
    ambientValues = aggregateForecastWeek(forecast);
  } else if (currentWeather) {
    ambientValues = currentWeather;
  }

  return { ambientValues, forecast, loading, error };
}
