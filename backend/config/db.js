// backend/config/db.js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../database/marketplace.db'), {
  verbose: console.log
});

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ SQLite connected — marketplace.db created!');

module.exports = db;