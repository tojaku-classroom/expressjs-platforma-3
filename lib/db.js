const Database = require('better-sqlite3');
const path = require('path');

// Konfiguracija baze podataka
const dbPath = path.join(__dirname, "..", process.env.DATABASE_PATH);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
console.log('Connected to SQLite database');

// Inicijalizacija testnih podataka
function init() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS test (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT
        )
    `);

    const insert = db.prepare(`
        INSERT OR IGNORE INTO test (id, title, description)
            VALUES (?, ?, ?)
    `);
    insert.run(1, 'Prvi unos', 'Ovo je prvi testni unos');
    insert.run(2, 'Drugi unos', 'Ovo je još jedan testni unos');
}
init();

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