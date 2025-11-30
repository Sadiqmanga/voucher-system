import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/voucher.db');
const db = new Database(dbPath);

try {
  console.log('Fixing user deletion constraints...');
  
  // Get existing data
  const existingLogs = db.prepare('SELECT * FROM activity_logs').all();
  console.log(`Found ${existingLogs.length} activity logs to preserve`);
  
  // Drop and recreate activity_logs table with CASCADE delete
  db.exec('DROP TABLE IF EXISTS activity_logs');
  
  db.exec(`
    CREATE TABLE activity_logs (
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
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_voucher_id ON activity_logs(voucher_id);
  `);
  
  // Restore existing logs if any
  if (existingLogs.length > 0) {
    const insert = db.prepare(`
      INSERT INTO activity_logs (id, voucher_id, user_id, user_name, user_role, action, description, old_status, new_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const log of existingLogs) {
      insert.run(
        log.id,
        log.voucher_id,
        log.user_id,
        log.user_name,
        log.user_role,
        log.action,
        log.description,
        log.old_status,
        log.new_status,
        log.created_at
      );
    }
    console.log(`Restored ${existingLogs.length} activity logs`);
  }
  
  console.log('✅ User deletion constraints fixed successfully!');
  console.log('   Users can now be deleted, and their activity logs will be automatically removed.');
  
} catch (error) {
  console.error('Error fixing constraints:', error);
  process.exit(1);
} finally {
  db.close();
}

