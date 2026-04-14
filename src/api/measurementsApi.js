import { get } from 'aws-amplify/api';
import { ensureAwsCredentials, readJsonPayload } from './amplifyRest';

/**
 * Fetches farms, nodes, and measurements from the API.
 * @returns {Promise<{ farms: Array, nodes: Array, measurements: Array }>}
 * @throws on network/auth failure or invalid response.
 */
export async function getMeasurements() {
  await ensureAwsCredentials();

  const [farmRes, nodeRes, measurementRes] = await Promise.all([
    get({ apiName: 'apiGet', path: '/farmItems' }).response,
    get({ apiName: 'apiGet', path: '/nodeItems' }).response,
    get({ apiName: 'apiGet', path: '/dummyItems' }).response,
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
