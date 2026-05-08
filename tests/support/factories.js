import { randomInt } from 'node:crypto';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function randomId(length = 16) {
  let value = '';

  for (let index = 0; index < length; index += 1) {
    value += ALPHABET[randomInt(ALPHABET.length)];
  }

  return value;
}

export function buildUser(overrides = {}) {
  const suffix = `${Date.now()}${randomId(8).toLowerCase()}`;

  return {
    administrador: 'false',
    email: `codex.${suffix}@example.com`,
    nome: 'Codex API Test',
    password: 'Senha123!',
    ...overrides,
  };
}
