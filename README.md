# Survey App with SQLite

This project uses Node.js and SQLite to store survey form submissions.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

4. Open `Bun-Site.html` in your browser to use the survey form.

## API Endpoints

- `POST /submit` - Submit survey form data
- `GET /responses` - Get all survey responses

## Database

The SQLite database file `survey.db` will be created automatically when you run `init-db.js`. It contains a `survey_responses` table with all form fields.

### Viewing the Database

**Option 1: Using the view script (easiest)**
```bash
npm run view-db
```
or
```bash
node view_db.js
```

**Option 2: Using SQLite command line**
If you have SQLite installed:
```bash
sqlite3 survey.db
```
Then run SQL commands like:
```sql
SELECT * FROM survey_responses;
.tables
.schema survey_responses
.quit
```

**Option 3: Using a GUI tool**
- **DB Browser for SQLite** (free): https://sqlitebrowser.org/
- **SQLiteStudio** (free): https://sqlitestudio.pl/
- **VS Code Extension**: Install "SQLite Viewer" extension

**Option 4: Via API**
```bash
curl http://localhost:3000/responses
```

