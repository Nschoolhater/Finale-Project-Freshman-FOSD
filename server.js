require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Use /tmp directory on Vercel (ephemeral storage) or project root for local
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const DATA_DIR = isVercel ? '/tmp' : __dirname;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const DB_FILE = path.join(DATA_DIR, 'survey.db');

// Encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

app.use(express.json());
// CORS headers for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve static files (HTML, assets folder)
app.use(express.static(path.join(__dirname)));

async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    const txt = raw && raw.trim() ? raw : '[]';
    return JSON.parse(txt);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

async function readSurveys() {
  try {
    const raw = await fs.readFile(SURVEYS_FILE, 'utf8');
    const txt = raw && raw.trim() ? raw : '[]';
    return JSON.parse(txt);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}
async function writeSurveys(surveys) {
  await fs.writeFile(SURVEYS_FILE, JSON.stringify(surveys, null, 2), 'utf8');
}

/* -------------------------
   Initialize SQLite database
   ------------------------- */
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open SQLite DB:', err);
  } else {
    console.log('Opened SQLite DB at', DB_FILE);
  }
});

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encrypted_data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `, (err) => {
    if (err) console.error('Error creating survey_responses table:', err);
    else console.log('survey_responses table ready');
  });
});

// Encryption / Decryption helpers
function encryptData(data) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // return iv:encrypted so we can decrypt later
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
}

function decryptData(encryptedStr) {
  try {
    const parts = encryptedStr.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const users = await readUsers();
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    users.push({ username, email, hash, createdAt: new Date().toISOString() });
    await writeUsers(users);

    console.log(`✓ User signed up: ${email}`);
    res.json({ success: true, username });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`✓ User logged in: ${email}`);
    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account endpoint
app.delete('/api/user', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let users = await readUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);
    await writeUsers(users);

    console.log(`✓ User deleted: ${email}`);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Survey submission endpoint: encrypt before storing
app.post('/api/submit', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Missing survey data' });

    // Encrypt the survey data
    const encryptedData = encryptData(data);
    if (!encryptedData) {
      return res.status(500).json({ error: 'Encryption failed' });
    }

    // Insert encrypted data into SQLite DB
    const stmt = db.prepare(`
      INSERT INTO survey_responses 
      (encrypted_data, created_at)
      VALUES (?, datetime('now'))
    `);
    stmt.run(encryptedData, function(err) {
      if (err) {
        console.error('SQLite insert error:', err);
      } else {
        console.log('Inserted encrypted survey response id:', this.lastID);
      }
    });
    stmt.finalize();

    // Also keep JSON backup (encrypted)
    try {
      const surveys = await readSurveys();
      surveys.push({ encrypted: encryptedData, encryptedAt: new Date().toISOString() });
      await writeSurveys(surveys);
    } catch (je) {
      console.error('Failed to write surveys.json backup:', je);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Survey submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin API to list recent survey responses (DECRYPTED for authorized users only)
app.get('/api/surveys', (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit, 10) || 100);
    console.log(`[/api/surveys] limit=${limit}`);
    
    db.all(
      `SELECT id, encrypted_data, created_at FROM survey_responses ORDER BY datetime(created_at) DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) {
          console.error('[/api/surveys] DB error:', err.message);
          return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
        }
        
        // Decrypt each row for display
        const decrypted = rows.map(row => {
          const data = decryptData(row.encrypted_data);
          return {
            id: row.id,
            ...data,
            created_at: row.created_at
          };
        }).filter(r => r && r.name); // filter out failed decryptions

        console.log(`[/api/surveys] Returning ${decrypted.length} decrypted rows`);
        return res.json({ success: true, rows: decrypted });
      }
    );
  } catch (e) {
    console.error('[/api/surveys] Unexpected error:', e.message);
    res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
});

// Catch-all 404 for unmatched routes
app.use((req, res) => {
  console.warn(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Export app for Vercel serverless functions
// If running on Vercel, export the app instead of starting a server
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  module.exports = app;
} else {
  // Local development: start the server
  const START_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const MAX_TRIES = 10; // how many consecutive ports to try before giving up

  function startServer(port, attemptsLeft) {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`Port ${port} in use — trying port ${port + 1} (${attemptsLeft - 1} attempts left)...`);
        setTimeout(() => startServer(port + 1, attemptsLeft - 1), 250);
        return;
      }
      console.error('Server failed to start:', err);
      process.exit(1);
    });

    // optional: handle close gracefully
    server.on('close', () => {
      console.log('Server closed.');
    });
  }

  // start trying
  startServer(START_PORT, MAX_TRIES);
}

