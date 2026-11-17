// Official 2026 MIT semifinal/final problem and answer slides visually checked 2026-11-04.
// Chinese training content and derivations below are independently authored.
let rotation=0;
const step=(prompt,options,correct,explanation)=>{const r=rotation++%options.length;return {prompt,options:options.slice(r).concat(options.slice(0,r)),correct:(correct-r+options.length)%options.length,explanation};};
const sf='https://math.mit.edu/~yyao1/pdf/2026_semifinal.pdf';
const fin='https://math.mit.edu/~yyao1/pdf/2026_finals.pdf';
const sfRow=(match,number,page,row)=>({id:`mit-2026-${match==='tiebreaker'?'sftb':'sf'+match}-${String(number).padStart(2,'0')}`,origin:'archive',year:2026,round:'semifinal',roundLabel:'Semifinals',timeSeconds:240,match,number,page,answerPage:page+1,testUrl:sf,answerUrl:sf,verifiedAt:'2026-11-04',sourceLabel:match==='tiebreaker'?`2026 Semifinal Tiebreakers · Problem ${number}`:`2026 Semifinal #${match} · Problem ${number}`,difficulty:3,mistakes:[],...row});
const finalRow=(number,page,row)=>({id:`mit-2026-final-${String(number).padStart(2,'0')}`,origin:'archive',year:2026,round:'final',roundLabel:'Finals',timeSeconds:300,number,page,answerPage:page+1,testUrl:fin,answerUrl:fin,verifiedAt:'2026-11-04',sourceLabel:`2026 Finals · Problem ${number}`,difficulty:3,mistakes:[],...row});
export const SEMIFINAL_2026=[
sfRow(1,1,2,{
 latex:String.raw`\lim_{n\to\infty}\int_0^\infty\sqrt n\left(\frac{e^{x-1}}{x^x}\right)^n\,dx`,kind:'definite',integrand:null,answer:'sqrt(2*pi)',answerLatex:String.raw`\sqrt{2\pi}`,technique:'advanced',domain:'x>0；求積分序列的 n→∞ 極限。',
 hints:['大次方會把主要貢獻集中在底數最大的附近。',String.raw`取對數，研究 $\phi(x)=x-1-x\log x$ 的最大點與二階導數。`,String.raw`在 x=1 附近用 $\phi(x)=-(x-1)^2/2+O((x-1)^3)$，再令 t=√n(x−1)。`],
 steps:[step('φ(x)=x−1−x log x 的唯一最大點在哪裡？',['x=1','x=0','x=e'],0,'φ′=−log x，φ″=−1/x<0；唯一最大值在 x=1，且 φ(1)=0。')],
 solution:[String.raw`寫成 $\sqrt n\int_0^\infty e^{n\phi(x)}dx$，其中 $\phi(x)=x-1-x\log x$。`,String.raw`φ 在 x=1 取得唯一最大值0，且 $\phi\prime\prime(1)=-1$；靠近0和無窮遠的尾部不含最大點。`,String.raw`由 Laplace method（拉普拉斯漸近法），$\int_0^\infty e^{n\phi(x)}dx\sim\sqrt{2\pi/n}$。此處 φ 在最大點光滑、二階非退化，且遠處尾積分可忽略。`,String.raw`乘上 √n，極限為 $\sqrt{2\pi}$。`],
 mistakes:[{expr:'sqrt(pi)',message:'檢查峰值附近的二次項：φ(x)≈−(x−1)²/2，標準 Gaussian 的係數是 1/2。'}]
}),
sfRow(1,2,4,{
 latex:String.raw`\int\frac{x^2-2}{(x^2+2)\sqrt{x^4+4}}\,dx`,kind:'indefinite',integrand:'(x^2-2)/((x^2+2)*sqrt(x^4+4))',answer:'-atan(2*x/sqrt(x^4+4))/2',answerLatex:String.raw`-\frac12\arctan\!\left(\frac{2x}{\sqrt{x^4+4}}\right)`,officialAnswerLatex:String.raw`\frac12\arctan\!\left(\frac{\sqrt{x^4+4}}{2x}\right)`,sourceNote:'官方原函數在 x=0 無定義，並跨0有跳躍。本站採用在全實數連續的等價原函數；在 x>0、x<0 各自與官方形式只差常數。',technique:'substitution',domain:'原被積函數在所有實數皆有定義；本站採連續跨過 x=0 的原函數。',samples:[-3,-1.1,-0.3,0.4,1.2,2.8],
 hints:['平方根中的 x⁴+4 和外面的 x²+2，可能來自同一個反三角函數。',String.raw`試用 $u=2x/\sqrt{x^4+4}$，計算 1+u²。`,'有 $1+u^2=(x^2+2)^2/(x^4+4)$；比較 du/(1+u²) 與題目。'],
 steps:[step('u=2x/√(x⁴+4) 時，1+u² 化簡為？',['(x²+2)²/(x⁴+4)','(x²−2)²/(x⁴+4)','1/(x⁴+4)'],0,'通分得 x⁴+4x²+4=(x²+2)²。')],
 solution:[String.raw`設 $u=2x/\sqrt{x^4+4}$，則 $u\prime=2(4-x^4)/(x^4+4)^{3/2}$。`,String.raw`又 $1+u^2=(x^2+2)^2/(x^4+4)$，因此題目恰為 $-\frac12\,du/(1+u^2)$。`,String.raw`得到 $-\frac12\arctan u+C$。官方寫成互為倒數的 arctan 形式，在不跨越0的區間內僅差常數；本站形式也涵蓋 x=0。`],
 mistakes:[{expr:'atan(2*x/sqrt(x^4+4))/2',message:'檢查 4−x⁴ 與 x²−2 的符號關係：4−x⁴=−(x²−2)(x²+2)。'}]
}),
sfRow(1,3,6,{
 latex:String.raw`\int_0^\pi\min_{a\in\{0,1\}}\max_{b\in\{0,1\}}\min_{c\in\{0,1\}}\cos((a+b+c)x)\,dx`,kind:'definite',integrand:null,answer:'-3*sqrt(3)/4',answerLatex:String.raw`-\frac{3\sqrt3}{4}`,technique:'discrete',domain:'依序由內向外取 min / max；x∈[0,π]。',
 hints:['先把每個二元選擇展開，不要把 min/max 移到積分外面。','以 A=cos x、B=cos2x、C=cos3x 表示；用 min/max 的吸收律化簡。','整個被積函數可化為 min(cos x,cos2x)；找兩者在 (0,π) 的交點。'],
 steps:[step('化簡 min/max 後，需要積分哪個函數？',['min(cos x,cos2x)','max(cos x,cos2x)','cos3x'],0,'a=0 時外層 max 為 cos x；與 a=1 的結果取 min，利用吸收律最後得到 min(cos x,cos2x)。')],
 solution:[String.raw`a=0 時，$\max(\min(1,A),\min(A,B))=A$；a=1 時為 $\max(\min(A,B),\min(B,C))$。`,String.raw`再取 min，吸收律給出 $\min(A,\max(\min(A,B),\min(B,C)))=\min(A,B)$。`,String.raw`cos2x≤cos x 等價於 $(2\cos x+1)(\cos x-1)\le0$，故在 [0,2π/3] 選 cos2x，其餘選 cos x。`,String.raw`所以積分為 $\int_0^{2\pi/3}\cos2x\,dx+\int_{2\pi/3}^{\pi}\cos x\,dx=-3\sqrt3/4$。`]
}),
sfRow(1,4,8,{
 latex:String.raw`\left\lfloor\int_0^2 100\left(\sqrt{-4x^2+8x+16}-\sqrt{-x^2-2x+9}\right)\,dx\right\rfloor`,kind:'definite',integrand:null,answer:'400',answerLatex:'400',technique:'geometry',domain:'取整符號作用於整個定積分，並非逐點取整。',
 hints:['先確認取整的位置，再將兩個二次式配方。',String.raw`根號可改成 $2\sqrt{5-(x-1)^2}$ 與 $\sqrt{10-(x+1)^2}$。`,'平移後使用圓弓形原函數；兩組反三角函數的角度項會相消。'],
 steps:[step('第一個根號配方後是？',['2√(5−(x−1)²)','√(5−(x−1)²)','2√(4−(x−1)²)'],0,'−4x²+8x+16=4(5−(x−1)²)。')],
 solution:[String.raw`除去100，第一項積分為 $4\int_0^1\sqrt{5-u^2}du=4+10\arctan(1/2)$。`,String.raw`第二項為 $\int_1^3\sqrt{10-v^2}dv=5(\arctan3-\arctan(1/3))$。`,String.raw`因 $\arctan3-\arctan(1/3)=2\arctan(1/2)$，兩項差精確等於4。`,'整個定積分恰為400，最後取 floor 仍是400。注意沒有將 floor 移入積分內。']
}),
sfRow('tiebreaker',1,11,{
 latex:String.raw`\int\left(1+\frac1x\right)\left(1-\frac2x\right)x^{\sqrt3}e^x\,dx`,kind:'indefinite',integrand:'(1+1/x)*(1-2/x)*x^(sqrt(3))*exp(x)',answer:'(x^sqrt(3)-(sqrt(3)+1)*x^(sqrt(3)-1))*exp(x)',answerLatex:String.raw`\left(x^{\sqrt3}-(\sqrt3+1)x^{\sqrt3-1}\right)e^x`,technique:'parts',domain:'實數冪採 x>0。',samples:[0.2,0.5,0.9,1.5,2.5,4],
 hints:['先展開兩個括號，看冪次之間的關係。','令 a=√3，嘗試原函數為 $e^x(Ax^a+Bx^{a-1})$。','比較微分後 xᵃ、xᵃ⁻¹、xᵃ⁻² 的係數；利用 a²−1=2。'],
 steps:[step('展開 (1+1/x)(1−2/x) 的結果是？',['1−1/x−2/x²','1+1/x−2/x²','1−2/x²'],0,'交叉項 −2/x+1/x=−1/x。')],
 solution:['設 a=√3，被積函數為 $e^x(x^a-x^{a-1}-2x^{a-2})$。','微分 $e^x(x^a-(a+1)x^{a-1})$，得到 $e^x(x^a-x^{a-1}-(a+1)(a-1)x^{a-2})$。','因 $(a+1)(a-1)=2$，正好還原題目，故該式加C即為原函數。']
}),
sfRow(2,1,13,{
 latex:String.raw`\lim_{n\to\infty}\int_{-2}^2\underbrace{\left(\cdots\left((x^2-2)^2-2\right)^2\cdots-2\right)}_{n\text{ 次平方}}^{4}\,dx`,kind:'definite',integrand:null,answer:'24',answerLatex:'24',technique:'trig',domain:'n 次平方指遞迴 P₀(x)=x、Pₙ₊₁=Pₙ²−2；題目為 ∫Pₙ⁴。',
 hints:['x²−2 這個反覆操作，對某個三角代換特別自然。',String.raw`令 x=2cosθ，則 $x^2-2=2\cos2\theta$。`,'Pₙ(2cosθ)=2cos(2ⁿθ)；cos⁴ 的高頻振盪平均值為3/8。'],
 steps:[step('若 x=2cosθ，迭代 n 次 x↦x²−2 後是？',['2cos(2ⁿθ)','2ⁿcosθ','cos(2nθ)'],0,'由 4cos²θ−2=2cos2θ，每一步將角度加倍。')],
 solution:[String.raw`令 $x=2\cos\theta$，迭代恆等式給出 $P_n(x)=2\cos(2^n\theta)$。`,String.raw`原積分為 $32\int_0^\pi\sin\theta\cos^4(2^n\theta)d\theta$。`,String.raw`使用 $\cos^4t=(3+4\cos2t+\cos4t)/8$；兩個振盪項與 sinθ 的積分趨於0（也可直接用積化和差積分）。`,String.raw`留下 $32\cdot(3/8)\int_0^\pi\sin\theta d\theta=24$。`]
}),
sfRow(2,2,15,{
 latex:String.raw`\int_{-\infty}^{\infty}\left\lfloor\sqrt{\left|\frac{(x-1)(x+1)}{(x-2)x(x+2)}\right|}\right\rfloor\,dx`,kind:'definite',integrand:null,answer:'pi^2/3',answerLatex:String.raw`\frac{\pi^2}{3}`,technique:'advanced',domain:'排除 x=−2,0,2 的極點；正被積函數的廣義積分。',
 hints:['把非負整數值函數寫成各高度層的指示函數之和。','令 R(x) 為根號內的有理式，則 floor√|R|=Σₖ≥₁ 1{|R|≥k²}。','R 的部分分式有正留數且總和為1；利用各單調反函數分支求 |R|≥t 的總長度。'],
 steps:[step('floor√|R(x)| 的第 k 層對應哪個條件？',['|R(x)|≥k²','|R(x)|≥k','R(x)≥√k'],0,'floor y=Σₖ≥₁1{y≥k}，而 y=√|R|。')],
 solution:['部分分式為 $R(x)=1/(4x)+3/(8(x-2))+3/(8(x+2))$，三個正留數總和A=1。',String.raw`對 $R(x)=\sum_j a_j/(x-b_j)$ 且 aⱼ>0，各極點間 R 嚴格遞減。由 R=t 與 R=−t 的根和（通分後比較首兩項係數），兩組根和相差2A/t；正負區間的長度相加即 $m\{|R|\ge t\}=2A/t$。`,String.raw`以非負函數的分層求和及 Tonelli theorem 得 $\int\lfloor\sqrt{|R|}\rfloor dx=\sum_{k\ge1}2/k^2$。`,String.raw`利用 $\sum_{k\ge1}1/k^2=\pi^2/6$，答案為π²/3。上述長度恆等式使用正留數；不能套用於任意有理函數。`]
}),
sfRow(2,3,17,{
 latex:String.raw`\int_0^\pi\cos(2x)\cos(3x)\cos(5x)\cos(7x)\cos(11x)\cos(13x)\cos(17x)\cos(19x)\cos(23x)\,dx`,kind:'definite',integrand:null,answer:'5*pi/256',answerLatex:String.raw`\frac{5\pi}{256}`,technique:'trig',domain:'x∈[0,π]；九個頻率之和為100。',
 hints:['積化和差後，哪些頻率的餘弦在 [0,π] 積分會留下來？','寫成 2⁻⁹Σ cos((±2±3±⋯±23)x)，只有零頻率有貢獻。','九個數總和是100；計數選出和為50的子集，再乘π/512。'],
 steps:[step('展開後哪種符號組合有非零積分？',['帶符號頻率總和為0','帶符號頻率總和為1','所有組合都有'],0,'非零整數頻率的 cos(kx) 在 [0,π] 的積分為0，零頻率積分為π。')],
 solution:[String.raw`用 $\cos t=(e^{it}+e^{-it})/2$ 展開，積分只保留 $\sum\varepsilon_jp_j=0$ 的符號組合。`,String.raw`頻率總和為100，因此正號所選的子集必須和為50。有限枚舉或以 $\prod_{p\in\{2,3,5,7,11,13,17,19,23\}}(1+z^p)$ 取 z⁵⁰ 的係數，得到10。`,String.raw`每個零頻率的權重為1/512，故積分為 $10\pi/512=5\pi/256$。`]
}),
sfRow(2,4,19,{
 latex:String.raw`\int\frac{dx}{x^4+5x^3+10x^2+9x+3}`,kind:'indefinite',integrand:'1/(x^4+5*x^3+10*x^2+9*x+3)',answer:'log(x^2+3*x+3)/2-log(abs(x+1))-1/(x+1)-atan((2*x+3)/sqrt(3))/sqrt(3)',answerLatex:String.raw`\frac12\log(x^2+3x+3)-\log|x+1|-\frac1{x+1}-\frac1{\sqrt3}\arctan\!\left(\frac{2x+3}{\sqrt3}\right)`,officialAnswerLatex:String.raw`\frac12\log(x^2+3x+3)-\log(x+1)-\frac1{x+1}-\frac1{\sqrt3}\arctan\!\left(\frac{2x+3}{\sqrt3}\right)`,sourceNote:'官方答案寫 log(x+1)，對實數需 x>−1。本站以 log|x+1| 延伸到原式的兩個實數連通定義域。',technique:'algebra',domain:'x≠−1；二次因子 x²+3x+3 永遠為正。',samples:[-4,-2.3,-1.5,-0.4,0.7,2.5],
 hints:['先找四次分母是否有重根。','分母可分解為 $(x+1)^2(x^2+3x+3)$。','部分分式為 $1/(x+1)^2-1/(x+1)+(x+1)/(x^2+3x+3)$。'],
 steps:[step('四次分母可因式分解為？',['(x+1)²(x²+3x+3)','(x+1)(x³+4x²+5x+3)','(x²+2x+1)(x²+2x+3)'],0,'展開 (x+1)²(x²+3x+3) 得到 x⁴+5x³+10x²+9x+3。')],
 solution:['分母為 $(x+1)^2Q$，其中 Q=x²+3x+3。','部分分式是 $1/(x+1)^2-1/(x+1)+(x+1)/Q$。','將 x+1 寫成 Q′/2−1/2；Q=(x+3/2)²+3/4。',String.raw`逐項積分得 $-1/(x+1)-\log|x+1|+\frac12\log Q-\frac1{\sqrt3}\arctan((2x+3)/\sqrt3)+C$。`]
})
];
export const FINALS_2026=[
finalRow(1,2,{
 latex:String.raw`\lim_{n\to\infty}\int_0^1\left(\sum_{k=1}^n\frac1{nx^2+kx+n}\right)\,dx`,kind:'definite',integrand:null,answer:'5*pi^2/72',answerLatex:String.raw`\frac{5\pi^2}{72}`,technique:'advanced',domain:'x∈[0,1]；先將和看成 k/n 的 Riemann sum。',
 hints:['把每個分母提出 n；辨認一個 Riemann sum。',String.raw`極限為 $\int_0^1\int_0^1(x^2+tx+1)^{-1}dt\,dx$。`,'先對 t 積分，再用 1+x+x²=(1−x³)/(1−x) 與 1+x²=(1−x⁴)/(1−x²)。'],
 steps:[step('將和改寫成 Riemann sum 後，新增變數 t 的範圍是？',['0≤t≤1','0≤t≤n','1≤t≤∞'],0,'t=k/n，步長1/n，因此積分區間為[0,1]。')],
 solution:['被加函數在單位方形上連續有界，Riemann sums 一致收斂，可與 x 積分交換。',String.raw`先對 t 積分，得到 $I=\int_0^1[\log(1+x+x^2)-\log(1+x^2)]/x\,dx$，x=0 取連續極限。`,String.raw`利用因式分解，方括號變成 $\log(1-x^3)-\log(1-x)-\log(1-x^4)+\log(1-x^2)$。`,String.raw`由 $\int_0^1\log(1-x^m)dx/x=-\pi^2/(6m)$，得到 $I=\frac{\pi^2}{6}(-1/3+1+1/4-1/2)=5\pi^2/72$。`]
}),
finalRow(2,4,{
 latex:String.raw`\int\frac{dx}{(x-1)\sqrt[4]{x^3+x}}`,kind:'indefinite',integrand:'1/((x-1)*(x^3+x)^(1/4))',answer:'(log((x+1-(8*x^3+8*x)^(1/4))/(x+1+(8*x^3+8*x)^(1/4)))+2*atan((8*x^3+8*x)^(1/4)/(x+1)))/(4*2^(1/4))',answerLatex:String.raw`\frac1{4\sqrt[4]2}\left(\log\frac{x+1-\sqrt[4]{8x^3+8x}}{x+1+\sqrt[4]{8x^3+8x}}+2\arctan\frac{\sqrt[4]{8x^3+8x}}{x+1}\right)`,technique:'substitution',domain:'實數域 x>0 且 x≠1；官方對數真數在這兩個區間皆為正。',samples:[0.12,0.3,0.55,1.8,3.2,6.5],
 hints:['比較 x+1 的四次方與分母根式中的多項式。','有 $(x+1)^4-8(x^3+x)=(x-1)^4$；考慮比值型換元。',String.raw`設 $u=\sqrt[4]{8x^3+8x}/(x+1)$，原式可化成 $u^2/(\sqrt[4]2(u^4-1))\,du$。`],
 steps:[step('哪個恆等式支持根式的比值型換元？',['(x+1)⁴−8(x³+x)=(x−1)⁴','(x+1)⁴−8(x³+x)=x⁴−1','(x+1)⁴=8(x³+x)'],0,'直接二項式展開，左右均為 x⁴−4x³+6x²−4x+1。')],
 solution:[String.raw`設 $u=\sqrt[4]{8x^3+8x}/(x+1)$。由 $(x+1)^4-8(x^3+x)=(x-1)^4$，在 x>0、x≠1 上有0<u<1。`,String.raw`微分得 $u\prime/u=-(x-1)^3/[4x(x^2+1)(x+1)]$。配合 $u^4-1=-(x-1)^4/(x+1)^4$，原式為 $u^2/(\sqrt[4]2(u^4-1))\,du$。`,String.raw`一個原函數為 $[\log((1-u)/(1+u))+2\arctan u]/(4\sqrt[4]2)$；微分括號得到 $4u^2/(u^4-1)$。`,'代回u即得所列答案；對數比值為正。x=1 是原式極點，兩側積分常數可分別選擇。']
}),
finalRow(3,6,{
 latex:String.raw`\lim_{n\to\infty}\int_0^{2026}\underbrace{\log_{\sqrt2}\!\left(x+\log_{\sqrt2}\!\left(x+\cdots+\log_{\sqrt2}(x+2026)\cdots\right)\right)}_{n\text{ 個對數}}\,dx`,kind:'definite',integrand:null,answer:'44806-4088/log(2)',answerLatex:String.raw`44806-\frac{4088}{\log2}`,technique:'substitution',domain:'由最內層初始值2026迭代；x∈[0,2026]。取對數底數為√2。',
 hints:['對固定 x，將巢狀對數視為一個反覆迭代。',String.raw`極限 y 滿足 $y=\log_{\sqrt2}(x+y)$，所以 x 可寫成 y 的初等函數。`,'用 $x=2^{y/2}-y$ 換元；由初始值選到的分支，x=0、2026 對應 y=4、22。'],
 steps:[step('固定點關係 y=log√2(x+y) 等價於？',['x=2^(y/2)−y','x=2^y−y','x=√2·y−y'],0,'(√2)^y=2^(y/2)=x+y。')],
 solution:[String.raw`令 y₀=2026、$y_{m+1}=\log_{\sqrt2}(x+y_m)$。對0≤x≤2026，迭代由上方遞減且保持 y≥4；在 y≥4 的導數至多 $2/(4\log2)<1$，故一致收斂到此分支的固定點。`,'因此可將極限移入積分，並用 $x=2^{y/2}-y$ 換元。x=0 對應y=4，x=2026對應y=22。',String.raw`積分成為 $\int_4^{22}y[(\log2/2)2^{y/2}-1]dy$。`,String.raw`原函數為 $y2^{y/2}-(2/\log2)2^{y/2}-y^2/2$；代入得 $44806-4088/\log2$。注意4088是除以log2。`]
}),
finalRow(4,8,{
 latex:String.raw`\int_0^{1/4}\left(\left\lfloor\sqrt[4]{\frac1x-4}\right\rfloor^2+\left\lfloor\sqrt[4]{\frac1x-4}\right\rfloor\right)\,dx`,kind:'definite',integrand:null,answer:'3/4',answerLatex:String.raw`\frac34`,technique:'discrete',domain:'0<x≤1/4；第一項為「先取整，再平方」。x=0 以廣義積分處理。',
 hints:['被積函數是 N²+N，其中 N 是非負整數值函數。',String.raw`利用 $N^2+N=\sum_{k=1}^N2k$，逐層計算每個整數k對應的x區間長度。`,'第k層的長度是1/(k⁴+4)；用 Sophie Germain identity 對級數作望遠鏡化簡。'],
 steps:[step('floor((1/x−4)^(1/4))≥k 等價於？',['0<x≤1/(k⁴+4)','0<x≤1/(k²+4)','x≥1/(k⁴+4)'],0,'四次方後 1/x−4≥k⁴，再取正倒數。')],
 solution:[String.raw`令 $N=\lfloor(1/x-4)^{1/4}\rfloor$。因 $N^2+N=\sum_{k=1}^N2k$ 且各項非負，可交換求和與積分。`,String.raw`故所求為 $\sum_{k=1}^\infty2k/(k^4+4)$。`,String.raw`分解 $k^4+4=((k-1)^2+1)((k+1)^2+1)$，每項等於 $\frac12[1/((k-1)^2+1)-1/((k+1)^2+1)]$。`,String.raw`望遠鏡求和只留下 $\frac12(1+1/2)=3/4$。`]
}),
finalRow(5,10,{
 latex:String.raw`\int_{-\infty}^\infty\left(\left(\frac1{x-2}+\frac3{x-4}+\frac5{x-6}\right)^{-2}+1\right)^{-1}\,dx`,kind:'definite',integrand:null,answer:'9*pi',answerLatex:String.raw`9\pi`,technique:'advanced',domain:'以連續延伸處理有限個原表示式未定義的點，不影響廣義積分。',
 hints:['先令 S(x) 為三個分式的和，把雙重倒數化簡。','被積函數為 $S(x)^2/(1+S(x)^2)$。S 的三個留數皆為正，總和為9。','考慮上半平面的 $F(z)=S(z)/(S(z)-i)$；它無極點，且無窮遠 F(z)∼9i/z。'],
 steps:[step('化簡 (S⁻²+1)⁻¹ 後得到？',['S²/(1+S²)','1/(1+S²)','S/(1+S)'],0,'將分母通分：(1+S²)/S²，再取倒數。')],
 solution:['令 $S(z)=1/(z-2)+3/(z-4)+5/(z-6)$。對 Im z>0，Im S(z)<0，因此 S(z)−i不為0。','$F(z)=S(z)/(S(z)-i)$ 在上半平面全純；實軸的三個原極點在 F 中可去。且 $F(z)=9i/z+O(1/z^2)$。',String.raw`沿上半圓積分，圓弧貢獻趨於 $-9\pi$，故實軸上的對稱極限積分為9π。`,String.raw`取實部，$\operatorname{Re}F(x)=S(x)^2/(1+S(x)^2)$ 可積，所求即9π。這使用正留數保證無上半平面極點；並非任意有理函數皆成立。`],
 mistakes:[{expr:'pi',message:'每一個正留數都影響無窮遠主項；此處留數總和是1+3+5，不是1。'}]
})
];
