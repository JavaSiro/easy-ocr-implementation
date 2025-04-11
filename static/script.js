const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'black';

  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function submitCanvas() {
  const dataURL = canvas.toDataURL('image/png');

  fetch('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  })
  .then(res => res.json())
  .then(data => {
    const resultArea = document.getElementById('result');
    if (data.length === 0) {
      resultArea.textContent = 'No text detected.';
    } else {
      resultArea.textContent = data.map(
        item => `"${item.text}" with ${item.confidence}% confidence`
      ).join('\n');
    }
  });
}
