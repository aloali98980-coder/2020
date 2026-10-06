"""Cached, rate-limited CC BY-SA club-table discovery. Review output before importing."""
import requests,json,time,pathlib,urllib.parse,re,concurrent.futures,threading
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[2];CACHE=ROOT/'.arena/pyramid-v08';CACHE.mkdir(parents=True,exist_ok=True)
D=[('es',3,'Primera Federación'),('it',3,'Serie C'),('fr',3,'Ligue 3'),('sa',2,'Saudi First Division League'),('be',2,'Challenger Pro League'),('tr',2,'TFF First League'),('gr',2,'Super League Greece 2'),('at',2,'2. Liga (Austria)'),('ch',2,'Swiss Challenge League'),('dk',2,'Danish 1st Division'),('se',2,'Superettan'),('no',2,'Norwegian First Division'),('pl',2,'I liga'),('cz',2,'Czech National Football League'),('hr',2,'First Football League (Croatia)'),('rs',2,'Serbian First League'),('ro',2,'Liga II'),('ua',2,'Ukrainian First League'),('ru',2,'Russian First League'),('hu',2,'Nemzeti Bajnokság II'),('br',2,'Campeonato Brasileiro Série B'),('ar',2,'Primera Nacional'),('uy',2,'Uruguayan Segunda División'),('co',2,'Categoría Primera B'),('cl',2,'Primera B de Chile'),('ec',2,'Ecuadorian Serie B'),('py',2,'División Intermedia'),('pe',2,'Liga 2 (Peru)'),('bo',2,'Copa Simón Bolívar (Bolivia)'),('ve',2,'Venezuelan Segunda División'),('us',2,'USL Championship'),('mx',2,'Liga de Expansión MX'),('jp',2,'J2 League'),('kr',2,'K League 2'),('cn',2,'China League One'),('au',2,'Australian Championship'),('qa',2,'Qatari Second Division'),('ae',2,'UAE First Division League'),('ma',2,'Botola 2'),('tn',2,'Tunisian Ligue Professionnelle 2'),('dz',2,'Algerian Ligue 2'),('za',2,'National First Division'),('in',2,'I-League'),('th',2,'Thai League 2')]
LOCK=threading.Lock();last=0
STOP=threading.Event()
H={'User-Agent':'ClubOwnerPrototype/0.8 (noncommercial educational game; Wikipedia CC BY-SA club-name review; cached 1 request/second)'}
def fetch(title):
 global last
 f=CACHE/(urllib.parse.quote(title,safe='')+'.json')
 if f.exists():return json.loads(f.read_text())
 with LOCK:
  time.sleep(max(0,6-(time.monotonic()-last)));last=time.monotonic()
 r=requests.get('https://en.wikipedia.org/w/api.php',headers=H,params={'action':'parse','page':title,'prop':'text|revid','format':'json','redirects':1,'maxlag':5},timeout=45)
 if r.status_code in [429,503]:
  STOP.set();raise RuntimeError('Rate limit; batch stopped; Retry-After='+str(r.headers.get('Retry-After')))
 r.raise_for_status();j=r.json();f.write_text(json.dumps(j,ensure_ascii=False));return j

def table_grid(table):
 grid=[]; pending={}
 for tr in table.find_all('tr'):
  row={k:cell for k,(cell,n) in pending.items()};pending={k:(cell,n-1) for k,(cell,n) in pending.items() if n>1};i=0
  for cell in tr.find_all(['th','td'],recursive=False):
   while i in row:i+=1
   for _ in range(int(re.match(r'\d+',str(cell.get('colspan',1)))[0])):
    row[i]=cell
    if int(re.match(r'\d+',str(cell.get('rowspan',1)))[0])>1:pending[i]=(cell,int(re.match(r'\d+',str(cell['rowspan']))[0])-1)
    i+=1
  grid.append([row.get(i) for i in range(max(row.keys(),default=-1)+1)])
 return grid

