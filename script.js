// Тема
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀️ Светлая' : '🌙 Тёмная';
  localStorage.theme = isDark ? 'dark' : 'light';
});

// Попап для Метрики
if (!localStorage.getItem('metricsConsent')) {
  new bootstrap.Modal(document.getElementById('metricsModal')).show();
}

document.getElementById('agree-metrics').addEventListener('click', () => {
  localStorage.setItem('metricsConsent', 'true');
  const script = document.createElement('script');
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  script.async = true;
  script.onload = () => {
    window.ym = window.ym || function() {(window.ym.a = window.ym.a || []).push(arguments)};
    ym(106707974, 'init', { 
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true
    });
  };
  document.head.appendChild(script);
  bootstrap.Modal.getInstance(document.getElementById('metricsModal')).hide();
});
renderCountries();

// База знаний
function renderCountries() {
  const grid = document.getElementById('countries-grid');
  grid.innerHTML = '';
  countries.forEach(c => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <a href="country.html?name=${encodeURIComponent(c.name)}" class="text-decoration-none">
        <div class="card-glass rounded-3 p-5 text-center h-100">
          <img src="${c.flagImg}" alt="Флаг ${c.name}" class="img-fluid mb-3" style="width: 100px; height: auto; border-radius: 4px;">
          <h5 class="text-gradient">${c.name}</h5>
          <p class="text-muted">${c.continent}</p>
        </div>
      </a>
    `;
    grid.appendChild(col);
  });
}
renderCountries();

// === Тесты ===
let quiz = [], qIndex = 0, score = 0;

document.getElementById('start-test-btn').addEventListener('click', () => {
  document.querySelectorAll('section').forEach(s => s.classList.add('d-none'));
  document.getElementById('tests').classList.remove('d-none');
  quiz = [];
  const pool = [...countries];
  const types = ['flag', 'capital', 'continent', 'map'];
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const correct = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    quiz.push({ type, correct });
  }
  qIndex = 0;
  score = 0;
  document.getElementById('quiz').innerHTML = '';
  showQuestion();
});


function showQuestion() {
  const q = quiz[qIndex];
  let html = `<div class="card-glass p-5 text-center"><p>Вопрос ${qIndex + 1}/10 | Очки: ${score}</p><hr>`;

  if (q.type === 'flag') {
    html += `<div class="fs-1 mb-4">${q.correct.flag}</div><p class="fs-3">Какая страна?</p>`;
  } else if (q.type === 'capital') {
    html += `<p class="fs-3">${q.correct.name}</p><p>Столица?</p>`;
  } else if (q.type === 'continent') {
    html += `<p class="fs-3">${q.correct.name}</p><p>Континент?</p>`;
  } else if (q.type === 'map') {
    html += `<p class="fs-3">Найди: <strong>${q.correct.name}</strong></p>`;
    html += `<div id="yandex-map" style="width:100%; height:400px; margin:20px 0;"></div>`;
  }

  const options = [q.correct];
  while (options.length < 4) {
    const r = countries[Math.floor(Math.random() * countries.length)];
    if (!options.includes(r)) options.push(r);
  }
  options.sort(() => Math.random() - 0.5);

  html += '<div class="d-grid gap-3 mt-4">';
  options.forEach(o => {
    const text = q.type === 'flag' ? o.name : q.type === 'capital' ? o.capital : q.type === 'continent' ? o.continent : o.name;
    html += `<button class="btn btn-outline-light btn-lg" onclick="answer(${o.name === q.correct.name})">${text}</button>`;
  });
  html += '</div></div>';
  document.getElementById('quiz').innerHTML = html;

  if (q.type === 'map') {
    ymaps.ready(() => {
      const map = new ymaps.Map('yandex-map', { center: [20, 0], zoom: 2 });
      map.events.add('click', e => {
        const coords = e.get('coords');
        const dist = ymaps.coordSystem.geo.distance(coords, q.correct.coords);
        answer(dist < 600000);
      });
    });
  }
}

function answer(correct) {
  if (correct) score++;
  qIndex++;
  if (qIndex < 10) showQuestion();
  else endQuiz();
}

function endQuiz() {
  document.getElementById('quiz').innerHTML = `
    <div class="text-center p-5">
      <h1 class="text-gradient">Готово!</h1>
      <p class="display-5">Твой результат: ${score}/10</p>
      <button class="btn btn-gradient btn-lg mt-4" onclick="location.href='#stats'; renderStats()">Статистика</button>
    </div>
  `;
  const stats = JSON.parse(localStorage.getItem('geoStats') || '[]');
  stats.push({ date: new Date().toLocaleDateString(), score });
  localStorage.setItem('geoStats', JSON.stringify(stats));
}

// === Статистика ===
function renderStats() {
  document.querySelectorAll('section').forEach(s => s.classList.add('d-none'));
  document.getElementById('stats').classList.remove('d-none');
  const stats = JSON.parse(localStorage.getItem('geoStats') || '[]');
  if (stats.length === 0) {
    document.getElementById('no-data').classList.remove('d-none');
    return;
  }
  document.getElementById('no-data').classList.add('d-none');
  new Chart(document.getElementById('chart'), {
    type: 'line',
    data: {
      labels: stats.map(s => s.date),
      datasets: [{ label: 'Баллы', data: stats.map(s => s.score), borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.2)', tension: 0.4, fill: true }]
    },
    options: { scales: { y: { max: 10 } } }
  });
}