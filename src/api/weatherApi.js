const BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * @returns {string} WeatherAPI.com key from env, or '' if not set.
 */
function getApiKey() {
  return process.env.REACT_APP_WEATHER_API_KEY || '';
}

/**
 * Fetch current conditions for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized current-weather object.
 */
export async function fetchCurrentWeather(lat, lon) {
  const key = getApiKey();
  if (!key) throw new Error('REACT_APP_WEATHER_API_KEY is not set');

  const url = `${BASE_URL}/current.json?key=${key}&q=${lat},${lon}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data = await res.json();
  return normalizeCurrent(data);
}

/**
 * Fetch 7-day forecast for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized forecast object with daily array.
 */
export async function fetchForecast(lat, lon) {
  const key = getApiKey();
  if (!key) throw new Error('REACT_APP_WEATHER_API_KEY is not set');

  const url = `${BASE_URL}/forecast.json?key=${key}&q=${lat},${lon}&days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const data = await res.json();
  return normalizeForecast(data);
}

/**
 * Normalize WeatherAPI current.json response into a flat object.
 * @param {Object} raw - Raw API response.
 */
function normalizeCurrent(raw) {
  const c = raw.current || {};
  return {
    temperatureF: c.temp_f ?? null,
    humidity: c.humidity ?? null,
    rainfallIn: c.precip_in ?? null,
    windMph: c.wind_mph ?? null,
    pressureIn: c.pressure_in ?? null,
    uvIndex: c.uv ?? null,
    conditionText: c.condition?.text ?? '',
  };
}

/**
 * Normalize WeatherAPI forecast.json response into a summary + daily array.
 * @param {Object} raw - Raw API response.
 */
function normalizeForecast(raw) {
  const days = (raw.forecast?.forecastday || []).map((d) => ({
    date: d.date,
    maxTempF: d.day?.maxtemp_f ?? null,
    minTempF: d.day?.mintemp_f ?? null,
    avgTempF: d.day?.avgtemp_f ?? null,
    avgHumidity: d.day?.avghumidity ?? null,
    totalPrecipIn: d.day?.totalprecip_in ?? null,
    maxWindMph: d.day?.maxwind_mph ?? null,
    uvIndex: d.day?.uv ?? null,
    conditionText: d.day?.condition?.text ?? '',
  }));

  return { days };
}

/**
 * Aggregate a forecast's daily array into weekly averages / totals
 * for use as the "week" ambient values.
 * @param {{ days: Array }} forecast - Output of normalizeForecast.
 */
export function aggregateForecastWeek(forecast) {
  const { days } = forecast;
  if (!days.length) return null;

  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;

  return {
    temperatureF: +avg(days.map((d) => d.avgTempF).filter((v) => v != null)).toFixed(1),
    humidity: +avg(days.map((d) => d.avgHumidity).filter((v) => v != null)).toFixed(1),
    rainfallIn: +days.map((d) => d.totalPrecipIn).filter((v) => v != null).reduce((s, v) => s + v, 0).toFixed(2),
    windMph: +avg(days.map((d) => d.maxWindMph).filter((v) => v != null)).toFixed(1),
    uvIndex: +avg(days.map((d) => d.uvIndex).filter((v) => v != null)).toFixed(1),
  };
}
