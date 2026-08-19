// TrainedForce Platform Core Logic
let state = {
  activeTab: 'overview',
  currentUser: {
    id: "usr_client_1",
    name: "Sarah Jenkins",
    company: "Acuity Health SaaS (US)",
    email: "sarah@acuityhealth.io",
    role: "client",
    avatar: "💼"
  },
  users: [],
  services: [],
  tasks: [],
  sops: [],
  discoveryRecords: [],
  stats: {},
  currentInspectTask: null
};

// API Helper
const API = {
  get: async (url) => {
    const res = await fetch(url, { credentials: 'omit' });
    return res.json();
  },
  post: async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'omit'
    });
    return res.json();
  }
};

// Init
document.addEventListener('DOMContentLoaded', async () => {
  await loadInitialData();
  renderAll();
  calculatePainScore();
});

async function loadInitialData() {
  try {
    const [stats, users, services, tasks, sops, discoveryRecords] = await Promise.all([
      API.get('/api/stats'),
      API.get('/api/auth/users'),
      API.get('/api/services'),
      API.get('/api/tasks'),
      API.get('/api/cms/sops'),
      API.get('/api/discovery/records')
    ]);

    state.stats = stats;
    state.users = users;
    state.services = services;
    state.tasks = tasks;
    state.sops = sops;
    state.discoveryRecords = discoveryRecords;

    if (users && users.length > 1) {
      state.currentUser = users[1]; // Default Sarah Jenkins (Client)
    }
  } catch (err) {
    console.error("Error loading data", err);
  }
}

function renderAll() {
  updateUserHeader();
  renderTelemetry();
  renderServices();
  renderClientTasks();
  renderWorkerTasks();
  renderDiscoveryRecords();
  renderSops();
  renderAdminTasks();
  renderUserList();
}

// 1. Telemetry
function renderTelemetry() {
  if (state.stats) {
    const accEl = document.getElementById('telemetry-accuracy');
    const opsEl = document.getElementById('telemetry-operators');
    const spdEl = document.getElementById('telemetry-speed');
    const tskEl = document.getElementById('telemetry-tasks');

    if (accEl) accEl.innerText = `${state.stats.globalModelAccuracy || 99.4}%`;
    if (opsEl) opsEl.innerText = `${state.stats.activeOperators || 284} Online`;
    if (spdEl) spdEl.innerText = `${state.stats.avgTurnaroundMinutes || 4.8} mins`;
    if (tskEl) tskEl.innerText = `${(state.stats.totalTasksCompleted || 142850).toLocaleString()}+`;
  }
}

// 2. Tab Navigation
function switchTab(tabId) {
  state.activeTab = tabId;

  // Update nav buttons
  document.querySelectorAll('.nav-item-btn').forEach(btn => btn.classList.remove('active'));
  const activeNavBtn = document.getElementById(`nav-${tabId}`);
  if (activeNavBtn) activeNavBtn.classList.add('active');

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active-panel'));
  const activePanel = document.getElementById(`panel-${tabId}`);
  if (activePanel) activePanel.classList.add('active-panel');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. User Switcher & Header
function updateUserHeader() {
  const avatarEl = document.getElementById('current-user-avatar');
  const nameEl = document.getElementById('current-user-name');
  if (avatarEl && nameEl && state.currentUser) {
    avatarEl.innerText = state.currentUser.avatar || '👤';
    const roleLabel = state.currentUser.role === 'client' ? 'Client' : state.currentUser.role === 'worker' ? 'Operator' : 'Admin';
    nameEl.innerText = `${state.currentUser.name.split(' ')[0]} (${roleLabel})`;
  }
}

function renderUserList() {
  const container = document.getElementById('user-persona-list');
  if (!container) return;

  container.innerHTML = state.users.map(u => `
    <div class="glass-panel" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-color: ${state.currentUser.id === u.id ? 'var(--primary)' : 'var(--border-color)'}" onclick="selectUser('${u.id}')">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.5rem;">${u.avatar || '👤'}</span>
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">${u.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${u.badge || u.company || u.role}</div>
        </div>
      </div>
      <span class="status-pill ${u.role === 'client' ? 'pill-blue' : u.role === 'worker' ? 'pill-purple' : 'pill-green'}">${u.role.toUpperCase()}</span>
    </div>
  `).join('');
}

function selectUser(userId) {
  const u = state.users.find(x => x.id === userId);
  if (u) {
    state.currentUser = u;
    updateUserHeader();
    renderAll();
    closeModal('modal-auth');

    // Auto navigate to relevant view
    if (u.role === 'client') switchTab('client');
    else if (u.role === 'worker') switchTab('worker');
    else if (u.role === 'admin') switchTab('admin');
  }
}

async function submitRegistration() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const role = document.getElementById('reg-role').value;

  if (!name || !email) {
    alert('Please enter your full name and email.');
    return;
  }

  const res = await API.post('/api/auth/register', { name, email, role });
  if (res.success) {
    state.users.push(res.user);
    state.currentUser = res.user;
    updateUserHeader();
    renderAll();
    closeModal('modal-auth');
    if (role === 'worker') switchTab('worker');
    else switchTab('client');
  }
}

