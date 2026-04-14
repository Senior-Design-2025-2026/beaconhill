import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Fetches farms, nodes, and measurements from the API.
 * @returns {Promise<{ farms: Array, nodes: Array, measurements: Array }>}
 * @throws on network/auth failure or invalid response.
 */
export async function getMeasurements() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken;
  if (!token) {
    throw new Error('Not authenticated');
  } 

  const authHeader = { Authorization: token.toString() };

  const [farmRes, nodeRes, measurementRes] = await Promise.all([
    get({ apiName: 'apiGet', path: '/farmItems', options: { headers: authHeader } }).response,
    get({ apiName: 'apiGet', path: '/nodeItems', options: { headers: authHeader } }).response,
    get({ apiName: 'apiGet', path: '/dummyItems', options: { headers: authHeader } }).response,
  ]);

  /**
   * Amplify parses the HTTP body with `.body.json()`.
   * Depending on API Gateway/Lambda integration, that parsed value is either:
   * - the data directly (e.g. `[{...}]`), OR
   * - a Lambda proxy envelope `{ statusCode, headers, body: "[{...}]" }`
   *
   * This helper unwraps both shapes into the actual payload.
   * @param {{ body: { json: () => Promise<any> } }} res
   * @returns {Promise<any>}
   */
  async function readJsonPayload(res) {
    const parsed = await res.body.json();
    if (parsed && typeof parsed === 'object' && 'body' in parsed && 'statusCode' in parsed) {
      const inner = parsed.body;
      if (typeof inner === 'string') return JSON.parse(inner);
      return inner;
    }
    return parsed;
  }

  const [farms, nodes, measurements] = await Promise.all([
    readJsonPayload(farmRes),
    readJsonPayload(nodeRes),
    readJsonPayload(measurementRes),
  ]);

  console.log({farms, nodes, measurements});

  return {
    farms: Array.isArray(farms) ? farms : [],
    nodes: Array.isArray(nodes) ? nodes : [],
    measurements: Array.isArray(measurements) ? measurements : [],
  };
}