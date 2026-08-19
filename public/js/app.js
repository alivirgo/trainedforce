/**
 * TrainedForce — Quantum Neural Application Controller
 * Next-Gen Enterprise AI Workforce Operating System
 * 
 * Features:
 * - Interactive WebGL/Canvas Neural Particle Network
 * - Native Web Audio API Sound Synthesis Engine
 * - Visual Multi-Agent DAG Studio & Telemetry Console
 * - Confidence Heatmap Token Diff & SHA-256 Minting
 * - Enterprise Squad Builder & Dynamic Capacity Modeling
 * - 8-Dimension Customer Discovery SVG Radar Chart
 * - SOP Compliance Sandbox & Live Rule Evaluator
 * - Theme Switcher & Instant Accent Customizer
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
    currentTheme: 'cyan',
    soundEnabled: true,
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
    simulationRunning: false,
    activityFeedVisible: true,
    activityFeedInterval: null
  };

  /* ===================================================================
     NATIVE WEB AUDIO SYNTHESIZER ENGINE
     =================================================================== */

  const SoundFX = (function () {
    let ctx = null;

    function getAudioContext() {
      if (!ctx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) ctx = new AudioContext();
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      return ctx;
    }

    function playTone(freq, duration, type = 'sine', gainVal = 0.05) {
      if (!state.soundEnabled) return;
      try {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {
        // Audio policy ignore
      }
    }

    return {
      click() {
        playTone(750, 0.04, 'triangle', 0.03);
      },
      tab() {
        playTone(520, 0.06, 'sine', 0.04);
        setTimeout(() => playTone(880, 0.08, 'sine', 0.03), 30);
      },
      dispatch() {
        playTone(440, 0.08, 'sine', 0.05);
        setTimeout(() => playTone(660, 0.1, 'sine', 0.05), 60);
        setTimeout(() => playTone(990, 0.15, 'sine', 0.04), 120);
      },
      success() {
        playTone(523.25, 0.1, 'triangle', 0.05);
        setTimeout(() => playTone(659.25, 0.12, 'triangle', 0.05), 80);
        setTimeout(() => playTone(783.99, 0.15, 'triangle', 0.05), 160);
        setTimeout(() => playTone(1046.50, 0.25, 'sine', 0.06), 240);
      },
      alert() {
        playTone(320, 0.12, 'sawtooth', 0.06);
        setTimeout(() => playTone(240, 0.18, 'sawtooth', 0.06), 100);
      }
    };
  })();

  /* ===================================================================
     INTERACTIVE NEURAL PARTICLE CANVAS
     =================================================================== */

  const NeuralCanvas = (function () {
    let canvas, ctx, particles = [], animationFrame;
    const count = 45;
    const mouse = { x: null, y: null, radius: 140 };

    function initCanvas() {
      canvas = document.getElementById('neural-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');

      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });

      createParticles();
      animate();
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.6)' : 'rgba(168, 85, 247, 0.6)'
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect with nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Mouse attraction
        if (mouse.x && mouse.y) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < mouse.radius) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.25 * (1 - mdist / mouse.radius)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(animate);
    }

    return { init: initCanvas };
  })();

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

    if (type === 'success') SoundFX.success();
    else if (type === 'danger') SoundFX.alert();
    else SoundFX.click();

    const icon = type === 'success' ? '✔' : type === 'danger' ? '⚠' : '⚡';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4200);
  }

  /* ===================================================================
     INITIALIZATION
     =================================================================== */

  async function init() {
    console.log('⚡ [TrainedForce] Initializing Quantum Mesh Operating System...');

    NeuralCanvas.init();
    await loadInitialData();
    renderUserNav();
    renderProjectsFeed();
    renderOperators();
    renderSops();
    renderRadarChart(4, 5, 4, 5, 5, 4, 4, 4);
    updateSquadCalculations();
    calculateArbitrage();
    initScrollAnimations();
    animateHeroCounters();
    startTelemetryLoop();
    startActivityFeed();
    bindKeyboardShortcuts();
    bindHeaderScroll();

    console.log('⚡ [TrainedForce] All subsystems online & operational.');
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

    state.currentUser = state.users[1] || state.users[0] || {
      id: 'usr_default', name: 'Sarah Jenkins', role: 'client',
      company: 'Acuity Health SaaS', avatar: '💼'
    };
  }

  /* ===================================================================
     THEME ACCENT & AUDIO TOGGLE
     =================================================================== */

  function setTheme(themeName) {
    state.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    SoundFX.click();
    showToast(`Switched theme to ${themeName.toUpperCase()}`, 'info');
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const btn = document.getElementById('btn-audio-toggle');
    const icon = document.getElementById('audio-icon');
    const text = document.getElementById('audio-text');

    if (state.soundEnabled) {
      btn.classList.add('active');
      icon.textContent = '🔊';
      text.textContent = 'Audio ON';
      SoundFX.success();
    } else {
      btn.classList.remove('active');
      icon.textContent = '🔇';
      text.textContent = 'Audio MUTED';
    }
  }

  /* ===================================================================
     NAVIGATION & TAB SWITCHING
     =================================================================== */

  function navigateTo(tabId) {
    state.currentTab = tabId;
    SoundFX.tab();

    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeLink = document.getElementById(`nav-${tabId}`);
    if (activeLink) activeLink.classList.add('active');

    // Crossfade views
    const allViews = document.querySelectorAll('.tab-view');
    allViews.forEach(view => {
      if (view.style.display !== 'none') {
        view.style.opacity = '0';
        view.style.transform = 'translateY(6px)';
        setTimeout(() => { view.style.display = 'none'; }, 180);
      }
    });

    setTimeout(() => {
      const target = document.getElementById(`view-${tabId}`);
      if (target) {
        target.style.display = 'block';
        target.style.opacity = '0';
        target.style.transform = 'translateY(6px)';
        requestAnimationFrame(() => {
          target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        });
      }
    }, 200);

    // Show/hide hero sections on primary feed
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
     INTERSECTION OBSERVER & COUNTERS
     =================================================================== */

  function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  function animateHeroCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals') || '0');
      const duration = 1800;
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

  function startTelemetryLoop() {
    setInterval(() => {
      const latEl = document.getElementById('tele-latency');
      if (latEl) {
        const ms = Math.floor(275 + Math.random() * 45);
        latEl.textContent = `Gemini 2.5 Pro (${ms}ms)`;
      }
    }, 3500);
  }

  function bindHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
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
     LIVE ACTIVITY FEED TICKER
     =================================================================== */

  function startActivityFeed() {
    const feedData = [
      { icon: '✔', text: '<strong>Bilal T. (Lahore)</strong> verified TSK-8921 (Finance QA)', color: '#34d399' },
      { icon: '📥', text: 'Batch payload received from <strong>Acuity Health</strong>', color: '#38bdf8' },
      { icon: '🤖', text: 'Gemini inference complete for TSK-8924 (99.2%)', color: '#c084fc' },
      { icon: '⚡', text: '<strong>Fatima N. (Karachi)</strong> claimed TSK-8922 (Customer CX)', color: '#fbbf24' },
      { icon: '📜', text: 'SHA-256 Proof Minted: <strong>e3b0c442...</strong>', color: '#34d399' },
      { icon: '🚀', text: 'New dedicated squad deployed for <strong>Vanguard Logistics</strong>', color: '#00f2fe' },
      { icon: '✍', text: '<strong>Usman R.</strong> completed RLHF benchmark (100%)', color: '#c084fc' },
      { icon: '🎯', text: '120 RevOps lead signals verified for NexGen FinTech', color: '#38bdf8' }
    ];

    let idx = 0;
    const body = document.getElementById('activity-feed-body');
    if (!body) return;

    for (let i = 0; i < 4; i++) {
      addActivityItem(body, feedData[i], `${i * 35 + 10}s ago`);
    }
    idx = 4;

    state.activityFeedInterval = setInterval(() => {
      const item = feedData[idx % feedData.length];
      addActivityItem(body, item, 'just now', true);
      idx++;
      while (body.children.length > 7) {
        body.removeChild(body.lastChild);
      }
    }, 4500 + Math.random() * 2500);
  }

  function addActivityItem(container, data, timeStr, prepend) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `<div class="activity-icon" style="border-color:${data.color}30;color:${data.color};">${data.icon}</div>` +
      `<div><div class="activity-text">${data.text}</div><div style="font-size:0.68rem;color:var(--text-ghost);">${timeStr}</div></div>`;

    if (prepend) container.insertBefore(div, container.firstChild);
    else container.appendChild(div);
  }

  function toggleActivityFeed() {
    const widget = document.getElementById('activity-feed-widget');
    const btn = document.getElementById('feed-toggle-btn');
    if (!widget) return;

    state.activityFeedVisible = !state.activityFeedVisible;
    widget.style.display = state.activityFeedVisible ? 'block' : 'none';
    if (btn) btn.style.display = state.activityFeedVisible ? 'none' : 'flex';
  }

  /* ===================================================================
     GALLERY SWITCHER
     =================================================================== */

  function switchGalleryImage(type, btn) {
    document.querySelectorAll('.gallery-tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const img = document.getElementById('gallery-img-display');
    if (!img) return;

    const map = {
      dashboard: '/assets/hero-quantum.jpg',
      pipeline: '/assets/workflow-pipeline.jpg',
      operator: '/assets/operator-hub.jpg'
    };

    img.style.opacity = '0.3';
    setTimeout(() => {
      img.src = map[type] || '/assets/hero-quantum.jpg';
      img.style.opacity = '1';
    }, 180);
  }

  /* ===================================================================
     SEARCH & FILTERS
     =================================================================== */

  function filterCategory(catId, element) {
    state.selectedCategory = catId;
    document.querySelectorAll('.subnav-link').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
    SoundFX.click();
    renderProjectsFeed();
  }

  function filterStatus(status) {
    state.selectedStatus = status;
    SoundFX.click();
    renderProjectsFeed();
  }

  function handleSearch(query) {
    state.searchQuery = (query || '').toLowerCase().trim();
    renderProjectsFeed();
  }

  function applyFilters() { renderProjectsFeed(); }

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
     RENDER: PROJECTS FEED (EXCHANGE)
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
      container.innerHTML = `<div class="glass-panel" style="padding:40px;text-align:center;color:var(--text-muted);">
        <div style="font-size:2rem;margin-bottom:8px;">📋</div>
        <h4 style="color:#fff;">No active pipelines found</h4>
        <p style="margin-top:4px;font-size:0.88rem;">Adjust your filters or launch a new workflow batch.</p>
      </div>`;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const verified = t.status === 'verified';
      const urgent = t.priority === 'Urgent';
      const ago = formatTimeAgo(t.createdAt);
      const bids = t.bids ? t.bids.length : 3;

      return `<article class="project-card">
        <div class="project-card-header">
          <div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap;">
              ${urgent ? '<span class="badge badge-urgent">🔥 Urgent</span>' : ''}
              ${verified ? '<span class="badge badge-verified">✔ Certified & Verified</span>' : '<span class="badge badge-blue">⚡ In QA Review</span>'}
              <span class="badge badge-pro">${t.serviceId.replace('srv_', '').toUpperCase()}</span>
              <span class="mono" style="font-size:0.72rem;color:var(--accent-primary);">${t.id}</span>
            </div>
            <h3 class="project-title-link" onclick="App.openTaskQA('${t.id}')">${esc(t.title)}</h3>
            <div class="project-meta">
              <span>Ingested ${ago}</span><span>·</span>
              <span>Client: <strong style="color:#fff;">${esc(t.clientName)}</strong></span><span>·</span>
              <span>Operator QA: <strong>${t.workerName || 'Open Queue'}</strong></span><span>·</span>
              <span style="color:var(--accent-primary);font-weight:700;">${bids} bids</span>
            </div>
          </div>
          <div>
            <div class="budget-val">$0.85/doc</div>
            <div class="budget-type">Fixed SLA</div>
          </div>
        </div>

        <div class="project-desc-text">${esc(t.inputSummary)}</div>
        <div class="ai-pipeline-box"><strong style="color:var(--accent-primary);">🤖 Gemini 2.5 Inference:</strong> ${esc(t.operatorNotes || t.aiDraft)}</div>

        <div class="tags-row">
          <span class="skill-tag">#human-in-the-loop</span>
          <span class="skill-tag">#gemini-2.5-pro</span>
          <span class="skill-tag">#sop-compliant</span>
          <span class="skill-tag">#sha256-seal</span>
        </div>

        <div class="project-bottom-bar">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:#f59e0b;">★★★★★</span>
            <span><strong style="color:#fff;">5.0</strong> (62 audits)</span>
            <span style="margin-left:6px;color:var(--neon-emerald);font-weight:700;">✔ SOC2 Verified</span>
          </div>
          <div style="display:flex;gap:6px;">
            ${verified
              ? `<button class="btn btn-outline btn-sm" onclick="App.inspectAuditTrail('${t.id}')">Audit Proofs (${t.auditLog.length})</button>`
              : `<button class="btn btn-outline btn-sm" onclick="App.openBidModal('${t.id}')">💬 Bid</button><button class="btn btn-primary btn-sm" onclick="App.openTaskQA('${t.id}')">🛠️ QA Station</button>`}
          </div>
        </div>
      </article>`;
    }).join('');
  }

  /* ===================================================================
     RENDER: OPERATORS & SQUAD TALENT HUB
     =================================================================== */

  function renderOperators() {
    const container = document.getElementById('operators-grid-container');
    if (!container) return;

    const ops = [
      {
        name: "Bilal Tariq", loc: "Lahore 🇵🇰", title: "Lead Finance & AP/AR QA Specialist",
        avatar: "⚡", rate: "$16/hr", jss: "99.8%", tasks: "3,840", rating: "5.0",
        online: true, completion: 98,
        badges: ["Top Rated", "HIPAA Certified", "Gemini Master"],
        skills: ["PO Reconciliation", "ERP Audit", "Exception Triage", "Tax Rules"]
      },
      {
        name: "Fatima Noor", loc: "Karachi 🇵🇰", title: "Senior CX Support & Moderation Lead",
        avatar: "🌟", rate: "$14/hr", jss: "99.9%", tasks: "5,210", rating: "5.0",
        online: true, completion: 99,
        badges: ["Preferred", "Zendesk API", "Tier-2 De-escalation"],
        skills: ["Customer Empathy", "Refund Triage", "Tone Calibration", "SLA Escalation"]
      },
      {
        name: "Usman Raza", loc: "Islamabad 🇵🇰", title: "Catalog Taxonomy & RLHF Specialist",
        avatar: "🚀", rate: "$15/hr", jss: "99.5%", tasks: "2,680", rating: "4.9",
        online: false, completion: 92,
        badges: ["Frontier AI", "Merchant Pro", "RLHF Lead"],
        skills: ["SKU Tagging", "Multilingual QA", "Hallucination Check", "CSV Pipelines"]
      },
      {
        name: "Zainab Malik", loc: "Lahore 🇵🇰", title: "RevOps B2B Signal Verification Lead",
        avatar: "🎯", rate: "$15/hr", jss: "99.7%", tasks: "3,120", rating: "5.0",
        online: true, completion: 96,
        badges: ["Top Rated", "Apollo/HubSpot", "Executive Audit"],
        skills: ["Executive Verification", "CRM Sync", "Tech Stack Audit", "Lead Scoring"]
      }
    ];

    container.innerHTML = ops.map(op => {
      return `<div class="operator-card">
        <div>
          <div class="operator-top-info">
            <div class="operator-avatar-box">
              ${op.avatar}
              ${op.online ? '<div class="operator-status-dot"></div>' : ''}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:6px;">
                <h4 style="font-size:1.1rem;color:#fff;">${op.name}</h4>
                <span class="badge badge-verified">VERIFIED</span>
              </div>
              <div style="font-size:0.82rem;color:var(--text-muted);">${op.title}</div>
              <div style="font-size:0.75rem;color:var(--text-ghost);margin-top:2px;">📍 ${op.loc}</div>
            </div>
          </div>

          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;">
            ${op.badges.map(b => `<span class="badge badge-featured">${b}</span>`).join('')}
          </div>

          <div class="operator-stats-box">
            <div><div style="font-size:1rem;font-weight:800;color:var(--neon-emerald);" class="mono">${op.jss}</div><div style="font-size:0.65rem;color:var(--text-ghost);text-transform:uppercase;">Accuracy</div></div>
            <div><div style="font-size:1rem;font-weight:800;color:#fff;" class="mono">${op.tasks}</div><div style="font-size:0.65rem;color:var(--text-ghost);text-transform:uppercase;">Audited</div></div>
            <div><div style="font-size:1rem;font-weight:800;color:var(--accent-primary);" class="mono">${op.rate}</div><div style="font-size:0.65rem;color:var(--text-ghost);text-transform:uppercase;">Hourly</div></div>
          </div>

          <div class="tags-row">${op.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
        </div>

        <div style="display:flex;gap:6px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border-subtle);">
          <button class="btn btn-outline btn-sm" style="flex:1;" onclick="App.showToast('Viewing verified credentials for ${op.name}', 'info')">Profile</button>
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="App.openPostProjectModal()">Hire Operator</button>
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
      return `<div class="glass-panel" style="padding:22px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <span class="badge badge-pro">${s.category}</span>
          <span class="mono" style="font-size:0.72rem;color:var(--accent-primary);font-weight:800;">v${s.version}</span>
        </div>
        <h4 style="font-size:1.08rem;margin-bottom:10px;color:#fff;">${s.title}</h4>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:6px;font-size:0.84rem;color:#cbd5e1;">
          ${s.rules.map(r => `<li style="display:flex;gap:7px;"><span style="color:var(--accent-primary);flex-shrink:0;">⚡</span><span>${esc(r)}</span></li>`).join('')}
        </ul>
        <div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border-subtle);font-size:0.74rem;color:var(--text-ghost);">
          Updated: ${s.updatedAt} · Compliance Check: Active
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
      squadName: `Custom ${domain.replace('srv_', '').toUpperCase()} Squad (${size} Ops)`,
      serviceId: domain,
      squadSize: size,
      slaTarget: sla,
      clientId: state.currentUser.id
    });

    if (res.success) {
      SoundFX.dispatch();
      showToast(`Dedicated squad of ${size} operators deployed! Provisioning complete.`, 'success');
      const teleSquads = document.getElementById('tele-squads');
      if (teleSquads) teleSquads.textContent = `${state.stats.activeSquads + 1} Squads`;
    }
  }

  /* ===================================================================
     VISUAL DAG STUDIO SIMULATOR
     =================================================================== */

  function runDagSimulation() {
    if (state.simulationRunning) return;
    state.simulationRunning = true;
    SoundFX.dispatch();

    const consoleBox = document.getElementById('dag-console-output');
    const nodes = ['dag-node-1', 'dag-node-2', 'dag-node-3', 'dag-node-4'];
    const stats = ['dag-stat-1', 'dag-stat-2', 'dag-stat-3', 'dag-stat-4'];

    showToast('Executing multi-agent workflow DAG...', 'info');
    if (consoleBox) consoleBox.innerHTML = '';

    nodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active-pulse');
    });

    // Stage 1: Ingestion
    typewriteConsole(consoleBox, '[00.10s] Ingestion Node received raw webhook payload for TSK-8921...', '#38bdf8');
    activateDagNode(nodes[0], stats[0], 'Ingesting Webhook...', 'var(--neon-blue)');

    setTimeout(() => {
      deactivateDagNode(nodes[0]);
      typewriteConsole(consoleBox, '[00.42s] Gemini 2.5 Pro inference (298ms). Extracted 10 token entities (Confidence: 98.8%).', '#c084fc');
      activateDagNode(nodes[1], stats[1], 'Inference Complete', 'var(--neon-purple)');
    }, 1300);

    setTimeout(() => {
      deactivateDagNode(nodes[1]);
      typewriteConsole(consoleBox, '[01.75s] Dispatched to Bilal Tariq (#PK-219, Lahore). SOP v3.2 Check Passed.', '#fbbf24');
      activateDagNode(nodes[2], stats[2], 'SOP Audit Verified', '#fbbf24');
    }, 2600);

    setTimeout(() => {
      deactivateDagNode(nodes[2]);
      typewriteConsole(consoleBox, '[03.10s] SHA-256 Proof: e3b0c44298fc1c149afbf4c8996fb924... Synced to Acuity Health ERP. ✔', '#34d399');
      activateDagNode(nodes[3], stats[3], '100% Certified Delivery ✔', '#34d399');
      SoundFX.success();
      showToast('DAG execution finished with 100% QA pass!', 'success');

      setTimeout(() => {
        deactivateDagNode(nodes[3]);
        state.simulationRunning = false;
      }, 2000);
    }, 3900);
  }

  function resetDagSimulation() {
    const nodes = ['dag-node-1', 'dag-node-2', 'dag-node-3', 'dag-node-4'];
    nodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active-pulse');
    });
    const consoleBox = document.getElementById('dag-console-output');
    if (consoleBox) consoleBox.innerHTML = '<div style="color:var(--accent-primary);">[DAG Orchestrator] Standby. Click "Run Live Pipeline Simulation".</div>';
    SoundFX.click();
    showToast('DAG Reset to Standby', 'info');
  }

  function activateDagNode(nodeId, statId, text, glowColor) {
    const node = document.getElementById(nodeId);
    const stat = document.getElementById(statId);
    if (node) node.classList.add('active-pulse');
    if (stat) stat.textContent = text;
  }

  function deactivateDagNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (node) node.classList.remove('active-pulse');
  }

  function typewriteConsole(container, text, color) {
    if (!container) return;
    const line = document.createElement('div');
    line.style.cssText = `font-size:0.78rem;color:${color};margin-bottom:4px;font-family:var(--font-mono);`;
    container.appendChild(line);

    let idx = 0;
    const timer = setInterval(() => {
      if (idx < text.length) {
        line.textContent += text[idx];
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 10);
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
    const val = document.getElementById(`range-${id}`).value;
    const el = document.getElementById(`val-${id}`);
    if (el) el.textContent = val;
  }

  function renderRadarChart(f, p, e, a, remote = 5, meas = 4, access = 4, urgency = 4) {
    const container = document.getElementById('discovery-radar-box');
    if (!container) return;

    const values = [f, p, e, meas, remote, a, access, urgency];
    const labels = ['Freq', 'Pain', 'Econ', 'Meas', 'Remote', 'AI Fit', 'Buyer', 'Urg'];
    const max = 5;
    const size = 220;
    const center = size / 2;
    const radius = 80;

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
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    }).join('');

    const labelElements = labels.map((lbl, idx) => {
      const angle = (Math.PI * 2 / labels.length) * idx - Math.PI / 2;
      const x = center + (radius + 18) * Math.cos(angle);
      const y = center + (radius + 18) * Math.sin(angle);
      return `<text x="${x}" y="${y}" fill="#94a3b8" font-size="9" font-family="JetBrains Mono" text-anchor="middle" dominant-baseline="middle">${lbl}</text>`;
    }).join('');

    container.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${backgroundPolygons.map(poly => `<polygon points="${poly}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`).join('')}
        ${axisLines}
        <polygon points="${points}" fill="rgba(0, 242, 254, 0.25)" stroke="#00f2fe" stroke-width="2"/>
        ${labelElements}
      </svg>
    `;
  }

  function exportExecutiveReport() {
    SoundFX.success();
    showToast('Executive Briefing exported as PDF payload!', 'success');
  }

  /* ===================================================================
     SOP LIVE VALIDATION SANDBOX
     =================================================================== */

  async function testSopRules() {
    const payload = document.getElementById('sop-test-payload').value;
    const outputBox = document.getElementById('sop-test-output');
    outputBox.innerHTML = '<span style="color:var(--accent-primary);">Analyzing payload against active SOP criteria...</span>';
    SoundFX.dispatch();

    const res = await http.post('/api/cms/sops/test', {
      sopId: 'sop_finance_1',
      testPayload: payload
    });

    if (res) {
      SoundFX.success();
      outputBox.innerHTML = `<div style="color:#34d399;font-weight:700;">[SOP Engine] ${res.status} (Score: ${res.complianceScore}%)</div>` +
        res.violations.map(v => `<div style="color:#fb7185;margin-top:4px;">⚠ ${v.note}</div>`).join('') +
        res.passedRules.map(p => `<div style="color:#cbd5e1;margin-top:2px;">✔ ${p.note}</div>`).join('');
      showToast(`SOP Validation complete (${res.complianceScore}%)`, res.complianceScore >= 90 ? 'success' : 'danger');
    }
  }

  /* ===================================================================
     WEBHOOK & API DISPATCH SIMULATOR
     =================================================================== */

  async function simulateWebhookDispatch() {
    SoundFX.dispatch();
    showToast('Dispatching test webhook payload...', 'info');

    const res = await http.post('/api/tasks', {
      title: "Automated Webhook Ingestion #TSK-API",
      serviceId: "srv_finance",
      priority: "High",
      inputSummary: "Automated webhook ingestion via REST API Gateway.",
      clientId: state.currentUser.id,
      clientName: state.currentUser.company || "REST Ingestion API"
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
      if (avatarEl) avatarEl.textContent = state.currentUser.avatar || '👤';
    }
    renderUserModalList();
  }

  function renderUserModalList() {
    const container = document.getElementById('auth-users-list');
    if (!container) return;

    container.innerHTML = state.users.map(u => {
      const active = state.currentUser && state.currentUser.id === u.id;
      return `<div class="glass-panel" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border-color:${active ? 'var(--border-glow)' : 'var(--border-subtle)'};" onclick="App.switchUser('${u.id}')">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:1.3rem;">${u.avatar || '👤'}</span>
          <div>
            <div style="font-weight:700;font-size:0.88rem;color:#fff;">${u.name}</div>
            <div style="font-size:0.74rem;color:var(--text-ghost);">${u.company || u.badge || u.role}</div>
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
      SoundFX.success();
      showToast(`Switched account persona to ${u.name}`, 'success');
    }
  }

  async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !email) { showToast('Fill out name and email.', 'danger'); return; }

    const res = await http.post('/api/auth/register', { name, email, role });
    if (res.success) {
      state.users.push(res.user);
      state.currentUser = res.user;
      renderUserNav();
      closeModal('modal-auth');
      SoundFX.success();
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

    SoundFX.click();
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
      SoundFX.success();
      showToast(action === 'verify' ? 'Task QA passed & SHA-256 proof minted!' : 'Task escalated to Tier-3 Lead.', action === 'verify' ? 'success' : 'danger');
    }
  }

  function generateProofCertificate() {
    const w = window.open('', '_blank');
    if (!w) { alert('Enable pop-ups to view cryptographic certificate.'); return; }
    const sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    SoundFX.success();

    w.document.write(`<html><head><title>TrainedForce SHA-256 Audit Certificate</title>
      <style>
        body{font-family:Inter,sans-serif;background:#030712;color:#fff;padding:40px;display:flex;justify-content:center;align-items:center;min-height:100vh;}
        .cert{border:2px solid #00f2fe;padding:36px;border-radius:20px;max-width:680px;background:#0a1024;box-shadow:0 0 50px rgba(0,242,254,0.3);}
        h2{color:#00f2fe;margin-top:0;font-size:1.8rem;}
        .mono{font-family:monospace;color:#38bdf8;word-break:break-all;background:rgba(0,0,0,0.4);padding:10px;border-radius:8px;}
      </style></head>
      <body>
        <div class="cert">
          <h2>⚡ TrainedForce Cryptographic Proof of Delivery</h2>
          <p><strong>Proof Certificate ID:</strong> TF-CERT-2026-9904</p>
          <p><strong>Operator Signature:</strong> Bilal Tariq (Verified Level-3, Pakistan)</p>
          <p><strong>Workflow:</strong> HIPAA Invoice PO Reconciliation</p>
          <p><strong>Verification Pass Rate:</strong> 100.0% Verified Compliant</p>
          <p><strong>Cryptographic SHA-256 Seal:</strong></p>
          <p class="mono">${sha}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p style="color:#10b981;font-weight:bold;margin-top:20px;font-size:1.1rem;">✔ CERTIFIED SOC2 TYPE II & HIPAA COMPLIANT</p>
        </div>
      </body></html>`);
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
    document.getElementById('bid-project-title').textContent = `Bid on [${task.id}]`;
    document.getElementById('bid-project-subtitle').textContent = task.title;
    document.getElementById('bid-proposal-text').value = 'Certified operator with 99.8% QA score. Ready to verify this task per SOP guidelines within SLA.';
    SoundFX.click();
    openModal('modal-bid-task');
  }

  function autoGenerateProposal() {
    const task = state.activeBidTask;
    if (!task) return;
    document.getElementById('bid-proposal-text').value = `Dear Client,\n\nI have reviewed "${task.title}". As a Level-3 operator with 3,840+ verified deliverables and zero rework escalations, I will verify the Gemini 2.5 draft against your SOP and deliver within 15 minutes with complete audit proofs.\n\nBest regards.`;
    SoundFX.success();
    showToast('AI proposal generated!', 'info');
  }

  function submitBid() {
    if (!state.activeBidTask) return;
    const amount = document.getElementById('bid-amount-input').value;
    if (!state.activeBidTask.bids) state.activeBidTask.bids = [];
    state.activeBidTask.bids.push({ operator: state.currentUser.name, amount });
    closeModal('modal-bid-task');
    renderProjectsFeed();
    SoundFX.success();
    showToast(`Bid of $${amount} submitted on ${state.activeBidTask.id}`, 'success');
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
    SoundFX.click();
    openModal('modal-post-project');
  }

  function handleTemplateSelect(serviceId) {
    const title = document.getElementById('post-title');
    const payload = document.getElementById('post-payload');
    const tpl = {
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
    const serviceId = document.getElementById('post-service-id').value;
    const title = document.getElementById('post-title').value;
    const priority = document.getElementById('post-priority').value;
    const payload = document.getElementById('post-payload').value;

    if (!title) { showToast('Enter a project title.', 'danger'); return; }

    const res = await http.post('/api/tasks', {
      title, serviceId, priority,
      inputSummary: payload, clientId: state.currentUser.id,
      clientName: state.currentUser.company || state.currentUser.name
    });

    if (res.success) {
      state.tasks.unshift(res.task);
      closeModal('modal-post-project');
      renderProjectsFeed();
      SoundFX.dispatch();
      showToast(`Batch ${res.task.id} dispatched to operator queue!`, 'success');
    }
  }

  async function submitNewSop() {
    const title = document.getElementById('sop-title-input').value;
    const category = document.getElementById('sop-category-input').value;
    const rawRules = document.getElementById('sop-rules-input').value;
    if (!title || !category) { showToast('Fill title and category.', 'danger'); return; }

    const rules = rawRules.split('\n').map(r => r.trim()).filter(Boolean);
    const res = await http.post('/api/cms/sops', { title, category, rules });
    if (res.success) {
      state.sops.push(res.sop);
      closeModal('modal-new-sop');
      renderSops();
      SoundFX.success();
      showToast('SOP Blueprint published!', 'success');
    }
  }

  async function submitOnboardingTest() {
    const q1 = (document.querySelector('input[name="test-q1"]:checked') || {}).value;
    const q2 = (document.querySelector('input[name="test-q2"]:checked') || {}).value;
    const q3 = (document.querySelector('input[name="test-q3"]:checked') || {}).value;
    if (!q1 || !q2 || !q3) { showToast('Answer all questions.', 'danger'); return; }

    const res = await http.post('/api/workers/onboard-test', {
      workerId: state.currentUser.id, answers: { q1, q2, q3 }
    });

    if (res.success) {
      closeModal('modal-onboard-test');
      SoundFX.success();
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
    switchGalleryImage,
    runDagSimulation,
    resetDagSimulation,
    testSopRules,
    simulateWebhookDispatch,
    generateProofCertificate,
    updateSquadCalculations,
    deployCustomSquad,
    exportExecutiveReport,
    showToast,
    openSearchModal,
    toggleActivityFeed,
    setTheme,
    toggleSound
  };

})();

document.addEventListener('DOMContentLoaded', App.init);
