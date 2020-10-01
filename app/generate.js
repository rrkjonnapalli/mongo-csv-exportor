const faker = require('faker');
const mongoose = require('mongoose');
const connection = require('./db');

const { Types } = mongoose;

const RECORD_COUNT = parseInt(process.env.RC, 10) || 10000;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 1000;
const TRANSPORTER_COUNT = parseInt(process.env.TRANSPORTER_COUNT, 10) || 3;
const VEHICLE_COUNT = parseInt(process.env.VEHICLE_COUNT, 10) || 3;

let clientNames = [
  'amazon',
  'flipkart',
  'ebay',
  'walmart',
  'ikea'
];

const clientCounter = {
  amazon: 1,
  flipkart: 1,
  ebay: 1,
  walmart: 1,
  ikea: 1
};

let vehicles = [];
let clients = [];
let transporters = [];

const bulkOpErrorHandler = (err) => {
  console.error('Error while executing bulkop');
  console.error(err);
  connection.close();
  process.exit(0);
};

const getOrder = (ix) => {
  const clientName = clientNames[ix % clients.length];
  const client = clients[ix % clients.length];
  const vehicle = vehicles[ix % vehicles.length];
  const transporter = transporters[ix % transporters.length];
  const order = {
    order_id: `${clientName}_${clientCounter[clientName]}`,
    client,
    created_date: faker.date.between(new Date('2018-01-01'), new Date('2020-09-30')),
    transporter,
    vehicle,
    source: faker.address.city(),
    destination: faker.address.city(),
    price: faker.commerce.price(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    expected_delivery_on: faker.date.future(),
    mobile_number: faker.phone.phoneNumber(),
    alternate_number: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    product_name: faker.commerce.product(),
    transaction_type: faker.finance.transactionType(),
    currency_code: faker.finance.currencyCode(),
    zipcode: faker.address.zipCode()
  };
  clientCounter[clientName] += 1;
  for (let i = 1; i <= 100; i += 5) {
    order[`f${i}`] = faker.random.word();
    order[`f${i + 1}`] = faker.random.words();
    order[`f${i + 2}`] = faker.random.float();
    order[`f${i + 3}`] = faker.random.number();
    order[`f${i + 4}`] = faker.random.uuid();
  }
  return order;
};

class Generator {
  static async generateClients() {
    const Client = mongoose.model('Client');
    return Client
      .find({ name: { $in: clientNames } }, { name: 1 })
      .then((rows) => {
        if (rows.length > 0) {
          clients = rows.map((r) => r._id);
          clientNames = rows.map((r) => r.name);
          return Promise.resolve();
        }
        const records = [];
        for (let i = 0; i < clientNames.length; i += 1) {
          records.push({
            _id: new Types.ObjectId(),
            name: clientNames[i]
          });
        }
        clients = records.map((r) => r._id);
        return Client.insertMany(records)
          .catch((err) => {
            console.error(err);
            throw new Error('Error while inserting clients');
          });
      });
  }

  static async generateVehicles() {
    const records = [];
    for (let i = 0; i < VEHICLE_COUNT; i += 1) {
      records.push({
        _id: new Types.ObjectId(),
        name: faker.vehicle.manufacturer(),
        type: faker.vehicle.type()
      });
    }
    vehicles = records.map((r) => r._id);
    return mongoose.model('Vehicle')
      .insertMany(records)
      .catch((err) => {
        console.error(err);
        throw new Error('Error while inserting vehicles');
      });
  }

  static async generateTransporters() {
    const records = [];
    for (let i = 0; i < TRANSPORTER_COUNT; i += 1) {
      records.push({
        _id: new Types.ObjectId(),
        name: faker.company.companyName()
      });
    }
    transporters = records.map((r) => r._id);
    return mongoose.connection.db.collection('transporters')
      .insertMany(records)
      .catch((err) => {
        console.error(err);
        throw new Error('Error while inserting transporters');
      });
  }

  static async generateOrders() {
    console.log('Generating %d records', RECORD_COUNT);
    let bulkOp = mongoose.connection.db.collection('orders').initializeUnorderedBulkOp();
    let i = 0;
    while (i < RECORD_COUNT) {
      bulkOp.insert(getOrder(i));
      i += 1;
      if (i % BATCH_SIZE === 0) {
        console.log('Generated %d records...', i);
        await bulkOp.execute().catch(bulkOpErrorHandler);
        bulkOp = mongoose.connection.db.collection('orders').initializeUnorderedBulkOp();
      }
    }
    if (i % BATCH_SIZE !== 0) {
      await bulkOp.execute().catch(bulkOpErrorHandler);
    }
  }

  static generateData() {
    console.log('Generating clients');
    return Generator.generateClients().then(() => {
      console.log('Generating vehicles');
      return Generator.generateVehicles();
    }).then(() => {
      console.log('Generating transporters');
      return Generator.generateTransporters();
    }).then(() => {
      console.log('Generating orders');
      return Generator.generateOrders();
    });
  }
}

connection.connect().then(() => {
  console.log('Connected to db');
  return Generator.generateData();
}).then(() => {
  console.log('Successfully generated %d records', RECORD_COUNT);
  connection.close();
}).catch((err) => {
  console.error(err);
});
