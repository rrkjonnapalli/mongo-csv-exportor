const { testConnection } = require('./db');
const server = require('./app');

testConnection.connect()
  .then(() => {
    server.listen(8081);
    // console.log('End');
    // testConnection.close();
  });
