import test from 'node:test';
import assert from 'node:assert/strict';
import {questions} from '../data/questions.js';
import {pdfQuestions} from '../data/pdf-questions.js';
import {pdfChapters} from '../data/pdf-catalog.js';
import {domains,getTopic} from '../data/catalog.js';
import {createExam,checkAnswer,filterQuestions,scoreExam} from '../src/core/engine.js';
import {subnet} from '../src/core/network.js';
import {createRepository} from '../src/core/store.js';

test('PDF exercises join the existing bank without replacing legacy IDs',()=>{
 assert.equal(questions.length,177);assert.equal(pdfQuestions.length,36);
 assert.equal(questions.filter(q=>q.id.startsWith('concept-')).length,104);
 for(let i=1;i<=37;i++)assert.ok(questions.find(q=>q.id===`scenario-${i}`));
 assert.equal(new Set(questions.map(q=>q.question)).size,questions.length);
 for(const d of domains)assert.equal(pdfQuestions.filter(q=>q.domain===d.id).length,6);
 for(const q of pdfQuestions){
  assert.equal(getTopic(q.topic).domain,q.domain);
  const c=pdfChapters.find(c=>c.id===q.source.chapter);
  assert.ok(c.topics.includes(q.topic),q.id);assert.equal(c.start,q.source.start);assert.equal(c.end,q.source.end);
  assert.ok(filterQuestions(questions,{topic:q.topic}).some(x=>x.id===q.id));
  assert.ok(checkAnswer(q,q.correctAnswer));assert.ok(!checkAnswer(q,[]));
  for(const o of q.options)assert.ok(q.wrongAnswerExplanation[o.id]);
 }
});
test('New subnet answers agree with independent network calculations',()=>{
 const q=pdfQuestions.find(q=>q.id==='pdf-subnet-boundary');
 assert.equal(q.options.find(o=>q.correctAnswer.includes(o.id)).text,subnet('172.16.45.200',20).broadcast);
 assert.ok(subnet('10.0.0.0',26).hosts>=50);assert.ok(subnet('10.0.0.0',27).hosts<50);
});
test('25/50/100 exams can draw PDF exercises from the shared bank',()=>{
 // Fixed RNG makes the shared-bank sampling regression repeatable.
 const original=Math.random;Math.random=()=>0.5;
 try{for(const count of [25,50,100]){
  const exam=createExam(questions,count,domains);
  assert.equal(exam.length,count);assert.equal(new Set(exam.map(q=>q.id)).size,count);
  assert.ok(exam.some(q=>q.id.startsWith('pdf-')));
  for(const d of domains)assert.ok(exam.filter(q=>q.domain===d.id).length>=Math.floor(count*d.weight/100));
  const answers=Object.fromEntries(exam.map(q=>[q.id,q.correctAnswer]));assert.equal(scoreExam(exam,answers).score,100);
 }}finally{Math.random=original;}
});
test('PDF wrong answers retain source and survive backup restore',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 const repo=createRepository(storage),q=pdfQuestions[0];repo.record(q,[],false);
 const backup=repo.export();repo.import(backup);
 assert.equal(repo.state.wrong[q.id].count,1);
 assert.deepEqual(repo.state.wrong[q.id].question.source,q.source);
 repo.record(q,q.correctAnswer,true);assert.equal(repo.state.wrong[q.id].resolved,true);
});
