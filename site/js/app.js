'use strict';
(() => {
// ───────────────────────── temel ─────────────────────────
const LANGS = { en: { name: 'İngilizce', sr: 'en-US' }, ka: { name: 'Gürcüce', sr: 'ka-GE' } };
const LV = ['', 'A1', 'A2', 'B1', 'B2'];
const LVNAME = ['', 'Başlangıç', 'Temel', 'Orta', 'Orta üstü'];
const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];
const KEY = 'dilustasi.v1';
const WEEK = 7 * 864e5;
const KA_LETTERS = 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ';
const EN_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const KA_MAP = { ა:'a',ბ:'b',გ:'g',დ:'d',ე:'e',ვ:'v',ზ:'z',თ:'t',ი:'i',კ:"k'",ლ:'l',მ:'m',ნ:'n',ო:'o',პ:"p'",ჟ:'j',რ:'r',ს:'s',ტ:"t'",უ:'u',ფ:'p',ქ:'k',ღ:'ğ',ყ:"q'",შ:'ş',ჩ:'ç',ც:'ts',ძ:'dz',წ:"ts'",ჭ:"ç'",ხ:'kh',ჯ:'c',ჰ:'h' };

const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const dayNum = (t = Date.now()) => { const d = new Date(t); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const pick = a => a[Math.floor(Math.random() * a.length)];
const translit = s => [...s].map(c => KA_MAP[c] ?? c).join('');

const put = (el, ...kids) => el['replace'+'Children'](...kids.flat(Infinity).filter(x => x != null && x !== false));
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return e;
}

// ───────────────────────── durum ─────────────────────────
const freshLang = () => ({ level: 1, placed: false, srs: {}, tests: [], lastTest: 0, done: {}, abc: {}, lessonDay: 0, hi: 0 });
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  s = s && typeof s === 'object' ? s : {};
  s.lang = s.lang === 'ka' ? 'ka' : 'en';
  s.xp = s.xp || 0; s.streak = s.streak || 0; s.lastDay = s.lastDay || 0; s.log = s.log || {};
  s.L = s.L || {};
  for (const l of ['en', 'ka']) s.L[l] = Object.assign(freshLang(), s.L[l]);
  s.set = Object.assign({ newPerDay: 8, translit: true }, s.set);
  return s;
}
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const P = () => S.L[S.lang];
const tw = it => it[S.lang];

function addXp(n) {
  const d = dayNum();
  S.xp += n; S.log[d] = (S.log[d] || 0) + n;
  if (S.lastDay !== d) { S.streak = S.lastDay === d - 1 ? S.streak + 1 : 1; S.lastDay = d; }
  save(); paintTop();
}
const weekNum = () => Math.floor((dayNum() + 3) / 7); // Pazartesi başlangıçlı hafta
function act(lang = S.lang) {
  const L = S.L[lang], w = weekNum();
  if (!L.act || L.act.w !== w) L.act = { w, prev: L.act && L.act.w === w - 1 ? { ...L.act, prev: undefined } : null };
  return L.act;
}
function bump(kind) { const a = act(); a[kind] = (a[kind] || 0) + 1; save(); }
const streakNow = () => (S.lastDay >= dayNum() - 1 ? S.streak : 0);

// ───────────────────────── ses ─────────────────────────
let curAudio = null, curRes = null;
function stopAudio() {
  if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; }
  if (curRes) { const r = curRes; curRes = null; r(false); }
  try { speechSynthesis.cancel(); } catch (e) {}
}
function say(text, opt = {}) {
  const lang = opt.lang || S.lang;
  stopAudio();
  return new Promise(res => {
    const a = new Audio(audioPath(lang, text, opt.voice));
    curAudio = a; curRes = res;
    const fin = v => { if (curRes === res) { curRes = null; } res(v); };
    a.playbackRate = opt.rate || 1;
    a.onended = () => fin(true);
    a.onerror = () => {
      try { // yedek: cihazın kendi sesi
        const u = new SpeechSynthesisUtterance(text); u.lang = LANGS[lang].sr; u.rate = (opt.rate || 1) * 0.9;
        u.onend = () => fin(true); u.onerror = () => fin(false);
        speechSynthesis.speak(u);
      } catch (e) { fin(false); }
    };
    a.play().catch(() => fin(false));
  });
}
let actx;
function beep(ok) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.connect(g); g.connect(actx.destination);
    o.frequency.setValueAtTime(ok ? 660 : 200, t); if (ok) o.frequency.setValueAtTime(990, t + .09);
    g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + .28);
    o.start(t); o.stop(t + .3);
  } catch (e) {}
}

// APK içinde: Android'in kendi konuşma tanıması (WebView'de Web Speech API yok)
class NativeSR {
  start() { NativeSR.cur = this; window.AndroidSR.start(this.lang || 'en-US'); }
  stop() { window.AndroidSR.stop(); }
  abort() { NativeSR.cur = null; window.AndroidSR.stop(); }
}
window.__sr = (type, data) => {
  const r = NativeSR.cur; if (!r) return;
  if (type === 'result') r.onresult && r.onresult({ results: [data.map(t => ({ transcript: t }))] });
  else if (type === 'error') r.onerror && r.onerror({ error: data });
  else if (type === 'end') { NativeSR.cur = null; r.onend && r.onend(); }
};
const getSR = () => (window.AndroidSR ? NativeSR : window.SpeechRecognition || window.webkitSpeechRecognition);

// ───────────────────────── kelime havuzları / SRS ─────────────────────────
const byLevel = l => WORDS.filter(w => w.l === l);
const learned = () => WORDS.filter(w => P().srs[w.id]);
const dueWords = () => { const d = dayNum(); return WORDS.filter(w => P().srs[w.id] && P().srs[w.id].d <= d); };
const mastered = (lang = S.lang) => Object.values(S.L[lang].srs).filter(s => s.b >= 4).length;
function newWords(n) {
  const lv = P().level, order = [lv];
  for (let k = 1; k < 4; k++) { if (lv - k >= 1) order.push(lv - k); }
  for (let k = 1; k < 4; k++) { if (lv + k <= 4) order.push(lv + k); }
  const out = [];
  for (const l of order) for (const w of byLevel(l)) { if (!P().srs[w.id]) { out.push(w); if (out.length >= n) return out; } }
  return out;
}
function grade(w, ok) {
  const srs = P().srs, s = srs[w.id] || (srs[w.id] = { b: 0, d: 0 });
  s.b = ok ? Math.min(6, s.b + 1) : 1;
  s.d = dayNum() + BOX_DAYS[s.b];
}
function gamePool(min = 12) {
  const l = learned();
  if (l.length >= min) return l;
  const lv = P().level;
  return WORDS.filter(w => w.l <= lv);
}
function distract(w, n, pool) {
  pool = pool || WORDS.filter(x => Math.abs(x.l - w.l) <= 1);
  const out = [], seen = new Set([w.tr, tw(w)]), seenE = new Set([w.e]);
  for (const x of shuffle(pool)) {
    if (seen.has(x.tr) || seen.has(tw(x)) || seenE.has(x.e)) continue;
    seen.add(x.tr); seen.add(tw(x)); seenE.add(x.e); out.push(x);
    if (out.length >= n) break;
  }
  return out;
}
const sentsUpTo = l => SENTENCES.filter(s => s.l <= l);

