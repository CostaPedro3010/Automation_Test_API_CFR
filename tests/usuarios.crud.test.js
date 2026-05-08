import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient } from './support/api-client.js';
import { buildUser } from './support/factories.js';
import { assertSameUser, cleanupUser } from './support/usuarios-api.js';

const client = new ApiClient();

test('executa ciclo CRUD completo de usuario usando token de autenticacao', async () => {
  const user = buildUser({ administrador: 'false' });
  let userId;

  try {
    const createResponse = await client.post('/usuarios', { body: user });
    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.message, 'Cadastro realizado com sucesso');
    userId = createResponse.body._id;

    const loginResponse = await client.post('/login', {
      body: {
        email: user.email,
        password: user.password,
      },
    });
    assert.equal(loginResponse.status, 200);
    assert.match(loginResponse.body.authorization, /^Bearer\s+/);

    const token = loginResponse.body.authorization;

    const getResponse = await client.get(`/usuarios/${userId}`, { token });
    assert.equal(getResponse.status, 200);
    assertSameUser(getResponse.body, user, userId);

    const updatedUser = {
      ...user,
      administrador: 'true',
      nome: 'Codex API Test Updated',
    };

    const updateResponse = await client.put(`/usuarios/${userId}`, {
      body: updatedUser,
      token,
    });
    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.message, 'Registro alterado com sucesso');

    const getUpdatedResponse = await client.get(`/usuarios/${userId}`, { token });
    assert.equal(getUpdatedResponse.status, 200);
    assertSameUser(getUpdatedResponse.body, updatedUser, userId);

    const deleteResponse = await client.delete(`/usuarios/${userId}`, { token });
    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.message, 'Registro excluído com sucesso');
    userId = undefined;

    const getDeletedResponse = await client.get(`/usuarios/${createResponse.body._id}`, { token });
    assert.equal(getDeletedResponse.status, 400);
    assert.equal(getDeletedResponse.body.message, 'Usuário não encontrado');
  } finally {
    await cleanupUser(client, userId);
  }
});

test('delete de usuario inexistente informa que nenhum registro foi excluido', async () => {
  const response = await client.delete('/usuarios/abcdefghijklmnop');

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Nenhum registro excluído');
});
