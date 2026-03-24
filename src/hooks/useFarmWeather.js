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
      const [cur, fc, pw] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
        fetchPastWeekWeather(lat, lon),
      ]);
      setCurrentWeather(cur);
      setForecast(fc);
      setPastWeek(pw);
      if (dateISO) {
        const day = await fetchDayHourlyWeather(lat, lon, dateISO);
        setDayHourly(day);
      } else {
        setDayHourly(null);
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
      windMph: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.windMph })),
      uvIndex: dayHourly.hours.map((h) => ({ x: h.hourLabel, y: h.uvIndex })),
    };
  } else if (mode === 'week' && (pastWeek || forecast)) {
    ambientValues = aggregateForecastWeek(pastWeek || forecast);
    if (pastWeek?.days?.length) {
      ambientTrend = {
        temperatureF: pastWeek.days.map((d) => ({ x: d.date, y: d.avgTempF })),
        humidity: pastWeek.days.map((d) => ({ x: d.date, y: d.avgHumidity })),
        rainfallIn: pastWeek.days.map((d) => ({ x: d.date, y: d.totalPrecipIn })),
        windMph: pastWeek.days.map((d) => ({ x: d.date, y: d.maxWindMph })),
        uvIndex: pastWeek.days.map((d) => ({ x: d.date, y: d.uvIndex })),
      };
    }
  } else if (currentWeather) {
    ambientValues = currentWeather;
  }

  return { ambientValues, ambientTrend, forecast, loading, error };
}
