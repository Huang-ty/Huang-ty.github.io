'use strict';
importScripts('forward-math.js?v=20261110');
self.onmessage=function(event){
 const {polygon,quality,requestId}=event.data;
 try{
  const result=self.DrumForwardMath.solvePolygon(polygon,{quality,count:6,onProgress:progress=>self.postMessage({type:'progress',requestId,...progress})});
  self.postMessage({type:'result',requestId,result});
 }catch(error){self.postMessage({type:'error',requestId,code:error.code||'solver'})}
};
