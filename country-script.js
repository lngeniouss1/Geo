// Тема
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  document.getElementById('theme-toggle').textContent = isDark ? '☀️ Светлая' : '🌙 Тёмная';
});

// Страна
ymaps.ready(() => {
  const params = new URLSearchParams(location.search);
  const name = params.get('name');
  const c = countries.find(x => x.name === name);

  if (!c) {
    document.body.innerHTML += '<div class="container text-center py-5"><h1 class="text-danger">Страна не найдена</h1><a href="index.html">Назад</a></div>';
    return;
  }

  document.getElementById('country-title').textContent = c.name;
  document.getElementById('country-flag-img').src = c.flagImg;
  document.getElementById('country-flag-img').alt = 'Флаг ' + c.name;
  document.getElementById('country-info').innerHTML = `
    <p><strong>Континент:</strong> ${c.continent}</p>
    <p><strong>Столица:</strong> ${c.capital}</p>
    <p><strong>Население:</strong> ${c.population}</p>
    <p><strong>Площадь:</strong> ${c.area}</p>
  `;

  const map = new ymaps.Map('country-map', { center: c.coords, zoom: 4 });
  const placemark = new ymaps.Placemark(c.coords, { balloonContent: c.name });
  map.geoObjects.add(placemark);
});