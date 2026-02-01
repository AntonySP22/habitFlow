export const CREATE_HABITS_TABLE = `
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL,
    color TEXT DEFAULT '#6366F1',
    icon TEXT DEFAULT 'checkmark-circle',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_HABIT_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status INTEGER DEFAULT 0,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  );
`;

export const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366F1',
    icon TEXT DEFAULT 'folder'
  );
`;

export const INSERT_DEFAULT_CATEGORIES = `
  INSERT OR IGNORE INTO categories (name, color, icon) VALUES
    ('Salud', '#10B981', 'heart'),
    ('Académico', '#6366F1', 'school'),
    ('Físico', '#F59E0B', 'fitness'),
    ('Personal', '#EC4899', 'person'),
    ('Trabajo', '#3B82F6', 'briefcase');
`;
