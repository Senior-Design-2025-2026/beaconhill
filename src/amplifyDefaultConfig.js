/**
 * Default Amplify configuration when gitignored `aws-exports.json` is absent.
 * Override with `.env.local` using REACT_APP_* vars, or replace values after `amplify pull`.
 */
const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-1_placeholderPool',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || 'placeholderClientId',
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || 'us-east-1:placeholderIdentity',
    },
  },
  API: {
    REST: {
      apiGet: {
        endpoint:
          process.env.REACT_APP_API_ENDPOINT ||
          'https://localhost.invalid',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      },
    },
  },
};

export default awsconfig;
