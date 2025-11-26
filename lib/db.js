const PouchDB = require('pouchdb');

const db = new PouchDB('./data/db');

module.exports = db;