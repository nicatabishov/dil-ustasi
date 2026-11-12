// Gerçek podcast akışlarından son bölümleri çekip site/js/podcasts.js dosyasını üretir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));

const SHOWS = [
  { lang: 'en', l: 1, name: 'Learning Easy English', by: 'BBC', note: 'Yeni başlayanlar için yavaş ve basit İngilizce.', feed: 'https://podcasts.files.bbci.co.uk/p0hsrwv5.rss', web: 'https://www.bbc.co.uk/learningenglish' },
  { lang: 'en', l: 2, name: 'American Stories', by: 'VOA Learning English', note: 'Yavaş okunan kısa hikâyeler.', feed: 'https://learningenglish.voanews.com/podcast/?zoneId=1581', web: 'https://learningenglish.voanews.com' },
  { lang: 'en', l: 2, name: 'Learning English Conversations', by: 'BBC', note: 'Günlük konuşma kalıpları, kısa bölümler.', feed: 'https://podcasts.files.bbci.co.uk/p02pc9zn.rss', web: 'https://www.bbc.co.uk/learningenglish' },
  { lang: 'en', l: 3, name: '6 Minute English', by: 'BBC', note: '6 dakikada bir konu ve yeni kelimeler.', feed: 'https://podcasts.files.bbci.co.uk/p02pc9tn.rss', web: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english' },
  { lang: 'en', l: 3, name: 'Espresso English', by: 'Shayna Oliveira', note: 'Kısa dilbilgisi ve kelime ipuçları.', feed: 'https://rss.libsyn.com/shows/56803/destinations/212704.xml', web: 'https://www.espressoenglish.net' },
  { lang: 'en', l: 3, name: 'Easy Stories in English', by: 'Ariel Goodbody', note: 'Seviyeli, eğlenceli hikâyeler.', feed: 'https://feeds.megaphone.fm/GLSS2276105381', web: 'https://easystoriesinenglish.com' },
  { lang: 'en', l: 4, name: 'English Learning for Curious Minds', by: 'Leonardo English', note: 'İlginç konular, net ve orta hızda anlatım.', feed: 'https://feeds.transistor.fm/leonardo-english-english-language-learning-for-curious-minds', web: 'https://www.leonardoenglish.com' },
  { lang: 'en', l: 4, name: 'All Ears English', by: 'Lindsay McMahon', note: 'Doğal Amerikan İngilizcesi sohbetleri.', feed: 'https://feeds.megaphone.fm/allearsenglish', web: 'https://www.allearsenglish.com' },
  { lang: 'ka', l: 1, name: 'Learn Georgian with Fexingo', by: 'Fexingo', note: 'Gürcüce öğrenenler için kısa dersler (İngilizce anlatımlı).', feed: 'https://feeds.fexingo.com/languages/learn-georgian-with-fexingo.xml', web: 'https://fexingo.com' },
  { lang: 'ka', l: 3, name: 'შინ - უცხოეთში', by: 'რადიო თავისუფლება', note: 'Anadilinde sohbet programı (doğal hız).', feed: 'https://www.radiotavisupleba.ge/podcast/?zoneId=22405', web: 'https://www.radiotavisupleba.ge' },
  { lang: 'ka', l: 4, name: 'აუდიო — ახალი ამბები', by: 'რადიო თავისუფლება', note: 'Güncel haberler ve röportajlar (ileri seviye).', feed: 'https://www.radiotavisupleba.ge/podcast/?zoneId=16975', web: 'https://www.radiotavisupleba.ge' },
  { lang: 'ka', l: 4, name: 'ლიტერატურული პოდკასტი „წიგნები“', by: 'რადიო თავისუფლება', note: 'Kitaplar üzerine sohbetler (ileri seviye).', feed: 'https://www.radiotavisupleba.ge/podcast/?zoneId=22605', web: 'https://www.radiotavisupleba.ge' },
];

const dec = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/\s+/g, ' ').trim();
const tag = (x, t) => { const m = x.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')); return m ? dec(m[1]) : ''; };

let old = [];
try { await import(pathToFileURL(path.join(here, '..', 'site', 'js', 'podcasts.js')).href); old = globalThis.PODCASTS || []; } catch (e) {}
const out = [];
for (const s of SHOWS) {
  try {
    const r = await fetch(s.feed, { headers: { 'User-Agent': 'Mozilla/5.0 (podcast reader)' }, signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const xml = await r.text();
    const eps = [];
    for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)) {
      const it = m[0];
      const enc = it.match(/<enclosure[^>]*url="([^"]+)"/);
      if (!enc) continue;
      const d = new Date(tag(it, 'pubDate'));
      eps.push({
        t: tag(it, 'title').slice(0, 140),
        u: enc[1].replace(/&amp;/g, '&').replace(/^http:\/\//, 'https://').replace('/proto/http/', '/proto/https/'),
        d: isNaN(d) ? '' : d.toISOString().slice(0, 10),
        m: tag(it, 'itunes:duration')
      });
      if (eps.length >= 12) break;
    }
    if (!eps.length) throw new Error('bölüm yok');
    const { feed, ...rest } = s;
    out.push({ ...rest, eps });
    console.log('ok  ', s.name, eps.length, eps[0].d);
  } catch (e) {
    console.log('HATA', s.name, e.message);
    const prev = old.find(o => o.name === s.name); if (prev) out.push(prev); // akış erişilemezse eski bölümler kalsın
  }
}
fs.writeFileSync(path.join(here, '..', 'site', 'js', 'podcasts.js'),
  '// build-podcasts.mjs tarafından üretildi: ' + new Date().toISOString().slice(0, 10) + '\nglobalThis.PODCASTS = ' + JSON.stringify(out, null, 1) + ';\n');
