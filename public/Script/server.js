const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up SQLite database connection
const db = new sqlite3.Database('reagents.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the reagents database.');
    // Create the table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS reagents (
        id INTEGER PRIMARY KEY,
        reagente TEXT,
        numero TEXT,
        validade TEXT,
        quantidade TEXT,
        unidade TEXT
      );
    `);
  }
});

app.use(express.json());

// Save a new card to the database
app.post('/addCard', (req, res) => {
  const card = req.body;

  db.run(
    'INSERT INTO reagents (reagente, numero, validade, quantidade, unidade) VALUES (?, ?, ?, ?, ?)',
    [card.reagente, card.numero, card.validade, card.quantidade, card.unidade],
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error saving card to database.');
      } else {
        res.status(200).send('Card saved to database.');
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
