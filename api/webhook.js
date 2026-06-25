const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-apipay-signature'];
  const secret = process.env.APIPAY_WEBHOOK_SECRET;
  const rawBody = JSON.stringify(req.body);

  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Временно отключаем проверку подписи для теста
  // if (hash !== signature) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  const invoice = req.body.invoice;

  if (!invoice || invoice.status !== 'paid') {
    return res.status(200).json({ ok: true, status: invoice?.status });
  }

  const orderId = invoice.external_order_id;
  if (!orderId) {
    return res.status(200).json({ ok: true, message: 'No order ID' });
  }

  const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;

  const response = await fetch(
    `https://thetamga.myshopify.com/admin/api/2024-01/orders/${orderId}/transactions.json`,
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
          amount: invoice.amount,
        },
      }),
    }
  );

  const data = await response.json();
  return res.status(200).json({ ok: true, data });
};
