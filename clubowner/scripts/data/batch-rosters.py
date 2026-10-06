"""Polite batch alternative after API rate limiting. Respect Retry-After and stop
on repeated limiting. API query batches up to 30 pages instead of per-club parses.
Roster adaptation retains source article + revision under CC BY-SA 4.0.
"""
import importlib.util,pathlib,time,json,re,hashlib,urllib.parse,requests,tarfile,io,datetime,unicodedata,collections
import mwparserfromhell as mw
spec=importlib.util.spec_from_file_location('base',pathlib.Path(__file__).with_name('import-wikipedia.py'));b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
ROOT,OUT=b.ROOT,b.OUT
CACHE=ROOT/'.arena/batch-cache';CACHE.mkdir(parents=True,exist_ok=True)

def batch(titles):
 key=hashlib.sha1('|'.join(titles).encode()).hexdigest();f=CACHE/(key+'.json')
 if f.exists():return json.loads(f.read_text())
 for attempt in range(3):
  time.sleep(2)
  r=requests.get(b.API,params={'action':'query','format':'json','prop':'revisions','rvprop':'ids|content','rvslots':'main','titles':'|'.join(titles),'redirects':1,'maxlag':5},headers=b.HEADERS,timeout=95)
  if r.status_code in (429,503):
   wait=max(60,int(r.headers.get('Retry-After','60')));print('RATE LIMIT: waiting',wait,'seconds',flush=True);time.sleep(wait);continue
  r.raise_for_status();j=r.json()
  if j.get('error',{}).get('code')=='maxlag':time.sleep(30);continue
  f.write_text(json.dumps(j,ensure_ascii=False));return j
 raise RuntimeError('Repeated rate limiting: stop and resume from cache later')

def resolve(j,title):
 aliases={x['from']:x['to'] for k in ['normalized','redirects'] for x in j.get('query',{}).get(k,[])}
 for _ in range(5):title=aliases.get(title,title)
 return next((p for p in j.get('query',{}).get('pages',{}).values() if p.get('title')==title),{})

def text(p):return p.get('revisions',[{}])[0].get('slots',{}).get('main',{}).get('*','')
def clean(x):return re.sub(r'\s+',' ',mw.parse(str(x)).strip_code()).strip()
def templates_section(txt):
 code=mw.parse(txt);chosen=None
 headings=list(re.finditer(r'^={2,6}\s*(.*?)\s*={2,6}\s*$',txt,re.M))
 for start in re.finditer(r'\{\{\s*(?:fs2?|football squad) start',txt,re.I):
  previous=[h for h in headings if h.start()<start.start()]
  if not previous:continue
  h=previous[-1];label=clean(h.group(1)).lower()
  if re.search(r'under|academy|reserve|loan|former|notable|historic|women|record|national|cup',label):continue
  if re.search(r'first.team|current|^squad$|^players$|^roster$',label):
   stop=re.search(r'\{\{\s*(?:fs2?|football squad) end[^}]*\}\}',txt[start.start():],re.I)
   if stop:chosen=txt[h.start():start.start()+stop.end()];break
 for section in ([] if chosen else code.get_sections(include_headings=True,flat=True)):
  headers=section.filter_headings();label=clean(headers[0].title).lower() if headers else''
  if re.search(r'under|academy|reserve|loan|former|notable|historic|women|record|national|cup|retired',label):continue
  if re.search(r'first.team squad|current squad|current roster|first.team|^squad$|^players$|^roster$',label) and re.search(r'\{\{\s*(?:fs2?|football squad)|\{\{[^}\n]* squad|\{\{#section-h:',str(section),re.I):chosen=str(section);break
 if not chosen:return [],[],None
 # First-team only, not a later loans/academy section.
 date_context=chosen
 chosen=re.split(r'(?:;|={2,})\s*(?:Out on loan|Loans|Under.?\d|Academy)',chosen,flags=re.I)[0]
 begin=re.search(r'\{\{\s*(?:fs2?|football squad) start',chosen,re.I)
 if begin and 'fs2' not in begin.group(0).lower():
  stop=re.search(r'\{\{\s*(?:fs2?|football squad) end\s*\}\}',chosen[begin.start():],re.I)
  if stop:chosen=chosen[begin.start():begin.start()+stop.end()]
 parsed=mw.parse(chosen);rows=[];refs=[]
 for t in parsed.filter_templates():
  kind=str(t.name).strip().lower().replace('_',' ')
  if kind in ['fs player','fs2 player','football squad player']:
   if not t.has('pos'):continue
   if kind=='fs2 player' and not t.has('name') and t.has('first') and t.has('last'):t.add('name',clean(t.get('first').value)+' '+clean(t.get('last').value))
   if not t.has('name'):continue
   val=str(t.get('name').value);name=clean(val);links=mw.parse(val).filter_wikilinks();wiki=str(links[0].title).strip() if links else None
   if not name:
    nt=mw.parse(val).filter_templates()
    if nt and str(nt[0].name).lower().strip()=='sortname':name=clean(nt[0].get(1).value)+' '+clean(nt[0].get(2).value)
   if kind=='fs2 player' and not wiki:wiki=clean(t.get('link').value) if t.has('link') else name
   pos=clean(t.get('pos').value).upper();pos={'G':'GK','D':'DF','M':'MF','F':'FW'}.get(pos,pos)
   other=clean(t.get('other').value) if t.has('other') else''
   if re.search(r'on loan to',other,re.I):continue
   if name and pos in ['GK','DF','MF','FW'] and not re.search(r'tba|unknown|vacant',name,re.I):rows.append({'name':name,'wiki':wiki,'positionGroup':pos,'nationalityCode':clean(t.get('nat').value) if t.has('nat') else''})
  elif kind.startswith('#section-h:'):refs.append(str(t.name).split(':',1)[1].strip())
  elif kind.endswith(' squad') and not re.search(r'\d{4}|national|women|under|reserve',kind):refs.append('Template:'+str(t.name).strip())
 date='';match=re.search(r'\{\{\s*(?:updated|as of)\s*\|([^}]+)',date_context,re.I)
 if match:date=match.group(1).strip()
 if not date:
  for t in parsed.filter_templates():
   if str(t.name).strip().lower()=='fs2' and t.has('date'):date=clean(t.get('date').value)
 return rows,list(dict.fromkeys(refs)),date

