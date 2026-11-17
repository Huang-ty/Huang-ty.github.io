import {PROBLEMS,TECHNIQUES} from './problems.js';
import {ROUND_INFO,ROUND_KEYS,roundProblems,matchGroups,sessionTitle,perQuestionSession} from './season.js';
import {freshState,safeLoad,validateState,STORAGE_KEY,recordAttempt,dueIds,setReviewInterval,examRemaining} from './state.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const math=(s,display=false)=>`<span class="math${display?' display':''}" data-tex="${esc(s)}"></span>`;
const prose=s=>String(s).split(/\$([^$]+)\$/g).map((s,i)=>i%2?math(s):esc(s)).join('');
const label={season:'2026 完整賽季',train:'開始訓練',archive:'題目圖書館',review:'間隔複習',modes:'限時挑戰',dashboard:'學習足跡',sources:'來源與使用說明'};
let state=safeLoad(localStorage),page='train',active=PROBLEMS.find(p=>p.id===state.current)||PROBLEMS[0],reviewing=false;
let practice={},busy=false,worker=null,checkEpoch=0,filters={origin:'all',round:'all',technique:'all',search:''};
function blankPractice(){return {input:'',attempts:0,hints:0,stepIndex:0,stepTried:false,stepFeedback:'',stepCorrect:false,technique:null,feedback:null,revealed:false,correct:false};}
function progress(){return practice[active.id]||(practice[active.id]=blankPractice());}
function save(){state.practice=practice;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{toast('儲存空間不足或無法使用，請匯出備份。');}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toast.id);toast.id=setTimeout(()=>$('#toast').classList.remove('show'),4000);}
function renderMath(){document.querySelectorAll('[data-tex]').forEach(el=>{try{window.katex.render(el.dataset.tex,el,{throwOnError:false,displayMode:el.classList.contains('display'),strict:'ignore',trust:false});}catch{el.textContent=el.dataset.tex;}});}
function heading(k,title,sub,actions=''){return `<div class="page-heading"><div><div class="eyebrow">${k}</div><h1>${title}</h1><p class="subtext">${sub}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>`;}
function badge(p){return `<span class="badge ${p.origin==='archive'?'archive':'original'}">${p.origin==='archive'?'✓ MIT 存檔已核對':'◇ 原創練習變式'}</span>`;}
const srcLabel=p=>p.origin==='archive'?(p.sourceLabel||`${p.year} ${p.roundLabel} · #${String(p.number).padStart(2,'0')}`):'INTEGRAL LAB · VARIANT';
const stars=p=>'●'.repeat(p.difficulty)+'○'.repeat(3-p.difficulty);
function selectProblem(id,review=false){if(busy)return;const p=PROBLEMS.find(p=>p.id===id);if(!p)return;active=p;state.current=id;reviewing=review;save();navigate('train');}
function navigate(to){if(busy){toast('正在驗證答案，請稍候。');return;}page=label[to]?to:'train';location.hash=page;render();window.scrollTo({top:0,behavior:'instant'});}
function render(){
 $('#section-name').textContent=label[page];document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));
 $('#review-count').textContent=dueIds(state).length;$('#library-count').textContent=PROBLEMS.length;
 $('#view').innerHTML=({season:renderSeason,train:renderTrain,archive:renderArchive,review:renderReview,modes:renderModes,dashboard:renderDashboard,sources:renderSources}[page])();renderMath();updateTimer();
}
function techniqueOptions(p){const keys=Object.keys(TECHNIQUES);const i=keys.indexOf(p.technique);return keys.filter((k,j)=>k===p.technique||[1,3,5].includes((j-i+keys.length)%keys.length)).sort((a,b)=>a.localeCompare(b));}
function renderTrain(){
 const p=active,s=progress(),exam=state.session&&!state.session.finished;
 if(exam && !state.session.ids.includes(p.id)){active=PROBLEMS.find(p=>p.id===state.session.ids[state.session.index]);return renderTrain();}
 const r=state.records[p.id],totalSolved=Object.values(state.records).filter(r=>r.solved>0).length;
 const originLinks=p.origin==='archive'?`<a target="_blank" rel="noopener" href="${p.testUrl}#page=${p.page}">${p.round==='qualifier'?'官方題面':'官方 PDF（含答案）'} ↗</a>`:'由本站設計，並非 MIT 存檔題';
 const canReveal=s.correct||s.attempts>=2;
 const examRecord=exam?state.session.answers[p.id]:null;
 return heading(exam?'TIMED PRACTICE':'A LITTLE PRACTICE, A NEW PERSPECTIVE',exam?sessionTitle(state.session):'從一個積分，練習一種思考。',exam?'獨立訓練模擬 · 計時期間隱藏提示與解答。':reviewing?'複習模式：重新提取解題思路，比重讀答案更有用。':'先觀察結構，再選擇工具。卡住時，一次只拿一點提示。',exam?`<span class="timer" id="timer">20:00</span>`:`<button class="secondary" data-nav="season">2026 全季 66 題 ↗</button><button class="secondary" data-action="random">隨機一題 ↗</button>`)+
 (exam?`<div class="exam-banner"><div><strong>${state.session.mode==='stage'?`${ROUND_INFO[state.session.round].english.toUpperCase()} · ${state.session.ids.length} 題 / 每題 ${ROUND_INFO[state.session.round].timeSeconds/60} 分鐘`:state.session.mode==='qualifier'?'QUALIFIER · 20 題 / 20 分鐘':'KNOCKOUT · 5 題 / 每題 90 秒'}</strong><p>${state.session.mode==='stage'?'依官方每題時限，提交或跳題後進入下一題；逾時自動換題，結束後統一回顧。單人演練不模擬真實對手或晉級。':state.session.mode==='qualifier'?'可跳題、修改答案；結束後統一回饋。':'每題僅一次提交；答錯、未證實或逾時即結束。此為單人模擬。'}</p></div><button class="ghost" data-action="finish-exam">結束挑戰</button></div><div class="exam-nav">${state.session.ids.map((id,i)=>`<button data-exam-index="${i}" class="${id===p.id?'current':''} ${state.session.answers[id]?'done':''}" aria-label="第 ${i+1} 題${state.session.answers[id]?'（已提交）':''}" ${perQuestionSession(state.session)&&i!==state.session.index?'disabled':''}>${i+1}</button>`).join('')}</div>`:'')+
 `<div class="training-layout"><div class="workspace"><section class="problem-card" aria-label="積分題目"><div class="problem-top">${badge(p)}<span class="problem-meta">${srcLabel(p)}${p.timeSeconds?` · ${p.timeSeconds/60}′`:``}</span><span class="difficulty" aria-label="難度 ${p.difficulty} / 3">${stars(p)}</span></div><div class="problem-math">${math(p.latex,true)}</div><div class="domain-note">${esc(p.domain)}</div><div class="problem-bottom"><span>${p.kind==='indefinite'?'求一個原函數 · Antiderivative':p.latex.startsWith('\\lim')?'求極限值 · Limit':'求表達式的值 · Value'}</span><small>${originLinks}</small></div></section>`+
 (!exam?`<section class="technique-box"><div class="card-heading"><span class="step-label">01</span><div><h2>你會從哪裡開始？</h2><p>辨認技巧 · Technique recognition</p></div><span class="optional">選做</span></div><div class="choice-grid">${techniqueOptions(p).map(k=>`<button class="choice ${s.technique===k?(k===p.technique?'right':'wrong'):''}" data-technique="${k}">${esc(TECHNIQUES[k])}</button>`).join('')}</div>${s.technique?`<p class="technique-feedback">${s.technique===p.technique?'✓ 這是一個合適的切入點。試著寫出第一步。':'這個方向也許值得探索；先檢查它能否簡化題目的結構。'}</p>`:''}</section>`:'')+
 `<section class="answer-card"><div class="card-heading"><span class="step-label">${exam?'→':'02'}</span><div><h2>把你的想法寫下來</h2><p>${exam?'提交後保留作答，挑戰結束再揭曉。':p.kind==='indefinite'?'輸入原函數，再用微分檢查你的思路。':'輸入精確式或數值，核對你的結果。'}</p></div></div><form id="answer-form"><label class="input-label" for="answer">${p.kind==='indefinite'?'你的原函數 F(x)':'你的答案（精確式或數值）'}</label><div class="answer-row"><input id="answer" name="answer" value="${esc(exam?(state.session.inputs[p.id]??examRecord?.input??''):s.input)}" placeholder="${p.kind==='indefinite'?'例如 x^2/2 + C':'例如 pi/4 或 sqrt(2)'}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="320" aria-describedby="input-help"><button class="primary" type="submit" ${busy||s.correct&&!exam?'disabled':''}>${busy?'驗證中…':exam?'提交答案 →':s.correct?'已驗證 ✓':'驗證答案 →'}</button></div><div class="math-keyboard" aria-label="數學輸入工具">${['x','^','sqrt(','sin(','cos(','log(','pi','(' ,')'].map(k=>`<button type="button" data-key="${esc(k)}">${esc(k)}</button>`).join('')}</div><p class="input-help" id="input-help">使用 ^ 次方、sqrt()、log() = ln、exp()；三角函數用弧度。指數含乘法或加法時請加括號，例如 e^(2*x)。${p.kind==='indefinite'?'可省略積分常數 C。':''}${p.answerInputHelp?' '+esc(p.answerInputHelp):''}</p><div class="input-preview" id="input-preview" aria-label="答案預覽"></div></form>${examRecord?'<div class="feedback inconclusive">答案已儲存。挑戰結束後顯示驗證結果。</div>':s.feedback?`<div class="feedback ${s.feedback.status}" role="status"><strong>${s.feedback.status==='correct'?'✓ 驗證通過':s.feedback.status==='incorrect'?'再檢查一下':s.feedback.status==='invalid'?'輸入需要調整':'尚未證實'}</strong><p>${esc(s.feedback.message)}</p>${s.feedback.detail?`<small>${esc(s.feedback.detail)}</small>`:''}</div>`:''}</section>`+
 (!exam?`<section class="coach-card"><div class="card-heading"><span class="step-label">03</span><div><h2>需要一點方向嗎？</h2><p>Progressive hints · 由觀察到關鍵步驟</p></div><span class="pill">${s.hints} / ${p.hints.length}</span></div>${p.hints.slice(0,s.hints).map((h,i)=>`<div class="hint-item"><span class="hint-number">${i+1}</span><p>${prose(h)}</p></div>`).join('')}<button class="secondary" data-action="hint" ${s.hints>=p.hints.length?'disabled':''}>${s.hints===0?'給我一個不劇透的提示 ↗':s.hints>=p.hints.length?'提示已全部展開':'再給我一點提示 ↗'}</button>${s.hints>0?'<small class="assistance-note">已使用提示：本次會記為輔助完成。</small>':''}</section>`+
 `<section class="scaffold"><div class="card-heading"><span class="step-label">↳</span><div><h2>一步一步拆解</h2><p>Scaffolded steps · 主動選擇你的下一步</p></div></div>${s.hints===0&&!s.stepTried?'<p>想用小步驟繼續？先自己想想，再開啟引導。</p><button class="ghost" data-action="scaffold">開啟分步練習 →</button>':renderStep(p,s)}</section>`+
 `<section class="solution-card"><div class="card-heading"><div><h2>${s.revealed?'解題回顧 · Worked solution':'解答，留到思考之後。'}</h2><p>本站撰寫的推導；存檔題的最終答案已與官方答案核對。</p></div></div>${s.revealed?`<ol>${p.solution.map(t=>`<li>${prose(t)}</li>`).join('')}</ol><div class="final-answer">${math(p.answerLatex+(p.kind==='indefinite'?'+C':''),true)}</div>${p.origin==='archive'?`<a href="${p.answerUrl}#page=${p.answerPage??p.page}" target="_blank" rel="noopener">核對官方答案 ↗</a>`:''}${p.officialAnswerLatex?`<details class="source-correction"><summary>官方答案形式與實數域說明</summary>${math(p.officialAnswerLatex,true)}<p>${prose(p.sourceNote||'本站答案採所列實數域的等價形式。')}</p></details>`:p.sourceNote?`<p class="notice">${prose(p.sourceNote)}</p>`:''}<p class="subtext">下次何時複習？</p><div class="action-row"><button class="secondary" data-review-days="1">有點難 · 明天</button><button class="secondary" data-review-days="3">還可以 · 3 天</button><button class="secondary" data-review-days="7">很熟悉 · 7 天</button></div>`:`<p>${canReveal?'你已經有過嘗試，可以回顧推導。':'先完成兩次有效作答，或成功驗證一次答案，才會開放解答。無法解析的輸入不算嘗試。'}</p><button class="secondary" data-action="solution" ${canReveal?'':'disabled'}>${canReveal?'回顧完整解題過程':'⌑ 解答尚未解鎖'} · ${s.attempts} 次嘗試</button>`}</section>`:'')+
 `<div class="action-row bottom-actions">${exam?`<button class="secondary" data-action="exam-prev" ${perQuestionSession(state.session)||state.session.index===0?'disabled':''}>← 上一題</button><button class="primary" data-action="exam-next" ${state.session.mode==='knockout'?'disabled':''}>${state.session.index===state.session.ids.length-1?'完成挑戰':state.session.mode==='stage'?'略過此題 →':'跳至下一題 →'}</button>`:`<span class="subtext">${r?.solved?'已完成 · 下次複習 '+dateLabel(r.due):'每次嘗試，都在建立解題直覺。'}</span><button class="primary" data-action="next">${reviewing?'下一題複習':'繼續練習'} →</button>`}</div></div>`+
 `<aside class="training-rail"><section class="session-card"><div class="eyebrow">YOUR LEARNING, YOUR PACE</div><h2>一點一點，積少成多。</h2><div class="session-ring"><svg viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="50" fill="none" stroke="#e7edda" stroke-width="4"/><circle cx="55" cy="55" r="50" fill="none" stroke="#8da965" stroke-width="4" stroke-dasharray="${totalSolved/PROBLEMS.length*314.159} 314.159"/></svg><span><strong>${totalSolved}</strong><small> / ${PROBLEMS.length} 題完成</small></span></div><div class="session-metrics"><div class="metric"><strong>${state.history.filter(h=>h.status==='correct').length}</strong><span>驗證通過</span></div><div class="metric"><strong>${dueIds(state).length}</strong><span>待複習</span></div></div><button class="ghost" data-nav="dashboard">查看學習足跡 ↗</button></section><section class="journey"><h3>這次練習的路徑</h3>${['觀察題目結構','辨認可能技巧','嘗試並驗證','回顧與間隔複習'].map((t,i)=>`<div class="journey-item ${i===0||i===1&&s.technique||i===2&&s.attempts||i===3&&s.revealed?'done':i===2?'current':''}"><span>${i+1}</span>${t}</div>`).join('')}</section><section class="tip-card"><span class="tip-symbol">“</span><h3>先問一個好問題</h3><p>有沒有某個部分，剛好是另一個部分的導數？</p><small>LOOK FOR STRUCTURE</small></section></aside></div>`;
}
function renderStep(p,s){const steps=p.steps||[];const step=steps[s.stepIndex];if(!step)return '<p class="notice">✓ 分步練習已完成。回到答案欄，把思路組合起來。</p>';
 return `<div class="step-progress">步驟 ${s.stepIndex+1} / ${steps.length}</div><p>${prose(step.prompt)}</p><div class="step-options">${step.options.map((x,i)=>`<button class="step-option" data-step="${i}" ${s.stepCorrect?'disabled':''}>${prose(x)}</button>`).join('')}</div>${s.stepFeedback?`<div class="feedback ${s.stepCorrect?'correct':'incorrect'}">${prose(s.stepFeedback)}</div>`:''}${s.stepCorrect?'<button class="ghost" data-action="step-next">繼續下一步 →</button>':''}`;
}
function dateLabel(n){const d=new Date(n);return Number.isFinite(n)?d.toLocaleDateString('zh-HK',{month:'short',day:'numeric'}):'—';}
function renderSeason(){
 const archived=PROBLEMS.filter(p=>p.origin==='archive'),solved=archived.filter(p=>state.records[p.id]?.solved>0).length;
 return heading('THE COMPLETE 2026 SEASON','從資格賽，一路練到決賽。','官方公開存檔的全部 66 題，按比賽階段排列，包含兩道加賽題。每題都有漸進提示、分步引導與核對答案。',`<button class="primary" data-round-practice="season">按全季順序練習 →</button>`)+
 `<div class="season-summary"><div><span class="eyebrow">2026 ARCHIVE · COMPLETE</span><h2>${solved}<small> / ${archived.length} 題完成</small></h2></div><p>5 個階段 · 66 道正式題 · 4 道原創變式另列<br>題目、答案與時限已逐頁核對 MIT 官方 PDF。</p><div class="progress-track"><div class="progress-fill" style="width:${solved/archived.length*100}%"></div></div></div>`+
 `<div class="season-path">${ROUND_KEYS.map((key,i)=>{const info=ROUND_INFO[key],ps=roundProblems(PROBLEMS,key),done=ps.filter(p=>state.records[p.id]?.solved>0).length,groups=matchGroups(PROBLEMS,key);return `<article class="season-stage" id="stage-${key}"><div class="stage-number">${String(i+1).padStart(2,'0')}</div><div class="stage-content"><div class="stage-heading"><div><span class="eyebrow">${info.english.toUpperCase()}</span><h2>${info.label}</h2></div><span class="badge archive">${ps.length} 題 · ${info.timeLabel}</span></div><p>${info.description}</p><div class="stage-progress"><div class="bar"><div class="bar-fill" style="width:${done/ps.length*100}%"></div></div><span>${done} / ${ps.length} 完成</span></div><div class="action-row"><button class="primary" data-round-practice="${key}">開始${info.label}訓練 →</button><button class="secondary" data-round-library="${key}">瀏覽全部題目</button><a href="${info.url}" target="_blank" rel="noopener">${key==='qualifier'?'官方題本':'官方 PDF（含答案）'} ↗</a></div><div class="stage-groups">${groups.map(g=>`<div class="stage-group"><div><strong>${g.label}</strong><small>${g.problems.length} 題${g.match==='tiebreaker'?' · 官方存檔加賽':''}</small></div><div class="stage-problem-links">${g.problems.map(p=>`<button data-problem="${p.id}" class="${state.records[p.id]?.solved?'completed':''}" aria-label="練習 ${esc(srcLabel(p))}">${p.number}${state.records[p.id]?.solved?' ✓':''}</button>`).join('')}</div>${key==='qualifier'?'<button class="ghost" data-start="qualifier">20 分鐘演練 →</button>':`<button class="ghost" data-stage-timed="${key}" data-match="${g.match??''}">按官方時限演練 →</button>`}</div>`).join('')}</div></div></article>`;}).join('')}</div><div class="source-card"><h3>「全季」的範圍</h3><p>收錄 MIT 官方頁面公開的 2026 qualifier 及四階段正賽 PDF 中所有已使用題目。官方註明正賽存檔只列實際使用的題目，因此沒有把未公開的備用題算入。本站的單人逐題演練採官方時限，但不模擬對手、種子、晉級或真實比分。</p><a href="https://math.mit.edu/~yyao1/integrationbee.html" target="_blank" rel="noopener">官方存檔與比賽格式 ↗</a></div>`;
}

