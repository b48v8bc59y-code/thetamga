module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const order = req.body;

    console.log('ORDER:', JSON.stringify(order, null, 2));

    const orderId = order.id;
    const amount = Number(order.total_price);

    const phone =
      order.shipping_address?.phone ||
      order.billing_address?.phone ||
      order.customer?.default_address?.phone ||
      '';

    console.log('PHONE:', phone);
    console.log('AMOUNT:', amount);
    console.log('API KEY EXISTS:', !!process.env.APIPAY_API_KEY);

    const response = await fetch(
      'https://apipay.kz/api/v1/invoices',
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.APIPAY_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          phone_number: phone,
          external_order_id: String(orderId),
        }),
      }
    );

    const data = await response.json();

    console.log('APIPAY STATUS:', response.status);
    console.log('APIPAY RESPONSE:', JSON.stringify(data));

    return res.status(200).json({
      success: true,
      phone,
      amount,
      apipay: data,
    });
  } catch (error) {
    console.error('ERROR:', error);

    return res.status(500).json({
      error: error.message,
    });
  }
};