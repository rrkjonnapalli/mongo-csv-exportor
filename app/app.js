const express = require('express')
const mongoose = require('./db');
const headers = require('./headers');

const app = express()
app.get('/ping', (_req, res) => {
  res.send('pong');
});
function getValue(val) {
  if (val instanceof Date)
    return val.toISOString();
  return val;
}
function format(str, doc) {
  for (let key of headers) {
    str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), getValue(doc[key]) || '');
  }
  return str;
};

/**
 * http://localhost:8080/export?client=amazon&sd=2020-09-01&ed=2020-10-30
 */
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

app.get('/export', async (req, res) => {
  let { client='', sd='', ed='' } = req.query || {};
  const start_date = new Date(sd);
  const end_date = new Date(ed);
  client = client.trim();
  if (!client || !isValidDate(start_date) || !isValidDate(end_date)) {
    return res.status(400).send({
      error: true,
      message: 'client(str), sd(date), ed(date) are required parameters'
        + '(Note: /export?client=amazon&sd=2020-09-01&ed=2020-10-30)'
    })
  }
  const filename = `${client ? client + '_' : ''}export_${Date.now()}.csv`;
  let sentHeaders = false;
  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.writeHead(200, { 'Content-Type': 'text/csv' });
  const query = {
    client: client,
    created_date: { $gte: start_date, $lt: end_date }
  };
  const cursor = mongoose.connection.db.collection('orders').find(query).stream({
    transform: (doc) => {
      let result = ''
      if (!sentHeaders) {
        sentHeaders = true;
        result = headers.join('|') + '\n';
      }
      return result + format('{' + headers.join('}|{') + '}\n', doc)
    }
  });
  cursor.pipe(res);
});

const port = 8080


const init = async () => {
  try {
    const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:7017';
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      dbName: 'pando',
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    });
    app.listen(port, () => {
      console.log('Server listening at port - %s', port)
    });
  } catch (error) {
    console.error('Error while initialization');
    console.error(error);
  }
}


init();