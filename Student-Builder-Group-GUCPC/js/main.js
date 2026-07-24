/* ============================================================
   Shared behaviour across every page:
   - mobile nav toggle
   - active nav link highlighting
   - animated dot-grid backdrop (signature element)
   - scroll-reveal for elements with class "reveal"
   ============================================================ */

(function navToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('is-open');
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
})();

(function activeLink() {
  const page = (window.location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href').replace(/^\//, '').replace(/\.html$/, '');
    const isHome = href === '' && page === '';
    if (isHome || (href !== '' && href === page)) {
      a.classList.add('active');
    }
  });
})();

(function scrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach((el) => io.observe(el));
})();

/* footer year */
(function footerYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();
/* ============================================================
   Home page: pulls the 3 nearest events from data.json and
   animates the stat counters once they scroll into view.
   ============================================================ */

(function renderHomeEvents() {
  const grid = document.getElementById('home-events-grid');
  if (!grid) return;

  fetch('data.json')
    .then((res) => res.json())
    .then((data) => {
      const upcoming = [...data.events]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

      grid.innerHTML = upcoming
        .map((evt) => {
          const d = new Date(evt.date);
          const day = d.getDate();
          const month = d.toLocaleString('en-US', { month: 'short' });
          return `
            <a class="event-card reveal is-visible" href="/events">
              <div class="event-card-media">
                <div class="photo-placeholder"><img src="${evt.image}" alt="${evt.title}"></div>
                <span class="event-date-chip"><strong>${day}</strong>${month}</span>
              </div>
              <div class="event-card-body">
                <span class="tag">${evt.tag}</span>
                <h3>${evt.title}</h3>
                <p>${evt.summary}</p>
              </div>
            </a>`;
        })
        .join('');
    })
    .catch((err) => {
      grid.innerHTML = '<p class="fetch-error">Could not load events right now.</p>';
      console.error(err);
    });
})();

(function animateStats() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach((s) => io.observe(s));
})();
/* ============================================================
   Team page: renders leader / core team / volunteers / speakers
   from data.json, and wires up the category filter tabs.
   ============================================================ */

(function initTeam() {
  const status = document.getElementById('team-status');
  const blocks = document.querySelectorAll('.team-block');
  const tabs = document.querySelectorAll('.team-tab');

  function cardHTML(person) {
    return `
      <article class="team-card reveal is-visible">
        <div class="photo-placeholder"><img src="${person.image}" alt="${person.name}"></div>
        <h3>${person.name}</h3>
        <p class="role">${person.role}</p>
        <p class="bio">${person.bio}</p>
      </article>`;
  }

  function renderGroup(key, people) {
    const grid = document.querySelector(`[data-grid="${key}"]`);
    if (!grid) return;
    if (!people || !people.length) {
      grid.innerHTML = '<p class="team-status visible">No members added yet.</p>';
      return;
    }
    grid.innerHTML = people.map(cardHTML).join('');
  }

  fetch('data.json')
    .then((res) => res.json())
    .then((data) => {
      const team = data.team || {};
      renderGroup('leader', team['leader']);
      renderGroup('core-team', team['core-team']);
      renderGroup('volunteers', team['volunteers']);
      renderGroup('speakers', team['speakers']);
    })
    .catch((err) => {
      status.textContent = 'Could not load team data right now.';
      status.classList.add('visible');
      console.error(err);
    });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;

      blocks.forEach((block) => {
        if (filter === 'all' || block.id === filter) {
          block.style.display = '';
        } else {
          block.style.display = 'none';
        }
      });
    });
  });
})();
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
    image: document.getElementById('modal-image'),
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
          <div class="photo-placeholder"><img src="${evt.image}" alt="${evt.title}"></div>
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
    modalEls.image.src = evt.image;
    modalEls.image.alt = evt.title;

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
