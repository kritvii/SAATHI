# Saathi — SDG 1: No Poverty

A student mini-project connecting people with low-income local businesses and NGOs working on poverty alleviation, built for **SDG Goal 1: No Poverty**.

## 🎯 Problem statement
Global and local poverty-alleviation efforts often stay abstract — statistics without a clear, easy way for an individual to help. Saathi closes that gap by making poverty tangible and actionable: real (representative) local businesses to support, and real NGOs to connect with, in one place.

## ✨ Features
- **About/Awareness** — animated poverty statistics, a milestones timeline, flip-to-reveal myth vs. fact cards, and a 3-question knowledge quiz
- **Local Businesses** — searchable/filterable directory of 8 community businesses, an interactive Leaflet.js map, click-to-expand detail cards with WhatsApp/call CTAs, and a community impact score bar
- **NGO Directory** — searchable/filterable directory of 6 Mumbai NGOs working on poverty, plus a 3-question "get involved" wizard that matches the user to a relevant NGO
- Dark/light mode toggle (persisted via `localStorage`)
- Scroll progress indicator and animated on-scroll counters

## 🛠️ Tech stack
- HTML5, CSS3 (custom properties, no framework), vanilla JavaScript
- [Leaflet.js](https://leafletjs.com/) + OpenStreetMap tiles for the map
- Google Fonts (Fraunces + Inter)

## 📁 Project structure
```
sdg1-project/
├── index.html          # About / Awareness page
├── businesses.html     # Local businesses directory + map
├── ngos.html           # NGO directory + get-involved wizard
├── css/
│   └── style.css
├── js/
│   ├── main.js          # shared: theme toggle, scroll progress, counters, quiz, flip cards
│   ├── businesses.js     # map, filters, business detail panel
│   └── ngos.js           # NGO filters, detail panel, wizard
└── data/
    ├── businesses.json
    └── ngos.json
```

## 🚀 Running locally
No build step needed. From the project folder:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` (a local server is required so `fetch()` can load the JSON data files).

## 📤 Publishing to GitHub
```bash
git init
git add .
git commit -m "Initial commit — Saathi SDG1 project"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
Enable **GitHub Pages** (Settings → Pages → Deploy from branch `main`, root) to get a live link for your demo.

## 📊 Data note
Business entries are composite/representative profiles (to avoid publishing real vendors' personal contact details without consent) grounded in real Mumbai neighborhoods. NGO entries are real, publicly listed organizations — verify current contact details on their official websites before outreach.

## 🎓 Academic context
Built as a Mini Project mapped to **SDG 1: No Poverty**, covering UI/UX design, use-case modeling, and full-stack static web implementation.