// ───────────────────────── metin karşılaştırma ─────────────────────────
const norm = s => s.toLowerCase().replace(/[.,!?;:'’"“”„\-–—()]/g, ' ').replace(/\s+/g, ' ').trim();
const core = s => norm(s).replace(/^to /, '');
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const sim = (a, b) => { a = core(a); b = core(b); const L = Math.max(a.length, b.length) || 1; return 1 - lev(a, b) / L; };

// ───────────────────────── ortak arayüz parçaları ─────────────────────────
const tl = text => (S.lang === 'ka' && S.set.translit ? h('span', { class: 'tlit' }, translit(text)) : null);
const spk = (text, opt = {}) => h('button', { class: 'spk' + (opt.big ? ' big' : ''), title: 'Dinle', onclick: e => { e.stopPropagation(); say(text, opt); } }, opt.rate && opt.rate < 1 ? '🐢' : '🔊');
const lvBadge = l => h('span', { class: 'badge' + (l <= P().level ? '' : ' o') }, LV[l]);
function page(title, back, ...nodes) {
  put(view, h('div', { class: 'phead' }, h('a', { class: 'back', href: '#' + back, style: 'display:grid;place-items:center' }, '‹'), h('h1', null, title)), ...nodes.flat());
  window.scrollTo(0, 0);
}
const item = (ic, title, sub, href, right) => h(href ? 'a' : 'div', { class: 'item', href }, h('span', { class: 'ic' }, ic), h('span', { class: 'grow' }, h('b', null, title), sub && h('small', null, sub)), right || h('span', { class: 'chev' }, '›'));

function paintTop() {
  document.body.classList.toggle('ka', S.lang === 'ka');
  document.querySelectorAll('#langseg button').forEach(b => b.classList.toggle('on', b.dataset.lang === S.lang));
  $('#streak').textContent = '🔥 ' + streakNow();
  const m = $('meta[name=theme-color]'); if (m) m.content = S.lang === 'ka' ? '#c81e3a' : '#2563eb';
}
$('#langseg').addEventListener('click', e => {
  const l = e.target.dataset.lang; if (!l || l === S.lang) return;
  S.lang = l; save(); paintTop(); closePlayer(); route();
});

// ───────────────────────── oturum motoru ─────────────────────────
let session = null;
function endSession() { if (session) { session.kill(); session = null; } document.body.classList.remove('in-session'); }

function runSession({ title, steps, back = 'home', srs = false, noRetry = false, silent = false, xpEach = 10, bonus = 0, onDone, onStep, kind }) {
  endSession(); stopAudio();
  steps = steps.slice();
  let i = 0, ok = 0, n = 0, alive = true, cleanup = null;
  const graded = new Set();
  const barI = h('i'), count = h('span', { class: 'scount' });
  const body = h('div', { class: 'sbody' }), foot = h('div', { class: 'sfoot' });
  document.body.classList.add('in-session');
  put(view, 
    h('div', { class: 'shead' }, h('button', { class: 'x', title: 'Çık', onclick: () => { if (confirm('Çıkmak istiyor musun?')) { endSession(); go(back); } } }, '✕'),
      h('div', { class: 'pbar' }, barI), count),
    title && h('div', { class: 'q', style: 'margin-bottom:6px;color:var(--acc)' }, title), body, foot);
  window.scrollTo(0, 0);
  session = { kill() { alive = false; if (cleanup) try { cleanup(); } catch (e) {} stopAudio(); } };

  function show() {
    if (!alive) return;
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    if (i >= steps.length) return finish();
    barI.style.width = (i / steps.length * 100) + '%';
    count.textContent = (i + 1) + '/' + steps.length;
    put(body, ); put(foot, );
    const st = steps[i];
    let answered = false;
    const ctx = {
      body, foot,
      set cleanup(f) { cleanup = f; },
      next() { i++; show(); },
      answer(good, info = {}) {
        if (answered || !alive) return; answered = true;
        n++; if (good) ok++;
        beep(good);
        if (good) addXp(xpEach);
        if (srs && st.it && st.it.cat && !graded.has(st.it.id)) { graded.add(st.it.id); grade(st.it, good); save(); }
        if (!good && !noRetry && !st.retry) steps.push({ ...st, retry: true });
        if (st.onAnswer) st.onAnswer(good);
        if (onStep) onStep(st, good);
        put(foot, h('div', { class: 'fb ' + (good ? 'good' : 'bad') },
          h('b', null, good ? pick(['Doğru! 🎉', 'Harika! ✨', 'Süper! 👏', 'Aynen öyle! ✅']) : 'Olmadı'),
          info.correct && h('div', { class: 'ans' }, 'Doğrusu: ', info.correct, S.lang === 'ka' && info.tlit !== false ? tl(info.correct) : null),
          info.note && h('div', null, info.note),
          h('button', { class: 'btn block', onclick: () => ctx.next() }, 'Devam')));
        foot.scrollIntoView({ block: 'end', behavior: 'smooth' });
      }
    };
    R[st.type](st, ctx);
  }
  function finish() {
    barI.style.width = '100%';
    const res = { ok, n, pct: n ? Math.round(ok / n * 100) : 100 };
    if (bonus) addXp(bonus);
    if (kind) bump(kind);
    if (silent) { onDone && onDone(res); return; }
    const extra = onDone ? onDone(res) : null;
    count.textContent = '';
    put(body, 
      h('div', { class: 'done-emoji' }, res.pct >= 80 ? '🏆' : res.pct >= 50 ? '💪' : '🌱'),
      h('h1', { class: 'center' }, res.pct >= 80 ? 'Mükemmel!' : res.pct >= 50 ? 'İyi iş!' : 'Devam et, gelişiyorsun!'),
      h('p', { class: 'center mut', style: 'margin:6px 0 14px' }, n ? `${ok} / ${n} doğru · %${res.pct}` : 'Tamamlandı', bonus ? ` · +${bonus} XP bonus` : ''),
      extra);
    put(foot, h('button', { class: 'btn block', onclick: () => { endSession(); go(back); } }, 'Tamam'));
  }
  show();
}

// ───────────────────────── alıştırma türleri ─────────────────────────
const R = {};
function mc(ctx, label, promptNode, options, info) {
  const box = h('div', { class: 'opts' + (options[0].grid ? ' g2' : '') });
  for (const o of shuffle(options)) {
    const b = h('button', { class: 'opt' + (o.left ? ' left' : '') }, o.node);
    b.onclick = () => {
      box.classList.add('lock');
      b.classList.add(o.ok ? 'good' : 'bad');
      if (!o.ok) [...box.children].forEach(c => { if (c._ok) c.classList.add('good'); });
      ctx.answer(o.ok, o.ok ? {} : info);
    };
    b._ok = o.ok; box.append(b);
  }
  ctx.body.append(h('div', { class: 'q' }, label), promptNode, box);
}

R.intro = (st, ctx) => {
  const w = st.it, t = tw(w);
  if (!P().srs[w.id]) { P().srs[w.id] = { b: 0, d: dayNum() }; save(); }
  ctx.body.append(h('div', { class: 'q' }, 'Yeni kelime'),
    h('div', { class: 'prompt' }, h('div', { class: 'em' }, w.e), h('div', { class: 'tw' }, t, tl(t)), h('div', { class: 'tr' }, w.tr),
      h('div', null, spk(t), spk(t, { rate: .7 }))),
    h('p', { class: 'hint' }, 'Resme bak, sesi dinle ve yüksek sesle tekrar et.'));
  ctx.foot.append(h('button', { class: 'btn block', onclick: () => ctx.next() }, 'Anladım →'));
  say(t);
};
R.pic2word = (st, ctx) => {
  const w = st.it;
  const opts = [w, ...distract(w, 3, st.pool)].map(x => ({ ok: x === w, grid: true, node: [tw(x), tl(tw(x))] }));
  mc(ctx, 'Bu resmin karşılığı hangisi?', h('div', { class: 'prompt' }, h('div', { class: 'em' }, w.e), h('div', { class: 'tr' }, w.tr)), opts, { correct: tw(w) });
};
R.word2tr = (st, ctx) => {
  const w = st.it, t = tw(w);
  const opts = [w, ...distract(w, 3, st.pool)].map(x => ({ ok: x === w, grid: true, node: [h('span', { class: 'em' }, x.e), x.tr] }));
  mc(ctx, 'Bu kelime ne demek?', h('div', { class: 'prompt' }, h('div', { class: 'tw' }, t, tl(t)), spk(t)), opts, { correct: w.e + ' ' + w.tr, tlit: false });
  say(t);
};
R.listen = (st, ctx) => {
  const w = st.it, t = tw(w);
  const opts = [w, ...distract(w, 3, st.pool)].map(x => ({ ok: x === w, grid: true, node: [h('span', { class: 'em' }, x.e), x.tr] }));
  mc(ctx, 'Dinle ve doğru resmi seç', h('div', { class: 'prompt' }, spk(t, { big: true }), h('div', null, spk(t, { rate: .7 }))), opts, { correct: t + ' = ' + w.tr, tlit: false });
  say(t);
};
R.sentListen = (st, ctx) => {
  const s = st.it, t = tw(s);
  const others = sample(SENTENCES.filter(x => x !== s && Math.abs(x.l - s.l) <= 1), 2);
  const opts = [s, ...others].map(x => ({ ok: x === s, left: true, node: x.tr }));
  mc(ctx, 'Dinle: bu cümle ne anlama geliyor?', h('div', { class: 'prompt' }, spk(t, { big: true }), h('div', null, spk(t, { rate: .7 }))), opts, { correct: t + ' = ' + s.tr, tlit: false });
  say(t);
};
R.sentMeaning = (st, ctx) => {
  const s = st.it, t = tw(s);
  const others = sample(SENTENCES.filter(x => x !== s && Math.abs(x.l - s.l) <= 1), 2);
  const opts = [s, ...others].map(x => ({ ok: x === s, left: true, node: x.tr }));
  mc(ctx, 'Oku: bu cümle ne anlama geliyor?', h('div', { class: 'prompt' }, h('div', { class: 'tw sm' }, t, tl(t))), opts, { correct: s.tr, tlit: false });
};
R.q = (st, ctx) => {
  const opts = st.o.map((x, k) => ({ ok: k === st.a, left: true, node: x }));
  mc(ctx, st.label || 'Soru', h('div', { class: 'prompt' }, st.context && h('div', { class: 'mut', style: 'margin-bottom:8px' }, st.context), h('div', { class: 'tw sm' }, st.q)), opts, { correct: st.o[st.a], tlit: false });
};
R.abc = (st, ctx) => {
  const a = st.a, rev = st.rev;
  const others = sample(ALPHABET.filter(x => x !== a && x.snd !== a.snd), 3);
  const opts = [a, ...others].map(x => ({ ok: x === a, grid: true, node: rev ? h('span', { style: 'font-size:30px' }, x.ch) : x.snd }));
  const prompt = rev ? h('div', { class: 'prompt' }, h('div', { class: 'tr' }, 'Bu sesi veren harf:'), h('div', { class: 'tw' }, '“' + a.snd + '”'))
    : h('div', { class: 'prompt' }, h('div', { class: 'abcbig' }, a.ch));
  mc(ctx, rev ? 'Hangi harf?' : 'Bu harf nasıl okunur?', prompt, opts, { correct: a.ch + ' = ' + a.snd + ' (' + a.hint + ')', tlit: false });
};

function tiles(ctx, label, promptNode, pieces, target, sep, ltr) {
  const line = h('div', { class: 'line' }), pool = h('div', { class: 'pool' });
  const chosen = [];
  const check = h('button', { class: 'btn block', disabled: true }, 'Kontrol et');
  pieces.forEach(p => {
    const chip = h('button', { class: 'chip' + (ltr ? ' ltr' : '') }, p);
    chip.onclick = () => {
      if (chip.classList.contains('used')) return;
      chip.classList.add('used');
      const c2 = h('button', { class: 'chip' + (ltr ? ' ltr' : '') }, p);
      const rec = { p, c2 };
      c2.onclick = () => { chip.classList.remove('used'); c2.remove(); chosen.splice(chosen.indexOf(rec), 1); check.disabled = !chosen.length; };
      chosen.push(rec); line.append(c2); check.disabled = false;
    };
    pool.append(chip);
  });
  check.onclick = () => {
    const ans = chosen.map(c => c.p).join(sep);
    const good = norm(ans) === norm(target) || norm(ans).replace(/ /g, '') === norm(target).replace(/ /g, '');
    line.style.pointerEvents = pool.style.pointerEvents = 'none';
    ctx.answer(good, good ? {} : { correct: target });
  };
  ctx.body.append(h('div', { class: 'q' }, label), promptNode, line, pool);
  ctx.foot.append(check);
}
R.spell = (st, ctx) => {
  const w = st.it, t = tw(w);
  const letters = [...t.replace(/ /g, '')];
  const abc = S.lang === 'ka' ? KA_LETTERS : EN_LETTERS;
  const extra = sample([...abc].filter(c => !letters.includes(c)), 2);
  tiles(ctx, 'Harfleri sırala', h('div', { class: 'prompt' }, h('div', { class: 'em' }, w.e), h('div', { class: 'tr' }, w.tr), spk(t)), shuffle([...letters, ...extra]), t, '', true);
};
R.build = (st, ctx) => {
  const s = st.it, t = tw(s);
  const toks = t.split(' ');
  const others = SENTENCES.filter(x => x !== s).flatMap(x => tw(x).split(' ')).filter(x => !toks.includes(x));
  tiles(ctx, 'Cümleyi kur', h('div', { class: 'prompt' }, h('div', { class: 'tw sm' }, s.tr)), shuffle([...toks, ...sample(others, Math.min(3, Math.max(1, Math.round(toks.length / 3))))]), t, ' ', false);
};
R.type = (st, ctx) => {
  const it = st.it, t = tw(it);
  const inp = h('input', { class: 'tin', type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', placeholder: LANGS[S.lang].name + ' yaz…', lang: S.lang });
  const check = h('button', { class: 'btn block' }, 'Kontrol et');
  const submit = () => {
    const a = core(inp.value), b = core(t);
    if (!a) { inp.focus(); return; }
    const d = lev(a, b), tol = Math.max(b.length >= 6 ? 1 : 0, Math.floor(b.length / 12));
    inp.disabled = true; check.remove();
    if (d === 0) ctx.answer(true); else if (d <= tol) ctx.answer(true, { note: 'Küçük bir yazım farkı var. Doğrusu: ' + t }); else ctx.answer(false, { correct: t });
  };
  check.onclick = submit;
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  const prompt = st.dict
    ? h('div', { class: 'prompt' }, spk(t, { big: true }), h('div', null, spk(t, { rate: .7 })))
    : h('div', { class: 'prompt' }, it.e && h('div', { class: 'em' }, it.e), h('div', { class: it.e ? 'tr' : 'tw sm' }, it.tr));
  ctx.body.append(h('div', { class: 'q' }, st.dict ? 'Dinle ve duyduğunu yaz' : LANGS[S.lang].name + ' karşılığını yaz'), prompt, inp);
  if (S.lang === 'ka') {
    const kb = h('div', { class: 'kbd' });
    const ins = c => { inp.value += c; inp.focus(); };
    [...KA_LETTERS].forEach(c => kb.append(h('button', { onclick: () => ins(c) }, c)));
    kb.append(h('button', { class: 'wide', onclick: () => ins(' ') }, 'boşluk'), h('button', { class: 'wide', onclick: () => { inp.value = [...inp.value].slice(0, -1).join(''); } }, '⌫'));
    ctx.body.append(kb);
  }
  ctx.foot.append(check);
  if (st.dict) say(t);
};
R.speak = (st, ctx) => {
  const it = st.it, t = tw(it);
  const out = h('div', { class: 'heard' });
  const mic = h('button', { class: 'mic', title: 'Konuş' }, '🎤');
  const SR = getSR();
  let rec = null, tries = 0;
  const fallback = () => {
    mic.remove();
    put(out, h('p', { class: 'hint' }, 'Bu tarayıcıda konuşma tanıma kullanılamıyor. Sesi dinle, yüksek sesle tekrar et ve kendini değerlendir.'),
      h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn ghost', onclick: () => ctx.answer(false, { correct: t }) }, 'Zorlandım'),
        h('button', { class: 'btn', onclick: () => ctx.answer(true) }, 'İyi söyledim')));
  };
  mic.onclick = () => {
    if (rec) { try { rec.stop(); } catch (e) {} return; }
    stopAudio();
    let got = false;
    try {
      rec = new SR(); rec.lang = LANGS[S.lang].sr; rec.maxAlternatives = 3; rec.interimResults = false;
    } catch (e) { return fallback(); }
    mic.classList.add('on'); out.textContent = 'Dinliyorum… konuş';
    rec.onresult = e => {
      got = true; tries++;
      let best = 0, bt = '';
      for (const a of e.results[0]) { const s = sim(a.transcript, t); if (s >= best) { best = s; bt = a.transcript; } }
      put(out, h('div', null, 'Duyulan: ', h('b', null, bt)), h('div', { class: 'mut' }, 'Benzerlik: %' + Math.round(best * 100)));
      if (best >= .75) ctx.answer(true, { note: 'Telaffuzun anlaşıldı!' });
      else if (tries >= 3) ctx.answer(false, { correct: t });
      else out.append(h('div', { class: 'hint' }, `Tam olmadı — tekrar dene (${3 - tries} hak kaldı)`));
    };
    rec.onerror = e => {
      if (['not-allowed', 'service-not-allowed', 'language-not-supported', 'audio-capture'].includes(e.error)) fallback();
      else out.textContent = 'Duyamadım, tekrar dene.';
    };
    rec.onend = () => { mic.classList.remove('on'); rec = null; if (!got && out.textContent.startsWith('Dinliyorum')) out.textContent = 'Duyamadım, tekrar dene.'; };
    try { rec.start(); } catch (e) { fallback(); }
  };
  ctx.cleanup = () => { try { rec && rec.abort(); } catch (e) {} };
  ctx.body.append(h('div', { class: 'q' }, 'Dinle ve sesli söyle'),
    h('div', { class: 'prompt' }, it.e && h('div', { class: 'em', style: 'font-size:48px' }, it.e), h('div', { class: 'tw' + (t.length > 14 ? ' sm' : '') }, t, tl(t)), h('div', { class: 'tr' }, it.tr),
      h('div', null, spk(t, { voice: st.voice }), spk(t, { rate: .7, voice: st.voice }))),
    mic, out);
  ctx.foot.append(h('button', { class: 'btn ghost block', onclick: () => ctx.next() }, 'Atla'));
  if (!SR) fallback();
  say(t, { voice: st.voice });
};

// ───────────────────────── oturum kurucular ─────────────────────────
const canSpell = w => !tw(w).includes(' ') && [...tw(w)].length <= 11;
function reviewStep(w) {
  const kinds = ['pic2word', 'listen', 'word2tr', 'pic2word'];
  if (canSpell(w)) kinds.push('spell', 'spell');
  if ((P().srs[w.id] || {}).b >= 2) kinds.push('type');
  return { type: pick(kinds), it: w };
}
function startLesson() {
  const news = newWords(S.set.newPerDay), due = sample(dueWords().filter(w => !news.includes(w)), 10);
  const steps = [];
  for (let k = 0; k < news.length; k += 4) {
    const chunk = news.slice(k, k + 4);
    chunk.forEach(w => steps.push({ type: 'intro', it: w }));
    shuffle(chunk).forEach(w => steps.push({ type: 'word2tr', it: w, pool: null }));
  }
  const mix = [];
  news.forEach(w => { mix.push({ type: 'listen', it: w }); mix.push({ type: canSpell(w) ? 'spell' : 'pic2word', it: w }); });
  due.forEach(w => mix.push(reviewStep(w)));
  steps.push(...shuffle(mix));
  if (!news.length && !due.length) sample(learned(), 10).forEach(w => steps.push(reviewStep(w)));
  const ss = sample(sentsUpTo(P().level).filter(s => s.l >= P().level - 1), 3);
  if (ss[0]) steps.push({ type: 'build', it: ss[0] });
  if (ss[1]) steps.push({ type: 'sentListen', it: ss[1] });
  const sp = news.length ? pick(news) : ss[2];
  if (sp) steps.push({ type: 'speak', it: sp });
  if (ss[2] && P().level >= 2) steps.push({ type: 'speak', it: ss[2] });
  runSession({
    title: 'Günün dersi · ' + LANGS[S.lang].name, steps, srs: true, bonus: 50, kind: 'lesson',
    onDone: () => { P().lessonDay = dayNum(); save(); return h('p', { class: 'center' }, `Bugün ${news.length} yeni kelime öğrendin, ${due.length} kelimeyi tekrar ettin.`); }
  });
}
function startReview() {
  let due = sample(dueWords(), 15);
  if (!due.length) due = sample(learned(), 10);
  if (!due.length) return startLesson();
  runSession({ title: 'Tekrar zamanı', steps: due.map(reviewStep), srs: true, bonus: 20, kind: 'review' });
}

// ───────────────────────── haftalık seviye testi ─────────────────────────
function testBlock(l) {
  const ws = sample(byLevel(l), 4), ss = sample(SENTENCES.filter(s => s.l === l), 3);
  const sp = sample(byLevel(l).filter(w => canSpell(w) && !ws.includes(w)), 1)[0];
  return shuffle([
    { type: 'word2tr', it: ws[0] }, { type: 'word2tr', it: ws[1] }, { type: 'pic2word', it: ws[2] }, { type: 'listen', it: ws[3] },
    { type: 'sentListen', it: ss[0] }, { type: 'sentMeaning', it: ss[1] }, { type: 'build', it: ss[2] },
    sp ? { type: 'spell', it: sp } : { type: 'sentMeaning', it: ss[0] }
  ]);
}
function startTest() {
  const detail = [], sk = {}, miss = [];
  const onStep = (st, good) => {
    const k = SKILL_OF[st.type]; if (!k) return;
    sk[k] = sk[k] || [0, 0]; sk[k][1]++; if (good) sk[k][0]++;
    if (!good && st.it && st.it.cat && !miss.includes(st.it.id)) miss.push(st.it.id);
  };
  const runLevel = l => {
    runSession({
      title: `Seviye testi · ${LV[l]} bölümü (${l}/4)`, steps: testBlock(l), noRetry: true, silent: true, xpEach: 5, back: 'home', onStep,
      onDone: res => {
        detail.push({ l, ok: res.ok, n: res.n });
        const passed = res.ok / res.n >= 0.7;
        if (passed && l < 4) runLevel(l + 1); else finishTest(detail, passed && l === 4, sk, miss);
      }
    });
  };
  runLevel(1);
}
function finishTest(detail, allPassed, sk, miss) {
  const p = P(), prev = p.tests[p.tests.length - 1];
  const failed = detail.find(d => d.ok / d.n < 0.7);
  const level = failed ? failed.l : 4;
  const tot = detail.reduce((a, d) => a + d.ok, 0), cnt = detail.reduce((a, d) => a + d.n, 0);
  const score = Math.round(detail.reduce((a, d) => a + d.ok / d.n, 0) / 4 * 100); // 4 bölüm üzerinden genel puan
  miss.forEach(id => { p.srs[id] = { b: 1, d: dayNum() }; }); // kaçırılan kelimeler tekrar kutusuna
  p.tests.push({ t: Date.now(), level, score, detail, top: allPassed, sk, miss });
  p.level = level; p.placed = true; p.lastTest = Date.now();
  addXp(100); save();
  endSession(); document.body.classList.add('in-session');
  const diff = prev ? score - prev.score : null;
  put(view, 
    h('div', { class: 'done-emoji' }, '🎓'),
    h('h1', { class: 'center' }, LANGS[S.lang].name + ' seviyen: ' + LV[level]),
    h('p', { class: 'center mut', style: 'margin:4px 0 14px' }, allPassed ? 'B2 bölümünü de geçtin — tüm içerik sana açık!' : `${LVNAME[level]} · şu an bu seviyenin içeriğini çalışıyorsun`),
    h('div', { class: 'card' }, h('h3', null, 'Bölüm sonuçları'),
      detail.map(d => h('div', { class: 'trow' }, h('span', { class: 'badge' }, LV[d.l]), h('div', { class: 'grow' }, h('div', { class: 'meter', style: 'margin:0' }, h('i', { style: `width:${d.ok / d.n * 100}%;background:${d.ok / d.n >= .7 ? 'var(--good)' : 'var(--bad)'}` }))), h('b', null, `${d.ok}/${d.n}`))),
      h('p', { class: 'mut', style: 'margin-top:8px' }, `Genel puan: ${score}/100 · ${tot}/${cnt} doğru`,
        diff == null ? '' : diff > 0 ? ` · geçen teste göre +${diff} 📈` : diff < 0 ? ` · geçen teste göre ${diff}` : ' · geçen testle aynı')),
    h('div', { class: 'card' }, h('h3', null, 'Bu hafta için planın'), h('ul', { style: 'margin:6px 0 0;padding-left:20px' }, plan(level).map(x => h('li', null, x)))),
    h('button', { class: 'btn block', style: 'margin-bottom:10px', onclick: () => { endSession(); go('yorum'); } }, '💬 Koçun yorumunu gör'),
    h('button', { class: 'btn ghost block', onclick: () => { endSession(); go('home'); } }, 'Ana sayfaya dön'));
  window.scrollTo(0, 0);
}
function plan(level) {
  const a = [];
  if (S.lang === 'ka' && Object.keys(P().abc).length < 33) a.push('Önce Gürcü alfabesini bitir: her gün 5 dakika “Alfabe” bölümü.');
  a.push(`Her gün “Günün dersi”: ${S.set.newPerDay} yeni ${LV[level]} kelimesi + aralıklı tekrar.`);
  if (level <= 2) a.push('Haftada 3 mini diyalog dinle; önce metinsiz, sonra metinle, sonra sesli tekrar et (gölgeleme).');
  else a.push('Haftada en az 2 gerçek podcast bölümü dinle ve 1 okuma metni çöz.');
  a.push(level <= 1 ? 'Oyunlar: “Eşleştirme” ve “Dinle & Bul” ile resim-kelime bağı kur.' : 'Yazma: her gün “Dikte” veya “Cümle kur” ile 5 dakika çalış.');
  a.push('Konuşma: günde en az 5 cümleyi mikrofona söyle. 7 gün sonra tekrar test olacaksın.');
  return a;
}
const testDue = () => !P().lastTest || Date.now() - P().lastTest >= WEEK;

// ───────────────────────── sayfalar ─────────────────────────
const V = {};

V.home = () => {
  const p = P(), lv = p.level, lw = byLevel(lv), known = lw.filter(w => p.srs[w.id]).length;
  const due = dueWords().length, news = newWords(S.set.newPerDay).length, doneToday = p.lessonDay === dayNum();
  const nodes = [];
  nodes.push(h('div', { class: 'card hero' },
    h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'mut' }, LANGS[S.lang].name + ' seviyen'), h('div', { class: 'lvl' }, p.placed ? LV[lv] : '—'), h('div', { class: 'mut' }, p.placed ? LVNAME[lv] : 'Henüz test olmadın')),
      h('div', { style: 'text-align:right' }, h('div', { style: 'font-size:22px;font-weight:800' }, S.xp + ' XP'), h('div', { class: 'mut' }, learned().length + ' kelime öğrenildi'))),
    h('div', { class: 'meter' }, h('i', { style: `width:${lw.length ? known / lw.length * 100 : 0}%` })),
    h('div', { class: 'mut', style: 'margin-top:4px;font-size:12.5px' }, `${LV[lv]} kelimeleri: ${known}/${lw.length}`)));

  if (!p.placed) {
    nodes.push(h('div', { class: 'card' }, h('h3', null, '🎯 Seviyeni belirleyelim'),
      h('p', { class: 'mut' }, 'Kısa bir test ile nereden başlayacağını bulalım. Zorlandığın bölümde test kendiliğinden biter.'),
      h('div', { class: 'row wrap', style: 'margin-top:10px' }, h('button', { class: 'btn', onclick: startTest }, 'Teste başla'),
        h('button', { class: 'btn ghost', onclick: () => { p.placed = true; p.level = 1; p.lastTest = Date.now(); save(); route(); } }, 'Sıfırdan başlıyorum'))));
  } else if (testDue()) {
    nodes.push(h('div', { class: 'card', style: 'box-shadow:0 0 0 2px var(--gold)' }, h('h3', null, '📝 Haftalık test zamanı!'),
      h('p', { class: 'mut' }, 'Bir hafta doldu. Seviyeni yeniden ölçelim ve planını güncelleyelim.'),
      h('button', { class: 'btn', style: 'margin-top:10px', onclick: startTest }, 'Teste başla')));
  }
  if (S.lang === 'ka' && Object.keys(p.abc).length < 33) {
    nodes.push(h('a', { class: 'card', href: '#abc', style: 'display:block' }, h('h3', null, '🔤 Önce alfabe: ' + Object.keys(p.abc).length + '/33 harf'),
      h('p', { class: 'mut' }, 'Gürcü alfabesi 33 harf ve tamamen okunduğu gibi yazılır. Harfleri öğrenince her şey kolaylaşır.')));
  }
  nodes.push(h('div', { class: 'card' },
    h('div', { class: 'row' }, h('div', { class: 'grow' }, h('h3', null, doneToday ? '✅ Bugünün dersi tamam' : '📘 Günün dersi'),
      h('p', { class: 'mut' }, doneToday ? 'Harika! İstersen bir tur daha yapabilirsin.' : `${news} yeni kelime · ${due} tekrar · cümle · konuşma`)),
      h('button', { class: 'btn' + (doneToday ? ' ghost' : ''), onclick: startLesson }, doneToday ? 'Tekrar' : 'Başla'))));

  nodes.push(h('div', { class: 'tiles' },
    h('button', { class: 'tile', onclick: startReview }, h('span', { class: 'ic' }, '🔁'), h('b', null, 'Tekrar'), h('small', null, due ? due + ' kelime bekliyor' : 'Bekleyen yok'), due ? h('span', { class: 'dot' }, due) : null),
    h('a', { class: 'tile', href: '#games' }, h('span', { class: 'ic' }, '🎮'), h('b', null, 'Oyunlar'), h('small', null, 'Eğlenerek pekiştir')),
    h('a', { class: 'tile', href: '#listen' }, h('span', { class: 'ic' }, '🎧'), h('b', null, 'Podcast & Dinleme'), h('small', null, 'Kulağını alıştır')),
    h('button', { class: 'tile', onclick: () => startSpeak('sent') }, h('span', { class: 'ic' }, '🎤'), h('b', null, 'Konuşma'), h('small', null, 'Mikrofona söyle'))));

  nodes.push(h('a', { class: 'item', href: '#yorum', style: 'margin-bottom:12px' }, h('span', { class: 'ic' }, '💬'), h('span', { class: 'grow' }, h('b', null, 'Koçun yorumu'), h('small', null, p.tests.length ? 'Son testine göre sana özel öneriler' : 'İlk testten sonra kişisel öneriler burada')), h('span', { class: 'chev' }, '›')));
  const pool = lw.length ? lw : WORDS, wod = pool[dayNum() % pool.length], t = tw(wod);
  nodes.push(h('div', { class: 'card' }, h('div', { class: 'mut', style: 'font-weight:700' }, 'GÜNÜN KELİMESİ'),
    h('div', { class: 'row', style: 'margin-top:6px' }, h('span', { style: 'font-size:46px' }, wod.e),
      h('div', { class: 'grow' }, h('div', { style: 'font-size:22px;font-weight:800' }, t, tl(t)), h('div', { class: 'mut' }, wod.tr)), spk(t))));
  if (p.placed && !testDue()) {
    const left = Math.ceil((p.lastTest + WEEK - Date.now()) / 864e5);
    nodes.push(h('p', { class: 'hint' }, `Sonraki haftalık test: ${left} gün sonra`));
  }
  put(view, ...nodes);
};

