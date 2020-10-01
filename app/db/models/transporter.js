const mongoose = require('mongoose');

const TransporterSchema = new mongoose.Schema({
  name: { type: mongoose.SchemaTypes.String, required: true }
}, {
  collection: 'transporters',
  versionKey: false
});

const Transporter = mongoose.model('Transporter', TransporterSchema);

module.exports = Transporter;
