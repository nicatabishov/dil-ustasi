// Gerçek podcast akışlarından son bölümleri çekip site/js/podcasts.js dosyasını üretir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SHOWS } from './shows.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));


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
      if (eps.length >= 10) break;
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
