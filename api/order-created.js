module.exports = async function handler(req, res) {
try {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const order = req.body;
console.log('ORDER RECEIVED:', JSON.stringify(order, null, 2));
const orderId = order.id;
const amount = order.total_price;
const phone =
  order.phone ||
  order.customer?.phone ||
  order.shipping_address?.phone ||
  order.billing_address?.phone ||
  '';
console.log('ORDER ID:', orderId);
console.log('AMOUNT:', amount);
console.log('PHONE:', phone);
const apiPayKey = process.env.APIPAY_API_KEY;
if (!apiPayKey) {
  console.error('APIPAY_API_KEY not found');
  return res.status(500).json({
    error: 'APIPAY_API_KEY not found'
  });
}
const payload = {
  amount,
  external_order_id: String(orderId),
  client_phone: phone,
};
console.log('PAYLOAD:', JSON.stringify(payload));
const response = await fetch(
  'https://apipay.kz/api/v1/invoices',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiPayKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
);
const text = await response.text();
console.log('APIPAY STATUS:', response.status);
console.log('APIPAY RESPONSE:', text);
return res.status(200).json({
  success: response.ok,
  apipay_status: response.status,
  apipay_response: text
});

} catch (error) {
console.error(‘ERROR:’, error);

return res.status(500).json({
  error: error.message
});

}
};