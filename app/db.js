const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  order_id: { type: mongoose.SchemaTypes.String, required: true },
  client: { type: mongoose.SchemaTypes.String, required: true },
  created_date: { type: mongoose.SchemaTypes.Date },
  transporter: { type: mongoose.SchemaTypes.String },
  vehicle_type: { type: mongoose.SchemaTypes.String },
  source: { type: mongoose.SchemaTypes.String },
  destination: { type: mongoose.SchemaTypes.String },
  price: { type: mongoose.SchemaTypes.Number }
}, {
  collection: 'orders',
  versionKey: false
});

OrderSchema.index({ client_name: 1, created_date: 1 })

mongoose.model('Order', OrderSchema);


module.exports = mongoose;