def main():
 leagues=json.loads((OUT/'leagues.json').read_text());tasks=[(l['id'],title) for l in leagues for title in l['clubs']];titles=list(dict.fromkeys(t for _,t in tasks));pages={}
 print('Cached batch import; new requests remain throttled',flush=True)
 for start in range(0,len(titles),30):
  ts=titles[start:start+30];j=batch(ts)
  for t in ts:pages[t]=resolve(j,t)
  print('CLUB PAGES',min(start+30,len(titles)),'/',len(titles),flush=True)
 parsed_pages={title:templates_section(text(p)) for title,p in pages.items()}
 refs=[]
 for title,p in pages.items():refs+=parsed_pages[title][1]
 refs=sorted(set(refs));refpages={}
 for start in range(0,len(refs),30):
  ts=refs[start:start+30];j=batch(ts)
  for t in ts:refpages[t]=resolve(j,t)
 clubs=[]
 for league,title in tasks:
  p=pages[title];canonical=p.get('title',title);rows,refs,date=parsed_pages[title]
  for ref in refs:
   # Template itself has no heading; add a parsing context, retaining attribution.
   extra,_,refdate=templates_section('== Current squad ==\n'+text(refpages.get(ref,{})));rows+=extra
   if refdate:date=refdate
  revision=p.get('revisions',[{}])[0].get('revid');url='https://en.wikipedia.org/w/index.php?title='+urllib.parse.quote(canonical.replace(' ','_'))
  if revision:url+='&oldid='+str(revision)
  club={'id':'wiki-'+hashlib.sha1(canonical.encode()).hexdigest()[:12],'league':league,'name':canonical,'wiki':canonical,'revision':revision,'sourceUrl':url,'sourceDateText':date or'','templateSources':refs,'templateAttribution':[{'title':refpages.get(ref,{}).get('title',ref),'revision':refpages.get(ref,{}).get('revisions',[{}])[0].get('revid')} for ref in refs],'players':list({r['wiki'] or r['name']:r for r in rows}.values()),'status':'partial-unverified','reviewedOn':b.ASOF}
  if not rows:club['error']='No supported senior squad table. No invented replacement names.'
  clubs.append(club)
 clubs=list({(c['league'],c['id']):c for c in clubs}.values());(OUT/'clubs-raw.json').write_text(json.dumps(clubs,ensure_ascii=False,separators=(',',':')))
 print('FINISHED',len(clubs),sum(len(c['players']) for c in clubs),'roster rows',flush=True)
if __name__=='__main__':main()
