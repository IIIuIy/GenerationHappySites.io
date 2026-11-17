'use strict';
(function () {

  /* ======================= Данные ======================= */
  const KEY = 'cat_fate_v2';
  const MAX_LIVES = 9;
  const RISK_START = 350;
  const RISK_MAX = 0.55;

  const TIERS = [
    { min: 1,   name: 'Мяукающий хаос',               icon: '🐾', mult: 1.0  },
    { min: 20,  name: 'Кот-исследователь диванов',    icon: '😼', mult: 1.25 },
    { min: 50,  name: 'Серый кардинал кухни',         icon: '😺', mult: 1.55 },
    { min: 100, name: 'Хранитель подоконника',        icon: '🪟', mult: 1.9  },
    { min: 200, name: 'Повелитель коробок',           icon: '📦', mult: 2.35 },
    { min: 400, name: 'Мифический кот-отшельник',     icon: '🌫️', mult: 2.9  },
    { min: 600, name: 'Космический кот-наблюдатель',  icon: '🌌', mult: 3.6  },
    { min: 800, name: 'Абсолютный кошачий архонт',    icon: '🐈‍⬛', mult: 4.5 }
  ];

  const RARITIES = {
    common:    { label: 'Обычная',     mult: 1.0, weight: 58, cls: 'r-common' },
    rare:      { label: 'Редкая',      mult: 1.6, weight: 27, cls: 'r-rare' },
    epic:      { label: 'Эпическая',   mult: 2.6, weight: 12, cls: 'r-epic' },
    legendary: { label: 'Легендарная', mult: 4.5, weight: 3,  cls: 'r-legendary' }
  };
  const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

  const FATES = [
    { id: 'wanderer', icon: '🚶', name: 'Бродячий философ',            rar: 'common' },
    { id: 'temple',   icon: '⛩️', name: 'Храмовый хранитель',          rar: 'common' },
    { id: 'baker',    icon: '🥐', name: 'Кот-пекарь',                  rar: 'common' },
    { id: 'bard',     icon: '🎻', name: 'Кот-бард',                    rar: 'common' },
    { id: 'cyber',    icon: '🤖', name: 'Кибер-кот будущего',          rar: 'rare'   },
    { id: 'spy',      icon: '🕵️', name: 'Кот-шпион',                   rar: 'rare'   },
    { id: 'astro',    icon: '🚀', name: 'Кот-космонавт',               rar: 'rare'   },
    { id: 'alchemy',  icon: '⚗️', name: 'Кот-алхимик',                 rar: 'epic'   },
    { id: 'chrono',   icon: '⏳', name: 'Хроно-кот',                   rar: 'epic'   },
    { id: 'judge',    icon: '⚖️', name: 'Кот-судья девяти жизней',     rar: 'epic'   },
    { id: 'emperor',  icon: '👑', name: 'Кот-император',               rar: 'legendary' },
    { id: 'void',     icon: '🕳️', name: 'Кот из пустоты',              rar: 'legendary' }
  ];

  const ACHS = [
    { id: 'first',   icon: '🐾', name: 'Первое пробуждение', desc: 'Сделай первый бросок возраста.',        check: s => s.rolls >= 1 },
    { id: 'century', icon: '🕰️', name: 'Вековой кот',        desc: 'Успешный бросок с возрастом 100+.',     check: (s, c) => c.success && c.age >= 100 },
    { id: 'veteran', icon: '🎖️', name: 'Ветеран девяти жизней', desc: 'Сделай 9 бросков.',                  check: s => s.rolls >= 9 },
    { id: 'streak',  icon: '🔥', name: 'Полоса везения',     desc: '5 успешных бросков подряд.',            check: s => s.bestStreak >= 5 },
    { id: 'crit',    icon: '💥', name: 'Мурчащий крит',      desc: 'Поймай крит ×2.',                       check: (s, c) => c.crit === true },
    { id: 'legend',  icon: '🌟', name: 'Легенда',            desc: 'Открой легендарную судьбу.',            check: (s, c) => c.rarity === 'legendary' },
    { id: 'collect', icon: '📖', name: 'Коллекционер',       desc: 'Открой все 12 судеб.',                  check: s => s.unlocked.length >= FATES.length },
    { id: 'reborn',  icon: '🔄', name: 'Новая жизнь',        desc: 'Переродись хотя бы раз.',               check: s => s.rebirth >= 1 },
    { id: 'rich',    icon: '💰', name: 'Мурчание в ушах',    desc: 'Набери 10 000 мурчания за жизнь.',      check: s => s.bestScore >= 10000 },
    { id: 'age42',   icon: '🌌', name: 'Ответ на всё',       desc: 'Брось возраст 42.',                     check: (s, c) => c.age === 42 },
    { id: 'age404',  icon: '🛸', name: 'Кот не найден',      desc: 'Брось возраст 404.',                    check: (s, c) => c.age === 404 },
    { id: 'age666',  icon: '😈', name: 'Демонический мур',   desc: 'Брось возраст 666.',                    check: (s, c) => c.age === 666 },
    { id: 'age777',  icon: '🎰', name: 'Джекпот',            desc: 'Брось возраст 777.',                    check: (s, c) => c.age === 777 },
    { id: 'age1000', icon: '🏔️', name: 'Абсолют',            desc: 'Брось 1000 и выживи.',                  check: (s, c) => c.success && c.age >= 1000 }
  ];

  /* ======================= Утилиты ======================= */
  const $ = id => document.getElementById(id);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const fmt = n => Math.round(n).toLocaleString('ru-RU');
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function tierIndexFor(age) {
    let idx = 0;
    for (let i = 0; i < TIERS.length; i++) if (age >= TIERS[i].min) idx = i;
    return idx;
  }
  function riskFor(age) {
    if (age <= RISK_START) return 0;
    return Math.min(RISK_MAX, ((age - RISK_START) / (1000 - RISK_START)) * RISK_MAX);
  }
  function rebirthMult() { return 1 + state.rebirth * 0.1; }

  /* ======================= Состояние ======================= */
  function defaults() {
    return {
      lives: MAX_LIVES, rebirth: 0, score: 0, bestScore: 0, bestAge: 0,
      rolls: 0, successes: 0, streak: 0, bestStreak: 0,
      unlocked: [], achievements: [], sound: true, theme: 'auto'
    };
  }

  function loadState() {
    const base = defaults();
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object') return base;

    const s = Object.assign(base, raw);
    s.lives = clamp(Math.round(Number(s.lives) || 0), 0, MAX_LIVES);
    s.rebirth = Math.max(0, Math.round(Number(s.rebirth) || 0));
    s.score = Math.max(0, Math.round(Number(s.score) || 0));
    s.bestScore = Math.max(0, Math.round(Number(s.bestScore) || 0));
    s.bestAge = clamp(Math.round(Number(s.bestAge) || 0), 0, 1000);
    s.rolls = Math.max(0, Math.round(Number(s.rolls) || 0));
    s.successes = Math.max(0, Math.round(Number(s.successes) || 0));
    s.streak = Math.max(0, Math.round(Number(s.streak) || 0));
    s.bestStreak = Math.max(s.streak, Math.round(Number(s.bestStreak) || 0));
    s.sound = raw.sound !== false;
    s.theme = ['auto', 'light', 'dark'].indexOf(raw.theme) >= 0 ? raw.theme : 'auto';
    s.unlocked = Array.isArray(raw.unlocked)
      ? raw.unlocked.filter((id, i, a) => a.indexOf(id) === i && FATES.some(f => f.id === id))
      : [];
    s.achievements = Array.isArray(raw.achievements)
      ? raw.achievements.filter((id, i, a) => a.indexOf(id) === i && ACHS.some(x => x.id === id))
      : [];
    if (s.bestScore < s.score) s.bestScore = s.score;
    return s;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { toast('⚠️', 'Не удалось сохранить прогресс'); }
  }

  let state = loadState();

  /* ======================= DOM ======================= */
  const el = {
    lives: $('lives'), score: $('score'), best: $('best'), rebirths: $('rebirths'),
    age: $('age'), range: $('ageRange'), catYears: $('catYears'), tierHint: $('tierHint'),
    riskVal: $('riskVal'), riskBar: $('riskBar'),
    controls: $('controls'), result: $('result'), dead: $('dead'),
    rollBtn: $('rollBtn'), luckyBtn: $('luckyBtn'), rebirthBtn: $('rebirthBtn'),
    soundBtn: $('soundBtn'), themeBtn: $('themeBtn'),
    codexBadge: $('codexBadge'), toasts: $('toasts'),
    panel: $('panel'), panelTitle: $('panelTitle'), panelBody: $('panelBody'), panelClose: $('panelClose')
  };

  /* ======================= Звук (WebAudio, без файлов) ======================= */
  const Sfx = (function () {
    let ctx = null, master = null;

    function audio() {
      if (!state.sound) return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.16;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function tone(freq, dur, type, delay, vol) {
      const c = audio();
      if (!c) return;
      const t = c.currentTime + (delay || 0);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      const v = (vol == null ? 1 : vol) * 0.9;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + dur + 0.03);
    }

    return {
      unlock() { audio(); },
      click() { tone(420, 0.06, 'triangle', 0, 0.45); },
      step() { tone(300, 0.05, 'sine', 0, 0.3); },
      success(tier) {
        const scale = [392, 440, 494, 523.25, 587.33, 659.25, 784, 880];
        const f = scale[clamp(tier, 0, scale.length - 1)];
        tone(f, 0.22, 'triangle', 0, 0.65);
        tone(f * 1.5, 0.18, 'sine', 0.06, 0.35);
      },
      rare() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.07, 0.55)); },
      legendary() { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => tone(f, 0.3, 'triangle', i * 0.09, 0.6)); },
      fail() { tone(220, 0.18, 'sawtooth', 0, 0.35); tone(150, 0.3, 'sine', 0.07, 0.45); },
      ach() { [880, 1174.66, 1567.98].forEach((f, i) => tone(f, 0.16, 'sine', i * 0.06, 0.45)); },
      dead() { [392, 329.63, 261.63, 196].forEach((f, i) => tone(f, 0.34, 'sine', i * 0.12, 0.5)); }
    };
  })();

  /* ======================= Частицы ======================= */
  const Particles = (function () {
    const canvas = $('fx');
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let parts = [];
    let raf = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function loop() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.99;
        p.rot += p.spin;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (parts.length) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    function burst(x, y, count, colors) {
      if (reduced) return;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.4 + Math.random() * 4.6;
        parts.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.6,
          life: 1,
          size: 2 + Math.random() * 3,
          color: colors[i % colors.length],
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.3
        });
      }
      if (!raf) raf = requestAnimationFrame(loop);
    }

    return { burst: burst };
  })();

  /* ======================= Тосты ======================= */
  function toast(icon, text) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = '<span aria-hidden="true">' + icon + '</span><span>' + escapeHtml(text) + '</span>';
    el.toasts.appendChild(node);
    while (el.toasts.children.length > 3) el.toasts.firstElementChild.remove();
    setTimeout(() => {
      node.classList.add('out');
      setTimeout(() => node.remove(), 280);
    }, 3200);
  }

  /* ======================= Тема ======================= */
  function currentAge() {
    const n = Number(el.age.value);
    const v = Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
    return clamp(v, 1, 1000);
  }

  function applyTheme() {
    const age = currentAge();
    const resolved = state.theme === 'auto' ? (age > 500 ? 'dark' : 'light') : state.theme;
    document.documentElement.dataset.theme = resolved;
    el.themeBtn.textContent = state.theme === 'auto' ? '🌗' : state.theme === 'dark' ? '🌙' : '☀️';
    const title = 'Тема: ' + (state.theme === 'auto' ? 'авто (по возрасту)' : state.theme === 'dark' ? 'ночь' : 'день');
    el.themeBtn.title = title;
    el.themeBtn.setAttribute('aria-label', title);
  }

  /* ======================= Подсказки под ползунком ======================= */
  function renderHints() {
    const age = currentAge();
    const tier = TIERS[tierIndexFor(age)];
    const risk = riskFor(age);
    el.catYears.textContent = fmt(age * 5);
    el.tierHint.textContent = tier.icon + ' ' + tier.name;
    el.riskVal.textContent = Math.round(risk * 100) + '%';
    el.riskBar.style.width = Math.round((risk / RISK_MAX) * 100) + '%';
    el.riskBar.dataset.level = risk === 0 ? 'safe' : risk < 0.25 ? 'mid' : 'high';
  }

  function setAge(value) {
    const age = clamp(Math.round(Number(value) || 1), 1, 1000);
    el.age.value = age;
    el.range.value = age;
    renderHints();
    applyTheme();
  }

  function readAge() {
    const raw = String(el.age.value).trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1 || n > 1000) return null;
    return Math.round(n);
  }

  /* ======================= HUD ======================= */
  function renderHud() {
    let hearts = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      hearts += '<span class="life' + (i < state.lives ? ' on' : '') + '" aria-hidden="true">' + (i < state.lives ? '❤️' : '🤍') + '</span>';
    }
    el.lives.innerHTML = hearts;
    el.lives.setAttribute('aria-label', 'Осталось жизней: ' + state.lives + ' из ' + MAX_LIVES);
    el.score.textContent = fmt(state.score);
    el.best.textContent = fmt(state.bestScore);
    el.rebirths.textContent = state.rebirth;
  }

  function renderBadges() {
    el.codexBadge.textContent = state.unlocked.length + '/' + FATES.length;
  }

  /* ======================= Достижения ======================= */
  function checkAchievements(ctx) {
    const fresh = [];
    for (const a of ACHS) {
      if (state.achievements.indexOf(a.id) >= 0) continue;
      let ok = false;
      try { ok = !!a.check(state, ctx); } catch (e) { ok = false; }
      if (ok) {
        state.achievements.push(a.id);
        fresh.push(a);
      }
    }
    return fresh;
  }

  /* ======================= Бросок ======================= */
  function rollRarity() {
    const total = RARITY_ORDER.reduce((sum, k) => sum + RARITIES[k].weight, 0);
    let r = Math.random() * total;
    for (const k of RARITY_ORDER) {
      r -= RARITIES[k].weight;
      if (r <= 0) return k;
    }
    return 'common';
  }

  function chip(text) {
    return '<span class="chip">' + escapeHtml(text) + '</span>';
  }

  function renderResult(r) {
    const box = el.result;
    box.hidden = false;
    box.classList.remove('result');
    void box.offsetWidth;
    box.classList.add('result');

    if (!r.success) {
      box.innerHTML =
        '<div class="aura r-fail"><span>💨</span></div>' +
        '<div class="rarity">Риск ' + Math.round(r.risk * 100) + '%</div>' +
        '<h2>Кот рассеялся…</h2>' +
        '<p class="fate">Возраст ' + fmt(r.age) + ' оказался слишком велик. Жизнь потеряна, серия сброшена.</p>' +
        '<p class="roll-score">0 мурчания</p>' +
        '<div class="breakdown">' +
          chip('возраст ' + r.age) +
          chip('тир: ' + r.tier.name) +
          chip('шанс провала ' + Math.round(r.risk * 100) + '%') +
        '</div>';
      return;
    }

    const rar = RARITIES[r.rarity];
    box.innerHTML =
      '<div class="aura r-' + r.rarity + '"><span>' + r.fate.icon + '</span></div>' +
      '<div class="rarity r-' + r.rarity + '">' + rar.label + ' судьба</div>' +
      '<h2>' + escapeHtml(r.tier.name) + '</h2>' +
      '<p class="fate">Судьба: <b>' + r.fate.icon + ' ' + escapeHtml(r.fate.name) + '</b></p>' +
      '<p class="roll-score">+' + fmt(r.gained) + ' мурчания</p>' +
      '<div class="breakdown">' +
        chip('возраст ' + r.age) +
        chip('тир ×' + r.tier.mult) +
        chip('редкость ×' + rar.mult) +
        (r.crit ? chip('крит ×2') : '') +
        (state.rebirth ? chip('перерождение ×' + rebirthMult().toFixed(1)) : '') +
      '</div>';
  }

  function shake() {
    el.age.classList.remove('shake');
    void el.age.offsetWidth;
    el.age.classList.add('shake');
  }

  let busy = false;

  function roll() {
    if (busy) return;
    if (state.lives <= 0) { toast('🕯️', 'Жизни закончились — переродись'); return; }

    const age = readAge();
    if (age === null) {
      shake();
      toast('⚠️', 'Возраст должен быть от 1 до 1000');
      Sfx.fail();
      return;
    }

    busy = true;
    Sfx.unlock();

    const risk = riskFor(age);
    const success = Math.random() >= risk;
    const ti = tierIndexFor(age);
    const tier = TIERS[ti];

    let rarity = null;
    let fate = null;
    let crit = false;
    let gained = 0;

    if (success) {
      rarity = rollRarity();
      const pool = FATES.filter(f => f.rar === rarity);
      fate = pool.length ? pick(pool) : pick(FATES);
      crit = Math.random() < 0.1;
      gained = Math.round(age * tier.mult * RARITIES[rarity].mult * (crit ? 2 : 1) * rebirthMult());
      state.score += gained;
      state.successes++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.bestAge = Math.max(state.bestAge, age);
      if (state.unlocked.indexOf(fate.id) < 0) state.unlocked.push(fate.id);
    } else {
      state.streak = 0;
    }

    state.rolls++;
    state.lives = Math.max(0, state.lives - 1);
    state.bestScore = Math.max(state.bestScore, state.score);

    const ctx = { age: age, success: success, crit: crit, rarity: rarity, fateId: fate ? fate.id : null, gained: gained };
    const fresh = checkAchievements(ctx);

    save();
    renderHud();
    renderResult({ age: age, ti: ti, tier: tier, success: success, rarity: rarity, fate: fate, crit: crit, gained: gained, risk: risk });
    renderBadges();

    if (!success) Sfx.fail();
    else if (rarity === 'legendary') Sfx.legendary();
    else if (rarity === 'epic' || rarity === 'rare') Sfx.rare();
    else Sfx.success(ti);

    if (success && (rarity === 'legendary' || rarity === 'epic')) {
      const aura = el.result.querySelector('.aura');
      if (aura) {
        const b = aura.getBoundingClientRect();
        const gold = ['#facc15', '#fb923c', '#f472b6', '#fde68a'];
        const pink = ['#e879f9', '#c084fc', '#f0abfc'];
        Particles.burst(b.left + b.width / 2, b.top + b.height / 2, rarity === 'legendary' ? 46 : 24, rarity === 'legendary' ? gold : pink);
      }
    }

    fresh.forEach((a, i) => {
      setTimeout(() => {
        toast(a.icon, 'Достижение: ' + a.name);
        Sfx.ach();
      }, 320 + i * 520);
    });

    if (state.lives <= 0) {
      setTimeout(() => {
        showDead();
        Sfx.dead();
      }, 950);
    }

    busy = false;
  }

  /* ======================= Конец игры и перерождение ======================= */
  function showDead() {
    el.dead.hidden = false;
    el.controls.hidden = true;
    el.result.hidden = true;
    el.dead.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function hideDead() {
    el.dead.hidden = true;
    el.controls.hidden = false;
  }

  function rebirth() {
    state.rebirth++;
    state.lives = MAX_LIVES;
    state.score = 0;
    state.streak = 0;

    const fresh = checkAchievements({ age: 0, success: false, crit: false, rarity: null, fateId: null, gained: 0 });

    save();
    hideDead();
    renderHud();
    renderBadges();
    el.result.hidden = true;
    el.result.innerHTML = '';
    toast('🔄', 'Перерождение №' + state.rebirth + ': девять жизней снова с тобой');
    Sfx.legendary();
    fresh.forEach((a, i) => {
      setTimeout(() => {
        toast(a.icon, 'Достижение: ' + a.name);
        Sfx.ach();
      }, 420 + i * 520);
    });
  }

  /* ======================= Панели ======================= */
  function codexHtml() {
    const cards = FATES.map(f => {
      const got = state.unlocked.indexOf(f.id) >= 0;
      return '<div class="fate-card k-' + f.rar + (got ? '' : ' locked') + '">' +
        '<span class="fi" aria-hidden="true">' + (got ? f.icon : '🔒') + '</span>' +
        '<span style="min-width:0">' +
          '<span class="fn">' + (got ? escapeHtml(f.name) : 'Не открыта') + '</span>' +
          '<span class="fr">' + RARITIES[f.rar].label + '</span>' +
        '</span>' +
      '</div>';
    }).join('');

    return '<p class="panel-text">Открыто ' + state.unlocked.length + ' из ' + FATES.length +
      '. Каждая судьба выпадает случайно: редкость влияет на мурчание, а легендарные встречаются реже всех.</p>' +
      '<div class="codex">' + cards + '</div>';
  }

  function recordsHtml() {
    const rows = [
      ['Лучший результат за жизнь', fmt(state.bestScore)],
      ['Мурчание сейчас', fmt(state.score)],
      ['Лучший возраст', state.bestAge ? fmt(state.bestAge) : '—'],
      ['Успешных пробуждений', fmt(state.successes) + ' из ' + fmt(state.rolls)],
      ['Лучшая серия', fmt(state.bestStreak)],
      ['Перерождений', fmt(state.rebirth)],
      ['Открыто судеб', state.unlocked.length + ' / ' + FATES.length],
      ['Достижений', state.achievements.length + ' / ' + ACHS.length]
    ];
    const rec = rows.map(r => '<div class="rec"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
    const achs = ACHS.map(a => {
      const got = state.achievements.indexOf(a.id) >= 0;
      return '<div class="ach' + (got ? ' got' : '') + '">' +
        '<span class="ai" aria-hidden="true">' + (got ? a.icon : '🔒') + '</span>' +
        '<span><b>' + a.name + '</b><span class="ad">' + a.desc + '</span></span>' +
      '</div>';
    }).join('');

    return '<div class="rec-list">' + rec + '</div>' +
      '<h3 class="panel-sub">Достижения</h3>' +
      '<div class="achs">' + achs + '</div>' +
      '<div class="panel-foot"><button class="btn danger" type="button" data-act="reset">Сбросить прогресс</button></div>';
  }

  function rulesHtml() {
    return '<p class="panel-text"><b>Цель</b> — прожить девять жизней и выжать максимум мурчания, не потеряв кота.</p>' +
      '<div class="rec-list">' +
        '<div class="rec"><span>1. Возраст</span><b>1–1000</b></div>' +
        '<div class="rec"><span>2. Жизней на попытки</span><b>9</b></div>' +
        '<div class="rec"><span>3. Риск рассеяния</span><b>от 350 лет</b></div>' +
        '<div class="rec"><span>4. Крит</span><b>10% ×2</b></div>' +
        '<div class="rec"><span>5. Бонус за перерождение</span><b>+10%</b></div>' +
      '</div>' +
      '<p class="panel-text" style="margin-top:12px">Чем старше кот, тем выше тир и множитель, но с 350 лет появляется шанс, что кот рассеяется: жизнь сгорит без награды. Оптимум по ожиданию — примерно 760–800 лет.</p>' +
      '<p class="panel-text">Редкости: обычная ×1 (58%), редкая ×1.6 (27%), эпическая ×2.6 (12%), легендарная ×4.5 (3%).</p>' +
      '<p class="panel-text">Секретные возраста: <b>42, 404, 666, 777, 1000</b>. Прогресс хранится в браузере, звук синтезируется на месте — внешних файлов нет.</p>';
  }

  function openPanel(kind) {
    const titles = { codex: '📖 Кодекс судеб', records: '🏆 Рекорды и достижения', rules: '❔ Как играть' };
    el.panelTitle.textContent = titles[kind] || '';
    el.panelBody.innerHTML = kind === 'codex' ? codexHtml() : kind === 'records' ? recordsHtml() : rulesHtml();
    resetArmed = false;
    if (typeof el.panel.showModal === 'function') {
      if (!el.panel.open) el.panel.showModal();
    } else {
      el.panel.setAttribute('open', '');
    }
  }

  function closePanel() {
    if (typeof el.panel.close === 'function') el.panel.close();
    else el.panel.removeAttribute('open');
  }

  let resetArmed = false;

  function resetGame() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    state = defaults();
    save();
    hideDead();
    el.result.hidden = true;
    el.result.innerHTML = '';
    renderHud();
    renderBadges();
    renderHints();
    applyTheme();
    closePanel();
    toast('🧹', 'Прогресс сброшен — начинаем с девяти жизней');
  }

  /* ======================= События ======================= */
  let lastStepAt = 0;
  function stepTick() {
    const now = performance.now();
    if (now - lastStepAt > 55) {
      lastStepAt = now;
      Sfx.step();
      if (navigator.vibrate) navigator.vibrate(4);
    }
  }

  el.age.addEventListener('input', function () {
    const raw = el.age.value;
    if (raw === '') return;
    el.range.value = clamp(Math.round(Number(raw) || 1), 1, 1000);
    renderHints();
    applyTheme();
  });
  el.age.addEventListener('blur', function () { setAge(el.age.value); });
  el.age.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      roll();
    }
  });

  el.range.addEventListener('input', function () {
    setAge(el.range.value);
    stepTick();
  });

  document.querySelectorAll('.step').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const step = Number(btn.dataset.step) || 0;
      setAge(currentAge() + step);
      Sfx.step();
      el.age.focus();
    });
  });

  el.luckyBtn.addEventListener('click', function () {
    setAge(randInt(1, 1000));
    Sfx.click();
  });

  el.rollBtn.addEventListener('click', roll);
  el.rebirthBtn.addEventListener('click', rebirth);

  el.soundBtn.addEventListener('click', function () {
    state.sound = !state.sound;
    save();
    renderSound();
    if (state.sound) { Sfx.unlock(); Sfx.click(); }
    toast(state.sound ? '🔊' : '🔇', state.sound ? 'Звук включён' : 'Звук выключен');
  });

  function renderSound() {
    el.soundBtn.textContent = state.sound ? '🔊' : '🔇';
    el.soundBtn.setAttribute('aria-pressed', String(state.sound));
    el.soundBtn.title = state.sound ? 'Выключить звук' : 'Включить звук';
  }

  el.themeBtn.addEventListener('click', function () {
    state.theme = state.theme === 'auto' ? 'light' : state.theme === 'light' ? 'dark' : 'auto';
    save();
    applyTheme();
    Sfx.click();
  });

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      openPanel(tab.dataset.panel);
      Sfx.click();
    });
  });

  el.panelClose.addEventListener('click', closePanel);
  el.panel.addEventListener('click', function (e) {
    if (e.target === el.panel) closePanel();
  });

  el.panelBody.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-act="reset"]');
    if (!btn) return;
    if (!resetArmed) {
      resetArmed = true;
      btn.textContent = 'Точно? Нажми ещё раз';
      btn.classList.add('armed');
      setTimeout(function () {
        if (!btn.isConnected) return;
        resetArmed = false;
        btn.textContent = 'Сбросить прогресс';
        btn.classList.remove('armed');
      }, 4000);
      return;
    }
    resetGame();
  });

  /* ======================= Старт ======================= */
  renderSound();
  renderHud();
  renderBadges();
  el.range.value = el.age.value;
  renderHints();
  applyTheme();
  if (state.lives <= 0) showDead();

})();