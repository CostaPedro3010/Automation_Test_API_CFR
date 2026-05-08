import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient } from './support/api-client.js';
import { assertSameUser, cleanupUser, createUser } from './support/usuarios-api.js';
import { assertUsersListContract } from './support/assertions.js';
import { randomId } from './support/factories.js';

const client = new ApiClient();
const createdUserIds = [];

after(async () => {
  for (const id of createdUserIds.reverse()) {
    await cleanupUser(client, id);
  }
});

test('lista usuarios com contrato esperado', async () => {
  const response = await client.get('/usuarios');

  assert.equal(response.status, 200);
  assertUsersListContract(response.body);
});

test('filtra usuarios por email', async () => {
  const { id, user } = await createUser(client);
  createdUserIds.push(id);

  const response = await client.get(`/usuarios?email=${encodeURIComponent(user.email)}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.quantidade, 1);
  assertSameUser(response.body.usuarios[0], user, id);
});

test('retorna erro para usuario inexistente com id valido', async () => {
  const response = await client.get(`/usuarios/${randomId()}`);

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Usuário não encontrado');
});

test('valida formato do id ao buscar usuario', async () => {
  const response = await client.get('/usuarios/id-invalido');

  assert.equal(response.status, 400);
  assert.equal(response.body.id, 'id deve ter exatamente 16 caracteres alfanuméricos');
});
