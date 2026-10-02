(() => {
  'use strict';
  // Data fixa, à meia-noite no fuso de Fortaleza (UTC−03:00).
  const revealAt = Date.parse('2026-10-20T00:00:00-03:00');
  const fields = ['days', 'hours', 'minutes', 'seconds'].map(id => document.getElementById(id));
  const countdown = document.querySelector('.countdown');
  function tick() {
    const seconds = Math.max(0, Math.floor((revealAt - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    fields.forEach((field, i) => { field.textContent = String(values[i]).padStart(2, '0'); });
    return seconds;
  }
  tick();
  countdown.hidden = false;
  const timer = setInterval(() => { if (tick() === 0) clearInterval(timer); }, 1000);
  // A mensagem permanece intacta mesmo após a contagem chegar a zero.
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('motion-toggle');
  let paused = preference.matches;
  function updateMotion() {
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing';
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('.motion-label').textContent = paused ? 'Retomar animações' : 'Pausar animações';
    toggle.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    // A preferência do sistema por movimento reduzido sempre é respeitada.
    toggle.hidden = preference.matches;
  }
  toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  preference.addEventListener('change', () => { paused = preference.matches; updateMotion(); });
  updateMotion();
})();
