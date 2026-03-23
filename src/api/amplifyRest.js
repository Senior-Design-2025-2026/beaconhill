import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Returns an Authorization header object with the current Cognito id token.
 * @returns {Promise<{ Authorization: string }>}
 * @throws if the user is not authenticated.
 */
export async function getAuthHeader() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken;
  if (!token) {
    throw new Error('Not authenticated');
  }
  return { Authorization: token.toString() };
}

/**
 * Unwraps an Amplify REST response body.
 *
 * Depending on API Gateway / Lambda integration the parsed value is either
 * the data directly (e.g. `[{...}]`) or a Lambda proxy envelope
 * `{ statusCode, headers, body: "[{...}]" }`. This helper normalizes both.
 *
 * @param {{ body: { json: () => Promise<any> } }} res
 * @returns {Promise<any>}
 */
export async function readJsonPayload(res) {
  const parsed = await res.body.json();
  if (parsed && typeof parsed === 'object' && 'body' in parsed && 'statusCode' in parsed) {
    const inner = parsed.body;
    if (typeof inner === 'string') return JSON.parse(inner);
    return inner;
  }
  return parsed;
}
