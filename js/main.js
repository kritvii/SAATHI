/* ============================================================
   main.js
   Shared behaviour used on EVERY page of Saathi (loaded via
   <script src="js/main.js"> at the bottom of index.html,
   businesses.html and ngos.html).

   Contains 4 independent features:
     1. Dark / light theme toggle
     2. Scroll progress bar
     3. Animated statistic counters (on the About page)
     4. Poverty awareness quiz (on the About page)
   ============================================================ */


/* ===== 1. Theme toggle ===================================
   Lets the user switch between light and dark mode. The chosen
   theme is stored in localStorage so it persists across page
   navigation and future visits (each page is a fresh page
   load, so without localStorage the theme would reset). */

// Grab the 🌙/☀️ button in the navbar (may be null if a page
// doesn't include it, so every use below is null-checked).
const themeBtn = document.getElementById('themeToggle');

// Applies a theme by setting a data-theme attribute on <html>.
// The actual colours for data-theme="dark" / "light" are
// defined with CSS variables in css/style.css.
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️' : '🌙'; // icon shows the mode you'll switch TO
  localStorage.setItem('saathi-theme', t); // remember choice for next page/visit
}

// On every page load: read the saved theme (default = light) and apply it immediately.
applyTheme(localStorage.getItem('saathi-theme') || 'light');

// Clicking the toggle flips the current theme.
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}


/* ===== 2. Scroll progress bar =============================
   A thin bar (#scrollProgress, fixed at the top of the page)
   that fills left-to-right as the user scrolls down, giving a
   visual sense of how much of the page is left. */

const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const h = document.documentElement;
  // scrollTop = pixels already scrolled;
  // scrollHeight - clientHeight = total pixels that CAN be scrolled.
  // Their ratio, as a percentage, is how far down the page we are.
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
});


/* ===== 3. Animated stat counters ===========================
   The big numbers on the About page (e.g. "712M people in
   extreme poverty") count up from 0 the moment they scroll
   into view, instead of just appearing — done with
   requestAnimationFrame + an IntersectionObserver. */

// Animates a single <span data-target="712">0</span> element
// from 0 up to its data-target value over ~1.4 seconds.
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400; // ms
  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1); // progress 0→1
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic, so it slows down near the end
    el.textContent = Math.floor(eased * target).toLocaleString('en-IN'); // Indian-style digit grouping
    if (p < 1) requestAnimationFrame(tick); // schedule next frame
    else el.textContent = target.toLocaleString('en-IN'); // snap to exact final value
  }
  requestAnimationFrame(tick);
}

// Find every counter element on the page.
const counterEls = document.querySelectorAll('[data-target]');
if (counterEls.length) {
  // IntersectionObserver fires when an element enters/leaves the
  // viewport, so we only start each counter once it's actually visible.
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target); // run once per element, then stop watching it
      }
    });
  }, { threshold: 0.5 }); // trigger when 50% of the element is visible
  counterEls.forEach(el => obs.observe(el));
}


/* ===== 4. Myth vs Fact flip cards ==========================
   Simple click-to-flip cards (CSS handles the 3D flip
   animation via the .flipped class; this just toggles it). */
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});


/* ===== 5. Poverty knowledge quiz ===========================
   A 3-question multiple-choice quiz rendered entirely in JS
   (no page reload between questions). Runs only if a
   #quizCard element exists on the page (i.e. the About page). */

// The quiz content itself: each question has its options,
// the index of the correct option, and a follow-up fact shown
// after the user answers.
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

// Quiz state: which question we're on, and the running score.
let quizIndex = 0, quizScore = 0;
const quizCard = document.getElementById('quizCard');
if (quizCard) {
  renderQuiz(); // draw the first question as soon as the page loads
}

// Renders either the current question or, once every question
// has been answered, the final score screen. Called again after
// every answer to move to the next question ("re-render on state change").
function renderQuiz() {
  // Base case: no more questions left -> show the result screen.
  if (quizIndex >= quizData.length) {
    quizCard.innerHTML = `
      <div class="quiz-result">
        <div class="num">${quizScore}/${quizData.length}</div>
        <p>You scored ${quizScore} out of ${quizData.length}. ${quizScore === quizData.length ? "Great grasp of the basics!" : "Explore the timeline above to learn more."}</p>
        <button class="btn btn-ghost btn-sm" id="quizRetry">Try again</button>
      </div>`;
    // "Try again" resets state and restarts the quiz from question 1.
    document.getElementById('quizRetry').addEventListener('click', () => { quizIndex = 0; quizScore = 0; renderQuiz(); });
    return;
  }

  // Otherwise, render the current question with a progress dial
  // (small dots showing which questions are already done).
  const item = quizData[quizIndex];
  quizCard.innerHTML = `
    <div class="quiz-progress">${quizData.map((_, i) => `<span class="${i < quizIndex ? 'done' : ''}"></span>`).join('')}</div>
    <div class="quiz-q">${item.q}</div>
    <div class="quiz-opts">
      ${item.opts.map((o, i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}
    </div>
    <p class="quiz-fact" style="display:none; margin-top:14px; font-size:0.88rem;"></p>`;

  // Wire up a click handler on every option button just rendered.
  quizCard.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i, 10);
      const opts = quizCard.querySelectorAll('.quiz-opt');
      opts.forEach(o => o.disabled = true); // lock all options after one is picked

      if (i === item.correct) {
        btn.classList.add('correct'); // highlight the chosen (correct) answer green
        quizScore++;
      } else {
        btn.classList.add('wrong');                 // highlight the wrong choice red
        opts[item.correct].classList.add('correct'); // also reveal the correct one
      }

      // Show the explanatory "fact" line, then auto-advance to the
      // next question after a short pause so the user can read it.
      const factEl = quizCard.querySelector('.quiz-fact');
      factEl.textContent = item.fact;
      factEl.style.display = 'block';
      setTimeout(() => { quizIndex++; renderQuiz(); }, 1600);
    });
  });
}
