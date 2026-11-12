# jobs.json içindeki metinleri nöral seslerle mp3'e çevirir (eksik olanları üretir).
import asyncio, json, os, sys
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, '..', 'site')
VOICES = {
    ('en', 'f'): 'en-US-AvaNeural', ('en', 'm'): 'en-US-AndrewNeural',
    ('ka', 'f'): 'ka-GE-EkaNeural', ('ka', 'm'): 'ka-GE-GiorgiNeural',
}

async def one(job, sem, stats):
    out = os.path.join(SITE, job['file'].replace('/', os.sep))
    if os.path.exists(out) and os.path.getsize(out) > 500:
        stats['skip'] += 1
        return
    os.makedirs(os.path.dirname(out), exist_ok=True)
    async with sem:
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(job['text'], VOICES[(job['lang'], job['voice'])], rate='-8%')
                await c.save(out + '.tmp')
                if os.path.getsize(out + '.tmp') < 500:
                    raise RuntimeError('boş ses')
                os.replace(out + '.tmp', out)
                stats['ok'] += 1
                if stats['ok'] % 100 == 0:
                    print('üretildi:', stats['ok'], flush=True)
                return
            except Exception as e:
                await asyncio.sleep(1.5 * (attempt + 1))
                err = e
        stats['fail'].append(job['text'] + ' :: ' + repr(err))

async def main():
    jobs = json.load(open(os.path.join(HERE, 'jobs.json'), encoding='utf-8'))
    sem = asyncio.Semaphore(6)
    stats = {'ok': 0, 'skip': 0, 'fail': []}
    await asyncio.gather(*(one(j, sem, stats) for j in jobs))
    print('bitti. yeni:', stats['ok'], 'mevcut:', stats['skip'], 'hata:', len(stats['fail']))
    for f in stats['fail'][:20]:
        print('  HATA', f.encode('ascii', 'backslashreplace').decode())

sys.stdout.reconfigure(encoding='utf-8')
asyncio.run(main())
