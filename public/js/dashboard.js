// dashboard.js: Enhanced dashboard with real-time updates and animations
let sessionStartTime = Date.now();
let refreshInterval;

async function init() {
  try {
    const s = await fetch('/api/session');
    const data = await s.json();
    
    if (!data.authenticated) {
      window.location.href = '/';
      return;
    }

    // Update user display
    document.getElementById('userDisplay').textContent = data.username || 'student';
    
    // Update login time with animation
    const loginTimeEl = document.getElementById('loginTime');
    loginTimeEl.textContent = new Date().toLocaleTimeString();
    loginTimeEl.classList.add('success-animation');
    
    // Update browser info
    const browserInfoEl = document.getElementById('browserInfo');
    const userAgent = data.ua || navigator.userAgent;
    const browserName = getBrowserName(userAgent);
    browserInfoEl.textContent = browserName;
    
    // Animate security score
    animateSecurityScore();
    
    // Start session duration timer
    updateSessionDuration();
    setInterval(updateSessionDuration, 1000);
    
    // Fetch and display logs
    await loadLogs();
    
    // Set up auto-refresh
    refreshInterval = setInterval(loadLogs, 30000); // Refresh every 30 seconds
    
  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    showError('Failed to load dashboard data');
  }
}

function getBrowserName(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function animateSecurityScore() {
  const scoreEl = document.getElementById('securityScore');
  const scoreTextEl = document.getElementById('securityScoreText');
  let score = 0;
  const targetScore = 95;
  
  const interval = setInterval(() => {
    score += Math.ceil((targetScore - score) / 10);
    if (score >= targetScore) {
      score = targetScore;
      clearInterval(interval);
    }
    
    scoreEl.style.width = `${score}%`;
    scoreTextEl.textContent = `${score}%`;
  }, 100);
}

function updateSessionDuration() {
  const now = Date.now();
  const duration = Math.floor((now - sessionStartTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  const durationEl = document.getElementById('sessionDuration');
  durationEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function loadLogs() {
  try {
    const logsRes = await fetch('/api/logs');
    if (!logsRes.ok) throw new Error('Failed to fetch logs');
    
    const logs = await logsRes.json();
    const logsEl = document.getElementById('logs');
    
    if (!logs.logs || logs.logs.length === 0) {
      logsEl.innerHTML = '<div class="text-slate-500 text-center py-8">No security events recorded</div>';
      return;
    }
    
    // Group logs by type and add visual indicators
    const logEntries = logs.logs.map(log => {
      const time = new Date(log.time).toLocaleTimeString();
      const eventClass = getEventClass(log.event);
      const icon = getEventIcon(log.event);
      
      return `
        <div class="flex items-start space-x-3 p-2 rounded hover:bg-slate-800/30 transition-colors">
          <span class="mt-1">${icon}</span>
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="text-cyan-400">${time}</span>
              <span class="${eventClass} font-semibold">${log.event}</span>
            </div>
            ${log.details && Object.keys(log.details).length > 0 ? 
              `<div class="text-slate-500 mt-1">${formatLogDetails(log.details)}</div>` : ''
            }
          </div>
        </div>
      `;
    }).reverse().join('');
    
    logsEl.innerHTML = logEntries;
    
  } catch (error) {
    console.error('Failed to load logs:', error);
    const logsEl = document.getElementById('logs');
    logsEl.innerHTML = '<div class="text-red-400 text-center py-8">Failed to load security logs</div>';
  }
}

function getEventClass(event) {
  switch (event) {
    case 'login_success': return 'text-green-400';
    case 'login_failed': return 'text-red-400';
    case 'blur': return 'text-amber-400';
    case 'logout': return 'text-blue-400';
    case 'heartbeat': return 'text-slate-400';
    default: return 'text-slate-300';
  }
}

function getEventIcon(event) {
  switch (event) {
    case 'login_success': 
      return '<svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
    case 'login_failed': 
      return '<svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
    case 'blur': 
      return '<svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>';
    case 'logout': 
      return '<svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path></svg>';
    default: 
      return '<svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
  }
}

function formatLogDetails(details) {
  if (typeof details === 'string') return details;
  if (typeof details === 'object') {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  return JSON.stringify(details);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-900/90 border border-red-500 text-red-200 px-4 py-3 rounded-lg shadow-lg z-50';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/api/logout', { method: 'POST' });
    clearInterval(refreshInterval);
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    showError('Logout failed. Please try again.');
  }
});

document.getElementById('refreshLogs').addEventListener('click', async () => {
  const btn = document.getElementById('refreshLogs');
  const originalContent = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = '<svg class="w-4 h-4 loading" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refreshing...';
  
  try {
    await loadLogs();
    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Updated!';
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }, 1000);
  } catch (error) {
    btn.innerHTML = originalContent;
    btn.disabled = false;
    showError('Failed to refresh logs');
  }
});

// Initialize dashboard
init();
