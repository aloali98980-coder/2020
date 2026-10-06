"""Reparse cached discovery with rowspans/plain-text clubs and keep evidence for manual review."""
import importlib.util,json,urllib.parse,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];spec=importlib.util.spec_from_file_location('discover',Path(__file__).with_name('discover-pyramid-v08.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=json.load(open(ROOT/'review/pyramid-v08-discovery-all.json'));out=[]
for d in rows:
 title=d.get('wiki') or d['attempts'][-1].get('title')
 if not title:continue
 f=m.CACHE/(urllib.parse.quote(title,safe='')+'.json')
 if not f.exists():continue
 p=json.loads(f.read_text()).get('parse',{});d={k:v for k,v in d.items() if k not in ['fallback','candidates']};d.update(wiki=p.get('title'),revision=p.get('revid'),sourceUrl='https://en.wikipedia.org/wiki/'+urllib.parse.quote(p.get('title','').replace(' ','_')),candidates=m.candidates(p));out.append(d)
(ROOT/'review/pyramid-v08-reviewed-tables.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
old=json.load(open(ROOT/'src/data/packs/world/clubs.json'));keys={c['wiki']:c['league'] for c in old}
for d in out:
 ts=d['candidates'];ts=sorted(ts,key=lambda t:t['score'],reverse=True)
 if ts:print(d['country'],d['tier'],d['wiki'],[(t['group'],t['section'],len(t['clubs']),t['score']) for t in ts[:4]],'OVERLAP',[(n,keys[n]) for n in ts[0]['clubs'] if n in keys])
 else:print(d['country'],'NO TABLE')
