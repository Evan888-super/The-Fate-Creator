require('dotenv').config({ debug: false }); // Keep false in prod to avoid logging secrets

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*' // Lock this down in production to your frontend domain
}));
app.use(express.json({ limit: '10mb' }));

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.GROK_API_KEY;

console.log('GROK_API_KEY loaded:', API_KEY ? 'Yes (masked for security)' : 'NO – Check server/.env');

if (!API_KEY) {
  console.error('🚨 Server starting, but GROK_API_KEY is missing – /api/grok will fail');
}

// Health check – this is what fixes "Cannot GET /"
app.get('/', (req, res) => {
  res.send('🟢 The Fate Creator proxy is LIVE and ready to channel Grok. Rewrite history at will, sir.');
});

app.post('/api/grok', async (req, res) => {
  console.log('Incoming Grok request:', req.body?.model, '- messages:', req.body?.messages?.length);

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server missing GROK_API_KEY – fix server/.env' });
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`xAI error ${response.status}:`, errorText);
      return res.status(response.status).json({ error: `xAI API error: ${errorText || response.statusText}` });
    }

    const data = await response.json();
    console.log('Grok response forwarded successfully');
    res.json(data);
  } catch (err) {
    console.error('Proxy crash:', err);
    res.status(500).json({ error: `Proxy error: ${err.message}` });
  }
});

// Fallback for any undefined routes (prevents raw "Cannot GET" messages)
app.use((req, res) => {
  res.status(404).send('404 – Route not found. Use POST /api/grok for Grok calls or GET / for status.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server online at http://localhost:${PORT}`);
  console.log(`Test health: Open http://localhost:${PORT} in browser`);
});