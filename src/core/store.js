const KEY='ccna.lab.v1';
const initial=()=>({version:1,history:[],wrong:{},completed:[],recentTopic:null,exams:[],activeExam:null,settings:{dailyGoal:10},pdf:{read:[],bookmarks:[],last:null}});
const cleanPdf=value=>({read:[...new Set((Array.isArray(value?.read)?value.read:[]).filter(p=>Number.isInteger(p)&&p>=1&&p<=454))],bookmarks:[...new Set((Array.isArray(value?.bookmarks)?value.bookmarks:[]).filter(p=>Number.isInteger(p)&&p>=1&&p<=454))],last:value?.last&&Number.isInteger(value.last.page)&&value.last.page>=1&&value.last.page<=454&&/^(ch\d{2}|frontmatter)$/.test(value.last.chapter)?value.last:null});
export const localDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function createRepository(storage){
 let state=initial(),warning='';
 try {const raw=storage.getItem(KEY);if(raw){const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.history)||!data.wrong||!Array.isArray(data.completed)||!Array.isArray(data.exams))throw Error();state={...state,...data};}}catch{warning='無法讀取已保存紀錄；目前使用暫存狀態，原始資料未覆寫。';}
 state.pdf=cleanPdf(state.pdf);
 let writable=!warning;
 function save(){if(!writable)return;try{storage.setItem(KEY,JSON.stringify(state));}catch{warning='瀏覽器無法保存資料。請匯出備份；目前變更只保留在此分頁。';}}
 return {
  get state(){return state;},get warning(){return warning;},
  record(question,answer,correct,mode='practice',attemptId=null){
   if(attemptId&&state.history.some(h=>h.attemptId===attemptId))return;
   const at=new Date().toISOString();state.history.push({questionId:question.id,topic:question.topic,domain:question.domain,answer:[...answer],correct,mode,at,day:localDay(),attemptId});
   if(!correct){const previous=state.wrong[question.id];state.wrong[question.id]={question,answer:[...answer],count:(previous?.count||0)+1,lastAt:at,resolved:false};}
   else if(state.wrong[question.id])state.wrong[question.id].resolved=true;
   save();
  },
  visit(id){state.recentTopic=id;save();},
  pdfVisit(chapter,page){state.pdf.last={chapter,page};save();},
  pdfToggle(key,page){if(!['read','bookmarks'].includes(key)||!Number.isInteger(page)||page<1||page>454)return;const list=state.pdf[key];state.pdf[key]=list.includes(page)?list.filter(p=>p!==page):[...list,page].sort((a,b)=>a-b);save();},
  complete(id){if(!state.completed.includes(id))state.completed.push(id);state.recentTopic=id;save();},
  setExam(exam){state.activeExam=exam;save();},
  finishExam(result){if(!state.exams.some(e=>e.id===result.id))state.exams.push(result);state.activeExam=null;save();},
  settings(settings){state.settings={...state.settings,...settings};save();},
  export(){return JSON.stringify(state,null,2);},
  import(text){const data=JSON.parse(text);if(data.version!==1||!Array.isArray(data.history)||!Array.isArray(data.completed)||!Array.isArray(data.exams)||!data.wrong||typeof data.wrong!=='object'||Array.isArray(data.wrong))throw Error('不是支援的 CCNA Lab 備份格式。');
   if(data.history.some(h=>!h||typeof h.questionId!=='string'||typeof h.domain!=='string'||typeof h.correct!=='boolean'||!Array.isArray(h.answer)||typeof h.at!=='string'||typeof h.day!=='string')||data.completed.some(id=>typeof id!=='string'))throw Error('學習紀錄格式不正確。');
   for(const entry of Object.values(data.wrong)){if(!entry?.question?.id||!Array.isArray(entry.question.options)||!Array.isArray(entry.question.correctAnswer)||!Array.isArray(entry.answer))throw Error('錯題紀錄格式不正確。');}
   state={...initial(),...data,activeExam:null,pdf:cleanPdf(data.pdf)};writable=true;warning='';save();}
 };
}
export function statistics(state){
 const total=state.history.length,correct=state.history.filter(h=>h.correct).length;
 const today=state.history.filter(h=>h.day===localDay()).length;
 const days=new Set(state.history.map(h=>h.day));let streak=0,cursor=new Date();
 if(!days.has(localDay(cursor)))cursor.setDate(cursor.getDate()-1);
 while(days.has(localDay(cursor))){streak++;cursor.setDate(cursor.getDate()-1);}
 const domains={};for(const h of state.history){const d=domains[h.domain]??={total:0,correct:0};d.total++;if(h.correct)d.correct++;}
 return {total,correct,today,streak,accuracy:total?Math.round(correct/total*100):0,wrong:Object.values(state.wrong).filter(w=>!w.resolved).length,domains};
}
