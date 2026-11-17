export const ROUND_INFO={
 qualifier:{label:'資格賽',english:'Qualifier',count:20,timeSeconds:null,timeLabel:'20 題 / 20 分鐘',url:'https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_test.pdf',description:'從速度與基本結構辨認開始。完整保留 2026 年資格賽的 20 題。'},
 regular:{label:'常規賽',english:'Regular Season',count:20,timeSeconds:120,timeLabel:'每題 2 分鐘',url:'https://math.mit.edu/~yyao1/pdf/2026_regular_season.pdf',description:'20 道正賽題，練習在短時間內找到結構、對稱與巧妙換元。'},
 quarterfinal:{label:'四分之一決賽',english:'Quarterfinals',count:12,timeSeconds:180,timeLabel:'每題 3 分鐘',url:'https://math.mit.edu/~yyao1/pdf/2026_quarterfinal.pdf',description:'四場對賽的全部已用題目，另含 1 道官方加賽題。'},
 semifinal:{label:'準決賽',english:'Semifinals',count:9,timeSeconds:240,timeLabel:'每題 4 分鐘',url:'https://math.mit.edu/~yyao1/pdf/2026_semifinal.pdf',description:'兩場準決賽各 4 題，另含 1 道官方加賽題。'},
 final:{label:'決賽',english:'Finals',count:5,timeSeconds:300,timeLabel:'每題 5 分鐘',url:'https://math.mit.edu/~yyao1/pdf/2026_finals.pdf',description:'最後 5 題：從代數結構到分段、級數與進階積分工具。'}
};
export const ROUND_KEYS=Object.keys(ROUND_INFO);
export const archivedProblems=problems=>problems.filter(p=>p.origin==='archive');
export function roundProblems(problems,round){return problems.filter(p=>p.origin==='archive'&&p.round===round);}
export function matchGroups(problems,round){
 const rows=roundProblems(problems,round),matches=[...new Set(rows.map(p=>p.match??null))];
 return matches.map(match=>({match,problems:rows.filter(p=>(p.match??null)===match),label:match==='tiebreaker'?'官方加賽 · Tiebreaker':match?`${ROUND_INFO[round].english} #${match}`:ROUND_INFO[round].english}));
}
export function sessionTitle(s){return s.mode==='stage'?`${ROUND_INFO[s.round]?.label||'賽季'}逐題演練${s.match==='tiebreaker'?' · 加賽':s.match?' · 第 '+s.match+' 場':''}`:s.mode==='qualifier'?'20 分鐘資格賽':'單人淘汰挑戰';}
export const perQuestionSession=s=>s?.mode==='stage'||s?.mode==='knockout';
