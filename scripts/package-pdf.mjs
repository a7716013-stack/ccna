import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Converter} from '../artifacts/translation-tools/node_modules/opencc-js/dist/esm/full.js';
import {pdfChapters,pdfBook} from '../data/pdf-catalog.js';
import {reviewedTranslations} from '../data/pdf-reviewed.js';
const convert=Converter({from:'cn',to:'twp'});
const root=new URL('../',import.meta.url);
const input=JSON.parse(await readFile(new URL('artifacts/pdf-import/translated.json',root),'utf8'));
const canonical=text=>convert(text).replaceAll('服務器','伺服器').replaceAll('客戶端','用戶端').replaceAll('交換機','交換器').replaceAll('數據包','封包').replaceAll('數據幀','訊框').replaceAll('數據鏈路','資料連結').replaceAll('默認','預設').replaceAll('子網掩碼','子網路遮罩').replaceAll('字節','位元組').replaceAll('比特','位元').replaceAll('訪問控制列表','存取控制清單');
for(const p of input.pages)for(const b of p.blocks){
 for(const s of b.segments){
  if(/^(?:[\w.-]+(?:\([^)]*\))?\s*[#>]|Destination filename \[|Building configuration\.\.\.)/.test(s.en)){s.zh=s.en;s.method='verbatim';}
  else if(reviewedTranslations[s.en]){s.zh=reviewedTranslations[s.en];s.method='reviewed';}
  else if(p.page<=2&&s.en.includes('https://')){s.zh=s.en.includes('youtube')?"YouTube 課程系列｜Jeremy’s IT Lab — CCNA 200-301 https://www.youtube.com/playlist?list=PLxbwE86jKRgMpuZuLBivzlM8s2Dk5lXBQ":"Peter Saumur 的 GitHub 筆記｜Jeremy’s IT Lab — CCNA 200-301 https://github.com/psaumur/CCNA_Course_Notes";s.method='reviewed';}
  else if(p.page<=2&&/\.{5,}/.test(s.en)){const n=s.en.match(/^(\d+[abc]?)\./)?.[1],c=pdfChapters.find(c=>c.number===n);if(c){s.zh=`${c.number}. ${c.title} … ${c.start}`;s.method='reviewed';}}
  else if(s.method!=='verbatim')s.zh=canonical(s.zh).replaceAll('端口','連接埠').replaceAll('因特網','網際網路').replaceAll('互聯網','網際網路').replaceAll('局域網','區域網路').replaceAll('廣域網','廣域網路').replaceAll('網絡','網路').replaceAll('以太網','乙太網路').replaceAll('乙型網路','乙太網路');
 }
 b.zh=b.segments.map(s=>s.zh).join('\n');
}
const chapters=[{id:'frontmatter',title:'封面與資料來源',start:1,end:2},...pdfChapters];
await mkdir(new URL('data/pdf/chapters/',root),{recursive:true});
const files=[];
for(const c of chapters){
 const data={...c,pages:input.pages.filter(p=>p.page>=c.start&&p.page<=c.end)};
 const content=JSON.stringify(data);await writeFile(new URL(`data/pdf/chapters/${c.id}.json`,root),content);
 files.push({id:c.id,start:c.start,end:c.end,sha256:createHash('sha256').update(content).digest('hex')});
}
const search=input.pages.map(p=>({page:p.page,chapter:chapters.find(c=>p.page>=c.start&&p.page<=c.end).id,text:p.blocks.map(b=>b.zh+'\n'+b.en).join('\n')}));
await writeFile(new URL('data/pdf/search.json',root),JSON.stringify(search));
const segments=input.pages.flatMap(p=>p.blocks.flatMap(b=>b.segments));
const manifest={...pdfBook,sourceSha256:input.sourceSha256,translation:{status:'machine-draft',language:'zh-Hant-TW',model:input.model,conversion:'OpenCC cn → twp',ocr:'Windows.Media.Ocr en-US',notice:'本機自動翻譯初稿，已統一主要術語並保護位址與數字；尚未逐句人工校對。圖片文字由 OCR 辨識，圖表與 CLI 請搭配原頁核對。'},counts:{pages:input.pages.length,chapters:pdfChapters.length,blocks:input.pages.reduce((n,p)=>n+p.blocks.length,0),ocrBlocks:input.pages.reduce((n,p)=>n+p.blocks.filter(b=>b.source==='image-ocr').length,0),segments:segments.length,translated:segments.filter(s=>s.method!=='verbatim').length,verbatim:segments.filter(s=>s.method==='verbatim').length},files};
await writeFile(new URL('data/pdf/manifest.json',root),JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest.counts));
