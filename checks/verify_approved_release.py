"""Repository relocation verification; no network/deployment/credential operations."""
from html.parser import HTMLParser
import hashlib,json,re,unittest,subprocess
from pathlib import Path,PurePosixPath
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=json.loads((ROOT/'release/APPROVED_RELEASE_MANIFEST.json').read_text(encoding='utf-8'))
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.urls=[];self.h1=0;self.robots=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='meta' and a.get('name')=='robots':self.robots.append(a.get('content'))
  for key in ['src','href']:
   if key in a:self.urls.append(a[key])
  if a.get('srcset'):self.urls.extend(v.strip().split()[0] for v in a['srcset'].split(','))
class ReleaseTests(unittest.TestCase):
 def test_all_thirty_source_paths_bytes_exact_approved(self):
  self.assertEqual(len(MANIFEST['files']),30)
  for item in MANIFEST['files']:
   p=ROOT/item['path'];self.assertFalse(p.is_symlink());data=p.read_bytes()
   self.assertEqual(len(data),item['bytes'],item['path']);self.assertEqual(hashlib.sha256(data).hexdigest(),item['sha256'],item['path'])
 def test_committed_git_blobs_preserve_cross_platform_bytes(self):
  command=['git','-c','safe.directory='+ROOT.as_posix(),'-C',str(ROOT)]
  for item in MANIFEST['files']:
   data=subprocess.check_output(command+['show','HEAD:'+item['path']])
   self.assertEqual(hashlib.sha256(data).hexdigest(),item['sha256'],item['path'])
 def test_explicit_public_policy_and_portfolio_context(self):
  expected={'index.html':'index, follow','about.html':'index, follow','404.html':'noindex, nofollow'}
  for name,policy in expected.items():
   p=Page();p.feed((ROOT/name).read_text(encoding='utf-8'));self.assertEqual(p.robots,[policy]);self.assertEqual(p.h1,1)
  home=(ROOT/'index.html').read_text(encoding='utf-8');self.assertIn('>Portfolio launch</span>',home);self.assertNotIn('Studio Teknabu launch',home);self.assertIn('datetime="2026-12-01"',home)
 def test_local_asset_names_and_fragments_case_exact(self):
  selected={i['path'] for i in MANIFEST['files']};pages={}
  for name in ['index.html','about.html','404.html']:
   p=Page();p.feed((ROOT/name).read_text(encoding='utf-8'));pages[name]=p
  for name,page in pages.items():
   for url in page.urls:
    parts=urlsplit(url)
    if parts.scheme or parts.netloc:continue
    local=str(PurePosixPath(unquote(parts.path).lstrip('/'))) if parts.path else name
    self.assertIn(local,selected,(name,url))
    if parts.fragment:self.assertIn(unquote(parts.fragment),pages[local].ids,(name,url))
  css=(ROOT/'styles.css').read_text(encoding='utf-8')
  for url in re.findall(r'url\(\s*[\'\"]?([^\)\'\"]+)',css):
   if not url.startswith(('data:','#','https:')):self.assertIn(str(PurePosixPath(url.strip().lstrip('/'))),selected,url)
 def test_required_assets_and_legacy_exclusion(self):
  selected={i['path'] for i in MANIFEST['files']}
  for name in ['portfolio-assets/solva-logo-hero.png','portfolio-assets/game-strategy-scene.png','portfolio-assets/x-icon.svg','portfolio-assets/linkedin-icon.svg','portfolio-assets/mail-icon.svg','1714430952637.jpg']:
   self.assertIn(name,selected)
  self.assertFalse(selected & {'services.html','lab-texture-bg.png','lfc.svg','cowboys.svg','logo-metallica.svg','the-prodigy.png'})
if __name__=='__main__':unittest.main()
