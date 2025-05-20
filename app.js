const express = require('express');
const app = express();
const path = require('path');

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// In-memory database
const urlDatabase = {};

// Generate short code
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Routes
app.get('/', (req, res) => res.render('index'));

app.post('/shorten', (req, res) => {
  const longUrl = req.body.longUrl;
  
  try {
    new URL(longUrl);
  } catch {
    return res.render('index', { error: 'Please enter a valid URL' });
  }

  const shortCode = generateShortCode();
  urlDatabase[shortCode] = longUrl;
  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  
  res.render('result', { shortUrl });
});

app.get('/:code', (req, res) => {
  const longUrl = urlDatabase[req.params.code];
  longUrl ? res.redirect(longUrl) : res.status(404).send('URL not found');
});

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access locally: http://localhost:${PORT}`);
});

module.exports = app;