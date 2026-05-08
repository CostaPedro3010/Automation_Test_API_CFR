import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient } from './support/api-client.js';
import { buildUser } from './support/factories.js';
import { cleanupUser, createUser } from './support/usuarios-api.js';

const client = new ApiClient();

test('rejeita cadastro sem campos obrigatorios', async () => {
  const response = await client.post('/usuarios', { body: {} });

  assert.equal(response.status, 400);
  assert.equal(response.body.nome, 'nome é obrigatório');
  assert.equal(response.body.email, 'email é obrigatório');
  assert.equal(response.body.password, 'password é obrigatório');
  assert.equal(response.body.administrador, 'administrador é obrigatório');
});

test('rejeita cadastro com email invalido', async () => {
  const response = await client.post('/usuarios', {
    body: buildUser({ email: 'email-invalido' }),
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.email, 'email deve ser um email válido');
});

test('rejeita cadastro com email duplicado', async () => {
  const { id, user } = await createUser(client);

  try {
    const response = await client.post('/usuarios', { body: user });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Este email já está sendo usado');
  } finally {
    await cleanupUser(client, id);
  }
});

test('rejeita atualizacao quando email pertence a outro usuario', async () => {
  const first = await createUser(client);
  const second = await createUser(client);

  try {
    const response = await client.put(`/usuarios/${second.id}`, {
      body: {
        ...second.user,
        email: first.user.email,
      },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Este email já está sendo usado');
  } finally {
    await cleanupUser(client, first.id);
    await cleanupUser(client, second.id);
  }
});
