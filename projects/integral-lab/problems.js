import {REGULAR_SEASON_2026} from './regular-season-2026.js';
import {QUARTERFINAL_2026} from './quarterfinal-2026.js';
import {SEMIFINAL_2026,FINALS_2026} from './semifinal-finals-2026.js';
// Question statements and final answers checked against the MIT PDFs on 2026-11-04.
// Pedagogy (hints, steps, explanations) is original editorial material.
export const TECHNIQUES = {
  symmetry: '對稱性 · Symmetry', substitution: '換元法 · Substitution',
  algebra: '代數化簡 · Algebra', parts: '分部積分 · Integration by parts',
  trig: '三角恆等式 · Trig identities', series: '級數 · Series',
  geometry: '幾何面積 · Geometry', discrete: '分段與取整 · Piecewise / floor', advanced:'進階工具 · Advanced methods'
};
const testUrl = 'https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_test.pdf';
const answerUrl = 'https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_answers.pdf';
let stepSequence = 0;
// A fixed rotation prevents position-based guessing while keeping reproducible content.
const s = (prompt, options, correct, explanation) => {
  const rotation = stepSequence++ % options.length;
  return { prompt, options: options.slice(rotation).concat(options.slice(0, rotation)),
    correct: (correct - rotation + options.length) % options.length, explanation };
};
const rows = [
{
number:1,latex:String.raw`\int_{-\pi}^{\pi}\sin^{2025}(x)\cos^{2026}(x)\,dx`,kind:'definite',integrand:'sin(x)^2025*cos(x)^2026',answer:'0',answerLatex:'0',technique:'symmetry',difficulty:1,domain:'實數；對稱區間 [−π, π]。',
hints:['先觀察積分上下限，不必展開高次方。','把 $x$ 換成 $-x$，比較被積函數的正負。',String.raw`$\sin(x)$ 是奇函數，$\cos(x)$ 是偶函數。`],
steps:[s('把 x 換成 −x 後，被積函數變成？',['原函數的負值','原函數本身','與原函數無關'],0,'奇次的 sin 因子改變正負，偶次的 cos 因子不變。')],
solution:[String.raw`令 $f(x)=\sin^{2025}x\cos^{2026}x$，有 $f(-x)=-f(x)$。`,'奇函數在對稱區間上的積分互相抵消，因此答案為 $0$。'],mistakes:[{expr:'2*pi',message:'區間長度不能直接當面積；先檢查被積函數是否為奇函數。'}]
},
{
number:2,latex:String.raw`\int e^{2026e^x+x}\,dx`,kind:'indefinite',integrand:'exp(2026*exp(x)+x)',answer:'exp(2026*exp(x))/2026',answerLatex:String.raw`\frac{e^{2026e^x}}{2026}`,technique:'substitution',difficulty:2,domain:'所有實數。驗證採 x<−5 的點以避免指數溢出。',samples:[-10,-9,-8,-7,-6.5,-6],
hints:['先利用指數的加法法則拆開被積函數。','寫成 $e^{2026e^x}e^x$，尋找內層函數的導數。','可令 $u=2026e^x$；別忘記換元後的常數因子。'],
steps:[s('若 u=2026eˣ，du 是甚麼？',['2026eˣ dx','e^(2026eˣ) dx','2026 dx'],0,'鏈式法則給 du=2026eˣ dx。'),s('換元後的積分包含哪個常數因子？',['1/2026','2026','沒有常數因子'],0,'原題只有 eˣ dx，所以需要乘 1/2026。')],
solution:['由 $e^{2026e^x+x}=e^{2026e^x}e^x$，令 $u=2026e^x$。',String.raw`則 $du=2026e^x dx$，原積分為 $\frac1{2026}\int e^u du=\frac{e^{2026e^x}}{2026}+C$。`],mistakes:[{expr:'exp(2026*exp(x))',message:'你的形式抓到了內層，但微分會多出 2026；請補回換元的常數因子。'}]
},
{
number:3,latex:String.raw`\int_0^{2026}\left\{\frac{\lfloor x\rfloor}{3}\right\}\,dx`,kind:'definite',integrand:null,answer:'675',answerLatex:'675',technique:'discrete',difficulty:2,domain:'{t} 表示小數部分 t−⌊t⌋；不是集合括號。',
hints:['在每個單位區間 [n,n+1) 上，⌊x⌋ 都是常數。','把 n 按照除以 3 的餘數分組。',String.raw`三個相鄰單位區間上的函數值為 $0,\frac13,\frac23$。`],
steps:[s('一個長度為 3 的完整週期，其面積是多少？',['1','3/2','3'],0,'三個長度 1 的區間，函數值依次為 0、1/3、2/3；總面積為 1。')],
solution:[String.raw`對 $n=0,\ldots,2025$，在 $[n,n+1)$ 上函數值為 $\{n/3\}$。`,'前 2025 個單位區間構成 675 個週期，每個面積為 $0+1/3+2/3=1$。','最後 $[2025,2026]$ 的值幾乎處處為 0，因此總面積為 $675$。'],mistakes:[]
},
{
number:4,latex:String.raw`\int_{-1}^{1}\underbrace{|x+|x+|\cdots+|x+|x||\cdots|||}_{2026\text{ 個 }x}\,dx`,kind:'definite',integrand:null,answer:'1013',answerLatex:'1013',technique:'discrete',difficulty:2,domain:'從最內層 |x| 開始，共有 2026 個 x。',
hints:['把區間分成 x≥0 與 x<0，先看前三層。','x≥0 時，每多一層就再加一個 x。','x<0 時，偶數層與奇數層會交替出現兩種簡單值。'],
steps:[s('當 x<0，令 A₁=|x|，Aₙ=|x+Aₙ₋₁|。A₂ 等於？',['0','−2x','x'],0,'A₁=−x，因此 A₂=|x−x|=0；其後奇數層為 −x、偶數層為 0。')],
solution:[String.raw`設 $A_1=|x|$、$A_n=|x+A_{n-1}|$。對 $x\ge0$，$A_n=nx$。`,'對 $x<0$，$A_n$ 在 $-x$ 與 0 之間交替；2026 為偶數，所以 $A_{2026}=0$。',String.raw`原積分為 $\int_0^1 2026x\,dx=1013$。`],mistakes:[{expr:'2026',message:'正半軸上的圖形是三角形，面積不是矩形的 2026；負半軸又因偶數層而為 0。'}]
},
{
number:5,latex:String.raw`\int\frac{dx}{\sqrt{x+1}-\sqrt{x-1}}`,kind:'indefinite',integrand:'1/(sqrt(x+1)-sqrt(x-1))',answer:'((x+1)^(3/2)+(x-1)^(3/2))/3',answerLatex:String.raw`\frac{(x+1)^{3/2}+(x-1)^{3/2}}{3}`,technique:'algebra',difficulty:1,domain:'實數域 x≥1；微分驗證使用 x>1。',samples:[1.2,1.7,2.3,3.4,5.1,8.2],
hints:['分母是兩個根式的差，先做代數化簡。','分子分母同乘分母的共軛式。','共軛相乘後，分母變成 $(x+1)-(x-1)=2$。'],
steps:[s('有理化後的被積函數是？',['(√(x+1)+√(x−1))/2','√(2x)','(√(x+1)−√(x−1))/2'],0,'差平方給固定分母 2，而分子是兩個根式的和。')],
solution:[String.raw`分母有理化得 $\frac1{\sqrt{x+1}-\sqrt{x-1}}=\frac{\sqrt{x+1}+\sqrt{x-1}}2$。`,String.raw`逐項套用冪次積分公式，得到 $\frac13((x+1)^{3/2}+(x-1)^{3/2})+C$。`],mistakes:[{expr:'2*((x+1)^(3/2)+(x-1)^(3/2))/3',message:'有理化後的分母為 2；你似乎遺漏了這個 1/2 因子。'}]
},
{
number:6,latex:String.raw`\int\sqrt{1+\cosh(x)}\,dx`,kind:'indefinite',integrand:'sqrt(1+cosh(x))',answer:'2*sqrt(2)*sinh(x/2)',answerLatex:String.raw`2\sqrt2\sinh(x/2)`,technique:'trig',difficulty:2,domain:'所有實數；cosh(x/2)>0，所以開平方不引入分段符號。',samples:[-3.2,-1.4,-0.3,0.7,1.9,3.1],
hints:['這是雙曲函數，尋找 cosh 的半角恆等式。',String.raw`由 $\cosh x=2\cosh^2(x/2)-1$ 化簡根號。`,String.raw`注意 $\cosh(x/2)>0$，以及微分內層 x/2 的因子。`],
steps:[s('√(1+cosh x) 可以化為？',['√2 cosh(x/2)','2 sinh(x/2)','√2 sinh(x/2)'],0,'1+cosh x=2cosh²(x/2)，而 cosh 對實數恆正。')],
solution:[String.raw`利用 $1+\cosh x=2\cosh^2(x/2)$，被積函數為 $\sqrt2\cosh(x/2)$。`,String.raw`因此積分為 $2\sqrt2\sinh(x/2)+C$。`],mistakes:[{expr:'sqrt(2)*sinh(x/2)',message:'微分 sinh(x/2) 會多一個 1/2；你的原函數需要補上 2 倍。'}]
},
{
number:7,latex:String.raw`\int\frac{2^{\log(x)}}{x^2}\,dx`,kind:'indefinite',integrand:'2^log(x)/x^2',answer:'x^(log(2)-1)/(log(2)-1)',answerLatex:String.raw`\frac{x^{\log2-1}}{\log2-1}`,technique:'algebra',difficulty:2,domain:'x>0；本題 log 指自然對數。',samples:[0.2,0.5,0.9,1.6,2.7,4.3],
hints:['把常數底數的指數改寫成以 e 為底。',String.raw`利用 $2^{\log x}=e^{\log2\log x}=x^{\log2}$。`,'化成 x 的冪次後，套用 power rule，注意積分時指數要加 1。'],
steps:[s('把分母 x² 合併後，被積函數的冪次是多少？',['log 2 − 2','log 2 + 2','2 log x − 2'],0,'2^(log x)=x^(log 2)，再除以 x² 即減去 2。')],
solution:[String.raw`對 $x>0$，$2^{\log x}/x^2=x^{\log2-2}$。`,String.raw`所以積分為 $\frac{x^{\log2-1}}{\log2-1}+C$。`],mistakes:[{expr:'x^(log(2)-2)/(log(2)-2)',message:'冪次積分需要把指數加 1；分子指數與分母都應使用 log(2)−1。'}]
},
{
number:8,latex:String.raw`\int_0^{1/2}\left(\sum_{n=2}^{\infty}x^n\right)\,dx`,kind:'definite',integrand:null,answer:'log(2)-5/8',answerLatex:String.raw`\log2-\frac58`,technique:'series',difficulty:2,domain:'[0,1/2] 內級數一致收斂，可先求和或逐項積分。',
hints:['先辨認這是哪一類級數，留意起始指數 n=2。','幾何級數和為 $x^2/(1-x)$。','多項式除法可將其寫成 $-x-1+1/(1-x)$。'],
steps:[s('∑ₙ₌₂∞ xⁿ 的和是？',['x²/(1−x)','1/(1−x)','x/(1−x)'],0,'完整幾何級數扣掉 1 與 x，等於 x²/(1−x)。')],
solution:['在此閉區間上幾何級數一致收斂，和為 $x^2/(1-x)$。',String.raw`由 $x^2/(1-x)=-x-1+1/(1-x)$，原函數為 $-x^2/2-x-\log(1-x)$。`,String.raw`代入 0 與 1/2 得 $\log2-5/8$。`],mistakes:[{expr:'log(2)',message:'級數從 n=2 開始，必須扣除常數項與一次項的積分。'}]
},
{
number:9,latex:String.raw`\int x^2\sin(x)\,dx`,kind:'indefinite',integrand:'x^2*sin(x)',answer:'2*x*sin(x)-(x^2-2)*cos(x)',answerLatex:String.raw`2x\sin x-(x^2-2)\cos x`,technique:'parts',difficulty:2,domain:'所有實數。',samples:[-2.4,-1.1,-0.4,0.6,1.7,3.2],
hints:['多項式乘上三角函數，試著讓多項式的次數降低。','使用 integration by parts，令 u=x²、dv=sin x dx。','第一次分部後還有 x cos x，需要再做一次分部積分。'],
steps:[s('若 u=x²、dv=sin x dx，v 是？',['−cos x','cos x','−sin x'],0,'−cos x 的導數是 sin x。'),s('第一次分部後的餘項是？',['2∫x cos x dx','−2∫x cos x dx','∫x² cos x dx'],0,'uv−∫v du=−x²cos x+2∫x cos x dx。')],
solution:[String.raw`第一次分部：$I=-x^2\cos x+2\int x\cos x\,dx$。`,String.raw`第二次分部：$\int x\cos x\,dx=x\sin x+\cos x$。`,String.raw`合併為 $2x\sin x-(x^2-2)\cos x+C$。`],mistakes:[{expr:'-x^2*cos(x)',message:'這只是分部積分的 uv 項；微分後還有多餘項，請補上 −∫v du。'},{expr:'2*x*sin(x)-(x^2+2)*cos(x)',message:'第二次分部中 ∫sin x dx=−cos x，請再檢查最後 cos x 項的符號。'}]
},
{
number:10,latex:String.raw`\int\frac{(x-1)^2}{2e^x+x^2+1}\,dx`,kind:'indefinite',integrand:'(x-1)^2/(2*exp(x)+x^2+1)',answer:'x-log(2*exp(x)+x^2+1)',answerLatex:String.raw`x-\log(2e^x+x^2+1)`,technique:'algebra',difficulty:3,domain:'所有實數；分母嚴格為正。',samples:[-3,-1.3,-0.2,0.8,2.1,3.5],
hints:['直接換元可能不吻合；比較分母與它的導數。','設 D=2eˣ+x²+1，計算 D−D′。',String.raw`你會得到 $(x-1)^2=D-D\prime$，可拆成 1 減去對數導數。`],
steps:[s('若 D=2eˣ+x²+1，D−D′ 等於？',['(x−1)²','(x+1)²','x²−1'],0,'D′=2eˣ+2x，所以 D−D′=x²−2x+1。')],
solution:[String.raw`設 $D=2e^x+x^2+1$，則 $D-D\prime=(x-1)^2$。`,String.raw`因此被積函數為 $1-D\prime/D$，積分為 $x-\log(2e^x+x^2+1)+C$。`],mistakes:[{expr:'log(2*exp(x)+x^2+1)',message:'分子不是分母的導數。請比較 D 與 D′ 的差，再拆成 1−D′/D。'}]
},
{
number:11,latex:String.raw`\int_{-1}^{1}\max\left(0,\sqrt{1-x^2}-\frac12\right)\,dx`,kind:'definite',integrand:null,answer:'pi/3-sqrt(3)/4',answerLatex:String.raw`\frac\pi3-\frac{\sqrt3}{4}`,technique:'geometry',difficulty:2,domain:'max 只保留上半單位圓高於 y=1/2 的部分。',
hints:['先畫上半單位圓及水平線 y=1/2。',String.raw`解 $\sqrt{1-x^2}=1/2$，找出真正需要積分的區間。`,String.raw`兩端點是 $\pm\sqrt3/2$；可用圓弓形面積或標準原函數。`],
steps:[s('被積函數嚴格為正的 x 範圍是？',['|x|<√3/2','|x|<1/2','所有 −1<x<1'],0,'√(1−x²)>1/2 等價於 x²<3/4。')],
solution:[String.raw`正值區間為 $[-\sqrt3/2,\sqrt3/2]$，所以積分為此區間的上半圓面積減去高 1/2 的矩形。`,String.raw`利用 $\int\sqrt{1-x^2}dx=\frac12(x\sqrt{1-x^2}+\arcsin x)$。`,String.raw`代入後得到 $\pi/3-\sqrt3/4$。`],mistakes:[{expr:'pi/2-1',message:'max 會把負值截成 0，不能在整個 [−1,1] 直接減去高度 1/2 的矩形。'}]
},
{
number:12,latex:String.raw`\int_0^1\sqrt{x^2+x+\sqrt{x^2+x+\sqrt{\cdots}}}\,dx`,kind:'definite',integrand:null,answer:'3/2',answerLatex:String.raw`\frac32`,technique:'algebra',difficulty:2,domain:'以從 0 開始的有限巢狀根式極限定義；x=0 的值為 0，與正根分支的端點值不同，但不影響定積分。',
hints:['把整個無限巢狀根式記成 y，內層會再次出現 y。','對 x>0，y 滿足 $y^2=x^2+x+y$。','因式分解成 $(y-(x+1))(y+x)=0$，再用 y≥0 選分支。'],
steps:[s('對 0<x≤1，應選哪個分支？',['y=x+1','y=−x','y=x'],0,'根式非負，而 −x<0，因此選 y=x+1。')],
solution:[String.raw`對 $x>0$，從內層 0 迭代 $a_{n+1}=\sqrt{x^2+x+a_n}$，序列單調遞增且以上界 $x+1$ 有界，所以極限 $y\ge0$ 存在，並滿足 $y^2=x^2+x+y$。`,'解得 $y=x+1$ 或 $y=-x$；非負性排除後者。',String.raw`故積分為 $\int_0^1(x+1)dx=3/2$。以有限根式極限定義時，x=0 的特殊端點值不影響積分。`],mistakes:[{expr:'1/2',message:'平方後的方程還包含內層根式 y，不能只保留 x；請解 y²−y−x²−x=0。'}]
},
{
number:13,latex:String.raw`\int\left(\cos^5x-10\cos^3x\sin^2x+5\cos x\sin^4x\right)\,dx`,kind:'indefinite',integrand:'cos(x)^5-10*cos(x)^3*sin(x)^2+5*cos(x)*sin(x)^4',answer:'sin(5*x)/5',answerLatex:String.raw`\frac15\sin(5x)`,technique:'trig',difficulty:3,domain:'所有實數。',samples:[-1.7,-0.8,-0.2,0.3,0.9,1.8],
hints:['各項總次數都是 5；係數是否讓你想起熟悉的展開式？',String.raw`考慮 $(\cos x+i\sin x)^5$，只取偶數次的 i。`,'由 de Moivre 公式，這個實部就是 cos(5x)。'],
steps:[s('題目的被積函數是哪個多倍角函數？',['cos(5x)','sin(5x)','5cos x'],0,'展開 (cos x+i sin x)⁵ 的實部，正好得到題目三項。')],
solution:[String.raw`由 de Moivre 公式，題目三項之和為 $\operatorname{Re}(\cos x+i\sin x)^5=\cos(5x)$。`,String.raw`所以原積分為 $\sin(5x)/5+C$。`],mistakes:[{expr:'sin(5*x)',message:'辨認出五倍角很棒；但微分 sin(5x) 會多出 5，積分時要除以 5。'}]
},
{
number:14,latex:String.raw`\int\arctan(\sqrt{x})\,dx`,kind:'indefinite',integrand:'atan(sqrt(x))',answer:'(x+1)*atan(sqrt(x))-sqrt(x)',answerLatex:String.raw`(x+1)\arctan\sqrt{x}-\sqrt{x}`,technique:'parts',difficulty:2,domain:'x≥0；驗證使用 x>0。',samples:[0.15,0.4,0.9,1.7,3.2,6.1],
hints:['反三角函數獨立出現時，試著把它乘上 1 再分部。','令 u=arctan√x，dv=dx。求 du 時連用兩次 chain rule。',String.raw`餘項含 $\sqrt{x}/(1+x)$；令 t=√x 後可做除法。`],
steps:[s('arctan√x 的導數是？',['1/(2√x(1+x))','1/(1+x)','1/(2√x)'],0,'arctan t 的導數為 1/(1+t²)，再乘 t=√x 的導數 1/(2√x)。')],
solution:[String.raw`分部得 $I=x\arctan\sqrt{x}-\frac12\int\frac{\sqrt{x}}{1+x}dx$。`,String.raw`令 $t=\sqrt{x}$，餘項變成 $\int\frac{t^2}{1+t^2}dt=t-\arctan t$。`,String.raw`因此 $I=(x+1)\arctan\sqrt{x}-\sqrt{x}+C$。`],mistakes:[{expr:'x*atan(sqrt(x))',message:'這是分部的 uv 項；還需要減去 ∫v du，才能抵消乘積微分中的額外項。'}]
},
{
number:15,latex:String.raw`\int_0^{1000}\left(\lfloor\lceil x\rceil\rfloor+\lceil\lfloor x\rfloor\rceil+\lfloor\{x\}\rfloor+\{\lfloor x\rfloor\}+\lceil\{x\}\rceil+\{\lceil x\rceil\}\right)\,dx`,kind:'definite',integrand:null,answer:'1001000',answerLatex:'1001000',technique:'discrete',difficulty:3,domain:'⌊·⌋ 為 floor、⌈·⌉ 為 ceiling、{·} 為小數部分；整數點值不影響積分。',
hints:['在非整數的單位區間 n<x<n+1，寫 x=n+t，0<t<1。','整數的小數部分為 0；t 的 floor 是 0、ceiling 是 1。','六項相加後，在 (n,n+1) 上只剩 $2n+2$。'],
steps:[s('對 n<x<n+1，⌈{x}⌉ 等於？',['1','0','n+1'],0,'此時 0<{x}<1，因此 ceiling 等於 1。')],
solution:['在 $n<x<n+1$，六項依次為 $n+1,n,0,0,1,0$，總和 $2n+2$。',String.raw`對 $n=0,\ldots,999$ 求和，得到 $\sum(2n+2)=1000\cdot1001=1001000$。`,'整數點集合測度為 0，因此其個別函數值不改變積分。'],mistakes:[]
},
{
number:16,latex:String.raw`\int\sqrt{\frac{\cos x\cot x\csc x}{\sin x\tan x\sec x}}\,dx`,kind:'indefinite',integrand:'sqrt((cos(x)*cot(x)*csc(x))/(sin(x)*tan(x)*sec(x)))',answer:'-x-cot(x)',answerLatex:String.raw`-x-\cot x`,technique:'trig',difficulty:2,domain:'原式需 sin x≠0 且 cos x≠0；在每個連通定義域區間上取積分常數。√(cot⁴x)=cot²x，不是 cot x。',samples:[0.21,0.53,0.91,1.22,1.81,2.41],
hints:['先把 cot、csc、tan、sec 全寫成 sin 與 cos。',String.raw`根號內化簡成 $\cos^4x/\sin^4x=\cot^4x$。`,String.raw`實數平方根取非負值；$\sqrt{\cot^4x}=\cot^2x=\csc^2x-1$。`],
steps:[s('√(cot⁴x) 的正確化簡是？',['cot²x','cot x','|cot x|'],0,'cot⁴x=(cot²x)²，而 cot²x 已非負，所以開根後為 cot²x。')],
solution:[String.raw`在原式定義域內，根號內等於 $\cot^4x$，故被積函數為 $\cot^2x$。`,String.raw`由 $\cot^2x=\csc^2x-1$，積分為 $-\cot x-x+C$。`,'雖然化簡式可在 cos x=0 處延伸，原題在這些點仍未定義。'],mistakes:[{expr:'log(sin(x))',message:'你可能把 √(cot⁴x) 誤寫成 cot x；正確是 cot²x。'},{expr:'cot(x)-x',message:'cot x 的導數是 −csc²x，請檢查符號。'}]
},
{
number:17,latex:String.raw`\int_{-\infty}^{\infty}\frac{e^{-x^2}}{1+e^{2x}}\,dx`,kind:'definite',integrand:'exp(-x^2)/(1+exp(2*x))',answer:'sqrt(pi)/2',answerLatex:String.raw`\frac{\sqrt\pi}{2}`,technique:'symmetry',difficulty:3,domain:'廣義積分絕對收斂；使用 Gaussian integral ∫ℝ e^(−x²) dx=√π。',
hints:['高斯函數部分是偶函數；比較 f(x) 與 f(−x)。',String.raw`分母的 logistic 因子滿足 $\frac1{1+e^{2x}}+\frac1{1+e^{-2x}}=1$。`,'把積分與換元 x→−x 後的積分相加，會留下標準 Gaussian integral。'],
steps:[s('f(x)+f(−x) 化簡為？',['e^(−x²)','2e^(−x²)','0'],0,'兩個 logistic 權重之和為 1，而 Gaussian 因子不變。')],
solution:[String.raw`令原積分為 I，換元 $x\mapsto-x$ 後得到相同 I。`,String.raw`把兩式相加，利用 logistic 權重互補，得 $2I=\int_{-\infty}^{\infty}e^{-x^2}dx=\sqrt\pi$。`,String.raw`因此 $I=\sqrt\pi/2$。`],mistakes:[{expr:'sqrt(pi)',message:'對稱配對後得到的是 2I，最後還需要除以 2。'}]
},
{
number:18,latex:String.raw`\int\left(\frac{\sin^2x}{x^2}-\frac{\sin(2x)}x\right)\,dx`,kind:'indefinite',integrand:'sin(x)^2/x^2-sin(2*x)/x',answer:'-sin(x)^2/x',answerLatex:String.raw`-\frac{\sin^2x}{x}`,technique:'algebra',difficulty:3,domain:'原式 x≠0；可另取連續延伸，但驗證依照原題定義域。',samples:[-2.6,-1.3,-0.4,0.3,1.1,2.2],
hints:['試著反向使用 quotient rule；分母 x² 是線索。','sin(2x)=2sin x cos x，正是 sin²x 的導數。',String.raw`比較 $(\sin^2x/x)\prime$ 與題目的兩項及其符號。`],
steps:[s('sin²x 的導數是？',['sin(2x)','cos(2x)','2sin x'],0,'鏈式法則得到 2sin x cos x=sin(2x)。')],
solution:[String.raw`商法則給 $\left(\frac{\sin^2x}{x}\right)\prime=\frac{\sin(2x)}x-\frac{\sin^2x}{x^2}$。`,String.raw`原題正好是其負值，所以積分為 $-\sin^2x/x+C$。`],mistakes:[{expr:'sin(x)^2/x',message:'商法則會產生與原題相反的符號；請檢查整體負號。'}]
},
{
number:19,latex:String.raw`\int\frac{\log(\log x)\log(\log(\log x))}{x\log x}\,dx`,kind:'indefinite',integrand:'log(log(x))*log(log(log(x)))/(x*log(x))',answer:'log(log(x))^2*(2*log(log(log(x)))-1)/4',answerLatex:String.raw`\frac14\log^2(\log x)\left(2\log(\log(\log x))-1\right)`,technique:'substitution',difficulty:3,domain:'實數對數要求 x>e。',samples:[3.1,3.9,5.7,9.1,15.4,30.2],
hints:['分母 x log x 是某個巢狀對數的導數分母。',String.raw`令 $u=\log(\log x)$，便有 $du=dx/(x\log x)$。`,String.raw`剩下的是 $\int u\log u\,du$，再做一次分部積分。`],
steps:[s('u=log(log x) 後，原積分變成？',['∫u log u du','∫log u du','∫u² du'],0,'分子兩項分別是 u 與 log u，分母與 dx 正好構成 du。')],
solution:[String.raw`令 $u=\log(\log x)>0$，則原題為 $\int u\log u\,du$。`,String.raw`分部得 $\frac12u^2\log u-\frac14u^2+C$。`,String.raw`代回得到 $\frac14\log^2(\log x)(2\log(\log(\log x))-1)+C$。`],mistakes:[{expr:'log(log(x))^2*log(log(log(x)))/2',message:'分部積分還需要減去 ∫u/2 du；你只寫了 uv 項。'}]
},
{
number:20,latex:String.raw`\int_0^{\pi/2}\cos^2\!\left(\frac\pi2\cos^2\!\left(\frac\pi2\cos^2x\right)\right)\,dx`,kind:'definite',integrand:'cos(pi/2*cos(pi/2*cos(x)^2)^2)^2',answer:'pi/4',answerLatex:String.raw`\frac\pi4`,technique:'symmetry',difficulty:3,domain:'[0,π/2]；保留原題三層 cos² 結構。',
hints:['不要展開巢狀三角函數；試試 x→π/2−x。','最內層 cos²x 會變成 1−cos²x；觀察此變換怎樣逐層傳播。','對 h(t)=cos²(πt/2)，有 h(1−t)=1−h(t)。'],
steps:[s('若 f 是題目的被積函數，f(x)+f(π/2−x) 等於？',['1','0','2cos²x'],0,'每一層 h 都保留互補關係，最後兩個值仍相加為 1。')],
solution:[String.raw`設 $h(t)=\cos^2(\pi t/2)$，則 $h(1-t)=1-h(t)$。`,String.raw`題目為 $f(x)=h(h(\cos^2x))$；由 $\cos^2(\pi/2-x)=1-\cos^2x$，得 $f(\pi/2-x)=1-f(x)$。`,String.raw`配對積分得 $2I=\int_0^{\pi/2}1dx=\pi/2$，故 $I=\pi/4$。`],mistakes:[{expr:'pi/2',message:'對稱配對得到的是 2I，而不是 I；最後還要除以 2。'}]
}
];
export const PROBLEMS = rows.map(p => ({id:`mit-2026-${String(p.number).padStart(2,'0')}`,origin:'archive',round:'qualifier',roundLabel:'Qualifier',timeSeconds:null,year:2026,page:p.number<=10?1:2,verifiedAt:'2026-11-04',testUrl,answerUrl,samples:[],...p,answerPage:p.number<=10?1:2,sourceLabel:`2026 Qualifier · #${String(p.number).padStart(2,'0')}`} ));
PROBLEMS.push(...REGULAR_SEASON_2026,...QUARTERFINAL_2026,...SEMIFINAL_2026,...FINALS_2026);
const original = [
{
number:1,latex:String.raw`\int_0^1 x(1-x^2)^5\,dx`,kind:'definite',integrand:'x*(1-x^2)^5',answer:'1/12',answerLatex:String.raw`\frac1{12}`,technique:'substitution',difficulty:1,domain:'[0,1]；本網站原創練習，非 MIT 歷屆題。',
hints:['內層 1−x² 的導數與外面的 x 成比例。','令 u=1−x²，注意積分上下限反向。',String.raw`換元後是 $\frac12\int_0^1u^5du$。`],steps:[s('u=1−x² 時，x dx 等於？',['−du/2','du/2','−2du'],0,'du=−2x dx，所以 x dx=−du/2。')],solution:['令 $u=1-x^2$，則 $du=-2x dx$，上下限由 1 到 0。',String.raw`原積分為 $\frac12\int_0^1u^5du=1/12$。`],mistakes:[{expr:'1/6',message:'換元還有 1/2 因子，來自 du=−2x dx。'}]
},
{
number:2,latex:String.raw`\int x e^x\,dx`,kind:'indefinite',integrand:'x*exp(x)',answer:'(x-1)*exp(x)',answerLatex:String.raw`(x-1)e^x`,technique:'parts',difficulty:1,domain:'所有實數；本網站原創練習，非 MIT 歷屆題。',samples:[-2.1,-1,-0.2,0.7,1.5,2.3],
hints:['讓多項式 x 微分後變簡單。','令 u=x，dv=eˣ dx。',String.raw`依照 $\int u\,dv=uv-\int v\,du$，別忘記餘項。`],steps:[s('分部後的餘項是哪個？',['−∫eˣ dx','+∫eˣ dx','−∫xeˣ dx'],0,'du=dx，v=eˣ，所以 uv−∫v du=xeˣ−∫eˣ dx。')],solution:['取 $u=x$、$dv=e^x dx$，則 $du=dx$、$v=e^x$。','原積分為 $xe^x-e^x+C=(x-1)e^x+C$。'],mistakes:[{expr:'x*exp(x)',message:'這只是 uv 項；還要減去 eˣ 以抵消微分多出的一項。'}]
},
{
number:3,latex:String.raw`\int_{-2}^2\frac{x^3}{1+x^2}\,dx`,kind:'definite',integrand:'x^3/(1+x^2)',answer:'0',answerLatex:'0',technique:'symmetry',difficulty:1,domain:'所有實數；本網站原創練習，非 MIT 歷屆題。',
hints:['先檢查區間是否對稱。','分子是奇函數，分母是非零的偶函數。','比較 f(x) 與 f(−x)，判斷正負半軸面積。'],steps:[s('f(−x) 與 f(x) 的關係是？',['f(−x)=−f(x)','f(−x)=f(x)','沒有固定關係'],0,'奇函數除以非零偶函數仍是奇函數。')],solution:['$f(x)=x^3/(1+x^2)$ 滿足 $f(-x)=-f(x)$。','對稱區間上正負抵消，所以積分為 $0$。'],mistakes:[]
},
{
number:4,latex:String.raw`\int\frac{2x}{1+x^2}\,dx`,kind:'indefinite',integrand:'2*x/(1+x^2)',answer:'log(1+x^2)',answerLatex:String.raw`\log(1+x^2)`,technique:'substitution',difficulty:1,domain:'所有實數；1+x²>0。本網站原創練習，非 MIT 歷屆題。',samples:[-3,-1.3,-0.4,0.6,1.7,3.4],
hints:['比較分子與分母的導數。','設 u=1+x²，便有 du=2x dx。',String.raw`換元後積分是 $\int du/u$。`],steps:[s('分子 2x 是哪個函數的導數？',['1+x²','log(1+x²)','x²/2'],0,'分母的導數正好是分子，這是 logarithmic derivative。')],solution:['令 $u=1+x^2$，$du=2x dx$。',String.raw`積分為 $\log|u|+C=\log(1+x^2)+C$，因為 u>0。`],mistakes:[{expr:'atan(x)',message:'arctan x 的導數只有 1/(1+x²)；題目還有分子 2x，應使用換元。'}]
}
];
PROBLEMS.push(...original.map(p=>({id:`original-${p.number}`,origin:'original',round:'original',year:null,page:null,verifiedAt:null,testUrl:null,answerUrl:null,samples:[],...p})));