V.learn = () => {
  const p = P();
  put(view, 
    h('h2', { class: 'sec' }, 'Kelime'),
    h('div', { class: 'list' },
      h('button', { class: 'item', onclick: startLesson }, h('span', { class: 'ic' }, '📘'), h('span', { class: 'grow' }, h('b', null, 'Günün dersi'), h('small', null, 'Yeni kelimeler + tekrar + cümle + konuşma')), h('span', { class: 'chev' }, '›')),
      h('button', { class: 'item', onclick: startReview }, h('span', { class: 'ic' }, '🔁'), h('span', { class: 'grow' }, h('b', null, 'Aralıklı tekrar'), h('small', null, dueWords().length + ' kelime bugün tekrar bekliyor')), h('span', { class: 'chev' }, '›')),
      item('🖼️', 'Resimli sözlük', `${WORDS.length} kelime · ${learned().length} öğrenildi`, '#words'),
      S.lang === 'ka' ? item('🔤', 'Gürcü alfabesi', Object.keys(p.abc).length + '/33 harf öğrenildi', '#abc') : null),
    h('h2', { class: 'sec' }, 'Okuma'),
    h('div', { class: 'list' }, item('📖', 'Okuma metinleri', 'Cümleye dokun: çeviri + ses. Sonra soruları çöz.', '#read')),
    h('h2', { class: 'sec' }, 'Yazma'),
    h('div', { class: 'list' },
      h('button', { class: 'item', onclick: () => startWrite('word') }, h('span', { class: 'ic' }, '✍️'), h('span', { class: 'grow' }, h('b', null, 'Kelime yaz'), h('small', null, 'Resme bak, karşılığını yaz')), h('span', { class: 'chev' }, '›')),
      h('button', { class: 'item', onclick: () => startWrite('dict') }, h('span', { class: 'ic' }, '👂'), h('span', { class: 'grow' }, h('b', null, 'Dikte'), h('small', null, 'Cümleyi dinle, duyduğunu yaz')), h('span', { class: 'chev' }, '›')),
      h('button', { class: 'item', onclick: () => startWrite('build') }, h('span', { class: 'ic' }, '🧱'), h('span', { class: 'grow' }, h('b', null, 'Cümle kur'), h('small', null, 'Kelimeleri doğru sıraya diz')), h('span', { class: 'chev' }, '›'))),
    h('h2', { class: 'sec' }, 'Konuşma'),
    h('div', { class: 'list' },
      h('button', { class: 'item', onclick: () => startSpeak('word') }, h('span', { class: 'ic' }, '🗣️'), h('span', { class: 'grow' }, h('b', null, 'Kelime telaffuzu'), h('small', null, 'Dinle, söyle, puanını gör')), h('span', { class: 'chev' }, '›')),
      h('button', { class: 'item', onclick: () => startSpeak('sent') }, h('span', { class: 'ic' }, '🎤'), h('span', { class: 'grow' }, h('b', null, 'Cümle konuşma'), h('small', null, 'Günlük kalıpları sesli söyle')), h('span', { class: 'chev' }, '›'))));
};
function startWrite(kind) {
  const lv = P().level;
  let steps;
  if (kind === 'word') steps = sample(gamePool().filter(w => [...tw(w)].length <= 14), 8).map(w => ({ type: 'type', it: w }));
  else if (kind === 'dict') steps = sample(sentsUpTo(lv).filter(s => s.l >= lv - 1), 6).map(s => ({ type: 'type', it: s, dict: true }));
  else steps = sample(sentsUpTo(lv).filter(s => s.l >= lv - 1 && tw(s).includes(' ')), 6).map(s => ({ type: 'build', it: s }));
  runSession({ title: { word: 'Kelime yaz', dict: 'Dikte', build: 'Cümle kur' }[kind], steps, back: 'learn', srs: kind === 'word', bonus: 20, kind: 'write' });
}
function startSpeak(kind) {
  const lv = P().level;
  const steps = kind === 'word' ? sample(gamePool(), 8).map(w => ({ type: 'speak', it: w }))
    : sample(sentsUpTo(lv).filter(s => s.l >= lv - 1), 6).map(s => ({ type: 'speak', it: s }));
  runSession({ title: 'Konuşma pratiği', steps, back: 'learn', noRetry: true, bonus: 20, kind: 'speak' });
}

