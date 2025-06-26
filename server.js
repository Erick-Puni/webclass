// server.js
require('dotenv').config();          // carga DEEPSEEK_API_KEY desde .env
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Almacenamiento en memoria de uso diario por IP
const dailyUsage = {}; // { ip: { date: 'YYYY-MM-DD', count: N } }
const DAILY_LIMIT = 3;   // límite de 3 consultas diarias

// 1) Middlewares
app.use(express.json());                             // parsea JSON bodies
app.use(express.static(path.join(__dirname)));       // sirve HTML, CSS, JS, img…

// 2) Middleware para limitar solicitudes diarias por IP
app.use('/api/chat', (req, res, next) => {
  const ip = req.ip;
  const today = new Date().toISOString().slice(0, 10);
  let usage = dailyUsage[ip];
  if (!usage || usage.date !== today) {
    // reiniciar contador si es un nuevo día o no existe
    usage = { date: today, count: 0 };
  }
  if (usage.count >= DAILY_LIMIT) {
    return res.status(429).json({ error: `Límite diario de ${DAILY_LIMIT} consultas alcanzado` });
  }
  usage.count += 1;
  dailyUsage[ip] = usage;
  next();
});

// 3) Proxy a la API oficial de DeepSeek
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Falta el campo prompt' });
    }

    // Llamada al endpoint con max_tokens de 768 para respuestas fluidas
    const dsRes = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          model:       'deepseek-reasoner',
          messages: [
            { role: 'system', content: 'Eres un asistente útil.' },
            { role: 'user',   content: prompt }
          ],
          max_tokens:  768,    // tope ajustado para respuestas fluidas
          temperature: 0.7     // nivel de aleatoriedad
        })
      }
    );

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      return res.status(dsRes.status).json({ error: errText });
    }

    const json = await dsRes.json();
    return res.json(json);

  } catch (err) {
    console.error('Error en /api/chat:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4) Arranca el servidor
app.listen(PORT, () => {
  console.log(`🚀 Server escuchando en http://localhost:${PORT}`);
});
