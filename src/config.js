/**
 * Runtime mode: "test" (bypass login, mock data) vs "production" (login, real API).
 * Set via REACT_APP_MODE when starting the app (e.g. npm run start:test sets REACT_APP_MODE=test).
 */
export const isTestMode = process.env.REACT_APP_MODE === 'test';