V.words = () => {
  const cats = [...new Set(WORDS.map(w => w.cat))];
  page('Resimli sözlük', 'learn', h('div', { class: 'list' }, cats.map(c => {
    const ws = WORDS.filter(w => w.cat === c), k = ws.filter(w => P().srs[w.id]).length, g = WORD_DATA.find(x => x.c === c);
    return item(g.i, c, `${k}/${ws.length} öğrenildi`, '#cat/' + encodeURIComponent(c), h('span', { class: 'row' }, lvBadge(g.l), h('span', { class: 'chev' }, '›')));
  })));
};
V.cat = c => {
  const ws = WORDS.filter(w => w.cat === c);
  if (!ws.length) return go('words');
  page(c, 'words',
    h('div', { class: 'ctrl' }, h('button', { class: 'btn small', onclick: () => runSession({ title: c, steps: shuffle(ws).slice(0, 12).flatMap(w => [{ type: 'pic2word', it: w, pool: ws.length >= 6 ? ws : null }]), back: 'cat/' + encodeURIComponent(c), srs: false, bonus: 10 }) }, '▶ Bu konuda alıştırma')),
    h('div', { class: 'wgrid' }, ws.map(w => h('button', { class: 'wcard' + (P().srs[w.id] ? ' learned' : ''), onclick: () => say(tw(w)) },
      h('span', { class: 'em' }, w.e), h('b', null, tw(w), tl(tw(w))), h('small', null, w.tr)))));
};

