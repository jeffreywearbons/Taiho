/** Minimal Stripe helpers for Workers: Checkout session creation and webhook signature verification. */
export async function createCheckout(secret: string, price: string, clientRef: string, successUrl: string, cancelUrl: string): Promise<{ url: string } | null> {
  const body = new URLSearchParams({ mode: 'payment', 'line_items[0][price]': price, 'line_items[0][quantity]': '1', success_url: successUrl, cancel_url: cancelUrl, client_reference_id: clientRef });
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { authorization: 'Bearer ' + secret, 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!r.ok) return null; const j = (await r.json()) as { url?: string }; return j.url ? { url: j.url } : null;
}
export async function verifyStripeSignature(payload: string, header: string, secret: string, toleranceSec = 300): Promise<boolean> {
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=') as [string, string]));
  const t = parts.t, v1 = parts.v1; if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`)));
  const hex = Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== v1.length) return false;
  let diff = 0; for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i); return diff === 0;
}
