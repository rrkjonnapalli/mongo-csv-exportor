/* globals before, after, describe, it */
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { testConnection } = require('../db');
const server = require('../app');

const should = chai.should();
const {
  clients, transporters, vehicles, orders
} = require('./data');

chai.use(chaiHttp);

const dataPaser = (res, cb) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => { cb(null, Buffer.from(data, 'utf-8')); });
};

describe('API', function describeAPI() {
  this.timeout(20000);

  before((done) => {
    const Order = mongoose.model('Order');
    const Vehicle = mongoose.model('Vehicle');
    const Transporter = mongoose.model('Transporter');
    const Client = mongoose.model('Client');

    testConnection
      .connect()
      .then(() => testConnection.clearDB())
      .then(() => Client.insertMany([clients.amazon, clients.flipkart])) // create clients
      .then(() => Vehicle.insertMany([vehicles.van, vehicles.truck])) // create vehicles
      .then(() => Transporter.insertMany([transporters.dtdc, transporters.ekart])) // create transporters
      .then(() => Order.insertMany(orders)) // create orders
      .then(() => done());
  });
  describe('/ping', () => {
    it('should return pong', (done) => {
      chai.request(server)
        .get('/ping')
        .end((err, res) => {
          should.not.exist(err);
          res.text.should.be.eql('pong');
          done();
        });
    });
  });

  describe('/export', () => {
    it('should return status 400 when client name or start date or end date not passed', (done) => {
      chai.request(server)
        .get('/export')
        .end((_err, res) => {
          res.status.should.be.eql(400);
          done();
        });
    });
    it('should return status 400 when invalid client name or start date or end date passed', (done) => {
      chai.request(server)
        .get('/export?client=me&sd=hello&ed=2020-10-01')
        .end((_err, res) => {
          res.status.should.be.eql(400);
          done();
        });
    });

    it('should return status 404 when called with a non existing client name', (done) => {
      chai.request(server)
        .get('/export?client=me&sd=2020-08-01&ed=2020-10-01')
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.be.eql(404);
          done();
        });
    });

    it('should return a csv file with order records when called with a valid details are passed', (done) => {
      chai.request(server)
        .get(`/export?client=${clients.flipkart.name}&sd=2020-06-01&ed=2020-10-01`)
        .buffer()
        .parse(dataPaser)
        .end((_err, res) => {
          const result = res.body.toString();
          const flipkartClientOccruances = result.split(`|${clients.flipkart.name}|`).length - 1;
          const amazonClientOccruances = result.split(`|${clients.amazon.name}|`).length - 1;
          flipkartClientOccruances.should.be.eql(1);
          amazonClientOccruances.should.be.eql(0);
          res.status.should.be.eql(200);
          done();
        });
    });

    it('should return a csv file with order records when called with a valid details are passed', (done) => {
      chai.request(server)
        .get(`/export?client=${clients.amazon.name}&sd=2020-04-01&ed=2020-08-15`)
        .buffer()
        .parse(dataPaser)
        .end((_err, res) => {
          const result = res.body.toString();
          const amazonClientOccruances = result.split(`|${clients.amazon.name}|`).length - 1;
          const flipkartClientOccruances = result.split(`|${clients.flipkart.name}|`).length - 1;
          amazonClientOccruances.should.be.eql(2);
          flipkartClientOccruances.should.be.eql(0);
          res.status.should.be.eql(200);
          done();
        });
    });

    it('should return a csv file with order records when called with a valid details are passed', (done) => {
      chai.request(server)
        .get(`/export?client=${clients.amazon.name}&sd=2020-10-01&ed=2020-11-15`)
        .buffer()
        .parse(dataPaser)
        .end((_err, res) => {
          const result = res.body.toString();
          const amazonClientOccruances = result.split(`|${clients.amazon.name}|`).length - 1;
          const flipkartClientOccruances = result.split(`|${clients.flipkart.name}|`).length - 1;
          amazonClientOccruances.should.be.eql(0);
          flipkartClientOccruances.should.be.eql(0);
          res.status.should.be.eql(200);
          done();
        });
    });
  });

  after((done) => {
    testConnection.clearDB()
      .then(() => testConnection.close())
      .then(() => done());
  });
});
