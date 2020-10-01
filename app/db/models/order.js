const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  order_id: { type: mongoose.SchemaTypes.String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Client' },
  transporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  created_date: { type: mongoose.SchemaTypes.Date },
  source: { type: mongoose.SchemaTypes.String },
  destination: { type: mongoose.SchemaTypes.String },
  price: { type: mongoose.SchemaTypes.Number }
}, {
  collection: 'orders',
  versionKey: false
});

OrderSchema.index({ client: 1, created_date: 1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
