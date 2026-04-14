/**
 * Dummy farm-aggregated values shown on the Analytics page until real
 * aggregation logic is wired up. Two variants: "current" (snapshot) and
 * "week" (7-day aggregate).
 */

export const FARM_METRICS = [
  { key: 'temperature', label: 'Temperature', unit: '°F' },
  { key: 'moisture',    label: 'Moisture',    unit: '%' },
  { key: 'nitrogen',    label: 'Nitrogen',    unit: 'ppm' },
  { key: 'phosphorus',  label: 'Phosphorus',  unit: 'ppm' },
  { key: 'potassium',   label: 'Potassium',   unit: 'ppm' },
];

export const AMBIENT_METRICS = [
  { key: 'temperatureF', label: 'Temperature', unit: '°F' },
  { key: 'humidity',     label: 'Humidity',    unit: '%' },
  { key: 'rainfallIn',   label: 'Rainfall',   unit: 'in' },
  { key: 'nitrogenDioxide', label: 'NO₂',     unit: 'µg/m³' },
  { key: 'airQuality',   label: 'Air Quality', unit: 'AQI' },
];

export const DUMMY_FARM_CURRENT = {
  temperature: 72.4,
  moisture: 48.1,
  nitrogen: 34.5,
  phosphorus: 18.2,
  potassium: 142.0,
};

export const DUMMY_FARM_CURRENT_BY_CROP = {
  corn: DUMMY_FARM_CURRENT,
  soybean: {
    // Testing profile requested for Pentacrest soybean variation:
    // fair temperature, good moisture/phosphorus, excellent nitrogen, poor potassium.
    temperature: 57.0,
    moisture: 56.0,
    nitrogen: 42.0,
    phosphorus: 16.0,
    potassium: 90.0,
  },
};

export const DUMMY_FARM_WEEK = {
  temperature: 70.8,
  moisture: 51.3,
  nitrogen: 32.1,
  phosphorus: 19.7,
  potassium: 138.6,
};

export const DUMMY_FARM_WEEK_SERIES_BY_CROP = {
  corn: {
    temperature: [69.5, 70.1, 71.3, 70.8, 71.6, 70.2, 72.1],
    moisture: [49.8, 50.4, 51.2, 52.1, 51.9, 52.8, 51.0],
    nitrogen: [31.0, 31.5, 32.0, 32.4, 32.8, 32.2, 32.6],
    phosphorus: [18.9, 19.1, 19.4, 19.7, 20.1, 19.8, 20.0],
    potassium: [134.2, 135.0, 136.8, 138.1, 139.4, 140.2, 141.1],
  },
  soybean: {
    temperature: [66.3, 67.0, 66.8, 67.6, 68.2, 67.4, 68.7],
    moisture: [52.5, 53.1, 52.8, 53.6, 54.0, 53.4, 53.8],
    nitrogen: [36.4, 37.0, 37.6, 38.2, 38.0, 38.8, 39.3],
    phosphorus: [15.5, 15.8, 16.1, 16.5, 16.3, 16.7, 17.0],
    potassium: [110.4, 112.2, 113.6, 115.0, 114.3, 116.1, 117.4],
  },
};

export const DUMMY_FARM_PROJECTION = [
  { day: 'Mon', temperature: 71, moisture: 49, nitrogen: 33, phosphorus: 18, potassium: 140 },
  { day: 'Tue', temperature: 73, moisture: 47, nitrogen: 34, phosphorus: 19, potassium: 141 },
  { day: 'Wed', temperature: 69, moisture: 52, nitrogen: 35, phosphorus: 17, potassium: 139 },
  { day: 'Thu', temperature: 68, moisture: 55, nitrogen: 36, phosphorus: 18, potassium: 137 },
  { day: 'Fri', temperature: 72, moisture: 50, nitrogen: 33, phosphorus: 19, potassium: 142 },
  { day: 'Sat', temperature: 74, moisture: 46, nitrogen: 32, phosphorus: 20, potassium: 143 },
  { day: 'Sun', temperature: 71, moisture: 48, nitrogen: 34, phosphorus: 18, potassium: 141 },
];
