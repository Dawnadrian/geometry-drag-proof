// script.js
let examples = [];
let currentIndex = 0;
let originalPairs = [];
let claimItems = [];
let reasonItems = [];

// Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Allow dropping back into the reason bank
function onDropToBank(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(id);
  if (!dragged || dragged.dataset.type !== 'reason') return;
  const parent = dragged.parentElement;
  if (parent && parent.classList.contains('drop-zone')) {
    parent.innerHTML = '';
  }
  e.currentTarget.appendChild(dragged);
}

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.id);
}
function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

// Drop a reason into its slot
function onDropReason(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(id);
  if (!dragged || dragged.dataset.type !== 'reason') return;
  e.currentTarget.innerHTML = '';
  e.currentTarget.appendChild(dragged);
}

function generateRows() {
  const tbody = document.getElementById('proof-rows');
  tbody.innerHTML = '';
  claimItems.forEach((claimText, i) => {
    const tr = document.createElement('tr');
    const tdC = document.createElement('td');
    tdC.textContent = claimText;
    tdC.classList.add('fixed-claim');
    tr.appendChild(tdC);
    const tdR = document.createElement('td');
    tdR.classList.add('drop-zone');
    tdR.dataset.index = i;
    tdR.addEventListener('dragover', onDragOver);
    tdR.addEventListener('dragleave', onDragLeave);
    tdR.addEventListener('drop', onDropReason);
    tr.appendChild(tdR);
    tbody.appendChild(tr);
  });
}

function populateBanks() {
  const reasonBank = document.getElementById('reason-bank');
  reasonBank.innerHTML = '<h2>נימוקים</h2>';
  reasonItems.forEach((text, i) => {
    const card = document.createElement('div');
    card.className = 'item';
    card.textContent = text;
    card.draggable = true;
    card.id = `reason-${i}`;
    card.dataset.type = 'reason';
    card.addEventListener('dragstart', onDragStart);
    reasonBank.appendChild(card);
  });
  reasonBank.addEventListener('dragover', e => e.preventDefault());
  reasonBank.addEventListener('drop', onDropToBank);
}

function clearBoard() {
  document.getElementById('proof-rows').innerHTML = '';
  document.getElementById('reason-bank').innerHTML = '<h2>נימוקים</h2>';
}

function loadQuestion() {
  const q = examples[currentIndex];
  originalPairs = q.pairs.slice();
  claimItems    = q.pairs.map(p => p.claim.trim());
  reasonItems   = q.pairs.map(p => p.reason.trim());
  shuffle(reasonItems);

  document.getElementById('title').textContent   = q.title || `בעיה ${currentIndex+1}`;
  document.getElementById('problem-img').src     = q.img;

  clearBoard();
  generateRows();
  populateBanks();

  document.getElementById('finish-btn').disabled = false;
  document.getElementById('redo-btn').disabled   = false;
  document.getElementById('next-btn').disabled   = true;
}

function showMessage(text) {
  const overlay = document.getElementById('message-overlay');
  overlay.textContent = text;
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('hidden'), 2000);
}

// Show the full solution
function showSolution() {
  document.querySelectorAll('#proof-rows tr').forEach((row, i) => {
    const cell = row.cells[1];
    cell.innerHTML = '';
    const text = originalPairs[i].reason.trim();
    cell.textContent = text;
  });
  document.getElementById('finish-btn').disabled = true;
  document.getElementById('redo-btn').disabled   = false;
  document.getElementById('next-btn').disabled   = false;
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      examples = data;
      loadQuestion();
      document.getElementById('jump-btn').addEventListener('click', () => {
        const n = parseInt(document.getElementById('jump-input').value, 10);
        if (!isNaN(n) && n >= 1 && n <= examples.length) {
          currentIndex = n - 1;
          loadQuestion();
        } else {
          showMessage('מספר שאלה לא חוקי');
        }
      });
      document.getElementById('solution-btn').addEventListener('click', showSolution);
    })
    .catch(err => console.error(err));

  const finishBtn = document.getElementById('finish-btn');
  const redoBtn   = document.getElementById('redo-btn');
  const nextBtn   = document.getElementById('next-btn');

  finishBtn.addEventListener('click', () => {
    let correct = true;
    document.querySelectorAll('#proof-rows tr').forEach((row, i) => {
      const cell = row.cells[1];
      const placed = cell.textContent.trim();
      if (placed !== originalPairs[i].reason.trim()) correct = false;
    });
    if (correct) {
      showMessage('כל הכבוד! פתרת נכון 😊');
      finishBtn.disabled = true;
      nextBtn.disabled   = false;
    } else {
      showMessage('אופס! נסי שוב, את יכולה 😊');
    }
  });

  redoBtn.addEventListener('click', () => {
    loadQuestion();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= examples.length) {
      showMessage('סיימת את כל השאלות!');
    } else {
      loadQuestion();
    }
  });
});