V.abc = () => {
  if (S.lang !== 'ka') return go('learn');
  const p = P(), box = h('div', { class: 'card center' }, h('p', { class: 'mut' }, 'Bir harfe dokun: okunuşunu ve örnek kelimeyi gör.'));
  const showL = a => {
    put(box, h('div', { class: 'abcbig' }, a.ch), h('div', { style: 'font-size:22px;font-weight:800' }, '“' + a.snd + '”'), h('div', { class: 'mut' }, a.hint),
      h('div', { style: 'margin-top:8px;font-size:19px;font-weight:700' }, a.ex, ' ', h('span', { class: 'mut' }, '(' + translit(a.ex) + ') = ' + a.tr)), spk(a.ex));
    say(a.ex);
  };
  const quiz = () => {
    const unknown = ALPHABET.filter(a => !(p.abc[a.ch] >= 2)), base = unknown.length >= 6 ? sample(unknown, 6) : sample(ALPHABET, 6);
    const steps = shuffle([...base.map(a => ({ type: 'abc', a })), ...sample(ALPHABET, 4).map(a => ({ type: 'abc', a, rev: true }))])
      .map(s => ({ ...s, onAnswer: ok => { if (ok) { p.abc[s.a.ch] = (p.abc[s.a.ch] || 0) + 1; save(); } } }));
    runSession({ title: 'Alfabe testi', steps, back: 'abc', bonus: 20, kind: 'abc' });
  };
  page('Gürcü alfabesi', 'learn',
    h('div', { class: 'ctrl' }, h('button', { class: 'btn small', onclick: quiz }, '▶ Alfabe testi'), h('span', { class: 'mut', style: 'align-self:center' }, Object.keys(p.abc).length + '/33 harf tanındı')),
    box,
    h('div', { class: 'abc' }, ALPHABET.map(a => h('button', { class: p.abc[a.ch] ? 'ok' : '', onclick: () => showL(a) }, a.ch, h('small', null, a.snd)))));
};

V.read = () => {
  page('Okuma metinleri', 'learn', h('div', { class: 'list' }, STORIES.map(s => item(s.e, s.title, s.lines.length + ' cümle' + (P().done['s:' + s.id] ? ' · ✓ tamamlandı' : ''), '#story/' + s.id, h('span', { class: 'row' }, lvBadge(s.l), h('span', { class: 'chev' }, '›'))))));
};
V.story = id => {
  const s = STORIES.find(x => x.id === id); if (!s) return go('read');
  const trbox = h('div', { class: 'trbox' }, 'Bir cümleye dokun: çevirisini gör ve dinle.');
  const spans = s.lines.map(l => {
    const sp = h('span', null, tw(l) + ' ');
    sp.onclick = () => sel(l, sp, true);
    return sp;
  });
  let token = 0;
  const sel = (l, sp, play) => {
    if (play) token++;
    spans.forEach(x => x.classList.remove('cur')); sp.classList.add('cur');
    put(trbox, S.lang === 'ka' && S.set.translit ? h('div', { class: 'mut', style: 'font-style:italic' }, translit(l.ka)) : null, h('div', null, l.tr));
    return play ? say(tw(l)) : null;
  };
  const playAll = async () => {
    const my = ++token;
    for (let k = 0; k < s.lines.length; k++) { if (my !== token) return; sel(s.lines[k], spans[k], false); const ok = await say(tw(s.lines[k])); if (!ok || my !== token) return; }
  };
  const quiz = () => runSession({
    title: s.title, back: 'read', noRetry: true, bonus: 30, kind: 'read',
    steps: s.q.map(q => ({ type: 'q', label: 'Okuduğunu anlama', ...q })),
    onDone: () => { P().done['s:' + s.id] = 1; save(); }
  });
  page(s.title, 'read',
    h('div', { class: 'ctrl' }, lvBadge(s.l), h('button', { class: 'btn small ghost', onclick: playAll }, '▶ Tümünü dinle'), h('button', { class: 'btn small ghost', onclick: () => { token++; stopAudio(); } }, '⏹')),
    h('div', { class: 'story' }, spans), trbox,
    h('button', { class: 'btn block', style: 'margin-top:14px', onclick: quiz }, 'Soruları çöz'));
};

