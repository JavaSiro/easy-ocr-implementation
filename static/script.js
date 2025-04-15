const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// Set canvas background to white
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Get mouse position relative to canvas
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// Start drawing
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const pos = getMousePos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

// Stop drawing
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath();
});

canvas.addEventListener('mouseout', () => {
  drawing = false;
  ctx.beginPath();
});

// Drawing logic
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;
  const pos = getMousePos(e);

  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'black';

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

// Clear canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.getElementById('result').textContent = '...';
}

// Submit drawing for OCR
function submitCanvas() {
  const dataURL = canvas.toDataURL('image/png');
  const resultArea = document.getElementById('result');
  const loadingText = document.getElementById('loading');

  resultArea.textContent = '...';
  loadingText.style.display = 'block';

  fetch('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  })
  .then(res => res.json())
  .then(data => {
    loadingText.style.display = 'none';

    if (data.length === 0) {
      resultArea.textContent = 'No text detected.';
    } else {
      resultArea.textContent = data.map(
        item => `"${item.text}" with ${item.confidence}% confidence`
      ).join('\n');
    }
  })
  .catch(err => {
    loadingText.style.display = 'none';
    resultArea.textContent = 'Error recognizing text.';
  });
}