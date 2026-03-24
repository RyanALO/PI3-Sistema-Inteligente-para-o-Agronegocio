const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'agrotech.db');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    createTables(db);
  }

  return db;
}

function createTables(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      farm_name TEXT DEFAULT 'Fazenda AgroTech',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      temperature REAL,
      humidity REAL,
      soil_moisture REAL,
      pressure REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      severity TEXT DEFAULT 'warning',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      device_id TEXT,
      resolved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Auto-save every 30 seconds
setInterval(saveDb, 30000);

// Save on exit
process.on('exit', saveDb);
process.on('SIGINT', () => { saveDb(); process.exit(); });

module.exports = { getDb, saveDb };
