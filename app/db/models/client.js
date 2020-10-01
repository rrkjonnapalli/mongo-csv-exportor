const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: mongoose.SchemaTypes.String, required: true }
}, {
  collection: 'clients',
  versionKey: false
});

ClientSchema.index({ name: 1 }, { unique: true });

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
