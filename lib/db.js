const Database = require('better-sqlite3');
const path = require('path');

// Konfiguracija baze podataka
const dbPath = path.join(__dirname, "..", process.env.DATABASE_PATH);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Pomoćne funkcije
db.getAll = (table) => {
    const stmt = db.prepare(`SELECT *  FROM ${table}`);
    return stmt.all();
}

db.middleware = (req, res, next) => {
    req.db = db;
    next();
}

module.exports = db;