// js/ia.js
(() => {
  'use strict';

  console.log('[ia.js] Script cargado');

  // Elementos del DOM
  const form       = document.getElementById('chat-form');
  const promptEl   = document.getElementById('prompt');
  const messagesCt = document.getElementById('messages');

  // Crea un mensaje en la UI y auto-scroll
  function appendMessage(sender, htmlContent) {
    console.log(`[appendMessage] sender=${sender}`);
    const msg = document.createElement('div');
    // Usa 'user' para usuario, 'assistant' (o cualquier otro) para Orbit
    const roleClass = sender === 'user' ? 'user' : 'assistant';
    msg.classList.add('message', roleClass);
    // Etiqueta dinámica: 'Tú' o el nombre del asistente (sender)
    msg.innerHTML = `<span class="sender">${sender === 'user' ? 'Tú' : sender}:</span> ${htmlContent}`;
    messagesCt.appendChild(msg);
    messagesCt.scrollTop = messagesCt.scrollHeight;
    return msg;
  }

  // Escapa HTML para texto plano
  function escapeHtml(str) {
    return str.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  // Envía prompt al backend y muestra la respuesta
  async function sendPrompt(prompt) {
    // Oculta el sprite durante la respuesta
    const sprite = document.querySelector('.sprite-background');
    if (sprite) sprite.style.display = 'none';

    console.log('[sendPrompt] Enviando prompt:', prompt);
    // Mensaje de usuario
    appendMessage('user', escapeHtml(prompt));
    promptEl.value = '';
    promptEl.disabled = true;

    // Mensaje de Pensando...
    const loadingMsg = appendMessage('Orbit', '<em>Pensando...</em>');
    let dotCount = 0;
    const loader = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      loadingMsg.innerHTML = `<span class="sender">Orbit:</span> <em>Pensando${'.'.repeat(dotCount)}</em>`;
      messagesCt.scrollTop = messagesCt.scrollHeight;
    }, 500);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      console.log('[sendPrompt] Respuesta status:', res.status);
      clearInterval(loader);

      const data = await res.json();
      console.log('[sendPrompt] Datos recibidos:', data);

      if (res.ok && data.choices && data.choices[0]?.message?.content) {
        const md = data.choices[0].message.content.trim();
        const html = typeof marked !== 'undefined' ? marked.parse(md) : escapeHtml(md);
        loadingMsg.innerHTML = `<span class="sender">Orbit:</span> ${html}`;
      } else if (data.error) {
        loadingMsg.innerHTML = `<span class="sender">Orbit:</span> <strong>Error:</strong> ${escapeHtml(data.error.message || data.error)}`;
      } else {
        loadingMsg.innerHTML = `<span class="sender">Orbit:</span> No se recibió respuesta.`;
      }

      messagesCt.scrollTop = messagesCt.scrollHeight;
    } catch (err) {
      console.error('[sendPrompt] Error fetch:', err);
      clearInterval(loader);
      loadingMsg.innerHTML = `<span class="sender">Orbit:</span> <strong>Error al contactar al servidor.</strong>`;
    } finally {
      // Restablece el sprite al terminar
      if (sprite) sprite.style.display = 'block';
      promptEl.disabled = false;
      promptEl.focus();
    }
  }

  // Listener del formulario
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = promptEl.value.trim();
    if (!text) return;
    sendPrompt(text);
  });

  // Autofocus on load
  window.addEventListener('DOMContentLoaded', () => promptEl.focus());
})();
