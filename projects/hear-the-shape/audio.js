/* Single-mode sonification. One common pitch scale across all geometries;
   no drum samples, microphone access, uploads or automatic audio on page load. */
(function(root){
'use strict';
const REFERENCE_EIGENVALUE=1.25*Math.PI**2,REFERENCE_HZ=220,VISUAL_HZ=.42;
function pitch(eigenvalue){return Number.isFinite(eigenvalue)&&eigenvalue>0?REFERENCE_HZ*Math.sqrt(eigenvalue/REFERENCE_EIGENVALUE):NaN}
function visualFrequency(eigenvalue){return Number.isFinite(eigenvalue)&&eigenvalue>0?VISUAL_HZ*Math.sqrt(eigenvalue/REFERENCE_EIGENVALUE):NaN}
function createVoice(context,hz,level){
 const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
 oscillator.type='sine';oscillator.frequency.setValueAtTime(hz,now);
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level,now+.035);
 oscillator.connect(gain);gain.connect(context.destination);
 oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
 oscillator.start(now);return {oscillator,gain,level};
}
function hold(parameter,now){
 const value=parameter.value;
 if(parameter.cancelAndHoldAtTime)parameter.cancelAndHoldAtTime(now);
 else parameter.cancelScheduledValues(now);
 // An explicit anchor prevents the next ramp from starting at a previous event.
 parameter.setValueAtTime(value,now);
}
function releaseVoice(context,voice){
 const now=context.currentTime;
 hold(voice.gain.gain,now);voice.gain.gain.linearRampToValueAtTime(0,now+.025);voice.oscillator.stop(now+.035);
}
function createEngine(Context){
 let context=null,owner=null,voice=null,generation=0;
 const channels=new Map();
 function emit(channel,state){channel.state=state;if(channel.onChange)channel.onChange(state)}
 function retire(){
  if(!voice)return;const old=voice;voice=null;
  try{releaseVoice(context,old)}catch(e){try{old.oscillator.stop()}catch(ignore){}}
 }
 function interrupt(channel){channel.wantsPlay=false;emit(channel,'paused');if(channel.onInterrupt)channel.onInterrupt()}
 function stop(channel){
  channel.wantsPlay=false;
  if(owner===channel){++generation;retire();owner=null}
  emit(channel,'paused');
 }
 async function sound(channel){
  const token=++generation;retire();
  if(!channel.enabled||channel.volume===0){emit(channel,'muted');return}
  if(!Context){emit(channel,'unsupported');return}
  try{
   if(!context||context.state==='closed'){
    context=new Context();
    context.onstatechange=()=>{
     if(context.state!=='running'&&owner&&owner.wantsPlay&&owner.state==='audible'){
      const previous=owner;owner=null;++generation;retire();interrupt(previous);emit(previous,'blocked');
     }
    };
   }
   const hz=pitch(channel.eigenvalue);
   // Do not silently clamp or renormalize a shape's pitch to an audible range.
   if(!Number.isFinite(hz)||hz<30||hz>Math.min(16000,context.sampleRate*.45)){emit(channel,'range');return}
   emit(channel,'starting');
   if(context.state!=='running'){
    let timer;try{await Promise.race([context.resume(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Audio resume timed out')),2000)})])}finally{clearTimeout(timer)}
   }
   if(token!==generation||owner!==channel||!channel.wantsPlay)return;
   if(context.state!=='running'){emit(channel,'blocked');return}
   voice=createVoice(context,hz,.12*channel.volume);emit(channel,'audible');
  }catch(e){if(token===generation&&owner===channel)emit(channel,'blocked')}
 }
 function channel(id,options={}){
  if(channels.has(id))throw new Error('Duplicate audio channel');
  const c={enabled:true,volume:.25,eigenvalue:NaN,wantsPlay:false,state:'paused',onChange:options.onChange,onInterrupt:options.onInterrupt};
  const api={
   play(eigenvalue){
    if(!Number.isFinite(eigenvalue)||eigenvalue<=0){stop(c);emit(c,'range');return Promise.resolve()}
    if(owner&&owner!==c){const previous=owner;owner=null;++generation;retire();interrupt(previous)}
    owner=c;c.eigenvalue=eigenvalue;c.wantsPlay=true;return sound(c);
   },
   stop(){stop(c)},
   setEnabled(enabled){c.enabled=Boolean(enabled);if(c.wantsPlay&&owner===c)return sound(c);emit(c,'paused');return Promise.resolve()},
   setVolume(value){
    if(!Number.isFinite(value))return Promise.resolve();c.volume=Math.max(0,Math.min(1,value));
    if(c.wantsPlay&&owner===c){
     if(voice&&c.enabled&&c.volume>0){const now=context.currentTime;voice.level=.12*c.volume;hold(voice.gain.gain,now);voice.gain.gain.setTargetAtTime(voice.level,now,.015);emit(c,'audible')}
     else return sound(c);
    }return Promise.resolve();
   },
   getState(){return c.state}
  };
  channels.set(id,c);return api;
 }
 function stopAll(){const previous=owner;++generation;retire();owner=null;if(previous)interrupt(previous);if(context&&context.state==='running')context.suspend().catch(()=>{})}
 return {channel,stopAll};
}
const api={REFERENCE_EIGENVALUE,REFERENCE_HZ,VISUAL_HZ,pitch,visualFrequency,createVoice,releaseVoice,createEngine};
if(typeof module==='object'&&module.exports)module.exports=api;
else{
 const engine=createEngine(root.AudioContext||root.webkitAudioContext);
 root.DrumAudio={...api,...engine};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)engine.stopAll()});
 root.addEventListener('pagehide',engine.stopAll);root.addEventListener('beforeprint',engine.stopAll);
}
})(typeof globalThis!=='undefined'?globalThis:this);
