import { describe, it, expect } from 'vitest';
import { verifyStripeSignature } from '../worker/src/stripe';

async function sign(payload: string, secret: string, t = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`)));
  return `t=${t},v1=${Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}
describe('stripe webhook signature', () => {
  const payload = '{"type":"checkout.session.completed"}';
  it('accepts a correct signature', async () => { expect(await verifyStripeSignature(payload, await sign(payload, 'whsec_x'), 'whsec_x')).toBe(true); });
  it('rejects a wrong secret, altered payload and stale timestamp', async () => {
    expect(await verifyStripeSignature(payload, await sign(payload, 'whsec_x'), 'whsec_y')).toBe(false);
    expect(await verifyStripeSignature(payload + ' ', await sign(payload, 'whsec_x'), 'whsec_x')).toBe(false);
    expect(await verifyStripeSignature(payload, await sign(payload, 'whsec_x', Math.floor(Date.now() / 1000) - 3600), 'whsec_x')).toBe(false);
  });
});
