(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => innerWidth < 760;

  /* ---------- Данные: цены условные, отзывы с Яндекс Карт ---------- */
  const LEVELS = [
    { name: 'Барбер', short: 'Барбер', hint: 'Барбер — уверенные классические и современные стрижки.' },
    { name: 'Старший барбер', short: 'Старший', hint: 'Старший барбер — больше опыта: длинные волосы, сложные переходы, точная форма бороды.' },
    { name: 'Эксперт', short: 'Эксперт', hint: 'Эксперт — самые опытные мастера: авторские стрижки и сложные работы.' },
  ];
  const SERVICES = [
    { name: 'Мужская стрижка', desc: 'Ножницы и машинка, мытьё и укладка', img: 'cut.webp', alt: 'Барбер стрижёт клиента ножницами', p: [1700, 2000, 2300] },
    { name: 'Стрижка машинкой', desc: 'Одна или несколько насадок, чёткий контур', img: 'fade.webp', alt: 'Барбер делает переход машинкой', p: [1200, 1200, 1200] },
    { name: 'Моделирование бороды', desc: 'Форма, контур бритвой, уход', img: 'beard.webp', alt: 'Барбер подравнивает бороду ножницами', p: [1400, 1700, 2000] },
    { name: 'Стрижка + борода', desc: 'Комплекс за один визит', img: 'shave.webp', alt: 'Барбер бреет клиента опасной бритвой', p: [2900, 3400, 3900] },
    { name: 'Уход за лицом Volcano', desc: 'Очищение и уход за кожей', img: 'razor.webp', alt: 'Уход за лицом с паром', p: [2000, 2000, 2000] },
  ];
  const EXTRAS = [['Коррекция воском', 600], ['Камуфляж седины', 1900]];
  const MASTERS = [
    ['Богдан', 'Внимательно слушает, задаёт уточняющие вопросы — получилось именно то, что хотел.', 'Игорь, отзыв на Картах'],
    ['Мария', 'С полуслова поняла, какой результат я хочу. Сложная стрижка и борода — супер.', 'Евгений, отзыв на Картах'],
    ['Екатерина', 'Когда пришёл к профессионалу, понял: разница есть, и это сразу заметно.', 'Николай, отзыв на Картах'],
    ['Максим', 'Команда настоящих профи во главе с моим фаворитом Максимом.', 'Алексей, отзыв на Картах'],
  ];
  const REVIEWS = [
    ['Игорь', '19 июля', 'Был впервые и приятно удивлён атмосферой и сервисом. Чисто мужская точка, приятный свет, отличная музыка, комфортная зона ожидания: кофе-машина, игровая приставка. Рад знакомству с Богданом — внимательно слушает и уточняет.'],
    ['Владимир К.', '8 ноября 2025', 'Стригся здесь больше 10 раз и каждый раз уходил довольным. Профессионализм и дружелюбие. Нравится, что предлагают чай и кофе с собой, а бот ненавязчиво напоминает о стрижке.'],
    ['Эрн', '16 августа 2025', 'Хожу уже полгода — пожалуй, лучшее место за последние годы. Самое адекватное соотношение цены и качества, и все мастера сильные: иду к тому, кто свободен в удобное время.'],
    ['Евгений', '19 марта', 'Случайно попал к мастеру Марии — идите смело. С полуслова поняла, какой результат я хочу. Волосы длинные, стрижка сложная, а результат получился суперским — и стрижка, и борода.'],
    ['Николай Т.', '29 августа 2025', 'У вас отличный мастер Екатерина! Раньше не придавал значения тому, насколько криво могут стричь. Качественная стрижка действительно имеет значение, и это сразу заметно.'],
    ['Алексей', '26 сентября 2025', 'Команда настоящих профи во главе с моим фаворитом Максимом. Не знаю, в каких шаолиньских монастырях их учили, но они лучшие! Цены приемлемые, обстановка комфортная.'],
  ];

  let level = 0;

  /* ---------- Уровни и прайс ---------- */
  function levelButtons(el, cls) {
    el.innerHTML = LEVELS.map((l, i) => `<button type="button" role="tab" data-level="${i}" class="${cls || ''}">${narrow() ? l.short : l.name}</button>`).join('');
  }
  levelButtons($('#levels')); levelButtons($('#bookLevels'));

  $('#cards').innerHTML = SERVICES.map((s, i) => `
    <article class="card reveal" style="--i:${i}">
      <div class="card__img"><img src="img/${s.img}" alt="${s.alt}" width="1000" height="1333"></div>
      <div class="card__body">
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
        <div class="card__price" data-cprice="${i}"></div>
        <a class="btn btn--line" href="#booking" data-book="${i}">Записаться</a>
      </div>
    </article>`).join('');
  $('#extras').innerHTML = EXTRAS.map(([n, p]) => `<li><span>${n}</span><b>${rub(p)}</b></li>`).join('');

  function setLevel(i) {
    level = i;
    $$('[data-level]').forEach(b => b.classList.toggle('is-on', +b.dataset.level === i));
    $('#levelHint').textContent = LEVELS[i].hint;
    $$('[data-cprice]').forEach(el => {
      const v = rub(SERVICES[+el.dataset.cprice].p[i]);
      if (el.textContent === v) return;
      if (reduce || !el.textContent) { el.textContent = v; return; }
      el.classList.add('is-swap');
      setTimeout(() => { el.textContent = v; el.classList.remove('is-swap'); }, 160);
    });
    // цены в записи
    $$('#svcList input[data-svc]').forEach(c => { c.dataset.price = SERVICES[+c.dataset.svc].p[i]; c.parentElement.querySelector('b').textContent = rub(+c.dataset.price); });
    renderSum();
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-level]'); if (b) setLevel(+b.dataset.level); });

  /* ---------- Мастера и отзывы ---------- */
  $('#teamGrid').innerHTML = MASTERS.map(([n, q, who], i) => `
    <article class="master reveal" style="--i:${i}">
      <div class="master__mono">${n[0]}</div>
      <h3>${n}</h3>
      <q>${q}</q>
      <small>${who}</small>
    </article>`).join('');
  $('#rv').innerHTML = REVIEWS.map(([who, date, text], i) => `
    <article class="rv__item reveal" style="--i:${i % 3}">
      <div class="rv__stars" aria-label="5 из 5">★★★★★</div>
      <p>${text}</p>
      <div class="rv__who"><b>${who}</b><span>${date}</span></div>
    </article>`).join('');

  /* ---------- Открыто / Закрыто по Москве ---------- */
  function mskNow() {
    const p = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    return +p.find(x => x.type === 'hour').value * 60 + +p.find(x => x.type === 'minute').value;
  }
  const OPEN = 10 * 60, CLOSE = 21 * 60;
  function paintStatus() {
    const t = mskNow(), open = t >= OPEN && t < CLOSE;
    const text = open ? (CLOSE - t <= 60 ? `Открыто ещё ${CLOSE - t} мин · до 21:00` : 'Открыто сейчас · до 21:00') : 'Закрыто · с 10:00 — запишитесь онлайн';
    $$('[data-status]').forEach(el => {
      el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open);
      el.querySelector('span').textContent = el.classList.contains('status--inline') ? (open ? 'открыто' : 'закрыто') : text;
    });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- Онлайн-запись ---------- */
  const selected = new Set();
  let activeDay = 0, activeSlot = null;
  $('#svcList').innerHTML =
    SERVICES.map((s, i) => `<label><input type="checkbox" data-svc="${i}" data-name="${s.name}" data-price="${s.p[0]}"><span>${s.name}</span><b>${rub(s.p[0])}</b></label>`).join('') +
    EXTRAS.map(([n, p]) => `<label><input type="checkbox" data-name="${n}" data-price="${p}"><span>${n}</span><b>${rub(p)}</b></label>`).join('');
  $('#svcList').addEventListener('change', e => {
    const c = e.target; if (!c.dataset.name) return;
    c.checked ? selected.add(c.dataset.name) : selected.delete(c.dataset.name);
    renderSum();
  });

  const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const mskToday = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const days = Array.from({ length: 7 }, (_, i) => { const d = mskToday(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  const SLOTS = []; for (let m = OPEN; m <= CLOSE - 60; m += 60) SLOTS.push(m);
  const fmt = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const busy = (d, m) => { const x = Math.sin(d.getDate() * 53 + d.getMonth() * 17 + m * 3.77) * 10000; return (x - Math.floor(x)) < 0.4; };

  $('#days').innerHTML = days.map((d, i) => `<button type="button" class="day" data-day="${i}"><small>${i === 0 ? 'сег' : DOW[d.getDay()]}</small><b>${d.getDate()}</b></button>`).join('');
  function renderSlots() {
    $$('.day').forEach(b => b.classList.toggle('is-on', +b.dataset.day === activeDay));
    const d = days[activeDay], now = mskNow();
    $('#slots').innerHTML = SLOTS.map(m => {
      const off = busy(d, m) || (activeDay === 0 && m <= now + 30);
      return `<button type="button" class="slot${activeSlot === m && !off ? ' is-on' : ''}" data-slot="${m}" ${off ? 'disabled aria-label="' + fmt(m) + ' занято"' : ''}>${fmt(m)}</button>`;
    }).join('');
  }
  $('#days').addEventListener('click', e => { const b = e.target.closest('.day'); if (!b) return; activeDay = +b.dataset.day; activeSlot = null; renderSlots(); renderSum(); });
  $('#slots').addEventListener('click', e => { const b = e.target.closest('.slot'); if (!b || b.disabled) return; activeSlot = +b.dataset.slot; renderSlots(); renderSum(); });
  if (SLOTS.every(m => busy(days[0], m) || m <= mskNow() + 30)) activeDay = 1;

  const whenText = () => activeSlot == null ? '—' : `${activeDay === 0 ? 'сегодня' : activeDay === 1 ? 'завтра' : DOW[days[activeDay].getDay()]}, ${days[activeDay].getDate()} ${MON[days[activeDay].getMonth()]}, ${fmt(activeSlot)}`;
  const promoInput = $('[name="promo"]');
  function totals() {
    const sum = $$('#svcList input:checked').reduce((a, c) => a + +c.dataset.price, 0);
    const promo = promoInput.value.trim().toUpperCase() === 'ПЕРВЫЙ' && sum >= 1800;
    return { sum, promo, total: sum - (promo ? 300 : 0) };
  }
  function renderSum() {
    const names = $$('#svcList input:checked').map(c => c.dataset.name);
    $('#sumList').textContent = names.length ? names.join(', ') + ` · ${LEVELS[level].name.toLowerCase()}` : 'ничего';
    $('#sumWhen').textContent = whenText();
    const t = totals();
    $('#sumPromoRow').hidden = !t.promo;
    $('#sumTotal').textContent = rub(t.total);
    $('#bookErr').textContent = '';
  }
  promoInput.addEventListener('input', renderSum);

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-book]');
    if (a) { const c = $(`#svcList input[data-svc="${a.dataset.book}"]`); if (c && !c.checked) { c.checked = true; selected.add(c.dataset.name); } renderSum(); }
    if (e.target.closest('[data-promo]')) { promoInput.value = 'ПЕРВЫЙ'; const c = $('#svcList input[data-svc="0"]'); if (!c.checked) c.checked = true; renderSum(); }
  });

  const phone = $('[name="phone"]');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    phone.value = '+7' + (p[0] ? ` (${p[0]}` : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ` ${p[1]}` : '') + (p[2] ? `-${p[2]}` : '') + (p[3] ? `-${p[3]}` : '');
  });

  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('[name="name"]').value.trim();
    const n = $$('#svcList input:checked').length;
    const err = !n ? 'Отметьте хотя бы одну услугу.' : activeSlot == null ? 'Выберите день и свободное время.' : !name ? 'Укажите имя.' : phone.value.replace(/\D/g, '').length < 11 ? 'Укажите телефон полностью.' : '';
    if (err) { $('#bookErr').textContent = err; return; }
    const t = totals();
    $('#doneText').textContent = `${name}, ждём вас ${whenText()} на Генерала Белова, 1/8. ${$('#sumList').textContent}. К оплате ${rub(t.total)}${t.promo ? ' с учётом промокода' : ''}. Напомним о визите накануне.`;
    $('#bookForm').hidden = true; $('#done').hidden = false;
    $('#done').scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  });
  $('#doneBack').addEventListener('click', () => {
    $('#bookForm').reset(); selected.clear(); activeSlot = null;
    renderSlots(); setLevel(level);
    $('#done').hidden = true; $('#bookForm').hidden = false;
  });

  renderSlots(); setLevel(0);
  addEventListener('resize', () => { const n = narrow(); if (n !== window.__n) { window.__n = n; $$('[data-level]').forEach(b => b.textContent = n ? LEVELS[+b.dataset.level].short : LEVELS[+b.dataset.level].name); } });
  window.__n = narrow();

  /* ---------- Анимации ---------- */
  const top = $('#top'), heroMedia = $('.hero__media'), heroIn = $('.hero__in'), word = $('.hero__word');
  const steps = $$('.step'), shots = $$('.how__shot'), howNum = $('[data-how-num]');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    top.classList.toggle('is-solid', y > 30);
    if (!reduce && y < vh * 1.3) {
      const p = Math.min(y / vh, 1);
      heroMedia.style.transform = `translate3d(0,${p * 90}px,0) scale(${1 + p * 0.1})`;
      heroIn.style.transform = `translate3d(0,${-p * 60}px,0)`;
      heroIn.style.opacity = String(Math.max(0, 1 - p * 1.3));
      word.style.transform = `translate3d(${-p * 35}%,0,0)`;
    }
    let best = 0, dist = Infinity;
    steps.forEach((s, i) => { const r = s.getBoundingClientRect(), c = Math.abs(r.top + Math.min(r.height, vh) / 3 - vh / 2); if (c < dist) { dist = c; best = i; } });
    steps.forEach((s, i) => s.classList.toggle('is-on', i === best));
    shots.forEach((s, i) => s.classList.toggle('is-on', i === best));
    howNum.textContent = '0' + (best + 1);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  const els = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(el => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      const el = en.target;
      if (en.isIntersecting) { el.classList.add('is-in'); el.classList.remove('is-above'); }
      else { el.classList.remove('is-in'); el.classList.toggle('is-above', en.boundingClientRect.top < 0); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }
})();
