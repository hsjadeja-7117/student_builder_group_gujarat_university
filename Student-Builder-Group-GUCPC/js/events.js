/* ============================================================
   Events page: renders event cards from data.json and expands
   the clicked card into a full-detail overlay on the same page.
   ============================================================ */

(function initEvents() {
  const grid = document.getElementById('events-grid');
  const status = document.getElementById('events-status');
  const modal = document.getElementById('event-modal');
  if (!grid || !modal) return;

  const modalEls = {
    tag: document.getElementById('modal-tag'),
    title: document.getElementById('modal-title'),
    date: document.getElementById('modal-date'),
    time: document.getElementById('modal-time'),
    location: document.getElementById('modal-location'),
    description: document.getElementById('modal-description'),
  };

  let eventsData = [];

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function cardHTML(evt) {
    const d = new Date(evt.date);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `
      <article class="event-card reveal is-visible" data-id="${evt.id}" tabindex="0" role="button" aria-label="View details for ${evt.title}">
        <div class="event-card-media">
          <div class="photo-placeholder">Photo</div>
          <span class="event-date-chip"><strong>${day}</strong>${month}</span>
        </div>
        <div class="event-card-body">
          <span class="tag">${evt.tag}</span>
          <h3>${evt.title}</h3>
          <p>${evt.summary}</p>
        </div>
      </article>`;
  }

  function openModal(evt) {
    modalEls.tag.textContent = evt.tag;
    modalEls.title.textContent = evt.title;
    modalEls.date.textContent = formatDate(evt.date);
    modalEls.time.textContent = evt.time;
    modalEls.location.textContent = evt.location;
    modalEls.description.textContent = evt.description;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.event-card');
    if (!card) return;
    const evt = eventsData.find((x) => x.id === card.dataset.id);
    if (evt) openModal(evt);
  });

  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.event-card');
    if (!card) return;
    e.preventDefault();
    const evt = eventsData.find((x) => x.id === card.dataset.id);
    if (evt) openModal(evt);
  });

  fetch('data.json')
    .then((res) => res.json())
    .then((data) => {
      eventsData = [...data.events].sort((a, b) => new Date(a.date) - new Date(b.date));
      grid.innerHTML = eventsData.map(cardHTML).join('');
      status.style.display = 'none';
    })
    .catch((err) => {
      status.textContent = 'Could not load events right now.';
      console.error(err);
    });
})();
