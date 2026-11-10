const assert=require('node:assert/strict');
const A=require('../projects/hear-the-shape/audio.js');
const M=require('../projects/hear-the-shape/math.js');
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(let m=1;m<=3;m++){
 const hz=220*Math.sqrt((m*m/4+1)/1.25);
 near(A.pitch(M.eigenvalue(m)),hz);near(A.pitch(M.eigenvalue(m,1,2)),hz/2);
 near(A.pitch(M.eigenvalue(m))/A.visualFrequency(M.eigenvalue(m)),220/.42);
}
near(A.pitch(Math.PI**2*1.25),220);near(A.pitch(Math.PI**2*1.25/4),110);
assert.ok(Number.isNaN(A.pitch(-1)));assert.ok(Number.isNaN(A.pitch(Infinity)));
const instances=[];
class Param{
 constructor(){this.value=0;this.events=[]}
 setValueAtTime(v,t){this.value=v;this.events.push(['set',v,t])}
 linearRampToValueAtTime(v,t){this.value=v;this.events.push(['ramp',v,t])}
 setTargetAtTime(v,t,c){this.value=v;this.events.push(['target',v,t,c])}
 cancelAndHoldAtTime(t){this.events.push(['hold',t])}
}
class Context{
 constructor(){this.state='suspended';this.sampleRate=48000;this.currentTime=1;this.destination={};this.oscillators=[];this.gains=[];instances.push(this)}
 resume(){this.state='running';return Promise.resolve()}
 suspend(){this.state='suspended';return Promise.resolve()}
 createOscillator(){const o={frequency:new Param(),connect(){},disconnect(){},start(t){this.started=t},stop(t){this.stopped=t}};this.oscillators.push(o);return o}
 createGain(){const g={gain:new Param(),connect(){},disconnect(){}};this.gains.push(g);return g}
}
(async()=>{
 const engine=A.createEngine(Context),states=[];let interrupted=0;
 const one=engine.channel('one',{onChange:s=>states.push(s),onInterrupt:()=>interrupted++}),two=engine.channel('two');
 assert.equal(instances.length,0,'No audio context should be created on page load');
 await one.play(A.REFERENCE_EIGENVALUE);const ctx=instances[0];
 assert.equal(one.getState(),'audible');near(ctx.oscillators[0].frequency.value,220);assert.equal(ctx.oscillators[0].type,'sine');
 assert.deepEqual(ctx.gains[0].gain.events.slice(0,2),[['set',0,1],['ramp',.03,1.035]]);
 await one.play(A.REFERENCE_EIGENVALUE/4);near(ctx.oscillators[1].frequency.value,110);
 near(ctx.oscillators[0].stopped,1.035);assert.deepEqual(ctx.gains[0].gain.events.at(-1),['ramp',0,1.025]);
 await one.setEnabled(false);assert.equal(one.getState(),'muted');assert.ok(ctx.oscillators[1].stopped);
 await one.setEnabled(true);assert.equal(one.getState(),'audible');
 await one.setVolume(0);assert.equal(one.getState(),'muted');
 await one.setVolume(.5);assert.equal(one.getState(),'audible');near(ctx.gains.at(-1).gain.events[1][1],.06);
 await two.play(A.REFERENCE_EIGENVALUE);assert.equal(interrupted,1);assert.equal(one.getState(),'paused');
 one.stop();assert.equal(two.getState(),'audible','Stopping an inactive view must not stop the active view');
 ctx.state='suspended';ctx.onstatechange();assert.equal(two.getState(),'blocked');assert.ok(ctx.oscillators.at(-1).stopped);
 await two.play(A.REFERENCE_EIGENVALUE);assert.equal(two.getState(),'audible');
 engine.stopAll();assert.equal(two.getState(),'paused');assert.equal(ctx.state,'suspended');assert.ok(ctx.oscillators.every(o=>o.stopped));
 const silent=A.createEngine(null).channel('no-api');await silent.play(A.REFERENCE_EIGENVALUE);assert.equal(silent.getState(),'unsupported');
 class Blocked extends Context{resume(){return Promise.reject(new Error('blocked'))}}
 const blocked=A.createEngine(Blocked).channel('blocked');await blocked.play(A.REFERENCE_EIGENVALUE);assert.equal(blocked.getState(),'blocked');
 let resumePending;
 class Slow extends Context{resume(){return new Promise(resolve=>{resumePending=()=>{this.state='running';resolve()}})}}
 const race=A.createEngine(Slow).channel('race'),pending=race.play(A.REFERENCE_EIGENVALUE),slow=instances.at(-1);
 race.stop();resumePending();await pending;assert.equal(slow.oscillators.length,0,'Late resume must not restart a stopped voice');
 const range=A.createEngine(Context).channel('range');await range.play(A.REFERENCE_EIGENVALUE*10000);assert.equal(range.getState(),'range');assert.equal(instances.at(-1).oscillators.length,0);
 console.log('PASS: common eigenvalue-to-pitch scale and square-root ratios; octave size law; shared visual slowdown; lazy audio initialization; soft attack/release; mute and zero-volume recovery; exclusive playback; inactive stop isolation; page stop; unsupported and blocked contexts; stale-resume cancellation; out-of-range handling.');
})().catch(e=>{console.error(e);process.exitCode=1});
