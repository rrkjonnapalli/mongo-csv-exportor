const router = require('express').Router({ mergeParams: true });
const mongoose = require('mongoose');
const stream = require('stream');
const headers = require('./headers');

const populateMap = {
  client: 'name',
  transporter: 'name',
  vehicle: 'type'
};

const getValue = (doc, key) => {
  const val = doc[key];
  if (populateMap.hasOwnProperty(key)) {
    return val[0][populateMap[key]];
  }
  if (val instanceof Date) { return val.toISOString(); }
  return val;
};

function format(str, doc) {
  let s = str;
  for (const key of headers) {
    s = s.replace(new RegExp(`\\{${key}\\}`, 'gi'), getValue(doc, key) || '');
  }
  return s;
}

class CsvParser extends stream.Transform {
  constructor(client) {
    super({ objectMode: true });
    this.sentHeaders = false;
    this.client = client;
  }

  _transform(chunk, _encoding, next) {
    let result = '';
    if (!this.sentHeaders) {
      this.sentHeaders = true;
      result = `${headers.join('|')}\n`;
    }
    const doc = Object.assign(chunk, { client: [this.client] });
    result += format(`{${headers.join('}|{')}}\n`, doc);
    next(null, result);
  }
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

/**
 * http://localhost:8080/export?client=amazon&sd=2020-09-01&ed=2020-10-30
 */

// http://localhost:8080/export?client=amazon&sd=2016-01-01&ed=2020-10-02

router.get('/export', async (req, res) => {
  const { sd = '', ed = '' } = req.query || {};
  let { client = '' } = req.query || {};
  const startDate = new Date(sd);
  const endDate = new Date(ed);

  // basic validation
  client = client.trim();
  if (!client || !isValidDate(startDate) || !isValidDate(endDate)) {
    return res.status(400).send({
      ok: false,
      message: 'client(str), sd(date), ed(date) are required parameters'
        + '(Note: /export?client=amazon&sd=2020-09-01&ed=2020-10-30)'
    });
  }

  const clientResponse = await mongoose.model('Client')
    .findOne({ name: client }).then((c) => ({ ok: true, data: c }))
    .catch((err) => ({ ok: false, error: err }));

  if (!clientResponse.ok) {
    console.log(clientResponse.error);
    return res.status(500).send({ ok: false, message: 'Error while checking client' });
  }

  if (!clientResponse.data) {
    return res.status(404).send({ ok: false, message: 'Client not found' });
  }

  const clientId = clientResponse.data._id;
  const filename = `${client ? `${client}_` : ''}export_${Date.now()}.csv`;

  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.writeHead(200, { 'Content-Type': 'text/csv' });

  const query = {
    client: clientId,
    created_date: { $gte: startDate, $lt: endDate }
  };

  return mongoose.connection.db.collection('orders').aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle'
      }
    },
    {
      $lookup: {
        from: 'transporters',
        localField: 'transporter',
        foreignField: '_id',
        as: 'transporter'
      }
    }
  ]).pipe(new CsvParser(clientResponse.data)).pipe(res);
});

module.exports = router;
