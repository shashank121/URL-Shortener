const express = require('express');
const path = require('path');
const app = express();

// Configure middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'public')));

// Configure view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory database
const urlDatabase = {};

// Generate short code
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Get base URL
const getBaseUrl = (req) => {
  if (process.env.VERCEL) {
    return `https://${req.get('host')}`;
  }
  return `${req.protocol}://${req.get('host')}`;
};

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/shorten', (req, res) => {
  try {
    const longUrl = req.body.longUrl;
    new URL(longUrl); // Validate URL
    
    const shortCode = generateShortCode();
    urlDatabase[shortCode] = longUrl;
    const baseUrl = getBaseUrl(req);
    const shortUrl = `${baseUrl}/${shortCode}`;
    
    res.render('result', { shortUrl });
    
  } catch (error) {
    res.render('index', { error: 'Invalid URL format. Please include http:// or https://' });
  }
});

app.get('/:code', (req, res) => {
  const longUrl = urlDatabase[req.params.code];
  longUrl ? res.redirect(longUrl) : res.status(404).send('URL not found');
});

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;
