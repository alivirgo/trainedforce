/**
 * TrainedForce — Quantum Mesh Application Controller
 * Next-Gen AI Workforce Operating System
 * 
 * Features: Intersection Observer animations, counter animation engine,
 * live activity feed simulator, typewriter pipeline console, keyboard
 * shortcuts, smooth view transitions, enhanced telemetry.
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
    discoveryRecords: [],
    stats: {},
    activeInspectTask: null,
    activeBidTask: null,
    simulationRunning: false,
    activityFeedVisible: true,
    activityFeedInterval: null
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
     TOAST NOTIFICATION SYSTEM
     =================================================================== */

  function showToast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icon = type === 'success' ? '✔' : type === 'danger' ? '⚠' : '⚡';
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, 4200);
  }

  /* ===================================================================
     INITIALIZATION
     =================================================================== */

  async function init() {
    console.log('[TrainedForce] Initializing Quantum Mesh engine...');

    await loadInitialData();
    renderUserNav();
    renderProjectsFeed();
    renderOperators();
    renderSops();
    calculateArbitrage();
    initScrollAnimations();
    animateHeroCounters();
    startTelemetryLoop();
    startActivityFeed();
    bindKeyboardShortcuts();
    bindHeaderScroll();

    console.log('[TrainedForce] All subsystems online.');
  }

  /* ===================================================================
     DATA LOADING
     =================================================================== */

  async function loadInitialData() {
    var results = await Promise.all([
      http.get('/api/stats'),
      http.get('/api/auth/users'),
      http.get('/api/services'),
      http.get('/api/tasks'),
      http.get('/api/cms/sops'),
      http.get('/api/discovery/records')
    ]);

    state.stats = results[0] || {};
    state.users = results[1] || [];
    state.services = results[2] || [];
    state.tasks = results[3] || [];
    state.sops = results[4] || [];
    state.discoveryRecords = results[5] || [];

    state.currentUser = state.users[1] || state.users[0] || {
      id: 'usr_default', name: 'Sarah Jenkins', role: 'client',
      company: 'Acuity Health SaaS', avatar: '💼'
    };
  }

  /* ===================================================================
     INTERSECTION OBSERVER — Scroll Animations
     =================================================================== */

  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ===================================================================
     HERO COUNTER ANIMATION ENGINE
     =================================================================== */

  function animateHeroCounters() {
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0');
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;

        if (decimals > 0) {
          el.textContent = prefix + current.toFixed(decimals) + suffix;
        } else {
          el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          if (decimals > 0) {
            el.textContent = prefix + target.toFixed(decimals) + suffix;
          } else {
            el.textContent = prefix + target.toLocaleString() + suffix;
          }
        }
      }

      requestAnimationFrame(step);
    });
  }

  /* ===================================================================
     TELEMETRY ANIMATION LOOP
     =================================================================== */

  function startTelemetryLoop() {
    setInterval(function () {
      var latEl = document.getElementById('tele-latency');
      if (latEl) {
        var ms = Math.floor(285 + Math.random() * 50);
        latEl.textContent = 'Gemini 2.5 Pro (' + ms + 'ms)';
      }
    }, 3200);

    setInterval(function () {
      var opsEl = document.getElementById('tele-ops');
      if (opsEl) {
        var ops = 280 + Math.floor(Math.random() * 12);
        opsEl.textContent = ops.toString();
      }
    }, 5500);
  }

  /* ===================================================================
     HEADER SCROLL EFFECT
     =================================================================== */

  function bindHeaderScroll() {
    var header = document.getElementById('main-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ===================================================================
     KEYBOARD SHORTCUTS
     =================================================================== */

  function bindKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      // Ctrl+K or Cmd+K — open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearchModal();
      }

      // Escape — close modals
      if (e.key === 'Escape') {
        closeSearchModal();
        var modals = document.querySelectorAll('.modal-backdrop.active');
        modals.forEach(function (m) { m.classList.remove('active'); });
      }
    });
  }

  function toggleSearchModal() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) {
      closeSearchModal();
    } else {
      openSearchModal();
    }
  }

  function openSearchModal() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.add('active');
    var input = document.getElementById('search-modal-input');
    if (input) {
      input.value = '';
      setTimeout(function () { input.focus(); }, 100);
    }
  }

  function closeSearchModal() {
    var modal = document.getElementById('search-modal');
    if (modal) modal.classList.remove('active');
  }

  /* ===================================================================
     LIVE ACTIVITY FEED
     =================================================================== */

  function startActivityFeed() {
    var feedData = [
      { icon: '✔', text: '<strong>Bilal T.</strong> verified TSK-8921 (Finance QA)', color: '#34d399' },
      { icon: '📥', text: 'New batch ingested from <strong>Acuity Health</strong>', color: '#38bdf8' },
      { icon: '🤖', text: 'Gemini inference complete for TSK-8924 (99.1%)', color: '#c084fc' },
      { icon: '⚡', text: '<strong>Fatima N.</strong> claimed TSK-8922 (Support)', color: '#fbbf24' },
      { icon: '📜', text: 'Audit certificate generated for TSK-8921', color: '#34d399' },
      { icon: '🚀', text: 'New pilot squad deployed for <strong>Vanguard Logistics</strong>', color: '#00f2fe' },
      { icon: '✍', text: '<strong>Usman R.</strong> passed certification exam (100%)', color: '#c084fc' },
      { icon: '📊', text: 'Monthly accuracy report: <strong>99.4% global SLA</strong>', color: '#34d399' },
      { icon: '🎯', text: '100 RevOps leads enriched for NexGen FinTech', color: '#38bdf8' },
      { icon: '⚠', text: 'TSK-8930 escalated to Ops Lead (tax mismatch)', color: '#f43f5e' }
    ];

    var idx = 0;
    var body = document.getElementById('activity-feed-body');
    if (!body) return;

    // Seed initial items
    for (var i = 0; i < 4; i++) {
      addActivityItem(body, feedData[i], getTimeAgoString(i * 45 + 10));
    }
    idx = 4;

    state.activityFeedInterval = setInterval(function () {
      var item = feedData[idx % feedData.length];
      addActivityItem(body, item, 'just now', true);
      idx++;

      // Keep feed at reasonable length
      while (body.children.length > 8) {
        body.removeChild(body.lastChild);
      }
    }, 5000 + Math.random() * 3000);
  }

  function addActivityItem(container, data, timeStr, prepend) {
    var div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = '<div class="activity-icon" style="border-color: ' + data.color + '30; color: ' + data.color + ';">' + data.icon + '</div>' +
      '<div><div class="activity-text">' + data.text + '</div>' +
      '<div class="activity-time">' + timeStr + '</div></div>';

    if (prepend) {
      container.insertBefore(div, container.firstChild);
    } else {
      container.appendChild(div);
    }
  }

  function getTimeAgoString(seconds) {
    if (seconds < 60) return seconds + 's ago';
    var minutes = Math.floor(seconds / 60);
    return minutes + 'm ago';
  }

  function toggleActivityFeed() {
    var widget = document.getElementById('activity-feed-widget');
    var btn = document.getElementById('feed-toggle-btn');
    if (!widget) return;

    state.activityFeedVisible = !state.activityFeedVisible;
    widget.style.display = state.activityFeedVisible ? 'block' : 'none';
    if (btn) btn.style.display = state.activityFeedVisible ? 'none' : 'flex';
  }

  /* ===================================================================
     GALLERY SWITCHER
     =================================================================== */

  function switchGalleryImage(type, btn) {
    document.querySelectorAll('.gallery-tab-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    var img = document.getElementById('gallery-img-display');
    if (!img) return;

    var map = {
      dashboard: '/assets/hero-quantum.jpg',
      pipeline: '/assets/workflow-pipeline.jpg',
      operator: '/assets/operator-hub.jpg'
    };

    img.style.opacity = '0.4';
    setTimeout(function () {
      img.src = map[type] || '/assets/hero-quantum.jpg';
      img.style.opacity = '1';
    }, 200);
  }

  /* ===================================================================
     NAVIGATION WITH SMOOTH TRANSITIONS
     =================================================================== */

  function navigateTo(tabId) {
    state.currentTab = tabId;

    // Update nav active states
    document.querySelectorAll('.nav-tab-btn').forEach(function (btn) {
      btn.classList.remove('active');
    });
    var activeLink = document.getElementById('nav-' + tabId);
    if (activeLink) activeLink.classList.add('active');

    // Crossfade views
    var allViews = document.querySelectorAll('.tab-view');
    allViews.forEach(function (view) {
      if (view.style.display !== 'none') {
        view.style.opacity = '0';
        view.style.transform = 'translateY(8px)';
        setTimeout(function () { view.style.display = 'none'; }, 200);
      }
    });

    setTimeout(function () {
      var target = document.getElementById('view-' + tabId);
      if (target) {
        target.style.display = 'block';
        target.style.opacity = '0';
        target.style.transform = 'translateY(8px)';
        requestAnimationFrame(function () {
          target.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        });
      }
    }, 220);

    // Show/hide hero
    var hero = document.getElementById('hero-banner');
    var howItWorks = document.getElementById('how-it-works');
    var socialProof = document.querySelector('.social-proof-bar');
    var testimonials = document.querySelector('.testimonials-section');
    var showLanding = tabId === 'projects';

    if (hero) hero.style.display = showLanding ? 'block' : 'none';
    if (howItWorks) howItWorks.style.display = showLanding ? 'block' : 'none';
    if (socialProof) socialProof.style.display = showLanding ? 'block' : 'none';
    if (testimonials) testimonials.style.display = showLanding ? 'block' : 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ===================================================================
     CATEGORY / STATUS / SEARCH FILTERS
     =================================================================== */

  function filterCategory(catId, element) {
    state.selectedCategory = catId;
    document.querySelectorAll('.subnav-link').forEach(function (item) {
      item.classList.remove('active');
    });
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

  function applyFilters() { renderProjectsFeed(); }

  function sortProjects(key) {
    if (key === 'newest') {
      state.tasks.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    } else if (key === 'priority') {
      var order = { 'Urgent': 3, 'High': 2, 'Normal': 1 };
      state.tasks.sort(function (a, b) { return (order[b.priority] || 0) - (order[a.priority] || 0); });
    } else if (key === 'accuracy') {
      state.tasks.sort(function (a, b) { return (b.accuracyScore || 0) - (a.accuracyScore || 0); });
    }
    renderProjectsFeed();
  }

  /* ===================================================================
     RENDER: PROJECT FEED
     =================================================================== */

  function renderProjectsFeed() {
    var container = document.getElementById('projects-feed-container');
    if (!container) return;

    var filtered = state.tasks.slice();

    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(function (t) { return t.serviceId === state.selectedCategory; });
    }
    if (state.selectedStatus !== 'all') {
      filtered = filtered.filter(function (t) { return t.status === state.selectedStatus; });
    }
    if (state.searchQuery) {
      filtered = filtered.filter(function (t) {
        return t.title.toLowerCase().indexOf(state.searchQuery) !== -1 ||
          t.inputSummary.toLowerCase().indexOf(state.searchQuery) !== -1 ||
          t.clientName.toLowerCase().indexOf(state.searchQuery) !== -1;
      });
    }

    var countBadge = document.getElementById('project-count-badge');
    if (countBadge) countBadge.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">' +
        '<div style="font-size: 2rem; margin-bottom: 8px;">📋</div>' +
        '<h4 style="color: var(--text-primary);">No active projects</h4>' +
        '<p style="margin-top: 4px; font-size: 0.88rem;">Try a different filter or post a new project.</p></div>';
      return;
    }

    container.innerHTML = filtered.map(function (t) {
      var verified = t.status === 'verified';
      var urgent = t.priority === 'Urgent';
      var ago = formatTimeAgo(t.createdAt);
      var bids = t.bids ? t.bids.length : 4;

      return '<article class="project-card">' +
        '<div class="project-card-header"><div>' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap;">' +
        (urgent ? '<span class="badge badge-urgent">🔥 Urgent</span>' : '') +
        (verified ? '<span class="badge badge-verified">✔ Verified</span>' : '<span class="badge badge-blue">⚡ In Review</span>') +
        '<span class="badge badge-pro">' + t.serviceId.replace('srv_', '').toUpperCase() + '</span>' +
        '<span class="mono" style="font-size:0.72rem;color:var(--neon-cyan);">' + t.id + '</span></div>' +
        '<h3 class="project-title-link" onclick="App.openTaskQA(\'' + t.id + '\')">' + esc(t.title) + '</h3>' +
        '<div class="project-meta"><span>Posted ' + ago + '</span><span>·</span>' +
        '<span>Client: <strong style="color:#fff;">' + esc(t.clientName) + '</strong></span><span>·</span>' +
        '<span>QA: <strong>' + (t.workerName || 'Open') + '</strong></span><span>·</span>' +
        '<span style="color:var(--neon-cyan);font-weight:700;">' + bids + ' bids</span></div>' +
        '</div><div><div class="budget-val">$250–$750</div><div class="budget-type">Fixed Price</div></div></div>' +
        '<div class="project-desc-text">' + esc(t.inputSummary) + '</div>' +
        '<div class="ai-pipeline-box"><strong style="color:var(--neon-cyan);">🤖 Pipeline:</strong> ' + esc(t.operatorNotes || t.aiDraft) + '</div>' +
        '<div class="tags-row"><span class="skill-tag">#human-in-the-loop</span><span class="skill-tag">#gemini-2.5</span><span class="skill-tag">#sop-adherence</span><span class="skill-tag">#sla-guarantee</span></div>' +
        '<div class="project-bottom-bar"><div style="display:flex;align-items:center;gap:5px;">' +
        '<span style="color:#f59e0b;">★★★★★</span><span><strong style="color:#fff;">5.0</strong> (48)</span>' +
        '<span style="margin-left:6px;color:var(--neon-emerald);font-weight:700;">✔ Payment Verified</span></div>' +
        '<div style="display:flex;gap:6px;">' +
        (verified
          ? '<button class="btn btn-outline btn-sm" onclick="App.inspectAuditTrail(\'' + t.id + '\')">Audit (' + t.auditLog.length + ')</button>'
          : '<button class="btn btn-outline btn-sm" onclick="App.openBidModal(\'' + t.id + '\')">💬 Bid</button><button class="btn btn-primary btn-sm" onclick="App.openTaskQA(\'' + t.id + '\')">🛠️ QA</button>') +
        '</div></div></article>';
    }).join('');
  }

  /* ===================================================================
     RENDER: OPERATORS
     =================================================================== */

  function renderOperators() {
    var container = document.getElementById('operators-grid-container');
    if (!container) return;

    var ops = [
      {
        name: "Bilal Tariq", loc: "Lahore 🇵🇰", title: "Lead Finance QA Specialist",
        avatar: "⚡", rate: "$14/hr", jss: "99.8%", tasks: "3,410", rating: "5.0",
        reviews: 214, online: true, completion: 96,
        badges: ["Top Rated", "HIPAA Cert", "Gemini Master"],
        skills: ["PO Reconciliation", "ERP Audit", "Exception Triage", "Tax Rules"]
      },
      {
        name: "Fatima Noor", loc: "Karachi 🇵🇰", title: "Senior Support & Moderation Lead",
        avatar: "🌟", rate: "$12/hr", jss: "99.9%", tasks: "4,890", rating: "5.0",
        reviews: 320, online: true, completion: 99,
        badges: ["Preferred", "Zendesk Expert", "Tier-2 QA"],
        skills: ["Customer Empathy", "Refund Triage", "Tone Calibration", "SLA Escalation"]
      },
      {
        name: "Usman Raza", loc: "Islamabad 🇵🇰", title: "E-Commerce & RLHF Specialist",
        avatar: "🚀", rate: "$15/hr", jss: "99.5%", tasks: "2,150", rating: "4.9",
        reviews: 142, online: false, completion: 88,
        badges: ["Top Rated", "Merchant Pro", "RLHF Lead"],
        skills: ["SKU Tagging", "Multilingual QA", "Hallucination Check", "CSV Pipelines"]
      }
    ];

    container.innerHTML = ops.map(function (op) {
      return '<div class="operator-card"><div>' +
        '<div class="operator-top-info">' +
        '<div class="operator-avatar-box">' + op.avatar +
        (op.online ? '<div class="operator-status-dot"></div>' : '') + '</div>' +
        '<div><div style="display:flex;align-items:center;gap:6px;">' +
        '<h4 style="font-size:1.1rem;color:var(--text-primary);">' + op.name + '</h4>' +
        '<span class="badge badge-verified">VERIFIED</span></div>' +
        '<div style="font-size:0.82rem;color:var(--text-muted);">' + op.title + '</div>' +
        '<div style="font-size:0.76rem;color:var(--text-ghost);margin-top:2px;">📍 ' + op.loc + '</div></div></div>' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;">' +
        op.badges.map(function (b) { return '<span class="badge badge-featured">' + b + '</span>'; }).join('') + '</div>' +
        '<div class="operator-stats-box">' +
        '<div><div style="font-size:1rem;font-weight:800;color:var(--neon-emerald);" class="mono">' + op.jss + '</div><div style="font-size:0.65rem;color:var(--text-ghost);text-transform:uppercase;">Success</div></div>' +
        '<div><div style="font-size:1rem;font-weight:800;color:#fff;" class="mono">' + op.tasks + '</div><div style="font-size:0.65rem;color:var(--text-ghost);text-transform:uppercase;">Tasks</div></div>' +
        '<div><div style="font-size:1rem;font-weight:800;color:var(--neon-cyan);" class="mono">' + op.rate + '</div><div style="font-size:0.65rem;color:var(--text-ghost);text-transform:uppercase;">Rate</div></div></div>' +
        '<div class="operator-completion-bar"><div class="fill" style="width:' + op.completion + '%;"></div></div>' +
        '<div style="font-size:0.7rem;color:var(--text-ghost);margin-bottom:10px;">' + op.completion + '% profile completion</div>' +
        '<div class="tags-row">' + op.skills.map(function (s) { return '<span class="skill-tag">' + s + '</span>'; }).join('') + '</div></div>' +
        '<div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle);">' +
        '<button class="btn btn-outline btn-sm" style="flex:1;" onclick="App.showToast(\'Viewing credentials for ' + op.name + '\', \'info\')">Profile</button>' +
        '<button class="btn btn-primary btn-sm" style="flex:1;" onclick="App.openPostProjectModal()">Hire</button></div></div>';
    }).join('');
  }

  /* ===================================================================
     RENDER: SOPs
     =================================================================== */

  function renderSops() {
    var container = document.getElementById('sops-grid-container');
    if (!container) return;

    container.innerHTML = state.sops.map(function (s) {
      return '<div class="glass-panel" style="padding:22px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
        '<span class="badge badge-pro">' + s.category + '</span>' +
        '<span class="mono" style="font-size:0.72rem;color:var(--neon-cyan);font-weight:800;">v' + s.version + '</span></div>' +
        '<h4 style="font-size:1.08rem;margin-bottom:10px;color:var(--text-primary);">' + s.title + '</h4>' +
        '<ul style="list-style:none;display:flex;flex-direction:column;gap:6px;font-size:0.84rem;color:#cbd5e1;">' +
        s.rules.map(function (r) {
          return '<li style="display:flex;gap:7px;"><span style="color:var(--neon-cyan);flex-shrink:0;">⚡</span><span>' + esc(r) + '</span></li>';
        }).join('') + '</ul>' +
        '<div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border-subtle);font-size:0.74rem;color:var(--text-ghost);">Updated: ' + s.updatedAt + '</div></div>';
    }).join('');
  }

  /* ===================================================================
     USER NAVIGATION & AUTH
     =================================================================== */

  function renderUserNav() {
    var nameEl = document.getElementById('nav-user-name');
    var roleEl = document.getElementById('nav-user-role');
    var avatarEl = document.getElementById('nav-user-avatar');

    if (state.currentUser) {
      if (nameEl) nameEl.textContent = state.currentUser.name;
      if (roleEl) roleEl.textContent = state.currentUser.badge || (state.currentUser.role === 'client' ? 'Enterprise Client' : 'AI Operator');
      if (avatarEl) avatarEl.textContent = state.currentUser.avatar || '👤';
    }
    renderUserModalList();
  }

  function renderUserModalList() {
    var container = document.getElementById('auth-users-list');
    if (!container) return;

    container.innerHTML = state.users.map(function (u) {
      var active = state.currentUser && state.currentUser.id === u.id;
      return '<div class="glass-panel" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;' +
        'border-color:' + (active ? 'var(--border-glow-cyan)' : 'var(--border-subtle)') + ';" onclick="App.switchUser(\'' + u.id + '\')">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
        '<span style="font-size:1.3rem;">' + (u.avatar || '👤') + '</span><div>' +
        '<div style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">' + u.name + '</div>' +
        '<div style="font-size:0.74rem;color:var(--text-ghost);">' + (u.company || u.badge || u.role) + '</div></div></div>' +
        '<span class="badge ' + (u.role === 'client' ? 'badge-blue' : 'badge-verified') + '">' + u.role.toUpperCase() + '</span></div>';
    }).join('');
  }

  function switchUser(userId) {
    var u = state.users.find(function (x) { return x.id === userId; });
    if (u) {
      state.currentUser = u;
      renderUserNav();
      closeModal('modal-auth');
      renderProjectsFeed();
      showToast('Switched to ' + u.name, 'success');
    }
  }

  async function registerUser() {
    var name = document.getElementById('reg-name').value;
    var email = document.getElementById('reg-email').value;
    var role = document.getElementById('reg-role').value;

    if (!name || !email) { showToast('Fill out name and email.', 'danger'); return; }

    var res = await http.post('/api/auth/register', { name: name, email: email, role: role });
    if (res.success) {
      state.users.push(res.user);
      state.currentUser = res.user;
      renderUserNav();
      closeModal('modal-auth');
      showToast('Welcome ' + res.user.name + '!', 'success');
    }
  }

  /* ===================================================================
     MODAL MANAGEMENT
     =================================================================== */

  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function openPostProjectModal() { openModal('modal-post-project'); }

  function handleTemplateSelect(serviceId) {
    var title = document.getElementById('post-title');
    var payload = document.getElementById('post-payload');
    var tpl = {
      srv_finance: { t: "Vendor Invoice PO Reconciliation #INV-902", p: "Vendor: TechLogix ($14,230) vs PO-4481 ($14,200). Mismatch on line 4 freight." },
      srv_support: { t: "Tier-2 SLA Escalation: Extension Request", p: "Enterprise ($85k ARR) requests 30-day trial extension due to delayed audit." },
      srv_ecommerce: { t: "Catalog Taxonomy Tagging (40 SKUs)", p: "40 luxury footwear SKUs needing Google Merchant categorization." },
      srv_revops: { t: "Decision Maker Contact Verification (100 Leads)", p: "100 VP Ops leads requiring LinkedIn contact and CRM enrichment." },
      srv_aiqa: { t: "LLM Ground-Truth Hallucination Batch #441", p: "50 model answers needing source verification and safety grading." }
    };
    if (tpl[serviceId]) {
      if (title) title.value = tpl[serviceId].t;
      if (payload) payload.value = tpl[serviceId].p;
    }
  }

  async function submitPostProject() {
    var serviceId = document.getElementById('post-service-id').value;
    var title = document.getElementById('post-title').value;
    var priority = document.getElementById('post-priority').value;
    var payload = document.getElementById('post-payload').value;

    if (!title) { showToast('Enter a project title.', 'danger'); return; }

    var res = await http.post('/api/tasks', {
      title: title, serviceId: serviceId, priority: priority,
      inputSummary: payload, clientId: state.currentUser.id,
      clientName: state.currentUser.company || state.currentUser.name
    });

    if (res.success) {
      state.tasks.unshift(res.task);
      closeModal('modal-post-project');
      renderProjectsFeed();
      showToast('Project ' + res.task.id + ' dispatched!', 'success');
    }
  }

  /* ===================================================================
     BIDDING
     =================================================================== */

  function openBidModal(taskId) {
    var task = state.tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;
    state.activeBidTask = task;
    document.getElementById('bid-project-title').textContent = 'Bid on [' + task.id + ']';
    document.getElementById('bid-project-subtitle').textContent = task.title;
    document.getElementById('bid-proposal-text').value = 'Certified operator with 99.8% QA score. Ready to verify this task per SOP guidelines within SLA.';
    openModal('modal-bid-task');
  }

  function autoGenerateProposal() {
    var task = state.activeBidTask;
    if (!task) return;
    document.getElementById('bid-proposal-text').value = 'Dear Client,\n\nI have reviewed "' + task.title + '". As a Level-3 operator with 3,400+ tasks and zero rework, I will verify the Gemini output against your SOP and deliver within 15 minutes.\n\nBest regards.';
    showToast('AI draft generated!', 'info');
  }

  function submitBid() {
    if (!state.activeBidTask) return;
    var amount = document.getElementById('bid-amount-input').value;
    if (!state.activeBidTask.bids) state.activeBidTask.bids = [];
    state.activeBidTask.bids.push({ operator: state.currentUser.name, amount: amount });
    closeModal('modal-bid-task');
    renderProjectsFeed();
    showToast('Bid of $' + amount + ' submitted on ' + state.activeBidTask.id, 'success');
  }

  /* ===================================================================
     TASK QA WORKBENCH
     =================================================================== */

  function openTaskQA(taskId) {
    var task = state.tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;
    state.activeInspectTask = task;
    document.getElementById('qa-task-title').textContent = task.id + ': ' + task.title;
    document.getElementById('qa-task-meta').textContent = 'Client: ' + task.clientName + ' | Priority: ' + task.priority;
    document.getElementById('qa-task-input').textContent = task.inputSummary;
    document.getElementById('qa-task-aidraft').textContent = task.aiDraft;
    document.getElementById('qa-operator-notes').value = task.operatorNotes || 'Confirmed compliant with SOP. Approved.';
    openModal('modal-qa-task');
  }

  async function submitTaskQA(action) {
    if (!state.activeInspectTask) return;
    var notes = document.getElementById('qa-operator-notes').value;
    var res = await http.post('/api/tasks/' + state.activeInspectTask.id + '/verify', {
      actionType: action, operatorNotes: notes, accuracyScore: action === 'verify' ? 100 : undefined
    });
    if (res.success) {
      var idx = state.tasks.findIndex(function (t) { return t.id === state.activeInspectTask.id; });
      if (idx !== -1) state.tasks[idx] = res.task;
      closeModal('modal-qa-task');
      renderProjectsFeed();
      showToast(action === 'verify' ? 'Task QA passed!' : 'Task escalated.', action === 'verify' ? 'success' : 'danger');
    }
  }

  function inspectAuditTrail(taskId) {
    var task = state.tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;
    var msg = 'AUDIT TRAIL [' + task.id + ']\n\n';
    task.auditLog.forEach(function (log) {
      msg += '• [' + new Date(log.time).toLocaleTimeString() + '] ' + log.action + ' (' + log.actor + ')\n';
    });
    alert(msg);
  }

  /* ===================================================================
     PIPELINE SIMULATOR — With Progress Bars & Typewriter Console
     =================================================================== */

  function runLiveSimulation() {
    if (state.simulationRunning) return;
    state.simulationRunning = true;

    var consoleBox = document.getElementById('sim-console-output');
    var nodes = ['sim-node-1', 'sim-node-2', 'sim-node-3', 'sim-node-4'];
    var bars = ['sim-bar-1', 'sim-bar-2', 'sim-bar-3', 'sim-bar-4'];
    var statuses = ['sim-status-1', 'sim-status-2', 'sim-status-3', 'sim-status-4'];

    showToast('Starting pipeline execution...', 'info');
    consoleBox.innerHTML = '';

    // Reset all
    nodes.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.classList.remove('sim-node-active'); el.style.boxShadow = ''; }
    });
    bars.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.width = '0%';
    });

    // Step 1: Ingestion
    typewriteConsole(consoleBox, '[00.12s] Ingesting client webhook payload for TSK-SIM-99...', '#38bdf8');
    activateNode(nodes[0], bars[0], statuses[0], 'Receiving...', 'rgba(56,189,248,0.4)');

    setTimeout(function () {
      deactivateNode(nodes[0]);
      typewriteConsole(consoleBox, '[00.48s] Gemini 2.5 Pro inference (312ms). Confidence: 99.1%.', '#c084fc');
      activateNode(nodes[1], bars[1], statuses[1], 'Inferring...', 'rgba(168,85,247,0.4)');
    }, 1400);

    setTimeout(function () {
      deactivateNode(nodes[1]);
      typewriteConsole(consoleBox, '[01.80s] Dispatched to Bilal Tariq (Lahore). Auditing SOP v3.2... Passed.', '#fbbf24');
      activateNode(nodes[2], bars[2], statuses[2], 'Auditing...', 'rgba(251,191,36,0.4)');
    }, 2800);

    setTimeout(function () {
      deactivateNode(nodes[2]);
      typewriteConsole(consoleBox, '[03.10s] Certified. SHA256:7e99f2b8a01cd. Synced to client API. ✔', '#34d399');
      activateNode(nodes[3], bars[3], statuses[3], 'Delivered ✔', 'rgba(16,185,129,0.4)');
      showToast('Pipeline complete! 100% QA pass.', 'success');

      setTimeout(function () {
        deactivateNode(nodes[3]);
        state.simulationRunning = false;
      }, 2000);
    }, 4200);
  }

  function activateNode(nodeId, barId, statusId, statusText, glowColor) {
    var node = document.getElementById(nodeId);
    var bar = document.getElementById(barId);
    var status = document.getElementById(statusId);
    if (node) {
      node.classList.add('sim-node-active');
      node.style.boxShadow = '0 0 28px ' + glowColor;
    }
    if (bar) bar.style.width = '100%';
    if (status) status.textContent = statusText;
  }

  function deactivateNode(nodeId) {
    var node = document.getElementById(nodeId);
    if (node) {
      node.classList.remove('sim-node-active');
      node.style.boxShadow = '';
    }
  }

  function typewriteConsole(container, text, color) {
    var line = document.createElement('div');
    line.className = 'mono';
    line.style.cssText = 'font-size:0.76rem;color:' + color + ';margin-bottom:3px;';
    container.appendChild(line);

    var idx = 0;
    var timer = setInterval(function () {
      if (idx < text.length) {
        line.textContent += text[idx];
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 12);

    container.scrollTop = container.scrollHeight;
  }

  /* ===================================================================
     SANDBOX & CERTIFICATE
     =================================================================== */

  function runSandboxExtraction() {
    var outputBox = document.getElementById('sandbox-output');
    outputBox.innerHTML = '<span style="color:var(--neon-cyan);">Running Gemini 2.5 extraction...</span>';

    setTimeout(function () {
      var result = {
        vendor: "Apex Cloud Solutions", invoiceNumber: "INV-2026-8812",
        poNumber: "PO-9914", authorizedTotal: 4850.00, billedTotal: 5000.00,
        varianceDetected: { lineItem: 3, description: "Expedited Setup Fee",
          unauthorizedAmount: 150.00, action: "FLAG_DISCREPANCY_HOLD_PAYMENT" },
        sopComplianceStatus: "PASSED_WITH_EXCEPTION_NOTE", confidenceScore: 0.994
      };
      outputBox.textContent = JSON.stringify(result, null, 2);
      showToast('Extraction complete — 99.4% confidence!', 'success');
    }, 900);
  }

  function generateProofCertificate() {
    var w = window.open('', '_blank');
    if (!w) { alert('Enable pop-ups to view certificate.'); return; }
    var sha = 'sha256:e3b0c44298fc1c149afbf4c8996fb924';
    w.document.write('<html><head><title>TrainedForce Audit Certificate</title>' +
      '<style>body{font-family:Inter,sans-serif;background:#080c16;color:#fff;padding:40px;}' +
      '.cert{border:2px solid #00f2fe;padding:28px;border-radius:16px;max-width:680px;margin:0 auto;box-shadow:0 0 30px rgba(0,242,254,0.3);}' +
      'h2{color:#00f2fe;margin-top:0;}.mono{font-family:monospace;color:#38bdf8;word-break:break-all;}</style></head>' +
      '<body><div class="cert"><h2>⚡ Cryptographic Proof of Delivery</h2>' +
      '<p><strong>ID:</strong> TF-CERT-2026-9904</p>' +
      '<p><strong>Operator:</strong> Bilal Tariq (Tier-3, Pakistan)</p>' +
      '<p><strong>Workflow:</strong> HIPAA PO Reconciliation</p>' +
      '<p><strong>Score:</strong> 100.0% Verified</p>' +
      '<p><strong>SHA-256:</strong></p><p class="mono">' + sha + '</p>' +
      '<p><strong>Timestamp:</strong> ' + new Date().toISOString() + '</p>' +
      '<p style="color:#10b981;font-weight:bold;margin-top:18px;">✔ CERTIFIED SOC2 TYPE II COMPLIANT</p></div></body></html>');
  }

  /* ===================================================================
     ROI CALCULATOR
     =================================================================== */

  function calculateArbitrage() {
    var squadSize = parseInt((document.getElementById('range-squad-size') || {}).value || 5);
    var onshoreSalary = parseInt((document.getElementById('range-onshore-salary') || {}).value || 5500);
    var tfCost = 1450;

    var dispSquad = document.getElementById('disp-squad-size');
    var dispSalary = document.getElementById('disp-onshore-salary');
    if (dispSquad) dispSquad.textContent = squadSize + ' Operators';
    if (dispSalary) dispSalary.textContent = '$' + onshoreSalary.toLocaleString() + ' / mo';

    var moOnshore = squadSize * onshoreSalary;
    var moTF = squadSize * tfCost;
    var moSave = moOnshore - moTF;
    var annual = moSave * 12;
    var threeYr = annual * 3;

    setTextById('arb-annual-savings', '$' + annual.toLocaleString());
    setTextById('arb-onshore-mo', '$' + moOnshore.toLocaleString());
    setTextById('arb-tf-mo', '$' + moTF.toLocaleString());
    setTextById('arb-mo-savings', '$' + moSave.toLocaleString());
    setTextById('arb-3yr-savings', '$' + threeYr.toLocaleString());
  }

  function updateRangeDisplay(id) {
    var val = document.getElementById('range-' + id).value;
    var el = document.getElementById('val-' + id);
    if (el) el.textContent = val;
  }

  /* ===================================================================
     SOP & ONBOARDING
     =================================================================== */

  async function submitNewSop() {
    var title = document.getElementById('sop-title-input').value;
    var category = document.getElementById('sop-category-input').value;
    var rawRules = document.getElementById('sop-rules-input').value;
    if (!title || !category) { showToast('Fill title and category.', 'danger'); return; }
    var rules = rawRules.split('\n').map(function (r) { return r.trim(); }).filter(Boolean);
    var res = await http.post('/api/cms/sops', { title: title, category: category, rules: rules });
    if (res.success) {
      state.sops.push(res.sop);
      closeModal('modal-new-sop');
      renderSops();
      showToast('SOP published!', 'success');
    }
  }

  async function submitOnboardingTest() {
    var q1 = (document.querySelector('input[name="test-q1"]:checked') || {}).value;
    var q2 = (document.querySelector('input[name="test-q2"]:checked') || {}).value;
    var q3 = (document.querySelector('input[name="test-q3"]:checked') || {}).value;
    if (!q1 || !q2 || !q3) { showToast('Answer all questions.', 'danger'); return; }

    var res = await http.post('/api/workers/onboard-test', {
      workerId: state.currentUser.id, answers: { q1: q1, q2: q2, q3: q3 }
    });
    if (res.success) {
      closeModal('modal-onboard-test');
      showToast('Score: ' + res.score + '% — ' + (res.passed ? 'PASSED' : 'RETAKE'), res.passed ? 'success' : 'danger');
      var u = state.users.find(function (x) { return x.id === state.currentUser.id; });
      if (u) u.badge = res.badge;
      renderUserNav();
    }
  }

  /* ===================================================================
     UTILITIES
     =================================================================== */

  function formatTimeAgo(dateStr) {
    var seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }

  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setTextById(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ===================================================================
     PUBLIC API
     =================================================================== */

  return {
    init: init,
    navigateTo: navigateTo,
    filterCategory: filterCategory,
    filterStatus: filterStatus,
    handleSearch: handleSearch,
    applyFilters: applyFilters,
    sortProjects: sortProjects,
    openModal: openModal,
    closeModal: closeModal,
    openPostProjectModal: openPostProjectModal,
    handleTemplateSelect: handleTemplateSelect,
    submitPostProject: submitPostProject,
    openBidModal: openBidModal,
    autoGenerateProposal: autoGenerateProposal,
    submitBid: submitBid,
    openTaskQA: openTaskQA,
    submitTaskQA: submitTaskQA,
    inspectAuditTrail: inspectAuditTrail,
    switchUser: switchUser,
    registerUser: registerUser,
    submitOnboardingTest: submitOnboardingTest,
    updateRangeDisplay: updateRangeDisplay,
    calculateArbitrage: calculateArbitrage,
    submitNewSop: submitNewSop,
    switchGalleryImage: switchGalleryImage,
    runLiveSimulation: runLiveSimulation,
    runSandboxExtraction: runSandboxExtraction,
    generateProofCertificate: generateProofCertificate,
    showToast: showToast,
    openSearchModal: openSearchModal,
    toggleActivityFeed: toggleActivityFeed
  };

})();

document.addEventListener('DOMContentLoaded', App.init);
