// ==================== DRAWING LOGIC (Fixed Alignment) ==================== //
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let erasing = false;

// === Touch support for iPad === //
// Added after testing because the eraser wasn’t working properly on touchscreens.
// This handles all finger or stylus input on iPad and mirrors the mouse logic below.

// When the user first touches the screen, start drawing
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // stop any page scrolling
  const touch = e.touches[0]; // get the first touch point
  const rect = canvas.getBoundingClientRect(); // find canvas position on screen
  ctx.beginPath(); // begin a new path for drawing
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top); // move to touch start position
  drawing = true; // mark drawing as active
});

// When finger or stylus moves across the screen
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault(); // prevent page scrolling while drawing
  if (!drawing) return; // stop if not currently drawing
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left; // get x coordinate
  const y = touch.clientY - rect.top;  // get y coordinate

  if (erasing) {
    // Eraser mode – clears a small square around touch point
    ctx.clearRect(x - 15, y - 15, 30, 30); // size
  } else {
    // Pen mode – draws a smooth line following finger movement
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
});

// Stop the page from moving while user draws (mainly for Safari)
document.body.addEventListener('touchmove', e => {
  if (drawing) e.preventDefault();
}, { passive: false });

// When the user lifts finger or stylus, stop drawing
canvas.addEventListener('touchend', () => {
  drawing = false; // stop drawing
  ctx.beginPath(); // reset the path
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
    ctx.clearRect(pos.x - 15, pos.y - 15, 30, 30); 
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
// const clearBtn = document.getElementById('clearBtn'); //commented out from feedback saying we didn't need clear button

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

// clearBtn.addEventListener('click', () => { //commented out from feedback saying we didn't need clear button
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
// });

penBtn.classList.add('active'); // default tool

// ==================== SAVE FUNCTION ==================== //
const saveBtn = document.getElementById('saveBtn');

// when the user clicks save, send everything to Formspree
saveBtn.addEventListener('click', () => {
  // get the participant number
  const participantField = document.getElementById('participantId');
  const participantHidden = document.getElementById('participantNumberInput');
  const participantNumber = (participantField?.value || '').trim();

  // stop them from saving if no participant number is entered
  if (!participantNumber) {
    alert('Please enter the participant number before saving.');
    return;
  }

  // copy the visible participant number into the hidden form field
  if (participantHidden) participantHidden.value = participantNumber;

  // convert the canvas drawing into image data
  const drawingData = canvas.toDataURL('image/png');
  document.getElementById('drawingInput').value = drawingData;

  // submit the form to Formspree
  document.getElementById('saveForm').submit();

  // small confirmation pop-up
  alert('Thank you! Your response has been submitted.');
});

// ==================== AI CHAT SYSTEM ==================== //
// Only run on the withAI page - guards prevent errors on the withoutAI page
const messagesDiv = document.getElementById('messages');
const userInput   = document.getElementById('userInput');
const sendBtn     = document.getElementById('sendBtn');

if (messagesDiv && userInput && sendBtn) {
  // Conversation memory sent to  server every turn
  const conversation = [
    {
      role: 'system',
      content:
        'You are a helpful assistant for a design workshop. Give short, clear, ' +
        'structured answers (3–4 bullets, <=15 words each). Focus on ONE coherent idea.'
    }
  ];

  let messageCount = 0;
  const maxMessages = 3; // adjust if needed

  function addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerHTML = `<p>${text}</p>`;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return msgDiv;
  }

  function fadeInMessage(el, text) {
    el.style.opacity = 0;
    el.innerHTML = `<p>${text}</p>`;
    let o = 0;
    const fade = setInterval(() => {
      o += 0.05;
      el.style.opacity = o;
      if (o >= 1) clearInterval(fade);
    }, 30);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function sendMessage() {
    if (messageCount >= maxMessages) {
      addMessage('ai', 'You’ve reached the message limit. Lock in your single best design on the canvas.');
      userInput.disabled = true;
      sendBtn.disabled = true;
      return;
    }

    const text = userInput.value.trim();
    if (!text) return;

    // show user message + add to memory
    addMessage('user', text);
    conversation.push({ role: 'user', content: text });
    userInput.value = '';

    // placeholder while we wait
    const thinkingMsg = addMessage('ai', 'Thinking…');

    try {
      // Send the entire conversation each turn
      const res = await fetch('https://ux-research-project-ai-backend.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation })
      });

      const data = await res.json();
      const reply = data.reply || 'No reply.';

      // show + remember assistant reply
      fadeInMessage(thinkingMsg, reply);
      conversation.push({ role: 'assistant', content: reply });

      // count only after a successful round-trip
      messageCount += 1;
      if (messageCount >= maxMessages) {
        addMessage('ai', 'Limit reached. Use the canvas to finalise your one idea.');
        userInput.disabled = true;
        sendBtn.disabled = true;
      }
    } catch {
      fadeInMessage(thinkingMsg, 'Could not reach the AI server.');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}
