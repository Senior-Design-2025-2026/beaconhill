const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const FETCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 800;

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function mmToIn(mm) {
  return mm / 25.4;
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
 * Fetch current conditions + air quality for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized current-weather object.
 */
export async function fetchCurrentWeather(lat, lon) {
  const weatherUrl = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,precipitation';
  const aqUrl = `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}` +
    '&current=us_aqi,nitrogen_dioxide';
  const [weatherRes, aqRes] = await Promise.all([
    resilientFetch(weatherUrl),
    resilientFetch(aqUrl).catch(() => null),
  ]);
  const weather = await weatherRes.json();
  const aq = aqRes ? await aqRes.json() : null;
  return normalizeCurrent(weather, aq);
}

/**
 * Fetch 7-day forecast for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized forecast object with daily array.
 */
export async function fetchForecast(lat, lon) {
  const weatherUrl = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    '&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum' +
    '&forecast_days=7&timezone=auto';
  const aqUrl = `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}` +
    '&hourly=us_aqi,nitrogen_dioxide&forecast_days=7&timezone=auto';
  const [weatherRes, aqRes] = await Promise.all([
    resilientFetch(weatherUrl),
    resilientFetch(aqUrl).catch(() => null),
  ]);
  const weather = await weatherRes.json();
  const aq = aqRes ? await aqRes.json() : null;
  return normalizeForecast(weather, aq);
}

/**
 * Fetch previous 7 complete days for a lat/lon.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} Normalized historical daily weather object.
 */
export async function fetchPastWeekWeather(lat, lon) {
  const weatherUrl = `${BASE_URL}?latitude=${lat}&longitude=${lon}` +
    '&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum' +
    '&past_days=7&forecast_days=0&timezone=auto';
  const aqUrl = `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}` +
    '&hourly=us_aqi,nitrogen_dioxide&past_days=7&forecast_days=0&timezone=auto';
  const [weatherRes, aqRes] = await Promise.all([
    resilientFetch(weatherUrl),
    resilientFetch(aqUrl).catch(() => null),
  ]);
  const weather = await weatherRes.json();
  const aq = aqRes ? await aqRes.json() : null;
  return normalizePastWeek(weather, aq);
}

/**
 * Fetch historical hourly weather + air quality for a specific date.
 * @param {number} lat
 * @param {number} lon
 * @param {string} dateISO - YYYY-MM-DD
 * @returns {Promise<Object>} Normalized hourly weather object.
 */
export async function fetchDayHourlyWeather(lat, lon, dateISO) {
  const weatherUrl = `${ARCHIVE_BASE_URL}?latitude=${lat}&longitude=${lon}` +
    `&start_date=${dateISO}&end_date=${dateISO}` +
    '&hourly=temperature_2m,relative_humidity_2m,precipitation' +
    '&timezone=auto';
  const aqUrl = `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}` +
    `&hourly=us_aqi,nitrogen_dioxide&start_date=${dateISO}&end_date=${dateISO}&timezone=auto`;
  const [weatherRes, aqRes] = await Promise.all([
    resilientFetch(weatherUrl),
    resilientFetch(aqUrl).catch(() => null),
  ]);
  const weather = await weatherRes.json();
  const aq = aqRes ? await aqRes.json() : null;
  return normalizeDayHourly(weather, aq);
}

/**
 * Normalize Open-Meteo current response into a flat object.
 * @param {Object} raw - Raw weather API response.
 * @param {Object|null} aqRaw - Raw air quality API response.
 */
function normalizeCurrent(raw, aqRaw) {
  const c = raw.current || {};
  const aq = aqRaw?.current || {};
  return {
    temperatureF: c.temperature_2m != null ? +cToF(c.temperature_2m).toFixed(1) : null,
    humidity: c.relative_humidity_2m ?? null,
    rainfallIn: c.precipitation != null ? +mmToIn(c.precipitation).toFixed(2) : null,
    nitrogenDioxide: aq.nitrogen_dioxide != null ? +aq.nitrogen_dioxide.toFixed(1) : null,
    airQuality: aq.us_aqi ?? null,
  };
}

/**
 * Normalize Open-Meteo daily response into a daily array.
 * Computes daily averages from hourly air-quality data.
 * @param {Object} raw - Raw weather API response.
 * @param {Object|null} aqRaw - Raw air quality API response (hourly).
 */
function normalizeForecast(raw, aqRaw) {
  const daily = raw.daily || {};
  const dates = daily.time || [];
  const dailyAqi = computeDailyAvg(aqRaw, 'us_aqi', dates);
  const dailyNo2 = computeDailyAvg(aqRaw, 'nitrogen_dioxide', dates);
  const days = dates.map((date, idx) => ({
    date,
    maxTempF: daily.temperature_2m_max?.[idx] != null ? +cToF(daily.temperature_2m_max[idx]).toFixed(1) : null,
    minTempF: daily.temperature_2m_min?.[idx] != null ? +cToF(daily.temperature_2m_min[idx]).toFixed(1) : null,
    avgTempF: daily.temperature_2m_mean?.[idx] != null ? +cToF(daily.temperature_2m_mean[idx]).toFixed(1) : null,
    avgHumidity: daily.relative_humidity_2m_mean?.[idx] ?? null,
    totalPrecipIn: daily.precipitation_sum?.[idx] != null ? +mmToIn(daily.precipitation_sum[idx]).toFixed(2) : null,
    nitrogenDioxide: dailyNo2[date] ?? null,
    airQuality: dailyAqi[date] ?? null,
  }));

  return { days };
}

/**
 * Normalize historical daily response into a daily array.
 * @param {Object} raw - Raw weather API response.
 * @param {Object|null} aqRaw - Raw air quality API response (hourly).
 */
function normalizePastWeek(raw, aqRaw) {
  const daily = raw.daily || {};
  const dates = daily.time || [];
  const dailyAqi = computeDailyAvg(aqRaw, 'us_aqi', dates);
  const dailyNo2 = computeDailyAvg(aqRaw, 'nitrogen_dioxide', dates);
  const days = dates.map((date, idx) => ({
    date,
    avgTempF: daily.temperature_2m_mean?.[idx] != null ? +cToF(daily.temperature_2m_mean[idx]).toFixed(1) : null,
    avgHumidity: daily.relative_humidity_2m_mean?.[idx] ?? null,
    totalPrecipIn: daily.precipitation_sum?.[idx] != null ? +mmToIn(daily.precipitation_sum[idx]).toFixed(2) : null,
    nitrogenDioxide: dailyNo2[date] ?? null,
    airQuality: dailyAqi[date] ?? null,
  }));

  return { days };
}

/**
 * Normalize historical hourly response into an hourly array.
 * @param {Object} raw - Raw weather API response.
 * @param {Object|null} aqRaw - Raw air quality API response (hourly).
 */
function normalizeDayHourly(raw, aqRaw) {
  const hourly = raw.hourly || {};
  const aqHourly = aqRaw?.hourly || {};
  const times = hourly.time || [];
  const hours = times.map((time, idx) => ({
    time,
    hourLabel: time?.slice(11, 16) || '',
    temperatureF: hourly.temperature_2m?.[idx] != null ? +cToF(hourly.temperature_2m[idx]).toFixed(1) : null,
    humidity: hourly.relative_humidity_2m?.[idx] ?? null,
    rainfallIn: hourly.precipitation?.[idx] != null ? +mmToIn(hourly.precipitation[idx]).toFixed(2) : null,
    nitrogenDioxide: aqHourly.nitrogen_dioxide?.[idx] != null ? +aqHourly.nitrogen_dioxide[idx].toFixed(1) : null,
    airQuality: aqHourly.us_aqi?.[idx] ?? null,
  }));

  return { hours };
}

/**
 * Aggregate hourly values for a given field into daily averages keyed by date.
 * @param {Object|null} aqRaw - Raw air quality API response with hourly data.
 * @param {string} field - Field name in the hourly object (e.g. 'us_aqi', 'nitrogen_dioxide').
 * @param {string[]} dates - List of date strings (YYYY-MM-DD) to compute.
 * @returns {Object} Map of date → average value (rounded to 1 decimal).
 */
function computeDailyAvg(aqRaw, field, dates) {
  const arr = aqRaw?.hourly?.[field];
  if (!arr) return {};
  const times = aqRaw.hourly.time || [];
  const buckets = {};
  times.forEach((t, i) => {
    const date = t?.slice(0, 10);
    if (arr[i] == null) return;
    if (!buckets[date]) buckets[date] = [];
    buckets[date].push(arr[i]);
  });
  const result = {};
  for (const date of dates) {
    const vals = buckets[date];
    if (vals?.length) {
      result[date] = +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
    }
  }
  return result;
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
    nitrogenDioxide: +avg(days.map((d) => d.nitrogenDioxide).filter((v) => v != null)).toFixed(1),
    airQuality: Math.round(avg(days.map((d) => d.airQuality).filter((v) => v != null))),
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
  const no2 = avg(hours.map((h) => h.nitrogenDioxide).filter((v) => v != null));
  const aqi = avg(hours.map((h) => h.airQuality).filter((v) => v != null));
  const rainfall = hours
    .map((h) => h.rainfallIn)
    .filter((v) => v != null)
    .reduce((sum, value) => sum + value, 0);

  return {
    temperatureF: temp != null ? +temp.toFixed(1) : null,
    humidity: humidity != null ? +humidity.toFixed(1) : null,
    rainfallIn: +rainfall.toFixed(2),
    nitrogenDioxide: no2 != null ? +no2.toFixed(1) : null,
    airQuality: aqi != null ? Math.round(aqi) : null,
  };
}
