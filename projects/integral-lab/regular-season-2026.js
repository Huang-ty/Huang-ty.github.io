// Official problem/answer slides visually checked on 2026-11-04.
const url='https://math.mit.edu/~yyao1/pdf/2026_regular_season.pdf';
let seq=0;
const s=(prompt,options,correct,explanation)=>{const r=seq++%options.length;return {prompt,options:options.slice(r).concat(options.slice(0,r)),correct:(correct-r+options.length)%options.length,explanation};};
const rows=[
{
number:1,latex:String.raw`\int_0^{2026}\left(\sum_{k=0}^{\infty}\frac{x^{2026k+2025}}{k!}\right)dx`,kind:'definite',integrand:null,answer:'(exp(2026^2026)-1)/2026',answerLatex:String.raw`\frac{e^{2026^{2026}}-1}{2026}`,verification:'huge-exponential',answerInputHelp:'保留精確指數式，例如 exp(...)；這題不可展開成小數。',technique:'series',difficulty:2,domain:'非負項級數；結果極大，請以精確指數式作答。',
hints:['先把與 k 無關的 x 次方提出，不必逐項計算上下限。',String.raw`把級數寫成 $x^{2025}\sum_{k\ge0}(x^{2026})^k/k!$。`,'認出指數級數後，找 x²⁰²⁶ 的導數。'],
steps:[s('指數級數求和後，被積函數為？',['x²⁰²⁵ exp(x²⁰²⁶)','exp(x²⁰²⁵)','2026 exp(x²⁰²⁶)'],0,'exp(t)=Σtᵏ/k!，這裡 t=x²⁰²⁶。')],
solution:[String.raw`級數為 $x^{2025}e^{x^{2026}}$；非負項允許以單調收斂處理積分。`,String.raw`令 $u=x^{2026}$，則 $du=2026x^{2025}dx$。`,String.raw`所以積分為 $\frac1{2026}[e^u]_0^{2026^{2026}}=(e^{2026^{2026}}-1)/2026$。`],mistakes:[]
},
{
number:2,latex:String.raw`\int_0^{\log34}\left(2+\frac1{2e^x-1}+\frac1{3e^x-1}\right)dx`,kind:'definite',integrand:'2+1/(2*exp(x)-1)+1/(3*exp(x)-1)',answer:'log(6767/2)',answerLatex:String.raw`\log\frac{6767}{2}`,technique:'algebra',difficulty:2,domain:'x∈[0,log34]，兩個分母均為正。',
hints:['把常數 2 分別配給兩個分式。','對常數 a，化簡 1+1/(aeˣ−1)。','它是 log(aeˣ−1) 的導數；最後一起處理端點。'],
steps:[s('1+1/(aeˣ−1) 等於哪個對數導數？',['d/dx log(aeˣ−1)','d/dx log(eˣ−a)','d/dx log(aeˣ+1)'],0,'1+1/(aeˣ−1)=aeˣ/(aeˣ−1)。')],
solution:[String.raw`原函數為 $\log(2e^x-1)+\log(3e^x-1)$。`,String.raw`在上端 $e^x=34$，兩因子為 67 與 101；下端兩因子為 1 與 2。`,String.raw`故答案是 $\log((67\cdot101)/2)=\log(6767/2)$。`],mistakes:[{expr:'log(6767)',message:'上端乘積正確；別漏掉 x=0 時的乘積 1×2。'}]
},
{
number:3,latex:String.raw`\int_0^{1/2}\left(\cos(\pi x)-\pi\left(\frac14-x^2\right)\left(\frac54-x^2\right)\right)dx`,kind:'definite',integrand:'cos(pi*x)-pi*(1/4-x^2)*(5/4-x^2)',answer:'1/pi-pi/10',answerLatex:String.raw`\frac1\pi-\frac\pi{10}`,technique:'algebra',difficulty:1,domain:'普通連續函數；可分開積分。',
hints:['先把三角項與多項式項拆開。','將兩個二次式相乘，整理成偶次冪。',String.raw`乘積為 $5/16-(3/2)x^2+x^4$。`],
steps:[s('∫₀¹ᐟ² cos(πx)dx 等於？',['1/π','1','π'],0,'原函數 sin(πx)/π，在 x=1/2 時 sin=1。')],
solution:[String.raw`三角項積分是 $1/\pi$。`,String.raw`多項式乘積為 $5/16-(3/2)x^2+x^4$，在 [0,1/2] 積分為 $5/32-1/16+1/160=1/10$。`,String.raw`乘回 $\pi$ 並相減，得到 $1/\pi-\pi/10$。`],mistakes:[{expr:'1/pi+pi/10',message:'多項式的積分為正，但題目在它前面有負號。'}]
},
{
number:4,latex:String.raw`\int_{\int_{\int_{\int_0^1 x\,dx}^{1}x\,dx}^{1}x\,dx}^{\int_0^{\int_0^{\int_0^1x\,dx}x\,dx}x\,dx}x\,dx`,kind:'definite',integrand:null,answer:'-189/2048',answerLatex:String.raw`-\frac{189}{2048}`,technique:'algebra',difficulty:2,domain:'由最內層向外計算；外層積分上限小於下限。',
hints:['每個內層積分都只是在產生一個數字。','把上限鏈與下限鏈分開，從 ∫₀¹x dx 開始。','上限鏈反覆用 t↦t²/2；下限鏈反覆用 t↦(1−t²)/2。'],
steps:[s('最內層 ∫₀¹x dx 為 1/2；再計算 ∫₀¹ᐟ²x dx 得？',['1/8','1/4','3/8'],0,'積分為 t²/2，代入 t=1/2 得 1/8。')],
solution:[String.raw`上限鏈為 $1/2\to1/8\to1/128$。`,String.raw`下限鏈為 $1/2\to3/8\to55/128$。`,String.raw`最外層為 $\frac12[(1/128)^2-(55/128)^2]=-189/2048$，上限較小所以結果為負。`],mistakes:[{expr:'189/2048',message:'數值大小正確，但最外層積分方向是從 55/128 到 1/128，因此須為負。'}]
},
{
number:5,latex:String.raw`\int\frac{4x^2-1}{x^2(x^2-1)}dx`,kind:'indefinite',integrand:'(4*x^2-1)/(x^2*(x^2-1))',answer:'-1/x+3*log(abs((x-1)/(x+1)))/2',answerLatex:String.raw`-\frac1x+\frac32\log\left|\frac{x-1}{x+1}\right|`,officialAnswerLatex:String.raw`-\frac1x+\frac32\log\left(\frac{x-1}{x+1}\right)`,technique:'algebra',difficulty:2,domain:'實數 x≠−1,0,1；以各連通區間為域。官方對數省略絕對值，本站補上實數域所需的 |·|。',samples:[-3,-1.8,-0.5,0.4,1.8,3.2],
hints:['這是有理函數，先做部分分式分解。','先用 1/x² 與 1/(x²−1) 作兩個部分。',String.raw`你會得到 $1/x^2+3/(x^2-1)$，後者再拆為一次因子。`],
steps:[s('4x²−1 除以 x²(x²−1) 可以拆為？',['1/x²+3/(x²−1)','−1/x²+3/(x²−1)','1/x²+1/(x²−1)'],0,'通分分子為 (x²−1)+3x²=4x²−1。')],
solution:[String.raw`分解為 $x^{-2}+3/(x^2-1)$。`,String.raw`又有 $1/(x^2-1)=\frac12(1/(x-1)-1/(x+1))$。`,String.raw`積分為 $-1/x+\frac32\log|(x-1)/(x+1)|+C$。官方省略絕對值的形式可直接用於 |x|>1；加絕對值後涵蓋其他實數連通區間。`],mistakes:[{expr:'1/x+3*log(abs((x-1)/(x+1)))/2',message:'∫x⁻²dx=−x⁻¹，第一項的負號要保留。'}]
},
{
number:6,latex:String.raw`\int\frac{dx}{27x-x^{-1/3}}`,kind:'indefinite',integrand:'1/(27*x-x^(-1/3))',answer:'log(abs(27*x^(4/3)-1))/36',answerLatex:String.raw`\frac1{36}\log|27x^{4/3}-1|`,officialAnswerLatex:String.raw`\frac1{36}\log(27x^{4/3}-1)`,technique:'substitution',difficulty:2,domain:'本站驗證選 x>0、x≠3⁻⁹ᐟ⁴；官方省略的對數絕對值已補上。負 x 若以實立方根解讀可另分域處理，未納入自動驗證。',samples:[0.01,0.03,0.2,0.5,1.3,3],
hints:['先把分母中的負分數次方移走。','分子分母同乘 x¹ᐟ³，再看新分母的導數。','新分母 27x⁴ᐟ³−1 的導數是 36x¹ᐟ³。'],
steps:[s('分子分母同乘 x¹ᐟ³ 後，分子為？',['x¹ᐟ³ dx','x⁴ᐟ³ dx','27x¹ᐟ³ dx'],0,'得到 x¹ᐟ³ dx/(27x⁴ᐟ³−1)，正好差一個 36 的對數導數。')],
solution:[String.raw`原式寫成 $x^{1/3}dx/(27x^{4/3}-1)$。`,String.raw`令 $u=27x^{4/3}-1$，則 $du=36x^{1/3}dx$。`,String.raw`積分為 $\log|u|/36+C$。絕對值讓 x>0 的極點兩側皆可取實原函數。`],mistakes:[{expr:'log(abs(27*x^(4/3)-1))/27',message:'分母微分時還要乘 4/3，所以係數是 27×4/3=36。'}]
},
{
number:7,latex:String.raw`\int\frac{2\sqrt x+1}{\sqrt{x^2+x\sqrt x}}dx`,kind:'indefinite',integrand:'(2*sqrt(x)+1)/sqrt(x^2+x*sqrt(x))',answer:'4*sqrt(x+sqrt(x))',answerLatex:String.raw`4\sqrt{x+\sqrt x}`,technique:'substitution',difficulty:2,domain:'x>0；根式與分母皆取正值。',samples:[0.1,0.4,0.9,1.7,3.4,7],
hints:['根號內可提出一個 x，再看看分子的結構。','將分母寫成 √x · √(x+√x)。','令 u=x+√x；du=(1+1/(2√x))dx。'],
steps:[s('先提出 √x 後，被積函數可寫成？',['2(1+1/(2√x))/√(x+√x)','(2√x+1)/√(x+√x)','2/√x'],0,'2√x+1 除以 √x 得 2+1/√x，正好是 u′ 的兩倍。')],
solution:[String.raw`對 $x>0$，$\sqrt{x^2+x\sqrt x}=\sqrt x\sqrt{x+\sqrt x}$。`,String.raw`令 $u=x+\sqrt x$，原積分成為 $2\int u^{-1/2}du$。`,String.raw`故答案是 $4\sqrt{x+\sqrt x}+C$。`],mistakes:[{expr:'2*sqrt(x+sqrt(x))',message:'化簡後是 2∫u⁻¹ᐟ²du，還要再乘冪次積分帶來的 2。'}]
},
{
number:8,latex:String.raw`\int\frac{e^x}{e^{2x}-e^{-2x}}dx`,kind:'indefinite',integrand:'exp(x)/(exp(2*x)-exp(-2*x))',answer:'atan(exp(x))/2+log(abs((exp(x)-1)/(exp(x)+1)))/4',answerLatex:String.raw`\frac12\arctan(e^x)+\frac14\log\left|\frac{e^x-1}{e^x+1}\right|`,officialAnswerLatex:String.raw`\frac12(\arctan(e^x)-\operatorname{arctanh}(e^x))`,technique:'algebra',difficulty:3,domain:'實數 x≠0。官方 arctanh(eˣ) 形式在 x<0 為實數；本站以絕對值對數提供兩側的實原函數。',samples:[-2.3,-1.1,-0.3,0.4,1.2,2.1],
hints:['指數看似複雜，但令 t=eˣ 後會成為有理函數。','dt=eˣdx，分式變為 t²/(t⁴−1)。','分解為 1/[2(t²−1)]+1/[2(t²+1)]。'],
steps:[s('換元 t=eˣ 後，應積分哪個有理函數？',['t²/(t⁴−1)','t/(t⁴−1)','1/(t⁴−1)'],0,'dt 吸收分子 eˣdx，再同乘 t² 清除分母的 t⁻²。')],
solution:[String.raw`令 $t=e^x>0$，原積分為 $\int t^2/(t^4-1)dt$。`,String.raw`分解後為 $\frac12\int(1/(t^2-1)+1/(t^2+1))dt$。`,String.raw`故實原函數為 $\frac14\log|(t-1)/(t+1)|+\frac12\arctan t+C$。在 t<1 時，這與官方的 $\frac12(\arctan t-\operatorname{arctanh}t)$ 相同。`],mistakes:[]
},
{
number:9,latex:String.raw`\int_0^\pi\frac{|\sin x+\sin2x+\sin3x+\sin4x|}{\sin x+\sin2x+\sin3x+\sin4x}dx`,kind:'definite',integrand:null,answer:'2*pi/5',answerLatex:String.raw`\frac{2\pi}{5}`,technique:'trig',difficulty:3,domain:'被積函數在分母零點可任意補值，有限個點不改變定積分。',
hints:['|S|/S 只記錄 S 的正負，不需要 S 的大小。','把四個正弦配對，用和差化積找出零點。','S=4sin(5x/2)cos x cos(x/2)，而 cos(x/2) 在 (0,π) 為正。'],
steps:[s('|S|/S 在 S<0 的區間上等於？',['−1','1','0'],0,'|S|=−S，因此比值為 −1；積分等於正區間總長減負區間總長。')],
solution:[String.raw`和差化積得 $S=4\sin(5x/2)\cos x\cos(x/2)$。`,'內部變號點為 2π/5、π/2、4π/5，四段符號依次為 +、−、+、−。',String.raw`正區間總長 $2\pi/5+3\pi/10=7\pi/10$，負區間長 $\pi/10+\pi/5=3\pi/10$，相減為 $2\pi/5$。`],mistakes:[{expr:'pi',message:'絕對值只在分子，分母保留原符號，因此被積函數不是恆等於 1。'}]
},
{
number:10,latex:String.raw`\int_0^1\frac{1-x}{\sqrt{e^{2x}-x^2}}dx`,kind:'definite',integrand:'(1-x)/sqrt(exp(2*x)-x^2)',answer:'asin(1/e)',answerLatex:String.raw`\arcsin(1/e)`,technique:'substitution',difficulty:2,domain:'x∈[0,1]，根號正且 x e⁻ˣ∈[0,1/e]。',
hints:['從根號提出 eˣ，再找一個含 x 與指數的換元。','根號變為 eˣ√(1−(xe⁻ˣ)²)。','令 u=xe⁻ˣ，du=(1−x)e⁻ˣdx。'],
steps:[s('xe⁻ˣ 的導數為？',['(1−x)e⁻ˣ','(1+x)e⁻ˣ','−xe⁻ˣ'],0,'套用 product rule：e⁻ˣ−xe⁻ˣ。')],
solution:[String.raw`將分母寫為 $e^x\sqrt{1-(xe^{-x})^2}$。`,String.raw`令 $u=xe^{-x}$，上下限為 0 與 1/e，得到 $\int_0^{1/e}(1-u^2)^{-1/2}du$。`,String.raw`所以答案是 $\arcsin(1/e)$。`],mistakes:[{expr:'pi/2',message:'換元後的上限不是 1；x=1 時 u=1/e。'}]
},
{
number:11,latex:String.raw`\int_0^{2026}\left\{x+\frac12\left\lfloor\frac x2\right\rfloor+\frac13\left\lfloor\frac x3\right\rfloor+\frac14\left\lfloor\frac x4\right\rfloor+\cdots\right\}dx`,kind:'definite',integrand:null,answer:'1013',answerLatex:'1013',technique:'discrete',difficulty:3,domain:'外層 {·} 表小數部分。每個固定 x 的取整和只有有限個非零項。',
hints:['在 [m,m+1) 上，所有 floor(x/n) 都是常數。','寫 x=m+t，0≤t<1；取整和只提供一個固定的平移。','不論常數 c 是多少，∫₀¹{t+c}dt=1/2。'],
steps:[s('對固定常數 c，小數部分函數 {t+c} 在任意完整長度 1 上的積分是？',['1/2','c','1'],0,'它是週期 1 的鋸齒，平移不改變一個完整週期的平均值。')],
solution:[String.raw`在 $[m,m+1)$ 上，各 $\lfloor x/n\rfloor$ 固定，故外層為 $\{t+c_m\}$。`,String.raw`由小數部分的週期性，每個單位區間的積分皆為 $1/2$。`,String.raw`共 2026 個單位區間，總積分 $2026/2=1013$。`],mistakes:[]
},
{
number:12,latex:String.raw`\int_{1/2}^2\frac{x^8}{x^8-x^6+x^4-x^2+1}dx`,kind:'definite',integrand:'x^8/(x^8-x^6+x^4-x^2+1)',answer:'3/2',answerLatex:String.raw`\frac32`,technique:'symmetry',difficulty:3,domain:'正區間；分母 D=(x¹⁰+1)/(x²+1)>0。',
hints:['上下限互為倒數，可以嘗試 x↦1/x。','將原積分與倒數換元後的版本相加。','若分母記為 D，相加的分子為 x⁸+x⁻²；利用 (x²+1)D=x¹⁰+1。'],
steps:[s('倒數換元後，分式 f(1/x)/x² 等於？',['1/(x²D(x))','1/D(x)','x²/D(x)'],0,'分母有反序對稱：D(1/x)=D(x)/x⁸，再乘換元 Jacobian 1/x²。')],
solution:[String.raw`令 $D=x^8-x^6+x^4-x^2+1$。以 $x=1/t$ 換元，$I=\int_{1/2}^2 1/(x^2D)dx$。`,String.raw`相加得 $2I=\int_{1/2}^2(x^8+x^{-2})/D\,dx=\int_{1/2}^2(1+x^{-2})dx$。`,String.raw`右端是 $[x-1/x]_{1/2}^{2}=3$，故 $I=3/2$。`],mistakes:[{expr:'3',message:'相加後算到的是 2I，最後還要除以 2。'}]
},
{
number:13,latex:String.raw`\int(\operatorname{arcsinh}x)^2dx`,kind:'indefinite',integrand:'asinh(x)^2',answer:'x*asinh(x)^2-2*asinh(x)*sqrt(1+x^2)+2*x',answerLatex:String.raw`x(\operatorname{arcsinh}x)^2-2\operatorname{arcsinh}x\sqrt{1+x^2}+2x`,technique:'parts',difficulty:2,domain:'所有實數；arcsinh 亦可輸入 asinh。',samples:[-3,-1.3,-0.2,0.4,1.6,3.1],
hints:['反雙曲函數的平方適合分部積分。','先取 u=(arcsinh x)²、dv=dx。','剩下的積分包含 x/√(1+x²)，這是 √(1+x²) 的導數。'],
steps:[s('arcsinh x 的導數為？',['1/√(1+x²)','1/(1+x²)','1/√(1−x²)'],0,'反雙曲正弦的導數為 1/√(1+x²)，不要與 arcsin 混淆。')],
solution:[String.raw`分部積分得 $x(\operatorname{arcsinh}x)^2-2\int x\operatorname{arcsinh}x/\sqrt{1+x^2}\,dx$。`,String.raw`剩餘積分再以 $u=\operatorname{arcsinh}x$、$dv=x/\sqrt{1+x^2}dx$ 分部積分，得到 $\operatorname{arcsinh}x\sqrt{1+x^2}-x$。`,String.raw`代回即得 $x(\operatorname{arcsinh}x)^2-2\operatorname{arcsinh}x\sqrt{1+x^2}+2x+C$。`],mistakes:[]
},
{
number:14,latex:String.raw`\int\cos^2(2026x)\cos(1013x)dx`,kind:'indefinite',integrand:'cos(2026*x)^2*cos(1013*x)',answer:'sin(1013*x)/2026+sin(3039*x)/12156+sin(5065*x)/20260',answerLatex:String.raw`\frac{\sin(1013x)}{2026}+\frac{\sin(3039x)}{12156}+\frac{\sin(5065x)}{20260}`,technique:'trig',difficulty:2,domain:'所有實數；數值驗證採小 x 避免大頻率的取樣誤差。',samples:[0.0001,0.0003,0.0007,0.0011,0.0017,0.0023],
hints:['先對平方因子降冪，再做積化和差。','cos²(2026x)=(1+cos(4052x))/2。','乘 cos(1013x) 後會出現頻率 1013、3039、5065。'],
steps:[s('cos(4052x)cos(1013x) 化為？',['[cos(3039x)+cos(5065x)]/2','cos(5065x)','[cos(3039x)−cos(5065x)]/2'],0,'cos A cos B=[cos(A−B)+cos(A+B)]/2。')],
solution:[String.raw`被積函數化為 $\frac12\cos(1013x)+\frac14\cos(3039x)+\frac14\cos(5065x)$。`,String.raw`逐項積分並除以各頻率，得到 $\sin(1013x)/2026+\sin(3039x)/12156+\sin(5065x)/20260+C$。`],mistakes:[]
},
{
number:15,latex:String.raw`\int e^x\arcsin(\tanh x)dx`,kind:'indefinite',integrand:'exp(x)*asin(tanh(x))',answer:'exp(x)*asin(tanh(x))-log(exp(2*x)+1)',answerLatex:String.raw`e^x\arcsin(\tanh x)-\log(e^{2x}+1)`,technique:'parts',difficulty:3,domain:'所有有限實數；tanh x∈(−1,1)，本題取實主分支。',samples:[-2,-1,-0.2,0.4,1.2,2],
hints:['把反三角函數留給微分，指數留給積分。','先算 d/dx arcsin(tanh x)，利用 1−tanh²x=sech²x。','導數是 sech x；剩下 eˣ sech x=2e²ˣ/(1+e²ˣ)。'],
steps:[s('對實數 x，arcsin(tanh x) 的導數為？',['sech x','cosh x','tanh x'],0,'sech²x/√(1−tanh²x)=sech x，因 cosh x>0。')],
solution:[String.raw`取 $u=\arcsin(\tanh x)$、$dv=e^xdx$；有 $du=\operatorname{sech}x\,dx$。`,String.raw`分部積分後減去 $\int e^x\operatorname{sech}x\,dx=\int2e^{2x}/(1+e^{2x})dx=\log(1+e^{2x})$。`,String.raw`因此答案是 $e^x\arcsin(\tanh x)-\log(1+e^{2x})+C$。`],mistakes:[]
},
{
number:16,latex:String.raw`\int\frac{x((1-x^2)\cos x+2x\sin x)}{(1+x^2)^2}dx`,kind:'indefinite',integrand:'x*((1-x^2)*cos(x)+2*x*sin(x))/(1+x^2)^2',answer:'-(cos(x)+x*sin(x))/(1+x^2)',answerLatex:String.raw`-\frac{\cos x+x\sin x}{1+x^2}`,technique:'algebra',difficulty:3,domain:'所有實數；分母始終為正。',samples:[-3,-1.3,-0.3,0.6,1.5,3.4],
hints:['分母是某個簡單函數的平方，留意商數微分。','試著把分子看成 N′D−ND′ 的組合，D=1+x²。','cos x+x sin x 的導數非常簡短；先算一遍。'],
steps:[s('N=cos x+x sin x 的導數為？',['x cos x','2sin x+x cos x','−x cos x'],0,'−sin x 與 product rule 的 +sin x 抵消，剩下 x cos x。')],
solution:[String.raw`令 $N=\cos x+x\sin x$、$D=1+x^2$，則 $N\prime=x\cos x$、$D\prime=2x$。`,String.raw`微分 $-N/D$ 得 $(-x\cos x(1+x^2)+2x(\cos x+x\sin x))/(1+x^2)^2$。`,String.raw`整理分子即為題目，因此原函數是 $-(\cos x+x\sin x)/(1+x^2)+C$。`],mistakes:[{expr:'(cos(x)+x*sin(x))/(1+x^2)',message:'商數結構辨認正確，但它的導數恰好與題目相反；需要整體負號。'}]
},
{
number:17,latex:String.raw`\int_0^1\sin((x-1)(5x-1))\sin(x(3x-2))dx`,kind:'definite',integrand:'sin((x-1)*(5*x-1))*sin(x*(3*x-2))',answer:'0',answerLatex:'0',technique:'symmetry',difficulty:3,domain:'普通連續函數；抵消來自積化和差與不同尺度的換元。',
hints:['兩個正弦的乘積，可先用積化和差。','兩個相位的差與和分別是 2(x−1)²−1、2(2x−1)²−1。','比較 ∫₀¹cos(2(x−1)²−1)dx 與 ∫₀¹cos(2(2x−1)²−1)dx。'],
steps:[s('sin A sin B 應化為哪一式？',['[cos(A−B)−cos(A+B)]/2','[cos(A−B)+cos(A+B)]/2','sin(A−B)/2'],0,'積化和差的兩項之間是減號；後續用換元比較兩個積分。')],
solution:[String.raw`令 $h(t)=\cos(2t^2-1)$，積化和差把原式變成 $\frac12\int_0^1(h(x-1)-h(2x-1))dx$。`,String.raw`h 是偶函數，所以第一項積分為 $\int_0^1h(t)dt$。`,String.raw`第二項以 $t=2x-1$ 換元為 $\frac12\int_{-1}^{1}h(t)dt=\int_0^1h(t)dt$；兩者相消，結果為 0。`],mistakes:[]
},
{
number:18,latex:String.raw`\int_{1/4}^{\sqrt2}\frac{dx}{x\left(x^{x^{x^{\cdot^{\cdot^\cdot}}}}\log x-1\right)}`,kind:'definite',integrand:null,answer:'-3/2',answerLatex:String.raw`-\frac32`,technique:'substitution',difficulty:3,domain:'無限冪塔取有限冪塔的吸引極限 T=xᵀ；本區間位於正實冪塔的收斂範圍。',
hints:['先把整座無限冪塔記為 T(x)，再寫出自相似關係。','有 T=xᵀ，因此 log T=T log x；對 x 隱微分。','隱微分可得到 integrand=−T′/T²，這是 1/T 的導數。'],
steps:[s('由 log T=T log x 隱微分後，哪一式正確？',['T′/T=T′ log x+T/x','T′/T=T/x','T′=T/x'],0,'右端 T 與 log x 都依賴 x，必須用 product rule。')],
solution:[String.raw`取收斂冪塔的分支 $T=x^T$，在本區間有 $T<e$；兩端分別是 $T(1/4)=1/2$、$T(\sqrt2)=2$。`,String.raw`由 $\log T=T\log x$ 得 $T\prime=T^2/[x(1-T\log x)]$，故原式為 $-T\prime/T^2=(1/T)\prime$。`,String.raw`結果為 $[1/T]_{1/4}^{\sqrt2}=1/2-2=-3/2$。須取有限冪塔的吸引極限，不可任選固定點。`],mistakes:[{expr:'3/2',message:'由隱微分得到的是 −T′/T²，亦即 (1/T)′；上下限代入後為 1/2−2。'}]
},
{
number:19,latex:String.raw`\int_0^1\frac{1+((2026+2x-x^2)^2-2)(2026+4x-4x^2)^2}{(2025+2x-x^2)(2027+2x-x^2)(2025+4x-4x^2)(2027+4x-4x^2)}dx`,kind:'definite',integrand:null,answer:'1',answerLatex:'1',technique:'symmetry',difficulty:3,domain:'分母在 [0,1] 嚴格為正；可將重複二次式分別記為 A、B。',
hints:['先替兩個重複出現的二次式取名字。','設 A=2026+2x−x²、B=2026+4x−4x²，把被積函數減去 1 再整理。','得到 1/(B²−1)−1/(A²−1)，而 B(x)=A(2x)、A(2−t)=A(t)。'],
steps:[s('若 A=2026+2x−x²，B=2026+4x−4x²，分母等於？',['(A²−1)(B²−1)','A²B²−1','(A−1)(B−1)'],0,'兩組相差 2 的因子各自是 (A−1)(A+1) 與 (B−1)(B+1)。')],
solution:[String.raw`設 $A(x)=2026+2x-x^2$、$B(x)=A(2x)$。分式可寫成 $1+1/(B^2-1)-1/(A^2-1)$。`,String.raw`令 $g(t)=1/(A(t)^2-1)$；由 $A(2-t)=A(t)$，得 $g(2-t)=g(t)$。`,String.raw`故 $\int_0^1g(2x)dx=\frac12\int_0^2g(t)dt=\int_0^1g(t)dt$；非定值部分相消，只留下 $\int_0^1 1dx=1$。`],mistakes:[]
},
{
number:20,latex:String.raw`\int_{1/2}^1 4^{x-1}\left(1+4^{4^{x-1}-1}\left(1+4^{4^{4^{x-1}-1}-1}(1+\cdots)\right)\right)dx`,kind:'definite',integrand:null,answer:'1/(2*(log(4)-1))',answerLatex:String.raw`\frac1{2(\log4-1)}`,technique:'series',difficulty:3,domain:'巢狀式取非負有限展開的極限。x<1 收斂，x=1 發散；定積分按反常積分／單調收斂解讀。',
hints:['令 g(x)=4ˣ⁻¹，逐層巢狀式可寫成乘積級數。','第 n 項是 g(x)g(g(x))⋯g⁽ⁿ⁾(x)，它與第 n 次迭代的導數有關。','(g⁽ⁿ⁾)′=(log4)ⁿ∏ₖ₌₁ⁿg⁽ᵏ⁾；且 g(1/2)=1/2、g(1)=1。'],
steps:[s('若 g(x)=4ˣ⁻¹，g′(x) 等於？',['(log4)g(x)','4g(x)','g(x)/(log4)'],0,'對 aˣ 微分需乘 log a；反覆用 chain rule 會產生 (log4)ⁿ。')],
solution:[String.raw`令 $g(x)=4^{x-1}$、$g^{\circ n}$ 表 n 次迭代。巢狀式展開為 $\sum_{n\ge1}\prod_{k=1}^n g^{\circ k}(x)$，每項非負。`,String.raw`由 chain rule，乘積為 $(g^{\circ n})\prime/(\log4)^n$。端點均為 g 的固定點，因此每項積分是 $(1-1/2)/(\log4)^n$。`,String.raw`單調收斂允許逐項積分，得到 $\frac12\sum_{n\ge1}(\log4)^{-n}=1/[2(\log4-1)]$。`,String.raw`在 x=1 的展開項皆為 1，故該端點發散；以上是有限展開極限的可積函數／反常積分，不宣稱整個閉區間逐點有限。`],mistakes:[{expr:'1/(log(4)-1)',message:'每項迭代函數的端點差是 1−1/2=1/2，別漏掉這個因子。'}]
}
];
export const REGULAR_SEASON_2026=rows.map(p=>({
 ...p,sourceNote:({5:'官方對數未加絕對值；本站提供在各實數連通定義域有效的形式。',6:'官方對數省略絕對值；本站選 x>0 的實數驗證域並補上 |·|。',8:'官方 arctanh(eˣ) 在 x<0 是實數；本站另給 x≠0 兩側有效的實對數形式。',18:'無限冪塔採有限冪塔的吸引極限，不以任意方程固定點替代。',20:'巢狀式採非負有限展開的極限；x=1 發散，積分按反常積分解讀。'})[p.number],id:`mit-2026-regular-${String(p.number).padStart(2,'0')}`,origin:'archive',year:2026,
 round:'regular',roundLabel:'Regular Season',timeSeconds:120,
 sourceLabel:`2026 Regular Season · #${String(p.number).padStart(2,'0')}`,
 page:2*p.number,answerPage:2*p.number+1,testUrl:url,answerUrl:url,verifiedAt:'2026-11-04'
}));