// 4. Services Grid
function renderServices() {
  const container = document.getElementById('services-grid-overview');
  if (!container) return;

  const icons = {
    srv_support: '🎧',
    srv_finance: '📊',
    srv_ecommerce: '🛍️',
    srv_revops: '🎯',
    srv_aiqa: '🧠'
  };

  container.innerHTML = state.services.map(s => `
    <div class="glass-panel service-card">
      <div>
        <div class="service-header">
          <span class="service-icon">${icons[s.id] || '⚡'}</span>
          <span class="status-pill pill-blue">${s.category}</span>
        </div>
        <h3 class="service-title">${s.name}</h3>
        <p class="service-desc">${s.description}</p>
      </div>

      <div>
        <div class="service-meta">
          <span style="color: var(--text-dim);">Guaranteed SLA: <strong style="color: #fff;">${s.sla}</strong></span>
          <span style="color: var(--text-dim);">Accuracy Target: <strong style="color: var(--accent-emerald);">${s.accuracyTarget}</strong></span>
        </div>
        <button class="btn btn-outline btn-sm" style="width: 100%;" onclick="openNewTaskModal('${s.id}')">Launch This Workflow →</button>
      </div>
    </div>
  `).join('');
}

// 5. Client Tasks
function filterClientTasks(status, btn) {
  document.querySelectorAll('#panel-client .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderClientTasks(status);
}

function renderClientTasks(filter = 'all') {
  const container = document.getElementById('client-tasks-container');
  if (!container) return;

  let tasks = state.tasks;
  if (filter !== 'all') {
    tasks = tasks.filter(t => t.status === filter);
  }

  // Update counts
  const activeCountEl = document.getElementById('client-active-count');
  const verifiedCountEl = document.getElementById('client-verified-count');
  if (activeCountEl) activeCountEl.innerText = state.tasks.filter(t => t.status !== 'verified').length;
  if (verifiedCountEl) verifiedCountEl.innerText = state.tasks.filter(t => t.status === 'verified').length;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 10px;">📋</div>
        <div style="font-size: 1.1rem; font-weight: 600; color: #fff;">No tasks found for this filter</div>
        <p style="margin-top: 6px;">Submit a new workflow batch to initiate AI processing and human QA.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(t => `
    <div class="glass-panel task-card">
      <div class="task-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="task-id">${t.id}</span>
          <span class="task-title">${t.title}</span>
        </div>
        <div>
          ${getStatusPill(t.status)}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Client Payload / Input</div>
          <div class="task-summary-box">${escapeHtml(t.inputSummary)}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--primary); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">AI Pipeline & QA Resolution</div>
          <div class="task-ai-box">
            ${escapeHtml(t.operatorNotes || t.aiDraft)}
          </div>
        </div>
      </div>

      <div class="task-footer">
        <div>
          <span>Assigned Operator: <strong>${t.workerName || 'Awaiting Claim in Queue'}</strong></span>
          ${t.turnaroundSeconds ? ` • <span>Turnaround: <strong style="color: var(--primary);">${Math.round(t.turnaroundSeconds / 60)} mins</strong></span>` : ''}
          ${t.accuracyScore ? ` • <span>Verified Accuracy: <strong style="color: var(--accent-emerald);">${t.accuracyScore}%</strong></span>` : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm" onclick="inspectTaskLogs('${t.id}')">Audit Trail (${t.auditLog.length})</button>
        </div>
      </div>
    </div>
  `).join('');
}

// 6. Worker Portal
function renderWorkerTasks() {
  const container = document.getElementById('worker-tasks-container');
  if (!container) return;

  const tasks = state.tasks;

  container.innerHTML = tasks.map(t => {
    const isClaimable = t.status === 'in_worker_review' && !t.workerName;
    const isClaimedByMe = t.status === 'in_worker_review' && t.workerName;
    const isCompleted = t.status === 'verified';

    return `
      <div class="glass-panel task-card" style="border-left: 4px solid ${isCompleted ? 'var(--accent-emerald)' : 'var(--primary)'};">
        <div class="task-card-header">
          <div>
            <span class="task-id">${t.id}</span>
            <span class="task-title" style="margin-left: 8px;">${t.title}</span>
            <span style="font-size: 0.8rem; color: var(--text-dim); margin-left: 8px;">Client: ${t.clientName}</span>
          </div>
          <div>
            ${getStatusPill(t.status)}
          </div>
        </div>

        <div style="font-size: 0.88rem; color: #cbd5e1;">
          <strong>Client Context:</strong> ${escapeHtml(t.inputSummary)}
        </div>

        <div class="task-ai-box" style="font-size: 0.85rem;">
          <strong style="color: var(--primary);">Gemini AI Proposed Draft:</strong><br>
          ${escapeHtml(t.aiDraft)}
        </div>

        <div class="task-footer">
          <div>
            Priority: <strong style="color: ${t.priority === 'Urgent' ? 'var(--accent-rose)' : '#fff'}">${t.priority}</strong>
            • Created: ${new Date(t.createdAt).toLocaleTimeString()}
          </div>
          <div>
            ${t.status === 'in_worker_review' ? `
              <button class="btn btn-primary btn-sm" onclick="openWorkerWorkbench('${t.id}')">
                🛠️ Open QA Verification Workbench
              </button>
            ` : `
              <span style="color: var(--accent-emerald); font-weight: 600;">✔ Verified Compliant (${t.accuracyScore || 100}%)</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openWorkerWorkbench(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  state.currentInspectTask = task;
  document.getElementById('modal-task-title').innerText = `${task.id}: ${task.title}`;
  document.getElementById('modal-task-meta').innerText = `Client: ${task.clientName} | Priority: ${task.priority}`;
  document.getElementById('modal-task-input').innerText = task.inputSummary;
  document.getElementById('modal-task-aidraft').innerText = task.aiDraft;
  document.getElementById('modal-operator-notes').value = task.operatorNotes || 'Confirmed compliance with SOP. Approved.';

  openModal('modal-verify-task');
}

async function submitTaskAction(actionType) {
  if (!state.currentInspectTask) return;

  const notes = document.getElementById('modal-operator-notes').value;
  const res = await API.post(`/api/tasks/${state.currentInspectTask.id}/verify`, {
    actionType,
    operatorNotes: notes,
    accuracyScore: actionType === 'verify' ? 100 : undefined
  });

  if (res.success) {
    // Update local state
    const idx = state.tasks.findIndex(t => t.id === state.currentInspectTask.id);
    if (idx !== -1) state.tasks[idx] = res.task;
    closeModal('modal-verify-task');
    renderAll();
    alert(actionType === 'verify' ? 'Task verified and delivered with audit signature!' : 'Task escalated to Operations Lead.');
  }
}

// 7. Operations CMS
function renderSops() {
  const container = document.getElementById('sops-grid');
  if (!container) return;

  container.innerHTML = state.sops.map(s => `
    <div class="glass-panel" style="padding: 22px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <span class="status-pill pill-purple">${s.category}</span>
        <span class="mono" style="font-size: 0.75rem; color: var(--primary);">v${s.version}</span>
      </div>
      <h4 style="font-size: 1.1rem; margin-bottom: 12px;">${s.title}</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #cbd5e1;">
        ${s.rules.map(r => `<li style="display: flex; gap: 8px;"><span>⚡</span><span>${escapeHtml(r)}</span></li>`).join('')}
      </ul>
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 0.78rem; color: var(--text-dim);">
        Last Modified: ${s.updatedAt}
      </div>
    </div>
  `).join('');
}

function renderAdminTasks() {
  const container = document.getElementById('admin-tasks-container');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-panel" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
            <th style="padding: 12px 16px;">Task ID</th>
            <th style="padding: 12px 16px;">Title</th>
            <th style="padding: 12px 16px;">Client</th>
            <th style="padding: 12px 16px;">Operator</th>
            <th style="padding: 12px 16px;">Status</th>
            <th style="padding: 12px 16px;">Audit Trail</th>
          </tr>
        </thead>
        <tbody>
          ${state.tasks.map(t => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
              <td style="padding: 12px 16px;" class="mono"><strong style="color: var(--primary);">${t.id}</strong></td>
              <td style="padding: 12px 16px;">${t.title}</td>
              <td style="padding: 12px 16px; color: var(--text-muted);">${t.clientName}</td>
              <td style="padding: 12px 16px;">${t.workerName || '<span style="color: var(--text-dim);">Unassigned</span>'}</td>
              <td style="padding: 12px 16px;">${getStatusPill(t.status)}</td>
              <td style="padding: 12px 16px;">
                <button class="btn btn-outline btn-sm" onclick="inspectTaskLogs('${t.id}')">View Logs (${t.auditLog.length})</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 8. Discovery & ROI Calculator Logic
function updateRange(id) {
  const val = document.getElementById(`range-${id}`).value;
  document.getElementById(`val-${id}`).innerText = val;
}

function calculatePainScore() {
  const freq = parseInt(document.getElementById('range-freq')?.value || 4);
  const pain = parseInt(document.getElementById('range-pain')?.value || 5);
  const econ = parseInt(document.getElementById('range-econ')?.value || 4);
  const meas = parseInt(document.getElementById('range-meas')?.value || 5);
  const remote = parseInt(document.getElementById('range-remote')?.value || 5);
  const ai = parseInt(document.getElementById('range-ai')?.value || 4);
  const buyer = parseInt(document.getElementById('range-buyer')?.value || 4);
  const urg = parseInt(document.getElementById('range-urg')?.value || 5);

  const total = freq + pain + econ + meas + remote + ai + buyer + urg;
  const cost = parseFloat(document.getElementById('calc-cost')?.value || 18000);

  const scoreDisplay = document.getElementById('calc-score-display');
  const badge = document.getElementById('calc-recommendation-badge');

  if (scoreDisplay) {
    scoreDisplay.innerHTML = `${total} <span style="font-size: 1.5rem; color: var(--text-dim);">/ 40</span>`;
  }

  if (badge) {
    if (total >= 32) {
      badge.className = "status-pill pill-green";
      badge.innerText = "⭐ High Priority (32–40): Prime Pilot Candidate";
      if (scoreDisplay) scoreDisplay.style.color = "#34d399";
    } else if (total >= 24) {
      badge.className = "status-pill pill-amber";
      badge.innerText = "⚡ Investigate (24–31): Strong Potential with Custom SOP";
      if (scoreDisplay) scoreDisplay.style.color = "#fbbf24";
    } else {
      badge.className = "status-pill pill-purple";
      badge.innerText = "❄ Low Priority (< 24): Discovery evidence insufficient";
      if (scoreDisplay) scoreDisplay.style.color = "#a78bfa";
    }
  }

  // Economics
  const tfCost = Math.round(cost * 0.32);
  const savings = Math.round(cost * 0.68);
  const annualSavings = savings * 12;

  const curEl = document.getElementById('disp-current-cost');
  const tfEl = document.getElementById('disp-tf-cost');
  const savEl = document.getElementById('disp-savings');
  const annEl = document.getElementById('disp-annual-savings');

  if (curEl) curEl.innerText = `$${cost.toLocaleString()} / mo`;
  if (tfEl) tfEl.innerText = `$${tfCost.toLocaleString()} / mo`;
  if (savEl) savEl.innerText = `$${savings.toLocaleString()} / mo (68%)`;
  if (annEl) annEl.innerText = `$${annualSavings.toLocaleString()} / year`;
}

async function submitDiscoveryRecord() {
  const company = document.getElementById('calc-company').value;
  const industry = document.getElementById('calc-industry').value;
  const workflow = document.getElementById('calc-workflow').value;
  const monthlyCost = parseFloat(document.getElementById('calc-cost').value);
  const hoursPerWeek = parseFloat(document.getElementById('calc-hours').value);

  const freq = parseInt(document.getElementById('range-freq').value);
  const pain = parseInt(document.getElementById('range-pain').value);
  const econ = parseInt(document.getElementById('range-econ').value);
  const meas = parseInt(document.getElementById('range-meas').value);
  const remote = parseInt(document.getElementById('range-remote').value);
  const ai = parseInt(document.getElementById('range-ai').value);
  const buyer = parseInt(document.getElementById('range-buyer').value);
  const urgency = parseInt(document.getElementById('range-urg').value);

  const res = await API.post('/api/discovery/score', {
    company, industry, workflow, monthlyCost, hoursPerWeek,
    frequency: freq, pain, economicImpact: econ, measurability: meas,
    remoteDeliverability: remote, aiSuitability: ai, buyerAccess: buyer, urgency
  });

  if (res.record) {
    state.discoveryRecords.unshift(res.record);
    renderDiscoveryRecords();
    alert(`Discovery Record Saved for ${company}! Pain Score: ${res.painScore}/40.`);
  }
}

function renderDiscoveryRecords() {
  const container = document.getElementById('discovery-table-body');
  if (!container) return;

  container.innerHTML = state.discoveryRecords.map(r => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
      <td style="padding: 12px 16px; font-weight: 600; color: #fff;">${r.company}</td>
      <td style="padding: 12px 16px; color: var(--text-muted);">${r.industry}</td>
      <td style="padding: 12px 16px;">${r.workflow}</td>
      <td style="padding: 12px 16px;" class="mono"><strong style="color: var(--primary);">${r.painScore}/40</strong></td>
      <td style="padding: 12px 16px;" class="mono">${r.currentCostMonthly}</td>
      <td style="padding: 12px 16px;"><span class="status-pill pill-green">${r.recommendation ? r.recommendation.split('—')[0] : 'Saved'}</span></td>
    </tr>
  `).join('');
}

// 9. Modals & Task Submission
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

function openNewTaskModal(serviceId) {
  if (serviceId) {
    const sel = document.getElementById('new-task-service');
    if (sel) sel.value = serviceId;
  }
  openModal('modal-new-task');
}

async function submitNewTask() {
  const serviceId = document.getElementById('new-task-service').value;
  const title = document.getElementById('new-task-title').value;
  const priority = document.getElementById('new-task-priority').value;
  const inputSummary = document.getElementById('new-task-input').value;

  if (!title) {
    alert('Please enter a task title or reference.');
    return;
  }

  const res = await API.post('/api/tasks', {
    title,
    serviceId,
    priority,
    inputSummary,
    clientId: state.currentUser.id,
    clientName: state.currentUser.company || state.currentUser.name
  });

  if (res.success) {
    state.tasks.unshift(res.task);
    closeModal('modal-new-task');
    renderAll();
    switchTab('client');
    alert(`Task ${res.task.id} successfully queued for AI processing and human QA!`);
  }
}

async function submitOnboardingTest() {
  const q1 = document.querySelector('input[name="q1"]:checked')?.value;
  const q2 = document.querySelector('input[name="q2"]:checked')?.value;
  const q3 = document.querySelector('input[name="q3"]:checked')?.value;

  if (!q1 || !q2 || !q3) {
    alert('Please answer all 3 qualification questions.');
    return;
  }

  const res = await API.post('/api/workers/onboard-test', {
    workerId: state.currentUser.id,
    answers: { q1, q2, q3 }
  });

  if (res.success) {
    closeModal('modal-onboard-test');
    alert(`Assessment Result: ${res.score}% (${res.passed ? 'PASSED' : 'RETAKE'})\n\n${res.feedback}`);
    const u = state.users.find(x => x.id === state.currentUser.id);
    if (u) {
      u.badge = res.badge;
      u.accuracy = res.score;
    }
    renderAll();
  }
}

async function submitNewSop() {
  const title = document.getElementById('sop-title').value;
  const category = document.getElementById('sop-category').value;
  const rawRules = document.getElementById('sop-rules').value;

  if (!title || !category) {
    alert('Please provide a title and category.');
    return;
  }

  const rules = rawRules.split('\n').map(r => r.trim()).filter(Boolean);
  const res = await API.post('/api/cms/sops', { title, category, rules });
  if (res.success) {
    state.sops.push(res.sop);
    closeModal('modal-new-sop');
    renderSops();
    alert('SOP Blueprint created and published to operator knowledge base!');
  }
}

function inspectTaskLogs(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  let msg = `AUDIT TRAIL FOR [${task.id}]\n\n`;
  task.auditLog.forEach(log => {
    msg += `• [${new Date(log.time).toLocaleTimeString()}] ${log.action} (Actor: ${log.actor})\n`;
  });
  alert(msg);
}

// Helpers
function getStatusPill(status) {
  switch (status) {
    case 'verified':
      return `<span class="status-pill pill-green"><span class="pulse-dot"></span> Verified</span>`;
    case 'in_worker_review':
      return `<span class="status-pill pill-purple"><span class="pulse-dot"></span> In QA Review</span>`;
    case 'ai_processing':
      return `<span class="status-pill pill-blue"><span class="pulse-dot"></span> AI Ingesting</span>`;
    case 'escalated':
      return `<span class="status-pill pill-amber">⚠ Escalated</span>`;
    default:
      return `<span class="status-pill pill-blue">${status}</span>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
