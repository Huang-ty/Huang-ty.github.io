// Announce readiness only after both dependencies have finished loading.
// The main thread starts its six-second computation budget at this point.
try{
 importScripts('./vendor/nerdamer.js');
 import('./verifier.js?v=20261117c').then(({verifyAnswer})=>{
  self.onmessage=({data})=>{
   try{self.postMessage({type:'result',result:verifyAnswer(data.input,data.problem)});}
   catch{self.postMessage({type:'result',result:{status:'inconclusive',method:'error',message:'暫時無法完成驗證；這次不計入作答或學習紀錄，請重試。'}});}
  };
  self.postMessage({type:'ready'});
 }).catch(()=>self.postMessage({type:'load-error'}));
}catch{self.postMessage({type:'load-error'});}
