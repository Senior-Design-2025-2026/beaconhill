import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import dummyData from '../data/dummy_measurements.json';
import { isTestMode } from '../config';
import { getMeasurements } from '../api/measurementsApi';

const MeasurementsContext = createContext(null);

/**
 * MeasurementsProvider — holds farms, nodes, and measurements in state.
 * Initialized from dummy_measurements.json; exposes addMeasurements()
 * so pages (e.g. TestingPage) can append data at runtime.
 */
function MeasurementsProvider({ children }) {
  const [farms, setFarms] = useState(isTestMode ? dummyData.farms : []);
  const [nodes, setNodes] = useState(isTestMode ? dummyData.nodes : []);
  const [measurements, setMeasurements] = useState(isTestMode ? dummyData.measurements : []);
  const [loading, setLoading] = useState(!isTestMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isTestMode) return;
    let cancelled = false;
    getMeasurements()
      .then((data) => {
        if (!cancelled) {
          setFarms(data.farms ?? []);
          setNodes(data.nodes ?? []);
          setMeasurements(data.measurements ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Measurements fetch failed:', err);
          setError(err?.message ?? 'Failed to load measurements');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const addMeasurements = useCallback((newMeasurements) => {
    setMeasurements((prev) => [...prev, ...newMeasurements]);
  }, []);

  return (
    <MeasurementsContext.Provider value={{ farms, nodes, measurements, addMeasurements, loading, error }}>
      {children}
    </MeasurementsContext.Provider>
  );
}

/**
 * useMeasurements — convenience hook to consume the measurements context.
 * @returns {{ farms: Array, nodes: Array, measurements: Array, addMeasurements: Function }}
 */
function useMeasurements() {
  const ctx = useContext(MeasurementsContext);
  if (!ctx) {
    throw new Error('useMeasurements must be used within a MeasurementsProvider');
  }
  return ctx;
}

export { MeasurementsProvider, useMeasurements };