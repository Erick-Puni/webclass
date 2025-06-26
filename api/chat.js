// api/chat.js
// Función serverless en Vercel para proxy a DeepSeek

export default async function handler(req, res) {
  // Solo POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Obtener prompt del body
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Falta el campo prompt o no es válido' });
  }

  try {
    // Llamada al endpoint de DeepSeek
    const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
        max_tokens:  768,
        temperature: 0.7
      })
    });

    // Si error de autenticación o límites
    if (!dsRes.ok) {
      const errText = await dsRes.text();
      return res.status(dsRes.status).json({ error: errText });
    }

    // Parsear y reenviar JSON de DeepSeek
    const json = await dsRes.json();
    return res.status(200).json(json);

  } catch (err) {
    console.error('Error en api/chat:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
