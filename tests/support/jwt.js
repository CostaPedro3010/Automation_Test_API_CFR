import assert from 'node:assert/strict';

export function decodeBearerJwt(authorization) {
  assert.match(
    authorization,
    /^Bearer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  );

  const [scheme, token] = authorization.split(/\s+/);
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  return {
    header: JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')),
    payload: JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')),
    scheme,
    signature,
    token,
  };
}
