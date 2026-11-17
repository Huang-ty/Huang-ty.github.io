/* Local-only answer checking. Load vendor/nerdamer.js as a classic script first.
 * A numeric sample match is never treated as proof for an antiderivative.
 * The caller should run this module in a disposable Worker with a time budget.
 */
const FUNCTIONS = new Set(['sin','cos','tan','sec','csc','cot','asin','acos','atan','sinh','cosh','tanh','asinh','acosh','atanh','sqrt','exp','log','abs']);
const ALIASES = {arcsinh:'asinh',arccosh:'acosh',arctanh:'atanh',ln:'log',arcsin:'asin',arccos:'acos',arctan:'atan',PI:'pi',Pi:'pi',E:'e'};
const SAMPLE_DEFAULT = [0.217,0.463,0.791,1.127,1.619,2.173];
const fail = (message) => { throw new Error(message); };

/** Normalize a deliberately small arithmetic language; never accepts JS or CAS commands. */
export function normalizeInput(input) {
  if(typeof input !== 'string' || !input.trim()) fail('請先輸入你的答案。');
  // Chinese keyboards may mix full-width ASCII with ordinary parentheses.
  // Map only that block: broad Unicode normalization would turn x² into x2.
  let raw = input.trim().replace(/[\uFF01-\uFF5E]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0))
    .replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/²/g,'^2').replace(/³/g,'^3');
  if(raw.length>320) fail('算式太長；請化簡至 320 個字元內再驗證。');
  // An arbitrary constant is accepted only as a trailing additive term.
  raw=raw.replace(/[+-]\s*[Cc]\s*$/,'');
  if(!raw.trim()) fail('請輸入一個函數；積分常數可以省略。');
  if(!/^[\da-zA-Z+\-*/^().\s]+$/.test(raw)) fail('請用一般算式：*、/、^、括號及 sin(x)、log(x) 等函數；不接受等號或 LaTeX。');
  const tokens=[];
  let i=0,depth=0,ops=0;
  while(i<raw.length){
    if(/\s/.test(raw[i])){i++;continue;}
    const rest=raw.slice(i);
    const number=rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if(number){
      if(number[0].length>24 || !Number.isFinite(Number(number[0]))) fail('數字太大；請用簡潔的分數或指數式。');
      tokens.push({type:'number',value:number[0]});i+=number[0].length;continue;
    }
    const name=rest.match(/^[a-zA-Z]+/);
    if(name){
      const word=ALIASES[name[0]] || name[0];
      if(!FUNCTIONS.has(word) && !['x','e','pi'].includes(word)) fail('只支援變數 x、常數 pi / e，以及列出的初等函數；積分常數可在結尾寫 +C。');
      tokens.push({type:FUNCTIONS.has(word)?'function':'symbol',value:word});i+=name[0].length;continue;
    }
    const char=raw[i++];
    if(char==='('){depth++;if(depth>16) fail('括號層數太多；請先化簡算式。');}
    if(char===')'){depth--;if(depth<0)fail('括號未配對。');}
    if('+-*/^'.includes(char)){ops++;if(ops>72)fail('運算太複雜；請先化簡算式。');}
    tokens.push({type:char,value:char});
  }
  if(depth!==0)fail('括號未配對。');
  if(tokens.length>150)fail('算式太複雜；請先化簡。');
  let output='';
  for(let j=0;j<tokens.length;j++){
    const t=tokens[j],prev=tokens[j-1],next=tokens[j+1];
    if(t.type==='function' && next?.type!=='(')fail('函數後面需要括號，例如 sin(x)，而非 sin x。');
    if(prev && ['number','symbol',')'].includes(prev.type) && ['number','symbol','function','('].includes(t.type)) output+='*';
    output+=t.value;
  }
  // Huge exponent towers can consume the whole CAS time budget without teaching anything.
  if(/\^\s*\d{6,}/.test(output) || (output.match(/\^/g)||[]).length>14)fail('指數運算太大；請先化簡。');
  return output;
}

