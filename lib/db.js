const PouchDB = require('pouchdb');

const db = new PouchDB('./data/db'); // TODO: napraviti potrebne mape i datoteke

module.exports = db;