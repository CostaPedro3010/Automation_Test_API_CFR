const DEFAULT_BASE_URL = 'https://serverest.dev';

function readPositiveInteger(name, fallback) {
  const value = process.env[name];

  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '');
}

export const config = Object.freeze({
  baseUrl: normalizeBaseUrl(process.env.API_BASE_URL ?? DEFAULT_BASE_URL),
  requestsPerMinute: readPositiveInteger('REQUESTS_PER_MINUTE', 100),
  retries: readPositiveInteger('API_RETRIES', 2),
  timeoutMs: readPositiveInteger('API_TIMEOUT_MS', 10000),
});
