const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// En-têtes à NE PAS transmettre au serveur cible
const HEADER_BLACKLIST = [
  'host', 'connection', 'content-length', 'accept-encoding',
  'cf-connecting-ip', 'cf-ray', 'cf-ipcountry', 'x-forwarded-for',
  'x-forwarded-proto', 'x-forwarded-host', 'x-real-ip'
];

app.all('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Paramètre "url" manquant.' });
  }

  // Transmet TOUS les en-têtes reçus, sauf la blacklist
  const forwardHeaders = {};
  Object.keys(req.headers).forEach(function (key) {
    if (HEADER_BLACKLIST.indexOf(key.toLowerCase()) === -1) {
      forwardHeaders[key] = req.headers[key];
    }
  });

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : undefined
    });
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Erreur de proxy:', error);
    res.status(500).json({ error: 'Erreur du serveur proxy : ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log('Serveur proxy démarré sur le port ' + PORT);
});
