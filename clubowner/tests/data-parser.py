"""Offline parser regressions. Run with Python dependencies from requirements.txt."""
import importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('batch',ROOT/'scripts/data/batch-rosters.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Parsing(unittest.TestCase):
 def test_empty_parent_and_loans(self):
  source='''==Players==
===Current squad===
{{updated|24 September 2026}}
{{Fs start}}
{{Fs player|name=[[Actual Player]]|pos=FW|nat=EGY}}
{{Fs end}}
===Out on loan===
{{Fs start}}
{{Fs player|name=[[Loaned Player]]|pos=MF}}
{{Fs end}}'''
  rows,refs,date=m.templates_section(source);self.assertEqual([p['name'] for p in rows],['Actual Player']);self.assertEqual(date,'24 September 2026')
 def test_fs2(self):
  rows,_,_=m.templates_section('==Current squad==\n{{Fs2 player|first=Test|last=Person|pos=MF|nat=CHI|link=Test Person (footballer)}}');self.assertEqual(rows[0]['wiki'],'Test Person (footballer)')
 def test_rowspan_club_column(self):
  soup=m.b.BeautifulSoup('<table><tr><th>Conference</th><th>Team</th><th>City</th></tr><tr><td rowspan="2">East</td><td>A</td><td>X</td></tr><tr><td>B</td><td>Y</td></tr></table>','html.parser');grid=m.b.table_grid(soup.table);self.assertEqual(grid[2][1].text,'B')
if __name__=='__main__':unittest.main()
