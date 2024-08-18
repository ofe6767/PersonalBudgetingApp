const sqlite3 = require('sqlite3').verbose();
const path = require('path'); 
const dbPath = path.resolve(__dirname, 'newDatabase.db');

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database at', dbPath);
    }
});

module.exports = db;
