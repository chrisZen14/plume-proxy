const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: 'Paramètre "url" manquant.' });
    }
    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
        });
        const data = await response.text();
        res.status(response.status).send(data);
    } catch (error) {
        console.error('Erreur de proxy:', error);
        res.status(500).json({ error: 'Erreur du serveur proxy.' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur proxy démarré sur le port ${PORT}`);
});
