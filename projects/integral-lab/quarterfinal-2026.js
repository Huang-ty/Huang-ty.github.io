// All 12 used quarterfinal integrals, including the published tiebreaker.
// Problem and final-answer slides visually checked against the official MIT PDF.
const url='https://math.mit.edu/~yyao1/pdf/2026_quarterfinal.pdf';
let stepSequence=0;
const step=(prompt,options,correct,explanation)=>{const k=stepSequence++%options.length;return {prompt,options:options.slice(k).concat(options.slice(0,k)),correct:(correct-k+options.length)%options.length,explanation};};
const rows=[
{
match:1,number:1,page:2,answerPage:3,latex:String.raw`\int\frac{\sin x+\cos x}{\sqrt{25\sin^2x+16\cos^2x}}\,dx`,kind:'indefinite',integrand:'(sin(x)+cos(x))/sqrt(25*sin(x)^2+16*cos(x)^2)',answer:'asinh(3*sin(x)/4)/3-asin(3*cos(x)/5)/3',answerLatex:String.raw`\frac13\operatorname{arsinh}\!\left(\frac34\sin x\right)-\frac13\arcsin\!\left(\frac35\cos x\right)`,technique:'substitution',difficulty:2,domain:'所有實數；根號內至少為 16，兩個反函數的實數分支都有效。',samples:[-2.2,-1.1,-.3,.4,1.2,2.4],
hints:['分子是兩項之和，可以先拆成兩個積分。',String.raw`同一個分母可寫成 $\sqrt{16+9\sin^2x}$，也可寫成 $\sqrt{25-9\cos^2x}$。`,String.raw`含 cos x 的項令 $u=\sin x$；含 sin x 的項令 $v=\cos x$，留意負號。`],
steps:[step('對分子中的 cos x 那一項，哪個換元能直接消去微分因子？',['u=sin x','u=cos x','u=tan x'],0,'du=cos x dx，而分母可化成 √(16+9u²)。'),step('若 v=cos x，sin x dx 應換成甚麼？',['−dv','dv','v dv'],0,'d(cos x)=−sin x dx，因此這一項帶負號。')],
solution:[String.raw`拆成 $\int\frac{\cos x\,dx}{\sqrt{16+9\sin^2x}}+\int\frac{\sin x\,dx}{\sqrt{25-9\cos^2x}}$。`,String.raw`第一項令 $u=\sin x$，得到 $\frac13\operatorname{arsinh}(3u/4)$；第二項令 $v=\cos x$，得到 $-\frac13\arcsin(3v/5)$。`,String.raw`兩式相加，再補積分常數 $C$。這兩個原函數在全實數上均可微。`],mistakes:[{expr:'asinh(3*sin(x)/4)/3+asin(3*cos(x)/5)/3',message:'第二個換元的微分是 d(cos x)=−sin x dx，請檢查反三角函數項前面的負號。'}]
},
{
match:1,number:2,page:4,answerPage:5,latex:String.raw`\int_0^\infty\frac{x^3}{e^x+1}\,dx`,kind:'definite',integrand:null,answer:'7*pi^4/120',answerLatex:String.raw`\frac{7\pi^4}{120}`,technique:'series',difficulty:3,domain:'在 [0,∞) 上的廣義積分；x=0 附近與無窮遠皆可積。',
hints:['把分母的指數移到分子，觀察能否使用幾何級數。',String.raw`對 x>0，$1/(e^x+1)=\sum_{n=1}^{\infty}(-1)^{n-1}e^{-nx}$。`,String.raw`逐項積分會出現 $\int_0^\infty x^3e^{-nx}dx=6/n^4$，再把交錯級數與 ζ(4) 連結。`],
steps:[step('積分每一項 x³e^(−nx)，令 u=nx 後會出現哪個 n 的次方？',['n^(−4)','n^(−3)','n^(−1)'],0,'x³ 給 n^(−3)，dx 再給 n^(−1)，合起來為 n^(−4)。')],
solution:[String.raw`對 $x>0$ 展開 $\frac1{e^x+1}=\sum_{n\ge1}(-1)^{n-1}e^{-nx}$。`,String.raw`因 $\sum_{n\ge1}\int_0^\infty x^3e^{-nx}dx=6\sum_{n\ge1}n^{-4}<\infty$，可交換求和與積分。`,String.raw`所以原式為 $6\sum_{n\ge1}(-1)^{n-1}/n^4=6(1-2^{1-4})\zeta(4)$。`,String.raw`利用 $\zeta(4)=\pi^4/90$，得 $7\pi^4/120$。`],mistakes:[{expr:'pi^4/15',message:'分母是 eˣ+1，展開為交錯級數；與 eˣ−1 的結果相差因子 1−2^(−3)。'}]
},
{
match:1,number:3,page:6,answerPage:7,latex:String.raw`\int_0^1\frac{1-x^{5/2}}{1-x}\,dx`,kind:'definite',integrand:null,answer:'46/15-2*log(2)',answerLatex:String.raw`\frac{46}{15}-2\log2`,technique:'substitution',difficulty:2,domain:'x=1 為可去奇點，取連續延拓值 5/2；不影響定積分。',
hints:['半整數指數建議先消去根號。','令 $x=t^2$，上下限仍為 0 與 1；分子變成 $1-t^5$。','約去因子 1−t 後，用多項式除法拆開剩下的有理式。'],
steps:[step('令 x=t² 後，被積函數連同 dx 變成？',['2t(1−t⁵)/(1−t²) dt','(1−t⁵)/(1−t²) dt','2(1−t⁵)/(1−t²) dt'],0,'要同時代入 x=t² 及 dx=2t dt。'),step('化簡後的有理式可寫成哪個形式？',['2t⁴+2t²+2−2/(1+t)','2t⁴+2t²+2/(1+t)','2t³+2t+2'],0,'(1+t+t²+t³+t⁴)/(1+t)=t³+t+1/(1+t)，再乘 2t。')],
solution:[String.raw`令 $x=t^2$，原式為 $\int_0^1\frac{2t(1-t^5)}{1-t^2}\,dt$。`,String.raw`約去 $1-t$ 並作除法，得到 $\int_0^1(2t^4+2t^2+2-2/(1+t))\,dt$。`,String.raw`逐項積分為 $2/5+2/3+2-2\log2=46/15-2\log2$。`],mistakes:[{expr:'23/15-log(2)',message:'結果少了一個 2；換元 x=t² 時，dx=2t dt。'}]
},
{
match:2,number:1,page:8,answerPage:9,latex:String.raw`\int_0^\infty\frac{dx}{x^6+1}`,kind:'definite',integrand:null,answer:'pi/3',answerLatex:String.raw`\frac\pi3`,technique:'substitution',difficulty:3,domain:'[0,∞) 的收斂廣義積分；使用 Euler beta integral 時參數 a=1/6 位於 (0,1)。',
hints:['分母只有 x 的六次方，可把六次方整體當成新變數。',String.raw`令 $t=x^6$，積分會化成 $\frac16\int_0^\infty t^{-5/6}/(1+t)\,dt$。`,String.raw`可用 Euler beta integral：$\int_0^\infty t^{a-1}/(1+t)dt=\pi/\sin(\pi a)$，其中 0<a<1。`],
steps:[step('令 t=x⁶ 後，冪次 t^(a−1) 對應哪個 a？',['a=1/6','a=5/6','a=6'],0,'dx=(1/6)t^(−5/6)dt，因此 a−1=−5/6。')],
solution:[String.raw`令 $t=x^6$，有 $dx=\frac16t^{-5/6}dt$。`,String.raw`套用 Euler beta integral 與反射公式，原式為 $\frac16 B(1/6,5/6)=\frac\pi{6\sin(\pi/6)}$。`,String.raw`因 $\sin(\pi/6)=1/2$，答案為 $\pi/3$。也可將 $x^6+1$ 分解後做部分分式積分。`],mistakes:[{expr:'pi/6',message:'beta integral 中還有分母 sin(π/6)=1/2，不能只保留換元因子 1/6。'}]
},
{
match:2,number:2,page:10,answerPage:11,latex:String.raw`\int_0^{1/2}\frac{\log(1-x)}x\,dx`,kind:'definite',integrand:null,answer:'log(2)^2/2-pi^2/12',answerLatex:String.raw`\frac{\log^22}{2}-\frac{\pi^2}{12}`,technique:'series',difficulty:3,domain:'x=0 處取極限 −1。整個積分為負；可用級數與互補變數恆等式處理。',
hints:['先判斷答案正負，再想 log(1−x) 的冪級數。',String.raw`記 $I(a)=\int_0^a\log(1-x)/x\,dx$，比較 I(a) 與 I(1−a)。`,String.raw`對兩者之和微分，可證 $I(a)+I(1-a)=\log a\log(1-a)-\pi^2/6$；最後取 a=1/2。`],
steps:[step('I(a)+I(1−a) 對 a 微分，得到哪個形式？',['log(1−a)/a−log(a)/(1−a)','log(1−a)/a+log(a)/(1−a)','0'],0,'第二項要用 chain rule：d(1−a)/da=−1。')],
solution:[String.raw`令 $I(a)=\int_0^a\log(1-x)/x\,dx$。由冪級數，$I(1)=-\sum_{n\ge1}n^{-2}=-\pi^2/6$。`,String.raw`比較導數並取 $a\to0^+$，得到 $I(a)+I(1-a)=\log a\log(1-a)-\pi^2/6$。`,String.raw`取 $a=1/2$，得 $2I(1/2)=\log^22-\pi^2/6$，所以答案為 $\log^22/2-\pi^2/12$。`],mistakes:[{expr:'pi^2/12-log(2)^2/2',message:'在 0<x≤1/2，log(1−x)<0，整個積分必須為負。請檢查整體負號。'}]
},
{
match:3,number:1,page:12,answerPage:13,latex:String.raw`\int\frac{\sqrt x}{1+x^2}\,dx`,kind:'indefinite',integrand:'sqrt(x)/(1+x^2)',answer:'(atan((x-1)/sqrt(2*x))-atanh(sqrt(2*x)/(x+1)))/sqrt(2)',answerLatex:String.raw`\frac1{\sqrt2}\!\left(\arctan\frac{x-1}{\sqrt{2x}}-\operatorname{artanh}\frac{\sqrt{2x}}{x+1}\right)`,technique:'algebra',difficulty:3,domain:'題面實數域 x≥0；所列官方原函數採 x>0，可在端點連續延拓。對 x>0，atanh 真數介於 0 與 1/√2 之間。',samples:[.1,.3,.7,1.1,2.3,5],
hints:['先用一個換元，把含根號的積分變成有理函數。',String.raw`令 $t=\sqrt x$，有 $\sqrt x\,dx=2t^2dt$，分母為 $1+t^4$。`,String.raw`因式分解 $t^4+1=(t^2-\sqrt2t+1)(t^2+\sqrt2t+1)$，再作部分分式。`],
steps:[step('x=t² 後，原積分是哪個有理式？',['∫2t²/(1+t⁴) dt','∫2t/(1+t⁴) dt','∫t²/(1+t²) dt'],0,'√x=t 且 dx=2t dt，因此分子為 2t²。'),step('若 A=t²−√2t+1，B=t²+√2t+1，2t²/(1+t⁴) 等於？',['(1/√2)(t/A−t/B)','(1/√2)(t/A+t/B)','1/A−1/B'],0,'t/A−t/B=t(B−A)/(AB)=2√2t²/(1+t⁴)。')],
solution:[String.raw`令 $x=t^2$，得到 $\int 2t^2/(1+t^4)\,dt$。設 $A=t^2-\sqrt2t+1$、$B=t^2+\sqrt2t+1$，部分分式為 $\frac1{\sqrt2}(t/A-t/B)$。`,String.raw`配平方後逐項積分，得到 $\frac1{2\sqrt2}\log(A/B)+\frac1{\sqrt2}[\arctan(\sqrt2t-1)+\arctan(\sqrt2t+1)]+C$。`,String.raw`在 $t>0$ 上，把對數改寫為 artanh，並合併 arctan（兩式僅差常數），便得到官方所列的 $\frac1{\sqrt2}[\arctan((x-1)/\sqrt{2x})-\operatorname{artanh}(\sqrt{2x}/(x+1))]+C$。`],mistakes:[{expr:'atan(x)',message:'arctan x 的導數只有 1/(1+x²)，尚缺分子 √x。請先把根號有理化。'}]
},
{
match:3,number:2,page:14,answerPage:15,latex:String.raw`\int_1^\infty\frac{(-1)^{\lfloor x\rfloor+\lfloor x/2\rfloor+\lfloor x/3\rfloor+\cdots}}{x^2}\,dx`,kind:'definite',integrand:null,answer:'1-pi^2/6',answerLatex:String.raw`1-\frac{\pi^2}{6}`,technique:'discrete',difficulty:3,domain:'每個固定 x 的取整和只有有限個非零項。除整數端點外可逐段處理，積分絕對收斂。',
hints:['只需知道指數是奇數還是偶數，不必精確求出整個和。',String.raw`用約數計數：$\sum_{k\ge1}\lfloor x/k\rfloor=\sum_{m\le x}d(m)$；大多數約數可以成對。`,String.raw`d(m) 只有在 m 是完全平方數時為奇數，因此符號等於 $(-1)^{\lfloor\sqrt x\rfloor}$。`],
steps:[step('一個正整數的約數個數為奇數，當且僅當？',['它是完全平方數','它是質數','它是奇數'],0,'約數 d 與 m/d 成對；只有 d=√m 時會留下未配對的一個。'),step('符號在甚麼區間上保持為 (−1)ⁿ？',['[n²,(n+1)²)','[n,n+1)','[2n,2n+2)'],0,'⌊√x⌋=n 恰在這個平方數分隔的區間。')],
solution:[String.raw`以約數配對可知 $\sum_{k\ge1}\lfloor x/k\rfloor\equiv\lfloor\sqrt x\rfloor\pmod2$。`,String.raw`所以積分為 $\sum_{n\ge1}(-1)^n\int_{n^2}^{(n+1)^2}x^{-2}dx=\sum_{n\ge1}(-1)^n(1/n^2-1/(n+1)^2)$。`,String.raw`設 $\eta(2)=\sum_{n\ge1}(-1)^{n-1}/n^2=\pi^2/12$，上式為 $1-2\eta(2)=1-\pi^2/6$。`],mistakes:[{expr:'0',message:'符號雖交替，但各區間長度和權重 1/x² 不相同，不能直接說面積抵消。'}]
},
{
match:3,number:3,page:16,answerPage:17,latex:String.raw`\int_0^{\sqrt3}\arctan\!\left(\frac{3x-x^3}{1-3x^2}\right)\,dx`,kind:'definite',integrand:null,answer:'pi/sqrt(3)-3*log(2)',answerLatex:String.raw`\frac\pi{\sqrt3}-3\log2`,technique:'trig',difficulty:3,domain:'arctan 為主值 (−π/2,π/2)。x=1/√3 是原式未定義的單點，按兩側積分；跳躍不影響可積性。',
hints:['分式與某個三倍角公式一致，但先別直接消掉反函數。',String.raw`令 $\theta=\arctan x$，分式等於 tan(3θ)；注意 arctan 的主值範圍。`,String.raw`在 $x=1/\sqrt3$ 分段：左側是 $3\arctan x$，右側是 $3\arctan x-\pi$。`],
steps:[step('當 1/√3<x<√3 時，arctan(tan(3 arctan x)) 應取？',['3 arctan x−π','3 arctan x','3 arctan x+π'],0,'此時 3 arctan x 位於 (π/2,π)，需要減 π 回到 arctan 主值區間。')],
solution:[String.raw`由三倍角公式，分式為 $\tan(3\arctan x)$。當 $0\le x<1/\sqrt3$，主值為 $3\arctan x$；其餘區間為 $3\arctan x-\pi$。`,String.raw`因此原式為 $3\int_0^{\sqrt3}\arctan x\,dx-\pi(\sqrt3-1/\sqrt3)$。`,String.raw`使用 $\int\arctan x\,dx=x\arctan x-\frac12\log(1+x^2)$，得到 $\pi/\sqrt3-3\log2$。`],mistakes:[{expr:'pi*sqrt(3)-3*log(2)',message:'這是把 arctan(tan θ) 在整段都當成 θ 的結果。跨過 π/2 時要修正主值分支。'}]
},
{
match:'tiebreaker',number:1,page:19,answerPage:20,latex:String.raw`\int_0^\infty e^{-x^5/2025}x^{3/2}\,dx`,kind:'definite',integrand:null,answer:'9*sqrt(pi)',answerLatex:String.raw`9\sqrt\pi`,technique:'substitution',difficulty:2,domain:'[0,∞) 的收斂廣義積分。此題為官方 Quarterfinal Tiebreakers Problem 1。',
hints:['指數中的 x⁵ 與前面的 x^(3/2)，暗示把 x 的某個次方當成新變數。','令 $u=x^{5/2}/45$，指數恰好變成 $-u^2$。','換元微分為 $du=x^{3/2}dx/18$，接著使用半條實軸的 Gaussian integral。'],
steps:[step('若 u=x^(5/2)/45，x^(3/2) dx 等於？',['18 du','45 du','(5/2) du'],0,'du=(5/2)/45·x^(3/2)dx=x^(3/2)dx/18。')],
solution:[String.raw`因 $2025=45^2$，令 $u=x^{5/2}/45$，便有 $x^5/2025=u^2$ 且 $x^{3/2}dx=18du$。`,String.raw`原式為 $18\int_0^\infty e^{-u^2}du=18\cdot\sqrt\pi/2=9\sqrt\pi$。`],mistakes:[{expr:'18*sqrt(pi)',message:'Gaussian integral 在整條實軸才是 √π；本題只積分正半軸，需再除以 2。'}]
},
{
match:4,number:1,page:21,answerPage:22,latex:String.raw`\int_1^\infty\frac{dx}{\lfloor x\rfloor^2\lceil x\rceil^2}`,kind:'definite',integrand:null,answer:'(pi^2-9)/3',answerLatex:String.raw`\frac{\pi^2-9}{3}`,technique:'discrete',difficulty:2,domain:'非整數 x∈(n,n+1) 時，⌊x⌋=n、⌈x⌉=n+1；整數點取值不同不影響積分。',
hints:['把積分切成長度為 1 的區間。','每段面積為 $1/[n^2(n+1)^2]$，試著拆成可相消的級數。','恆等式為 $1/[n^2(n+1)^2]=1/n^2+1/(n+1)^2-2/[n(n+1)]$。'],
steps:[step('在非整數的區間 (n,n+1) 上，被積函數是？',['1/[n²(n+1)²]','1/n⁴','1/(n+1)⁴'],0,'取整與上取整分別為 n 與 n+1，不是同一個整數。')],
solution:[String.raw`積分等於 $\sum_{n\ge1}1/[n^2(n+1)^2]$。`,String.raw`拆成 $\sum_{n\ge1}[1/n^2+1/(n+1)^2-2/(n(n+1))]$。`,String.raw`前兩項給 $2\zeta(2)-1$；由 $1/[n(n+1)]=1/n-1/(n+1)$，最後一項總和為 2。`,String.raw`因此答案為 $2\zeta(2)-3=\pi^2/3-3=(\pi^2-9)/3$。`],mistakes:[{expr:'pi^4/90',message:'這相當於把 floor 與 ceil 都當成 n。幾乎處處它們分別為 n、n+1，應得到 1/[n²(n+1)²]。'}]
},
{
match:4,number:2,page:23,answerPage:24,latex:String.raw`\int_0^\infty\frac{4\cos(4x)}{x^4+4}\,dx`,kind:'definite',integrand:null,answer:'pi*(sin(4)+cos(4))/(2*exp(4))',answerLatex:String.raw`\frac\pi{2e^4}(\sin4+\cos4)`,technique:'advanced',difficulty:3,domain:'[0,∞) 的絕對收斂廣義積分；三角函數角度為弧度。留數推導選上半平面的兩個極點 1+i、−1+i。',
hints:['cos(4x) 與有理分母的組合，適合看成 Fourier cosine transform。','可延伸至整條實軸，改考慮 $4e^{4iz}/(z^4+4)$ 的上半平面積分。','上半平面的極點為 1+i 與 −1+i；在簡單極點 z₀ 的留數為 $e^{4iz_0}/z_0^3$。'],
steps:[step('z⁴+4=0 的上半平面根是哪兩個？',['1+i、−1+i','1+i、1−i','2i、−2i'],0,'(1+i)⁴=−4；四個根為 ±1±i，選虛部為正的兩個。'),step('因原 integrand 的實部是偶函數，半軸積分與整軸實部的關係是？',['半軸積分等於整軸實部的一半','半軸積分等於整軸實部','半軸積分等於整軸虛部'],0,'4cos(4x)/(x⁴+4) 為偶函數，而 sin 項為奇函數。')],
solution:[String.raw`令 $J=\int_{-\infty}^{\infty}4e^{4ix}/(x^4+4)\,dx$。以留數定理在上半平面閉合；半圓弧積分趨於零。`,String.raw`簡單極點 $z_1=1+i$、$z_2=-1+i$ 的留數為 $e^{4iz_j}/z_j^3$。由 $1/(1+i)^3=(-1-i)/4$、$1/(-1+i)^3=(1-i)/4$，留數和為 $-\frac i2e^{-4}(\sin4+\cos4)$。`,String.raw`所以 $J=\pi e^{-4}(\sin4+\cos4)$。原積分是 $\frac12\operatorname{Re}J$，答案為 $\frac\pi{2e^4}(\sin4+\cos4)$。`],mistakes:[{expr:'pi*(sin(4)+cos(4))/exp(4)',message:'延伸到整條實軸後，最後要取實部再除以 2，因原題只積分 [0,∞)。'}]
},
{
match:4,number:3,page:25,answerPage:26,latex:String.raw`\int\sin(\operatorname{arcosh}x)\,dx`,kind:'indefinite',integrand:'sin(acosh(x))',answer:'(x*sin(acosh(x))-sqrt(x^2-1)*cos(acosh(x)))/2',answerLatex:String.raw`\frac12\left(x\sin(\operatorname{arcosh}x)-\sqrt{x^2-1}\cos(\operatorname{arcosh}x)\right)`,technique:'parts',difficulty:3,domain:'實數域 x≥1；驗證使用 x>1。arcosh 為非負主值。',samples:[1.05,1.2,1.6,2.3,4.1,7],
hints:['把反雙曲函數整體設為新變數。',String.raw`令 $u=\operatorname{arcosh}x$，則 $x=\cosh u$、$dx=\sinh u\,du$。`,String.raw`對 $\int\sin u\sinh u\,du$ 做兩次分部積分，會回到原本的積分。`],
steps:[step('x=cosh u 後，原積分變成？',['∫sin u sinh u du','∫sin u cosh u du','∫cos u sinh u du'],0,'dx=sinh u du，反函數 arcosh(cosh u)=u（u≥0）。'),step('令 I=∫sin u sinh u du，兩次分部積分後得到哪個關係？',['2I=sin u cosh u−cos u sinh u','I=sin u cosh u−cos u sinh u','2I=sin u cosh u+cos u sinh u'],0,'第一遍 I=sin u cosh u−∫cos u cosh u du；第二個積分等於 cos u sinh u+I。')],
solution:[String.raw`令 $u=\operatorname{arcosh}x$，有 $x=\cosh u$、$dx=\sinh u\,du$。設 $I=\int\sin u\sinh u\,du$。`,String.raw`分部積分得 $I=\sin u\cosh u-\int\cos u\cosh u\,du$；再分部一次，後面的積分為 $\cos u\sinh u+I$。`,String.raw`因此 $I=\frac12(\sin u\cosh u-\cos u\sinh u)+C$。代回 $\cosh u=x$、$\sinh u=\sqrt{x^2-1}$ 得官方答案。`],mistakes:[{expr:'x*sin(acosh(x))-sqrt(x^2-1)*cos(acosh(x))',message:'兩次分部積分會讓原積分在等式兩邊都出現；移項後是 2I，最後需要除以 2。'}]
}
];
export const QUARTERFINAL_2026=rows.map((r,i)=>({...r,id:r.match==='tiebreaker'?`mit-2026-qftb-${String(r.number).padStart(2,'0')}`:`mit-2026-qf${r.match}-${String(r.number).padStart(2,'0')}`,origin:'archive',year:2026,round:'quarterfinal',roundLabel:'Quarterfinals',timeSeconds:180,stageOrder:i+1,sourceLabel:r.match==='tiebreaker'?`2026 Quarterfinal Tiebreaker · #${r.number}`:`2026 Quarterfinal #${r.match} · Problem ${r.number}`,testUrl:url,answerUrl:url,verifiedAt:'2026-11-04',officialAnswerLatex:r.answerLatex}));
