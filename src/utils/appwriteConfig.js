/**
 * Resolves the Appwrite API endpoint.
 * @param {Record<string, string>} env - The environment variables object.
 * @returns {string} The resolved API endpoint.
 */
export const getAppwriteEndpoint = (env) => {
  return env?.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
};