// ── oyunlar
V.games = () => {
  const g = (ic, t, sub, fn) => h('button', { class: 'tile', onclick: fn }, h('span', { class: 'ic' }, ic), h('b', null, t), h('small', null, sub));
  put(view, 
    h('p', { class: 'mut', style: 'margin:2px 4px 12px' }, learned().length >= 12 ? 'Oyunlar öğrendiğin kelimelerle oynanır.' : 'Oyunlar seviyendeki kelimelerle oynanır.'),
    h('div', { class: 'tiles' },
      g('🃏', 'Eşleştirme', 'Resim ile kelimeyi eşle', gameMemory),
      g('⚡', 'Hızlı Quiz', '60 saniyede kaç doğru?' + (P().hi ? ' Rekor: ' + P().hi : ''), gameSpeed),
      g('👂', 'Dinle & Bul', 'Sesi duy, resmi seç', () => gameSession('listen', 'Dinle & Bul')),
      g('🔡', 'Harf Avı', 'Harflerden kelime kur', () => gameSession('spell', 'Harf Avı')),
      g('🧱', 'Cümle Kur', 'Kelimeleri sıraya diz', () => startWrite('build')),
      g('🖼️', 'Resim Quiz', 'Resmin adını bul', () => gameSession('pic2word', 'Resim Quiz')),
      S.lang === 'ka' ? h('a', { class: 'tile', href: '#abc' }, h('span', { class: 'ic' }, '🔤'), h('b', null, 'Alfabe'), h('small', null, 'Harfleri tanı')) : null));
};
function gameSession(type, title) {
  let pool = gamePool();
  if (type === 'spell') pool = pool.filter(canSpell);
  runSession({ title, steps: sample(pool, 10).map(w => ({ type, it: w })), back: 'games', srs: false, bonus: 20, kind: 'game' });
}
function gameMemory() {
  const ws = sample(gamePool().filter(w => [...tw(w)].length <= 14), 6);
  const cards = shuffle(ws.flatMap(w => [{ w, side: 'a' }, { w, side: 'b' }]));
  let open = [], matched = 0, moves = 0, lock = false;
  const info = h('span', { class: 'mut' }, 'Hamle: 0');
  const grid = h('div', { class: 'mem' });
  const flip = c => {
    if (lock || c.done || open.includes(c)) return;
    c.el.classList.add('open');
    if (c.side === 'b') say(tw(c.w));
    open.push(c);
    if (open.length < 2) return;
    moves++; info.textContent = 'Hamle: ' + moves;
    const [a, b] = open;
    if (a.w === b.w) {
      a.done = b.done = true; a.el.classList.add('done'); b.el.classList.add('done'); open = []; matched++; beep(true);
      if (matched === 6) { const xp = Math.max(15, 60 - moves * 3); addXp(xp); bump('game'); grid.after(h('div', { class: 'card center', style: 'margin-top:12px' }, h('h3', null, `🎉 ${moves} hamlede bitti! +${xp} XP`), h('button', { class: 'btn', style: 'margin-top:8px', onclick: gameMemory }, 'Tekrar oyna'))); }
    } else { lock = true; setTimeout(() => { a.el.classList.remove('open'); b.el.classList.remove('open'); open = []; lock = false; }, 900); }
  };
  cards.forEach(c => {
    c.el = h('button', { class: 'mcard', onclick: () => flip(c) }, h('span', { class: 'front' }, '?'),
      h('span', { class: 'back' }, c.side === 'a' ? [h('span', { class: 'em' }, c.w.e), h('small', null, c.w.tr)] : [tw(c.w), S.lang === 'ka' && S.set.translit ? h('small', null, translit(tw(c.w))) : null]));
    grid.append(c.el);
  });
  page('Eşleştirme', 'games', h('div', { class: 'ctrl' }, info), grid);
}
let speedTimer = null;
function gameSpeed() {
  clearInterval(speedTimer);
  const pool = gamePool(); let score = 0, wrong = 0, left = 60;
  const bar = h('i'), sc = h('b', null, '0'), stage = h('div');
  const next = () => {
    const w = pick(pool), opts = shuffle([w, ...distract(w, 3, pool.length >= 8 ? pool : null)]);
    const box = h('div', { class: 'opts g2' }, opts.map(x => h('button', { class: 'opt', onclick: e => {
      if (x === w) { score++; sc.textContent = score; beep(true); next(); }
      else { wrong++; beep(false); e.currentTarget.classList.add('bad'); box.classList.add('lock'); setTimeout(next, 450); }
    } }, tw(x), tl(tw(x)))));
    put(stage, h('div', { class: 'prompt' }, h('div', { class: 'em' }, w.e), h('div', { class: 'tr' }, w.tr)), box);
  };
  const end = () => {
    clearInterval(speedTimer);
    const rec = score > (P().hi || 0); if (rec) P().hi = score;
    addXp(score * 3); bump('game');
    put(stage, h('div', { class: 'done-emoji' }, rec ? '🏆' : '⚡'), h('h1', { class: 'center' }, score + ' doğru'),
      h('p', { class: 'center mut' }, `${wrong} yanlış · rekorun: ${P().hi}${rec ? ' (yeni rekor!)' : ''} · +${score * 3} XP`),
      h('button', { class: 'btn block', style: 'margin-top:14px', onclick: gameSpeed }, 'Tekrar oyna'));
  };
  page('Hızlı Quiz', 'games', h('div', { class: 'row', style: 'margin-bottom:6px' }, h('span', { class: 'grow mut' }, 'Süre'), h('span', null, 'Skor: ', sc)), h('div', { class: 'timer' }, bar), stage);
  next();
  speedTimer = setInterval(() => {
    if (!bar.isConnected) return clearInterval(speedTimer);
    left -= .25; bar.style.width = (left / 60 * 100) + '%'; if (left <= 0) end();
  }, 250);
}

// ── dinleme
V.listen = () => {
  const pods = PODCASTS.map((p, k) => ({ ...p, k })).filter(p => p.lang === S.lang);
  put(view, 
    h('h2', { class: 'sec' }, 'Mini podcast dersleri'),
    h('p', { class: 'mut', style: 'margin:0 4px 8px' }, 'Yöntem: önce metne bakmadan dinle → sonra metinle dinle → en son sesli tekrar et.'),
    h('div', { class: 'list' }, DIALOGUES.map(d => item(d.e, d.title, d.lines.length + ' replik' + (P().done['d:' + d.id] ? ' · ✓ dinlendi' : ''), '#dlg/' + d.id, h('span', { class: 'row' }, lvBadge(d.l), h('span', { class: 'chev' }, '›'))))),
    h('h2', { class: 'sec' }, 'Gerçek podcast’ler'),
    h('div', { class: 'list' }, pods.map(p => item('🎙️', p.name, p.by + ' · ' + p.note, '#pod/' + p.k, h('span', { class: 'row' }, lvBadge(p.l), h('span', { class: 'chev' }, '›'))))));
};
V.dlg = id => {
  const d = DIALOGUES.find(x => x.id === id); if (!d) return go('listen');
  let token = 0, rate = 1;
  const list = h('div', { class: 'dl hide-tr' });
  const bubs = d.lines.map((l, k) => {
    const t = tw(l);
    const b = h('button', { class: 'bub ' + l.s, onclick: () => { token++; mark(k); say(t, { voice: l.s === 'A' ? 'f' : 'm', rate }); } }, h('span', { class: 't1' }, t), tl(t), h('span', { class: 't2' }, l.tr));
    list.append(b); return b;
  });
  const mark = k => { bubs.forEach(b => b.classList.remove('cur')); if (bubs[k]) { bubs[k].classList.add('cur'); bubs[k].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } };
  const playBtn = h('button', { class: 'btn small' }, '▶ Dinle');
  const play = async () => {
    const my = ++token; playBtn.textContent = '⏹ Durdur';
    for (let k = 0; k < d.lines.length; k++) {
      if (my !== token) break;
      mark(k);
      const ok = await say(tw(d.lines[k]), { voice: d.lines[k].s === 'A' ? 'f' : 'm', rate });
      if (!ok || my !== token) break;
      await new Promise(r => setTimeout(r, 350));
    }
    if (my === token) { playBtn.textContent = '▶ Dinle'; token++; P().done['d:' + d.id] = 1; bump('listen'); }
  };
  playBtn.onclick = () => { if (playBtn.textContent.startsWith('⏹')) { token++; stopAudio(); playBtn.textContent = '▶ Dinle'; } else play(); };
  const tog = (label, cls, on) => { const b = h('button', { class: 'btn small ghost' }, label + (on ? ': açık' : ': kapalı')); b.onclick = () => { const hid = list.classList.toggle(cls); b.textContent = label + (hid ? ': kapalı' : ': açık'); }; return b; };
  const rateBtn = h('button', { class: 'btn small ghost', onclick: () => { rate = rate === 1 ? .75 : 1; rateBtn.textContent = rate === 1 ? 'Hız: normal' : 'Hız: yavaş 🐢'; } }, 'Hız: normal');
  page(d.title, 'listen',
    h('div', { class: 'ctrl' }, lvBadge(d.l), playBtn, rateBtn, tog('Metin', 'hide-text', true), tog('Çeviri', 'hide-tr', false)),
    list,
    h('div', { class: 'row wrap' },
      h('button', { class: 'btn grow', onclick: () => runSession({ title: d.title, back: 'listen', noRetry: true, bonus: 30, kind: 'listen', steps: d.q.map(q => ({ type: 'q', label: 'Dinlediğini anlama', ...q })), onDone: () => { P().done['d:' + d.id] = 1; save(); } }) }, 'Soruları çöz'),
      h('button', { class: 'btn ghost grow', onclick: () => runSession({ title: 'Sesli tekrar · ' + d.title, back: 'dlg/' + d.id, noRetry: true, bonus: 30, kind: 'speak', steps: d.lines.map(l => ({ type: 'speak', it: l, voice: l.s === 'A' ? 'f' : 'm' })) }) }, '🎤 Sesli tekrar')));
};
function closePlayer() { const p = $('#player'); p.hidden = true; put(p, ); document.body.classList.remove('has-player'); }
function openPlayer(title, url) {
  const p = $('#player'); stopAudio();
  const au = h('audio', { controls: true, autoplay: true, src: url, preload: 'none' });
  const sp = h('button', { class: 'btn small ghost' }, '1×');
  const rates = [1, .85, .7, 1.25]; let ri = 0;
  sp.onclick = () => { ri = (ri + 1) % rates.length; au.playbackRate = rates[ri]; sp.textContent = rates[ri] + '×'; };
  put(p, h('div', { class: 'row', style: 'margin-bottom:4px' }, h('span', { class: 'pt' }, title), sp, h('button', { class: 'btn small ghost', onclick: closePlayer }, '✕')), au);
  p.hidden = false; document.body.classList.add('has-player');
  addXp(5); bump('listen');
}
V.pod = k => {
  const p = PODCASTS[+k]; if (!p) return go('listen');
  page(p.name, 'listen',
    h('div', { class: 'card' }, h('div', { class: 'row' }, lvBadge(p.l), h('b', { class: 'grow' }, p.by)), h('p', { class: 'mut', style: 'margin-top:6px' }, p.note),
      h('a', { class: 'btn small ghost', style: 'margin-top:10px', href: p.web, target: '_blank', rel: 'noopener' }, 'Tüm bölümler ↗')),
    h('div', { class: 'list' }, p.eps.map(e => h('button', { class: 'item', onclick: () => openPlayer(e.t, e.u) }, h('span', { class: 'ic' }, '▶️'), h('span', { class: 'grow' }, h('b', null, e.t), h('small', null, [e.d, /^d+$/.test(e.m) ? Math.max(1, Math.round(e.m / 60)) + ' dk' : e.m].filter(Boolean).join(' · ')))))));
};

