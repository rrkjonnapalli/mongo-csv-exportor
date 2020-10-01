const express = require('express');
const http = require('http');
const cors = require('cors');
const connection = require('./db');
const api = require('./api');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const unknownErrorHandler = (error) => {
  console.error('Unknown error occured', error);
  process.exit(0);
};

process.on('uncaughtException', unknownErrorHandler);
process.on('unhandledRejection', unknownErrorHandler);

app.get('/ping', (_req, res) => {
  res.send('pong');
});

const port = parseInt(process.env.PORT, 10) || 8080;

const onListening = () => {
  console.info('Server listening on port %d', port);
};

const onError = (error) => {
  console.error(error);
};

app.use('/', api);

const server = http.createServer(app);

if (require.main === module) {
  connection.connect()
    .then(() => {
      server.listen(port)
        .on('listening', onListening)
        .on('error', onError)
        .on('close', () => {
          connection.close();
        });
    }).catch((err) => {
      console.error(err);
      throw new Error('Error while connecting to mongo');
    });
}

module.exports = server;
