export const STORAGE_KEY='integral-lab-v1';
export const freshState=()=>({version:1,records:{},history:[],session:null,current:'mit-2026-05'});
export function safeLoad(storage){
 try{const s=JSON.parse(storage.getItem(STORAGE_KEY));return validateState(s)?s:freshState();}catch{return freshState();}
}
export function validateState(s){
 return s&&s.version===1&&s.records&&typeof s.records==='object'&&!Array.isArray(s.records)&&Array.isArray(s.history)&&s.history.length<100000&&s.history.every(e=>typeof e.id==='string'&&Number.isFinite(e.at)&&['correct','incorrect','inconclusive'].includes(e.status))&&Object.entries(s.records).every(([id,r])=>/^mit-2026-(?:[a-z0-9]+-)?\d{2}$|^original-[\w-]+$/.test(id)&&r&&Number.isFinite(r.due)&&Number.isFinite(r.attempts)&&Number.isFinite(r.solved)&&Number.isFinite(r.interval)&&Number.isFinite(r.streak));
}
export function recordAttempt(state,id,result,{hinted=false,revealed=false,mode='train',input='',now=Date.now()}={}){
 if(!['correct','incorrect','inconclusive'].includes(result.status))return;
 const r=state.records[id]||{attempts:0,solved:0,independent:0,streak:0,interval:0,due:now,hints:0,last:0};
 r.attempts++;r.last=now;r.hints+=hinted?1:0;
 if(result.status==='correct'){
  r.solved++;r.independent=(r.independent||0)+(!hinted&&!revealed?1:0);r.streak++;
  r.interval=hinted||revealed?1:([1,3,7,14,30][Math.min(r.streak-1,4)]);r.due=now+r.interval*86400000;
 }else if(result.status==='incorrect'){r.streak=0;r.interval=0;r.due=now;}
 else if(!r.solved){r.due=now;}
 state.records[id]=r;
 state.history.push({id,status:result.status,at:now,hinted,revealed,mode,input:String(input).slice(0,500),method:result.method||''});
}
export const dueIds=(state,now=Date.now())=>Object.entries(state.records).filter(([,r])=>r.due<=now).sort((a,b)=>a[1].due-b[1].due).map(([id])=>id);
export function setReviewInterval(state,id,days,now=Date.now()){
 const r=state.records[id];if(r&&[1,3,7].includes(days)){r.interval=days;r.due=now+days*86400000;}
}
export const examRemaining=(session,now=Date.now())=>Math.max(0,Math.ceil((session.deadline-now)/1000));
