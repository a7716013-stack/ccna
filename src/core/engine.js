export function shuffle(items,rng=Math.random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function filterQuestions(bank,{domain='',topic='',difficulty='',type=''}={}){return bank.filter(q=>(!domain||q.domain===domain)&&(!topic||q.topic===topic)&&(!difficulty||q.difficulty===difficulty)&&(!type||q.questionType===type));}
export function checkAnswer(question,answer){const normalize=x=>[...new Set((Array.isArray(x)?x:[x]).map(String))].sort();return JSON.stringify(normalize(answer))===JSON.stringify(normalize(question.correctAnswer));}
export function prepareQuestion(q){return {...q,options:shuffle(q.options)};}
export function createExam(bank,count,domains){
 if(![25,50,100].includes(count))throw Error('請選擇 25、50 或 100 題。');
 if(bank.length<count)throw Error('題庫數量不足，不重複塞入相同題目。');
 const selected=[];
 for(const d of domains){const pool=shuffle(bank.filter(q=>q.domain===d.id));selected.push(...pool.slice(0,Math.floor(count*d.weight/100)));}
 const remaining=shuffle(bank.filter(q=>!selected.some(s=>s.id===q.id)));
 return shuffle([...selected,...remaining.slice(0,count-selected.length)]).map(prepareQuestion);
}
export function scoreExam(questions,answers){
 const results=questions.map(q=>({question:q,answer:answers[q.id]||[],correct:checkAnswer(q,answers[q.id]||[])}));
 const domains={};for(const r of results){const d=domains[r.question.domain]??={total:0,correct:0};d.total++;if(r.correct)d.correct++;}
 const correct=results.filter(r=>r.correct).length;
 return {total:questions.length,correct,score:questions.length?Math.round(correct/questions.length*100):0,domains,results};
}
