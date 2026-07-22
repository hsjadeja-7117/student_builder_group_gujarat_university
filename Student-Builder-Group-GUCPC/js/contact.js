/* ============================================================
   Contact page: front-end only form handling. Wire this to a
   real backend or form service (e.g. Formspree) when ready —
   right now it just confirms receipt in the UI.
   ============================================================ */

(function contactForm() {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    note.textContent = `Thanks${name ? ', ' + name.split(' ')[0] : ''} — your message has been noted. We'll get back to you soon.`;
    form.reset();
  });
})();
