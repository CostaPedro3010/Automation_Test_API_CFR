import assert from 'node:assert/strict';
import { assertUserContract } from './assertions.js';
import { buildUser } from './factories.js';

export async function createUser(client, overrides = {}) {
  const user = buildUser(overrides);
  const response = await client.post('/usuarios', { body: user });

  assert.equal(response.status, 201);
  assert.equal(response.body.message, 'Cadastro realizado com sucesso');
  assert.match(response.body._id, /^[A-Za-z0-9]{16}$/);

  return {
    id: response.body._id,
    response,
    user,
  };
}

export async function cleanupUser(client, id) {
  if (!id) {
    return;
  }

  try {
    await client.delete(`/usuarios/${id}`);
  } catch {
    // Cleanup must not hide the original assertion failure.
  }
}

export function assertSameUser(actual, expected, id) {
  assertUserContract(actual);
  assert.equal(actual._id, id);
  assert.equal(actual.nome, expected.nome);
  assert.equal(actual.email, expected.email);
  assert.equal(actual.password, expected.password);
  assert.equal(actual.administrador, expected.administrador);
}
