// Simple Express server for Shoulder Surfing Protection System
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory storage for demo purposes
const users = []; // will store { username, passwordHash }
const securityLogs = {}; // username => [{time, event, details}]

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (simple, for demo)
app.use(
  session({
    secret: 'replace_this_with_a_real_secret_for_prod',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
  })
);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Helper: add security log for user
function addLog(username, event, details) {
  if (!username) username = 'anonymous';
  securityLogs[username] = securityLogs[username] || [];
  securityLogs[username].push({ time: new Date().toISOString(), event, details });
}

// Seed a demo user on startup
(async () => {
  const username = 'student';
  const plain = 'P@ssw0rd123';
  const hash = await bcrypt.hash(plain, 10);
  users.push({ username, passwordHash: hash });
  securityLogs[username] = [];
  console.log('Seeded demo user: username=student password=P@ssw0rd123');
})();

// API: login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    addLog(username, 'login_failed', 'user_not_found');
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    addLog(username, 'login_failed', 'bad_password');
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  // success
  req.session.user = { username };
  addLog(username, 'login_success', { ip: req.ip, ua: req.headers['user-agent'] });
  return res.json({ success: true, message: 'Login successful' });
});

// API: session info
app.get('/api/session', (req, res) => {
  if (!req.session.user) return res.json({ authenticated: false });
  const username = req.session.user.username;
  return res.json({ authenticated: true, username, loginTime: req.session.cookie._expires, ua: req.headers['user-agent'] });
});

// API: submit security log events from frontend
app.post('/api/log', (req, res) => {
  const username = req.session.user ? req.session.user.username : 'anonymous';
  const { event, details } = req.body;
  addLog(username, event, details || {});
  return res.json({ ok: true });
});

// API: get logs (for dashboard)
app.get('/api/logs', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'unauthenticated' });
  const username = req.session.user.username;
  return res.json({ logs: securityLogs[username] || [] });
});

// API: logout
app.post('/api/logout', (req, res) => {
  const username = req.session.user ? req.session.user.username : null;
  req.session.destroy(() => {});
  addLog(username, 'logout', {});
  res.json({ ok: true });
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
