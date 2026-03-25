import { get } from 'aws-amplify/api';
import { getAuthHeader, readJsonPayload } from './amplifyRest';

/**
 * Fetches farms, nodes, and measurements from the API.
 * @returns {Promise<{ farms: Array, nodes: Array, measurements: Array }>}
 * @throws on network/auth failure or invalid response.
 */
export async function getMeasurements() {
  const authHeader = await getAuthHeader();

  const [farmRes, nodeRes, measurementRes] = await Promise.all([
    get({ apiName: 'apiGet', path: '/farmItems', options: { headers: authHeader } }).response,
    get({ apiName: 'apiGet', path: '/nodeItems', options: { headers: authHeader } }).response,
    get({ apiName: 'apiGet', path: '/dummyItems', options: { headers: authHeader } }).response,
  ]);

  const [farms, nodes, measurements] = await Promise.all([
    readJsonPayload(farmRes),
    readJsonPayload(nodeRes),
    readJsonPayload(measurementRes),
  ]);

  return {
    farms: Array.isArray(farms) ? farms : [],
    nodes: Array.isArray(nodes) ? nodes : [],
    measurements: Array.isArray(measurements) ? measurements : [],
  };
}
