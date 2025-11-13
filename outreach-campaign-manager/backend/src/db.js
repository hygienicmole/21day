import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../database.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  console.log('Initializing database...');

  // Create tables
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Campaigns table
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      industry TEXT,
      goal TEXT,
      start_date DATE NOT NULL,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Contacts table
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      whatsapp TEXT,
      company TEXT,
      title TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    );

    -- Sequence Steps table
    CREATE TABLE IF NOT EXISTS sequence_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    );

    -- Touchpoints (execution log)
    CREATE TABLE IF NOT EXISTS touchpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL,
      sequence_step_id INTEGER NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'sent',
      response TEXT,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (sequence_step_id) REFERENCES sequence_steps(id) ON DELETE CASCADE
    );

    -- Templates library
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_campaign_id ON contacts(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_sequence_steps_campaign_id ON sequence_steps(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_touchpoints_contact_id ON touchpoints(contact_id);
    CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
  `);

  console.log('Database initialized successfully');
}

// Initialize database if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
  console.log('Database setup complete!');
  process.exit(0);
}

export default db;
