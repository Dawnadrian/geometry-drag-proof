let examples = [];
let currentIndex = 0;
let originalPairs = [];
let claimItems = [];
let reasonItems = [];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
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
function onDropReason(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(id);
  if (dragged.dataset.type !== 'reason') return;
  e.currentTarget.textContent = dragged.textContent;
  dragged.remove();
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
    const d = document.createElement('div');
    d.className = 'item';
    d.textContent = text;
    d.draggable = true;
    d.id = `reason-${i}`;
    d.dataset.type = 'reason';
    d.addEventListener('dragstart', onDragStart);
    reasonBank.appendChild(d);
  });
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

  document.getElementById('title').textContent     = q.title || `בעיה ${currentIndex+1}`;
  document.getElementById('problem-img').src       = q.img;

  clearBoard();
  generateRows();
  populateBanks();

  document.getElementById('finish-btn').disabled = false;
  document.getElementById('redo-btn').disabled   = true;
  document.getElementById('next-btn').disabled   = true;
}

function showMessage(text) {
  const o = document.getElementById('message-overlay');
  o.textContent = text;
  o.classList.remove('hidden');
  setTimeout(() => o.classList.add('hidden'), 2000);
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('data.json')
    .then(r => r.json())
    .then(data => {
      examples = data;
      loadQuestion();

      // Jump-to control
      document.getElementById('jump-btn').addEventListener('click', () => {
        const val = parseInt(document.getElementById('jump-input').value, 10);
        if (!isNaN(val) && val >= 1 && val <= examples.length) {
          currentIndex = val - 1;
          loadQuestion();
        } else {
          showMessage('מספר שאלה לא חוקי');
        }
      });
    })
    .catch(err => console.error(err));

  const finishBtn = document.getElementById('finish-btn');
  const redoBtn   = document.getElementById('redo-btn');
  const nextBtn   = document.getElementById('next-btn');

  finishBtn.addEventListener('click', () => {
    let correct = true;
    document.querySelectorAll('#proof-rows tr').forEach((row, i) => {
      const placed = row.cells[1].textContent.trim();
      if (placed !== originalPairs[i].reason.trim()) correct = false;
    });
    if (correct) {
      showMessage('כל הכבוד! פתרת נכון 😊');
      finishBtn.disabled = true;
      nextBtn.disabled   = false;
    } else {
      showMessage('אופס! נסי שוב, את יכולה 😊');
      redoBtn.disabled   = false;
    }
  });

  redoBtn.addEventListener('click', () => {
    clearBoard();
    shuffle(reasonItems);
    generateRows();
    populateBanks();
    finishBtn.disabled = false;
    redoBtn.disabled   = true;
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