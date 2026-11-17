const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../projects/integral-lab');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const checker=app.slice(app.indexOf('async function checkAnswer('),app.indexOf('async function submitAnswer('));
const submit=app.slice(app.indexOf('async function submitAnswer('),app.indexOf('function startExam('));

function harness({constructorFails=false}={}){
 let now=0,serial=0;
 const timers=new Map(),workers=[],button={};
 class Worker{
  constructor(){if(constructorFails)throw Error('blocked');this.messages=[];this.terminated=0;workers.push(this);}
  postMessage(data){this.messages.push(data);}
  terminate(){this.terminated++;}
  emit(data){this.onmessage({data});}
 }
 const context={Worker,$:()=>button,setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)};
 vm.createContext(context);
 vm.runInContext('let checkEpoch=0,busy=false,worker=null;'+checker+';this.check=checkAnswer;this.isBusy=()=>busy;',context);
 function advance(ms){
  const end=now+ms;
  for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}
  now=end;
 }
 return {...context,workers,button,advance,timers};
}

test('a cold Worker may load for over six seconds without using its computation budget',async()=>{
 const h=harness(),p={id:'q2'},result=h.check('e^(2026*e^x)/2026',p),w=h.workers[0];
 h.advance(12000);
 assert.equal(h.isBusy(),true);assert.equal(w.terminated,0);assert.equal(w.messages.length,0);
 assert.match(h.button.textContent,/載入/);
 w.emit({type:'ready'});
 assert.equal(w.messages.length,1);assert.equal(w.messages[0].input,'e^(2026*e^x)/2026');
 assert.equal(h.button.textContent,'驗證中…');
 h.advance(5999);assert.equal(h.isBusy(),true);
 w.emit({type:'result',result:{status:'correct'}});
 assert.equal((await result).status,'correct');assert.equal(h.isBusy(),false);assert.equal(w.terminated,1);assert.equal(h.timers.size,0);
 w.emit({type:'ready'});assert.equal(w.messages.length,1);
});

test('a genuine computation is still stopped at six seconds after readiness',async()=>{
 const h=harness(),result=h.check('x',{}),w=h.workers[0];
 h.advance(5000);w.emit({type:'ready'});h.advance(5999);assert.equal(h.isBusy(),true);
 h.advance(1);assert.equal((await result).method,'timeout');assert.equal(w.terminated,1);assert.equal(h.isBusy(),false);
});

test('a stalled download reports loading failure separately and permits a retry',async()=>{
 const h=harness(),result=h.check('0',{});
 h.advance(30000);assert.equal((await result).method,'load-timeout');assert.equal(h.isBusy(),false);
 const retry=h.check('0',{}),w=h.workers[1];w.emit({type:'ready'});w.emit({type:'result',result:{status:'correct'}});
 assert.equal((await retry).status,'correct');
});

test('blocked Worker construction and dependency failures release the submit button state',async()=>{
 const blocked=harness({constructorFails:true});
 assert.equal((await blocked.check('0',{})).method,'error');assert.equal(blocked.isBusy(),false);assert.equal(blocked.timers.size,0);
 const h=harness(),result=h.check('0',{});h.workers[0].emit({type:'load-error'});
 assert.equal((await result).method,'load-error');assert.equal(h.isBusy(),false);
});

test('loading and computation failures do not create practice records or eliminate a timed player',async()=>{
 for(const mode of [null,'knockout'])for(const method of ['load-timeout','load-error','error','timeout']){
  const practice={attempts:0},session=mode?{mode,finished:false}:null;
  let records=0,renders=0;
  const c={busy:false,active:{id:'q2'},state:{session},progress:()=>practice,$:()=>({value:'e^(2026*e^x)/2026'}),checkAnswer:async()=>({status:'inconclusive',method,message:'retry'}),save:()=>{},render:()=>renders++,recordAttempt:()=>records++,examRemaining:()=>30};
  vm.createContext(c);vm.runInContext(submit+';this.submit=submitAnswer;',c);
  await c.submit({preventDefault(){}});
  assert.equal(practice.attempts,0);assert.equal(records,0);assert.equal(renders,1);assert.equal(practice.feedback.method,method);
  if(session){assert.equal(session.finished,false);assert.equal(session.answers,undefined);}
 }
});

test('the second qualifier accepts nested exponential notations and rejects the missing exponent parentheses',()=>{
 const c={};vm.createContext(c);
 vm.runInContext(fs.readFileSync(path.join(root,'vendor/nerdamer.js'),'utf8'),c);
 vm.runInContext(fs.readFileSync(path.join(root,'verifier.js'),'utf8').replace(/export function/g,'function')+';this.verify=verifyAnswer;',c);
 const p={kind:'indefinite',integrand:'exp(2026*exp(x)+x)',answer:'exp(2026*exp(x))/2026',samples:[-10,-9,-8,-7,-6.5,-6]};
 for(const input of ['e^(2026*e^x)/2026','exp(2026*exp(x))/2026','e^(2026*exp(x))/2026'])assert.equal(c.verify(input,p).status,'correct');
 const missing=c.verify('(e^2026e^x)/2026',p);
 assert.equal(missing.status,'invalid');assert.match(missing.message,/指數括號/);
 assert.equal(c.verify('e^(2026*e^x)/2027',p).status,'incorrect');
});

test('Chinese keyboard characters preserve the fifth qualifier answer and the restricted arithmetic grammar',()=>{
 const c={};vm.createContext(c);
 vm.runInContext(fs.readFileSync(path.join(root,'vendor/nerdamer.js'),'utf8'),c);
 vm.runInContext(fs.readFileSync(path.join(root,'verifier.js'),'utf8').replace(/export function/g,'function')+';this.verify=verifyAnswer;this.normalize=normalizeInput;',c);
 const p={kind:'indefinite',integrand:'1/(sqrt(x+1)-sqrt(x-1))',answer:'((x+1)^(3/2)+(x-1)^(3/2))/3',samples:[1.2,1.7,2.3,3.4,5.1,8.2]};
 for(const input of ['（（x+1)^(3/2)+(x-1)^(3/2))/3','（（ｘ＋１）＾（３／２）＋（ｘ－１）＾（３／２））／３＋Ｃ'])assert.equal(c.verify(input,p).status,'correct');
 assert.equal(c.normalize('２ｘ＋ｓｉｎ（ｘ）'),'2*x+sin(x)');
 assert.equal(c.normalize('（x＋１）²'),'(x+1)^2');
 assert.equal(c.verify('ｄｉｆｆ（ｘ，ｘ）',p).status,'invalid');
 assert.equal(c.verify('ｃｏｎｓｔｒｕｃｔｏｒ（ｘ）',p).status,'invalid');
 assert.equal(c.verify('（x＋１',p).status,'invalid');
});
