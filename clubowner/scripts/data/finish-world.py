"""Create the distributable CC BY-SA squad adaptation with CC0 DOB enrichment.
No guessed birthday, club assignment, or replacement player is added as fact.
Uses the cached official openfootball/players CC0 commit, not game ratings.

0.18 additions (all optional inputs; without them the 0.3 rows are reproduced,
plus two per-row provenance fields `identityMethod` / `biographyMethod`):
 * identity-supplement.json  (enrich-identities.py): renamed-article items and
   name+nationality / name+club Wikidata matches, each tagged with its method.
 * clubs-supplement.json     (fill-missing-rosters.py): squads adapted from
   another Wikipedia language edition for clubs without an English squad table.
 * conflict-resolutions.json (resolve-conflicts.py): per-identity decisions for
   players listed by more than one club (article infobox / open Wikidata
   membership / distinct same-name people). Unresolved identities stay excluded.
 * identity-supplement.json `birthdays` (squad-tables.py, 0.18b): birthdays read
   from the same club's ar/fr/es squad table for rows Wikidata cannot date;
   `matches` may also come from those tables (methods prefixed arwiki-/frwiki-/eswiki-).
"""
import json,pathlib,hashlib,tarfile,datetime,re,unicodedata,collections
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'src/data/packs/world'
COMMIT='125d20f7cc06cac7e758b40df535a7695632680a';ASOF='2026-09-24'
def fold(name):return ''.join(c for c in unicodedata.normalize('NFKD',name).lower() if c.isalnum() and not unicodedata.combining(c))
def load(name,default=None):
 p=OUT/name
 return json.loads(p.read_text()) if p.exists() else default

def merged_clubs():
 """clubs-raw rows plus other-language supplements for clubs without a usable English table."""
 clubs=json.loads((OUT/'clubs-raw.json').read_text());sup=load('clubs-supplement.json',{'clubs':[]})
 by_id={s['clubId']:s for s in sup['clubs']}
 for c in clubs:
  s=by_id.get(c['id'])
  if not s or len(c['players'])>=15:continue
  seen={fold(p['name']) for p in c['players']}
  extra=[{**p,'fromSupplement':True} for p in s['players'] if fold(p['name']) not in seen]
  c['players']=c['players']+extra
  c['supplement']={'lang':s['lang'],'title':s['title'],'revision':s['revision'],'sourceUrl':s['sourceUrl'],'section':s.get('section'),'license':s.get('license','CC-BY-SA-4.0'),'rows':len(extra)}
  c.pop('error',None)
 return clubs

def identity(raw,club,bios,supplement):
 """(bio dict or {}, identity key, method) for one roster row."""
 wiki=raw['wiki']
 if wiki and wiki in bios:return bios[wiki],(bios[wiki].get('qid') or wiki),'article'
 if wiki and wiki in supplement.get('redirects',{}):
  q=supplement['redirects'][wiki]['qid'];bio=supplement.get('qidBios',{}).get(q,{'qid':q,'birthDates':[],'nameAr':None,'deceased':False})
  return bio,q,'redirect'
 m=supplement.get('matches',{}).get(club['id']+'|'+raw['name'])
 if m and m.get('qid') and plausible_active(m.get('birthDate')):
  t=supplement.get('birthdays',{}).get(club['id']+'|'+raw['name'])
  dates=[m['birthDate']] if m['birthDate'] and not (t and t.get('from')=='table') else []  # a table-only date is credited to the table page, not to Wikidata
  return {'qid':m['qid'],'birthDates':dates,'nameAr':clean_label(m['nameAr']),'deceased':False},m['qid'],m['method']
 return {},wiki or raw['name'],None

def table_birthday(raw,club,supplement,wd_dates,dropped=False):
 """0.18b: birthday copied from the same club's squad table in another language edition (squad-tables.py),
 used only when Wikidata has no single day-precision date; must agree with Wikidata when that is ambiguous.
 A row whose table-derived identity lost a club conflict keeps a date printed in the table itself, but not
 one that came from the disputed Wikidata item."""
 t=supplement.get('birthdays',{}).get(club['id']+'|'+raw['name'])
 if not t or not t.get('birthDate') or len(wd_dates)==1 or (wd_dates and t['birthDate'] not in wd_dates) or not plausible_active(t['birthDate']):return None
 if dropped and t.get('from')!='table':return None
 return t

def plausible_active(dob):
 """Name-only matches (no article identity) are accepted only for ages a current senior squad member can have."""
 if not dob:return True
 d=datetime.date.fromisoformat(dob);r=datetime.date.fromisoformat(ASOF);age=r.year-d.year-((r.month,r.day)<(d.month,d.day))
 return 16<=age<=39

