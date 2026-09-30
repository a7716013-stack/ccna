import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {topics,getTopic} from '../data/catalog.js';
import {commands} from '../data/commands.js';
import {lessons,getLesson} from '../data/lessons.js';
import {lessonConcept,lessonCase,lessonRecall,lessonCli,lessonSources,lessonDiagram} from '../src/learning-ui.js';
import {subnet} from '../src/core/network.js';

test('104 topics have complete, distinct lessons and valid source/command references',async()=>{
 assert.deepEqual(Object.keys(lessons).sort(),topics.map(t=>t.id).sort());
 const explanations=new Set(),flows=new Set();
 for(const t of topics){
  const l=getLesson(t.id);explanations.add(l.explanation);flows.add(JSON.stringify(l.stages));
  for(const text of [l.explanation,l.worked,l.recall.question,l.recall.answer])assert.ok(text.length>10,t.id);
  assert.equal(l.stages.length,4,t.id);for(const s of l.stages){assert.ok(s.label);assert.ok(s.text.length>5,t.id);}
  for(const id of l.commandIds)assert.ok(commands.some(c=>c.id===id),`${t.id}: ${id}`);
  for(const c of l.chapters){const source=JSON.parse(await readFile(new URL(`../data/pdf/chapters/${c.id}.json`,import.meta.url),'utf8'));assert.ok(source.pages.some(p=>p.page===c.start));}
  if(['ai','terraform'].includes(t.id)){assert.equal(l.basis,'official-supplement');assert.ok(l.official.length);assert.equal(l.chapters.length,0);}
  else {assert.equal(l.basis,'pdf-aligned');assert.ok(l.chapters.length,t.id);}
 }
 assert.equal(explanations.size,104);assert.equal(flows.size,104);
});
test('Topic-specific flow diagrams replace generic Ethernet forwarding for protocols',()=>{
 const dhcp=getLesson('dhcp').stages.map(s=>s.label);assert.deepEqual(dhcp,['Discover','Offer','Request','ACK']);
 assert.equal(getLesson('stp').stages[0].label,'選根');
 assert.equal(getLesson('acl').stages[2].label,'停止');
 assert.notEqual(lessonDiagram(getTopic('dhcp')),lessonDiagram(getTopic('stp')));
 assert.match(lessonDiagram(getTopic('dhcp'),2),/STEP 3 \/ 4/);
});
test('Source errata are visible in relevant lessons and calculation remains correct',()=>{
 assert.ok(getLesson('ipv6').corrections.some(n=>n.page===207));
 assert.match(getLesson('ipv6').explanation,/16 bytes/);
 assert.ok(getLesson('physical').corrections.some(n=>n.page===41));
 assert.ok(getLesson('ipv4-routing').corrections.some(n=>n.page===59));
 assert.ok(getLesson('ipv4').corrections.some(n=>n.page===74));
 assert.equal(subnet('192.168.1.192',27).broadcast,'192.168.1.223');
 assert.match(getLesson('ipv4').recall.answer,/192\.168\.1\.223/);
 assert.ok(getLesson('named-acl').corrections.some(n=>n.page===233));
});
test('Shared lesson renderers expose depth, case, recall and sources without inventing IOS commands',()=>{
 for(const t of topics){assert.ok(lessonConcept(t).includes(getLesson(t.id).id));assert.match(lessonCase(t),/案例推導/);assert.match(lessonRecall(t),/<details>/);assert.match(lessonSources(t),/核對依據/);}
 assert.doesNotMatch(lessonCli(getTopic('json')),/show version/);
 assert.match(lessonCli(getTopic('dhcp')),/ip dhcp pool STAFF/);
 assert.match(lessonCli(getTopic('inter-vlan')),/interface vlan 10/);
 assert.match(commands.find(c=>c.id==='ssh').example,/R1# configure terminal\nR1\(config\)# line vty/);
});
