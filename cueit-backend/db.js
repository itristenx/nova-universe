// db.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("log.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT,
      name TEXT,
      email TEXT,
      title TEXT,
      system TEXT,
      urgency TEXT,
      timestamp TEXT,
      email_status TEXT
    )
  `);
});

module.exports = db;