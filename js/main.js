// ===== Theme toggle =====
const themeBtn = document.getElementById('themeToggle');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('saathi-theme', t);
}
applyTheme(localStorage.getItem('saathi-theme') || 'light');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}

// ===== Scroll progress bar =====
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
});

// ===== Animated stat counters (on scroll into view) =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('en-IN');
  }
  requestAnimationFrame(tick);
}
const counterEls = document.querySelectorAll('[data-target]');
if (counterEls.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => obs.observe(el));
}

// ===== Myth vs Fact flip cards =====
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

// ===== Poverty knowledge quiz =====
const quizData = [
  {
    q: "According to the UN, extreme poverty is living below what income line (per day)?",
    opts: ["$1.00", "$2.15", "$5.00", "$10.00"],
    correct: 1,
    fact: "The World Bank's International Poverty Line is $2.15/day (2017 PPP)."
  },
  {
    q: "Which SDG goal specifically targets ending poverty in all its forms?",
    opts: ["SDG 1", "SDG 4", "SDG 8", "SDG 11"],
    correct: 0,
    fact: "SDG 1 — 'No Poverty' — aims to end poverty in all its forms everywhere by 2030."
  },
  {
    q: "Which of these is a recognized dimension of 'multidimensional poverty' besides income?",
    opts: ["Favorite color", "Access to healthcare & education", "Number of social media followers", "Commute distance"],
    correct: 1,
    fact: "Multidimensional poverty considers health, education, and living standards — not just income."
  }
];
let quizIndex = 0, quizScore = 0;
const quizCard = document.getElementById('quizCard');
if (quizCard) {
  renderQuiz();
}
function renderQuiz() {
  if (quizIndex >= quizData.length) {
    quizCard.innerHTML = `
      <div class="quiz-result">
        <div class="num">${quizScore}/${quizData.length}</div>
        <p>You scored ${quizScore} out of ${quizData.length}. ${quizScore === quizData.length ? "Great grasp of the basics!" : "Explore the timeline above to learn more."}</p>
        <button class="btn btn-ghost btn-sm" id="quizRetry">Try again</button>
      </div>`;
    document.getElementById('quizRetry').addEventListener('click', () => { quizIndex = 0; quizScore = 0; renderQuiz(); });
    return;
  }
  const item = quizData[quizIndex];
  quizCard.innerHTML = `
    <div class="quiz-progress">${quizData.map((_, i) => `<span class="${i < quizIndex ? 'done' : ''}"></span>`).join('')}</div>
    <div class="quiz-q">${item.q}</div>
    <div class="quiz-opts">
      ${item.opts.map((o, i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}
    </div>
    <p class="quiz-fact" style="display:none; margin-top:14px; font-size:0.88rem;"></p>`;
  quizCard.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i, 10);
      const opts = quizCard.querySelectorAll('.quiz-opt');
      opts.forEach(o => o.disabled = true);
      if (i === item.correct) { btn.classList.add('correct'); quizScore++; }
      else {
        btn.classList.add('wrong');
        opts[item.correct].classList.add('correct');
      }
      const factEl = quizCard.querySelector('.quiz-fact');
      factEl.textContent = item.fact;
      factEl.style.display = 'block';
      setTimeout(() => { quizIndex++; renderQuiz(); }, 1600);
    });
  });
}
