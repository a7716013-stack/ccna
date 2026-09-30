"""Prepare local source pages and text. Images are OCRed separately by ocr-pdf.ps1."""
from pathlib import Path
import sys, json, re, shutil, hashlib, argparse
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'artifacts/pdf-tools'))
import pymupdf
args=argparse.ArgumentParser()
args.add_argument('--limit',type=int,default=454)
opts=args.parse_args()
source=next(p for p in (Path.home()/'Desktop').rglob('*.pdf') if p.name.startswith('CCNA 200-301'))
work=ROOT/'artifacts/pdf-import'
assets=ROOT/'data/pdf'
for directory in [work/'ocr-input',work/'ocr-output',assets/'pages',assets/'chapters']:
    directory.mkdir(parents=True,exist_ok=True)
shutil.copy2(source,assets/'source.pdf')
doc=pymupdf.open(source)
pages=[]
for i in range(min(len(doc),opts.limit)):
    page=doc[i]
    native=[]
    for block in page.get_text('blocks',sort=True):
        if block[6] != 0: continue
        text=block[4].strip()
        if not text or (text.isdigit() and block[1]>page.rect.height*.88):continue
        # Remove corrupt decorative glyphs; retain source content and line breaks.
        text=re.sub('[\uac00-\ud7af]','',text)
        native.append({'text':text,'bbox':list(block[:4])})
    images=[list(img['bbox']) for img in page.get_image_info() if (img['bbox'][2]-img['bbox'][0])*(img['bbox'][3]-img['bbox'][1])>900]
    png=work/'ocr-input'/f'{i+1:04}.png'
    jpg=assets/'pages'/f'{i+1:04}.jpg'
    if not png.exists() or not jpg.exists():
        pix=page.get_pixmap(matrix=pymupdf.Matrix(2,2),alpha=False)
        if not png.exists():pix.save(png)
        if not jpg.exists():pix.save(jpg,jpg_quality=88)
    pages.append({'page':i+1,'native':native,'images':images,'width':page.rect.width,'height':page.rect.height,'scale':2})
    if (i+1)%25==0:print(f'Extracted {i+1}/{len(doc)} pages',flush=True)
metadata={'sourceName':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pageCount':len(doc),'toc':doc.get_toc(),'pages':pages}
(work/'source.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':len(pages),'nativeBlocks':sum(len(p['native']) for p in pages),'imageRegions':sum(len(p['images']) for p in pages)},ensure_ascii=False),flush=True)
