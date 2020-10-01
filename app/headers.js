const headers = [
  '_id',
  'order_id',
  'client',
  'created_date',
  'transporter',
  'vehicle',
  'source',
  'destination',
  'price',
  'first_name',
  'last_name',
  'expected_delivery_on',
  'mobile_number',
  'alternate_number',
  'email',
  'product_name',
  'transaction_type',
  'currency_code',
  'zipcode'
];

for (let i = 1; i <= 100; i += 1) {
  headers.push(`f${i}`);
}

module.exports = headers;
