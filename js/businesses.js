let businesses = [];
let map, markers = {};
let activeId = null;

fetch('data/businesses.json')
  .then(r => r.json())
  .then(data => {
    businesses = data;
    initMap();
    populateCategoryFilter();
    render();
  });

function initMap() {
  map = L.map('map', { scrollWheelZoom: false }).setView([19.072, 72.905], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
}

function populateCategoryFilter() {
  const cats = [...new Set(businesses.map(b => b.category))].sort();
  const sel = document.getElementById('categoryFilter');
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const support = document.getElementById('supportFilter').value;
  return businesses.filter(b => {
    const matchesQ = !q || b.name.toLowerCase().includes(q) || b.neighborhood.toLowerCase().includes(q);
    const matchesCat = !cat || b.category === cat;
    const matchesSupport = !support || b.supportType.includes(support);
    return matchesQ && matchesCat && matchesSupport;
  });
}

function render() {
  const list = getFiltered();
  // clear old markers
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';

  list.forEach(b => {
    // marker
    const marker = L.marker([b.lat, b.lng]).addTo(map);
    marker.bindPopup(`<strong>${b.name}</strong><br>${b.neighborhood}`);
    marker.on('click', () => openDetail(b.id));
    markers[b.id] = marker;

    // card
    const card = document.createElement('div');
    card.className = 'biz-card' + (b.id === activeId ? ' active' : '');
    card.innerHTML = `
      <span class="icon">${b.icon}</span>
      <h3>${b.name}</h3>
      <div class="meta">${b.category} · ${b.neighborhood}</div>
      ${b.supportType.map(s => `<span class="chip">${s}</span>`).join('')}
      <div class="impact-bar"><div class="impact-bar-fill" style="width:${b.impactScore}%"></div></div>
      <div class="impact-label">Community impact score: ${b.impactScore}/100</div>
    `;
    card.addEventListener('click', () => openDetail(b.id));
    grid.appendChild(card);
  });

  if (list.length === 0) {
    grid.innerHTML = '<p style="padding:20px;">No businesses match your filters. Try clearing search or category.</p>';
  }
}

function openDetail(id) {
  activeId = id;
  const b = businesses.find(x => x.id === id);
  if (!b) return;
  const panel = document.getElementById('detailPanel');
  const card = document.getElementById('detailCard');
  card.innerHTML = `
    <button class="detail-close" id="detailClose">✕</button>
    <span class="icon" style="font-size:2.2rem;">${b.icon}</span>
    <h2 style="margin-top:10px;">${b.name}</h2>
    <div class="meta" style="color:var(--ink-soft); font-size:0.9rem; margin-bottom:12px;">${b.category} · ${b.neighborhood}</div>
    <p>${b.story}</p>
    <div class="impact-bar"><div class="impact-bar-fill" style="width:${b.impactScore}%"></div></div>
    <div class="impact-label">Community impact score: ${b.impactScore}/100</div>
    <div class="support-buttons">
      ${b.supportType.map(s => `<span class="chip">${s}</span>`).join('')}
    </div>
    <div class="support-buttons">
      <a class="btn btn-primary btn-sm" href="https://wa.me/${b.contact.whatsapp.replace(/\D/g,'')}" target="_blank" rel="noopener">Message on WhatsApp</a>
      <a class="btn btn-ghost btn-sm" href="tel:${b.contact.phone.replace(/\s/g,'')}">Call</a>
    </div>
  `;
  panel.classList.add('open');
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  panel.addEventListener('click', (e) => { if (e.target === panel) closeDetail(); });
  render(); // refresh active state on cards
  map.flyTo([b.lat, b.lng], 14, { duration: 0.6 });
  markers[b.id].openPopup();
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
}

['searchInput', 'categoryFilter', 'supportFilter'].forEach(id => {
  document.getElementById(id).addEventListener('input', render);
  document.getElementById(id).addEventListener('change', render);
});
