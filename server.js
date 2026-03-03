const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'cards.json');

// Middleware
app.use(cors());
app.use(express.json());

// Body-Parser Fehler abfangen (z.B. ungueltiges JSON)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    console.error('JSON Parse Error:', err.message, '| Raw body attempt from:', req.ip);
    return res.status(400).json({ error: 'Ungueltiges JSON im Request-Body. Bitte versuche es erneut.' });
  }
  next(err);
});

app.use(express.static(path.join(__dirname, 'public')));

// Daten-Verzeichnis sicherstellen
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Daten laden/speichern
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { cards: [], greetings: [], reactions: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ========== API ENDPOINTS ==========

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Cards ---

// GET /api/cards - Alle Karten
app.get('/api/cards', (req, res) => {
  const data = loadData();
  res.json(data.cards);
});

// GET /api/cards/:id - Einzelne Karte mit Gruessen
app.get('/api/cards/:id', (req, res) => {
  const data = loadData();
  const card = data.cards.find(c => c.id === req.params.id);
  if (!card) {
    return res.status(404).json({ error: 'Karte nicht gefunden' });
  }
  const greetings = data.greetings.filter(g => g.cardId === card.id);
  const reactions = data.reactions.filter(r =>
    greetings.some(g => g.id === r.greetingId)
  );
  res.json({ card, greetings, reactions });
});

// POST /api/cards - Neue Karte erstellen
app.post('/api/cards', (req, res) => {
  const { title, recipientName, createdBy } = req.body;
  if (!recipientName || !createdBy) {
    return res.status(400).json({ error: 'recipientName und createdBy sind Pflichtfelder' });
  }
  const data = loadData();
  const card = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    title: title || `Abschiedskarte fuer ${recipientName}`,
    recipientName,
    createdBy,
    createdAt: new Date().toISOString(),
    theme: 'pinnwand',
    isActive: true
  };
  data.cards.push(card);
  saveData(data);
  res.status(201).json(card);
});

// --- Greetings ---

// POST /api/cards/:id/greetings - Gruss hinterlassen
app.post('/api/cards/:id/greetings', (req, res) => {
  const { author, message, emoji } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message ist ein Pflichtfeld' });
  }
  const data = loadData();
  const card = data.cards.find(c => c.id === req.params.id);
  if (!card) {
    return res.status(404).json({ error: 'Karte nicht gefunden' });
  }
  const greeting = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    cardId: card.id,
    author: author || 'Anonym',
    message: message.trim(),
    emoji: emoji || null,
    timestamp: new Date().toISOString(),
    color: getRandomColor()
  };
  data.greetings.push(greeting);
  saveData(data);
  res.status(201).json(greeting);
});

// --- Reactions ---

// POST /api/greetings/:id/reactions - Auf Gruss reagieren
app.post('/api/greetings/:id/reactions', (req, res) => {
  const { type, authorName } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'type ist ein Pflichtfeld' });
  }
  const data = loadData();
  const greeting = data.greetings.find(g => g.id === req.params.id);
  if (!greeting) {
    return res.status(404).json({ error: 'Gruss nicht gefunden' });
  }
  const reaction = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    greetingId: greeting.id,
    type,
    authorName: authorName || 'Anonym',
    timestamp: new Date().toISOString()
  };
  data.reactions.push(reaction);
  saveData(data);
  res.status(201).json(reaction);
});

// Zufaellige Pastellfarbe fuer Pinnwand-Karten
function getRandomColor() {
  const colors = [
    '#FFE0B2', '#FFCCBC', '#F8BBD0', '#E1BEE7', '#D1C4E9',
    '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB',
    '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Server starten
app.listen(PORT, () => {
  console.log(`Greatings Server laeuft auf http://localhost:${PORT}`);
});
