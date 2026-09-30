import test from 'node:test';
import assert from 'node:assert/strict';
import {domains,topics,glossary} from '../data/catalog.js';
import {commands} from '../data/commands.js';
import {questions} from '../data/questions.js';
import {checkAnswer,filterQuestions,createExam,scoreExam} from '../src/core/engine.js';
import {ipToInt,intToIp,subnet,contains,allocateVlsm,newRoutingQuestion,newAclQuestion} from '../src/core/network.js';
import {createRepository,statistics,localDay} from '../src/core/store.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};};
test('Phase 1: all topics have complete content and valid domain / command references',()=>{
 assert.equal(new Set(topics.map(t=>t.id)).size,topics.length);
 assert.equal(domains.reduce((n,d)=>n+d.weight,0),100);
 for(const t of topics){for(const key of ['id','en','name','concept','key','trap','example'])assert.ok(t[key],`${t.id}: ${key}`);assert.ok(domains.some(d=>d.id===t.domain));for(const id of t.commands)assert.ok(commands.some(c=>c.id===id),id);}
 for(const g of glossary)assert.ok(topics.some(t=>t.id===g.topic));
});
test('Phase 2: question schema, unique options, valid answer keys and explanations',()=>{
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){assert.ok(topics.some(t=>t.id===q.topic));assert.ok(q.options.length>=2);assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length,q.id);for(const id of q.correctAnswer)assert.ok(q.options.some(o=>o.id===id));for(const o of q.options.filter(o=>!q.correctAnswer.includes(o.id)))assert.ok(q.wrongAnswerExplanation[o.id],q.id);assert.ok(q.explanation);}
 assert.ok(new Set(questions.map(q=>q.questionType)).size>=7);
});
test('Phase 2: multi-answer grading requires exactly the correct set, regardless of order',()=>{
 const q=questions.find(q=>q.correctAnswer.length>1);assert.ok(checkAnswer(q,[...q.correctAnswer].reverse()));assert.ok(!checkAnswer(q,q.correctAnswer.slice(0,1)));assert.ok(!checkAnswer(q,[...q.correctAnswer,'invalid']));assert.ok(!checkAnswer(q,[]));
});
test('Phase 2: domain/topic/difficulty/type filters combine',()=>{
 const results=filterQuestions(questions,{domain:'security',topic:'extended-acl',difficulty:'中級',type:'CLI Question'});assert.ok(results.length);assert.ok(results.every(q=>q.topic==='extended-acl'&&q.domain==='security'&&q.difficulty==='中級'&&q.questionType==='CLI Question'));
});
test('Phase 2: wrong answer history persists and correct retry marks resolved',()=>{
 const storage=memory(),repo=createRepository(storage),q=questions[0];repo.record(q,['wrong'],false);repo.record(q,['wrong'],false);assert.equal(repo.state.wrong[q.id].count,2);const reopened=createRepository(storage);assert.equal(statistics(reopened.state).wrong,1);reopened.record(q,q.correctAnswer,true);assert.equal(reopened.state.wrong[q.id].count,2);assert.equal(statistics(reopened.state).wrong,0);assert.equal(statistics(reopened.state).total,3);
});
test('Phase 3: IPv4 calculations at subnet edges and across octets',()=>{
 const s=subnet('192.168.10.70',26);assert.deepEqual([s.network,s.broadcast,s.mask,s.first,s.last,s.hosts,s.wildcard],['192.168.10.64','192.168.10.127','255.255.255.192','192.168.10.65','192.168.10.126',62,'0.0.0.63']);
 const mid=subnet('172.20.133.44',19);assert.equal(mid.network,'172.20.128.0');assert.equal(mid.broadcast,'172.20.159.255');assert.equal(mid.hosts,8190);
 const zero=subnet('192.0.2.1',0);assert.equal(zero.network,'0.0.0.0');assert.equal(zero.broadcast,'255.255.255.255');
 assert.equal(subnet('192.0.2.1',31).hosts,2);assert.equal(subnet('192.0.2.1',31).broadcast,'不適用');assert.equal(subnet('192.0.2.1',32).hosts,1);
});
test('Phase 3: all supported LAN prefixes align and contain the original address',()=>{
 for(let prefix=1;prefix<=30;prefix++){for(const ip of ['0.0.0.0','10.127.255.254','172.31.129.63','255.255.255.255']){const s=subnet(ip,prefix);assert.ok(contains(`${s.network}/${prefix}`,ip));assert.equal(s.networkInt%s.size,0);assert.equal(ipToInt(s.broadcast)-s.networkInt+1,s.size);assert.equal(ipToInt(s.mask)+ipToInt(s.wildcard),4294967295);}}
});
test('Phase 3: IPv4 input rejects malformed addresses and prefixes',()=>{
 for(const ip of ['1.2.3','256.1.2.3','-1.2.3.4','1.2.3.x','1.2.3.4.5',''])assert.throws(()=>ipToInt(ip));for(const p of [-1,33,2.5,'xx'])assert.throws(()=>subnet('1.2.3.4',p));assert.equal(intToIp(ipToInt('255.255.255.255')),'255.255.255.255');
});
test('Phase 3: VLSM sorts by size, preserves LAN identity, aligns without overlap',()=>{
 const list=allocateVlsm('10.1.0.0/24',[10,50,25]);assert.deepEqual(list.map(s=>[s.index,s.network,s.prefix]),[[1,'10.1.0.0',26],[2,'10.1.0.64',27],[0,'10.1.0.96',28]]);for(let i=0;i<list.length;i++){assert.ok(list[i].hosts>=list[i].required);if(i)assert.ok(list[i].networkInt>list[i-1].lastInt);}assert.throws(()=>allocateVlsm('10.0.0.0/30',[50]));assert.throws(()=>allocateVlsm('10.0.0.0/24',[0]));
});
test('Phase 3: generated routing questions select longest actual match',()=>{
 for(let i=0;i<100;i++){const q=newRoutingQuestion(),selected=q.routes[Number(q.correctAnswer[0])],matches=q.routes.filter(r=>contains(r.prefix,q.destination));assert.ok(contains(selected.prefix,q.destination));assert.equal(Number(selected.prefix.split('/')[1]),Math.max(...matches.map(r=>Number(r.prefix.split('/')[1]))));}
});
test('Phase 3: generated ACL answer matches action, protocol and wildcard',()=>{
 for(let i=0;i<50;i++){const q=newAclQuestion(),correct=q.options.find(o=>o.id===q.correctAnswer[0]).text;assert.match(correct,/^(permit|deny) tcp 192\.168\.\d+\.0 0\.0\.0\.255 host 10\.0\.0\.\d+ eq (22|80|443)$/);assert.equal(correct.startsWith('permit'),q.question.startsWith('允許'));}
});
test('Phase 4: all exam sizes contain unique questions and all domains',()=>{
 for(const count of [25,50,100]){const exam=createExam(questions,count,domains);assert.equal(exam.length,count);assert.equal(new Set(exam.map(q=>q.id)).size,count);for(const d of domains)assert.ok(exam.filter(q=>q.domain===d.id).length>=Math.floor(count*d.weight/100));}
 assert.throws(()=>createExam(questions,26,domains));assert.throws(()=>createExam(questions.slice(0,10),25,domains));
});
test('Phase 4: partial exam grades unanswered wrong and returns domain totals',()=>{
 const exam=createExam(questions,25,domains),answers=Object.fromEntries(exam.slice(0,10).map(q=>[q.id,q.correctAnswer]));const result=scoreExam(exam,answers);assert.equal(result.correct,10);assert.equal(result.score,40);assert.equal(result.results.filter(r=>!r.answer.length).length,15);assert.equal(Object.values(result.domains).reduce((n,d)=>n+d.total,0),25);
});
test('Phase 4: exam submission IDs avoid duplicate answer recording',()=>{
 const repo=createRepository(memory()),q=questions[0];repo.record(q,[],false,'exam','exam1:q1');repo.record(q,[],false,'exam','exam1:q1');assert.equal(repo.state.history.length,1);
});
test('Phase 4: active exam and completed topics survive reload',()=>{
 const storage=memory(),repo=createRepository(storage);repo.complete('vlan');repo.complete('vlan');repo.setExam({id:'session',index:2,answers:{q:['a']},deadline:123});const reopened=createRepository(storage);assert.deepEqual(reopened.state.completed,['vlan']);assert.equal(reopened.state.activeExam.index,2);assert.deepEqual(reopened.state.activeExam.answers,{q:['a']});
});
test('Phase 4: streak includes yesterday when not yet studied today',()=>{
 const repo=createRepository(memory()),yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);repo.state.history=[{correct:true,domain:'access',day:localDay(yesterday)}];assert.equal(statistics(repo.state).streak,1);assert.equal(statistics(repo.state).today,0);
});
test('Phase 5: corrupt or blocked storage yields warning without overwriting original',()=>{
 let writes=0;const repo=createRepository({getItem:()=>'{broken',setItem(){writes++;}});assert.ok(repo.warning);repo.complete('vlan');assert.equal(writes,0);const blocked=createRepository({getItem:()=>null,setItem(){throw Error('QuotaExceeded');}});blocked.complete('vlan');assert.ok(blocked.warning);
});
test('Phase 5: backup restore validates data and clears stale active exam',()=>{
 const a=createRepository(memory());a.record(questions[0],[],false);a.complete('vlan');a.setExam({id:'active'});const b=createRepository(memory());b.import(a.export());assert.equal(b.state.history.length,1);assert.equal(b.state.activeExam,null);assert.throws(()=>b.import('{"version":2}'));assert.throws(()=>b.import(JSON.stringify({...a.state,history:[{}]})));assert.equal(b.state.history.length,1);
});