def clean_label(label):
 """Wikidata labels sometimes carry a disambiguator in parentheses; the game shows the bare name."""
 return re.sub(r'\s*[（(].*$','',label).strip() if label else label

def occurrences(clubs=None,bios=None,supplement=None):
 """identity key -> rows (before conflict handling). Shared with resolve-conflicts.py."""
 clubs=clubs or merged_clubs();bios=bios if bios is not None else load('wikidata-bios.json',{});supplement=supplement if supplement is not None else load('identity-supplement.json',{})
 occ=collections.defaultdict(list)
 for c in clubs:
  for raw in c['players']:
   bio,key,method=identity(raw,c,bios,supplement)
   if bio.get('deceased'):continue
   occ[key].append({'raw':raw,'club':c,'bio':bio,'method':method})
 return occ

def main():
 birthdays=collections.defaultdict(list)
 tarpath=ROOT/'.arena/openfootball.tar.gz'
 if not tarpath.exists():tarpath=ROOT/'scripts/data/cache/openfootball-125d20f7.tar.gz'  # persisted copy of the same pinned commit (601 KB)
 with tarfile.open(tarpath) as tar:
  for item in tar.getmembers():
   path='/'.join(item.name.split('/')[1:])
   if path=='LICENSE.md':
    (ROOT/'public/data').mkdir(parents=True,exist_ok=True);(ROOT/'public/data/openfootball-CC0.txt').write_bytes(tar.extractfile(item).read())
   if not path.endswith('.players.txt') or path.startswith('attic/'):continue
   text=tar.extractfile(item).read().decode('utf8')
   for line in text.splitlines():
    match=re.match(r'^([^,]+),\s*([GDMF|]+),.*?b\.\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})',line)
    if not match:continue
    name,pos,d=match.groups()
    try:dob=datetime.datetime.strptime(d,'%d %b %Y').date().isoformat()
    except ValueError:continue
    birthdays[fold(name.strip())].append({'dob':dob,'position':pos,'url':'https://github.com/openfootball/players/blob/'+COMMIT+'/'+path})
 bios=load('wikidata-bios.json',{});supplement=load('identity-supplement.json',{});resolutions=load('conflict-resolutions.json',{}).get('resolutions',{})
 clubs=merged_clubs();occ=occurrences(clubs,bios,supplement)
 def row_for(o,key,distinct=False,dropped=False):
  nonlocal tables
  raw,c,bio,method=o['raw'],o['club'],o['bio'],o['method']
  possible=birthdays.get(fold(raw['name']),[]);dobset={p['dob'] for p in possible};dob=next(iter(dobset)) if len(dobset)==1 else None
  birthSource=possible[0]['url'] if dob else None;birthMethod='openfootball-name' if dob else None
  wd_dates=set(bio.get('birthDates',[]))
  if len(wd_dates)==1:dob=next(iter(wd_dates));birthSource='https://www.wikidata.org/wiki/'+bio['qid'];birthMethod=method
  elif len(wd_dates)>1:dob=None;birthSource=None;birthMethod=None
  t=table_birthday(raw,c,supplement,wd_dates,dropped)
  if t:dob=t['birthDate'];birthSource=t['url'];birthMethod=t['method'];tables+=1
  if dob:
   d=datetime.date.fromisoformat(dob);r=datetime.date.fromisoformat(ASOF);age=r.year-d.year-((r.month,r.day)<(d.month,d.day))
   if not 14<=age<=48:dob=None;birthSource=None;birthMethod=None
  ident=key+('|'+c['id'] if distinct else '')
  # Position is broad source data; finer role is generated by the separate game model.
  name_ar=clean_label(bio.get('nameAr')) or (raw['name'] if re.search(r'[\u0600-\u06FF]',raw['name']) else None)
  return {'id':'wp-'+hashlib.sha1(ident.encode()).hexdigest()[:16],'name':raw['name'],'nameAr':name_ar,'wiki':raw['wiki'],'qid':bio.get('qid'),'birthDate':dob,'biographyUrl':birthSource,'biographyMethod':birthMethod,'identityMethod':method,'positionGroup':raw['positionGroup'],'nationality':raw['nationalityCode'] or None,'clubId':c['id'],'league':c['league'],**({'sourceUrl':c['supplement']['sourceUrl'],'sourceLang':c['supplement']['lang']} if raw.get('fromSupplement') else {})}
 players=[];conflicts=[];resolved=collections.Counter();tables=0
 for key,rows in occ.items():
  assignments={(r['club']['id'],r['club']['league']) for r in rows}
  if len(assignments)<=1:players.append(row_for(rows[0],key));continue
  res=resolutions.get(key)
  if res and res.get('distinct'):
   for r in rows:players.append(row_for(r,key,distinct=True))
   resolved['distinct']+=1;continue
  if res and res.get('club'):
   chosen=[r for r in rows if r['club']['id']==res['club']]
   if chosen:
    players.append(row_for(chosen[0],key));resolved[res.get('method','resolved')]+=1
    # rows at other clubs that only reached this identity through a name match stay in their squads as unmatched people
    for r in rows:
     if r['club']['id']!=res['club'] and (r['method'] or '').startswith(('nationality-name','club-name','arwiki-','frwiki-','eswiki-')):
      players.append(row_for({**r,'bio':{},'method':None},r['raw']['wiki'] or r['raw']['name'],distinct=True,dropped=True));resolved['name-match-dropped']+=1
    continue
  conflicts.append({'identity':key,'name':rows[0]['raw']['name'],'clubs':sorted({r['club']['id'] for r in rows})})
 counts=collections.Counter(p['clubId'] for p in players)
 for c in clubs:c['rawCount']=len(c['players']);c['importedCount']=counts[c['id']];del c['players']
 leagues=json.loads((OUT/'leagues.json').read_text())
 for l in leagues:
  lc=[c for c in clubs if c['league']==l['id']];l['clubCount']=len(lc);l['clubsWithPlayers']=sum(c['importedCount']>0 for c in lc);l['playerCount']=sum(c['importedCount'] for c in lc);l['missingClubs']=[c['name'] for c in lc if not c['importedCount']]
 supplemented=[c for c in clubs if c.get('supplement')]
 v2=bool(supplement or supplemented or resolutions)
 manifest={'id':'world-wikipedia-20260924-v2' if v2 else 'world-wikipedia-20260924-v1','asOf':ASOF,'license':'CC-BY-SA-4.0','biographyLicense':'CC0-1.0','biographySource':'Wikidata + openfootball/players','biographyCommit':COMMIT,'players':len(players),'clubs':len(clubs),'markets':len(leagues),'populatedMarkets':sum(l['playerCount']>0 for l in leagues),'sourceComplete':False,'verifiedCurrentRegistration':False,'wikidataIdentityMatches':sum(bool(p['qid']) for p in players),'unknownBirthDates':sum(not p['birthDate'] for p in players),'duplicateConflictsExcluded':len(conflicts),'note':'Published senior squad snapshots, not verified complete 2026/27 registration lists. Markets are transfer pools, not simulated leagues. Wikidata matches use exact Wikipedia article identity and day-precision DOB; CC0 openfootball is a unique-name fallback. Ambiguous DOB stays unknown.'}
 if v2:
  manifest.update({'supplementedOn':supplement.get('generatedOn') or load('clubs-supplement.json',{}).get('generatedOn'),'supplementedClubs':[{'club':c['name'],'lang':c['supplement']['lang'],'rows':c['supplement']['rows']} for c in supplemented],'identityMethods':dict(collections.Counter(p['identityMethod'] or 'none' for p in players)),'birthMethods':dict(collections.Counter(p['biographyMethod'] or 'unknown' for p in players)),'conflictsResolved':dict(resolved),'clubsWithoutPlayers':sum(not c['importedCount'] for c in clubs),'note2':'0.18: red-link/renamed titles resolved to Wikidata items; unlinked names matched to living footballers of the same nationality or club by unique folded label (method recorded per row, not independent certification); squads for clubs without an English squad table adapted from another Wikipedia language edition; same-name conflicts resolved by article infobox or open club membership, otherwise kept as distinct people or excluded.'})
  if supplement.get('tableSources'):
   manifest.update({'squadTablePages':sum(len(v) for v in supplement['tableSources'].values()),'tableBirthdays':sum(1 for p in players if (p['biographyMethod'] or '').startswith(('arwiki-','frwiki-','eswiki-'))),'tableDatesCopied':tables,'tableRuns':supplement.get('tableRuns',[]),'note3':'0.18b: for rows still without an item or birthday, the same club\'s squad table on ar/fr/es Wikipedia was read (squad-tables.py); French and Spanish rows carry the birthday, Arabic rows link items. Matching: English sitelink, same item, equal folded name, same shirt number+position on a 2026/27 table, or near-identical spelling — always unique on both sides, one table row per player, Wikidata\'s single day-precision date wins, contradictions dropped. Method per row in identityMethod/biographyMethod (prefix arwiki-/frwiki-/eswiki-).'})
 for file,data in [('players.json',players),('clubs.json',clubs),('leagues.json',leagues),('manifest.json',manifest),('conflicts.json',{'ambiguous':conflicts})]:
  (OUT/file).write_text(json.dumps(data,ensure_ascii=False,indent=2 if file=='manifest.json' else None,separators=(',',':') if file!='manifest.json' else None))
 print(json.dumps(manifest,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
