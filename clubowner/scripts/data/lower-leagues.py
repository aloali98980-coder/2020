"""Lower-tier club names from CC BY-SA Wikipedia discovery, not certified registrations."""
import importlib.util,pathlib,json,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('discovery',pathlib.Path(__file__).with_name('import-wikipedia.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
DEFS=[('en',2,'EFL Championship'),('en',3,'EFL League One'),('en',4,'EFL League Two'),('de',2,'2. Bundesliga'),('de',3,'3. Liga'),('es',2,'Segunda División'),('fr',2,'Ligue 2'),('it',2,'Serie B'),('pt',2,'Liga Portugal 2'),('nl',2,'Eerste Divisie'),('sc',2,'Scottish Championship'),('sc',3,'Scottish League One'),('sc',4,'Scottish League Two'),('eg',2,'Egyptian Second Division A')]
out=[]
for country,tier,title in DEFS:
 l=m.get_league([country,title,title,'2026–27 '+title,'',60])
 if not l['clubs']:l=m.get_league([country,title,title,'2025–26 '+title,'',60])
 if not l['clubs']:l=m.get_league([country,title,title,title,'',60])
 l['name']=title;
 l.update(id=country+'-'+str(tier),country=country,tier=tier)
 out.append(l)
 (ROOT/'src/data/lowerLeagues.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('LOWER',sum(len(x['clubs']) for x in out),'club entries',len(out),'divisions')
