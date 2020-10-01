const mongoose = require('mongoose');

/* initializing  models */
require('./models');

class Connection {
  constructor() {
    this.db = null;
    this.connection = null;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    };
    if (process.env.MONGO_USER) {
      this.options.auth = {
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD
      };
    }
    if (process.env.MONGO_POOL_SIZE) {
      this.options.poolSize = parseInt(process.env.MONGO_POOL_SIZE, 10);
    }
    if (process.env.MONGO_CONNECTION_TIMEOUT_MS) {
      this.options.connectTimeoutMS = parseInt(process.env.MONGO_CONNECTION_TIMEOUT_MS, 10);
    }
  }

  getConnectionOptions() {
    this.options.dbName = process.env.MONGO_DB_NAME || 'pando';
    return this.options;
  }

  async connect() {
    const self = this;
    const options = this.getConnectionOptions();
    const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:7017';
    return mongoose.connect(MONGO_CONNECTION_STRING, options).then(() => {
      self.db = mongoose.connection.db;
      self.connection = mongoose.connection;
    });
  }

  async close() {
    return this.connection.close();
  }
}

const connection = new Connection();

module.exports = connection;
module.exports.Connection = Connection;
