// script.js modifications: showMessage function and replace alert

/* script.js */
let examples = [];
let currentIndex = 0;
let originalPairs = [];
let claimItems = [];
let reasonItems = [];

function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }}
function onDragStart(e) { e.dataTransfer.setData('text/plain', e.target.id); }
function onDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function onDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function onDrop(e) { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const id = e.dataTransfer.getData('text/plain'); const dragged = document.getElementById(id); if (dragged.dataset.type === e.currentTarget.dataset.type) { e.currentTarget.textContent = dragged.textContent; dragged.remove(); }}

function generateRows() { const tbody = document.getElementById('proof-rows'); claimItems.forEach(() => { const tr = document.createElement('tr'); ['claim','reason'].forEach(type => { const td = document.createElement('td'); td.classList.add('drop-zone'); td.dataset.type = type; td.addEventListener('dragover', onDragOver); td.addEventListener('dragleave', onDragLeave); td.addEventListener('drop', onDrop); tr.appendChild(td); }); tbody.appendChild(tr); }); }
function populateBanks() { const claimBank = document.getElementById('claim-bank'); const reasonBank = document.getElementById('reason-bank'); claimItems.forEach((text,i) => { const d=document.createElement('div'); d.className='item'; d.textContent=text; d.draggable=true; d.id=`claim-${i}`; d.dataset.type='claim'; d.addEventListener('dragstart', onDragStart); claimBank.appendChild(d); }); reasonItems.forEach((text,i) => { const d=document.createElement('div'); d.className='item'; d.textContent=text; d.draggable=true; d.id=`reason-${i}`; d.dataset.type='reason'; d.addEventListener('dragstart', onDragStart); reasonBank.appendChild(d); }); }
function clearBoard() { document.getElementById('proof-rows').innerHTML=''; ['claim-bank','reason-bank'].forEach(id => { document.getElementById(id).innerHTML=`<h2>${id==='claim-bank'?'טענות':'נימוקים'}</h2>`; }); }
function loadQuestion() { const q=examples[currentIndex]; originalPairs=q.pairs.slice(); claimItems=q.pairs.map(p=>p.claim); reasonItems=q.pairs.map(p=>p.reason); shuffle(claimItems); shuffle(reasonItems); document.getElementById('problem-img').src=q.img; clearBoard(); generateRows(); populateBanks(); document.getElementById('finish-btn').disabled=false; document.getElementById('redo-btn').disabled=true; document.getElementById('next-btn').disabled=true; }

// Show optimistic Hebrew message
function showMessage(text) {
  const overlay = document.getElementById('message-overlay');
  overlay.textContent = text;
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('hidden'), 2000);
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('data.json').then(res=>res.json()).then(data=>{examples=data;}).catch(err=>console.error(err));
  const startBtn=document.getElementById('start-btn'); const startScreen=document.getElementById('start-screen'); const gameArea=document.getElementById('game-area');
  const finishBtn=document.getElementById('finish-btn'); const redoBtn=document.getElementById('redo-btn'); const nextBtn=document.getElementById('next-btn');

  startBtn.addEventListener('click', () => { if(!examples.length) return showMessage('אין נתונים!'); startScreen.classList.add('hidden'); gameArea.classList.remove('hidden'); currentIndex=0; loadQuestion(); });

  finishBtn.addEventListener('click', () => {
    const rows = document.querySelectorAll('#proof-rows tr'); let correct=true;
    rows.forEach((row,i) => { const [c,r]=row.querySelectorAll('td'); if(c.textContent.trim()!==originalPairs[i].claim||r.textContent.trim()!==originalPairs[i].reason) correct=false; });
    if(correct) { showMessage('כל הכבוד! פתרת נכון 😊'); finishBtn.disabled=true; nextBtn.disabled=false; } else { showMessage('אופס! נסי שוב, את יכולה 😊'); redoBtn.disabled=false; }
  });
  redoBtn.addEventListener('click', () => { clearBoard(); shuffle(claimItems); shuffle(reasonItems); generateRows(); populateBanks(); finishBtn.disabled=false; redoBtn.disabled=true; });
  nextBtn.addEventListener('click', () => { currentIndex++; if(currentIndex>=examples.length) return showMessage('סיימת את כל השאלות!'); loadQuestion(); });
});
