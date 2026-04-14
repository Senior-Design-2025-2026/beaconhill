import { useState, useEffect, useCallback } from 'react';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchPastWeekWeather,
  aggregateForecastWeek,
  fetchDayHourlyWeather,
  aggregateDayHourly,
} from '../api/weatherApi';

/**
 * Fetches current + forecast weather for the given coordinates and
 * derives ambient values depending on mode ("current" | "day" | "week").
 *
 * @param {number|null} lat
 * @param {number|null} lon
 * @param {'current'|'day'|'week'} mode
 * @param {string|null} dateISO
 * @returns {{
 *  ambientValues: Object|null,
 *  ambientTrend: Object|null,
 *  forecast: Object|null,
 *  loading: boolean,
 *  error: string|null
 * }}
 */
export default function useFarmWeather(lat, lon, mode, dateISO = null) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [pastWeek, setPastWeek] = useState(null);
  const [dayHourly, setDayHourly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (lat == null || lon == null) return;
    setLoading(true);
    setError(null);
    try {
      const promises = [
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
        fetchPastWeekWeather(lat, lon),
      ];
      if (dateISO) {
        promises.push(fetchDayHourlyWeather(lat, lon, dateISO));
      }

      const results = await Promise.allSettled(promises);
      const errors = results.filter((r) => r.status === 'rejected');

      if (results[0].status === 'fulfilled') setCurrentWeather(results[0].value);
      if (results[1].status === 'fulfilled') setForecast(results[1].value);
      if (results[2].status === 'fulfilled') setPastWeek(results[2].value);
      if (dateISO && results[3]?.status === 'fulfilled') {
        setDayHourly(results[3].value);
      } else {
        setDayHourly(null);
      }

      if (errors.length === results.length) {
        throw errors[0].reason;
      } else if (errors.length > 0) {
        console.warn('Some weather fetches failed:', errors.map((e) => e.reason?.message));
      }
    } catch (err) {
      console.error('Weather fetch failed:', err);
      setError(err.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, [lat, lon, dateISO]);

  useEffect(() => { load(); }, [load]);

  let ambientValues = null;
  let ambientTrend = null;
  if (mode === 'day' && dayHourly?.hours?.length) {
    ambientValues = aggregateDayHourly(dayHourly);
    ambientTrend = {
      temperatureF: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.temperatureF })),
      humidity: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.humidity })),
      rainfallIn: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.rainfallIn })),
      nitrogenDioxide: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.nitrogenDioxide })),
      airQuality: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.airQuality })),
    };
  } else if (mode === 'week' && (pastWeek || forecast)) {
    ambientValues = aggregateForecastWeek(pastWeek || forecast);
    if (pastWeek?.days?.length) {
      ambientTrend = {
        temperatureF: pastWeek.days.map((d) => ({ x: d.date, y: d.avgTempF })),
        humidity: pastWeek.days.map((d) => ({ x: d.date, y: d.avgHumidity })),
        rainfallIn: pastWeek.days.map((d) => ({ x: d.date, y: d.totalPrecipIn })),
        nitrogenDioxide: pastWeek.days.map((d) => ({ x: d.date, y: d.nitrogenDioxide })),
        airQuality: pastWeek.days.map((d) => ({ x: d.date, y: d.airQuality })),
      };
    }
  } else if (currentWeather) {
    ambientValues = currentWeather;
  }

  return { ambientValues, ambientTrend, forecast, loading, error };
}
