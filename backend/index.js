const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./contacts.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL
)`);

// GET all contacts
app.get('/contacts', (req, res) => {
  db.all('SELECT * FROM contacts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET contact by ID
app.get('/contacts/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    row ? res.json(row) : res.status(404).json({ error: 'Contact not found' });
  });
});

// POST new contact
app.post('/contacts', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }
  db.run('INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, email, phone });
  });
});

// PUT update contact
app.put('/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  db.run(
    'UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      this.changes ? res.json({ id, name, email, phone }) : res.status(404).json({ error: 'Contact not found' });
    }
  );
});

// DELETE contact
app.delete('/contacts/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM contacts WHERE id = ?', id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    this.changes ? res.json({ message: 'Contact deleted' }) : res.status(404).json({ error: 'Contact not found' });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));