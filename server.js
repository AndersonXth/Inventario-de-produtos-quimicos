// abrir servidor local
// const http = require('http')
// const fs = require('fs')
// const express = require('express')
// const app = express()
// app.use(express.static('public'))
// app.listen(8081,() => {console.log('servidor esta rodando na porta 8081')})

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port1 = process.env.PORT || 3000;
const port2 = process.env.PORT || 3001;

const db = new sqlite3.Database('cards.db');
const dbRelatorio = new sqlite3.Database('relatorio.db');


// Serve static files from the 'public' directory for both pages
app.use(express.static(path.join(__dirname, 'public')));

// Serve the first HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the second HTML page on a different port
app.get('/tela_do_tecnico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tela_do_tecnico.html'));
});

app.listen(port1, () => {
  console.log(`Server for Page 1 is running on port ${port1}`);
});

app.listen(port2, () => {
  console.log(`Server for Page 2 is running on port ${port2}`);
});

// ...
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS cards (reagente TEXT, numero TEXT, validade TEXT, quantidade TEXT, unidade TEXT)');
});

dbRelatorio.serialize(() => {
  dbRelatorio.run('CREATE TABLE IF NOT EXISTS relatorio (consumo TEXT, unidade TEXT, data_uso TEXT, motivo TEXT, id TEXT)');
});

app.use(express.json());

app.post('/saveCards', (req, res) => {
  const { cards } = req.body;
  db.serialize(() => {
    db.run('DELETE FROM cards');
    const stmt = db.prepare('INSERT INTO cards VALUES (?, ?, ?, ?, ?)');
    cards.forEach(card => {
      stmt.run(card.reagente, card.numero, card.validade, card.quantidade, card.unidade);
    });
    stmt.finalize();
    res.json({ message: 'Cards saved successfully' });
  });
});

app.get('/loadCards', (req, res) => {
  db.all('SELECT * FROM cards', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching cards' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/saveRelatorio', (req, res) => {
  const { relatorio } = req.body;
  dbRelatorio.serialize(() => {
    const stmt = dbRelatorio.prepare('INSERT INTO relatorio VALUES (?, ?, ?, ?, ?)');
    relatorio.forEach(dados => {
      try {
        stmt.run(dados.consumo, dados.unidade, dados.data_uso, dados.motivo, dados.id);
      } catch (error) {
        console.error('Error inserting data into relatorio:', error);
      }
    });
    stmt.finalize();
    res.json({ message: 'Relatorio saved successfully' });
  });
});

app.get('/loadRelatorio', (req, res) => {
  dbRelatorio.all('SELECT * FROM relatorio', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching relatorio' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/clearRelatorio', (req, res) => {
  dbRelatorio.serialize(() => {
    dbRelatorio.run('DELETE FROM relatorio', (err) => {
      if (err) {
        res.status(500).json({ error: 'Error clearing relatorio' });
      } else {
        res.json({ message: 'Relatorio cleared successfully' });
      }
    });
  });
});

