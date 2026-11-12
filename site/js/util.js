// Tarayıcı ve Node tarafından ortak kullanılan yardımcılar
globalThis.fnv = function (s) {
  let x = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193); }
  return (x >>> 0).toString(16).padStart(8, '0');
};
// ses dosyası yolu: audio/<dil>/<ses>_<hash>.mp3   (ses: f = kadın, m = erkek)
globalThis.audioPath = function (lang, text, voice) {
  return 'audio/' + lang + '/' + (voice || 'f') + '_' + globalThis.fnv(text) + '.mp3';
};
