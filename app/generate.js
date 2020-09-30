const faker = require('faker');
const mongoose = require('./db');

const RECORD_COUNT = parseInt(process.env.RC) || 10000;
const BATCH_SIZE = process.env.BATCH_SIZE || 1000;
const clients = [
  'amazon',
  'flipkart',
  'ebay',
  'walmart',
  'ikea'
];
let clientCounter = {
  'amazon': 1,
  'flipkart': 1,
  'ebay': 1,
  'walmart': 1,
  'ikea': 1
};

const getOrder = (client) => {
  return {
    order_id: client + '_' + clientCounter[client]++,
    client,
    created_date: faker.date.between(new Date('2018-01-01'), new Date('2020-09-30')),
    transporter: faker.company.companyName(),
    vehicle_type: faker.vehicle.type(),
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
};

const bulkOpErrorHandler = (err) => {
  console.error('Error while executing bulkop');
  console.error(err);
  mongoose.connection.close();
  process.exit(0);
}

const generateData = async () => {
  console.log('Generating %d records', RECORD_COUNT);
  let bulkOp = mongoose.connection.db.collection('orders').initializeUnorderedBulkOp();
  let i = 0;
  while (i < RECORD_COUNT) {
    bulkOp.insert(getOrder(clients[i % clients.length]));
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
};

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:7017';
mongoose.connect(MONGO_CONNECTION_STRING, {
  dbName: 'pando',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => {
  return generateData();
}).then(() => {
  console.log('Successfully generated %d records', RECORD_COUNT);
  mongoose.connection.close();
}).catch((err) => {
  console.error('Error while connecting to mongo');
  console.error(err);
});