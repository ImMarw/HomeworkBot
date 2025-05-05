// database.js
const sqlite3 = require('sqlite3');
const path = require('path');

// Connect to the database (creates the file if it doesn't exist)
const dbPath = path.resolve(__dirname, 'homework.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;
