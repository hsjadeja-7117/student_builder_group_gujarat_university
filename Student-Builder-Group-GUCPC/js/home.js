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
            <a class="event-card reveal is-visible" href="events.html">
              <div class="event-card-media">
                <div class="photo-placeholder">Photo</div>
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
