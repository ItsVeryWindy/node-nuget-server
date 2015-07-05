var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

var SQLiteDatabase = require('./nuget-sqlite');

module.exports = new SQLiteDatabase(db);