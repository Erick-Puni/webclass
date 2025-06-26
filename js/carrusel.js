(() => {
  'use strict';

  // --- Cachear selectores ---
  const slides      = document.querySelectorAll('.slide');
  const slidesCt    = document.querySelector('.slides');
  const prevBtn     = document.querySelector('.slider-nav.prev');
  const nextBtn     = document.querySelector('.slider-nav.next');
  const indicators  = document.querySelector('.indicators');
  const sliderEl    = document.querySelector('.slider');

  let currentIndex = 0;       // Índice actual
  let autoPlayId   = null;    // ID del intervalo

  // --- Crear indicadores dinámicamente ---
  function createIndicators() {
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      indicators.appendChild(dot);
    });
  }

  // --- Actualizar posición del slider y estado de indicadores ---
  function updateSlider() {
    // Aquí usamos % en lugar de vw
    slidesCt.style.transform = `translateX(${-currentIndex * 100}%)`;
    indicators.querySelectorAll('.dot')
      .forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  // --- Navegación manual ---
  function goToSlide(idx)   { currentIndex = idx;                                                   updateSlider(); }
  function nextSlide()      { currentIndex = (currentIndex + 1) % slides.length;                   updateSlider(); }
  function prevSlide()      { currentIndex = (currentIndex - 1 + slides.length) % slides.length; updateSlider(); }

  // --- Auto-play con limpieza ---
  function play()  { stop(); autoPlayId = setInterval(nextSlide, 8000); }
  function stop()  { if (autoPlayId !== null) { clearInterval(autoPlayId); autoPlayId = null; } }

  // --- Adjuntar y limpiar listeners ---
  function attachEventListeners() {
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    slides.forEach(slide => {
      const handler = () => {
        const target = slide.dataset.link;
        if (target) window.location.href = target;
      };
      slide.addEventListener('click', handler);
      slide._clickHandler = handler; // guardar ref para limpieza
    });

    sliderEl.addEventListener('mouseenter', stop);
    sliderEl.addEventListener('mouseleave', play);

    window.addEventListener('beforeunload', () => {
      stop();
      nextBtn.removeEventListener('click', nextSlide);
      prevBtn.removeEventListener('click', prevSlide);
      slides.forEach(slide => slide.removeEventListener('click', slide._clickHandler));
      sliderEl.removeEventListener('mouseenter', stop);
      sliderEl.removeEventListener('mouseleave', play);
    });
  }

  // --- Inicialización ---
  createIndicators();
  attachEventListeners();
  updateSlider();
  play();
})();
