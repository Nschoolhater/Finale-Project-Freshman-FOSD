const http = require('http');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('survey.db');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/submit') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Insert into database
        db.run(`
          INSERT INTO survey_responses 
          (name, email, age, diet, medical_problems, favorite_meal, restaurant, experience, no_sue, will_sue)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.name || '',
          data.email || '',
          data.age || null,
          data.diet || '',
          data.medical || '',
          data.favorite_meal || '',
          data.restaurant || '',
          data.experience || '',
          data.no_sue ? 1 : 0,
          data.will_sue ? 1 : 0
        ], function(err) {
          if (err) {
            console.error('Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Survey submitted successfully!' }));
          }
        });
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/responses') {
    db.all('SELECT * FROM survey_responses ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit();
});

