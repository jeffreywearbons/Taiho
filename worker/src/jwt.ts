/**
 * RS256 ID-token verification against a provider's JWKS using Web Crypto.
 * Used for Sign in with Apple and Google Sign-In. No external dependencies.
 */
export type Claims = { iss: string; sub: string; aud: string | string[]; exp: number; email?: string };
type Jwk = JsonWebKey & { kid: string };
type Fetcher = (url: string) => Promise<{ keys: Jwk[] }>;

const b64url = (s: string): Uint8Array<ArrayBuffer> => { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '='.repeat((4 - (s.length % 4)) % 4); const bin = atob(s); const out = new Uint8Array(new ArrayBuffer(bin.length)); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
const dec = new TextDecoder();

const cache = new Map<string, { keys: Jwk[]; at: number }>();
async function keysFor(url: string, fetcher: Fetcher): Promise<Jwk[]> {
  const hit = cache.get(url); if (hit && Date.now() - hit.at < 6 * 3600_000) return hit.keys;
  const j = await fetcher(url); cache.set(url, { keys: j.keys, at: Date.now() }); return j.keys;
}

export async function verifyIdToken(token: string, opts: { jwksUrl: string; issuers: string[]; audiences: string[]; fetcher?: Fetcher }): Promise<Claims> {
  const parts = token.split('.'); if (parts.length !== 3) throw new Error('malformed');
  const header = JSON.parse(dec.decode(b64url(parts[0]))) as { alg: string; kid: string };
  if (header.alg !== 'RS256') throw new Error('alg');
  const fetcher = opts.fetcher ?? (async (u) => (await fetch(u)).json() as Promise<{ keys: Jwk[] }>);
  let keys = await keysFor(opts.jwksUrl, fetcher);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) { cache.delete(opts.jwksUrl); keys = await keysFor(opts.jwksUrl, fetcher); jwk = keys.find((k) => k.kid === header.kid); }
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('signature');
  const claims = JSON.parse(dec.decode(b64url(parts[1]))) as Claims;
  if (!opts.issuers.includes(claims.iss)) throw new Error('iss');
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.some((a) => opts.audiences.includes(a))) throw new Error('aud');
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now() - 60_000) throw new Error('exp');
  if (!claims.sub) throw new Error('sub');
  return claims;
}

export const APPLE = { jwksUrl: 'https://appleid.apple.com/auth/keys', issuers: ['https://appleid.apple.com'] };
export const GOOGLE = { jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs', issuers: ['https://accounts.google.com', 'accounts.google.com'] };
