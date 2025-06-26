(function() {
  'use strict';

  // Menú hamburguesa en móvil
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
  }

  // Reordenar cajas Flexbox
  const flexContainer = document.querySelector('.flex-grid');
  const shuffleBtn    = document.getElementById('shuffleBtn');
  if (flexContainer && shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      const items = Array.from(flexContainer.children);
      items.sort(() => Math.random() - 0.5).forEach(item => flexContainer.appendChild(item));
    });
  }
})();
