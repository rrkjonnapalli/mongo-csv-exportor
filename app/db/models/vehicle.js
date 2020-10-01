const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: { type: mongoose.SchemaTypes.String, required: true },
  type: { type: mongoose.SchemaTypes.String }
}, {
  collection: 'vehicles',
  versionKey: false
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;
