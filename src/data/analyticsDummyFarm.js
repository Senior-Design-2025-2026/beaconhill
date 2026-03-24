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
  { key: 'windMph',      label: 'Wind',       unit: 'mph' },
  { key: 'uvIndex',      label: 'UV Index',   unit: '' },
];

export const DUMMY_FARM_CURRENT = {
  temperature: 72.4,
  moisture: 48.1,
  nitrogen: 34.5,
  phosphorus: 18.2,
  potassium: 142.0,
};

export const DUMMY_FARM_WEEK = {
  temperature: 70.8,
  moisture: 51.3,
  nitrogen: 32.1,
  phosphorus: 19.7,
  potassium: 138.6,
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
