module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order = req.body;
  const orderId = order.id;
  const amount = order.total_price;
  const phone = order.shipping_address?.phone || 
                order.billing_address?.phone || '';

  const apiPayKey = process.env.APIPAY_API_KEY;

  const response = await fetch('https://apipay.kz/api/v1/invoices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiPayKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      external_order_id: String(orderId),
      client_phone: phone,
    }),
  });

  const data = await response.json();
  return res.status(200).json({ ok: true, data });
};
