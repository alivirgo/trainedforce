/**
 * TrainedForce Marketplace & Operations Engine
 * Client-side Controller & UI State Handler
 * 
 * Authored by: Frontend & Product Engineering
 */

const App = (function () {
  // Private application state
  const state = {
    currentTab: 'projects',
    selectedCategory: 'all',
    selectedStatus: 'all',
    searchQuery: '',
    currentUser: null,
    users: [],
    services: [],
    tasks: [],
    sops: [],
    discoveryRecords: [],
    stats: {},
    activeInspectTask: null
  };

  // HTTP API Client
  const http = {
    async get(endpoint) {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error(`[API GET] Failed to fetch ${endpoint}:`, err);
        return null;
      }
    },

    async post(endpoint, payload) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await res.json();
      } catch (err) {
        console.error(`[API POST] Failed to post to ${endpoint}:`, err);
        return { success: false, error: err.message };
      }
    }
  };

  // Initialization
  async function init() {
    console.log('[TrainedForce] Initializing application...');
    await loadInitialData();
    renderUserNav();
    renderProjectsFeed();
    renderOperators();
    renderSops();
    calculateDiscoveryScore();
    console.log('[TrainedForce] Ready.');
  }

  // Fetch all initial data concurrently
  async function loadInitialData() {
    const [stats, users, services, tasks, sops, discoveryRecords] = await Promise.all([
      http.get('/api/stats'),
      http.get('/api/auth/users'),
      http.get('/api/services'),
      http.get('/api/tasks'),
      http.get('/api/cms/sops'),
      http.get('/api/discovery/records')
    ]);

    state.stats = stats || {};
    state.users = users || [];
    state.services = services || [];
    state.tasks = tasks || [];
    state.sops = sops || [];
    state.discoveryRecords = discoveryRecords || [];

    // Default to client persona (Sarah) if available
    state.currentUser = state.users[1] || state.users[0] || {
      id: 'usr_default',
      name: 'Sarah Jenkins',
      role: 'client',
      company: 'Acuity Health SaaS',
      avatar: '💼'
    };
  }

  // Tab & View Navigation
  function navigateTo(tabId) {
    state.currentTab = tabId;

    // Update Header Navigation Links
    document.querySelectorAll('.fl-nav-link').forEach(btn => btn.classList.remove('active'));
    const activeLink = document.getElementById(`nav-${tabId}`);
    if (activeLink) activeLink.classList.add('active');

    // Show / Hide Views
    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.style.display = 'block';
    }

    // Toggle hero banner visibility for sub-pages if desired
    const hero = document.getElementById('hero-banner');
    if (hero) {
      hero.style.display = tabId === 'projects' ? 'block' : 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Category Filtering
  function filterCategory(catId, element) {
    state.selectedCategory = catId;
    document.querySelectorAll('.fl-subnav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
    renderProjectsFeed();
  }

  function filterStatus(status) {
    state.selectedStatus = status;
    renderProjectsFeed();
  }

  function handleSearch(query) {
    state.searchQuery = (query || '').toLowerCase().trim();
    renderProjectsFeed();
  }

  function applyFilters() {
    renderProjectsFeed();
  }

  function sortProjects(sortKey) {
    if (sortKey === 'newest') {
      state.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortKey === 'priority') {
      const priorityOrder = { 'Urgent': 3, 'High': 2, 'Normal': 1 };
      state.tasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else if (sortKey === 'accuracy') {
      state.tasks.sort((a, b) => (b.accuracyScore || 0) - (a.accuracyScore || 0));
    }
    renderProjectsFeed();
  }

  // Render Projects Feed (Freelancer.com Card Layout)
  function renderProjectsFeed() {
    const container = document.getElementById('projects-feed-container');
    if (!container) return;

    let filtered = state.tasks;

    // Filter by category
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.serviceId === state.selectedCategory);
    }

    // Filter by status
    if (state.selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === state.selectedStatus);
    }

    // Filter by search query
    if (state.searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(state.searchQuery) ||
        t.inputSummary.toLowerCase().includes(state.searchQuery) ||
        t.clientName.toLowerCase().includes(state.searchQuery)
      );
    }

    // Update count badge
    const countBadge = document.getElementById('project-count-badge');
    if (countBadge) countBadge.innerText = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📋</div>
          <h4 style="color: var(--text-primary);">No active projects found</h4>
          <p style="margin-top: 4px; font-size: 0.9rem;">Try selecting a different filter or post a new workflow project.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const isVerified = t.status === 'verified';
      const isUrgent = t.priority === 'Urgent';
      const timeAgo = formatTimeAgo(t.createdAt);

      return `
        <article class="project-card">
          <div class="project-card-top">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                ${isUrgent ? '<span class="badge badge-urgent">🔥 Urgent SLA</span>' : ''}
                ${isVerified ? '<span class="badge badge-verified">✔ Verified QA Pass</span>' : '<span class="badge badge-blue">⚡ In QA Review</span>'}
                <span class="badge badge-pro">${t.serviceId.replace('srv_', '').toUpperCase()}</span>
                <span class="mono" style="font-size: 0.78rem; color: var(--text-light);">${t.id}</span>
              </div>
              <h3 class="project-title" onclick="App.openTaskQA('${t.id}')">${escapeHtml(t.title)}</h3>
              <div class="project-meta-row">
                <span>Posted ${timeAgo}</span>
                <span>•</span>
                <span>Client: <strong>${escapeHtml(t.clientName)}</strong></span>
                <span>•</span>
                <span>Assigned QA: <strong>${t.workerName || 'Open in Squad Queue'}</strong></span>
              </div>
            </div>

            <div class="project-budget-box">
              <div class="project-budget-val">$250 - $750</div>
              <div class="project-budget-type">Fixed Price Batch</div>
            </div>
          </div>

          <div class="project-desc">
            ${escapeHtml(t.inputSummary)}
          </div>

          <div class="project-ai-context">
            <strong>🤖 Gemini Pipeline Inference:</strong> ${escapeHtml(t.operatorNotes || t.aiDraft)}
          </div>

          <div class="project-tags-row">
            <span class="project-tag">#human-in-the-loop</span>
            <span class="project-tag">#gemini-2.5-qa</span>
            <span class="project-tag">#sop-adherence</span>
            <span class="project-tag">#sla-guarantee</span>
          </div>

          <div class="project-footer">
            <div class="client-rating-badge">
              <span class="star-rating">★★★★★</span>
              <span><strong>5.0</strong> (48 reviews)</span>
              <span style="margin-left: 8px; color: var(--fl-emerald); font-weight: 600;">✔ Payment & SOP Verified</span>
            </div>

            <div style="display: flex; gap: 8px;">
              ${t.status === 'verified' ? `
                <button class="btn btn-outline btn-sm" onclick="App.inspectAuditTrail('${t.id}')">View Audit Trail (${t.auditLog.length})</button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="App.openTaskQA('${t.id}')">
                  🛠️ Open QA Workbench
                </button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Render Operators / Freelancers Directory
  function renderOperators() {
    const container = document.getElementById('operators-grid-container');
    if (!container) return;

    const operators = [
      {
        name: "Bilal Tariq",
        location: "Lahore, Pakistan 🇵🇰",
        title: "Lead AI Knowledge Work Specialist & Finance QA",
        avatar: "⚡",
        rate: "$14 / hr",
        jss: "99.8%",
        tasks: "3,410",
        rating: "5.0",
        reviews: 214,
        badges: ["Top Rated", "HIPAA Certified", "Gemini Master"],
        skills: ["PO Reconciliation", "ERP Audit", "Exception Triage", "Tax Rules"]
      },
      {
        name: "Fatima Noor",
        location: "Karachi, Pakistan 🇵🇰",
        title: "Senior AI Customer Support & Content Moderation Lead",
        avatar: "🌟",
        rate: "$12 / hr",
        jss: "99.9%",
        tasks: "4,890",
        rating: "5.0",
        reviews: 320,
        badges: ["Preferred Freelancer", "Zendesk Expert", "Tier-2 QA"],
        skills: ["Customer Empathy", "Refund Policy Triage", "Tone Calibration", "SLA Escalations"]
      },
      {
        name: "Usman Raza",
        location: "Islamabad, Pakistan 🇵🇰",
        title: "E-Commerce Catalog Taxonomy & LLM RLHF Specialist",
        avatar: "🚀",
        rate: "$15 / hr",
        jss: "99.5%",
        tasks: "2,150",
        rating: "4.9",
        reviews: 142,
        badges: ["Top Rated", "Google Merchant Pro", "RLHF Lead"],
        skills: ["SKU Attribute Tagging", "Multilingual QA", "Hallucination Check", "CSV Pipelines"]
      }
    ];

    container.innerHTML = operators.map(op => `
      <div class="operator-card">
        <div>
          <div class="operator-header">
            <div class="operator-avatar-big">${op.avatar}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4 class="operator-name">${op.name}</h4>
                <span class="badge badge-verified">VERIFIED</span>
              </div>
              <div class="operator-title">${op.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 2px;">📍 ${op.location}</div>
            </div>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
            ${op.badges.map(b => `<span class="badge badge-featured">${b}</span>`).join('')}
          </div>

          <div class="operator-metrics-row">
            <div>
              <div class="operator-metric-val" style="color: var(--fl-emerald);">${op.jss}</div>
              <div class="operator-metric-lbl">Job Success</div>
            </div>
            <div>
              <div class="operator-metric-val">${op.tasks}</div>
              <div class="operator-metric-lbl">Tasks Done</div>
            </div>
            <div>
              <div class="operator-metric-val" style="color: var(--fl-blue);">${op.rate}</div>
              <div class="operator-metric-lbl">Hourly / SLA</div>
            </div>
          </div>

          <div class="project-tags-row">
            ${op.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="alert('Viewing verified credentials for ${op.name}')">View Profile</button>
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="App.openPostProjectModal()">Invite to Project</button>
        </div>
      </div>
    `).join('');
  }

  // Render SOPs (Internal CMS)
  function renderSops() {
    const container = document.getElementById('sops-grid-container');
    if (!container) return;

    container.innerHTML = state.sops.map(s => `
      <div class="card" style="padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <span class="badge badge-pro">${s.category}</span>
          <span class="mono" style="font-size: 0.75rem; color: var(--fl-blue); font-weight: 700;">v${s.version}</span>
        </div>
        <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--fl-dark-blue);">${s.title}</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.86rem; color: var(--text-secondary);">
          ${s.rules.map(r => `<li style="display: flex; gap: 8px;"><span style="color: var(--fl-blue);">•</span><span>${escapeHtml(r)}</span></li>`).join('')}
        </ul>
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-light); font-size: 0.78rem; color: var(--text-light);">
          Last updated: ${s.updatedAt}
        </div>
      </div>
    `).join('');
  }

  // Navigation user profile display
  function renderUserNav() {
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');

    if (state.currentUser) {
      if (nameEl) nameEl.innerText = state.currentUser.name;
      if (roleEl) roleEl.innerText = state.currentUser.badge || (state.currentUser.role === 'client' ? 'Enterprise Client' : 'AI Operator');
      if (avatarEl) avatarEl.innerText = state.currentUser.avatar || '👤';
    }

    renderUserModalList();
  }

  function renderUserModalList() {
    const container = document.getElementById('auth-users-list');
    if (!container) return;

    container.innerHTML = state.users.map(u => `
      <div class="card" style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-color: ${state.currentUser.id === u.id ? 'var(--fl-blue)' : 'var(--border-light)'}" onclick="App.switchUser('${u.id}')">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.3rem;">${u.avatar || '👤'}</span>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${u.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.company || u.badge || u.role}</div>
          </div>
        </div>
        <span class="badge ${u.role === 'client' ? 'badge-blue' : 'badge-verified'}">${u.role.toUpperCase()}</span>
      </div>
    `).join('');
  }

  function switchUser(userId) {
    const u = state.users.find(x => x.id === userId);
    if (u) {
      state.currentUser = u;
      renderUserNav();
      closeModal('modal-auth');
      renderProjectsFeed();
    }
  }

  async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !email) {
      alert('Please fill out your name and email.');
      return;
    }

    const res = await http.post('/api/auth/register', { name, email, role });
    if (res.success) {
      state.users.push(res.user);
      state.currentUser = res.user;
      renderUserNav();
      closeModal('modal-auth');
      alert(`Welcome, ${res.user.name}! Account registered successfully.`);
    }
  }

  // Modals
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function openPostProjectModal() {
    openModal('modal-post-project');
  }

  async function submitPostProject() {
    const serviceId = document.getElementById('post-service-id').value;
    const title = document.getElementById('post-title').value;
    const priority = document.getElementById('post-priority').value;
    const payload = document.getElementById('post-payload').value;

    if (!title) {
      alert('Please enter a project title.');
      return;
    }

    const res = await http.post('/api/tasks', {
      title,
      serviceId,
      priority,
      inputSummary: payload,
      clientId: state.currentUser.id,
      clientName: state.currentUser.company || state.currentUser.name
    });

    if (res.success) {
      state.tasks.unshift(res.task);
      closeModal('modal-post-project');
      renderProjectsFeed();
      alert(`Project "${res.task.id}" created and dispatched to the verification pipeline!`);
    }
  }

  // Task QA Drawer
  function openTaskQA(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.activeInspectTask = task;
    document.getElementById('qa-task-title').innerText = `${task.id}: ${task.title}`;
    document.getElementById('qa-task-meta').innerText = `Client: ${task.clientName} | Priority: ${task.priority} | Created: ${new Date(task.createdAt).toLocaleString()}`;
    document.getElementById('qa-task-input').innerText = task.inputSummary;
    document.getElementById('qa-task-aidraft').innerText = task.aiDraft;
    document.getElementById('qa-operator-notes').value = task.operatorNotes || 'Confirmed PO & Invoice reconciliation compliant with SOP v3.2. Approved.';

    openModal('modal-qa-task');
  }

  async function submitTaskQA(actionType) {
    if (!state.activeInspectTask) return;

    const notes = document.getElementById('qa-operator-notes').value;
    const res = await http.post(`/api/tasks/${state.activeInspectTask.id}/verify`, {
      actionType,
      operatorNotes: notes,
      accuracyScore: actionType === 'verify' ? 100 : undefined
    });

    if (res.success) {
      const idx = state.tasks.findIndex(t => t.id === state.activeInspectTask.id);
      if (idx !== -1) state.tasks[idx] = res.task;
      closeModal('modal-qa-task');
      renderProjectsFeed();
      alert(actionType === 'verify' ? 'Task QA passed and verified deliverables sent to client!' : 'Task escalated to Operations Lead for review.');
    }
  }

  function inspectAuditTrail(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    let msg = `CRYPTOGRAPHIC AUDIT TRAIL FOR [${task.id}]\n\n`;
    task.auditLog.forEach(log => {
      msg += `• [${new Date(log.time).toLocaleTimeString()}] ${log.action} (Actor: ${log.actor})\n`;
    });
    alert(msg);
  }

  // Operator Certification Exam
  async function submitOnboardingTest() {
    const q1 = document.querySelector('input[name="test-q1"]:checked')?.value;
    const q2 = document.querySelector('input[name="test-q2"]:checked')?.value;
    const q3 = document.querySelector('input[name="test-q3"]:checked')?.value;

    if (!q1 || !q2 || !q3) {
      alert('Please answer all 3 qualification questions.');
      return;
    }

    const res = await http.post('/api/workers/onboard-test', {
      workerId: state.currentUser.id,
      answers: { q1, q2, q3 }
    });

    if (res.success) {
      closeModal('modal-onboard-test');
      alert(`Score: ${res.score}% (${res.passed ? 'PASSED' : 'RETAKE'})\n\n${res.feedback}`);
      const u = state.users.find(x => x.id === state.currentUser.id);
      if (u) {
        u.badge = res.badge;
      }
      renderUserNav();
    }
  }

  // Discovery & ROI Calculator
  function updateRangeDisplay(id) {
    const val = document.getElementById(`range-${id}`).value;
    const el = document.getElementById(`val-${id}`);
    if (el) el.innerText = val;
  }

  function calculateDiscoveryScore() {
    const f = parseInt(document.getElementById('range-f')?.value || 4);
    const p = parseInt(document.getElementById('range-p')?.value || 5);
    const e = parseInt(document.getElementById('range-e')?.value || 4);
    const m = parseInt(document.getElementById('range-m')?.value || 5);
    const r = parseInt(document.getElementById('range-r')?.value || 5);
    const a = parseInt(document.getElementById('range-a')?.value || 4);
    const b = parseInt(document.getElementById('range-b')?.value || 4);
    const u = parseInt(document.getElementById('range-u')?.value || 5);

    const total = f + p + e + m + r + a + b + u;
    const cost = parseFloat(document.getElementById('calc-cost-input')?.value || 16500);

    const scoreDisplay = document.getElementById('display-score-num');
    const badge = document.getElementById('display-score-badge');

    if (scoreDisplay) scoreDisplay.innerText = `${total} / 40`;

    if (badge) {
      if (total >= 32) {
        badge.className = "badge badge-verified";
        badge.innerText = "⭐ High Priority: Prime Pilot Candidate";
      } else if (total >= 24) {
        badge.className = "badge badge-featured";
        badge.innerText = "⚡ Investigate: Strong Potential with Custom SOP";
      } else {
        badge.className = "badge badge-pro";
        badge.innerText = "❄ Low Priority (< 24): Insufficient Discovery Evidence";
      }
    }

    const tfCost = Math.round(cost * 0.32);
    const savings = Math.round(cost * 0.68);
    const annualSavings = savings * 12;

    const curEl = document.getElementById('eco-current');
    const tfEl = document.getElementById('eco-tf');
    const savEl = document.getElementById('eco-savings');
    const annEl = document.getElementById('eco-annual');

    if (curEl) curEl.innerText = `$${cost.toLocaleString()} / mo`;
    if (tfEl) tfEl.innerText = `$${tfCost.toLocaleString()} / mo`;
    if (savEl) savEl.innerText = `$${savings.toLocaleString()} / mo (68%)`;
    if (annEl) annEl.innerText = `$${annualSavings.toLocaleString()} / year`;
  }

  async function saveDiscoveryRecord() {
    const company = document.getElementById('calc-company-input').value;
    const industry = document.getElementById('calc-industry-input').value;
    const workflow = document.getElementById('calc-workflow-input').value;
    const monthlyCost = parseFloat(document.getElementById('calc-cost-input').value);
    const hoursPerWeek = parseFloat(document.getElementById('calc-hours-input').value);

    const res = await http.post('/api/discovery/score', {
      company, industry, workflow, monthlyCost, hoursPerWeek
    });

    if (res.record) {
      state.discoveryRecords.unshift(res.record);
      alert(`Discovery record saved for ${company}! Pain score: ${res.painScore}/40.`);
    }
  }

  async function submitNewSop() {
    const title = document.getElementById('sop-title-input').value;
    const category = document.getElementById('sop-category-input').value;
    const rawRules = document.getElementById('sop-rules-input').value;

    if (!title || !category) {
      alert('Please fill out the SOP title and category.');
      return;
    }

    const rules = rawRules.split('\n').map(r => r.trim()).filter(Boolean);
    const res = await http.post('/api/cms/sops', { title, category, rules });
    if (res.success) {
      state.sops.push(res.sop);
      closeModal('modal-new-sop');
      renderSops();
      alert('SOP Blueprint published successfully!');
    }
  }

  // Utilities
  function formatTimeAgo(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Public Interface
  return {
    init,
    navigateTo,
    filterCategory,
    filterStatus,
    handleSearch,
    applyFilters,
    sortProjects,
    openModal,
    closeModal,
    openPostProjectModal,
    submitPostProject,
    openTaskQA,
    submitTaskQA,
    inspectAuditTrail,
    switchUser,
    registerUser,
    submitOnboardingTest,
    updateRangeDisplay,
    calculateDiscoveryScore,
    saveDiscoveryRecord,
    submitNewSop
  };
})();

// Bootstrap on DOM load
document.addEventListener('DOMContentLoaded', App.init);
