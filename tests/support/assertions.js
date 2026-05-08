import assert from 'node:assert/strict';

const VALID_ID = /^[A-Za-z0-9]{16}$/;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertUserContract(user) {
  assert.equal(typeof user, 'object');
  assert.equal(typeof user.nome, 'string');
  assert.match(user.email, VALID_EMAIL);
  assert.equal(typeof user.password, 'string');
  assert.ok(['true', 'false'].includes(user.administrador));
  assert.match(user._id, VALID_ID);
}

export function assertUsersListContract(body) {
  assert.equal(typeof body.quantidade, 'number');
  assert.ok(Array.isArray(body.usuarios));
  assert.equal(body.quantidade, body.usuarios.length);

  for (const user of body.usuarios) {
    assertUserContract(user);
  }
}
