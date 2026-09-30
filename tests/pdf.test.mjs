import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pdfChapters,chapterForPage} from '../data/pdf-catalog.js';
import {getDomain,getTopic} from '../data/catalog.js';
import {createRepository} from '../src/core/store.js';
const root=new URL('../',import.meta.url);
test('PDF chapter ranges cover pages 3–454 once, with valid related topics',()=>{
 assert.equal(pdfChapters.length,66);
 const pages=[];
 for(const c of pdfChapters){assert.ok(getDomain(c.domain));for(const t of c.topics)assert.ok(getTopic(t),t);for(let p=c.start;p<=c.end;p++){pages.push(p);assert.equal(chapterForPage(p).id,c.id);}}
 assert.deepEqual(pages,Array.from({length:452},(_,i)=>i+3));
});
test('454 translated pages preserve all extracted native blocks and have original images',async()=>{
 const manifest=JSON.parse(await readFile(new URL('data/pdf/manifest.json',root),'utf8'));
 const source=JSON.parse(await readFile(new URL('tests/fixtures/pdf-native-sha256.json',root),'utf8'));
 assert.equal(source.sourceSha256,manifest.sourceSha256);
 const pages=[];
 for(const f of manifest.files){const bytes=await readFile(new URL(`data/pdf/chapters/${f.id}.json`,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);pages.push(...JSON.parse(bytes).pages);}
 assert.equal(pages.length,454);assert.equal(new Set(pages.map(p=>p.page)).size,454);
 for(const p of pages){
  assert.ok((await stat(new URL(p.image.slice(1),root))).size>1000);
  assert.equal(source.pages[p.page-1].page,p.page);
  assert.equal(createHash('sha256').update(JSON.stringify(p.blocks.filter(b=>b.source==='text').map(b=>b.en))).digest('hex'),source.pages[p.page-1].sha256,`Original English page ${p.page}`);
  for(const b of p.blocks){assert.ok(b.zh.trim());for(const token of b.zh.match(/\[[A-Z]{2}\]/g)||[])assert.ok(b.en.includes(token),`${b.id}: unexpected placeholder ${token}`);for(const ip of b.en.match(/\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d+)?\b/g)||[])assert.ok(b.zh.includes(ip),`${b.id}: ${ip}`);}
 }
 assert.equal(manifest.counts.pages,454);
 const savePage=pages.find(p=>p.page===17);
 for(const text of ['Destination filename [startup-config]?','Building configuration... [OK]'])assert.ok(savePage.blocks.some(b=>b.zh.includes(text)),`CLI output preserved: ${text}`);
 assert.equal(manifest.translation.status,'machine-draft');
});
test('PDF bookmarks and read progress round-trip without changing topic progress',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 const repo=createRepository(storage);repo.pdfVisit('ch01',3);repo.pdfToggle('read',3);repo.pdfToggle('bookmarks',3);
 let reloaded=createRepository(storage);assert.deepEqual(reloaded.state.pdf,{read:[3],bookmarks:[3],last:{chapter:'ch01',page:3}});assert.deepEqual(reloaded.state.completed,[]);
 const backup=repo.export();repo.pdfToggle('read',3);assert.deepEqual(repo.state.pdf.read,[]);repo.import(backup);assert.deepEqual(repo.state.pdf.read,[3]);
 const old=JSON.parse(backup);delete old.pdf;repo.import(JSON.stringify(old));assert.deepEqual(repo.state.pdf,{read:[],bookmarks:[],last:null});
 repo.pdfToggle('read',999);repo.pdfToggle('bad',3);assert.deepEqual(repo.state.pdf.read,[]);
});
