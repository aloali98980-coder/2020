"""Batch exact Wikipedia-article -> Wikidata identity/DOB/Arabic-label lookup.
CC0 metadata only, no ratings. Cache, pacing and Retry-After handling included.
"""
import pathlib,json,time,urllib.parse,requests,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'src/data/packs/world';CACHE=ROOT/'.arena/wd-bios';CACHE.mkdir(parents=True,exist_ok=True)
HEADERS={'User-Agent':'ClubOwnerPrototype/0.3 (noncommercial educational football game; CC0 biography review; cached batch requests)'}

def main():
 clubs=json.loads((OUT/'clubs-raw.json').read_text());titles=sorted({p['wiki'] for c in clubs for p in c['players'] if p['wiki']});results=json.loads((OUT/'wikidata-bios.json').read_text()) if (OUT/'wikidata-bios.json').exists() else {}
 titles=[t for t in titles if t not in results]
 for i in range(0,len(titles),250):
  names=titles[i:i+250];f=CACHE/(hashlib.sha1('|'.join(names).encode()).hexdigest()+'.json')
  if f.exists():rows=json.loads(f.read_text())
  else:
   urls=' '.join('<https://en.wikipedia.org/wiki/'+urllib.parse.quote(n.replace(' ','_'),safe='()/,')+'>' for n in names)
   query='''SELECT ?article ?p ?dob ?precision ?ar ?death WHERE { VALUES ?article { %s } ?article schema:about ?p . OPTIONAL { ?p p:P569 ?birth . ?birth psv:P569 ?value . ?value wikibase:timeValue ?dob; wikibase:timePrecision ?precision . FILTER NOT EXISTS { ?birth wikibase:rank wikibase:DeprecatedRank } } OPTIONAL {?p rdfs:label ?ar. FILTER(LANG(?ar)="ar")} OPTIONAL {?p wdt:P570 ?death} }'''%urls
   for retry in range(3):
    time.sleep(1)
    r=requests.post('https://query.wikidata.org/sparql',data={'query':query,'format':'json'},headers=HEADERS,timeout=80)
    if r.status_code in (429,503):time.sleep(max(60,int(r.headers.get('Retry-After','60'))));continue
    r.raise_for_status();rows=r.json()['results']['bindings'];f.write_text(json.dumps(rows,ensure_ascii=False));break
   else:raise RuntimeError('Rate limit: stop, keep cache, resume later')
  for row in rows:
   title=urllib.parse.unquote(row['article']['value'].split('/wiki/')[-1]).replace('_',' ');d=results.setdefault(title,{'qid':row['p']['value'].split('/')[-1],'birthDates':[],'nameAr':None,'deceased':False})
   if 'dob' in row and int(row.get('precision',{}).get('value',0))>=11:d['birthDates'].append(row['dob']['value'][:10])
   if 'ar' in row:d['nameAr']=row['ar']['value']
   if row.get('death',{}).get('value','9999')<='2026-09-24T23:59:59Z':d['deceased']=True
  if i%1000==0:print('BIOGRAPHIES',min(i+250,len(titles)),'/',len(titles),len(results),flush=True)
  (OUT/'wikidata-bios.json').write_text(json.dumps(results,ensure_ascii=False,separators=(',',':')))
 print('FINISHED',len(results),'Wikidata identities',flush=True)
if __name__=='__main__':main()