def candidates(p):
 soup=BeautifulSoup(p.get('text',{}).get('*',''),'html.parser');out=[]
 for table in soup.select('table.wikitable'):
  rows=table_grid(table);head=rows[0] if rows else[];texts=[c.get_text(' ',strip=True) if c else '' for c in head]
  ix=next((i for i,h in enumerate(texts) if re.match(r'^(Club|Team|Teams)\b',h,re.I)),None)
  if ix is None:continue
  group=table.find_previous('h2');section=table.find_previous(['h2','h3','h4']);group=group.get_text(' ',strip=True) if group else'';section=section.get_text(' ',strip=True) if section else''
  if re.search('all.time|past|winners|champions|top scor|goalscor|former',group+' '+section,re.I):continue
  score=sum(bool(re.search(x,' '.join(texts),re.I)) for x in ['stadium','city|location','capacity','manager|coach'])*10
  if 'Pts' in texts and ('Pld' in texts or 'PLD' in texts):score+=5
  if score<5:continue
  clubs=[];labels={}
  for cells in rows[1:]:
   if len(cells)<=ix or cells[ix] is None:continue
   cell=cells[ix];label=re.sub(r'\[.*?\]','',cell.get_text(' ',strip=True)).strip();name=None
   for a in cell.find_all('a'):
    href=a.get('href','')
    if not a.get_text(strip=True) or not href.startswith('/wiki/') or ':' in urllib.parse.unquote(href[6:]):continue
    name=urllib.parse.unquote(href[6:]).replace('_',' ')
    if name in ['Liechtenstein']:continue
    break
   if name is None:name=label
   if not name or re.match(r'^\d+$',name):continue
   if re.search(r'(^Jong |\bB$|\bII\b|\bU.?23$|U23|NXT|Futures| B AKTOR|[- ]2\b)',label) and not re.search(r'( B$| II$|Under.?23|Next Gen|Jong |NXT|Futures)',name):name=label
   name=name.split('#')[0] if '#' in name and not re.search('II| B$',label) else name
   clubs.append(name);labels[name]=label
  clubs=list(dict.fromkeys(clubs))
  context=table.find_previous('p');context=context.get_text(' ',strip=True)[:400] if context else ''
  if 6<=len(clubs)<=48:out.append({'group':group,'section':section,'score':score,'clubs':clubs,'labels':labels,'context':context})
 return out

def run(d):
 if STOP.is_set():return {'country':d[0],'tier':d[1],'name':d[2],'candidates':[],'attempts':[{'error':'Batch stopped after source rate limit'}]}
 country,tier,name=d;seasons=[name]
 record={'country':country,'tier':tier,'name':name,'reviewedOn':'2026-09-26','candidates':[],'attempts':[]}
 for title in seasons:
  try:
   j=fetch(title);p=j.get('parse',{});tables=candidates(p)
   if title==name:
    soup=BeautifulSoup(p.get('text',{}).get('*',''),'html.parser')
    links=[a.get('title','') for a in soup.select('.infobox a') if a.get('title','').startswith(('2026–27 ','2026 ')) and 'redlink=1' not in a.get('href','')]
    if links:
     seasons.extend(list(dict.fromkeys(links))[:1]);record['fallback']={'wiki':p.get('title'),'candidates':tables};tables=[]
   record['attempts'].append({'title':title,'tables':len(tables),'error':j.get('error')})
   if tables:
    record.update(wiki=p['title'],revision=p.get('revid'),sourceUrl='https://en.wikipedia.org/wiki/'+urllib.parse.quote(p['title'].replace(' ','_')),candidates=tables);break
  except Exception as e:record['attempts'].append({'title':title,'error':str(e)});break
 print(country,tier,record.get('wiki'),[(x['group'],len(x['clubs'])) for x in record['candidates']],flush=True);return record
if __name__=='__main__':
 D+= [('en',2,'EFL Championship'),('en',3,'EFL League One'),('de',2,'2. Bundesliga'),('de',3,'3. Liga'),('es',2,'Segunda División'),('fr',2,'Ligue 2'),('it',2,'Serie B'),('pt',2,'Liga Portugal 2'),('nl',2,'Eerste Divisie'),('sc',2,'Scottish Championship')]
 with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
  out=[]
  for item in ex.map(run,D):
   out.append(item);(ROOT/'review/pyramid-v08-discovery-all.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
 (ROOT/'review/pyramid-v08-discovery-all.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