// ── gelişim / ayarlar
V.me = () => {
  const d0 = dayNum(), days = [...Array(7)].map((_, k) => d0 - 6 + k), mx = Math.max(50, ...days.map(d => S.log[d] || 0));
  const dn = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const langCard = l => {
    const L = S.L[l], n = Object.keys(L.srs).length;
    return h('div', { class: 'card' },
      h('div', { class: 'row' }, h('h3', { class: 'grow' }, LANGS[l].name), h('span', { class: 'badge' }, L.placed ? LV[L.level] + ' · ' + LVNAME[L.level] : 'test bekliyor')),
      h('div', { class: 'stats', style: 'margin-top:10px' },
        h('div', { class: 'stat' }, h('b', null, n), h('small', null, 'kelime')),
        h('div', { class: 'stat' }, h('b', null, mastered(l)), h('small', null, 'kalıcı')),
        h('div', { class: 'stat' }, h('b', null, L.tests.length), h('small', null, 'test')),
        h('div', { class: 'stat' }, h('b', null, Object.keys(L.done).length), h('small', null, 'metin/diyalog'))),
      L.tests.length ? h('div', { style: 'margin-top:10px' }, L.tests.slice(-6).reverse().map(t => h('div', { class: 'trow' }, h('span', { class: 'grow' }, new Date(t.t).toLocaleDateString('tr-TR')), h('span', { class: 'badge' }, LV[t.level]), h('b', null, t.score + '/100')))) : null);
  };
  put(view, 
    h('div', { class: 'card' }, h('div', { class: 'stats', style: 'grid-template-columns:repeat(3,1fr)' },
      h('div', { class: 'stat' }, h('b', null, S.xp), h('small', null, 'toplam XP')),
      h('div', { class: 'stat' }, h('b', null, '🔥 ' + streakNow()), h('small', null, 'günlük seri')),
      h('div', { class: 'stat' }, h('b', null, Object.keys(S.L.en.srs).length + Object.keys(S.L.ka.srs).length), h('small', null, 'toplam kelime'))),
      h('div', { class: 'bars' }, days.map(d => { const v = S.log[d] || 0; return h('div', null, h('b', null, v || ''), h('i', { style: `height:${v / mx * 78}%` }), dn[new Date((d + .5) * 864e5).getUTCDay()]); }))),
    langCard('en'), langCard('ka'),
    h('a', { class: 'btn block', style: 'margin-bottom:10px', href: '#yorum' }, '💬 Koçun yorumu ve öneriler'),
    h('button', { class: 'btn ghost block', onclick: startTest }, `📝 ${LANGS[S.lang].name} seviye testini şimdi yap`),
    h('h2', { class: 'sec' }, 'Ayarlar'),
    h('div', { class: 'card' },
      h('div', { class: 'trow' }, h('span', { class: 'grow' }, 'Günlük yeni kelime'), (() => { const s = h('select', { onchange: e => { S.set.newPerDay = +e.target.value; save(); } }, [5, 8, 12, 15, 20].map(n => h('option', { value: n, selected: n === S.set.newPerDay }, n))); return s; })()),
      h('div', { class: 'trow' }, h('span', { class: 'grow' }, 'Gürcüce okunuşu Latin harflerle göster'), (() => { const c = h('input', { type: 'checkbox', checked: S.set.translit, style: 'width:22px;height:22px' }); c.onchange = () => { S.set.translit = c.checked; save(); }; return c; })()),
      h('div', { class: 'trow' }, h('span', { class: 'grow' }, 'İlerlemeyi yedekle'), h('button', { class: 'btn small ghost', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })), download: 'dil-ustasi-yedek.json' }); a.click(); } }, 'İndir')),
      h('div', { class: 'trow' }, h('span', { class: 'grow' }, 'Yedekten geri yükle'), h('input', { type: 'file', accept: '.json,application/json', style: 'max-width:150px', onchange: e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const o = JSON.parse(t); if (!o.L) throw 0; localStorage.setItem(KEY, t); S = load(); paintTop(); route(); alert('Yedek yüklendi.'); } catch (x) { alert('Bu dosya geçerli bir yedek değil.'); } }); } })),
      h('div', { class: 'trow' }, h('span', { class: 'grow' }, 'Tüm ilerlemeyi sıfırla'), h('button', { class: 'btn small ghost', style: 'color:var(--bad)', onclick: () => { if (confirm('Tüm ilerleme silinecek. Emin misin?')) { localStorage.removeItem(KEY); S = load(); paintTop(); route(); } } }, 'Sıfırla'))));
};

