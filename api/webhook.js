import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-apipay-signature'];
  const secret = process.env.APIPAY_WEBHOOK_SECRET;
  const body = JSON.stringify(req.body);

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { order_id, status, amount } = req.body;

  if (status !== 'paid') {
    return res.status(200).json({ ok: true });
  }

  const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;

  const response = await fetch(
    `https://thetamga.myshopify.com/admin/api/2024-01/orders/${order_id}/transactions.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: {
          kind: 'capture',
          status: 'success',
          amount: amount,
        },
      }),
    }
  );

  const data = await response.json();
  return res.status(200).json({ ok: true, data });
}

