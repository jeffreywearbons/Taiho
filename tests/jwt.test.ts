import { describe, it, expect } from 'vitest';
import { verifyIdToken } from '../worker/src/jwt';

const b64url = (buf: ArrayBuffer | string): string => { const bytes = typeof buf === 'string' ? new TextEncoder().encode(buf) : new Uint8Array(buf); let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };

async function makeToken(claims: Record<string, unknown>, kid = 'k1') {
  const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...(await crypto.subtle.exportKey('jwk', kp.publicKey)), kid };
  const h = b64url(JSON.stringify({ alg: 'RS256', kid })), p = b64url(JSON.stringify(claims));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', kp.privateKey, new TextEncoder().encode(h + '.' + p));
  return { token: `${h}.${p}.${b64url(sig)}`, jwks: { keys: [jwk] } };
}
const opts = (jwks: { keys: any[] }, url = 'https://x/' + Math.random()) => ({ jwksUrl: url, issuers: ['https://appleid.apple.com'], audiences: ['com.wearbons.taiho'], fetcher: async () => jwks });

describe('id token verification', () => {
  const good = { iss: 'https://appleid.apple.com', sub: 'user-1', aud: 'com.wearbons.taiho', exp: Math.floor(Date.now() / 1000) + 600 };
  it('accepts a valid token', async () => { const { token, jwks } = await makeToken(good); const c = await verifyIdToken(token, opts(jwks)); expect(c.sub).toBe('user-1'); });
  it('rejects a tampered payload', async () => { const { token, jwks } = await makeToken(good); const [h, , s] = token.split('.'); const bad = `${h}.${b64url(JSON.stringify({ ...good, sub: 'user-2' }))}.${s}`; await expect(verifyIdToken(bad, opts(jwks))).rejects.toThrow('signature'); });
  it('rejects a wrong audience, issuer and expiry', async () => {
    const a = await makeToken({ ...good, aud: 'other' }); await expect(verifyIdToken(a.token, opts(a.jwks))).rejects.toThrow('aud');
    const i = await makeToken({ ...good, iss: 'https://evil' }); await expect(verifyIdToken(i.token, opts(i.jwks))).rejects.toThrow('iss');
    const e = await makeToken({ ...good, exp: Math.floor(Date.now() / 1000) - 3600 }); await expect(verifyIdToken(e.token, opts(e.jwks))).rejects.toThrow('exp');
  });
  it('rejects an unknown signing key', async () => { const { token } = await makeToken(good, 'k9'); const other = await makeToken(good, 'k1'); await expect(verifyIdToken(token, opts(other.jwks))).rejects.toThrow('kid'); });
});
