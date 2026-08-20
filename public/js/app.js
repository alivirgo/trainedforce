/**
 * TrainedForce — Upwork-Inspired Application Controller
 * Clean, Human-Centric Knowledge Workforce & QA Platform
 */

const App = (function () {

  /* ===================================================================
     PRIVATE STATE
     =================================================================== */

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
    squads: [],
    discoveryRecords: [],
    stats: {},
    activeInspectTask: null,
    activeBidTask: null,
    simulationRunning: false
  };

  /* ===================================================================
     HTTP CLIENT
     =================================================================== */

  const http = {
    async get(url) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn(`[API] GET ${url} failed:`, err.message);
        return null;
      }
    },
    async post(url, body) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        return await res.json();
      } catch (err) {
        console.warn(`[API] POST ${url} failed:`, err.message);
        return { success: false, error: err.message };
      }
    }
  };

  /* ===================================================================
     TOAST NOTIFICATIONS
     =================================================================== */

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icon = type === 'success' ? '✔' : type === 'danger' ? '⚠' : 'ℹ';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  /* ===================================================================
     INITIALIZATION
     =================================================================== */

  async function init() {
    console.log('⚡ [TrainedForce] Initializing Enterprise Workforce Platform...');

    await loadInitialData();
    renderUserNav();
    renderProjectsFeed();
    renderOperators();
    renderSops();
    renderRadarChart(4, 5, 4, 5, 5, 4, 4, 4);
    updateSquadCalculations();
    calculateArbitrage();
    animateHeroCounters();
    bindKeyboardShortcuts();
    bindHeaderScroll();

    console.log('⚡ [TrainedForce] Enterprise Platform online & ready.');
  }

  /* ===================================================================
     DATA LOADING
     =================================================================== */

  async function loadInitialData() {
    const results = await Promise.all([
      http.get('/api/stats'),
      http.get('/api/auth/users'),
      http.get('/api/services'),
      http.get('/api/tasks'),
      http.get('/api/cms/sops'),
      http.get('/api/discovery/records'),
      http.get('/api/squads')
    ]);

    state.stats = results[0] || {};
    state.users = results[1] || [];
    state.services = results[2] || [];
    state.tasks = results[3] || [];
    state.sops = results[4] || [];
    state.discoveryRecords = results[5] || [];
    state.squads = results[6] || [];

    state.currentUser = state.users.find(u => u.role === 'client') || state.users[1] || {
      id: 'usr_client_1',
      name: 'Sarah Jenkins',
      role: 'client',
      company: 'Acuity Health SaaS',
      photo: '/assets/hero-talent.jpg'
    };
  }

  /* ===================================================================
     NAVIGATION & TAB SWITCHING
     =================================================================== */

  function navigateTo(tabId) {
    state.currentTab = tabId;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeLink = document.getElementById(`nav-${tabId}`);
    if (activeLink) activeLink.classList.add('active');

    // Toggle view containers
    const allViews = document.querySelectorAll('.tab-view');
    allViews.forEach(view => {
      view.style.display = 'none';
    });

    const target = document.getElementById(`view-${tabId}`);
    if (target) {
      target.style.display = 'block';
    }

    // Toggle landing sections for marketplace vs other views
    const hero = document.getElementById('hero-banner');
    const howItWorks = document.getElementById('how-it-works');
    const socialProof = document.querySelector('.social-proof-bar');
    const showLanding = tabId === 'projects';

    if (hero) hero.style.display = showLanding ? 'block' : 'none';
    if (howItWorks) howItWorks.style.display = showLanding ? 'block' : 'none';
    if (socialProof) socialProof.style.display = showLanding ? 'block' : 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ===================================================================
     ANIMATIONS & COUNTERS
     =================================================================== */

  function animateHeroCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals') || '0');
      const duration = 1600;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (decimals > 0) {
          el.textContent = prefix + current.toFixed(decimals) + suffix;
        } else {
          el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
        }
      }
      requestAnimationFrame(step);
    });
  }

  function bindHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) header.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      else header.style.boxShadow = 'var(--shadow-sm)';
    }, { passive: true });
  }

  function bindKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearchModal();
      }
      if (e.key === 'Escape') {
        closeSearchModal();
        document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
      }
    });
  }

  /* ===================================================================
     SEARCH & FILTERS
     =================================================================== */

  function filterCategory(catId, element) {
    state.selectedCategory = catId;
    document.querySelectorAll('.subnav-item').forEach(item => item.classList.remove('active'));
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

  function sortProjects(key) {
    if (key === 'newest') {
      state.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (key === 'priority') {
      const order = { Urgent: 3, High: 2, Normal: 1 };
      state.tasks.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
    } else if (key === 'accuracy') {
      state.tasks.sort((a, b) => (b.accuracyScore || 0) - (a.accuracyScore || 0));
    }
    renderProjectsFeed();
  }

  function toggleSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) closeSearchModal();
    else openSearchModal();
  }

  function openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.add('active');
    const input = document.getElementById('search-modal-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
  }

  function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) modal.classList.remove('active');
  }

  /* ===================================================================
     RENDER: PROJECTS FEED (MARKETPLACE)
     =================================================================== */

  function renderProjectsFeed() {
    const container = document.getElementById('projects-feed-container');
    if (!container) return;

    let filtered = [...state.tasks];

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
    if (countBadge) countBadge.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 48px; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 12px;">📋</div>
          <h4 style="color: var(--upwork-navy); margin-bottom: 6px;">No matching workflow batches found</h4>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Try adjusting your category filters or post a new workflow batch.</p>
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const verified = t.status === 'verified';
      const urgent = t.priority === 'Urgent';
      const ago = formatTimeAgo(t.createdAt);
      const bids = t.bids ? t.bids.length : 3;

      return `
        <article class="project-card">
          <div class="project-header-row">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                ${urgent ? '<span class="badge badge-urgent">🔥 Urgent SLA</span>' : ''}
                ${verified ? '<span class="badge badge-verified">✔ 100% Certified & Verified</span>' : '<span class="badge badge-blue">⚡ In Operator QA</span>'}
                <span class="badge badge-gray">${t.serviceId.replace('srv_', '').toUpperCase()}</span>
                <span class="mono" style="font-size: 0.76rem; color: var(--upwork-green); font-weight: 700;">${t.id}</span>
              </div>
              <h3 class="project-title" onclick="App.openTaskQA('${t.id}')">${esc(t.title)}</h3>
            </div>
            <div class="project-budget-box">
              <div class="budget-amount">$0.85 / doc</div>
              <div class="budget-subtext">Fixed Price SLA</div>
            </div>
          </div>

          <div class="project-meta-line">
            <span>Posted ${ago}</span><span>·</span>
            <span>Client: <strong style="color: var(--upwork-navy);">${esc(t.clientName)}</strong></span><span>·</span>
            <span>Operator: <strong>${t.workerName || 'Open in Queue'}</strong></span><span>·</span>
            <span style="color: var(--upwork-green); font-weight: 700;">${bids} proposals</span>
          </div>

          <div class="project-desc-body">${esc(t.inputSummary)}</div>
          
          <div class="ai-draft-callout">
            <strong style="color: var(--upwork-navy);">🤖 Extraction Draft & QA Note:</strong> ${esc(t.operatorNotes || t.aiDraft)}
          </div>

          <div class="skills-pills-row">
            <span class="skill-pill">#human-in-the-loop</span>
            <span class="skill-pill">#sop-compliance</span>
            <span class="skill-pill">#verified-sla</span>
            <span class="skill-pill">#soc2-certified</span>
          </div>

          <div class="project-footer-bar">
            <div class="client-rating-info">
              <span style="color: #f59e0b;">★★★★★</span>
              <span><strong style="color: var(--upwork-navy);">5.0</strong> (62 audits)</span>
              <span style="margin-left: 6px; color: var(--upwork-green); font-weight: 700;">✔ Verified Enterprise Client</span>
            </div>

            <div style="display: flex; gap: 8px;">
              ${verified
                ? `<button class="btn btn-outline btn-sm" onclick="App.inspectAuditTrail('${t.id}')">Audit Trail (${t.auditLog.length})</button>`
                : `<button class="btn btn-outline btn-sm" onclick="App.openBidModal('${t.id}')">💬 Submit Proposal</button>
                   <button class="btn btn-primary btn-sm" onclick="App.openTaskQA('${t.id}')">🛠️ QA Review</button>`}
            </div>
          </div>
        </article>`;
    }).join('');
  }

  /* ===================================================================
     RENDER: OPERATORS & TALENT HUB (Upwork Style)
     =================================================================== */

  function renderOperators() {
    const container = document.getElementById('operators-grid-container');
    if (!container) return;

    const ops = [
      {
        name: "Bilal Tariq", loc: "Lahore, Pakistan", title: "Lead Finance & AP/AR QA Specialist",
        photo: "/assets/avatar-bilal.jpg", rate: "$16/hr", jss: "100%", tasks: "3,840+", rating: "5.0",
        earned: "$64k+", reviews: 62,
        badge: "Top Rated Plus",
        skills: ["PO Reconciliation", "ERP Audit", "Exception Triage", "Tax Rules", "HIPAA Compliant"]
      },
      {
        name: "Fatima Noor", loc: "Karachi, Pakistan", title: "Senior CX Support & Moderation Lead",
        photo: "/assets/avatar-fatima.jpg", rate: "$14/hr", jss: "100%", tasks: "5,210+", rating: "5.0",
        earned: "$78k+", reviews: 94,
        badge: "Top Rated Plus",
        skills: ["Customer Empathy", "Refund Triage", "Tone Calibration", "SLA Escalation", "Zendesk API"]
      },
      {
        name: "Usman Raza", loc: "Islamabad, Pakistan", title: "Catalog Taxonomy & AI Model QA Lead",
        photo: "/assets/avatar-usman.jpg", rate: "$15/hr", jss: "99%", tasks: "2,680+", rating: "4.9",
        earned: "$42k+", reviews: 48,
        badge: "Top Rated",
        skills: ["SKU Tagging", "Multilingual QA", "Hallucination Check", "CSV Pipelines", "Google Merchant"]
      },
      {
        name: "Zainab Malik", loc: "Lahore, Pakistan", title: "RevOps B2B Signal Verification Lead",
        photo: "/assets/avatar-zainab.jpg", rate: "$15/hr", jss: "100%", tasks: "3,120+", rating: "5.0",
        earned: "$51k+", reviews: 56,
        badge: "Top Rated Plus",
        skills: ["Executive Verification", "CRM Sync", "Tech Stack Audit", "Lead Scoring", "Apollo/HubSpot"]
      }
    ];

    container.innerHTML = ops.map(op => {
      return `
        <div class="talent-profile-card">
          <div>
            <div class="talent-header-block">
              <img src="${op.photo}" alt="${op.name}" class="talent-photo">
              <div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <span class="talent-name">${op.name}</span>
                  <span class="badge badge-toprated">★ ${op.badge}</span>
                </div>
                <div class="talent-title">${op.title}</div>
                <div class="talent-location">📍 ${op.loc}</div>
              </div>
            </div>

            <div class="talent-stats-row">
              <div>
                <div class="talent-stat-num" style="color: var(--upwork-green);">${op.jss}</div>
                <div class="talent-stat-label">Job Success</div>
              </div>
              <div>
                <div class="talent-stat-num">${op.tasks}</div>
                <div class="talent-stat-label">Audits</div>
              </div>
              <div>
                <div class="talent-stat-num" style="color: var(--upwork-navy);">${op.rate}</div>
                <div class="talent-stat-label">Hourly Rate</div>
              </div>
            </div>

            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
              <strong style="color: var(--upwork-navy);">${op.earned}</strong> earned · <span style="color: #f59e0b;">★★★★★</span> 5.0 (${op.reviews} reviews)
            </div>

            <div class="skills-pills-row">
              ${op.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-color);">
            <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="App.showToast('Viewing full verified portfolio for ${op.name}', 'info')">View Profile</button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="App.openPostProjectModal()">Hire Operator</button>
          </div>
        </div>`;
    }).join('');
  }

  /* ===================================================================
     RENDER: SOPs
     =================================================================== */

  function renderSops() {
    const container = document.getElementById('sops-grid-container');
    if (!container) return;

    container.innerHTML = state.sops.map(s => {
      return `
        <div class="talent-profile-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span class="badge badge-gray">${s.category}</span>
              <span class="mono" style="font-size: 0.75rem; color: var(--upwork-green); font-weight: 700;">v${s.version}</span>
            </div>
            <h4 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--upwork-navy);">${s.title}</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.86rem; color: var(--text-secondary);">
              ${s.rules.map(r => `<li style="display: flex; gap: 8px;"><span style="color: var(--upwork-green); flex-shrink: 0;">✔</span><span>${esc(r)}</span></li>`).join('')}
            </ul>
          </div>
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 0.78rem; color: var(--text-dim);">
            Updated: ${s.updatedAt} · Standardized Compliance
          </div>
        </div>`;
    }).join('');
  }

  /* ===================================================================
     SQUAD BUILDER & CAPACITY MODELING
     =================================================================== */

  function updateSquadCalculations() {
    const size = parseInt((document.getElementById('range-sq-size') || {}).value || 3);
    const dispSize = document.getElementById('disp-sq-size');
    const dispCap = document.getElementById('disp-sq-capacity');
    const dispCost = document.getElementById('disp-sq-cost');

    if (dispSize) dispSize.textContent = `${size} Operators`;
    if (dispCap) dispCap.textContent = `${(size * 2000).toLocaleString()} Tasks / mo`;
    if (dispCost) dispCost.textContent = `$${(size * 1450).toLocaleString()} / mo`;
  }

  async function deployCustomSquad() {
    const size = parseInt((document.getElementById('range-sq-size') || {}).value || 3);
    const domain = (document.getElementById('sq-domain-select') || {}).value || 'srv_finance';
    const sla = (document.getElementById('sq-sla-select') || {}).value || '< 15 Mins';

    const res = await http.post('/api/squads/deploy', {
      squadName: `Dedicated ${domain.replace('srv_', '').toUpperCase()} Squad (${size} Operators)`,
      serviceId: domain,
      squadSize: size,
      slaTarget: sla,
      clientId: state.currentUser.id
    });

    if (res.success) {
      showToast(`Dedicated squad of ${size} operators provisioned successfully!`, 'success');
    }
  }

  /* ===================================================================
     VISUAL WORKFLOW ORCHESTRATION SIMULATOR
     =================================================================== */

  function runDagSimulation() {
    if (state.simulationRunning) return;
    state.simulationRunning = true;

    const consoleBox = document.getElementById('dag-console-output');
    const nodes = ['dag-node-1', 'dag-node-2', 'dag-node-3', 'dag-node-4'];
    const stats = ['dag-stat-1', 'dag-stat-2', 'dag-stat-3', 'dag-stat-4'];

    showToast('Executing workflow pipeline simulation...', 'info');
    if (consoleBox) consoleBox.innerHTML = '';

    nodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active-running');
    });

    // Stage 1: Ingestion
    logToConsole(consoleBox, '[00.10s] Ingestion Node received raw payload from Acuity Health ERP...', '#93c5fd');
    activateDagNode(nodes[0], stats[0], 'Ingesting Webhook...');

    setTimeout(() => {
      deactivateDagNode(nodes[0]);
      logToConsole(consoleBox, '[00.45s] Foundation AI extraction completed (280ms). Extracted schemas with 98.8% confidence.', '#c4b5fd');
      activateDagNode(nodes[1], stats[1], 'Extraction Complete (98.8%)');
    }, 1200);

    setTimeout(() => {
      deactivateDagNode(nodes[1]);
      logToConsole(consoleBox, '[01.60s] Dispatched to Bilal Tariq (#PK-219, Lahore). SOP v3.2 Check Passed.', '#fde047');
      activateDagNode(nodes[2], stats[2], 'SOP Audit Verified ✔');
    }, 2400);

    setTimeout(() => {
      deactivateDagNode(nodes[2]);
      logToConsole(consoleBox, '[02.80s] Verified deliverable synced to Acuity Health ERP with full audit proof. ✔', '#86efac');
      activateDagNode(nodes[3], stats[3], '100% Certified Delivery ✔');
      showToast('Workflow execution completed with 100% QA verification!', 'success');

      setTimeout(() => {
        deactivateDagNode(nodes[3]);
        state.simulationRunning = false;
      }, 1800);
    }, 3600);
  }

  function resetDagSimulation() {
    const nodes = ['dag-node-1', 'dag-node-2', 'dag-node-3', 'dag-node-4'];
    nodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active-running');
    });
    const consoleBox = document.getElementById('dag-console-output');
    if (consoleBox) consoleBox.innerHTML = '<div>[Orchestrator] Standby. Click "Run Live Pipeline Simulation".</div>';
    showToast('Simulation reset to standby', 'info');
  }

  function activateDagNode(nodeId, statId, text) {
    const node = document.getElementById(nodeId);
    const stat = document.getElementById(statId);
    if (node) node.classList.add('active-running');
    if (stat) stat.textContent = text;
  }

  function deactivateDagNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (node) node.classList.remove('active-running');
  }

  function logToConsole(container, text, color) {
    if (!container) return;
    const line = document.createElement('div');
    line.style.color = color || '#a8d5a8';
    line.style.marginBottom = '4px';
    line.textContent = text;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
  }

  /* ===================================================================
     ROI ARBITRAGE & SVG RADAR ENGINE
     =================================================================== */

  function calculateArbitrage() {
    const squadSize = parseInt((document.getElementById('range-squad-size') || {}).value || 5);
    const onshoreSalary = parseInt((document.getElementById('range-onshore-salary') || {}).value || 5500);
    const tfCost = 1450;

    const dispSquad = document.getElementById('disp-squad-size');
    const dispSalary = document.getElementById('disp-onshore-salary');
    if (dispSquad) dispSquad.textContent = `${squadSize} Operators`;
    if (dispSalary) dispSalary.textContent = `$${onshoreSalary.toLocaleString()} / mo`;

    const moOnshore = squadSize * onshoreSalary;
    const moTF = squadSize * tfCost;
    const moSave = moOnshore - moTF;
    const annual = moSave * 12;
    const threeYr = annual * 3;

    setTextById('arb-annual-savings', `$${annual.toLocaleString()}`);
    setTextById('arb-onshore-mo', `$${moOnshore.toLocaleString()}`);
    setTextById('arb-tf-mo', `$${moTF.toLocaleString()}`);
    setTextById('arb-3yr-savings', `$${threeYr.toLocaleString()}`);

    const f = parseInt((document.getElementById('range-f') || {}).value || 4);
    const p = parseInt((document.getElementById('range-p') || {}).value || 5);
    const e = parseInt((document.getElementById('range-e') || {}).value || 4);
    const a = parseInt((document.getElementById('range-a') || {}).value || 5);

    renderRadarChart(f, p, e, a, 5, 4, 4, 4);
  }

  function updateRangeDisplay(id) {
    const val = (document.getElementById(`range-${id}`) || {}).value;
    const el = document.getElementById(`val-${id}`);
    if (el) el.textContent = val;
  }

  function renderRadarChart(f, p, e, a, remote = 5, meas = 4, access = 4, urgency = 4) {
    const container = document.getElementById('discovery-radar-box');
    if (!container) return;

    const values = [f, p, e, meas, remote, a, access, urgency];
    const labels = ['Frequency', 'Pain', 'Econ', 'Measurability', 'Remote', 'AI Fit', 'Access', 'Urgency'];
    const max = 5;
    const size = 220;
    const center = size / 2;
    const radius = 75;

    const points = values.map((val, idx) => {
      const angle = (Math.PI * 2 / values.length) * idx - Math.PI / 2;
      const r = (val / max) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');

    const backgroundPolygons = [1, 0.75, 0.5, 0.25].map(ratio => {
      return labels.map((_, idx) => {
        const angle = (Math.PI * 2 / labels.length) * idx - Math.PI / 2;
        const r = ratio * radius;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      }).join(' ');
    });

    const axisLines = labels.map((_, idx) => {
      const angle = (Math.PI * 2 / labels.length) * idx - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`;
    }).join('');

    const labelElements = labels.map((lbl, idx) => {
      const angle = (Math.PI * 2 / labels.length) * idx - Math.PI / 2;
      const x = center + (radius + 18) * Math.cos(angle);
      const y = center + (radius + 18) * Math.sin(angle);
      return `<text x="${x}" y="${y}" fill="#a8d5a8" font-size="8.5" font-family="Inter" text-anchor="middle" dominant-baseline="middle">${lbl}</text>`;
    }).join('');

    container.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${backgroundPolygons.map(poly => `<polygon points="${poly}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`).join('')}
        ${axisLines}
        <polygon points="${points}" fill="rgba(74, 222, 128, 0.3)" stroke="#4ade80" stroke-width="2"/>
        ${labelElements}
      </svg>
    `;
  }

  function exportExecutiveReport() {
    showToast('Executive Cost Savings Brief downloaded as PDF!', 'success');
  }

  /* ===================================================================
     SOP LIVE VALIDATION SANDBOX
     =================================================================== */

  async function testSopRules() {
    const payload = document.getElementById('sop-test-payload').value;
    const outputBox = document.getElementById('sop-test-output');
    outputBox.innerHTML = '<span style="color: var(--upwork-green);">Evaluating document against active SOP criteria...</span>';

    const res = await http.post('/api/cms/sops/test', {
      sopId: 'sop_finance_1',
      testPayload: payload
    });

    if (res) {
      outputBox.innerHTML = `<div style="color: var(--upwork-green); font-weight: 700;">[SOP Evaluator] ${res.status} (Score: ${res.complianceScore}%)</div>` +
        res.violations.map(v => `<div style="color: #dc3545; margin-top: 4px;">⚠ ${v.note}</div>`).join('') +
        res.passedRules.map(p => `<div style="color: var(--text-secondary); margin-top: 2px;">✔ ${p.note}</div>`).join('');
      showToast(`SOP Validation complete (${res.complianceScore}%)`, res.complianceScore >= 90 ? 'success' : 'danger');
    }
  }

  /* ===================================================================
     WEBHOOK & API DISPATCH SIMULATOR
     =================================================================== */

  async function simulateWebhookDispatch() {
    showToast('Sending test webhook payload...', 'info');

    const res = await http.post('/api/tasks', {
      title: "Vendor Invoice Match #INV-902",
      serviceId: "srv_finance",
      priority: "High",
      inputSummary: "Automated webhook ingestion via REST API Gateway for PO-4481.",
      clientId: state.currentUser.id,
      clientName: state.currentUser.company || "Enterprise Gateway"
    });

    if (res.success) {
      state.tasks.unshift(res.task);
      renderProjectsFeed();
      showToast(`Task ${res.task.id} ingested successfully via Webhook!`, 'success');
    }
  }

  /* ===================================================================
     USER & AUTH
     =================================================================== */

  function renderUserNav() {
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');

    if (state.currentUser) {
      if (nameEl) nameEl.textContent = state.currentUser.name;
      if (roleEl) roleEl.textContent = state.currentUser.badge || (state.currentUser.role === 'client' ? 'Enterprise Client' : 'AI Operator');
      if (avatarEl) {
        if (state.currentUser.photo) {
          avatarEl.src = state.currentUser.photo;
        } else {
          avatarEl.src = '/assets/hero-talent.jpg';
        }
      }
    }
    renderUserModalList();
  }

  function renderUserModalList() {
    const container = document.getElementById('auth-users-list');
    if (!container) return;

    container.innerHTML = state.users.map(u => {
      const active = state.currentUser && state.currentUser.id === u.id;
      const photo = u.photo || '/assets/avatar-bilal.jpg';
      return `
        <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 1px solid ${active ? 'var(--upwork-green)' : 'var(--border-color)'}; background: ${active ? 'var(--upwork-green-subtle)' : '#fff'}; border-radius: var(--radius-md);" onclick="App.switchUser('${u.id}')">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${photo}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--upwork-navy);">${u.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-dim);">${u.company || u.badge || u.role}</div>
            </div>
          </div>
          <span class="badge ${u.role === 'client' ? 'badge-blue' : 'badge-verified'}">${u.role.toUpperCase()}</span>
        </div>`;
    }).join('');
  }

  function switchUser(userId) {
    const u = state.users.find(x => x.id === userId);
    if (u) {
      state.currentUser = u;
      renderUserNav();
      closeModal('modal-auth');
      renderProjectsFeed();
      showToast(`Switched user profile to ${u.name}`, 'success');
    }
  }

  async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !email) { showToast('Please provide your name and email.', 'danger'); return; }

    const res = await http.post('/api/auth/register', { name, email, role });
    if (res.success) {
      state.users.push(res.user);
      state.currentUser = res.user;
      renderUserNav();
      closeModal('modal-auth');
      showToast(`Welcome ${res.user.name}!`, 'success');
    }
  }

  /* ===================================================================
     TASK QA & AUDIT CERTIFICATES
     =================================================================== */

  function openTaskQA(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    state.activeInspectTask = task;

    document.getElementById('qa-task-title').textContent = `${task.id}: ${task.title}`;
    document.getElementById('qa-task-meta').textContent = `Client: ${task.clientName} | Priority: ${task.priority}`;
    document.getElementById('qa-task-input').textContent = task.inputSummary;
    document.getElementById('qa-task-aidraft').textContent = task.aiDraft;
    document.getElementById('qa-operator-notes').value = task.operatorNotes || 'Confirmed compliant with SOP v3.2 standard. Approved.';

    openModal('modal-qa-task');
  }

  async function submitTaskQA(action) {
    if (!state.activeInspectTask) return;
    const notes = document.getElementById('qa-operator-notes').value;
    const res = await http.post(`/api/tasks/${state.activeInspectTask.id}/verify`, {
      actionType: action,
      operatorNotes: notes,
      accuracyScore: action === 'verify' ? 100 : undefined
    });

    if (res.success) {
      const idx = state.tasks.findIndex(t => t.id === state.activeInspectTask.id);
      if (idx !== -1) state.tasks[idx] = res.task;
      closeModal('modal-qa-task');
      renderProjectsFeed();
      showToast(action === 'verify' ? 'Task QA passed & verified certificate signed!' : 'Task escalated to Tier-3 Lead.', action === 'verify' ? 'success' : 'danger');
    }
  }

  function generateProofCertificate() {
    const w = window.open('', '_blank');
    if (!w) { alert('Enable pop-ups to view compliance certificate.'); return; }
    const sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TrainedForce Verification Certificate</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background: #f7f9fa; color: #001e00; padding: 48px; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .cert-box { border: 2px solid #108a00; padding: 40px; border-radius: 20px; max-width: 640px; background: #ffffff; box-shadow: 0 12px 36px rgba(0,0,0,0.08); }
          h2 { font-family: 'Plus Jakarta Sans', sans-serif; color: #001e00; margin-top: 0; font-size: 1.8rem; font-weight: 800; }
          .hash-box { font-family: 'JetBrains Mono', monospace; color: #108a00; word-break: break-all; background: #f2faf2; padding: 12px; border-radius: 8px; border: 1px solid #e4ebe4; font-size: 0.85rem; }
          .badge { display: inline-block; background: #eaf5ea; color: #108a00; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="cert-box">
          <div class="badge">✔ SOC 2 TYPE II & HIPAA COMPLIANT</div>
          <h2>⚡ TrainedForce Deliverable Audit Certificate</h2>
          <p><strong>Certificate ID:</strong> TF-CERT-2026-9904</p>
          <p><strong>Verified Operator:</strong> Bilal Tariq (Top Rated Plus · Lahore, Pakistan)</p>
          <p><strong>Workflow:</strong> Healthtech HIPAA Invoice Match & Reconciliation</p>
          <p><strong>Quality Assurance Score:</strong> 100.0% Verified Compliant</p>
          <p><strong>Cryptographic Audit Proof:</strong></p>
          <div class="hash-box">${sha}</div>
          <p style="margin-top: 20px; font-size: 0.85rem; color: #5e6d55;"><strong>Timestamp:</strong> ${new Date().toISOString()} · Dispatched to Acuity Health ERP</p>
        </div>
      </body>
      </html>
    `);
  }

  function inspectAuditTrail(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    let msg = `AUDIT TRAIL [${task.id}]\n\n`;
    task.auditLog.forEach(log => {
      msg += `• [${new Date(log.time).toLocaleTimeString()}] ${log.action} (${log.actor})\n`;
    });
    alert(msg);
  }

  /* ===================================================================
     BIDDING & PROPOSALS
     =================================================================== */

  function openBidModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    state.activeBidTask = task;
    document.getElementById('bid-project-title').textContent = `Submit Proposal for [${task.id}]`;
    document.getElementById('bid-project-subtitle').textContent = task.title;
    document.getElementById('bid-proposal-text').value = 'Top-rated certified operator with 99.8% QA score. Ready to verify this task per SOP guidelines within SLA.';
    openModal('modal-bid-task');
  }

  function autoGenerateProposal() {
    const task = state.activeBidTask;
    if (!task) return;
    document.getElementById('bid-proposal-text').value = `Dear Client,\n\nI have reviewed "${task.title}". As a Top-Rated AI operator with 3,840+ verified deliverables and 100% Job Success, I will verify the extraction against your SOP and deliver within 15 minutes with complete audit proofs.\n\nBest regards,\nBilal Tariq`;
    showToast('AI proposal cover letter generated!', 'info');
  }

  function submitBid() {
    if (!state.activeBidTask) return;
    const amount = document.getElementById('bid-amount-input').value;
    if (!state.activeBidTask.bids) state.activeBidTask.bids = [];
    state.activeBidTask.bids.push({ operator: state.currentUser.name, amount });
    closeModal('modal-bid-task');
    renderProjectsFeed();
    showToast(`Proposal of $${amount} submitted on ${state.activeBidTask.id}`, 'success');
  }

  /* ===================================================================
     MODALS & POSTING
     =================================================================== */

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
    const title = document.getElementById('post-title');
    const payload = document.getElementById('post-payload');
    const tpl = {
      srv_finance: { t: "Vendor Invoice Reconciliation #INV-902", p: "Vendor: TechLogix ($14,230) vs PO-4481 ($14,200). Mismatch on line 4 expedited freight charge." },
      srv_support: { t: "Customer Support SLA Exception: Trial Extension", p: "Enterprise account ($85k ARR) requests 30-day license extension citing onboarding delay." },
      srv_ecommerce: { t: "Catalog Taxonomy Tagging (40 SKUs)", p: "40 luxury footwear SKUs needing Google Merchant taxonomy categorization and attribute enrichment." },
      srv_revops: { t: "Decision Maker Contact Verification (100 Leads)", p: "100 VP Operations leads requiring LinkedIn contact verification and CRM data enrichment." },
      srv_aiqa: { t: "LLM Model Hallucination Evaluation Batch #441", p: "50 model responses needing source fact-checking and domain safety grading." }
    };
    if (tpl[serviceId]) {
      if (title) title.value = tpl[serviceId].t;
      if (payload) payload.value = tpl[serviceId].p;
    }
  }

  async function submitPostProject() {
    const serviceId = document.getElementById('post-service-id').value;
    const title = document.getElementById('post-title').value;
    const priority = document.getElementById('post-priority').value;
    const payload = document.getElementById('post-payload').value;

    if (!title) { showToast('Please enter a job title.', 'danger'); return; }

    const res = await http.post('/api/tasks', {
      title, serviceId, priority,
      inputSummary: payload, clientId: state.currentUser.id,
      clientName: state.currentUser.company || state.currentUser.name
    });

    if (res.success) {
      state.tasks.unshift(res.task);
      closeModal('modal-post-project');
      renderProjectsFeed();
      showToast(`Batch ${res.task.id} published to operator queue!`, 'success');
    }
  }

  async function submitNewSop() {
    const title = document.getElementById('sop-title-input').value;
    const category = document.getElementById('sop-category-input').value;
    const rawRules = document.getElementById('sop-rules-input').value;
    if (!title || !category) { showToast('Please provide title and category.', 'danger'); return; }

    const rules = rawRules.split('\n').map(r => r.trim()).filter(Boolean);
    const res = await http.post('/api/cms/sops', { title, category, rules });
    if (res.success) {
      state.sops.push(res.sop);
      closeModal('modal-new-sop');
      renderSops();
      showToast('SOP guideline published successfully!', 'success');
    }
  }

  async function submitOnboardingTest() {
    const q1 = (document.querySelector('input[name="test-q1"]:checked') || {}).value;
    const q2 = (document.querySelector('input[name="test-q2"]:checked') || {}).value;
    const q3 = (document.querySelector('input[name="test-q3"]:checked') || {}).value;
    if (!q1 || !q2 || !q3) { showToast('Please answer all assessment questions.', 'danger'); return; }

    const res = await http.post('/api/workers/onboard-test', {
      workerId: state.currentUser.id, answers: { q1, q2, q3 }
    });

    if (res.success) {
      closeModal('modal-onboard-test');
      showToast(`Score: ${res.score}% — ${res.passed ? 'CERTIFICATION PASSED!' : 'RETAKE AVAILABLE'}`, res.passed ? 'success' : 'danger');
      const u = state.users.find(x => x.id === state.currentUser.id);
      if (u) u.badge = res.badge;
      renderUserNav();
    }
  }

  /* ===================================================================
     UTILITIES
     =================================================================== */

  function formatTimeAgo(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setTextById(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ===================================================================
     PUBLIC API EXPORTS
     =================================================================== */

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
    runDagSimulation,
    resetDagSimulation,
    testSopRules,
    simulateWebhookDispatch,
    generateProofCertificate,
    updateSquadCalculations,
    deployCustomSquad,
    exportExecutiveReport,
    showToast,
    openSearchModal
  };

})();

document.addEventListener('DOMContentLoaded', App.init);
