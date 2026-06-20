import { describe, it, expect } from 'vitest';
import { getAppwriteEndpoint } from './appwriteConfig';

describe('getAppwriteEndpoint', () => {
  it('should return the configured endpoint if present in env', () => {
    const env = { VITE_APPWRITE_ENDPOINT: 'https://custom-env-endpoint.com/v1' };
    const endpoint = getAppwriteEndpoint(env);
    expect(endpoint).toBe('https://custom-env-endpoint.com/v1');
  });

  it('should fallback to the secure custom domain if endpoint is missing in env', () => {
    const env = {};
    const endpoint = getAppwriteEndpoint(env);
    expect(endpoint).toBe('https://api.ricgcw.com/v1');
  });

  it('should fallback to the secure custom domain if env is null or undefined', () => {
    const endpoint = getAppwriteEndpoint(undefined);
    expect(endpoint).toBe('https://api.ricgcw.com/v1');
  });
});
