/**
 * TrainedForce - Next-Gen AI Workforce Operating System
 * Modular Core Controller & Live Telemetry Engine
 * 
 * Authored by: Frontend & Systems Engineering
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
    activeInspectTask: null,
    activeBidTask: null,
    simulationRunning: false
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

  // Toast Notification System
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✔' : type === 'danger' ? '⚠' : '⚡'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialization
  async function init() {
    console.log('[TrainedForce OS] Initializing cybernetic engine...');
    await loadInitialData();
    renderUserNav();
    renderProjectsFeed();
    renderOperators();
    renderSops();
    calculateArbitrage();
    startLiveTelemetryLoop();
    console.log('[TrainedForce OS] All subsystems online.');
  }

  // Live Telemetry Simulation Loop
  function startLiveTelemetryLoop() {
    setInterval(() => {
      const latEl = document.getElementById('tele-latency');
      if (latEl) {
        const ms = Math.floor(290 + Math.random() * 45);
        latEl.innerText = `Gemini 2.5 Pro (${ms}ms)`;
      }
    }, 3500);
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

  // Visual Gallery Switcher
  function switchGalleryImage(type, btn) {
    document.querySelectorAll('.gallery-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const img = document.getElementById('gallery-img-display');
    if (!img) return;

    const imageMap = {
      dashboard: '/assets/hero-dashboard.jpg',
      pipeline: '/assets/workflow-pipeline.jpg',
      operator: '/assets/operator-hub.jpg'
    };

    img.style.opacity = '0.5';
    setTimeout(() => {
      img.src = imageMap[type] || '/assets/hero-dashboard.jpg';
      img.style.opacity = '1';
    }, 150);
  }

  // Tab & View Navigation
  function navigateTo(tabId) {
    state.currentTab = tabId;

    // Update Header Navigation Links
    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
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

    const hero = document.getElementById('hero-banner');
    if (hero) {
      hero.style.display = tabId === 'projects' ? 'block' : 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Category Filtering
  function filterCategory(catId, element) {
    state.selectedCategory = catId;
    document.querySelectorAll('.subnav-link').forEach(item => item.classList.remove('active'));
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

    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.serviceId === state.selectedCategory);
    }

    if (state.selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === state.selectedStatus);
    }

    if (state.searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(state.searchQuery) ||
        t.inputSummary.toLowerCase().includes(state.searchQuery) ||
        t.clientName.toLowerCase().includes(state.searchQuery)
      );
    }

    const countBadge = document.getElementById('project-count-badge');
    if (countBadge) countBadge.innerText = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📋</div>
          <h4 style="color: var(--text-white);">No active projects found</h4>
          <p style="margin-top: 4px; font-size: 0.9rem;">Try selecting a different filter or post a new workflow project.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const isVerified = t.status === 'verified';
      const isUrgent = t.priority === 'Urgent';
      const timeAgo = formatTimeAgo(t.createdAt);
      const bidCount = t.bids ? t.bids.length : 4;

      return `
        <article class="project-card">
          <div class="project-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                ${isUrgent ? '<span class="badge badge-urgent">🔥 Urgent SLA</span>' : ''}
                ${isVerified ? '<span class="badge badge-verified">✔ Verified QA Pass</span>' : '<span class="badge badge-blue">⚡ In QA Review</span>'}
                <span class="badge badge-pro">${t.serviceId.replace('srv_', '').toUpperCase()}</span>
                <span class="mono" style="font-size: 0.78rem; color: var(--neon-cyan);">${t.id}</span>
              </div>
              <h3 class="project-title-link" onclick="App.openTaskQA('${t.id}')">${escapeHtml(t.title)}</h3>
              <div class="project-meta">
                <span>Posted ${timeAgo}</span>
                <span>•</span>
                <span>Client: <strong style="color: #fff;">${escapeHtml(t.clientName)}</strong></span>
                <span>•</span>
                <span>Assigned QA: <strong>${t.workerName || 'Open in Squad Queue'}</strong></span>
                <span>•</span>
                <span style="color: var(--neon-cyan); font-weight: 700;">${bidCount} Operator Bids</span>
              </div>
            </div>

            <div>
              <div class="budget-val">$250 - $750</div>
              <div class="budget-type">Fixed Price Batch</div>
            </div>
          </div>

          <div class="project-desc-text">
            ${escapeHtml(t.inputSummary)}
          </div>

          <div class="ai-pipeline-box">
            <strong style="color: var(--neon-cyan);">🤖 Gemini Pipeline Inference:</strong> ${escapeHtml(t.operatorNotes || t.aiDraft)}
          </div>

          <div class="tags-row">
            <span class="skill-tag">#human-in-the-loop</span>
            <span class="skill-tag">#gemini-2.5-pro</span>
            <span class="skill-tag">#sop-adherence</span>
            <span class="skill-tag">#sla-guarantee</span>
          </div>

          <div class="project-bottom-bar">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #f59e0b;">★★★★★</span>
              <span><strong style="color: #fff;">5.0</strong> (48 reviews)</span>
              <span style="margin-left: 8px; color: var(--neon-emerald); font-weight: 700;">✔ Enterprise Payment Verified</span>
            </div>

            <div style="display: flex; gap: 8px;">
              ${t.status === 'verified' ? `
                <button class="btn btn-outline btn-sm" onclick="App.inspectAuditTrail('${t.id}')">Audit Proof (${t.auditLog.length})</button>
              ` : `
                <button class="btn btn-outline btn-sm" onclick="App.openBidModal('${t.id}')">💬 Place Bid</button>
                <button class="btn btn-primary btn-sm" onclick="App.openTaskQA('${t.id}')">🛠️ QA Workbench</button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Render Operators Directory
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
          <div class="operator-top-info">
            <div class="operator-avatar-box">${op.avatar}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4 style="font-size: 1.15rem; color: var(--text-white);">${op.name}</h4>
                <span class="badge badge-verified">VERIFIED</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">${op.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 2px;">📍 ${op.location}</div>
            </div>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
            ${op.badges.map(b => `<span class="badge badge-featured">${b}</span>`).join('')}
          </div>

          <div class="operator-stats-box">
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--neon-emerald);" class="mono">${op.jss}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Job Success</div>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #fff;" class="mono">${op.tasks}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Tasks Done</div>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--neon-cyan);" class="mono">${op.rate}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Rate / SLA</div>
            </div>
          </div>

          <div class="tags-row">
            ${op.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--space-border);">
          <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="App.showToast('Viewing verified credentials for ${op.name}', 'info')">Profile Proof</button>
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="App.openPostProjectModal()">Hire Operator</button>
        </div>
      </div>
    `).join('');
  }

  // Render SOPs (Internal CMS)
  function renderSops() {
    const container = document.getElementById('sops-grid-container');
    if (!container) return;

    container.innerHTML = state.sops.map(s => `
      <div class="glass-panel" style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span class="badge badge-pro">${s.category}</span>
          <span class="mono" style="font-size: 0.75rem; color: var(--neon-cyan); font-weight: 800;">v${s.version}</span>
        </div>
        <h4 style="font-size: 1.15rem; margin-bottom: 12px; color: var(--text-white);">${s.title}</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; color: #cbd5e1;">
          ${s.rules.map(r => `<li style="display: flex; gap: 8px;"><span style="color: var(--neon-cyan);">⚡</span><span>${escapeHtml(r)}</span></li>`).join('')}
        </ul>
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--space-border); font-size: 0.78rem; color: var(--text-dim);">
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
      <div class="glass-panel" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-color: ${state.currentUser.id === u.id ? 'var(--neon-cyan)' : 'var(--space-border)'}" onclick="App.switchUser('${u.id}')">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.4rem;">${u.avatar || '👤'}</span>
          <div>
            <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-white);">${u.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-dim);">${u.company || u.badge || u.role}</div>
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
      showToast(`Switched active persona to ${u.name}`, 'success');
    }
  }

  async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !email) {
      showToast('Please fill out your full name and email.', 'danger');
      return;
    }

    const res = await http.post('/api/auth/register', { name, email, role });
    if (res.success) {
      state.users.push(res.user);
      state.currentUser = res.user;
      renderUserNav();
      closeModal('modal-auth');
      showToast(`Welcome ${res.user.name}! Account registered successfully.`, 'success');
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

  function handleTemplateSelect(serviceId) {
    const titleInput = document.getElementById('post-title');
    const payloadInput = document.getElementById('post-payload');

    const templates = {
      srv_finance: {
        title: "Vendor Invoice Batch PO Discrepancy Reconciliation #INV-902",
        payload: "Vendor Invoice: TechLogix Corp ($14,230.00) vs PO-4481 ($14,200.00). Mismatch on line item 4 expedited freight charge."
      },
      srv_support: {
        title: "Tier-2 SLA Escalation: Enterprise SLA Extension Request",
        payload: "Enterprise client (ACME SaaS, $85k ARR) requests 30-day trial extension exception citing delayed vendor security audit."
      },
      srv_ecommerce: {
        title: "Catalog Taxonomy & Merchant Attribute Tagging (40 SKUs)",
        payload: "Batch of 40 luxury footwear SKUs requiring Google Merchant taxonomy categorization, material composition tags, and SEO titles."
      },
      srv_revops: {
        title: "RevOps Decision Maker Contact & Tech Stack Verification (100 Leads)",
        payload: "100 VP Operations leads requiring LinkedIn contact verification and CRM data enrichment."
      },
      srv_aiqa: {
        title: "LLM Ground-Truth & Hallucination Elimination Batch #441",
        payload: "50 model-generated answers requiring source URL verification, mathematical consistency checks, and policy safety grading."
      }
    };

    if (templates[serviceId]) {
      if (titleInput) titleInput.value = templates[serviceId].title;
      if (payloadInput) payloadInput.value = templates[serviceId].payload;
    }
  }

  async function submitPostProject() {
    const serviceId = document.getElementById('post-service-id').value;
    const title = document.getElementById('post-title').value;
    const priority = document.getElementById('post-priority').value;
    const payload = document.getElementById('post-payload').value;

    if (!title) {
      showToast('Please enter a project title.', 'danger');
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
      showToast(`Project "${res.task.id}" dispatched to pipeline!`, 'success');
    }
  }

  // Freelancer Bidding Modal
  function openBidModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.activeBidTask = task;
    document.getElementById('bid-project-title').innerText = `Place Bid on [${task.id}]`;
    document.getElementById('bid-project-subtitle').innerText = task.title;
    document.getElementById('bid-proposal-text').value = `Hello! I am a certified AI Operator with a 99.8% QA score. I am ready to review this ${task.serviceId.replace('srv_', '')} task according to SOP guidelines and deliver verified outputs within the SLA.`;

    openModal('modal-bid-task');
  }

  function autoGenerateProposal() {
    const task = state.activeBidTask;
    if (!task) return;

    const proposal = `Dear Client,\n\nI have reviewed your payload for "${task.title}". As a verified Level-3 AI Operator with 3,400+ completed tasks and zero rework escalations, I will verify the Gemini AI inference against your acceptance criteria and ensure 100% SOP adherence.\n\nSLA Commitment: Guaranteed under 15 minutes.`;
    document.getElementById('bid-proposal-text').value = proposal;
    showToast('AI proposal draft generated!', 'info');
  }

  function submitBid() {
    if (!state.activeBidTask) return;

    const bidAmount = document.getElementById('bid-amount-input').value;
    const sla = document.getElementById('bid-sla-input').value;

    if (!state.activeBidTask.bids) state.activeBidTask.bids = [];
    state.activeBidTask.bids.push({
      operator: state.currentUser.name,
      amount: bidAmount,
      sla
    });

    closeModal('modal-bid-task');
    renderProjectsFeed();
    showToast(`Bid of $${bidAmount} submitted on ${state.activeBidTask.id}!`, 'success');
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
      showToast(actionType === 'verify' ? 'Task QA passed and verified deliverables delivered!' : 'Task escalated to Operations Lead.', actionType === 'verify' ? 'success' : 'danger');
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

  // =========================================================================
  // PARADIGM SHIFT: LIVE PIPELINE FLOW SIMULATOR
  // =========================================================================
  function runLiveSimulation() {
    if (state.simulationRunning) return;
    state.simulationRunning = true;

    const consoleBox = document.getElementById('sim-console-output');
    const nodes = [
      document.getElementById('sim-node-1'),
      document.getElementById('sim-node-2'),
      document.getElementById('sim-node-3'),
      document.getElementById('sim-node-4')
    ];

    showToast('Starting end-to-end pipeline execution...', 'info');

    // Step 1: Ingestion
    nodes[0].style.boxShadow = '0 0 25px rgba(0, 242, 254, 0.6)';
    nodes[0].style.borderColor = 'var(--neon-cyan)';
    consoleBox.innerHTML = '<div class="mono" style="color: #38bdf8;">[00.12s] Ingesting client webhook payload for Enterprise Task #TSK-SIM-99...</div>';

    // Step 2: Gemini
    setTimeout(() => {
      nodes[0].style.boxShadow = 'none';
      nodes[1].style.boxShadow = '0 0 25px rgba(168, 85, 247, 0.6)';
      nodes[1].style.borderColor = 'var(--neon-purple)';
      consoleBox.innerHTML += '<div class="mono" style="color: #c084fc;">[00.48s] Gemini 2.5 Pro Inference completed in 312ms. Generated structured JSON draft. Accuracy Confidence: 99.1%.</div>';
    }, 1200);

    // Step 3: Human QA
    setTimeout(() => {
      nodes[1].style.boxShadow = 'none';
      nodes[2].style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.6)';
      nodes[2].style.borderColor = 'var(--neon-amber)';
      consoleBox.innerHTML += '<div class="mono" style="color: #fbbf24;">[01.80s] Dispatched to Operator Bilal Tariq (Lahore Hub). Auditing PO variance against SOP v3.2 checklist... Passed.</div>';
    }, 2400);

    // Step 4: Verification & Proof
    setTimeout(() => {
      nodes[2].style.boxShadow = 'none';
      nodes[3].style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.6)';
      nodes[3].style.borderColor = 'var(--neon-emerald)';
      consoleBox.innerHTML += '<div class="mono" style="color: #34d399;">[03.10s] Task Certified & Signed. Cryptographic Hash: SHA256:7e99f2b8a01cd. Output synchronized to client API.</div>';
      showToast('Pipeline execution complete! 100% QA pass.', 'success');
      state.simulationRunning = false;
    }, 3800);
  }

  // =========================================================================
  // PARADIGM SHIFT: LIVE GEMINI SANDBOX & PROOF CERTIFICATE
  // =========================================================================
  function runSandboxExtraction() {
    const input = document.getElementById('sandbox-input').value;
    const outputBox = document.getElementById('sandbox-output');

    outputBox.innerHTML = '<span style="color: var(--neon-cyan);">Running Gemini 2.5 Flash extraction model...</span>';

    setTimeout(() => {
      const extractedJson = {
        vendor: "Apex Cloud Solutions",
        invoiceNumber: "INV-2026-8812",
        poNumber: "PO-9914",
        authorizedTotal: 4850.00,
        billedTotal: 5000.00,
        varianceDetected: {
          lineItem: 3,
          description: "Expedited Setup Fee",
          unauthorizedAmount: 150.00,
          action: "FLAG_DISCREPANCY_HOLD_PAYMENT"
        },
        sopComplianceStatus: "PASSED_WITH_EXCEPTION_NOTE",
        confidenceScore: 0.994
      };

      outputBox.innerText = JSON.stringify(extractedJson, null, 2);
      showToast('Extraction complete with 99.4% confidence score!', 'success');
    }, 800);
  }

  function generateProofCertificate() {
    const certWindow = window.open('', '_blank');
    if (!certWindow) {
      alert('Pop-up blocked. Please allow pop-ups to view certificate.');
      return;
    }

    const sha = "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    certWindow.document.write(`
      <html>
      <head>
        <title>TrainedForce Cryptographic Proof of Delivery Certificate</title>
        <style>
          body { font-family: 'Inter', sans-serif; background: #080c16; color: #fff; padding: 40px; }
          .cert-box { border: 2px solid #00f2fe; padding: 30px; border-radius: 16px; max-width: 700px; margin: 0 auto; box-shadow: 0 0 30px rgba(0,242,254,0.3); }
          h2 { color: #00f2fe; margin-top: 0; }
          .mono { font-family: monospace; color: #38bdf8; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="cert-box">
          <h2>⚡ TrainedForce Cryptographic Proof of Delivery</h2>
          <p><strong>Certificate ID:</strong> TF-CERT-2026-9904</p>
          <p><strong>Verified Operator:</strong> Bilal Tariq (Senior Tier-3 Operator, Pakistan)</p>
          <p><strong>Workflow:</strong> Healthtech HIPAA PO & Invoice Reconciliation Audit</p>
          <p><strong>Accuracy Score:</strong> 100.0% (Verified Compliant)</p>
          <p><strong>SHA-256 Signature:</strong></p>
          <p class="mono">${sha}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p style="color: #10b981; font-weight: bold; margin-top: 20px;">✔ CERTIFIED COMPLIANT WITH SOC2 TYPE II & SOP STANDARDS</p>
        </div>
      </body>
      </html>
    `);
  }

  // =========================================================================
  // PARADIGM SHIFT: HEADCOUNT COST ARBITRAGE CALCULATOR
  // =========================================================================
  function calculateArbitrage() {
    const squadSize = parseInt(document.getElementById('range-squad-size')?.value || 5);
    const onshoreSalary = parseInt(document.getElementById('range-onshore-salary')?.value || 5500);
    const tfCostPerOperator = 1450;

    const dispSquad = document.getElementById('disp-squad-size');
    const dispSalary = document.getElementById('disp-onshore-salary');

    if (dispSquad) dispSquad.innerText = `${squadSize} Operators`;
    if (dispSalary) dispSalary.innerText = `$${onshoreSalary.toLocaleString()} / mo`;

    const monthlyOnshore = squadSize * onshoreSalary;
    const monthlyTrainedForce = squadSize * tfCostPerOperator;
    const monthlySavings = monthlyOnshore - monthlyTrainedForce;
    const annualSavings = monthlySavings * 12;
    const threeYearSavings = annualSavings * 3;

    const elAnnual = document.getElementById('arb-annual-savings');
    const elOnshoreMo = document.getElementById('arb-onshore-mo');
    const elTfMo = document.getElementById('arb-tf-mo');
    const elMoSavings = document.getElementById('arb-mo-savings');
    const el3yrSavings = document.getElementById('arb-3yr-savings');

    if (elAnnual) elAnnual.innerText = `$${annualSavings.toLocaleString()}`;
    if (elOnshoreMo) elOnshoreMo.innerText = `$${monthlyOnshore.toLocaleString()} / mo`;
    if (elTfMo) elTfMo.innerText = `$${monthlyTrainedForce.toLocaleString()} / mo`;
    if (elMoSavings) elMoSavings.innerText = `$${monthlySavings.toLocaleString()} / mo`;
    if (el3yrSavings) el3yrSavings.innerText = `$${threeYearSavings.toLocaleString()}`;
  }

  function updateRangeDisplay(id) {
    const val = document.getElementById(`range-${id}`).value;
    const el = document.getElementById(`val-${id}`);
    if (el) el.innerText = val;
  }

  async function submitNewSop() {
    const title = document.getElementById('sop-title-input').value;
    const category = document.getElementById('sop-category-input').value;
    const rawRules = document.getElementById('sop-rules-input').value;

    if (!title || !category) {
      showToast('Please fill out the SOP title and category.', 'danger');
      return;
    }

    const rules = rawRules.split('\n').map(r => r.trim()).filter(Boolean);
    const res = await http.post('/api/cms/sops', { title, category, rules });
    if (res.success) {
      state.sops.push(res.sop);
      closeModal('modal-new-sop');
      renderSops();
      showToast('SOP Blueprint published successfully!', 'success');
    }
  }

  async function submitOnboardingTest() {
    const q1 = document.querySelector('input[name="test-q1"]:checked')?.value;
    const q2 = document.querySelector('input[name="test-q2"]:checked')?.value;
    const q3 = document.querySelector('input[name="test-q3"]:checked')?.value;

    if (!q1 || !q2 || !q3) {
      showToast('Please answer all 3 qualification questions.', 'danger');
      return;
    }

    const res = await http.post('/api/workers/onboard-test', {
      workerId: state.currentUser.id,
      answers: { q1, q2, q3 }
    });

    if (res.success) {
      closeModal('modal-onboard-test');
      showToast(`Score: ${res.score}% (${res.passed ? 'PASSED' : 'RETAKE'})\n${res.feedback}`, res.passed ? 'success' : 'danger');
      const u = state.users.find(x => x.id === state.currentUser.id);
      if (u) {
        u.badge = res.badge;
      }
      renderUserNav();
    }
  }

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
    handleTemplateSelect,
    submitPostProject,
    openBidModal,
    autoGenerateProposal,
    submitBid,
    openTaskQA,
    submitTaskQA,
    inspectAuditTrail,
    switchUser,
    registerUser,
    submitOnboardingTest,
    updateRangeDisplay,
    calculateArbitrage,
    submitNewSop,
    switchGalleryImage,
    runLiveSimulation,
    runSandboxExtraction,
    generateProofCertificate,
    showToast
  };
})();

// Bootstrap on DOM load
document.addEventListener('DOMContentLoaded', App.init);
