const canvas = document.getElementById("canvas");
const base = document.getElementById("base");
let selected = null;
let draggedSrc = null;

let undoStack = [];
let redoStack = [];

/* ---------- UNDO SYSTEM ---------- */
function saveState() {
  undoStack.push(canvas.innerHTML);
  redoStack = [];
}
saveState();

/* ---------- DRAG ITEMS ---------- */
document.querySelectorAll(".items-row img").forEach(img => {
  img.addEventListener("dragstart", () => draggedSrc = img.src);
});

// Enable drag from slider-row
document.querySelectorAll('.slider-row img').forEach(img => {
  img.setAttribute('draggable', 'true');
  img.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', img.src);
  });
});

canvas.addEventListener("dragover", e => e.preventDefault());

canvas.addEventListener("drop", e => {
  e.preventDefault();
  const src = e.dataTransfer.getData('text/plain');
  if (!src) return;

  // Calculate drop position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Create new image
  const newImg = document.createElement('img');
  newImg.src = src;
  newImg.className = 'dropped';
  newImg.style.position = 'absolute';
  newImg.style.left = (x - 50) + 'px'; // Center the image at pointer
  newImg.style.top = (y - 50) + 'px';
  newImg.style.width = '100px';
  newImg.style.pointerEvents = 'auto';
  newImg.setAttribute('draggable', 'true');

  // Enable dragging of dropped items
  newImg.addEventListener('dragstart', function(ev) {
    ev.dataTransfer.setData('text/plain', '');
    ev.dataTransfer.setDragImage(newImg, 50, 50);
    canvas._draggedImg = newImg;
  });

  // ---  allow selecting the image ---
  newImg.addEventListener('click', function(ev) {
    ev.stopPropagation();
    selectItem(newImg);
    // Optionally, highlight selected
    document.querySelectorAll('#canvas img').forEach(i => i.style.outline = '');
    newImg.style.outline = '2px solid #2196f3';
    // Set controls to reflect current image state
    const match = /rotate\((-?\d+)deg\) scale\(([\d.]+)\)/.exec(newImg.style.transform || "");
    rotate.value = match ? match[1] : 0;
    scale.value = match ? match[2] : 1;
    opacity.value = newImg.style.opacity || 1;
  });

  canvas.appendChild(newImg);
});

// Allow dragging dropped items within canvas
canvas.addEventListener('dragover', function(e) {
  if (canvas._draggedImg) e.preventDefault();
});

canvas.addEventListener('drop', function(e) {
  if (canvas._draggedImg) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    canvas._draggedImg.style.left = (x - 50) + 'px';
    canvas._draggedImg.style.top = (y - 50) + 'px';
    canvas._draggedImg = null;
  }
});

/* ---------- SELECT ---------- */
function selectItem(img) {
  selected = img;
  rotate.value = 0;
  scale.value = 1;
  opacity.value = 1;
}

/* ---------- CONTROLS ---------- */
rotate.oninput = () => applyTransform();
scale.oninput = () => applyTransform();
opacity.oninput = () => selected && (selected.style.opacity = opacity.value);

function applyTransform() {
  if (!selected) return;
  selected.style.transform =
    `rotate(${rotate.value}deg) scale(${scale.value})`;
}

/* ---------- DELETE ---------- */
deleteBtn.onclick = () => {
  if (!selected) return;
  saveState();
  selected.remove();
  selected = null;
};

/* ---------- UNDO / REDO ---------- */
undoBtn.onclick = () => {
  if (!undoStack.length) return;
  redoStack.push(canvas.innerHTML);
  canvas.innerHTML = undoStack.pop();
};

redoBtn.onclick = () => {
  if (!redoStack.length) return;
  undoStack.push(canvas.innerHTML);
  canvas.innerHTML = redoStack.pop();
};

/* ---------- BACKGROUND ---------- */
bgSelect.onchange = () =>
  canvas.style.backgroundImage = `url(${bgSelect.value})`;

/* ---------- CHARACTER ---------- */
charSelect.onchange = () => base.src = charSelect.value;

/* ---------- UPLOAD ---------- */
upload.onchange = () => {
  const file = upload.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    draggedSrc = e.target.result;
  };
  reader.readAsDataURL(file);
};

/* ---------- SAVE ---------- */
saveBtn.onclick = () => {
  html2canvas(canvas).then(c => {
    const a = document.createElement("a");
    a.href = c.toDataURL();
    a.download = "funny-person.png";
    a.click();
  });
};

/* ---------- CLEAR ---------- */
clearBtn.onclick = () => {
  saveState();
  canvas.innerHTML = "";
  canvas.appendChild(base);
};

// Deselect when clicking on canvas background
canvas.addEventListener('click', function(e) {
  if (e.target === canvas) {
    selected = null;
    document.querySelectorAll('#canvas img').forEach(i => i.style.outline = '');
    rotate.value = 0;
    scale.value = 1;
    opacity.value = 1;
  }
});
