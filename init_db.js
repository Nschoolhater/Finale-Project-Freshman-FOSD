const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('survey.db');

// Create the survey responses table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      age INTEGER,
      diet TEXT,
      medical_problems TEXT,
      favorite_meal TEXT,
      restaurant TEXT,
      experience TEXT,
      no_sue INTEGER DEFAULT 0,
      will_sue INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Database initialized successfully!');
    }
    db.close();
  });
});

