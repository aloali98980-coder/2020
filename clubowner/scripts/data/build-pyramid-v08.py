"""Build reviewed factual memberships. Raw discovery is never used by the game."""
import json,re,pathlib,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[2]
def load(p):return json.loads((ROOT/p).read_text())
def dump(p,x):(ROOT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
rows=load('review/pyramid-v08-reviewed-tables.json');extra=load('review/pyramid-v08-extra.json');rows=[d for d in rows if d['country'] not in ['sa','ae','tn','ve','py','qa','bo','ma']]+[d for d in extra if d['tier']==2]
out=[]
for d in rows:
 ts=d['candidates']
 if not ts:continue
 if d['country'] in ['es','it'] and d['tier']==3:chosen=[t for t in ts if t['score']>=20]
 elif d['country']=='ar':chosen=[t for t in ts if t['group'] in ['Zone A','Zone B'] and t['score']==5]
 elif d['country']=='pe':chosen=[t for t in ts if t['group']=='Regional Stage' and t['score']==5]
 elif d['country']=='us':chosen=[t for t in ts if t['section'] in ['Eastern Conference','Western Conference'] and t['score']==5]
 elif d['country']=='dz':chosen=[t for t in ts if t['score']>=20]
 else:chosen=[max(ts,key=lambda t:t['score'])]
 assert chosen,d['country']
 for i,t in enumerate(chosen):
  group=t['section'] if d['country'] in ['pe','us','dz'] else t['group']
  name={'in':'Indian Football League','be':'Challenger Pro League','au':'Australian Championship','py':'APF División Intermedia'}.get(d['country'],d['name'])
  record={k:d.get(k) for k in ['country','tier','wiki','revision','sourceUrl','reviewedOn']}
  record.update(id=f"{d['country']}-{d['tier']}"+('-'+chr(97+i) if len(chosen)>1 else ''),name=name+(' · '+group if len(chosen)>1 else ''),clubs=t['clubs'],status='published-unverified',sourceLicense='CC-BY-SA-4.0',sourceSection=t['section'],sourceSeason='2026–27' if '2026–27' in d['wiki'] or d['country']=='hu' else '2026',connection='closed' if d['country'] in ['us','au','mx'] else 'open')
  if len(chosen)>1:record['group']=group
  out.append(record)
# Names and group composition are facts; no articles, images or prose republished.
def manual(country,name,groups,url,season='2026–27'):
 for i,(group,clubs) in enumerate(groups):
  out.append(dict(id=country+'-2'+('-'+chr(97+i) if len(groups)>1 else ''),country=country,tier=2,name=name+(' · '+group if group else ''),group=group,clubs=clubs.split('|'),sourceUrl=url,reviewedOn='2026-09-26',sourceSeason=season,sourceLicense='Factual names only; publisher retains article rights',status='published-unverified',connection='open'))
manual('sa','دوري يلو',[('', 'Al Raed S.FC|Al-Najma SC (Saudi Arabia)|Al-Bukiryah FC|Al-Saqr FC (Saudi Arabia)|Hajer FC|Al Adalah Club|Al-Jeel Club|Al-Zulfi FC|Al-Anwar Club|Al Wehda FC|Jeddah Club|Al-Orobah FC|Al-Jandal SC|Al-Jabalain Club|Al-Tai FC|Al-Okhdood Club|Damac FC|Al-Ula FC')],'https://sabq.org/article/fh0xw2v')
manual('ae','UAE First Division League',[('', 'Al-Arabi SC (UAE)|Al Thaid|Dibba Al-Fujairah Club|Gulf FC|Al Hamriyah Club|Al Bataeh Club|Dibba Al-Hisn SC|Fujairah FC|Gulf United FC|Emirates Club|Al Urooba Club|Palm City 365|Dubai City FC|Al Jazirah Al Hamra Club|Al Ittifaq FC (UAE)')],'https://tribuna.com/en/league/division-1-uae/table/2026-2027/')
manual('tn','Ligue Professionnelle 2',[('Groupe A','AS Soliman|AS Gabès|US Tataouine|Sfax Railways Sports|SC Ben Arous|OC Kerkennah|CS Chebba|CS Msaken|BS Bouhajla|Mégrine Sport|EM Mahdia|AS Agareb|ES Beni Khalled|Stade Soussien'),('Groupe B','JS Kairouanaise|Stade Gabésien|AS Kasserine|Jendouba Sport|CS Korba|ES Bouchemma|EGS Gafsa|US Ksour Essef|AS Ariana|CS Redaief|Kalaa Sport|SC Moknine|Olympique du Kef|CO Médenine')],'https://www.tunisie-tribune.com/2026/07/14/ligue-2-composition-des-groupes-pour-la-saison-2026-2027/')
manual('ve','Liga FUTVE 2',[('Centro Oriental','Aragua F.C.|Deportivo Miranda F.C.|Dynamo Puerto F.C.|Monagas SC B|Bolívar SC|A.C. Mineros de Guayana'),('Centro Occidental','Academia Puerto Cabello B|Atlético Barinas|Barquisimeto SC|Deportivo Lara|Real Frontera SC|Ureña Sport Club|Atlético El Vigía F.C.|Yaracuyanos F.C.|Zamora FC B')],'https://www.balonazos.com/liga-futve-2-2026-inicio-de-la-tercera-vuelta-con-2-equipos-menos-desde-el-sabado-25/','2026')
# Explicit aliases are identity reconciliation, not extra clubs.
alias={'SC Ben Arous':'Sporting Ben Arous','OC Kerkennah':'Océano Club de Kerkennah','CO Médenine':'CO Médenine','Al-Saqr FC (Saudi Arabia)':'Al-Saqr FC','Al-Okhdood Club':'Al-Okhdood Club'}
for d in out:d['clubs']=[alias.get(n,n) for n in d['clubs']]
dump('src/data/pyramidMembership.json',out)
top=[]
for d in extra:
 if d['tier']!=1:continue
 t=max(d['candidates'],key=lambda t:t['score']);top.append({k:v for k,v in d.items() if k not in ['candidates','attempts','fallback']}|{'id':d['country']+'-1','clubs':t['clubs']})
dump('src/data/topMembershipCorrections.json',top)
markets=load('src/data/worldMarkets.json');pending={'qa':'QSL 2 تغير في 2026 ويضم منتخب تحت 23 سنة وفرقًا تابعة؛ الربط وقوائم المشاركين بحاجة لتوفيق مصادر ونموذج خاص، وليس دوريًا غير موجود.','bo':'Copa Simón Bolívar مستوى ثانٍ إقليمي متعدد المراحل؛ لم تكتمل مراجعة عضوية ومجموعات 2026.','ma':'Botola Pro 2 موجودة؛ لم تكتمل مراجعة الأندية الستة عشر لموسم 2026–27. لا نستخدم قائمة الموسم السابق على أنها الحالية.'}
coverage=[]
for country,arabic,*_ in markets:
 ds=[d for d in out if d['country']==country]
 note=pending.get(country,'الصعود والتقويم محاكاة مبسطة؛ ليست كل الملاحق ولوائح الترخيص الرسمية مطبقة.')
 if country=='eg':note='الأولى ثم الثانية أ ثم خمس مجموعات الثانية ب؛ ملاحق الصعود المجمعة محفوظة. ليست الدرجة الثالثة المسماة (المستوى الرابع).'
 if country in ['us','au','mx']:note={'us':'USL Championship مسار ثانٍ مستقل؛ لا صعود تلقائي إلى MLS. المؤتمران موجودان، دون محاكاة ملحق البطل الرسمي.','au':'Australian Championship بطولة وطنية من 16 فريقًا في مرجع 2026، ممثلة بجدول دوري مبسط؛ لا صعود تلقائي إلى A-League.','mx':'Liga de Expansión MX موجودة؛ الصعود التلقائي إلى Liga MX مغلق في السيناريو إلى حين تنفيذ أهلية وترخيص الاتحاد.'}[country]
 coverage.append({'country':country,'nameAr':arabic,'targetTier':3 if country in ['eg','en','es','de','it','fr'] else 2,'status':'pending' if country in pending else 'modeled','note':note,'lowerCompetitions':6 if country=='eg' else len(ds),'lowerClubs':90 if country=='eg' else sum(len(d['clubs']) for d in ds)})
dump('src/data/pyramidCoverage.json',coverage)
print('lower competitions',len(out)+6,'lower clubs',sum(len(d['clubs']) for d in out)+90,'markets',sum(d['status']=='modeled' for d in coverage))
print('RESERVE REVIEW')
for d in out:
 for n in d['clubs']:
  if re.search(r'\bII\b| B$|Under.?23|U.?23|Next Gen|Jong |NXT|Futures|[- ]2\b|Madrileño|Fabril|Castilla|Liefering',n):print(d['country'],n)
