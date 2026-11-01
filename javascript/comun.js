/* Leyes Transparentes — comportamiento compartido: navbar móvil, modal de donaciones y año del footer */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  function init() {
    // Navbar móvil
    const toggle = $('navToggle'), menu = $('navMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open);
      });
      menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }));
    }

    // Modal de donaciones
    const modal = $('donarModal');
    if (modal) {
      let lastFocus = null;
      const abrirModal = (e) => {
        e.preventDefault();
        lastFocus = document.activeElement;
        modal.hidden = false;
        document.body.classList.add('no-scroll');
        $('donarClose').focus();
      };
      const cerrarModal = () => {
        modal.hidden = true;
        document.body.classList.remove('no-scroll');
        if (lastFocus) lastFocus.focus();
      };
      document.querySelectorAll('[data-open="donar"]').forEach((b) => b.addEventListener('click', abrirModal));
      $('donarClose').addEventListener('click', cerrarModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) cerrarModal(); });
      $('copiarLlave').addEventListener('click', async () => {
        const btn = $('copiarLlave');
        const llave = $('llaveBreb').textContent.trim();
        try {
          await navigator.clipboard.writeText(llave);
        } catch (_) {
          const ta = document.createElement('textarea');
          ta.value = llave; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        btn.textContent = '¡Copiada!';
        setTimeout(() => { btn.textContent = 'Copiar llave'; }, 1800);
      });
    }

    const year = $('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
