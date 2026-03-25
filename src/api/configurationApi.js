import { get, post, put, del } from 'aws-amplify/api';
import { getAuthHeader, readJsonPayload } from './amplifyRest';

const API_NAME = 'apiGet';

const FARM_NUMBER_KEYS = ['lat', 'lon', 'numberOfNodes'];
const NODE_NUMBER_KEYS = ['lat', 'lon'];

/** Coerce known numeric fields from string → number so DynamoDB N types match. */
function coerceNumbers(obj, keys) {
  const out = { ...obj };
  for (const k of keys) {
    if (k in out && out[k] !== null && out[k] !== undefined) {
      const n = Number(out[k]);
      if (!Number.isNaN(n)) out[k] = n;
    }
  }
  return out;
}

/**
 * Fetches the current farms and nodes from the API (lighter than getMeasurements).
 * @returns {Promise<{ farms: Array, nodes: Array }>}
 */
export async function refreshFarmsAndNodes() {
  const authHeader = await getAuthHeader();
  const [farmRes, nodeRes] = await Promise.all([
    get({ apiName: API_NAME, path: '/farmItems', options: { headers: authHeader } }).response,
    get({ apiName: API_NAME, path: '/nodeItems', options: { headers: authHeader } }).response,
  ]);
  const [farms, nodes] = await Promise.all([
    readJsonPayload(farmRes),
    readJsonPayload(nodeRes),
  ]);
  return {
    farms: Array.isArray(farms) ? farms : [],
    nodes: Array.isArray(nodes) ? nodes : [],
  };
}

// --- Farm CRUD ---

/** @param {Object} farm - full farm object including farmId */
export async function createFarm(farm) {
  try {
    const authHeader = await getAuthHeader();
    const res = await post({
      apiName: API_NAME,
      path: '/farmItems',
      options: { headers: authHeader, body: coerceNumbers(farm, FARM_NUMBER_KEYS) },
    }).response;
    return readJsonPayload(res);
  } catch (err) {
    console.error('createFarm failed:', err);
    throw new Error(err?.message ?? 'Failed to create farm');
  }
}

/** @param {Object} farm - full farm object including farmId */
export async function updateFarm(farm) {
  try {
    const authHeader = await getAuthHeader();
    const res = await put({
      apiName: API_NAME,
      path: '/farmItems',
      options: { headers: authHeader, body: coerceNumbers(farm, FARM_NUMBER_KEYS) },
    }).response;
    return readJsonPayload(res);
  } catch (err) {
    console.error('updateFarm failed:', err);
    throw new Error(err?.message ?? 'Failed to update farm');
  }
}

/** @param {string} farmId */
export async function deleteFarm(farmId) {
  try {
    const authHeader = await getAuthHeader();
    const res = await del({
      apiName: API_NAME,
      path: '/farmItems',
      options: { headers: authHeader, body: { farmId } },
    }).response;
    return readJsonPayload(res);
  } catch (err) {
    console.error('deleteFarm failed:', err);
    throw new Error(err?.message ?? 'Failed to delete farm');
  }
}

// --- Node CRUD ---

/** @param {Object} node - full node object including nodeId */
export async function createNode(node) {
  try {
    const authHeader = await getAuthHeader();
    const res = await post({
      apiName: API_NAME,
      path: '/nodeItems',
      options: { headers: authHeader, body: coerceNumbers(node, NODE_NUMBER_KEYS) },
    }).response;
    return readJsonPayload(res);
  } catch (err) {
    console.error('createNode failed:', err);
    throw new Error(err?.message ?? 'Failed to create node');
  }
}

/** @param {Object} node - full node object including nodeId */
export async function updateNode(node) {
  try {
    const authHeader = await getAuthHeader();
    const res = await put({
      apiName: API_NAME,
      path: '/nodeItems',
      options: { headers: authHeader, body: coerceNumbers(node, NODE_NUMBER_KEYS) },
    }).response;
    return readJsonPayload(res);
  } catch (err) {
    console.error('updateNode failed:', err);
    throw new Error(err?.message ?? 'Failed to update node');
  }
}

/** @param {string} nodeId */
export async function deleteNode(nodeId) {
  try {
    const authHeader = await getAuthHeader();
    const res = await del({
      apiName: API_NAME,
      path: '/nodeItems',
      options: { headers: authHeader, body: { nodeId } },
    }).response;
    return readJsonPayload(res);
  } catch (err) {
    console.error('deleteNode failed:', err);
    throw new Error(err?.message ?? 'Failed to delete node');
  }
}
