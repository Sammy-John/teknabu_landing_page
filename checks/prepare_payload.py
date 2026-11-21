"""Build the exact reviewed static output from repository source; no hosting API."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def build(destination):
 destination=Path(destination)
 if not destination.is_absolute():destination=ROOT/destination
 destination=destination.resolve()
 if not destination.is_relative_to(ROOT) or destination==ROOT:raise ValueError('output must be a new child of this source worktree')
 if destination.exists():raise ValueError('output exists; no overwrite/delete allowed')
 manifest=json.loads((ROOT/'release/APPROVED_RELEASE_MANIFEST.json').read_text(encoding='utf-8'))
 for item in manifest['files']:
  relative=Path(item['path'])
  if relative.is_absolute() or '..' in relative.parts:raise ValueError('unsafe source path')
  source=ROOT/relative
  if source.is_symlink() or any(p.is_symlink() for p in source.parents):raise ValueError('source symlink prohibited')
  data=source.read_bytes()
  if len(data)!=item['bytes'] or hashlib.sha256(data).hexdigest()!=item['sha256']:raise ValueError('approved source drift: '+item['path'])
 destination.mkdir(parents=True)
 for item in manifest['files']:
  target=destination/item['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((ROOT/item['path']).read_bytes())
 return {'file_count':len(manifest['files']),'source_candidate':manifest['candidate_commit'],'output':str(destination),'deployed':False}
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args();print(json.dumps(build(args.output)))
