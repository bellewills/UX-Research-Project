// ==================== DRAWING LOGIC (Fixed Alignment) ==================== //
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let erasing = false;

// === Touch support for iPad ===
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  drawing = true;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  ctx.stroke();
});

canvas.addEventListener('touchend', () => {
  drawing = false;
  ctx.beginPath();
});

// Canvas scaling mismatch - alignment 
function resizeCanvasToDisplaySize(canvas) {
  const rect = canvas.getBoundingClientRect();
  const { width, height } = rect;
  if (canvas.width !== width || canvas.height !== height) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imgData, 0, 0);
  }
}

// Call it once and also when window resizes
resizeCanvasToDisplaySize(canvas);
window.addEventListener('resize', () => resizeCanvasToDisplaySize(canvas));

// Utility: get mouse position relative to canvas
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// Start drawing
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const pos = getMousePos(canvas, e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

// Stop drawing
canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath(); // reset path
});

// Draw movement (perfectly aligned)
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getMousePos(canvas, e);

  if (erasing) {
    ctx.clearRect(pos.x - 8, pos.y - 8, 16, 16);
  } else {
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }
});
// Tool buttons
const penBtn = document.getElementById('penBtn');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');

penBtn.addEventListener('click', () => {
  erasing = false;
  penBtn.classList.add('active');
  eraserBtn.classList.remove('active');
});

eraserBtn.addEventListener('click', () => {
  erasing = true;
  eraserBtn.classList.add('active');
  penBtn.classList.remove('active');
});

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

penBtn.classList.add('active'); // default tool

// ==================== SAVE FUNCTION ==================== //
const saveBtn = document.getElementById('saveBtn');
const keyFeaturesBox = document.querySelector('.left-box textarea');

saveBtn.addEventListener('click', () => {
  const drawingData = canvas.toDataURL('image/png');
  document.getElementById('drawingInput').value = drawingData;
  document.getElementById('keyFeaturesInput').value = keyFeaturesBox.value;

  document.getElementById('saveForm').submit();
  alert("Thank you! Your response has been submitted.");
});

// ==================== AI CHAT SYSTEM ==================== //
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let messageCount = 0;
const maxMessages = 3; // Message limit - controlled veriable

async function sendMessage() {
  if (messageCount >= maxMessages) {
    addMessage('ai', '⚠️ You’ve reached the message limit for this task.');
    userInput.disabled = true;
    sendBtn.disabled = true;
    return;
  }

  const message = userInput.value.trim();
  if (!message) return;

  // Add user message
  addMessage('user', message);
  userInput.value = '';

  // Add thinking message
  const thinkingMsg = addMessage('ai', '💭 Thinking...');
  
  try {
    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    // Replace thinking text with animated AI reply
    setTimeout(() => {
      fadeInMessage(thinkingMsg, data.reply);
    }, 400);
  } catch {
    fadeInMessage(thinkingMsg, '⚠️ Could not reach AI server.');
  }
}

// Helper: append message to chat
function addMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = `<p>${text}</p>`;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return msgDiv;
}

// Helper: animate AI reply
function fadeInMessage(element, text) {
  element.style.opacity = 0;
  element.innerHTML = `<p>${text}</p>`;
  let opacity = 0;
  const fade = setInterval(() => {
    opacity += 0.05;
    element.style.opacity = opacity;
    if (opacity >= 1) clearInterval(fade);
  }, 30);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event listeners for chat
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
