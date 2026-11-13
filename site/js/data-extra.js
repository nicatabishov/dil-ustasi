// Dile özel içerik: phrasal verb'ler, kalıp ifadeler, Türklere özel tuzaklar, yazı görevleri, sohbet senaryoları.
// Kalıp satırı: emoji|ifade|türkçe|örnek cümle|örneğin çevirisi
(() => {
const EXTRA = [
{c:'Phrasal verb’ler', i:'🧩', l:3, lang:'en', w:`
🤒|get over|atlatmak, üstesinden gelmek|It took me a week to get over the flu.|Gribi atlatmam bir hafta sürdü.
🧩|figure out|çözmek, anlamak|I can't figure out how this works.|Bunun nasıl çalıştığını çözemiyorum.
🔎|look for|aramak|I am looking for my keys.|Anahtarlarımı arıyorum.
🍼|look after|bakmak, ilgilenmek|She looks after her little brother.|Küçük kardeşine bakıyor.
🤩|look forward to|dört gözle beklemek|I look forward to seeing you.|Seni görmeyi dört gözle bekliyorum.
🏳️|give up|pes etmek, bırakmak|Don't give up, you are almost there.|Pes etme, neredeyse başardın.
🔍|find out|öğrenmek, ortaya çıkarmak|I want to find out the truth.|Gerçeği öğrenmek istiyorum.
🚙|pick up|almak (birini ya da bir şeyi)|Can you pick me up at six?|Beni altıda alabilir misin?
💡|turn on|açmak (cihaz, ışık)|Please turn on the light.|Lütfen ışığı aç.
📴|turn off|kapatmak (cihaz, ışık)|Turn off your phone, please.|Telefonunu kapat lütfen.
⏰|wake up|uyanmak|I wake up at seven every day.|Her gün yedide uyanırım.
🛫|take off|kalkmak (uçak); çıkarmak (giysi)|The plane takes off at noon.|Uçak öğlen kalkıyor.
🧥|put on|giymek|Put on your coat, it is cold.|Paltonu giy, hava soğuk.
⛽|run out of|bitmek, tükenmek|We ran out of milk.|Sütümüz bitti.
🤝|get along with|iyi geçinmek|I get along with my neighbors.|Komşularımla iyi geçinirim.
🏃|hurry up|acele etmek|Hurry up, we are late!|Acele et, geç kaldık!
📞|call back|geri aramak|I will call you back in five minutes.|Seni beş dakika sonra geri ararım.
✍️|write down|not almak|Write down my phone number.|Telefon numaramı not al.
🧘|calm down|sakinleşmek|Calm down, everything is fine.|Sakin ol, her şey yolunda.
🌱|grow up|büyümek|I grew up in a small village.|Küçük bir köyde büyüdüm.`},

{c:'Günlük kalıplar', i:'💬', l:3, lang:'en', w:`
🤷|it's up to you|sana kalmış|We can stay or go, it's up to you.|Kalabiliriz ya da gidebiliriz, sana kalmış.
🍰|a piece of cake|çocuk oyuncağı, çok kolay|The exam was a piece of cake.|Sınav çocuk oyuncağıydı.
👌|no worries|sorun değil|No worries, I can wait.|Sorun değil, bekleyebilirim.
🤔|it depends|duruma göre değişir|Maybe. It depends on the weather.|Belki. Havaya bağlı.
😌|take it easy|kendini yorma, sakin ol|Take it easy, you need to rest.|Kendini yorma, dinlenmen lazım.
🎯|make sense|mantıklı olmak|That makes sense.|Bu mantıklı.
🙋|by the way|bu arada|By the way, where do you work?|Bu arada, nerede çalışıyorsun?`},

{c:'Phrasal verb’ler 2', i:'🚀', l:4, lang:'en', w:`
📅|put off|ertelemek|Don't put off your homework.|Ödevini erteleme.
🙅|turn down|reddetmek; sesini kısmak|He turned down the job offer.|İş teklifini reddetti.
💥|break down|bozulmak|My car broke down on the road.|Arabam yolda bozuldu.
🧠|come up with|bulmak, ortaya atmak (fikir)|She came up with a great idea.|Harika bir fikir buldu.
🚧|deal with|ilgilenmek, başa çıkmak|I have to deal with a difficult customer.|Zor bir müşteriyle ilgilenmem gerekiyor.
🤗|get used to|alışmak|I got used to the cold weather.|Soğuk havaya alıştım.
➡️|carry on|devam etmek|Carry on, you are doing great.|Devam et, çok iyi gidiyorsun.
🧐|look into|araştırmak, incelemek|We will look into the problem.|Sorunu inceleyeceğiz.
🏃‍♂️|catch up|yetişmek, arayı kapatmak|I need to catch up on my work.|İşlerime yetişmem lazım.
😞|let down|hayal kırıklığına uğratmak|I won't let you down.|Seni hayal kırıklığına uğratmayacağım.
🧱|set up|kurmak|They set up a new company.|Yeni bir şirket kurdular.
🔚|end up|sonunda … olmak|We ended up staying at home.|Sonunda evde kaldık.`},

{c:'Kalıplar 2', i:'🗯️', l:4, lang:'en', w:`
🌧️|under the weather|keyifsiz, hafif hasta|I feel a bit under the weather today.|Bugün biraz keyifsizim.
⏳|in the long run|uzun vadede|It will be cheaper in the long run.|Uzun vadede daha ucuz olacak.
🎲|on the other hand|öte yandan|It is expensive. On the other hand, it is very good.|Pahalı. Öte yandan çok iyi.
🤞|fingers crossed|umarım olur|I have an interview tomorrow. Fingers crossed!|Yarın mülakatım var. Umarım olur!
⚖️|as far as I know|bildiğim kadarıyla|As far as I know, the shop is closed.|Bildiğim kadarıyla dükkân kapalı.`},

{c:'Günlük kalıplar (Gürcüce)', i:'💬', l:2, lang:'ka', w:`
🙂|რა ხდება?|ne var ne yok?|გამარჯობა, რა ხდება?|Merhaba, ne var ne yok?
👍|არა უშავს|önemli değil; fena değil|არა უშავს, ყველაფერი კარგად იქნება.|Önemli değil, her şey iyi olacak.
🤝|კარგად იყავი|kendine iyi bak|ნახვამდის, კარგად იყავი!|Görüşürüz, kendine iyi bak!
🍷|გაუმარჯოს!|şerefe!|საქართველოს გაუმარჯოს!|Gürcistan'ın şerefine!
🍽️|გემრიელად მიირთვით|afiyet olsun|სუფრა მზად არის, გემრიელად მიირთვით!|Sofra hazır, afiyet olsun!
🤷|არ ვიცი|bilmiyorum|არ ვიცი, სად არის.|Nerede olduğunu bilmiyorum.
✅|რა თქმა უნდა|tabii ki|რა თქმა უნდა, დაგეხმარები.|Tabii ki sana yardım ederim.
🙏|თუ შეიძლება|lütfen, mümkünse|წყალი, თუ შეიძლება.|Su, lütfen.
😊|არაფრის|rica ederim|მადლობა! არაფრის.|Teşekkürler! Rica ederim.
🎉|გილოცავ!|tebrikler, kutlu olsun!|დაბადების დღეს გილოცავ!|Doğum günün kutlu olsun!
🚶|წავედი|ben gidiyorum, kaçtım|კარგი, მე წავედი.|Tamam, ben gidiyorum.
⏱️|ერთი წუთით|bir dakika|ერთი წუთით, ახლავე მოვალ.|Bir dakika, hemen geliyorum.
😯|მართლა?|gerçekten mi?|მართლა? არ ვიცოდი.|Gerçekten mi? Bilmiyordum.
👌|კარგი|tamam, peki|კარგი, ხვალ შევხვდეთ.|Tamam, yarın buluşalım.
🆗|ყველაფერი რიგზეა|her şey yolunda|არ ინერვიულო, ყველაფერი რიგზეა.|Merak etme, her şey yolunda.`},

{c:'Kalıplar 2 (Gürcüce)', i:'🗯️', l:3, lang:'ka', w:`
💗|გენაცვალე|canım (sevgi sözü)|მოდი, გენაცვალე.|Gel canım.
😅|რას იზამ|ne yaparsın, elden ne gelir|რას იზამ, ასეთია ცხოვრება.|Ne yaparsın, hayat böyle.
🤔|ჩემი აზრით|bence|ჩემი აზრით, ეს კარგი იდეაა.|Bence bu iyi bir fikir.
📌|სხვათა შორის|bu arada|სხვათა შორის, სად მუშაობ?|Bu arada, nerede çalışıyorsun?
🙌|ღმერთმა ქნას|inşallah|ღმერთმა ქნას, ყველაფერი კარგად იყოს.|İnşallah her şey iyi olur.
😤|თავი დამანებე|beni rahat bırak|თავი დამანებე, დაღლილი ვარ.|Beni rahat bırak, yorgunum.
🤗|მომენატრე|seni özledim|ძალიან მომენატრე.|Seni çok özledim.
🥱|მეზარება|üşeniyorum|დღეს მუშაობა მეზარება.|Bugün çalışmaya üşeniyorum.
🤞|იმედი მაქვს|umarım|იმედი მაქვს, მალე გნახავ.|Umarım seni yakında görürüm.
⚖️|გააჩნია|duruma göre değişir|გააჩნია ამინდს.|Havaya bağlı.
🧠|გასაგებია|anlaşıldı|გასაგებია, მადლობა.|Anlaşıldı, teşekkürler.
😔|სამწუხაროდ|maalesef|სამწუხაროდ, დღეს ვერ მოვალ.|Maalesef bugün gelemem.
🫶|როგორც გინდა|nasıl istersen|როგორც გინდა, ისე გააკეთე.|Nasıl istersen öyle yap.`}
];
for (const g of EXTRA) {
  globalThis.WORD_DATA.push(g);
  for (const line of g.w.trim().split('\n')) {
    const [e, ph, tr, ex, exTr] = line.split('|').map(s => s.trim());
    globalThis.WORDS.push({ id: 'x:' + ph, e, tr, [g.lang]: ph, cat: g.c, l: g.l, ex, exTr, only: g.lang });
  }
}

// ── Türklere özel tuzaklar. ex: [yanlış, doğru, neden]  ·  say: [söylenecek, türkçe]
globalThis.TRAPS = {
en: [
{ id: 'article', e: '🅰️', title: 'a / an / the', sub: 'Türkçede artikel yok; en sık unutulan şey',
  body: ['Türkçede “a/the” karşılığı olmadığı için çoğu zaman hiç kullanmıyoruz. İngilizcede tekil ve sayılabilir bir isim neredeyse hiçbir zaman çıplak kalmaz.',
    'a / an: ilk kez söz edilen, herhangi bir şey (a car, an apple). the: ikimizin de bildiği, belirli şey (the car = o araba). Genel konuşurken çoğul ve sayılamayan isimlerde artikel yok (I like music).'],
  ex: [['I have car.', 'I have a car.', 'Tekil sayılabilir isim: a gerekir.'], ['I love the music.', 'I love music.', 'Genel anlamda müzik: artikel yok.'], ['Sun is hot.', 'The sun is hot.', 'Tek ve belli olan şey: the.'], ['She is engineer.', 'She is an engineer.', 'Meslekler a/an alır.']],
  q: [{ q: 'I bought ___ book yesterday.', o: ['a', 'the', '(boş)'], a: 0 }, { q: '___ book I bought yesterday is great.', o: ['A', 'The', '(boş)'], a: 1 }, { q: 'She is ___ engineer.', o: ['a', 'an', '(boş)'], a: 1 }, { q: 'I like ___ coffee. (genel olarak)', o: ['a', 'the', '(boş)'], a: 2 }] },
{ id: 'heshe', e: '🚻', title: 'he / she / it', sub: 'Türkçedeki tek “o” üçe ayrılır',
  body: ['Türkçede kadın, erkek ve nesne için tek kelime var: “o”. İngilizcede erkek = he, kadın = she, nesne ve hayvan = it. Konuşurken en sık yapılan hata kadınlara “he” demek.',
    'İyelik de değişir: his (onun – erkek), her (onun – kadın), its (onun – nesne). İpucu: cümleye başlamadan önce kişiyi gözünde canlandır.'],
  ex: [['My mother is a doctor. He works a lot.', 'My mother is a doctor. She works a lot.', 'Anne kadın: she.'], ['This is my sister. His name is Ana.', 'This is my sister. Her name is Ana.', 'Kadının adı: her name.'], ['I have a car. He is red.', 'I have a car. It is red.', 'Nesne: it.']],
  q: [{ q: 'My brother is tall. ___ is twenty.', o: ['She', 'He', 'It'], a: 1 }, { q: 'This is my wife. ___ name is Liana.', o: ['His', 'Her', 'Its'], a: 1 }, { q: 'I have a new phone. ___ is very fast.', o: ['He', 'She', 'It'], a: 2 }] },
{ id: 'perfect', e: '⏳', title: 'Present perfect mi, past simple mı?', sub: '“yaptım”ın iki ayrı karşılığı',
  body: ['Türkçede “gittim” tek biçim. İngilizcede zaman belliyse (yesterday, last week, in 2020, two days ago) past simple: I went.',
    'Zaman söylenmiyorsa, deneyimden söz ediyorsan (ever, never) ya da geçmişte başlayıp hâlâ sürüyorsa (since, for) present perfect: I have been, I have lived.'],
  ex: [['I have seen him yesterday.', 'I saw him yesterday.', 'yesterday = belli zaman → past simple.'], ['I live here since 2020.', 'I have lived here since 2020.', 'Hâlâ sürüyor + since → present perfect.'], ['Did you ever eat khinkali?', 'Have you ever eaten khinkali?', 'Hayat deneyimi (ever) → present perfect.']],
  q: [{ q: 'I ___ to Tbilisi last year.', o: ['have gone', 'went', 'go'], a: 1 }, { q: 'I ___ never ___ sushi.', o: ['did … eat', 'have … eaten', 'am … eating'], a: 1 }, { q: 'She ___ here since Monday.', o: ['is', 'was', 'has been'], a: 2 }, { q: 'We ___ this film two days ago.', o: ['watched', 'have watched', 'watch'], a: 0 }] },
{ id: 'third', e: '3️⃣', title: 'He works — üçüncü tekil “-s”', sub: 'En basit ama en çok unutulan kural',
  body: ['Geniş zamanda he / she / it ile fiile -s gelir: I work → he works. Olumsuz ve soruda “does” kullanılır, -s fiilden düşer: he doesn’t work, does he work?'],
  ex: [['He work in a bank.', 'He works in a bank.', 'he/she/it + fiil-s.'], ['She don’t like coffee.', 'She doesn’t like coffee.', 'Olumsuzda doesn’t.'], ['Does he works here?', 'Does he work here?', 'does varken fiil yalın kalır.']],
  q: [{ q: 'My father ___ every morning.', o: ['run', 'runs', 'running'], a: 1 }, { q: 'She ___ speak Georgian.', o: ['don’t', 'doesn’t', 'isn’t'], a: 1 }, { q: '___ your brother live in Tbilisi?', o: ['Do', 'Does', 'Is'], a: 1 }] },
{ id: 'tobe', e: '🙅', title: '“I am agree” tuzağı', sub: 'am / is / are gereksiz yere eklenmez',
  body: ['Türkçedeki “-yorum, -im” ekleri yüzünden fiilin önüne “am” koyma eğilimi olur. agree, want, like, know, think zaten fiildir: I agree, I want.',
    'am / is / are yalnızca sıfat ve isimle (I am tired, I am a teacher) ya da -ing ile (I am working) kullanılır. Bir de -ed / -ing farkı: I am bored = sıkıldım, I am boring = sıkıcıyım!'],
  ex: [['I am agree with you.', 'I agree with you.', 'agree bir fiil; am gerekmez.'], ['I am work in Tbilisi.', 'I work in Tbilisi.', 'Ya “I work” ya “I am working”.'], ['I am boring in this lesson.', 'I am bored in this lesson.', 'Sıkılan kişi: bored.']],
  q: [{ q: '“Sana katılıyorum.”', o: ['I am agree with you.', 'I agree with you.', 'I agreeing with you.'], a: 1 }, { q: '“Şu an çalışıyorum.”', o: ['I am work now.', 'I working now.', 'I am working now.'], a: 2 }, { q: '“Film sıkıcıydı, ben de sıkıldım.”', o: ['The film was boring, I was bored.', 'The film was bored, I was boring.', 'The film was boring, I was boring.'], a: 0 }] },
{ id: 'prep', e: '📍', title: 'Edatlar: in / on / at / to', sub: 'Türkçe ekleri birebir çevirme',
  body: ['Zaman: at + saat (at five), on + gün (on Monday), in + ay/yıl/mevsim (in July, in 2026).',
    'Bazı fiillerin edatı Türkçeden farklıdır: listen to music, depend on, married to, good at, afraid of. “home” edatsız kullanılır: go home.'],
  ex: [['I listen music every day.', 'I listen to music every day.', 'listen to.'], ['She is married with a doctor.', 'She is married to a doctor.', '“ile evli” = married to.'], ['I go to home at six.', 'I go home at six.', 'home edatsızdır.'], ['See you in Monday.', 'See you on Monday.', 'Günlerle on.']],
  q: [{ q: 'The meeting is ___ Friday.', o: ['in', 'on', 'at'], a: 1 }, { q: 'I wake up ___ seven o’clock.', o: ['in', 'on', 'at'], a: 2 }, { q: 'It depends ___ the weather.', o: ['to', 'on', 'of'], a: 1 }, { q: 'My birthday is ___ July.', o: ['in', 'on', 'at'], a: 0 }] },
{ id: 'makedo', e: '🛠️', title: 'make mi, do mu?', sub: 'İkisi de “yapmak” ama karışmaz',
  body: ['do: iş, görev, faaliyet (do homework, do business, do the dishes, do sport). make: ortaya bir şey çıkarmak (make a cake, make a mistake, make a decision, make money, make a phone call).'],
  ex: [['I did a mistake.', 'I made a mistake.', 'Hata “yapılır” ama make ile.'], ['I make my homework.', 'I do my homework.', 'Ödev: do.'], ['We must do a decision.', 'We must make a decision.', 'Karar: make.']],
  q: [{ q: 'Sorry, I ___ a mistake.', o: ['did', 'made', 'had'], a: 1 }, { q: 'I ___ my homework every evening.', o: ['do', 'make', 'work'], a: 0 }, { q: 'She ___ a lot of money.', o: ['does', 'makes', 'wins'], a: 1 }] },
{ id: 'order', e: '🔀', title: 'Kelime sırası ve sorular', sub: 'Fiil sonda değil, ortada',
  body: ['Türkçe: özne – nesne – fiil. İngilizce: özne – fiil – nesne. “very much” ve zaman ifadeleri genelde sona gider: I like it very much.',
    'Soruda yardımcı fiil öznenin önüne geçer: Where are you going? Ama cümle içine gömülü soruda sıra düz kalır: I don’t know where he is.'],
  ex: [['I very like this city.', 'I like this city very much.', 'very much sona gider.'], ['Where you are going?', 'Where are you going?', 'Soruda are öne geçer.'], ['I don’t know where is he.', 'I don’t know where he is.', 'İç cümlede düz sıra.']],
  q: [{ q: '“Bu şehri çok seviyorum.”', o: ['I very like this city.', 'I like very much this city.', 'I like this city very much.'], a: 2 }, { q: '“Nerede yaşıyorsun?”', o: ['Where you live?', 'Where do you live?', 'Where live you?'], a: 1 }, { q: '“Saatin kaç olduğunu biliyor musun?”', o: ['Do you know what time is it?', 'Do you know what time it is?', 'Do you know what is time?'], a: 1 }] },
{ id: 'uncount', e: '🧮', title: 'Sayılamayan isimler', sub: 'information, advice, money…',
  body: ['Bazı isimler İngilizcede çoğul yapılmaz: information, advice, news, furniture, money, homework. “many” yerine “much / a lot of” alırlar.', '“people” ise zaten çoğuldur: people are.'],
  ex: [['Thank you for the informations.', 'Thank you for the information.', 'information çoğul olmaz.'], ['I have many money.', 'I have a lot of money.', 'Sayılamayan: much / a lot of.'], ['People is friendly here.', 'People are friendly here.', 'people çoğuldur.']],
  q: [{ q: 'Can you give me some ___?', o: ['advices', 'advice', 'an advice'], a: 1 }, { q: 'How ___ money do you have?', o: ['many', 'much', 'more'], a: 1 }, { q: 'The people in Georgia ___ very kind.', o: ['is', 'are', 'be'], a: 1 }] },
{ id: 'th', e: '👅', title: '“th” sesi', sub: 'think ≠ sink, three ≠ tree',
  body: ['Türkçede bu ses yok, o yüzden “t”, “d”, “s” ya da “z” ile söylüyoruz. Doğrusu: dil ucunu üst ve alt dişlerin arasına hafifçe koy ve hava üfle.',
    'Sessiz th: think, three, thank. Sesli th (gırtlak titrer): this, that, mother. Aynanın karşısında dilinin ucunu görüyorsan doğru yapıyorsun.'],
  ex: [['“tree” (ağaç)', '“three” (üç)', 'Dil dişlerin arasında.'], ['“sink” (lavabo)', '“think” (düşünmek)', 's değil, th.'], ['“dis”', '“this”', 'Sesli th; d değil.']],
  say: [['three', 'üç'], ['think', 'düşünmek'], ['this', 'bu'], ['thirty-three', 'otuz üç'], ['I think this is the third one.', 'Bence bu üçüncüsü.']],
  q: [{ q: '“th” sesi için dil nerede olmalı?', o: ['Damakta', 'Dişlerin arasında', 'Alt dişlerin arkasında'], a: 1 }] },
{ id: 'wv', e: '👄', title: '“w” ve “v” sesleri', sub: 'wine ≠ vine, west ≠ vest',
  body: ['Türkçede yalnızca “v” var, bu yüzden “w”yu da “v” gibi söylüyoruz. w: dudakları yuvarla, “u” der gibi başla, dişler dudağa değmez (water ≈ “uotır”).',
    'v: üst dişler alt dudağa değer (very). İkisini karıştırmak anlamı değiştirir: wine (şarap) – vine (asma).'],
  ex: [['“vater”', '“water”', 'Dudaklar yuvarlak; dişler değmez.'], ['“vest” (yelek)', '“west” (batı)', 'w ile başka kelime.'], ['“wery”', '“very”', 'v’de dişler dudağa değer.']],
  say: [['water', 'su'], ['west', 'batı'], ['vest', 'yelek'], ['very well', 'çok iyi'], ['We want white wine.', 'Beyaz şarap istiyoruz.']],
  q: [{ q: '“w” söylerken ne yapılır?', o: ['Dişler alt dudağa değer', 'Dudaklar yuvarlanır, dişler değmez', 'Dil dişlerin arasına girer'], a: 1 }] }
],
ka: [
{ id: 'ejective', e: '💨', title: 'Sert ve yumuşak ünsüzler', sub: 'კ/ქ · პ/ფ · ტ/თ · წ/ც · ჭ/ჩ',
  body: ['Gürcücede Türkçedeki “k, p, t, ç” seslerinin ikişer hali var. Yumuşak olanlar (ქ ფ თ ც ჩ) Türkçedeki gibi nefesli söylenir. Sert olanlar (კ პ ტ წ ჭ) nefessiz, gırtlak kapatılıp “patlatılarak” söylenir.',
    'Bu fark anlamı değiştirir: კარი = kapı, ქარი = rüzgâr. Elini ağzının önüne tut: yumuşak seste nefes hissedersin, sert seste hissetmemelisin.'],
  ex: [['ქარი (rüzgâr)', 'კარი (kapı)', 'Aynı kelime değil: კ sert, ქ nefesli.'], ['ფური (inek)', 'პური (ekmek)', 'Ekmek isterken პ sert olmalı.'], ['თ (nefesli t)', 'ტ (sert t)', 'თითი = parmak, ტყე = orman.']],
  say: [['კარი', 'kapı'], ['ქარი', 'rüzgâr'], ['პური', 'ekmek'], ['თითი', 'parmak'], ['წყალი', 'su'], ['ჭიქა', 'bardak']],
  q: [{ q: '“kapı” hangisi?', o: ['ქარი', 'კარი', 'ყური'], a: 1 }, { q: '“rüzgâr” hangisi?', o: ['ქარი', 'კარი', 'ქალი'], a: 0 }, { q: 'Sert ünsüzlerde (კ პ ტ) ne olmaz?', o: ['Ses', 'Nefes çıkışı', 'Dudak hareketi'], a: 1 }] },
{ id: 'have', e: '🤲', title: 'მაქვს mı, მყავს mı?', sub: '“var” demenin iki yolu',
  body: ['Gürcücede “bende var” derken sahip olunan şeye bakılır. Cansız şeyler için მაქვს: მე მაქვს წიგნი (kitabım var).',
    'İnsanlar ve hayvanlar için მყავს: მე მყავს ძმა (kardeşim var), მე მყავს კატა (kedim var). İlginç istisna: araba da მყავს alır — მანქანა მყავს.'],
  ex: [['მე მაქვს ძმა.', 'მე მყავს ძმა.', 'Kardeş canlı: მყავს.'], ['მე მყავს ტელეფონი.', 'მე მაქვს ტელეფონი.', 'Telefon cansız: მაქვს.']],
  q: [{ q: 'მე ___ კატა. (Kedim var.)', o: ['მაქვს', 'მყავს', 'ვარ'], a: 1 }, { q: 'მე ___ სახლი. (Evim var.)', o: ['მაქვს', 'მყავს', 'ვარ'], a: 0 }, { q: 'მე ___ ორი და. (İki kız kardeşim var.)', o: ['მაქვს', 'მყავს', 'არის'], a: 1 }] },
{ id: 'postpos', e: '📍', title: 'Son ekler: -ში, -ზე, -დან', sub: 'İyi haber: Türkçeye çok benziyor',
  body: ['Gürcücede edatlar Türkçedeki gibi kelimenin sonuna eklenir. -ში = içinde / içine (hem “-de” hem “-e”): თბილისში = Tiflis’te, Tiflis’e. -ზე = üstünde, -e: მაგიდაზე = masada.',
    '-დან = -den: თურქეთიდან = Türkiye’den. -თან = yanında: მეგობართან = arkadaşın yanında. -თვის = için: ჩემთვის = benim için. Ek gelirken kelime sonundaki -ი düşer: თბილისი → თბილისში.'],
  ex: [['თბილისი ვცხოვრობ.', 'თბილისში ვცხოვრობ.', '“-de” için -ში eklenir.'], ['თურქეთი ვარ.', 'თურქეთიდან ვარ.', '“-den” için -დან.']],
  q: [{ q: '“Tiflis’te yaşıyorum.”', o: ['თბილისში ვცხოვრობ.', 'თბილისიდან ვცხოვრობ.', 'თბილისზე ვცხოვრობ.'], a: 0 }, { q: '“Türkiye’denim.”', o: ['თურქეთში ვარ.', 'თურქეთიდან ვარ.', 'თურქეთზე ვარ.'], a: 1 }, { q: '“Kitap masada.”', o: ['წიგნი მაგიდაზეა.', 'წიგნი მაგიდიდანაა.', 'წიგნი მაგიდისთვისაა.'], a: 0 }] },
{ id: 'person', e: '🧍', title: 'Kişi eki başta: ვ-', sub: 'ვწერ = yazıyorum',
  body: ['Türkçede kişi eki fiilin sonuna gelir (yazıyor-um). Gürcücede “ben” eki fiilin başına gelir: ვ-. წერ = yazıyorsun, ვწერ = yazıyorum, წერს = (o) yazıyor.',
    '“Olmak” fiili: ვარ = -im, ხარ = -sin, არის = -dir. Türkçedeki gibi zamir çoğu zaman söylenmez: სტუდენტი ვარ = Öğrenciyim.'],
  ex: [['მე წერ.', 'მე ვწერ.', '“ben” için başa ვ- gelir.'], ['შენ ვარ ლამაზი.', 'შენ ხარ ლამაზი.', '“sen” ile ხარ.']],
  q: [{ q: '“Yazıyorum.”', o: ['წერ', 'ვწერ', 'წერს'], a: 1 }, { q: '“Nasılsın?” → როგორ ___?', o: ['ვარ', 'ხარ', 'არის'], a: 1 }, { q: '“O çalışıyor.”', o: ['ვმუშაობ', 'მუშაობ', 'მუშაობს'], a: 2 }] },
{ id: 'short', e: '✂️', title: 'Kısa “-ა” = არის', sub: 'ეს წიგნია',
  body: ['“არის” (-dir) çoğu zaman kısalıp kelimenin sonuna -ა olarak eklenir: ეს წიგნი არის → ეს წიგნია. დიდი არის → დიდია.', 'Konuşma dilinde neredeyse hep kısa hali duyarsın, bu yüzden kelime sonundaki -ა’yı “-dir” diye oku.'],
  ex: [['ეს სახლი დიდი.', 'ეს სახლი დიდია.', '“-dir” anlamı için -ა gerekir.']],
  q: [{ q: '“Bu ev büyük.”', o: ['ეს სახლი დიდია.', 'ეს სახლი დიდი ვარ.', 'ეს სახლი დიდში.'], a: 0 }, { q: '“ეს რა არის?” cümlesinin kısa hali:', o: ['ეს რაა?', 'ეს რას?', 'ეს რაში?'], a: 0 }] },
{ id: 'dative', e: '💘', title: 'მიყვარს, მინდა, მშია', sub: '“Hoşuma gidiyor” mantığı',
  body: ['Sevmek, istemek, acıkmak, üşümek gibi duygular Gürcücede “bana … geliyor” mantığıyla kurulur — Türkçedeki “hoşuma gidiyor” gibi. Fiilin başındaki მ- “bana” demektir.',
    'მინდა = istiyorum, მიყვარს = seviyorum, მომწონს = hoşuma gidiyor, მშია = açım, მწყურია = susadım, მცივა = üşüyorum. Bu fiillere ვ- eklenmez.'],
  ex: [['მე ვმინდა წყალი.', 'მე მინდა წყალი.', 'მინდა zaten “ben istiyorum”; ვ- gelmez.'], ['მე ვარ მშია.', 'მშია.', 'Tek kelime yeter: açım.']],
  q: [{ q: '“Su istiyorum.”', o: ['წყალი მინდა.', 'წყალი ვმინდა.', 'წყალი ვარ.'], a: 0 }, { q: '“Seni seviyorum.”', o: ['მიყვარხარ.', 'ვმიყვარ.', 'მინდა ხარ.'], a: 0 }, { q: '“Üşüyorum.”', o: ['მშია.', 'მცივა.', 'მწყურია.'], a: 1 }] },
{ id: 'neg', e: '🚫', title: 'არ ve ვერ', sub: '“gelmem” ile “gelemem” farkı',
  body: ['Gürcücede iki olumsuzluk var. არ = yapmıyorum / yapmayacağım (isteğe bağlı): არ მოვალ = gelmeyeceğim.', 'ვერ = yapamıyorum (imkân yok): ვერ მოვალ = gelemeyeceğim. Kibar reddetmek için ვერ kullanılır. Bir de emirde ნუ var: ნუ წახვალ = gitme.'],
  ex: [['(Hastayım) არ მოვალ.', '(Hastayım) ვერ მოვალ.', 'İstemediğin için değil, gelemediğin için: ვერ.']],
  q: [{ q: '“Gelemem (imkânım yok).”', o: ['არ მოვალ.', 'ვერ მოვალ.', 'ნუ მოვალ.'], a: 1 }, { q: '“Anlamıyorum.”', o: ['არ მესმის.', 'ნუ მესმის.', 'ხო მესმის.'], a: 0 }, { q: '“Evet”in günlük, samimi hali:', o: ['დიახ', 'კი', 'არა'], a: 1 }] },
{ id: 'nogender', e: '🎁', title: 'Kolaylıklar: artikel yok, cinsiyet yok', sub: 'Türkçe konuşana avantaj',
  body: ['Gürcücede a/the gibi artikel yok, he/she ayrımı da yok: ის = o (kadın, erkek, nesne). Tıpkı Türkçe gibi.', 'Büyük harf de yok; cümle başı ve özel isimler küçük harfle yazılır. Her harf tek bir ses verir ve yazıldığı gibi okunur.'],
  ex: [['(İngilizce) he / she / it', 'ის', 'Üçü için tek kelime.']],
  q: [{ q: '“ის” ne demek?', o: ['Yalnızca erkek için “o”', 'Yalnızca kadın için “o”', 'Herkes ve her şey için “o”'], a: 2 }, { q: 'Gürcücede büyük harf var mı?', o: ['Evet', 'Hayır', 'Yalnızca özel isimlerde'], a: 1 }] },
{ id: 'numbers', e: '🔢', title: 'Yirmilik sayı sistemi', sub: '30 = yirmi + on',
  body: ['Gürcücede sayılar yirmişer sayılır. 20 = ოცი. 30 = ოცდაათი (20 ve 10). 40 = ორმოცი (2 × 20). 50 = ორმოცდაათი (2×20 ve 10). 60 = სამოცი, 80 = ოთხმოცი.', 'Aradaki sayılar “და” (ve) ile eklenir: 35 = ოცდათხუთმეტი (20 ve 15), 99 = ოთხმოცდაცხრამეტი (4×20 ve 19).'],
  ex: [['30 = სამათი', '30 = ოცდაათი', '“üç on” değil, “yirmi ve on”.']],
  say: [['ოცი', 'yirmi'], ['ოცდაათი', 'otuz'], ['ორმოცი', 'kırk'], ['ორმოცდაათი', 'elli'], ['სამოცი', 'altmış']],
  q: [{ q: 'ოცდაათი kaçtır?', o: ['20', '30', '40'], a: 1 }, { q: 'ორმოცი kaçtır?', o: ['40', '50', '60'], a: 0 }, { q: '50 nasıl söylenir?', o: ['ხუთათი', 'ორმოცდაათი', 'სამოცი'], a: 1 }] }
]};

// ── günlük yazı görevleri (seviyeye göre)
globalThis.WRITE_TASKS = {
1: ['Kendini tanıt: adın, yaşın ve nerede yaşadığın (3 cümle).', 'Aileni anlat: kimler var, ne iş yapıyorlar?', 'Bugün ne yedin ve ne içtin?', 'Evini ya da odanı anlat.', 'En sevdiğin hayvanı anlat.', 'Sıradan bir gününü anlat: sabah, öğle, akşam.', 'En sevdiğin renk ve yemek hangisi?'],
2: ['Dün ne yaptın? (4-5 cümle)', 'Bu hafta sonu için planların neler?', 'En sevdiğin yemeği ve neden sevdiğini anlat.', 'Yaşadığın şehri anlat.', 'Son tatilini anlat.', 'En iyi arkadaşını anlat.', 'İşini ya da okulunu anlat.'],
3: ['Sence dil öğrenmek neden önemli?', 'Hayalindeki işi anlat.', 'Teknolojinin iyi ve kötü yanları neler?', 'Unutamadığın bir günü anlat.', 'Şehirde mi, köyde mi yaşamak daha iyi? Neden?', 'Beş yıl sonra kendini nerede görüyorsun?', 'Bir arkadaşına ziyaret etmesi için bir yer öner ve nedenini açıkla.'],
4: ['Uzaktan çalışma hakkındaki görüşünü gerekçeleriyle yaz.', 'Yapay zekâ meslekleri nasıl değiştirecek?', 'Sosyal medyanın toplum üzerindeki etkisini tartış.', 'İklim değişikliği için bireyler ne yapabilir?', 'Başarı sence şans mı, çalışma mı?', 'Bir ülkede yaşamak için dilini bilmek şart mı?', 'Hayatında verdiğin zor bir kararı ve sonucunu anlat.']
};

// ── yapay zekâ sohbet senaryoları (p: modele verilen sahne tarifi)
globalThis.SCENARIOS = [
  { id: 'tanisma', e: '🤝', t: 'Tanışma', s: 'Yeni biriyle tanış, kendinden söz et', p: 'Two people meet for the first time at a party. You are a friendly local who wants to get to know the learner.' },
  { id: 'restoran', e: '🍽️', t: 'Restoranda sipariş', s: 'Garsonla konuş, yemek seç, hesap iste', p: 'A restaurant. You are the waiter taking the learner\'s order, suggesting dishes and later bringing the bill.' },
  { id: 'kafe', e: '☕', t: 'Kafede', s: 'İçecek sipariş et, sohbet et', p: 'A coffee shop. You are the barista taking the learner\'s order.' },
  { id: 'market', e: '🛒', t: 'Alışveriş', s: 'Fiyat sor, beden iste, pazarlık yap', p: 'A clothing shop or market. You are the shop assistant helping the learner find and buy something.' },
  { id: 'yol', e: '🧭', t: 'Yol sorma', s: 'Adres sor, tarifi anla', p: 'On the street. The learner is a tourist asking you, a local, for directions.' },
  { id: 'otel', e: '🏨', t: 'Otelde', s: 'Giriş yap, oda hakkında soru sor', p: 'A hotel reception. You are the receptionist checking the learner in.' },
  { id: 'taksi', e: '🚕', t: 'Takside', s: 'Adresi söyle, şoförle sohbet et', p: 'A taxi. You are the driver; ask where to go and make small talk.' },
  { id: 'doktor', e: '🩺', t: 'Doktorda', s: 'Şikâyetini anlat, soruları yanıtla', p: 'A doctor\'s office. You are the doctor asking the learner about their symptoms and giving simple advice.' },
  { id: 'is', e: '💼', t: 'İş görüşmesi', s: 'Kendini anlat, soruları yanıtla', p: 'A job interview. You are the interviewer asking the learner about their experience, skills and plans.' },
  { id: 'telefon', e: '📞', t: 'Telefonla randevu', s: 'Randevu al, saat ve gün konuş', p: 'A phone call. You are a receptionist at a dental clinic; the learner wants to make an appointment.' },
  { id: 'serbest', e: '💬', t: 'Serbest sohbet', s: 'İstediğin konuda konuş', p: 'Free friendly small talk about daily life, hobbies, work, food and travel.' }
];
})();
