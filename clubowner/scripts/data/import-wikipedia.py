"""Reproducible, cached Wikipedia roster importer. Data: CC BY-SA 4.0.
Uses published current-squad tables, never invents missing names. A roster being
published does NOT establish a complete official 2026/27 registration list.
No images, club crests, copied prose or third-party ability ratings are imported.
Dependencies: requests beautifulsoup4. Run from project root.
"""
import concurrent.futures as cf,datetime,hashlib,json,pathlib,re,threading,time,urllib.parse
import requests
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[2]
CACHE=ROOT/'.arena/wiki-cache';CACHE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'src/data/packs/world';OUT.mkdir(parents=True,exist_ok=True)
HEADERS={'User-Agent':'ClubOwnerPrototype/0.3 (noncommercial educational game; Wikipedia CC BY-SA roster review; cached, 2 concurrent requests)'}
API='https://en.wikipedia.org/w/api.php'
ASOF='2026-09-24'
MARKETS=json.loads((ROOT/'scripts/data/markets.json').read_text())
lock=threading.Lock();last_call=0

def get(params):
 global last_call
 params={**params,'format':'json','maxlag':5};key=hashlib.sha256(json.dumps(params,sort_keys=True).encode()).hexdigest();f=CACHE/(key+'.json')
 if f.exists():return json.loads(f.read_text())
 for attempt in range(3):
  with lock:
   wait=2-(time.monotonic()-last_call)
   if wait>0:time.sleep(wait)
   last_call=time.monotonic()
  r=requests.get(API,params=params,headers=HEADERS,timeout=65)
  if r.status_code in (429,503):time.sleep(max(60,int(r.headers.get('Retry-After','60'))));continue
  r.raise_for_status();j=r.json()
  if j.get('error',{}).get('code')=='maxlag':time.sleep(10);continue
  f.write_text(json.dumps(j,ensure_ascii=False));return j
 raise RuntimeError('Rate limit / maxlag: retry later, do not bypass')

def page(title):
 j=get({'action':'parse','page':title,'prop':'text','redirects':1})
 if 'parse' not in j:raise ValueError(j.get('error',{}))
 p=j['parse'];return p,BeautifulSoup(p['text']['*'],'html.parser')

def article_link(a):
 if not a:return None
 href=a.get('href','')
 if not href.startswith('/wiki/') or ':' in urllib.parse.unquote(href[6:]):return None
 return urllib.parse.unquote(href[6:]).replace('_',' ')

def table_grid(table):
 grid=[];active={}
 for row in table.find_all('tr'):
  occupied={col:cell for col,(left,cell) in active.items()};next_active={col:(left-1,cell) for col,(left,cell) in active.items() if left>1};col=0
  for cell in row.find_all(['th','td'],recursive=False):
   while col in occupied:col+=1
   span=int(cell.get('colspan',1));rs=int(cell.get('rowspan',1))
   for k in range(span):
    occupied[col+k]=cell
    if rs>1:next_active[col+k]=(rs-1,cell)
   col+=span
  active=next_active
  grid.append([occupied.get(c) for c in range(max(occupied,default=-1)+1)])
 return grid

def get_league(m):
 id,arabic,label,title,espn,level=m
 record={'id':id,'name':label,'nameAr':arabic,'wiki':title,'level':level,'clubs':[],'sourceUrl':'https://en.wikipedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_')),'reviewedOn':ASOF,'status':'partial-unverified'}
 try:
  p,s=page(title);record['revision']=p.get('revid');record['wiki']=p['title'];candidates=[]
  for t in s.select('table.wikitable'):
   rows=table_grid(t);heads=[c.get_text(' ',strip=True).lower() if c else '' for c in rows[0]] if rows else[]
   col=next((i for i,h in enumerate(heads) if re.match(r'^(club|team)( name)?(\s*\[.*?\])?$',h)),None)
   if col is None:continue
   header=' '.join(heads);prev=t.find_previous(['h2','h3','h4']);section=prev.get_text(' ',strip=True) if prev else''
   if any(x in header for x in ['winning seasons','winners','runners-up','goals','total points']):continue
   if any(x in section.lower() for x in ['all-time','all time','former','champions','performance','past','foreign','winning','goalscor','comprehensive','major uefa','attendance','awards']):continue
   clubs=[]
   for row in rows[1:]:
    cells=row
    if len(cells)<=col or cells[col] is None:continue
    links=[article_link(a) for a in cells[col].find_all('a')];links=[a for a in links if a and a not in ['Liechtenstein']]
    if links:clubs.append(links[0])
   clubs=list(dict.fromkeys(clubs))
   if not 6<=len(clubs)<=36:continue
   score=10*sum(x in header for x in ['stadium','city','location','capacity','manager','coach'])+5*sum(x in section.lower() for x in ['current','teams','clubs','2026'])
   if score>=10:candidates.append((score,clubs,section))
  if not candidates:
   if not title.startswith(('2026','2025')):
    for season in ['2026–27 ','2026 ']:
     fallback=get_league([id,arabic,label,season+title,espn,level])
     if fallback['clubs']:return fallback
   raise ValueError('No unambiguous current-club table detected')
  score,clubs,section=max(candidates,key=lambda c:c[0]);
  if id in ['fr','ma','ae'] and not title.startswith('2026') and '2026–27' not in section:
   fallback=get_league([id,arabic,label,'2026–27 '+title,espn,level])
   if fallback['clubs']:return fallback
  record['clubs']=clubs;record['clubSection']=section;record['tableScore']=score
 except Exception as e:record['error']=str(e)[:300]
 print('LEAGUE',id,len(record['clubs']),record.get('clubSection',record.get('error')),flush=True);return record

