import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Ensures Cognito has delivered temporary AWS credentials (Identity Pool) so the
 * Amplify REST client can SigV4-sign requests. apiGet uses API Gateway IAM auth;
 * sending a JWT in `Authorization` overrides signing and produces IncompleteSignature errors.
 * @returns {Promise<void>}
 * @throws if there are no credentials for signing.
 */
export async function ensureAwsCredentials() {
  const session = await fetchAuthSession();
  const creds = session.credentials;
  if (!creds?.accessKeyId || !creds?.secretAccessKey || !creds?.sessionToken) {
    throw new Error('Not authenticated or missing AWS credentials for API (Identity Pool)');
  }
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
