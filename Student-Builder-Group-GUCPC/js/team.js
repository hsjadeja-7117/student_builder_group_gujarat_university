/* ============================================================
   Team page: renders core team / volunteers / speakers from
   data.json, and wires up the category filter tabs.
   ============================================================ */

(function initTeam() {
  const status = document.getElementById('team-status');
  const blocks = document.querySelectorAll('.team-block');
  const tabs = document.querySelectorAll('.team-tab');

  function cardHTML(person) {
    return `
      <article class="team-card reveal is-visible">
        <div class="photo-placeholder">Photo</div>
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
