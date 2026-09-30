"""Create a clean release archive from an explicit allowlist; no personal browser data or tools."""
from pathlib import Path
import hashlib,json,tarfile
root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text(encoding='utf-8'))['version']
out=root/'artifacts'/'release';out.mkdir(parents=True,exist_ok=True)
files=[]
for name in ['data','docs','scripts','src','tests']:
    files.extend(p for p in (root/name).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc')
files.extend(root/name for name in ['.gitignore','CHANGELOG.md','favicon.svg','index.html','package.json','README.md','server.mjs','Start-CCNA.cmd','Start-CCNA.ps1'])
manifest=[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
(out/'files.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
archive=out/f'ccna-{version}.tar.gz'
with tarfile.open(archive,'w:gz') as tar:
    for p in sorted(files):tar.add(p,arcname=p.relative_to(root).as_posix(),recursive=False)
result={'version':version,'files':len(files),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'archive':str(archive)}
(out/'release.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
