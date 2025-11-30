import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'voucher.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initDatabase() {
  // Users table - Check if table exists and if it needs migration
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (tableInfo && !tableInfo.sql.includes("'admin'")) {
      // Table exists but doesn't have admin role - need to migrate
      console.log('Migrating users table to include admin role...');
      db.exec(`
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'gm', 'accountant', 'uploader1', 'uploader2')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db.exec(`
        INSERT INTO users_new (id, email, password, name, role, created_at)
        SELECT id, email, password, name, role, created_at FROM users
      `);
      db.exec('DROP TABLE users');
      db.exec('ALTER TABLE users_new RENAME TO users');
      console.log('Migration complete');
    } else {
      // Table doesn't exist or already has admin role - create normally
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'gm', 'accountant', 'uploader1', 'uploader2')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
  } catch (error) {
    // If error, just create the table normally
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'gm', 'accountant', 'uploader1', 'uploader2')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Vouchers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voucher_number TEXT UNIQUE NOT NULL,
      accountant_id INTEGER NOT NULL,
      gm_status TEXT DEFAULT 'pending' CHECK(gm_status IN ('pending', 'verified', 'rejected')),
      uploader_status TEXT DEFAULT 'pending' CHECK(uploader_status IN ('pending', 'approved', 'rejected')),
      uploader_id INTEGER,
      voucher_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      gm_verified_at DATETIME,
      uploader_verified_at DATETIME,
      FOREIGN KEY (accountant_id) REFERENCES users(id),
      FOREIGN KEY (uploader_id) REFERENCES users(id)
    )
  `);

  // Activity logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voucher_id INTEGER,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      old_status TEXT,
      new_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_voucher_id ON activity_logs(voucher_id);
  `);

  // Create default users if they don't exist
  const defaultUsers = [
    { email: 'admin@example.com', password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqO', name: 'Admin', role: 'admin' },
    { email: 'gm@example.com', password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqO', name: 'General Manager', role: 'gm' },
    { email: 'accountant@example.com', password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqO', name: 'Accountant', role: 'accountant' },
    { email: 'uploader1@example.com', password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqO', name: 'Uploader 1', role: 'uploader1' },
    { email: 'uploader2@example.com', password: '$2a$10$rOzJqKqKqKqKqKqKqKqKqO', name: 'Uploader 2', role: 'uploader2' }
  ];

  defaultUsers.forEach(user => {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
    if (!existing) {
      db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
        .run(user.email, user.password, user.name, user.role);
    }
  });

  console.log('Database initialized successfully');
}

export default db;

