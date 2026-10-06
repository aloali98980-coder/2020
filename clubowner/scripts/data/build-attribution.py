"""Publish attribution and a reusable, separately licensed data adaptation."""
import pathlib,json,html,urllib.parse,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[2];DATA=ROOT/'src/data/packs/world';PUBLIC=ROOT/'public'
e=html.escape
manifest=json.loads((DATA/'manifest.json').read_text());clubs=json.loads((DATA/'clubs.json').read_text());leagues=json.loads((DATA/'leagues.json').read_text())
tables=(json.loads((DATA/'identity-supplement.json').read_text()) if (DATA/'identity-supplement.json').exists() else {}).get('tableSources',{})
notice='''Club Owner world squad adaptation — snapshot 2026-09-24, supplemented 2026-09-27 (data release 0.4)

Squad membership, source positions, names and club/league discovery adapted from
English Wikipedia and its contributors — and, for clubs whose English article has
no usable squad table, from the same club's article on another Wikipedia language
edition (es, fr, it, ar; see manifest.supplementedClubs and clubs.json
"supplement") — licensed under Creative Commons Attribution-ShareAlike 4.0
International:
https://creativecommons.org/licenses/by-sa/4.0/
https://creativecommons.org/licenses/by-sa/4.0/legalcode
This squad/database adaptation is distributed under that same licence.
Article/revision references are in clubs.json and leagues.json. Contributors
are identified through each article's revision history. Transcluded squad
sources and revisions are in templateAttribution. No logos, photos or copied
narrative text are included. No endorsement by Wikipedia or clubs is implied.

Changes: selected senior squad templates; normalised identifiers/positions;
excluded loaned-out rows, unsupported tables, deceased identities identified
in Wikidata, and unresolved conflicting club assignments. Since release 0.4,
identities listed by two clubs are resolved by the player's own article infobox
or open Wikidata club membership, else by the newer source page; plain
namesakes without any article are kept as distinct people (conflict-
resolutions.json). Missing players were NOT replaced with fictional people. Club membership is a published snapshot, not
certified 2026/27 registration. Some country discovery is older (Qatar and
Morocco 2025/26); Netherlands source lists 19 teams and requires review.

Biographies / Arabic labels: Wikidata structured data under CC0, matched by
exact Wikipedia article identity, by resolved redirects/renamed titles, or — for
unlinked names since release 0.4 — by a unique folded label among living
footballers of the same nationality or club (identity-supplement.json; the
method is recorded per row in identityMethod/biographyMethod and is NOT
independent certification; ages outside 16–39 are rejected for name matches). Day-precision, non-deprecated DOB statements
only; conflicting dates stay unknown. Item links are in biographyUrl / qid.
https://www.wikidata.org/wiki/Wikidata:Licensing
Fallback birthdays: openfootball/players, CC0, unique normalised-name match,
commit 125d20f7cc06cac7e758b40df535a7695632680a (2024-06-17).
https://github.com/openfootball/players
Unknown birthdays remain null. These identity matches are not independent
certification. Wikidata lookups are retrieval snapshots, not pinned revisions.
Since release 0.4b, rows that still lacked an item or birthday were compared
with the same club's squad table on Arabic, French or Spanish Wikipedia
(identity-supplement.json "birthdays"/"matches"/"tableSources"; methods
arwiki-*/frwiki-*/eswiki-*; pages listed per club below with their revision).
French and Spanish tables carry the birthday in the row (CC BY-SA content of
those articles and their contributors); Arabic rows link Wikidata items. A
match needs a unique English sitelink / same item / equal folded name / same
shirt number and position on a 2026/27 table / near-identical spelling, one
table row per player; Wikidata's single day-precision date wins and
contradictions are dropped. Not independent certification.

Abilities, detailed roles, potential, professionalism, wages, values and
contracts are game estimates, not source facts or real personal assessments.
They are generated separately by the game and are not in players.json.
Legacy v0.2 provisional names are a separate pack, NOT covered by this data
licence notice. See docs/DATA-SOURCES.md for their unresolved provenance.
'''
(PUBLIC/'data').mkdir(exist_ok=True)
(PUBLIC/'data/world-data-NOTICE.txt').write_text(notice)
with zipfile.ZipFile(PUBLIC/'data/world-data.zip','w',zipfile.ZIP_DEFLATED,9) as z:
 for name in ['players.json','clubs.json','leagues.json','manifest.json','conflicts.json','wikidata-bios.json','identity-supplement.json','clubs-supplement.json','conflict-resolutions.json']:
  if (DATA/name).exists():z.write(DATA/name,name)
 z.writestr('NOTICE.txt',notice);z.write(PUBLIC/'data/openfootball-CC0.txt','openfootball-CC0.txt')
