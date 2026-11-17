importScripts('./vendor/nerdamer.js');
self.onmessage=async({data})=>{
 try{const {verifyAnswer}=await import('./verifier.js'); self.postMessage(verifyAnswer(data.input,data.problem));}
 catch{self.postMessage({status:'inconclusive',method:'error',message:'暫時無法完成驗證。請簡化輸入後重試；這次不記為答錯。'});}
};
