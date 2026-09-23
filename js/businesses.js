/* ============================================================
   businesses.js
   Powers the "Local Businesses" page (businesses.html):
     - loads business data from data/businesses.json
     - draws a Leaflet.js map with a marker per business
     - renders a filterable grid of business cards
     - shows a slide-in detail panel when a card/marker is clicked

   Data flow (this is the core pattern to explain to an
   evaluator): one fetch() loads everything into the
   `businesses` array once, then every filter/search action
   just re-reads that in-memory array and re-renders the DOM —
   there is no server round trip after the initial page load.
   ============================================================ */

let businesses = [];        // full dataset, loaded once from JSON
let map, markers = {};      // the Leaflet map instance + one marker per business, keyed by business id
let activeId = null;        // id of the business currently shown in the detail panel (for highlighting its card)

// Fetch the JSON data file, then bootstrap the page once it arrives.
fetch('data/businesses.json')
  .then(r => r.json())
  .then(data => {
    businesses = data;
    initMap();                 // set up the Leaflet map
    populateCategoryFilter();  // build the <select> options from the data (so it always matches the dataset)
    render();                  // draw the initial (unfiltered) card grid + markers
  });

// Creates the Leaflet map centered on Mumbai and adds the
// OpenStreetMap tile layer (the actual map imagery).
function initMap() {
  map = L.map('map', { scrollWheelZoom: false }).setView([19.072, 72.905], 12); // [lat, lng], zoom level
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
}

// Reads the unique category values out of the data and adds
// them as <option>s to the category filter dropdown.
function populateCategoryFilter() {
  const cats = [...new Set(businesses.map(b => b.category))].sort(); // Set removes duplicates
  const sel = document.getElementById('categoryFilter');
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

// Returns the subset of `businesses` matching the current
// search box + category dropdown + support-type dropdown.
// Called every time any filter control changes.
function getFiltered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const support = document.getElementById('supportFilter').value;
  return businesses.filter(b => {
    const matchesQ = !q || b.name.toLowerCase().includes(q) || b.neighborhood.toLowerCase().includes(q);
    const matchesCat = !cat || b.category === cat;
    const matchesSupport = !support || b.supportType.includes(support);
    return matchesQ && matchesCat && matchesSupport; // must satisfy ALL active filters
  });
}

// The main render function: clears and redraws both the map
// markers and the card grid to match the current filter state.
// Called on load and after every filter change.
function render() {
  const list = getFiltered();

  // Remove all existing markers before adding the filtered set back
  // (otherwise markers for filtered-out businesses would stay on the map).
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  const grid = document.getElementById('cardGrid');
  grid.innerHTML = ''; // clear old cards before re-adding

  list.forEach(b => {
    // --- map marker for this business ---
    const marker = L.marker([b.lat, b.lng]).addTo(map);
    marker.bindPopup(`<strong>${b.name}</strong><br>${b.neighborhood}`); // small popup on marker click
    marker.on('click', () => openDetail(b.id)); // clicking the marker also opens the full detail panel
    markers[b.id] = marker; // keep a reference so we can remove/fly-to it later

    // --- matching card in the grid ---
    const card = document.createElement('div');
    card.className = 'biz-card' + (b.id === activeId ? ' active' : ''); // highlight if this is the open one
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

  // Friendly empty state instead of a blank grid.
  if (list.length === 0) {
    grid.innerHTML = '<p style="padding:20px;">No businesses match your filters. Try clearing search or category.</p>';
  }
}

// Opens the slide-in detail panel for one business (by id),
// pans the map to it, and opens its marker popup.
// Triggered by clicking either a card or a map marker.
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
  // replace(/\D/g,'') strips everything except digits, so the WhatsApp
  // deep-link (wa.me/<digits>) works regardless of how the phone number
  // is formatted in the JSON (spaces, +, dashes, etc).

  panel.classList.add('open'); // CSS slides the panel into view
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  panel.addEventListener('click', (e) => { if (e.target === panel) closeDetail(); }); // click on the dimmed backdrop also closes it

  render();                                        // re-render so the correct card gets the "active" highlight
  map.flyTo([b.lat, b.lng], 14, { duration: 0.6 }); // smooth pan+zoom to the business's location
  markers[b.id].openPopup();
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
}

// Re-run the filter/render pipeline whenever any filter control changes.
// 'input' catches typing in the search box; 'change' catches dropdown selection.
['searchInput', 'categoryFilter', 'supportFilter'].forEach(id => {
  document.getElementById(id).addEventListener('input', render);
  document.getElementById(id).addEventListener('change', render);
});