sections=[]
for l in leagues:
 rows=[]
 for c in [c for c in clubs if c['league']==l['id']]:
  history='https://en.wikipedia.org/w/index.php?title='+urllib.parse.quote(c['wiki'].replace(' ','_'))+'&action=history'
  refs=[]
  for ref in c.get('templateAttribution',[]):
   u='https://en.wikipedia.org/w/index.php?title='+urllib.parse.quote(ref['title'].replace(' ','_'))
   if ref.get('revision'):u+='&oldid='+str(ref['revision'])
   refs.append('<a href="'+e(u)+'">'+e(ref['title'])+'</a>')
  for t in tables.get(c['id'],[]):
   th='https://'+t['lang']+'.wikipedia.org/w/index.php?title='+urllib.parse.quote(t['title'].replace(' ','_'))+'&action=history'
   refs.append('<a href="'+e(t['url'])+'">'+e(t['lang']+'.wikipedia: '+t['title'])+'</a> (squad table read, '+str(t.get('matched',0))+' rows used) · <a href="'+e(th)+'">history</a>')
  sup=c.get('supplement')
  if sup:
   sh='https://'+sup['lang']+'.wikipedia.org/w/index.php?title='+urllib.parse.quote(sup['title'].replace(' ','_'))+'&action=history'
   refs.append('<a href="'+e(sup['sourceUrl'])+'">'+e(sup['lang']+'.wikipedia: '+sup['title'])+'</a> (squad, '+str(sup['rows'])+' rows) · <a href="'+e(sh)+'">history</a>')
  rows.append(f'<tr><td>{e(c["name"])}</td><td>{c["importedCount"]}</td><td><a href="{e(c["sourceUrl"])}">Article + revision</a> · <a href="{e(history)}">Contributors / history</a><br>{" · ".join(refs)}</td></tr>')
 source=l['sourceUrl']
 if l.get('revision'):source='https://en.wikipedia.org/w/index.php?title='+urllib.parse.quote(l['wiki'].replace(' ','_'))+'&oldid='+str(l['revision'])
 sections.append(f'<details><summary>{e(l["nameAr"])} — {e(l["name"])} · {l["playerCount"]:,} players</summary><p><a href="{e(source)}">Club discovery source</a> · {e(l.get("clubSection",""))} · partial/unverified</p><table><tr><th>Article</th><th>Players</th><th>Attribution</th></tr>{"".join(rows)}</table></details>')
text=f'''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تراخيص قاعدة اللاعبين — Club Owner</title><style>body{{font:17px/1.85 system-ui,sans-serif;margin:0;background:#101c1a;color:#ecf3ed}}main{{max-width:1080px;margin:auto;padding:28px}}a{{color:#9ae4be}}h1{{font-size:32px}}.note,details{{padding:18px;background:#1c2c26;border:1px solid #435d4b;border-radius:12px;margin:16px 0}}summary{{cursor:pointer;font-weight:700}}table{{width:100%;border-collapse:collapse;font-size:14px;direction:ltr}}td,th{{text-align:left;padding:12px;border-bottom:1px solid #435d4b;overflow-wrap:anywhere}}pre{{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.8 system-ui}}small{{color:#bfc8c2}}</style><main><a href="/">← الرجوع للعبة</a><h1>تراخيص ومنهج قاعدة اللاعبين</h1><p>لقطة الاستيراد: ٢٤ سبتمبر ٢٠٢٦ · استكمال ٢٧ سبتمبر ٢٠٢٦ · إصدار بيانات 0.4</p><div class="note"><b>{manifest['players']:,} لاعبًا · ٥٠ سوق انتقالات · {sum(c['importedCount']>0 for c in clubs)} صفحة نادٍ تحتوي أسماء مستوردة من أصل {len(clubs)}.</b><p>ليست قاعدة كاملة أو قوائم قيد رسمية معتمدة لموسم ٢٠٢٦/٢٧. {sum(not c['importedCount'] for c in clubs)} صفحة بلا قائمة مستوردة، و{manifest['unknownBirthDates']:,} تاريخ ميلاد غير متاح. استُبعدت {manifest['duplicateConflictsExcluded']} هوية متعارضة بين أندية بدل اختيار انتقال عشوائي.</p><p>اكتشاف أندية قطر والمغرب يرجع إلى ٢٠٢٥/٢٦، ومصدر هولندا يسرد ١٩ ناديًا ويحتاج مراجعة. تاريخ تحديث المقالة لا يثبت صحة القائمة الحالية. الـ٥٠ سوقًا ليست ٥٠ بطولة مُحاكية.</p><p>العمر غير الموثق يُوزَّع داخل المحاكاة توزيعًا ثابتًا بين ١٨ و٣٦ عامًا (متوسط ≈ ٢٥٫٥) ويُوسم «~ تقديري». قوائم {len(manifest.get('supplementedClubs',[]))} ناديًا أُخذت من نسخة لغوية أخرى لويكيبيديا، و{manifest.get('tableBirthdays',0):,} تاريخ ميلاد و{sum(1 for m in tables.values() for _ in m)} صفحة تشكيلة قُرئت من ويكيبيديا العربية/الفرنسية/الإسبانية لنفس النادي (الصفحات مذكورة أسفل كل نادٍ)، وحُلَّت تضاربات الأسماء بين الأندية عبر مقال اللاعب أو عضوية ويكي بيانات أو المصدر الأحدث (الطرق مسجلة في manifest.json). القدرات والاحترافية والإصابات والعقود والأجور والأدوار التفصيلية تقديرات لعب، وليست معلومات شخصية أو تقييمات رسمية.</p></div><p><a href="/data/world-data.zip" download>تنزيل حزمة البيانات القابلة لإعادة الاستخدام (يتطلب اتصالًا)</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a></p><p>مصدر القوائم: ويكيبيديا ومساهمو المقالات. روابط كل مقالة ونسختها وسجل مساهميها والقوالب أسفل الصفحة. بيانات الميلاد والأسماء العربية: Wikidata، مع openfootball كمصدر احتياطي. لا شعارات أو صور للاعبين.</p><details><summary>المنهج والتغييرات والترخيص — English notice</summary><pre dir="ltr">{e(notice)}</pre></details><h2>سجل الإسناد حسب السوق</h2><small>الروابط الخارجية تحتاج اتصالًا؛ سجل الإسناد نفسه متاح دون اتصال بعد تثبيت اللعبة.</small>{''.join(sections)}</main></html>'''
(PUBLIC/'data-license.html').write_text(text)
print('Attribution published:',len(clubs),'club sources')
