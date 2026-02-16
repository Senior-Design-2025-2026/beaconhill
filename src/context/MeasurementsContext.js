import React, { createContext, useContext, useState, useCallback } from 'react';
import dummyData from '../data/dummy_measurements.json';

const MeasurementsContext = createContext(null);

/**
 * MeasurementsProvider — holds farms, nodes, and measurements in state.
 * Initialized from dummy_measurements.json; exposes addMeasurements()
 * so pages (e.g. TestingPage) can append data at runtime.
 */
function MeasurementsProvider({ children }) {
  const [farms] = useState(dummyData.farms);
  const [nodes] = useState(dummyData.nodes);
  const [measurements, setMeasurements] = useState(dummyData.measurements);

  const addMeasurements = useCallback((newMeasurements) => {
    setMeasurements((prev) => [...prev, ...newMeasurements]);
  }, []);

  return (
    <MeasurementsContext.Provider value={{ farms, nodes, measurements, addMeasurements }}>
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
