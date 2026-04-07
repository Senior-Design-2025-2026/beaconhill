const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const FETCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 800;

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function mmToIn(mm) {
  return mm / 25.4;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

/**
 * Fetch with timeout and automatic retries (exponential back-off).
 * @param {string} url
 * @param {object} [opts]
 * @returns {Promise<Response>}
 */
async function resilientFetch(url, opts = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
      }
    }
  }
  throw lastErr;
}

/**
 * Fetch current conditions for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized current-weather object.
 */
export async function fetchCurrentWeather(lat, lon) {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index';
  const res = await resilientFetch(url);
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
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    '&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max,uv_index_max' +
    '&forecast_days=7';
  const res = await resilientFetch(url);
  const data = await res.json();
  return normalizeForecast(data);
}

/**
 * Fetch previous 7 complete days for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized historical daily weather object.
 */
export async function fetchPastWeekWeather(lat, lon) {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    '&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max,uv_index_max' +
    '&past_days=7&forecast_days=0';
  const res = await resilientFetch(url);
  const data = await res.json();
  return normalizePastWeek(data);
}

/**
 * Fetch historical hourly weather for a specific date.
 * @param {number} lat
 * @param {number} lon
 * @param {string} dateISO - YYYY-MM-DD
 * @returns {Promise<Object>} Normalized hourly weather object.
 */
export async function fetchDayHourlyWeather(lat, lon, dateISO) {
  const url = `${ARCHIVE_BASE_URL}?latitude=${lat}&longitude=${lon}` +
    `&start_date=${dateISO}&end_date=${dateISO}` +
    '&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index' +
    '&timezone=auto';
  const res = await resilientFetch(url);
  const data = await res.json();
  return normalizeDayHourly(data);
}

/**
 * Normalize Open-Meteo current response into a flat object.
 * @param {Object} raw - Raw API response.
 */
function normalizeCurrent(raw) {
  const c = raw.current || {};
  return {
    temperatureF: c.temperature_2m != null ? +cToF(c.temperature_2m).toFixed(1) : null,
    humidity: c.relative_humidity_2m ?? null,
    rainfallIn: c.precipitation != null ? +mmToIn(c.precipitation).toFixed(2) : null,
    windMph: c.wind_speed_10m != null ? +kmhToMph(c.wind_speed_10m).toFixed(1) : null,
    uvIndex: c.uv_index ?? null,
  };
}

/**
 * Normalize Open-Meteo daily response into a daily array.
 * @param {Object} raw - Raw API response.
 */
function normalizeForecast(raw) {
  const daily = raw.daily || {};
  const dates = daily.time || [];
  const days = dates.map((date, idx) => ({
    date,
    maxTempF: daily.temperature_2m_max?.[idx] != null ? +cToF(daily.temperature_2m_max[idx]).toFixed(1) : null,
    minTempF: daily.temperature_2m_min?.[idx] != null ? +cToF(daily.temperature_2m_min[idx]).toFixed(1) : null,
    avgTempF: daily.temperature_2m_mean?.[idx] != null ? +cToF(daily.temperature_2m_mean[idx]).toFixed(1) : null,
    avgHumidity: daily.relative_humidity_2m_mean?.[idx] ?? null,
    totalPrecipIn: daily.precipitation_sum?.[idx] != null ? +mmToIn(daily.precipitation_sum[idx]).toFixed(2) : null,
    maxWindMph: daily.wind_speed_10m_max?.[idx] != null ? +kmhToMph(daily.wind_speed_10m_max[idx]).toFixed(1) : null,
    uvIndex: daily.uv_index_max?.[idx] ?? null,
  }));

  return { days };
}

/**
 * Normalize historical daily response into a daily array.
 * @param {Object} raw - Raw API response.
 */
function normalizePastWeek(raw) {
  const daily = raw.daily || {};
  const dates = daily.time || [];
  const days = dates.map((date, idx) => ({
    date,
    avgTempF: daily.temperature_2m_mean?.[idx] != null ? +cToF(daily.temperature_2m_mean[idx]).toFixed(1) : null,
    avgHumidity: daily.relative_humidity_2m_mean?.[idx] ?? null,
    totalPrecipIn: daily.precipitation_sum?.[idx] != null ? +mmToIn(daily.precipitation_sum[idx]).toFixed(2) : null,
    maxWindMph: daily.wind_speed_10m_max?.[idx] != null ? +kmhToMph(daily.wind_speed_10m_max[idx]).toFixed(1) : null,
    uvIndex: daily.uv_index_max?.[idx] ?? null,
  }));

  return { days };
}

/**
 * Normalize historical hourly response into an hourly array.
 * @param {Object} raw - Raw API response.
 */
function normalizeDayHourly(raw) {
  const hourly = raw.hourly || {};
  const times = hourly.time || [];
  const hours = times.map((time, idx) => ({
    time,
    hourLabel: time?.slice(11, 16) || '',
    temperatureF: hourly.temperature_2m?.[idx] != null ? +cToF(hourly.temperature_2m[idx]).toFixed(1) : null,
    humidity: hourly.relative_humidity_2m?.[idx] ?? null,
    rainfallIn: hourly.precipitation?.[idx] != null ? +mmToIn(hourly.precipitation[idx]).toFixed(2) : null,
    windMph: hourly.wind_speed_10m?.[idx] != null ? +kmhToMph(hourly.wind_speed_10m[idx]).toFixed(1) : null,
    uvIndex: hourly.uv_index?.[idx] ?? null,
  }));

  return { hours };
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

/**
 * Aggregate an hourly weather array into daily summary values.
 * @param {{ hours: Array }} dayWeather
 */
export function aggregateDayHourly(dayWeather) {
  const hours = dayWeather?.hours || [];
  if (!hours.length) return null;

  const avg = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
  const temp = avg(hours.map((h) => h.temperatureF).filter((v) => v != null));
  const humidity = avg(hours.map((h) => h.humidity).filter((v) => v != null));
  const wind = avg(hours.map((h) => h.windMph).filter((v) => v != null));
  const uv = avg(hours.map((h) => h.uvIndex).filter((v) => v != null));
  const rainfall = hours
    .map((h) => h.rainfallIn)
    .filter((v) => v != null)
    .reduce((sum, value) => sum + value, 0);

  return {
    temperatureF: temp != null ? +temp.toFixed(1) : null,
    humidity: humidity != null ? +humidity.toFixed(1) : null,
    rainfallIn: +rainfall.toFixed(2),
    windMph: wind != null ? +wind.toFixed(1) : null,
    uvIndex: uv != null ? +uv.toFixed(1) : null,
  };
}