function cas(){
  const n=globalThis.nerdamer;
  if(typeof n!=='function')throw new Error('符號運算引擎未載入；請重新整理後再試。');
  return n;
}
// Independent dual-number evaluator. This is deliberately separate from the
// CAS: Nerdamer 1.x has known chain-rule/evaluation defects for some forms.
// Automatic differentiation here provides counterexamples and a sanity guard;
// agreement at finitely many points is still never proof of a function identity.
function parseArithmetic(source){
  const text=normalizeInput(source),tokens=text.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[a-zA-Z]+|[()+\-*/^]/g)||[];
  let pos=0;
  const prec={'+':10,'-':10,'*':20,'/':20,'^':30};
  function parse(min=0){
    const token=tokens[pos++];let left;
    if(token==='+'||token==='-')left={op:'unary'+token,a:parse(25)};
    else if(token==='('){left=parse();if(tokens[pos++]!==')')throw Error('parenthesis');}
    else if(FUNCTIONS.has(token)){if(tokens[pos++]!=='(')throw Error('function');left={op:token,a:parse()};if(tokens[pos++]!==')')throw Error('parenthesis');}
    else if(token==='x'||token==='pi'||token==='e')left={op:token};
    else if(token && Number.isFinite(Number(token)))left={op:'number',v:Number(token),raw:token};
    else throw Error('token');
    while(prec[tokens[pos]]>=min){const op=tokens[pos++],p=prec[op];left={op,a:left,b:parse(p+(op==='^'?0:1))};}
    return left;
  }
  const tree=parse();if(pos!==tokens.length)throw Error('tokens');return tree;
}
function compileArithmetic(source){
  const tree=parseArithmetic(source);
  const hasX=node=>node.op==='x'||!!(node.a&&hasX(node.a))||!!(node.b&&hasX(node.b));
  function calc(node,x){
    if(node.op==='number')return {v:node.v,d:0};
    if(node.op==='x')return {v:x,d:1};
    if(node.op==='pi')return {v:Math.PI,d:0};
    if(node.op==='e')return {v:Math.E,d:0};
    const a=calc(node.a,x),b=node.b?calc(node.b,x):null;
    switch(node.op){
      case'unary+':return a;case'unary-':return{v:-a.v,d:-a.d};
      case'+':return{v:a.v+b.v,d:a.d+b.d};case'-':return{v:a.v-b.v,d:a.d-b.d};
      case'*':return{v:a.v*b.v,d:a.d*b.v+a.v*b.d};case'/':return{v:a.v/b.v,d:(a.d*b.v-a.v*b.d)/(b.v*b.v)};
      case'^':{const v=Math.pow(a.v,b.v);return{v,d:b.d===0?(b.v===0||(!hasX(node.a)&&a.d===0)?0:b.v*Math.pow(a.v,b.v-1)*a.d):v*(b.d*Math.log(a.v)+b.v*a.d/a.v)};}
      case'sin':return{v:Math.sin(a.v),d:Math.cos(a.v)*a.d};
      case'cos':return{v:Math.cos(a.v),d:-Math.sin(a.v)*a.d};
      case'tan':return{v:Math.tan(a.v),d:a.d/Math.cos(a.v)**2};
      case'cot':return{v:1/Math.tan(a.v),d:-a.d/Math.sin(a.v)**2};
      case'sec':return{v:1/Math.cos(a.v),d:a.d*Math.tan(a.v)/Math.cos(a.v)};
      case'csc':return{v:1/Math.sin(a.v),d:-a.d/(Math.sin(a.v)*Math.tan(a.v))};
      case'asin':return{v:Math.asin(a.v),d:!hasX(node.a)&&a.d===0?0:a.d/Math.sqrt(1-a.v*a.v)};
      case'acos':return{v:Math.acos(a.v),d:!hasX(node.a)&&a.d===0?0:-a.d/Math.sqrt(1-a.v*a.v)};
      case'atan':return{v:Math.atan(a.v),d:a.d/(1+a.v*a.v)};
      case'sinh':return{v:Math.sinh(a.v),d:a.d*Math.cosh(a.v)};
      case'cosh':return{v:Math.cosh(a.v),d:a.d*Math.sinh(a.v)};
      case'tanh':return{v:Math.tanh(a.v),d:a.d/Math.cosh(a.v)**2};
      case'asinh':return{v:Math.asinh(a.v),d:a.d/Math.sqrt(1+a.v*a.v)};
      case'acosh':return{v:Math.acosh(a.v),d:!hasX(node.a)&&a.d===0?0:a.d/Math.sqrt(a.v*a.v-1)};
      case'atanh':return{v:Math.atanh(a.v),d:a.d/(1-a.v*a.v)};
      case'sqrt':return{v:Math.sqrt(a.v),d:!hasX(node.a)&&a.d===0?0:a.d/(2*Math.sqrt(a.v))};
      case'exp':return{v:Math.exp(a.v),d:a.d*Math.exp(a.v)};
      case'log':return{v:Math.log(a.v),d:a.d/a.v};
      case'abs':return{v:Math.abs(a.v),d:a.v===0?(hasX(node.a)?NaN:0):Math.sign(a.v)*a.d};
      default:throw Error('unsupported');
    }
  }
  return x=>calc(tree,x);
}
function scalar(expression,values={}){
  const n=cas();
  const e=typeof expression==='string'?n(expression):expression;
  const value=e.evaluate(values).text('decimals');
  // parseFloat would accept "1+2*i" or leave undeclared variables unnoticed.
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value))return NaN;
  return Number(value);
}
function isZero(expression){
  const n=cas();
  let e=n(expression);
  if(e.text()==='0')return true;
  e=e.simplify();
  if(e.text()==='0')return true;
  // Avoid expanding a large power such as (1-x^2025)^2026.
  const text=e.text();
  if(text.length<1400 && !/\^\(?-?\d{2,}/.test(text))return n.expand(text).simplify().text()==='0';
  return false;
}
function diagnostic(input,p,derivative,validSamples,independentRatios){
  const n=cas();
  for(const mistake of (p.mistakes || [])){
    try{
      if(input===normalizeInput(mistake.expr))return mistake.message;
    }catch{}
  }
  if(independentRatios || (derivative && p.integrand)){
    try{
      const ratios=independentRatios || validSamples.map(x=>{
        const f=scalar(p.integrand,{x});return Math.abs(f)>1e-7?scalar(derivative,{x})/f:NaN;
      }).filter(Number.isFinite);
      if(ratios.length>=3 && ratios.every(v=>Math.abs(v-ratios[0])<1e-6*(1+Math.abs(v)))){
        const ratio=ratios[0];
        if(Math.abs(ratio+1)<1e-6)return '導數的正負號剛好相反。檢查三角函數的導數或換元時的負號。';
        if(Math.abs(ratio)>1e-8 && Math.abs(ratio-1)>1e-5)return '你的導數與題目相差一個固定倍數。檢查 chain rule（鏈鎖律）或換元的係數。';
      }
    }catch{}
  }
  return p.kind==='definite'?'這個數值還不相符。檢查換元後的上下限，以及是否漏算端點。':'微分後還原不了被積函數。檢查 product rule、chain rule 與負號，再試一次。';
}

// A single archived value exceeds floating range by many orders of magnitude.
// Keep exp(2026^2026) as an exact indeterminate before invoking the CAS.
function verifyHugeExponential(normalized){
 try{
  const tree=parseArithmetic(normalized);
  const exponent=t=>t?.op==='^'&&t.a?.op==='number'&&t.a.v===2026&&t.b?.op==='number'&&t.b.v===2026;
  const render=t=>{
   if((t.op==='exp'&&exponent(t.a))||(t.op==='^'&&t.a?.op==='e'&&exponent(t.b)))return 'z';
   if(t.op==='number')return t.raw;
   if(t.op==='unary+'||t.op==='unary-')return `(${t.op.slice(-1)}${render(t.a)})`;
   if(['+','-','*','/'].includes(t.op)){const a=render(t.a),b=render(t.b);if(t.op==='/'&&isZero(b))throw Error('zero denominator');return `(${a}${t.op}${b})`;}
   if(t.op==='^'&&t.b?.op==='number'&&Number.isInteger(t.b.v)&&Math.abs(t.b.v)<=16)return `(${render(t.a)}^${t.b.v})`;
   throw Error('unsupported exact form');
  };
  const abstract=render(tree),n=cas(),candidate=n(abstract);
  if(candidate.variables().some(v=>v!=='z'))throw Error('variable');
  if(isZero(`(${abstract})-(z-1)/2026`))return {status:'correct',method:'symbolic-large',message:'正確！已保留巨大指數為精確符號，驗證代數等值；未使用浮點近似。'};
  return {status:'incorrect',method:'symbolic-large',message:'這個精確式還不相符。檢查換元的常數因子與上下限，保留指數形式再試。'};
 }catch{return {status:'inconclusive',method:'symbolic-large',message:'此題的值超出浮點範圍。請用 exp(2026^2026) 或 e^(2026^2026) 保留巨大指數項，其餘部分用分數及四則運算；目前尚未證實。'};}
}

/** Returns a structured result; numeric agreement alone is provisional for functions. */
export function verifyAnswer(input,problem){
  if(problem.kind==='definite' && typeof input==='string' && /[+\-−]\s*[Cc]\s*$/.test(input))return {status:'invalid',method:'syntax',message:'定積分是固定數值，不需要也不能附加積分常數 +C。'};
  let normalized;
  try{normalized=normalizeInput(input);}catch(error){return {status:'invalid',method:'syntax',message:error.message};}
  if(problem.verification==='huge-exponential')return verifyHugeExponential(normalized);
  let n,expression;
  try{
    n=cas();expression=n(normalized);
    if(expression.variables().some(v=>v!=='x'))return {status:'invalid',method:'syntax',message:'答案只可使用變數 x；積分常數可省略。'};
  }catch(error){return {status:'invalid',method:'syntax',message:'無法讀取這個算式。請檢查括號、乘號與函數名稱。'};}
  if(problem.kind==='definite'){
    try{
      if(expression.variables().length)return {status:'invalid',method:'syntax',message:'定積分需要一個常數答案，不能含有 x。'};
      const value=compileArithmetic(normalized)(0).v,expected=compileArithmetic(problem.answer)(0).v;
      if(!Number.isFinite(value) || !Number.isFinite(expected))return {status:'invalid',method:'domain',message:'答案必須是有限的實數；請檢查根號、對數與分母。'};
      if(isZero(`(${normalized})-(${problem.answer})`))return {status:'correct',method:'symbolic',message:'正確！你的結果與核對答案在符號上相等。'};
      const tolerance=1e-10+1e-8*Math.abs(expected);
      if(Math.abs(value-expected)<=tolerance)return {status:'correct',method:'numeric',message:'數值正確（近似比較；絕對容差 10⁻¹⁰ + 相對容差 10⁻⁸）。精確分數或根式更適合比賽。'};
      return {status:'incorrect',method:'numeric',message:diagnostic(normalized,problem,null,[])};
    }catch(error){return {status:'inconclusive',method:'unsupported',message:'引擎暫時無法核對這個形式。請改寫為較簡單的常數式再試。'};}
  }
  let derivative,referenceDerivative;
  const samples=Array.isArray(problem.samples)&&problem.samples.length?problem.samples:SAMPLE_DEFAULT;
  try{
    const independent=compileArithmetic(normalized),reference=compileArithmetic(problem.integrand || problem.answer);
    const candidateSamples=samples.map(x=>({x,actual:independent(x),expected:reference(x)}));
    const validSamples=candidateSamples.filter(s=>Number.isFinite(problem.integrand?s.expected.v:s.expected.d));
    if(validSamples.length<3)return {status:'inconclusive',method:'domain',message:'此題的有效定義域取樣不足，暫時無法自動核對。請保留答案並參考解題步驟。'};
    if(validSamples.some(s=>!Number.isFinite(s.actual.v)||!Number.isFinite(s.actual.d)))return {status:'invalid',method:'domain',message:'你的答案在驗證點無法得到有限實數，可能是定義域問題或數值溢出。請檢查 log、根號、分母與指數括號；指數含乘法或加法時，請寫成 e^(2*x) 這類形式。'};
    const mismatches=validSamples.filter(s=>Math.abs(s.actual.d-(problem.integrand?s.expected.v:s.expected.d))>1e-8*(1+Math.abs(problem.integrand?s.expected.v:s.expected.d)));
    if(mismatches.length){
      const ratios=validSamples.map(s=>{const f=problem.integrand?s.expected.v:s.expected.d;return Math.abs(f)>1e-7?s.actual.d/f:NaN;}).filter(Number.isFinite);
      return {status:'incorrect',method:'derivative-numeric',message:diagnostic(normalized,problem,null,[],ratios)};
    }
    // Cancel the reference before differentiating: abs/log branches may be
    // valid on the declared domain but beyond the CAS chain-rule support.
    const difference=n(`(${normalized})-(${problem.answer})`);
    if(!difference.variables().includes('x'))return {status:'correct',method:'symbolic',message:'正確！已核對定義域內的導數，並符號驗證你的原函數與核對答案只差常數。'};
    derivative=n.diff(normalized,'x').text();
    referenceDerivative=problem.integrand || n.diff(problem.answer,'x').text();
    const residual=`(${derivative})-(${referenceDerivative})`;
    if(isZero(residual))return {status:'correct',method:'symbolic',message:'正確！已以符號微分驗證 F′(x) 等於被積函數。積分常數 +C 可省略；等式採本題所列定義域。'};
    // Differentiating the difference often preserves cancellation that a trig
    // simplifier cannot discover after separate differentiation.
    if(problem.answer && isZero(n.diff(`(${normalized})-(${problem.answer})`,'x').text()))return {status:'correct',method:'symbolic',message:'正確！已符號驗證你的答案與核對原函數只差常數（採本題所列定義域）。'};
    // Independent derivatives agree; a CAS disagreement is not a reason to
    // mark the learner wrong. Retain the answer as unproven instead.
    return {status:'inconclusive',method:'numeric-only',message:'多個定義域內的微分取樣相符，但尚未完成符號證明，因此暫不計為答對。請化簡後重試，或完成引導步驟核對。'};
  }catch(error){
    return {status:'inconclusive',method:'unsupported',message:'這個形式超出目前符號引擎的核對能力。請化簡或改寫後再試；這次不判錯。'};
  }
}
