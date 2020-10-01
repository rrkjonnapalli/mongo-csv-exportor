const mongoose = require('mongoose');
const { Connection } = require('./connection');

class TestConnection extends Connection {
  getConnectionOptions() {
    this.options.dbName = process.env.MONGO_DB_NAME
      ? `test_${process.env.MONGO_DB_NAME}`
      : 'test_pando';
    this.options.autoIndex = false;
    return this.options;
  }

  async clearDB() {
    return this.db.listCollections().toArray().then(async (collections) => {
      for (const collection of collections) {
        console.log('Clearing %s', collection.name);
        await mongoose.connection.db.dropCollection(collection.name);
      }
      return collections;
    });
  }
}

const testConnection = new TestConnection();

module.exports = testConnection;
module.exports.TestConnection = TestConnection;
