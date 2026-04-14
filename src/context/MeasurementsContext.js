import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import dummyData from '../data/dummy_measurements.json';
import { isTestMode } from '../config';
import { getMeasurements } from '../api/measurementsApi';
import * as configApi from '../api/configurationApi';

const MeasurementsContext = createContext(null);

/**
 * Recomputes numberOfNodes for every farm based on the current nodes list.
 * @param {Array} farms
 * @param {Array} nodes
 * @returns {Array} farms with updated numberOfNodes
 */
function recomputeNodeCounts(farms, nodes) {
  const counts = {};
  for (const n of nodes) {
    counts[n.farmId] = (counts[n.farmId] || 0) + 1;
  }
  return farms.map((f) => ({ ...f, numberOfNodes: counts[f.farmId] || 0 }));
}

/**
 * MeasurementsProvider — holds farms, nodes, and measurements in state.
 * Exposes CRUD operations for farms and nodes used by ConfigurationPage.
 * In test mode mutations are pure state updates; in production they call
 * the REST API and refresh from the server.
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
          const f = data.farms ?? [];
          const n = data.nodes ?? [];
          setFarms(recomputeNodeCounts(f, n));
          setNodes(n);
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

  // --- refresh farms & nodes from backend (prod) ---

  const refreshFarmsAndNodes = useCallback(async () => {
    if (isTestMode) return;
    try {
      const data = await configApi.refreshFarmsAndNodes();
      const f = data.farms ?? [];
      const n = data.nodes ?? [];
      setFarms(recomputeNodeCounts(f, n));
      setNodes(n);
    } catch (err) {
      console.error('refreshFarmsAndNodes failed:', err);
      throw err;
    }
  }, []);

  // --- Farm CRUD ---

  const addFarm = useCallback(async (farm) => {
    if (isTestMode) {
      setFarms((prev) => [...prev, farm]);
      return;
    }
    await configApi.createFarm(farm);
    await refreshFarmsAndNodes();
  }, [refreshFarmsAndNodes]);

  const updateFarm = useCallback(async (updatedFarm) => {
    if (isTestMode) {
      setFarms((prev) => prev.map((f) => f.farmId === updatedFarm.farmId ? updatedFarm : f));
      return;
    }
    await configApi.updateFarm(updatedFarm);
    await refreshFarmsAndNodes();
  }, [refreshFarmsAndNodes]);

  const deleteFarm = useCallback(async (farmId) => {
    if (isTestMode) {
      setFarms((prev) => prev.filter((f) => f.farmId !== farmId));
      setNodes((prev) => prev.filter((n) => n.farmId !== farmId));
      return;
    }
    await configApi.deleteFarm(farmId);
    await refreshFarmsAndNodes();
  }, [refreshFarmsAndNodes]);

  // --- Node CRUD ---

  const addNode = useCallback(async (node) => {
    if (isTestMode) {
      setNodes((prev) => {
        const next = [...prev, node];
        setFarms((f) => recomputeNodeCounts(f, next));
        return next;
      });
      return;
    }
    await configApi.createNode(node);
    await refreshFarmsAndNodes();
  }, [refreshFarmsAndNodes]);

  const updateNode = useCallback(async (updatedNode) => {
    if (isTestMode) {
      setNodes((prev) => {
        const next = prev.map((n) => n.nodeId === updatedNode.nodeId ? updatedNode : n);
        setFarms((f) => recomputeNodeCounts(f, next));
        return next;
      });
      return;
    }
    await configApi.updateNode(updatedNode);
    await refreshFarmsAndNodes();
  }, [refreshFarmsAndNodes]);

  const deleteNode = useCallback(async (nodeId) => {
    if (isTestMode) {
      setNodes((prev) => {
        const next = prev.filter((n) => n.nodeId !== nodeId);
        setFarms((f) => recomputeNodeCounts(f, next));
        return next;
      });
      return;
    }
    await configApi.deleteNode(nodeId);
    await refreshFarmsAndNodes();
  }, [refreshFarmsAndNodes]);

  const value = {
    farms, nodes, measurements, loading, error,
    addMeasurements,
    refreshFarmsAndNodes,
    addFarm, updateFarm, deleteFarm,
    addNode, updateNode, deleteNode,
  };

  return (
    <MeasurementsContext.Provider value={value}>
      {children}
    </MeasurementsContext.Provider>
  );
}

/**
 * useMeasurements — convenience hook to consume the measurements context.
 * @returns {{
 *   farms: Array, nodes: Array, measurements: Array,
 *   addMeasurements: Function, refreshFarmsAndNodes: Function,
 *   addFarm: Function, updateFarm: Function, deleteFarm: Function,
 *   addNode: Function, updateNode: Function, deleteNode: Function,
 *   loading: boolean, error: string|null,
 * }}
 */
function useMeasurements() {
  const ctx = useContext(MeasurementsContext);
  if (!ctx) {
    throw new Error('useMeasurements must be used within a MeasurementsProvider');
  }
  return ctx;
}

export { MeasurementsProvider, useMeasurements };