function renderArchive(){
 const problems=PROBLEMS.filter(p=>(filters.origin==='all'||p.origin===filters.origin)&&(filters.round==='all'||p.round===filters.round)&&(filters.technique==='all'||p.technique===filters.technique)&&(`${p.id} ${srcLabel(p)} ${p.year||''} ${p.number||''} ${TECHNIQUES[p.technique]} ${ROUND_INFO[p.round]?.label||'原創'}`).toLowerCase().includes(filters.search.toLowerCase()));
 return heading('THE PROBLEM LIBRARY','每一道題，都有來處。','2026 全季 66 題官方存檔 + 4 題原創變式。按階段選題，解法留在練習之後。',`<button class="secondary" data-nav="season">查看完整賽季路線 ↗</button>`)+`<div class="filter-row"><label>來源 <select id="origin-filter"><option value="all">全部來源</option><option value="archive" ${filters.origin==='archive'?'selected':''}>MIT 官方存檔</option><option value="original" ${filters.origin==='original'?'selected':''}>原創變式</option></select></label><label>賽季階段 <select id="round-filter"><option value="all">全部階段</option>${ROUND_KEYS.map(k=>`<option value="${k}" ${filters.round===k?'selected':''}>${ROUND_INFO[k].label} · ${ROUND_INFO[k].english}</option>`).join('')}<option value="original" ${filters.round==='original'?'selected':''}>原創變式</option></select></label><label>專項訓練 <select id="tech-filter"><option value="all">不預先提示技巧</option>${Object.entries(TECHNIQUES).map(([k,v])=>`<option value="${k}" ${filters.technique===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label class="search-label">搜尋 <input id="archive-search" value="${esc(filters.search)}" placeholder="階段、場次、題號或技巧"></label><span>${problems.length} 題</span></div><div class="archive-grid">${problems.map(p=>`<article class="archive-card"><div class="problem-top">${badge(p)}<span class="archive-number">${p.origin==='archive'?'#'+String(p.number).padStart(2,'0'):'VARIANT'}</span></div><div class="archive-equation">${math(p.latex,true)}</div><div class="archive-footer"><span>${srcLabel(p)}<br><small>${stars(p)}${p.timeSeconds?' · '+p.timeSeconds/60+' 分鐘':''} · ${state.records[p.id]?.solved?'已完成 ✓':'尚未完成'}</small></span><button class="secondary" data-problem="${p.id}">練習 →</button></div></article>`).join('')}</div>${problems.length?'':'<div class="empty-state">找不到符合條件的題目，試試放寬篩選。</div>'}`;
}

function renderReview(){const ids=dueIds(state),later=Object.entries(state.records).filter(([,r])=>r.due>Date.now()).sort((a,b)=>a[1].due-b[1].due);return heading('RETRIEVE, THEN REMEMBER','讓解法，真的留下來。','錯題立即回到佇列；獨立完成後依序安排 1、3、7、14、30 天複習。提示或看過解答後完成，預設明天再練。')+`<div class="dashboard-grid"><div class="stat-card"><div class="stat-label">現在可以複習</div><div class="stat-number">${ids.length}</div></div><div class="stat-card"><div class="stat-label">已安排的下一次練習</div><div class="stat-number">${later.length}</div></div></div><section class="panel"><div class="panel-title"><h2>待複習佇列</h2>${ids.length?`<button class="primary" data-review="${ids[0]}">開始複習 →</button>`:''}</div>${ids.length?`<div class="review-list">${ids.map(id=>reviewRow(id,true)).join('')}</div>`:'<div class="empty-state"><span class="empty-icon">↻</span><h3>此刻，沒有到期的題目。</h3><p>先完成幾道訓練，這裡會按你的作答安排複習。</p><button class="secondary" data-nav="train">去練一題 →</button></div>'}</section>${later.length?`<section class="panel"><h2>接下來的複習</h2>${later.map(([id])=>reviewRow(id,false)).join('')}</section>`:''}`;}
function reviewRow(id,due){const p=PROBLEMS.find(p=>p.id===id);if(!p)return '';const r=state.records[id];return `<div class="review-card"><div><strong>${srcLabel(p)}</strong><p>${due?'已到期':dateLabel(r.due)} · ${r.attempts} 次嘗試 · ${r.solved} 次完成</p></div><button class="secondary" data-review="${id}">${due?'重新提取':'提前練習'} →</button></div>`;}
function renderModes(){const s=state.session;return heading('A LITTLE PRESSURE, A CLEARER MIND','把直覺，放進時間裡。','先慢慢學，再練速度。以下皆為獨立訓練模擬，不代表 MIT 官方賽制。')+(s&&!s.finished?`<div class="notice"><strong>你有一場進行中的挑戰。</strong> 計時會持續，不因切換頁面暫停。<button class="primary" data-action="resume-exam">繼續挑戰 →</button></div>`:'')+`<div class="mode-grid"><article class="mode-card"><div class="mode-icon">20′</div><div class="mode-meta">QUALIFYING ROUND</div><h2 class="mode-title">20 分鐘資格賽</h2><p class="mode-description">2026 年官方 qualifier 完整 20 題。可跳題與修改答案，結束後一次回顧。</p><div class="mode-tags"><span class="pill">20 題</span><span class="pill">20 分鐘</span><span class="pill">無提示</span></div><button class="primary" data-start="qualifier" ${s&&!s.finished?'disabled':''}>開始資格賽 →</button></article><article class="mode-card"><div class="mode-icon">90″</div><div class="mode-meta">SOLO KNOCKOUT</div><h2 class="mode-title">單人淘汰挑戰</h2><p class="mode-description">從全季存檔題隨機抽 5 題，每題 90 秒。一次提交，答對晉級；未通過或逾時則結束。</p><div class="mode-tags"><span class="pill">最多 5 題</span><span class="pill">90 秒 / 題</span><span class="pill">單人模擬</span></div><button class="primary" data-start="knockout" ${s&&!s.finished?'disabled':''}>接受挑戰 →</button></article></div><section class="panel season-timed-entry"><div><span class="eyebrow">FOLLOW THE 2026 SEASON</span><h2>正賽逐題計時演練</h2><p>常規賽每題 2 分鐘；四分之一決賽 3 分鐘；準決賽 4 分鐘；決賽 5 分鐘。包含官方加賽題。</p></div><button class="primary" data-nav="season">選擇賽季階段 →</button></section>${s?.finished?renderExamResults(s):''}<div class="source-card"><h3>與官方賽制的關係</h3><p>官方 qualifier 是 20 題、20 分鐘。本網站保留此題數與時間；單人淘汰模式由本站設計，並非 MIT 實際多人賽的重現。驗證受支援語法與符號引擎能力限制，未證實答案不計為通過。</p><a href="https://math.mit.edu/~yyao1/integrationbee.html" target="_blank" rel="noopener">閱讀官方比賽與存檔說明 ↗</a></div>`;}
function renderExamResults(s){const count=Object.values(s.answers).filter(a=>a.status==='correct').length;return `<section class="panel"><div class="eyebrow">LAST SESSION</div><h2>${sessionTitle(s)} · ${count} / ${s.ids.length}</h2><p>${esc(s.reason)} · ${new Date(s.endedAt).toLocaleString('zh-HK')}</p><p>符號或容許誤差內驗證通過 ${count} 題。未作答或未證實的題目不計分；可回到訓練繼續嘗試。</p><div class="result-list">${s.ids.map(id=>{const p=PROBLEMS.find(p=>p.id===id),a=s.answers[id];return `<div class="result-row"><div><strong>${srcLabel(p)}</strong><p>${a?esc(a.status==='correct'?'✓ 通過':a.status==='incorrect'?'尚未答對':a.status==='invalid'?'輸入無法解析':'尚未證實')+' · '+esc(a.message):'未作答'}</p>${a?`<small>你的答案：${esc(a.input)}</small>`:''}</div><button class="secondary" data-problem="${id}">回到訓練 →</button></div>`;}).join('')}</div></section>`;}
function renderDashboard(){const records=Object.values(state.records),hist=state.history,success=hist.filter(h=>h.status==='correct'),independent=success.filter(h=>!h.hinted&&!h.revealed).length;const days=new Set(hist.map(h=>new Date(h.at).toLocaleDateString('en-CA'))).size;return heading('SMALL STEPS, VISIBLE GROWTH','看見思考的足跡。','記錄來自你的實際作答；答對、輔助完成與尚未證實會分開呈現。')+`<div class="dashboard-grid">${[[records.filter(r=>r.solved>0).length+'/'+PROBLEMS.length,'已完成的不同題目'],[independent,'無提示且未看解答的完成次數'],[hist.length?Math.round(success.length/hist.length*100)+'%':'—','所有有效作答的通過比例'],[days,'有練習的日子']].map(([n,t])=>`<div class="stat-card"><div class="stat-label">${t}</div><div class="stat-number">${n}</div></div>`).join('')}</div><section class="panel"><div class="panel-title"><h2>技巧練習地圖</h2><small>以不同題目的完成比例計算</small></div>${Object.entries(TECHNIQUES).map(([k,v])=>{const ps=PROBLEMS.filter(p=>p.technique===k),done=ps.filter(p=>state.records[p.id]?.solved>0).length;return `<div class="skill-row"><span>${esc(v)}</span><div class="bar"><div class="bar-fill" style="width:${ps.length?done/ps.length*100:0}%"></div></div><strong>${done} / ${ps.length}</strong><button class="ghost" data-skill="${k}">專項 →</button></div>`;}).join('')}</section><section class="panel"><h2>最近的作答</h2>${hist.length?hist.slice(-10).reverse().map(h=>{const p=PROBLEMS.find(p=>p.id===h.id);return `<div class="activity-row"><span class="activity-mark ${h.status}">${h.status==='correct'?'✓':h.status==='incorrect'?'↻':'?'}</span><div><strong>${p?srcLabel(p):esc(h.id)}</strong><p>${h.status==='correct'?h.hinted||h.revealed?'輔助完成':'獨立完成':h.status==='incorrect'?'繼續練習':'尚未證實'} · ${h.mode==='train'?'日常訓練':h.mode==='review'?'間隔複習':'限時挑戰'}</p></div><small>${dateLabel(h.at)}</small></div>`;}).join(''):'<div class="empty-state">還沒有作答紀錄。從一題開始，讓這裡慢慢長出你的學習路線。</div>'}</section><section class="source-card"><h3>你的進度，由你保存。</h3><p>資料儲存在這個瀏覽器的 localStorage，不會自動跨裝置同步。匯出檔案可以備份與轉移；清除瀏覽器資料會移除紀錄。</p><div class="action-row"><button class="secondary" data-action="export">匯出學習紀錄 ↓</button><label class="secondary file-label">匯入備份<input type="file" id="import-progress" accept="application/json,.json" hidden></label><button class="ghost danger" data-action="reset">清除所有進度</button></div></section>`;}
function renderSources(){return heading('TRANSPARENT BY DESIGN','題有出處，練有依據。','最後核對：2026 年 11 月 4 日 · 本站為獨立學習專案，未獲 MIT 隸屬、贊助或背書。')+`<section class="source-card"><h2>01 · 2026 全季官方題目與答案</h2><p>已逐頁核對 MIT 官方存檔的 qualifier 題本及答案，以及 Regular Season、Quarterfinals、Semifinals、Finals 四份題解合併 PDF。共收錄 66 道官方題目（含兩道加賽）與 4 道另列的原創變式。保留各題階段、場次、原題號、題目頁、答案頁及來源連結。</p><div class="source-links"><a target="_blank" rel="noopener" href="https://math.mit.edu/~yyao1/integrationbee.html">MIT 官方存檔索引 ↗</a>${ROUND_KEYS.map(k=>`<a target="_blank" rel="noopener" href="${ROUND_INFO[k].url}">${ROUND_INFO[k].english} 官方題本${k==='qualifier'?'':'（含答案，有劇透）'} ↗</a>`).join('')}<a target="_blank" rel="noopener" href="https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_answers.pdf">Qualifier 官方答案（有劇透）↗</a></div><p>題目與官方最終答案歸原作者。中文提示、分步引導、技巧標籤與推導均為本站獨立編寫。官方正賽存檔只包含實際使用的題目；未公開備用題不在本題庫範圍。</p></section><section class="source-card"><h2>02 · 答案如何驗證？</h2><p>不定積分先以獨立算式解析及自動微分檢查定義域內的反例，再以符號微分與題目或核對原函數比較。只有有限取樣相符時標為「尚未證實」，不計為答對；複雜分支或特殊形式可能無法自動核對。</p><p>一般定積分採符號等值比較，或絕對 10⁻¹⁰ 加相對 10⁻⁸ 的近似容差。Regular Season #1 的巨大指數超出浮點數範圍，會將固定的巨大指數項保留為符號，驗證其餘代數關係，並不把溢位當成答案無效。</p><p>輸入上限 320 字元；驗證工具載入完成後，才開始獨立 Worker 的 6 秒計算時限；載入失敗或超時不計入作答紀錄。使用 Nerdamer 1.1.13 與 KaTeX 0.16.22，執行不需外部 AI 服務。</p></section><section class="source-card"><h2>03 · 官方形式與實數定義域</h2><p>部分官方不定積分省略 log 的絕對值或採特定反函數分支。本站會列明訓練採用的實數域，必要時以 log|…| 等實數等價形式作驗證；解答開啟後可同時查閱官方原式與修正說明，不把修正冒充官方原文。</p><p>巢狀無窮式採明確的極限或指定分支詮釋；分段、floor、max/min 及極限題保留原始運算順序。中文推導不是 MIT 官方證明。</p></section><section class="source-card"><h2>04 · 訓練與進度</h2><p>兩次可解析作答或一次驗證成功後才開放解答。複習與進度沿用原先紀錄；新增題目使用不同 ID，不會覆蓋既有 qualifier 與原創題的學習紀錄。localStorage 儲存與匯出備份方式保持相同。</p><p>Qualifier 保留 20 題／20 分鐘；正賽單人逐題演練採官方 2／3／4／5 分鐘時限，提交、跳過或逾時後進入下一題。這是練習介面，未重現官方對手、種子與晉級賽果。90 秒 knockout 仍是本站自訂模式。</p></section><section class="source-card"><h2>05 · 逐題來源紀錄</h2><div class="table-wrap"><table class="source-table"><thead><tr><th>題目</th><th>題目來源</th><th>題目／答案頁</th><th>核對</th></tr></thead><tbody>${PROBLEMS.map(p=>`<tr><td>${esc(srcLabel(p))}</td><td>${p.origin==='archive'?`<a href="${p.testUrl}#page=${p.page}" target="_blank" rel="noopener">MIT 官方 PDF ↗</a>`:'本站原創'}</td><td>${p.page?`${p.page} / ${p.answerPage??p.page}`:'—'}</td><td>${p.origin==='archive'?'題面 + 官方答案':'獨立微分 / 計算'}</td></tr>`).join('')}</tbody></table></div></section>`;}

async function checkAnswer(input,p){
 const epoch=++checkEpoch;busy=true;const button=$('#answer-form button[type=submit]');if(button){button.disabled=true;button.textContent='正在載入驗證工具…';}
 return new Promise(resolve=>{
 let timeout,ready=false,settled=false;
 const finish=result=>{if(settled||epoch!==checkEpoch)return;settled=true;clearTimeout(timeout);worker?.terminate();worker=null;busy=false;resolve(result);};
 // Loading the Worker, CAS, and verifier is separate from the computation budget.
 // A cold cache or slow connection must not look like a difficult/wrong answer.
 timeout=setTimeout(()=>finish({status:'inconclusive',method:'load-timeout',message:'驗證工具尚未載入完成，可能是連線較慢。請稍後重試；這次不計入作答或學習紀錄。'}),30000);
 try{
  worker=new Worker('./check-worker.js?v=20261117b');
  worker.onmessage=({data})=>{
   if(epoch!==checkEpoch||settled)return;
   if(data.type==='ready'&&!ready){
    ready=true;clearTimeout(timeout);if(button)button.textContent='驗證中…';
    timeout=setTimeout(()=>finish({status:'inconclusive',method:'timeout',message:'工具已載入，但這個算式的計算超過 6 秒，暫時無法證實。請化簡後重試；這次不計入作答或學習紀錄。'}),6000);
    worker.postMessage({input,problem:p});
   }else if(data.type==='result'&&ready){finish(data.result);}
   else if(data.type==='load-error'){finish({status:'inconclusive',method:'load-error',message:'驗證工具載入失敗。請檢查連線後重試；這次不計入作答或學習紀錄。'});}
  };
  worker.onerror=worker.onmessageerror=()=>finish({status:'inconclusive',method:'error',message:'驗證工具暫時無法執行。請重新載入後重試；這次不計入作答或學習紀錄。'});
 }catch{finish({status:'inconclusive',method:'error',message:'瀏覽器無法啟動驗證工具。請重新載入或使用支援 Worker 的瀏覽器；這次不計入作答或學習紀錄。'});}
 });
}
async function submitAnswer(event){
 event.preventDefault();if(busy)return;
 const p=active,s=progress(),input=$('#answer').value.trim();s.input=input;
 if(!input){toast('先寫下你的答案，再試著驗證。');return;}
 const session=state.session&&!state.session.finished?state.session:null;
 if(session&&examRemaining(session)===0){if(session.mode==='stage')advanceStage('本題逾時未提交',true);else finishExam('時間到');return;}
 const result=await checkAnswer(input,p);
 if(verificationUnavailable(result)){
  s.feedback=result;save();render();return;
 }
 if(session){
  if(state.session!==session||session.finished){render();return;}
  if(examRemaining(session)===0){if(session.mode==='stage')advanceStage('本題作答超時未計入',true);else finishExam('時間到，最後一筆超時作答未計入');return;}
  if(result.status==='invalid'){s.feedback=result;render();toast(result.message);return;}
  session.answers[p.id]={...result,input,at:Date.now()};save();
  if(session.mode==='stage'){advanceStage();return;}
  if(session.mode==='knockout'){
   if(result.status!=='correct'){finishExam(result.status==='incorrect'?'本題未通過，挑戰結束':'本題未能證實，挑戰結束');return;}
   if(session.index===session.ids.length-1){finishExam('五題全部通過！');return;}
   session.index++;session.deadline=Date.now()+90000;active=PROBLEMS.find(p=>p.id===session.ids[session.index]);save();render();return;
  }
  render();toast('答案已儲存，挑戰結束後統一回饋。');return;
 }
 s.feedback=result;
 if(result.status!=='invalid'){
  s.attempts++;s.correct=result.status==='correct';
  recordAttempt(state,p.id,result,{hinted:s.hints>0||s.stepTried,revealed:s.revealed,mode:reviewing?'review':'train',input});save();
 }
 render();
}
function verificationUnavailable(result){return result.status==='inconclusive'&&['timeout','error','load-error','load-timeout'].includes(result.method);}
function startExam(mode){
 if(state.session&&!state.session.finished){toast('先繼續或結束目前的挑戰。');return;}
 const all=PROBLEMS.filter(p=>p.origin==='archive'&&(mode!=='qualifier'||p.round==='qualifier'));
 const ids=(mode==='qualifier'?all:shuffle(all).slice(0,5)).map(p=>p.id);
 state.session={mode,ids,index:0,answers:{},inputs:{},startedAt:Date.now(),deadline:Date.now()+(mode==='qualifier'?1200:90)*1000,finished:false};active=PROBLEMS.find(p=>p.id===ids[0]);save();navigate('train');
}
function startStage(round,matchValue){
 if(state.session&&!state.session.finished){toast('先繼續或結束目前的挑戰。');return;}
 if(!ROUND_INFO[round]||round==='qualifier')return;
 const match=matchValue==='tiebreaker'?'tiebreaker':matchValue?Number(matchValue):null;
 const rows=roundProblems(PROBLEMS,round).filter(p=>match===null||(p.match??null)===match);if(!rows.length)return;
 state.session={mode:'stage',round,match,ids:rows.map(p=>p.id),index:0,answers:{},inputs:{},startedAt:Date.now(),deadline:Date.now()+rows[0].timeSeconds*1000,finished:false};
 active=rows[0];save();navigate('train');
}
function advanceStage(reason='',expired=false){
 const session=state.session;if(!session||session.finished||session.mode!=='stage')return;
 if(busy){checkEpoch++;worker?.terminate();worker=null;busy=false;}
 const now=Date.now();
 do{
  const id=session.ids[session.index];
  if(reason&&!session.answers[id])session.answers[id]={status:'incorrect',method:expired?'timeout':'skipped',message:reason,input:session.inputs[id]||'',at:now};
  session.index++;
  if(session.index>=session.ids.length){session.index=session.ids.length-1;finishExam(expired?'本階段時間結束':'本階段逐題演練完成');return;}
  active=PROBLEMS.find(p=>p.id===session.ids[session.index]);
  session.deadline=(expired?session.deadline:now)+active.timeSeconds*1000;
  reason='本題逾時未提交';
 }while(expired&&session.deadline<=now);
 save();render();window.scrollTo({top:0,behavior:'instant'});
 toast(expired?'已按官方時限進入下一題；逾時題會在結算時回顧。':'已進入下一題，結束後統一回顧。');
}
function finishExam(reason){
 const session=state.session;if(!session||session.finished)return;
 if(busy){checkEpoch++;worker?.terminate();worker=null;busy=false;}
 session.finished=true;session.endedAt=Date.now();session.reason=reason;
 session.ids.forEach(id=>{
  const a=session.answers[id];
  if(a){recordAttempt(state,id,a,{mode:session.mode,input:a.input});const s=practice[id]||(practice[id]=blankPractice());s.attempts++;s.feedback=a;s.correct=a.status==='correct';s.input=a.input;}
  else if(!state.records[id])state.records[id]={attempts:0,solved:0,independent:0,streak:0,interval:0,due:Date.now(),hints:0,last:0};
 });save();navigate('modes');toast('挑戰已結束，現在可以回顧作答。');
}
function examMove(index){const s=state.session;if(!s||s.finished||perQuestionSession(s)||index<0||index>=s.ids.length)return;s.index=index;active=PROBLEMS.find(p=>p.id===s.ids[index]);save();render();}
function updateTimer(){const s=state.session;if(!s||s.finished)return;const n=examRemaining(s);const el=$('#timer');if(el){el.textContent=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;el.classList.toggle('urgent',n<60);}if(n===0){if(s.mode==='stage'){advanceStage('本題逾時未提交',true);}else finishExam('時間到');}}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function nextProblem(){if(reviewing){const ids=dueIds(state).filter(id=>id!==active.id&&PROBLEMS.some(p=>p.id===id));if(ids.length){selectProblem(ids[0],true);return;}navigate('review');return;}const rows=state.trainingScope==='season'?PROBLEMS.filter(p=>p.origin==='archive'):state.trainingScope?PROBLEMS.filter(p=>p.round===state.trainingScope):PROBLEMS;const pos=rows.findIndex(p=>p.id===active.id);if(pos===rows.length-1&&state.trainingScope){toast('此訓練路線已到最後一題，可以選擇下一個階段。');navigate('season');return;}selectProblem(rows[(pos+1)%rows.length].id);}
$('#view').addEventListener('submit',e=>{if(e.target.id==='answer-form')submitAnswer(e);});
document.addEventListener('click',e=>{
 const b=e.target.closest('button,[data-nav]');if(!b||b.disabled)return;
 if(b.dataset.nav){navigate(b.dataset.nav);return;}
 if(busy){toast('正在驗證，請稍候。');return;}
 const s=progress(),p=active,exam=state.session&&!state.session.finished;
 if(b.dataset.roundLibrary){filters={origin:'archive',round:b.dataset.roundLibrary,technique:'all',search:''};navigate('archive');return;}
 if(b.dataset.roundPractice){if(exam){toast('先結束或繼續目前的挑戰。');return;}state.trainingScope=b.dataset.roundPractice;const rows=state.trainingScope==='season'?PROBLEMS.filter(p=>p.origin==='archive'):roundProblems(PROBLEMS,state.trainingScope);const next=rows.find(p=>!state.records[p.id]?.solved)||rows[0];selectProblem(next.id);return;}
 if(b.dataset.stageTimed){startStage(b.dataset.stageTimed,b.dataset.match);return;}
 if(b.dataset.problem||b.dataset.review){
  if(exam){toast('目前挑戰仍在計時，請先繼續或結束挑戰。');navigate('modes');return;}
  const id=b.dataset.problem||b.dataset.review;
  if(b.dataset.problem)state.trainingScope=PROBLEMS.find(p=>p.id===id)?.round;
  if(b.dataset.review)practice[id]=blankPractice();
  selectProblem(id,!!b.dataset.review);return;
 }
 if(b.dataset.technique){s.technique=b.dataset.technique;save();render();return;}
 if(b.dataset.step){const step=p.steps[s.stepIndex];s.stepTried=true;s.stepCorrect=Number(b.dataset.step)===step.correct;s.stepFeedback=s.stepCorrect?step.explanation:'先檢查這一步是否保留了原式的結構與係數，再選一次。';save();render();return;}
 if(b.dataset.key){const input=$('#answer');input.focus();const pos=input.selectionStart??input.value.length;input.setRangeText(b.dataset.key,pos,input.selectionEnd??pos,'end');input.dispatchEvent(new Event('input',{bubbles:true}));return;}
 if(b.dataset.reviewDays){setReviewInterval(state,p.id,Number(b.dataset.reviewDays));save();toast('已安排 '+b.dataset.reviewDays+' 天後複習。');render();return;}
 if(b.dataset.skill){filters={origin:'all',round:'all',technique:b.dataset.skill,search:''};navigate('archive');return;}
 if(b.dataset.start){startExam(b.dataset.start);return;}
 if(b.dataset.examIndex){examMove(Number(b.dataset.examIndex));return;}
 switch(b.dataset.action){
  case 'random':{const rows=state.trainingScope==='season'?PROBLEMS.filter(p=>p.origin==='archive'):state.trainingScope?PROBLEMS.filter(p=>p.round===state.trainingScope):PROBLEMS;selectProblem(shuffle(rows.filter(p=>p.id!==active.id))[0]?.id||active.id);break;}
  case 'hint':s.hints=Math.min(s.hints+1,p.hints.length);save();render();break;
  case 'scaffold':s.stepTried=true;save();render();break;
  case 'step-next':s.stepIndex++;s.stepFeedback='';s.stepCorrect=false;save();render();break;
  case 'solution':if(s.correct||s.attempts>=2){s.revealed=true;if(state.records[p.id])setReviewInterval(state,p.id,1);save();render();}break;
  case 'next':nextProblem();break;
  case 'finish-exam':finishExam('手動結束');break;
  case 'resume-exam':active=PROBLEMS.find(p=>p.id===state.session.ids[state.session.index]);navigate('train');break;
  case 'exam-prev':examMove(state.session.index-1);break;
  case 'exam-next':if(state.session.mode==='stage'){advanceStage('略過未提交');break;}if(state.session.index===state.session.ids.length-1)finishExam('已完成題組');else examMove(state.session.index+1);break;
  case 'export':{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='integral-lab-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已匯出進度備份。');break;}
  case 'reset':if(confirm('這會清除本瀏覽器中的所有作答、複習與挑戰紀錄。建議先匯出備份。確定清除？')){state=freshState();practice={};active=PROBLEMS.find(p=>p.id===state.current)||PROBLEMS[0];save();render();toast('進度已清除。');}break;
 }
});
$('#view').addEventListener('input',e=>{
 if(e.target.id==='answer'){
  const value=e.target.value;progress().input=value;
  if(state.session&&!state.session.finished)state.session.inputs[active.id]=value;
  const target=$('#input-preview');if(target){target.textContent=value?'輸入預覽：'+value:'';}
  clearTimeout(save.inputTimer);save.inputTimer=setTimeout(save,500);
 }
 if(e.target.id==='archive-search'){
  const pos=e.target.selectionStart;filters.search=e.target.value;$('#view').innerHTML=renderArchive();renderMath();$('#archive-search').focus();$('#archive-search').setSelectionRange(pos,pos);
 }
});
$('#view').addEventListener('change',async e=>{
 if(e.target.id==='origin-filter'){filters.origin=e.target.value;if(filters.origin==='original')filters.round='original';else if(filters.round==='original')filters.round='all';render();}
 if(e.target.id==='round-filter'){filters.round=e.target.value;if(filters.round==='original')filters.origin='original';else if(filters.origin==='original')filters.origin='all';render();}
 if(e.target.id==='tech-filter'){filters.technique=e.target.value;render();}
 if(e.target.id==='import-progress'){
  const f=e.target.files[0];if(!f)return;if(f.size>5*1024*1024){toast('備份檔案過大，請使用小於 5 MB 的 JSON。');return;}
  try{const s=JSON.parse(await f.text());if(!validateState(s))throw new Error('invalid');
   if(!confirm('匯入會取代此瀏覽器目前的進度。確定使用這份備份？'))return;
   state=s;state.session=null;practice={};state.practice={};save();render();toast('備份已匯入；進行中的限時挑戰不會轉移。');
  }catch{toast('無法匯入：請選擇有效的積分研習室備份。');}
 }
});
window.addEventListener('hashchange',()=>{const to=location.hash.slice(1);if(label[to]&&to!==page){page=to;render();}});
window.addEventListener('beforeunload',()=>{save();});
setInterval(updateTimer,500);
const storedPractice=state.practice;
if(storedPractice&&typeof storedPractice==='object'){
 for(const [id,s] of Object.entries(storedPractice))if(PROBLEMS.some(p=>p.id===id)&&s&&typeof s.input==='string'&&Number.isFinite(s.attempts)&&Number.isFinite(s.hints))practice[id]={...blankPractice(),...s};
}
// Practice drafts and hint usage travel with the exported learning record.
state.practice=practice;
if(state.session&&!state.session.finished){const s=state.session;if(!Array.isArray(s.ids)||!s.ids.every(id=>PROBLEMS.some(p=>p.id===id))||!s.answers||!Number.isFinite(s.deadline)){state.session=null;}else{active=PROBLEMS.find(p=>p.id===s.ids[s.index])||active;s.inputs=s.inputs||{};}}
page=label[location.hash.slice(1)]?location.hash.slice(1):'train';
render();
