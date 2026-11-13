// Tüm seslendirilecek metinleri jobs.json'a yazar ve veri tutarlılığını denetler.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, '..', 'site');
for (const f of ['util.js', 'data-words.js', 'data-content.js', 'data-extra.js']) await import(pathToFileURL(path.join(site, 'js', f)).href);

const jobs = new Map();
const add = (lang, text, voice = 'f') => {
  const file = audioPath(lang, text, voice);
  const prev = jobs.get(file);
  if (prev && prev.text !== text) throw new Error('hash çakışması: ' + text + ' / ' + prev.text);
  jobs.set(file, { lang, voice, text, file });
};
// tutarlılık
const ids = new Set(), dup = [];
for (const w of WORDS) {
  if (!w.e || !w.tr || (w.only ? !w[w.only] || !w.ex || !w.exTr : !w.en || !w.ka)) throw new Error('eksik alan: ' + JSON.stringify(w));
  if (ids.has(w.id)) dup.push(w.id); ids.add(w.id);
}
if (dup.length) throw new Error('tekrarlanan kelime: ' + dup.join(', '));
const kaSeen = {};
for (const w of WORDS) if (w.ka) { (kaSeen[w.ka] ||= []).push(w.en || w.id); }
for (const [k, v] of Object.entries(kaSeen)) if (v.length > 1) console.log('uyarı — aynı Gürcüce:', k, v.join(' / '));

for (const w of WORDS) { if (w.en) add('en', w.en); if (w.ka) add('ka', w.ka); if (w.ex) add(w.only, w.ex); }
for (const lang of ['en', 'ka']) for (const t of TRAPS[lang]) for (const [text] of t.say || []) add(lang, text);
for (const s of SENTENCES) { add('en', s.en); add('ka', s.ka); }
for (const d of DIALOGUES) for (const l of d.lines) { const v = l.s === 'A' ? 'f' : 'm'; add('en', l.en, v); add('ka', l.ka, v); }
for (const s of STORIES) for (const l of s.lines) { add('en', l.en); add('ka', l.ka); }
for (const a of ALPHABET) add('ka', a.ex);

fs.writeFileSync(path.join(here, 'jobs.json'), JSON.stringify([...jobs.values()], null, 0));
const lv = {}; for (const w of WORDS) lv[w.l] = (lv[w.l] || 0) + 1;
console.log('kelime:', WORDS.length, JSON.stringify(lv), '| cümle:', SENTENCES.length, '| diyalog:', DIALOGUES.length, '| metin:', STORIES.length, '| ses işi:', jobs.size);
