// login.js: Handles on-screen keyboard, decoy animations, and events

// Build keyboard keys
const KEY_SET = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()".split("");

const keyboardEl = document.getElementById('keyboard');
const passwordDisplay = document.getElementById('password-display');
const fakeCursor = document.getElementById('fake-cursor');
const decoyLog = document.getElementById('decoy-log');

let realPassword = '';
let lastRevealTimer = null;

// Prevent physical typing
window.addEventListener('keydown', (e) => {
  e.preventDefault();
});

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderKeyboard() {
  keyboardEl.innerHTML = '';
  const keys = shuffle([...KEY_SET]);
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'text-sm btn key';
    btn.textContent = k;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      realPassword += k;
      updateDisplay();
    });
    keyboardEl.appendChild(btn);
  });

  // Add control keys: Backspace and Shuffle for usability
  const back = document.createElement('button');
  back.className = 'text-sm btn control-key';
  back.type = 'button';
  back.textContent = 'Backspace';
  back.addEventListener('click', () => {
    realPassword = realPassword.slice(0, -1);
    updateDisplay();
  });
  keyboardEl.appendChild(back);

  const shuffleBtn = document.createElement('button');
  shuffleBtn.className = 'text-sm btn control-key';
  shuffleBtn.type = 'button';
  shuffleBtn.textContent = 'Shuffle';
  shuffleBtn.addEventListener('click', () => {
    renderKeyboard();
    // Visual feedback
    shuffleBtn.classList.add('success-animation');
    setTimeout(() => shuffleBtn.classList.remove('success-animation'), 600);
  });
  keyboardEl.appendChild(shuffleBtn);
}

function updateDisplay() {
  // Show bullets equal to password length, but briefly reveal last character for UX
  if (lastRevealTimer) { clearTimeout(lastRevealTimer); lastRevealTimer = null; }
  const n = realPassword.length;
  if (n === 0) {
    passwordDisplay.textContent = '';
    return;
  }
  // reveal last char briefly
  const shown = n > 1 ? '●'.repeat(n - 1) + realPassword.slice(-1) : realPassword.slice(-1);
  passwordDisplay.textContent = shown;
  lastRevealTimer = setTimeout(() => {
    passwordDisplay.textContent = '●'.repeat(realPassword.length);
  }, 700);
}

document.getElementById('clearBtn').addEventListener('click', () => {
  realPassword = '';
  updateDisplay();
});

document.getElementById('submitBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  if (!username) return showMessage('Please enter username', 'error');
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<svg class="w-4 h-4 loading" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Authenticating...';
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: realPassword })
    });
    const data = await res.json();
    if (data.success) {
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    } else {
      showMessage(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showMessage('Network error. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Secure Login';
  }
});

function showMessage(msg, type = 'warning') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = msg;
  messageEl.classList.remove('hidden', 'bg-amber-900/20', 'border-amber-500/20', 'bg-red-900/20', 'border-red-500/20', 'bg-green-900/20', 'border-green-500/20');
  
  if (type === 'error') {
    messageEl.classList.add('bg-red-900/20', 'border-red-500/20', 'text-red-300');
  } else if (type === 'success') {
    messageEl.classList.add('bg-green-900/20', 'border-green-500/20', 'text-green-300');
  } else {
    messageEl.classList.add('bg-amber-900/20', 'border-amber-500/20', 'text-amber-300');
  }
  
  messageEl.classList.add('success-animation');
  setTimeout(() => messageEl.classList.remove('success-animation'), 600);
}

// Decoy: random cursor wander
function startFakeCursor() {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  setInterval(() => {
    const x = Math.random() * (w - 20);
    const y = Math.random() * (h - 20);
    fakeCursor.style.transform = `translate(${x}px, ${y}px)`;
    if (Math.random() > 0.6) {
      decoyLog.innerHTML = `<li>Decoy highlight at ${new Date().toLocaleTimeString()}</li>` + decoyLog.innerHTML;
    }
  }, 1400 + Math.random() * 1600);
}

// Decoy: random key highlight
function startKeyDecoys() {
  setInterval(() => {
    const buttons = Array.from(keyboardEl.querySelectorAll('button'));
    if (!buttons.length) return;
    const b = buttons[Math.floor(Math.random() * buttons.length)];
    b.classList.add('key-highlight');
    setTimeout(() => b.classList.remove('key-highlight'), 700 + Math.random() * 900);
  }, 800 + Math.random() * 1200);
}

// Blur protections
function blurPassword(reason) {
  passwordDisplay.classList.add('blurred');
  showMessage('Password hidden for security: ' + reason);
  // Log to server
  fetch('/api/log', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event: 'blur', details:{reason} }) });
  // remove blur after short time
  setTimeout(() => { passwordDisplay.classList.remove('blurred'); showMessage(''); }, 2000);
}

// Tab switch and window blur
document.addEventListener('visibilitychange', () => {
  if (document.hidden) blurPassword('tab_switch');
});
window.addEventListener('blur', () => blurPassword('window_blur'));

// Mouse speed detection
let lastMouse = null;
window.addEventListener('mousemove', (e) => {
  const now = performance.now();
  if (lastMouse) {
    const dt = now - lastMouse.t;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    const speed = Math.sqrt(dx*dx + dy*dy) / (dt || 1);
    if (speed > 1.5) { // threshold tuned for desktop
      blurPassword('fast_mouse');
    }
  }
  lastMouse = { x: e.clientX, y: e.clientY, t: now };
});

// Send periodic heartbeat for demo
setInterval(() => { fetch('/api/log', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'heartbeat' }) }); }, 60_000);

// Add shuffle button functionality
document.getElementById('shuffleBtn')?.addEventListener('click', () => {
  renderKeyboard();
});

// Initialize
renderKeyboard();
startFakeCursor();
startKeyDecoys();