// ── koç yorumu: test sonuçlarına ve haftalık çalışmaya göre kişisel öneriler
const SKILL_OF = { word2tr: 'kelime', pic2word: 'kelime', listen: 'dinleme', sentListen: 'dinleme', sentMeaning: 'okuma', build: 'yazma', spell: 'yazma', type: 'yazma' };
const SKILLS = {
  kelime: { n: 'Kelime bilgisi', i: '🖼️',
    weak: 'Testte kelimelerin anlamını bulmakta zorlandın. Seviyeni en çok kelime hazinen belirliyor.',
    how: ['Her gün “Günün dersi”ni atlamadan yap; yeni kelimede resme bak, sesi dinle ve kelimeyi 3 kez sesli söyle.',
      '“Tekrar” kutusunu her gün sıfırla. Kelime tam unutulmak üzereyken tekrar edilince kalıcı olur.',
      'Günde 5 dakika “Eşleştirme” veya “Resim Quiz” oyna: resim–kelime bağı ezberden hızlı çalışır.'],
    btn: ['Günün dersine başla', () => startLesson()] },
  dinleme: { n: 'Dinleme', i: '🎧',
    weak: 'Kelimeyi yazılı görünce tanıyorsun ama duyunca kaçırıyorsun. Kulağının sese alışması gerekiyor.',
    how: ['Mini diyalogları 3 adımda dinle: önce metin kapalı, sonra metin açık, en son yavaş hızda sesli tekrar.',
      'Her gün 1 diyalog + 1 tur “Dinle & Bul” oyunu yap.',
      'Seviyene uygun podcast’ten haftada 2 bölüm dinle. Hepsini anlamasan da kulağın ritme alışır.'],
    btn: ['Dinleme bölümüne git', () => go('listen')] },
  okuma: { n: 'Okuma', i: '📖',
    weak: 'Yazılı cümlelerin anlamını çıkarmakta zorlandın.',
    how: ['Okuma metinlerinde önce çeviriye bakmadan tüm metni oku, sonra yalnızca anlamadığın cümlelere dokun.',
      'Haftada en az 2 metni bitir ve sorularını çöz.',
      'Aynı metni ertesi gün bir kez daha oku: ikinci okumada hız iki katına çıkar.'],
    btn: ['Okuma metinlerine git', () => go('read')] },
  yazma: { n: 'Yazma ve cümle kurma', i: '✍️',
    weak: 'Kelimeleri tanıyorsun ama kendin yazarken ve cümle kurarken hata yapıyorsun.',
    how: ['Her gün 5 dakika “Dikte” yap: duyduğunu yazmak hem kulağı hem yazımı geliştirir.',
      '“Cümle kur” ile kelime sırasını oturt; yanlış yaptığın cümleyi bir kez de sesli söyle.',
      '“Harf Avı” oyunu kelimenin yazılışını pekiştirir; yanlış yazdığın kelimeyi 3 kez doğru yaz.'],
    btn: ['Dikte çalış', () => startWrite('dict')] }
};
function coach() {
  const p = P(), T = p.tests, last = T[T.length - 1], prev = T[T.length - 2], a = act(), out = [];
  const card = (ic, title, ...body) => h('div', { class: 'card' }, h('h3', null, ic + ' ' + title), body);
  const para = t => h('p', { style: 'margin-top:6px' }, t);
  const steps = arr => h('ol', { style: 'margin:8px 0 0;padding-left:22px' }, arr.map(x => h('li', { style: 'margin-bottom:4px' }, x)));
  const name = LANGS[S.lang].name;

  if (!last) {
    out.push(card('👋', 'Henüz test olmadın',
      para(`Sana özel yorum yapabilmem için önce ${name} seviye testini çözmen gerekiyor. Test yaklaşık 5 dakika sürer; zorlandığın bölümde kendiliğinden biter.`),
      para('Testten sonra burada hangi becerinin zayıf olduğunu, neyi nasıl çalışman gerektiğini ve haftalık hedeflerini göreceksin.'),
      h('button', { class: 'btn', style: 'margin-top:10px', onclick: startTest }, 'Teste başla')));
  } else {
    // 1) genel durum
    const failed = last.detail.find(d => d.ok / d.n < 0.7);
    let gen = `Son testte (${new Date(last.t).toLocaleDateString('tr-TR')}) seviyen ${LV[last.level]} (${LVNAME[last.level]}) çıktı, genel puanın ${last.score}/100.`;
    if (last.top) gen += ' B2 bölümünü de geçtin; artık hedefin gerçek içerikle (podcast, haber, kitap) akıcılık kazanmak.';
    else if (failed) {
      const need = Math.ceil(failed.n * 0.7);
      gen += ` ${LV[failed.l]} bölümünde ${failed.ok}/${failed.n} yaptın; bir üst seviyeye geçmek için ${need} doğru gerekiyor` + (need - failed.ok <= 2 ? ` — sadece ${need - failed.ok} soru uzaktasın!` : '.');
    }
    out.push(card('🎓', 'Genel durumun', para(gen)));

    // 2) gidişat
    if (prev) {
      const d = last.score - prev.score, lvUp = last.level - prev.level;
      const days = Math.max(1, Math.round((last.t - prev.t) / 864e5));
      let tr;
      if (lvUp > 0) tr = `Tebrikler! ${days} günde ${LV[prev.level]} seviyesinden ${LV[last.level]} seviyesine çıktın (puan ${prev.score} → ${last.score}). Şu anki çalışma düzenin işe yarıyor, aynen devam et.`;
      else if (d >= 5) tr = `İlerliyorsun: puanın ${prev.score} → ${last.score} (+${d}). Seviye henüz değişmedi ama doğru yoldasın; aşağıdaki zayıf beceriye odaklanırsan bir sonraki testte seviye atlayabilirsin.`;
      else if (d <= -5) tr = `Puanın düştü: ${prev.score} → ${last.score} (${d}). Bu genelde tekrarların aksadığını gösterir. Bu hafta yeni kelime sayısını azalt (Ayarlar → 5 kelime) ve önce bekleyen tekrarları bitir.`;
      else tr = `Puanın neredeyse aynı kaldı (${prev.score} → ${last.score}). Yerinde sayıyorsun; aynı şeyleri tekrar etmek yerine aşağıda belirttiğim zayıf beceriyi çalışman gerekiyor.`;
      if (T.length >= 3) { const f = T[T.length - 3]; tr += ` Son üç test: ${f.score} → ${prev.score} → ${last.score}.`; }
      out.push(card(d >= 5 || lvUp > 0 ? '📈' : d <= -5 ? '📉' : '➡️', 'Gidişat', para(tr)));
    } else {
      out.push(card('🧭', 'Gidişat', para('Bu ilk testin; karşılaştırma için bir hafta sonraki testi bekliyorum. O zaman ilerleyip ilerlemediğini net söyleyebileceğim.')));
    }

    // 3) beceri analizi
    if (last.sk && Object.keys(last.sk).length) {
      const rows = Object.keys(SKILLS).filter(k => last.sk[k] && last.sk[k][1]).map(k => ({ k, ok: last.sk[k][0], n: last.sk[k][1], pct: last.sk[k][0] / last.sk[k][1] }));
      rows.sort((x, y) => x.pct - y.pct);
      const weak = rows[0], strong = rows[rows.length - 1];
      out.push(card('📊', 'Beceri karnen',
        rows.slice().sort((x, y) => Object.keys(SKILLS).indexOf(x.k) - Object.keys(SKILLS).indexOf(y.k)).map(r => h('div', { class: 'trow' }, h('span', { style: 'width:150px' }, SKILLS[r.k].i + ' ' + SKILLS[r.k].n),
          h('div', { class: 'grow' }, h('div', { class: 'meter', style: 'margin:0' }, h('i', { style: `width:${r.pct * 100}%;background:${r.pct >= .7 ? 'var(--good)' : r.pct >= .4 ? 'var(--gold)' : 'var(--bad)'}` }))), h('b', null, `${r.ok}/${r.n}`))),
        rows.length > 1 && strong.pct > weak.pct ? para(`En güçlü yanın: ${SKILLS[strong.k].n}. En çok geliştirmen gereken: ${SKILLS[weak.k].n}.`) : para('Becerilerin dengeli görünüyor.')));
      if (weak.pct < 0.85) {
        const sk = SKILLS[weak.k];
        const extra = S.lang === 'ka' && weak.k === 'okuma' ? ['Harfleri hâlâ yavaş çözüyorsan her gün “Alfabe testi” yap; hızlanınca Ayarlar’dan Latin okunuşu kapat.'] : [];
        out.push(card(sk.i, 'Öncelikli çalışman gereken: ' + sk.n, para(sk.weak), h('p', { style: 'margin-top:8px;font-weight:700' }, 'Bunu şöyle yapman gerekir:'), steps([...sk.how, ...extra]),
          h('button', { class: 'btn', style: 'margin-top:10px', onclick: sk.btn[1] }, sk.btn[0])));
        const second = rows[1];
        if (second && second.pct < 0.6 && second.k !== weak.k) out.push(card(SKILLS[second.k].i, 'İkinci öncelik: ' + SKILLS[second.k].n, para(SKILLS[second.k].weak), steps(SKILLS[second.k].how.slice(0, 2))));
      } else {
        out.push(card('🌟', 'Bu seviyede güçlüsün', para(`Testteki tüm becerilerde %85 ve üzerindesin. ${last.top ? 'Gerçek podcast’ler ve konuşma pratiğiyle akıcılığını artır.' : 'Bir sonraki testte üst seviye bölümünü geçmek için o seviyenin kelimelerini öğrenmeye başla.'}`)));
      }
    } else {
      out.push(card('📊', 'Beceri karnen', para('Bu test eski sürümde çözüldüğü için beceri dökümü yok. Bir sonraki testten sonra kelime, dinleme, okuma ve yazma puanlarını ayrı ayrı göreceksin.'),
        h('button', { class: 'btn small', style: 'margin-top:8px', onclick: startTest }, 'Testi şimdi tekrar çöz')));
    }

    // 4) kaçırılan kelimeler
    const miss = (last.miss || []).map(id => WORDS.find(w => w.id === id)).filter(Boolean);
    if (miss.length) {
      out.push(card('🎯', 'Testte kaçırdığın kelimeler', para('Bu kelimeleri tekrar kutuna ekledim. Dokunup dinleyebilir, sonra hepsini birden çalışabilirsin.'),
        h('div', { class: 'wgrid', style: 'margin-top:10px' }, miss.map(w => h('button', { class: 'wcard', style: 'box-shadow:inset 0 0 0 1px var(--line)', onclick: () => say(tw(w)) }, h('span', { class: 'em' }, w.e), h('b', null, tw(w), tl(tw(w))), h('small', null, w.tr)))),
        h('button', { class: 'btn', style: 'margin-top:10px', onclick: () => runSession({ title: 'Kaçırdığın kelimeler', back: 'yorum', srs: true, bonus: 20, kind: 'review', steps: shuffle(miss).flatMap(w => [{ type: 'word2tr', it: w }, { type: canSpell(w) ? 'spell' : 'pic2word', it: w }]) }) }, 'Bu kelimeleri çalış')));
    }
  }

  // 5) çalışma alışkanlığı (bu hafta)
  const d0 = dayNum(), activeDays = [...Array(7)].filter((_, k) => S.log[d0 - k]).length, due = dueWords().length, nLearn = learned().length;
  const hab = [];
  if (activeDays >= 6) hab.push(`Son 7 günün ${activeDays}’inde çalıştın — harika bir düzen. Dil öğrenmede en önemli şey bu süreklilik.`);
  else if (activeDays >= 3) hab.push(`Son 7 günün ${activeDays}’inde çalıştın. Fena değil, ama her gün 10 dakika, haftada 3 gün 30 dakikadan çok daha etkili. Hedefin: 7 günde 6 gün.`);
  else hab.push(`Son 7 günde yalnızca ${activeDays} gün çalıştın. Bu tempoyla öğrendiklerin bir sonraki çalışmaya kadar unutuluyor. Telefonuna her gün aynı saate 10 dakikalık bir alarm kur ve sadece “Günün dersi”ni yap.`);
  if (due > 30) hab.push(`${due} kelime tekrar bekliyor; birikmiş. Bu hafta yeni kelime öğrenmeyi durdur, önce tekrarları erit (günde 2 tur “Tekrar”).`);
  else if (due > 0) hab.push(`${due} kelime bugün tekrar bekliyor. Yeni derse başlamadan önce bunları bitir.`);
  if (nLearn) hab.push(`Toplam ${nLearn} kelime öğrendin, bunların ${mastered()} tanesi kalıcı hafızaya geçti.`);
  const missing = [];
  if (!a.speak) missing.push(['konuşma', 'Bu hafta hiç konuşma pratiği yapmadın. Konuşmadan konuşmayı öğrenemezsin: günde 5 cümleyi mikrofona söyle; puanın %75’i geçene kadar tekrar et.']);
  if (!a.listen) missing.push(['dinleme', 'Bu hafta hiç diyalog ya da podcast dinlemedin. En az 3 mini diyalog dinle.']);
  if (!a.read) missing.push(['okuma', 'Bu hafta hiç okuma metni çözmedin. Bir metin sadece 3 dakikanı alır.']);
  if (!a.write) missing.push(['yazma', 'Bu hafta hiç yazma çalışmadın. “Dikte” ile başla.']);
  missing.forEach(m => hab.push(m[1]));
  if (S.lang === 'ka' && Object.keys(p.abc).length < 33) hab.push(`Gürcü alfabesinden ${Object.keys(p.abc).length}/33 harfi tanıyorsun. Alfabe bitmeden okuma ve yazma hızlanmaz; her gün bir “Alfabe testi” çöz.`);
  out.push(card('🗓️', 'Çalışma düzenin', h('ul', { style: 'margin:8px 0 0;padding-left:20px' }, hab.map(x => h('li', { style: 'margin-bottom:5px' }, x)))));

  // 6) bu haftanın hedefleri
  const lv = p.level, goals = [
    ['Günün dersi', a.lesson || 0, 6], ['Konuşma pratiği', a.speak || 0, 5], ['Dinleme (diyalog/podcast)', a.listen || 0, lv >= 3 ? 4 : 3],
    ['Okuma metni', a.read || 0, 2], ['Yazma çalışması', a.write || 0, 3], ['Oyun', a.game || 0, 4]
  ];
  out.push(card('✅', 'Bu haftanın hedefleri', h('p', { class: 'mut' }, 'Hafta Pazartesi başlar. Hepsini tamamlarsan bir sonraki testte farkı görürsün.'),
    goals.map(g => h('div', { class: 'trow' }, h('span', { style: 'width:22px' }, g[1] >= g[2] ? '✅' : '⬜'), h('span', { class: 'grow' }, g[0]),
      h('div', { style: 'width:70px' }, h('div', { class: 'meter', style: 'margin:0' }, h('i', { style: `width:${Math.min(100, g[1] / g[2] * 100)}%` }))), h('b', { style: 'width:42px;text-align:right' }, `${Math.min(g[1], 99)}/${g[2]}`)))));
  if (last && !testDue()) out.push(h('p', { class: 'hint' }, `Yorum her testten sonra yenilenir. Sonraki test: ${Math.ceil((p.lastTest + WEEK - Date.now()) / 864e5)} gün sonra.`));
  return out;
}

// kısayol rotaları
V.yorum = () => page('Koçun yorumu · ' + LANGS[S.lang].name, 'me', coach());
V.lesson = startLesson; V.test = startTest; V.review = startReview;
V.memory = gameMemory; V.speed = gameSpeed;

// ───────────────────────── yönlendirme ─────────────────────────
const TABS = { home: 'home', learn: 'learn', words: 'learn', cat: 'learn', abc: 'learn', read: 'learn', story: 'learn', games: 'games', memory: 'games', speed: 'games', listen: 'listen', dlg: 'listen', pod: 'listen', me: 'me', yorum: 'me' };
function route() {
  endSession(); stopAudio(); clearInterval(speedTimer);
  const raw = location.hash.slice(1) || 'home', ix = raw.indexOf('/');
  const name = ix < 0 ? raw : raw.slice(0, ix), arg = ix < 0 ? undefined : decodeURIComponent(raw.slice(ix + 1));
  const fn = V[name] || V.home;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === (TABS[name] || 'home')));
  paintTop();
  fn(arg);
  if (!document.body.classList.contains('in-session')) window.scrollTo(0, 0);
}
function go(hash) { if (location.hash.slice(1) === hash) route(); else location.hash = hash; }
window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
})();
