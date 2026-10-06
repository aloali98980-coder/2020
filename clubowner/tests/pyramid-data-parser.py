import unittest,importlib.util,pathlib
p=pathlib.Path(__file__).resolve().parents[1]/'scripts/data/discover-pyramid-v08.py';spec=importlib.util.spec_from_file_location('d',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ParserTests(unittest.TestCase):
 def test_rowspans_do_not_drop_city_shared_clubs(self):
  html='<h2>Teams</h2><table class="wikitable"><tr><th>Team</th><th>City</th><th>Stadium</th></tr>'+''.join(f'<tr><td>Club {i}</td>'+('<td rowspan="6">Same city</td>' if i==0 else '')+'<td>Ground</td></tr>' for i in range(6))+'</table>'
  self.assertEqual(m.candidates({'text':{'*':html}})[0]['clubs'],[f'Club {i}' for i in range(6)])
 def test_reserve_label_is_not_parent_article(self):
  html='<h2>Teams</h2><table class="wikitable"><tr><th>Team</th><th>City</th></tr>'+''.join(f'<tr><td><a href="/wiki/Parent_{i}">Parent {i} II</a></td><td>City</td></tr>' for i in range(6))+'</table>'
  self.assertEqual(m.candidates({'text':{'*':html}})[0]['clubs'][0],'Parent 0 II')
 def test_regional_standings_are_separate_and_scorers_excluded(self):
  h=''
  for group in ['Zone A','Zone B','Top scorers']:
   h+=f'<h2>{group}</h2><table class="wikitable"><tr><th>Pos</th><th>Team</th><th>Pld</th><th>Pts</th></tr>'+''.join(f'<tr><td>{i}</td><td>C {group} {i}</td><td>4</td><td>9</td></tr>' for i in range(6))+'</table>'
  self.assertEqual([t['group'] for t in m.candidates({'text':{'*':h}})],['Zone A','Zone B'])
if __name__=='__main__':unittest.main()
