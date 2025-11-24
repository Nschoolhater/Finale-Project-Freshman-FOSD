const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('survey.db');

console.log('=== Survey Responses ===\n');

// Get all responses
db.all('SELECT * FROM survey_responses ORDER BY created_at DESC', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  if (rows.length === 0) {
    console.log('No survey responses found.\n');
  } else {
    rows.forEach((row, index) => {
      console.log(`Response #${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Name: ${row.name}`);
      console.log(`  Email: ${row.email}`);
      console.log(`  Age: ${row.age || 'N/A'}`);
      console.log(`  Diet: ${row.diet || 'N/A'}`);
      console.log(`  Medical Problems: ${row.medical_problems === '1' ? 'Yes' : row.medical_problems === '2' ? 'No' : 'N/A'}`);
      console.log(`  Favorite Meal: ${row.favorite_meal || 'N/A'}`);
      console.log(`  Restaurant: ${row.restaurant || 'N/A'}`);
      console.log(`  Experience: ${row.experience || 'N/A'}`);
      console.log(`  No Sue: ${row.no_sue ? 'Yes' : 'No'}`);
      console.log(`  Will Sue: ${row.will_sue ? 'Yes' : 'No'}`);
      console.log(`  Created: ${row.created_at}`);
      console.log('---\n');
    });
    console.log(`Total responses: ${rows.length}`);
  }

  db.close();
});