def get_club(task):
 league,title=task
 id='wiki-'+hashlib.sha1(title.encode()).hexdigest()[:12]
 rec={'id':id,'league':league,'name':title,'wiki':title,'sourceUrl':'https://en.wikipedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_')),'players':[],'status':'partial-unverified','reviewedOn':ASOF}
 try:
  p,s=page(title);rec['name']=p['title'];rec['wiki']=p['title'];rec['id']='wiki-'+hashlib.sha1(p['title'].encode()).hexdigest()[:12];rec['revision']=p.get('revid')
  if rec['revision']:rec['sourceUrl']='https://en.wikipedia.org/w/index.php?title='+urllib.parse.quote(p['title'].replace(' ','_'))+'&oldid='+str(rec['revision'])
  first_section=None;rows=[]
  for t in s.select('table.football-squad'):
   prev=t.find_previous(['h2','h3','h4']);section=prev.get_text(' ',strip=True) if prev else''
   if re.search(r'under.?\d|academy|women|youth|reserve|legend|former|all.time|loan|notable|historic',section,re.I):continue
   if first_section is None:first_section=section
   if section!=first_section:continue
   for row in t.select('tr'):
    cells=row.find_all(['th','td'],recursive=False)
    if len(cells)<4 or not row.select_one('.fn'):continue
    namecell=row.select_one('.fn');a=namecell.find('a');playerTitle=article_link(a)
    if re.search(r'on loan to',cells[-1].get_text(' ',strip=True),re.I):continue
    name=namecell.get_text(' ',strip=True);pos=cells[1].get_text(' ',strip=True)
    if not name or pos not in ['GK','DF','MF','FW']:continue
    rows.append({'name':name,'wiki':playerTitle,'positionGroup':pos,'nationalityCode':cells[2].get_text(' ',strip=True),'number':cells[0].get_text(' ',strip=True)})
  rec['players']=list({(r['wiki'] or r['name']):r for r in rows}.values());rec['section']=first_section
  # Preserve source's own as-of text, not a claim that the entire page is current.
  if first_section:
   el=next((h for h in s.find_all(['h2','h3','h4']) if h.get_text(' ',strip=True)==first_section),None)
   if el:
    text=[]
    for node in el.next_elements:
     if getattr(node,'name',None)=='table':break
     if getattr(node,'name',None) in ['p','i']:text.append(node.get_text(' ',strip=True))
     if len(text)>12:break
    rec['sourceDateText']=' '.join(text)[:400]
  if not rec['players']:rec['error']='No supported senior squad table. Not filled with generated players.'
 except Exception as e:rec['error']=str(e)[:300]
 print('CLUB',league,title,len(rec['players']),flush=True);return rec

def main():
 with cf.ThreadPoolExecutor(max_workers=2) as ex:leagues=list(ex.map(get_league,MARKETS))
 (OUT/'leagues.json').write_text(json.dumps(leagues,ensure_ascii=False,indent=2))
 tasks=[(l['id'],t) for l in leagues for t in l['clubs']]
 with cf.ThreadPoolExecutor(max_workers=2) as ex:clubs=list(ex.map(get_club,tasks))
 clubs=list({(c['league'],c['id']):c for c in clubs}.values())
 (OUT/'clubs-raw.json').write_text(json.dumps(clubs,ensure_ascii=False,separators=(',',':')))
 print('FINISHED',len(leagues),'leagues',len(clubs),'clubs',sum(len(c['players']) for c in clubs),'raw roster rows',flush=True)
if __name__=='__main__':main()
