import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient } from './support/api-client.js';
import { cleanupUser, createUser } from './support/usuarios-api.js';
import { decodeBearerJwt } from './support/jwt.js';

const client = new ApiClient();
const createdUserIds = [];

after(async () => {
  for (const id of createdUserIds.reverse()) {
    await cleanupUser(client, id);
  }
});

test('realiza login e retorna token JWT Bearer valido', async () => {
  const { id, user } = await createUser(client, { administrador: 'true' });
  createdUserIds.push(id);

  const response = await client.post('/login', {
    body: {
      email: user.email,
      password: user.password,
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'Login realizado com sucesso');

  const decoded = decodeBearerJwt(response.body.authorization);
  assert.equal(decoded.scheme, 'Bearer');
  assert.equal(decoded.header.alg, 'HS256');
  assert.equal(decoded.header.typ, 'JWT');
  assert.equal(decoded.payload.email, user.email);
  assert.equal(decoded.payload.password, user.password);
  assert.equal(typeof decoded.payload.iat, 'number');
  assert.equal(typeof decoded.payload.exp, 'number');
  assert.ok(decoded.payload.exp > decoded.payload.iat);
  assert.ok(decoded.signature.length > 0);
});

test('rejeita login com credenciais invalidas', async () => {
  const response = await client.post('/login', {
    body: {
      email: 'usuario.inexistente@example.com',
      password: 'senha-incorreta',
    },
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Email e/ou senha inválidos');
});
