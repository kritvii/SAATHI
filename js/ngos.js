let ngos = [];

fetch('data/ngos.json')
  .then(r => r.json())
  .then(data => {
    ngos = data;
    populateCauseFilter();
    renderGrid();
    renderWizard();
  });

function populateCauseFilter() {
  const causes = [...new Set(ngos.map(n => n.causeArea))].sort();
  const sel = document.getElementById('causeFilter');
  causes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

function getFilteredNgos() {
  const q = document.getElementById('ngoSearch').value.toLowerCase();
  const cause = document.getElementById('causeFilter').value;
  return ngos.filter(n => {
    const matchesQ = !q || n.name.toLowerCase().includes(q) || n.location.toLowerCase().includes(q);
    const matchesCause = !cause || n.causeArea === cause;
    return matchesQ && matchesCause;
  });
}

function renderGrid() {
  const list = getFilteredNgos();
  const grid = document.getElementById('ngoGrid');
  grid.innerHTML = '';
  list.forEach(n => {
    const card = document.createElement('div');
    card.className = 'ngo-card';
    card.innerHTML = `
      <h3>${n.name}</h3>
      <div class="meta">${n.causeArea} · ${n.location}</div>
      ${n.getInvolvedOptions.map(o => `<span class="chip">${o}</span>`).join('')}
    `;
    card.addEventListener('click', () => openNgoDetail(n.id));
    grid.appendChild(card);
  });
  if (list.length === 0) {
    grid.innerHTML = '<p style="padding:20px;">No NGOs match your search.</p>';
  }
}

function openNgoDetail(id) {
  const n = ngos.find(x => x.id === id);
  if (!n) return;
  const panel = document.getElementById('detailPanel');
  const card = document.getElementById('detailCard');
  card.innerHTML = `
    <button class="detail-close" id="detailClose">✕</button>
    <h2>${n.name}</h2>
    <div class="meta" style="color:var(--ink-soft); font-size:0.9rem; margin-bottom:12px;">${n.causeArea} · ${n.location}</div>
    <p>${n.mission}</p>
    <div class="support-buttons">
      ${n.getInvolvedOptions.map(o => `<span class="chip">${o}</span>`).join('')}
    </div>
    <div class="support-buttons">
      <a class="btn btn-primary btn-sm" href="mailto:${n.contact.email}">Email</a>
      <a class="btn btn-ghost btn-sm" href="${n.contact.website}" target="_blank" rel="noopener">Website</a>
      <a class="btn btn-ghost btn-sm" href="tel:${n.contact.phone.replace(/\s/g,'')}">Call</a>
    </div>
  `;
  panel.classList.add('open');
  document.getElementById('detailClose').addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', (e) => { if (e.target === panel) panel.classList.remove('open'); });
}

['ngoSearch', 'causeFilter'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderGrid);
  document.getElementById(id).addEventListener('change', renderGrid);
});

// ===== Get-involved wizard =====
const wizardSteps = [
  { key: 'cause', q: "What cause matters most to you?", opts: ["Education & Poverty Alleviation", "Health & Livelihood", "Livelihood & Youth Employment", "Housing & Urban Poverty", "Basic Needs & Disaster Relief"] },
  { key: 'time', q: "How much time can you give?", opts: ["Just a donation", "A few hours a month", "Ongoing volunteering"] },
  { key: 'mode', q: "Prefer to help online or in person?", opts: ["Online / remote", "In-person, local"] }
];
let wizardAnswers = {};
let wizardIndex = 0;

function renderWizard() {
  const el = document.getElementById('wizard');
  if (wizardIndex >= wizardSteps.length) {
    const match = matchNgo();
    el.innerHTML = `
      <h3 style="margin-top:0;">Based on your answers…</h3>
      <div class="match-card">
        <h3>${match.name}</h3>
        <div class="meta" style="color:var(--ink-soft); font-size:0.88rem;">${match.causeArea} · ${match.location}</div>
        <p style="margin-top:8px;">${match.mission}</p>
        <div class="support-buttons">
          <a class="btn btn-primary btn-sm" href="mailto:${match.contact.email}">Email ${match.name.split(' ')[0]}</a>
          <a class="btn btn-ghost btn-sm" href="${match.contact.website}" target="_blank" rel="noopener">Visit site</a>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:16px;" id="wizardRestart">Start over</button>
    `;
    document.getElementById('wizardRestart').addEventListener('click', () => { wizardAnswers = {}; wizardIndex = 0; renderWizard(); });
    return;
  }
  const step = wizardSteps[wizardIndex];
  el.innerHTML = `
    <div class="quiz-progress">${wizardSteps.map((_, i) => `<span class="${i < wizardIndex ? 'done' : ''}"></span>`).join('')}</div>
    <div class="quiz-q">${step.q}</div>
    <div class="quiz-opts">
      ${step.opts.map(o => `<button class="quiz-opt" data-v="${o}">${o}</button>`).join('')}
    </div>
  `;
  el.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      wizardAnswers[step.key] = btn.dataset.v;
      wizardIndex++;
      renderWizard();
    });
  });
}

function matchNgo() {
  const byCause = ngos.find(n => n.causeArea === wizardAnswers.cause);
  return byCause || ngos[0];
}
