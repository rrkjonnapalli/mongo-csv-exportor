const mongoose = require('mongoose');

const clients = {
  amazon: {
    _id: new mongoose.Types.ObjectId(),
    name: 'amazon'
  },
  flipkart: {
    _id: new mongoose.Types.ObjectId(),
    name: 'flipkart'
  }
};
const vehicles = {
  van: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Maruthi',
    type: 'Van'
  },
  truck: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Tata',
    type: 'Truck'
  }
};

const transporters = {
  ekart: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Ekart'
  },
  dtdc: {
    _id: new mongoose.Types.ObjectId(),
    name: 'DTDC'
  }
};

const orders = [
  {
    order_id: 'amazon_1',
    client: clients.amazon._id,
    transporter: transporters.dtdc._id,
    vehicle: vehicles.van._id,
    created_date: new Date('2020-05-10'),
    price: 10000,
    source: 'Hyderabad',
    destination: 'Chennai'
  },
  {
    order_id: 'amazon_2',
    client: clients.amazon._id,
    transporter: transporters.ekart._id,
    vehicle: vehicles.truck._id,
    created_date: new Date('2020-09-10'),
    price: 8000,
    source: 'Hyderabad',
    destination: 'Kolkata'
  },
  {
    order_id: 'flipkart_1',
    client: clients.flipkart._id,
    transporter: transporters.dtdc._id,
    vehicle: vehicles.van._id,
    created_date: new Date('2020-07-10'),
    price: 5000,
    source: 'Kolkata',
    destination: 'Chennai'
  },
  {
    order_id: 'amazon_3',
    client: clients.amazon._id,
    transporter: transporters.dtdc._id,
    vehicle: vehicles.van._id,
    created_date: new Date('2020-08-10'),
    price: 10000,
    source: 'Hyderabad',
    destination: 'Chennai'
  }
];

module.exports = {
  clients,
  transporters,
  vehicles,
  orders
};
