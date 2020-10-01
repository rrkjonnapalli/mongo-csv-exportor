const connection = require('./connection');
const testConnection = require('./test-connection');
const { TestConnection } = require('./test-connection');

module.exports = connection;
module.exports.testConnection = testConnection;
module.exports.TestConnection = TestConnection;
