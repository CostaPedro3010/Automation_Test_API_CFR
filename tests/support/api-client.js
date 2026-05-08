import { setTimeout as sleep } from 'node:timers/promises';
import { config } from './config.js';

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

async function parseResponse(response) {
  const text = await response.text();
  let body = text;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    body,
    headers: response.headers,
    ok: response.ok,
    status: response.status,
    text,
  };
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get('retry-after');

  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);

    if (Number.isInteger(seconds) && seconds > 0) {
      return seconds * 1000;
    }
  }

  return 300 * (attempt + 1);
}

export class ApiClient {
  #requestTimestamps = [];

  constructor(options = {}) {
    this.baseUrl = options.baseUrl ?? config.baseUrl;
    this.requestsPerMinute = options.requestsPerMinute ?? config.requestsPerMinute;
    this.retries = options.retries ?? config.retries;
    this.timeoutMs = options.timeoutMs ?? config.timeoutMs;
  }

  get(path, options) {
    return this.request('GET', path, options);
  }

  post(path, options) {
    return this.request('POST', path, options);
  }

  put(path, options) {
    return this.request('PUT', path, options);
  }

  delete(path, options) {
    return this.request('DELETE', path, options);
  }

  async request(method, path, options = {}) {
    const url = new URL(path, `${this.baseUrl}/`);
    const headers = new Headers(options.headers ?? {});

    headers.set('accept', headers.get('accept') ?? 'application/json');

    if (options.token) {
      headers.set('authorization', options.token);
    }

    let body;

    if (options.body !== undefined) {
      body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      headers.set('content-type', headers.get('content-type') ?? 'application/json');
    }

    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      this.#registerRequest();

      try {
        const response = await fetch(url, {
          body,
          headers,
          method,
          signal: AbortSignal.timeout(this.timeoutMs),
        });
        const parsed = await parseResponse(response);

        if (!RETRYABLE_STATUS_CODES.has(parsed.status) || attempt === this.retries) {
          return parsed;
        }

        await sleep(retryDelay(response, attempt));
      } catch (error) {
        lastError = error;

        if (attempt === this.retries) {
          throw error;
        }

        await sleep(300 * (attempt + 1));
      }
    }

    throw lastError;
  }

  #registerRequest() {
    const now = Date.now();
    this.#requestTimestamps = this.#requestTimestamps.filter(
      (timestamp) => now - timestamp < 60000,
    );

    if (this.#requestTimestamps.length >= this.requestsPerMinute) {
      throw new Error(
        `Request budget exceeded: ${this.requestsPerMinute} requests per minute`,
      );
    }

    this.#requestTimestamps.push(now);
  }
}
