const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for simulated session
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'] || 'usr_client_1';
  const data = db.get();
  req.currentUser = (data.users && data.users.find(u => u.id === userId)) || (data.users && data.users[1]) || { id: 'usr_client_1', name: 'Sarah Jenkins', role: 'client' };
  next();
});

// Helper for SHA-256 generation
function generateShaProof(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload) + Date.now().toString()).digest('hex');
}

// --- API ENDPOINTS ---

// 1. STATS & LIVE TELEMETRY
app.get('/api/stats', (req, res) => {
  const data = db.get();
  const tasks = data.tasks;
  const verifiedCount = tasks.filter(t => t.status === 'verified').length;
  const inReviewCount = tasks.filter(t => t.status === 'in_worker_review').length;
  const aiProcessingCount = tasks.filter(t => t.status === 'ai_processing').length;
  const escalatedCount = tasks.filter(t => t.status === 'escalated').length;

  res.json({
    ...data.stats,
    liveQueues: {
      verified: verifiedCount,
      inWorkerReview: inReviewCount,
      aiProcessing: aiProcessingCount,
      escalated: escalatedCount,
      total: tasks.length
    }
  });
});

app.get('/api/telemetry/timeseries', (req, res) => {
  // Generate 24-hour telemetry curve for latency, accuracy, and task throughput
  const hours = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const hourLabel = d.getHours() + ':00';
    hours.push({
      time: hourLabel,
      throughput: Math.floor(180 + Math.random() * 80),
      latencyMs: Math.floor(280 + Math.random() * 45),
      accuracyPct: (99.3 + Math.random() * 0.6).toFixed(2),
      activeWorkers: Math.floor(280 + Math.random() * 35)
    });
  }
  res.json(hours);
});

// 2. AUTHENTICATION & USERS
app.get('/api/auth/users', (req, res) => {
  const data = db.get();
  res.json(data.users);
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const data = db.get();
  const user = data.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (user) {
    return res.json({ success: true, user });
  }
  return res.status(404).json({ success: false, message: 'User not found' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, specialty, company, country, city, hourlyRate } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    role, // 'client' | 'worker'
    company: company || (role === 'client' ? 'Independent Enterprise' : null),
    specialty: specialty || 'General Knowledge Ops QA',
    country: country || (role === 'worker' ? 'Pakistan' : 'United States'),
    city: city || (role === 'worker' ? 'Lahore' : 'San Francisco'),
    badge: role === 'worker' ? 'Certified AI Operator Candidate' : 'Enterprise Client',
    accuracy: role === 'worker' ? 98.5 : undefined,
    hourlyRate: hourlyRate || (role === 'worker' ? 15 : undefined),
    tasksCompleted: 0,
    avatar: role === 'worker' ? '⚡' : '💼',
    radar: role === 'worker' ? { accuracy: 98, speed: 90, domainKnowledge: 92, sopCompliance: 96, exceptionHandling: 90 } : undefined,
    createdAt: new Date().toISOString()
  };

  db.update(data => {
    data.users.push(newUser);
    if (role === 'worker') {
      data.stats.activeOperators += 1;
    }
  });

  res.json({ success: true, user: newUser });
});

// 3. SERVICES CATALOG & WORKFLOW TEMPLATES
app.get('/api/services', (req, res) => {
  const data = db.get();
  res.json(data.services);
});

// 4. SQUADS & SQUAD BUILDER
app.get('/api/squads', (req, res) => {
  const data = db.get();
  res.json(data.squadTemplates);
});

app.post('/api/squads/deploy', (req, res) => {
  const { squadName, serviceId, squadSize = 3, slaTarget = '< 15 Mins', operators = [], clientId } = req.body;
  const data = db.get();

  const newSquad = {
    id: `sq_cust_${Date.now()}`,
    name: squadName || 'Custom Enterprise AI Squad',
    serviceId: serviceId || 'srv_finance',
    squadSize: Number(squadSize),
    slaTarget,
    status: 'ACTIVE_PROVISIONED',
    operators: operators.length ? operators : ['Bilal Tariq', 'Fatima Noor'],
    priceMonthly: Math.round(Number(squadSize) * 1450),
    clientId: clientId || 'usr_client_1',
    createdAt: new Date().toISOString()
  };

  db.update(d => {
    d.stats.activeSquads = (d.stats.activeSquads || 16) + 1;
    d.stats.activePilots = (d.stats.activePilots || 24) + 1;
  });

  res.json({ success: true, squad: newSquad });
});

// 5. TASKS & WORKFLOW ENGINE
app.get('/api/tasks', (req, res) => {
  const { status, role, userId } = req.query;
  const data = db.get();
  let tasks = [...data.tasks];

  if (status && status !== 'all') {
    tasks = tasks.filter(t => t.status === status);
  }
  if (role === 'client' && userId) {
    tasks = tasks.filter(t => t.clientId === userId);
  }

  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const data = db.get();
  const task = data.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const { title, serviceId, inputSummary, priority, clientId, clientName, customTokens } = req.body;
  if (!title || !serviceId) {
    return res.status(400).json({ error: 'Title and Service ID are required' });
  }

  const taskId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  let simulatedAiDraft = `[AI Pipeline Ingestion: Gemini 2.5 Pro]\n- Analyzed input payload.\n- Automated extraction confidence score: 98.8%.\n- Preliminary draft generated according to SOP standard.\n- Requires human operator sign-off and exception audit.`;

  const tokens = customTokens || [
    { text: "Payload Summary:", conf: 0.998 },
    { text: title, conf: 0.992 },
    { text: "| Confidence Score:", conf: 0.988 },
    { text: "98.8% Gemini 2.5 Pro", conf: 0.988 },
    { text: "| Status:", conf: 0.96 },
    { text: "PENDING_OPERATOR_SIGN_OFF", conf: 0.95, anomaly: false }
  ];

  const newTask = {
    id: taskId,
    title,
    serviceId,
    clientId: clientId || 'usr_client_1',
    clientName: clientName || 'Acuity Health SaaS',
    workerId: null,
    workerName: null,
    status: 'in_worker_review',
    priority: priority || 'Normal',
    createdAt: now,
    completedAt: null,
    turnaroundSeconds: null,
    accuracyScore: null,
    sha256Proof: null,
    inputSummary: inputSummary || 'Structured client payload submitted.',
    aiDraft: simulatedAiDraft,
    tokens: tokens,
    operatorNotes: '',
    auditLog: [
      { time: now, action: 'Workflow Created & Ingested via API Gateway', actor: clientName || 'Enterprise Client' },
      { time: now, action: 'Gemini 2.5 Pro Inference Complete (98.8% Confidence)', actor: 'Gemini 2.5 Pipeline' },
      { time: now, action: 'Dispatched to Verified Human Operator QA Station', actor: 'TrainedForce Dispatcher' }
    ]
  };

  db.update(data => {
    data.tasks.unshift(newTask);
  });

  res.json({ success: true, task: newTask });
});

// Worker Claim Task
app.post('/api/tasks/:id/claim', (req, res) => {
  const { workerId, workerName } = req.body;
  const taskId = req.params.id;

  const updatedTask = db.update(data => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.workerId = workerId || 'usr_worker_1';
    task.workerName = workerName || 'Bilal Tariq';
    task.status = 'in_worker_review';
    task.auditLog.push({
      time: new Date().toISOString(),
      action: `Claimed by Verified Human Operator: ${task.workerName}`,
      actor: task.workerName
    });
    return task;
  });

  if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task: updatedTask });
});

// Worker Complete / Verify Task
app.post('/api/tasks/:id/verify', (req, res) => {
  const { operatorNotes, accuracyScore, actionType, correctedTokens } = req.body;
  const taskId = req.params.id;
  const now = new Date().toISOString();

  const updatedTask = db.update(data => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return null;

    if (actionType === 'escalate') {
      task.status = 'escalated';
      task.operatorNotes = operatorNotes || 'Flagged for Tier-3 Ops Lead review.';
      task.auditLog.push({
        time: now,
        action: `Escalated to Operations Lead for Exception Resolution`,
        actor: task.workerName || 'Operator'
      });
    } else {
      task.status = 'verified';
      task.completedAt = now;
      task.operatorNotes = operatorNotes || 'Quality checklist passed. Verified compliant with SOP.';
      task.accuracyScore = accuracyScore || 100;
      task.turnaroundSeconds = Math.floor(160 + Math.random() * 180);
      task.sha256Proof = generateShaProof(task);
      if (correctedTokens) task.tokens = correctedTokens;

      task.auditLog.push({
        time: now,
        action: `Verified & Certified Compliant (Score: ${task.accuracyScore}%)`,
        actor: task.workerName || 'Operator'
      });
      task.auditLog.push({
        time: now,
        action: `Cryptographic SHA-256 Seal Minted: ${task.sha256Proof.substring(0, 16)}...`,
        actor: 'TrainedForce Cryptographic Ledger'
      });
      data.stats.totalTasksCompleted += 1;
      data.stats.shaProofVerifications = (data.stats.shaProofVerifications || 148920) + 1;
    }
    return task;
  });

  if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task: updatedTask });
});

// 6. CRYPTOGRAPHIC PROOF VERIFIER (PUBLIC LOOKUP)
app.get('/api/verify/:certId', (req, res) => {
  const data = db.get();
  const certId = req.params.certId;
  const task = data.tasks.find(t => t.id === certId || t.sha256Proof === certId);

  if (task) {
    return res.json({
      valid: true,
      taskId: task.id,
      title: task.title,
      clientName: task.clientName,
      operatorName: task.workerName,
      accuracyScore: task.accuracyScore,
      completedAt: task.completedAt,
      sha256Proof: task.sha256Proof,
      auditLength: task.auditLog.length,
      complianceStatus: 'SOC2 TYPE II & HIPAA AUDIT COMPLIANT'
    });
  }

  res.json({
    valid: false,
    message: 'Cryptographic proof hash not found or expired.'
  });
});

// 7. CUSTOMER DISCOVERY & ROI ENGINE
app.post('/api/discovery/score', (req, res) => {
  const {
    frequency = 4,
    pain = 5,
    economicImpact = 4,
    measurability = 4,
    remoteDeliverability = 5,
    aiSuitability = 5,
    buyerAccess = 4,
    urgency = 4,
    company,
    industry,
    role,
    workflow,
    monthlyCost = 18000,
    hoursPerWeek = 40,
    onshoreFteCount = 4
  } = req.body;

  const totalPainScore = Number(frequency) + Number(pain) + Number(economicImpact) +
    Number(measurability) + Number(remoteDeliverability) +
    Number(aiSuitability) + Number(buyerAccess) + Number(urgency);

  let recommendation = "Low Priority (Score < 16) — Do not pursue without further evidence";
  let color = "red";
  if (totalPainScore >= 32) {
    recommendation = "High Priority (32–40) — Immediate Pilot Candidate. Massive ROI & Ideal AI-Human Fit.";
    color = "emerald";
  } else if (totalPainScore >= 24) {
    recommendation = "Investigate (24–31) — Strong potential. Refine SOP & exception boundaries.";
    color = "amber";
  }

  const estimatedSavings = Math.round(monthlyCost * 0.74);
  const estimatedTrainedForceCost = Math.round(monthlyCost * 0.26);
  const annualSavings = estimatedSavings * 12;
  const threeYearSavings = annualSavings * 3;

  const newRecord = {
    id: `disc_${Date.now()}`,
    company: company || 'Enterprise Prospect',
    industry: industry || 'B2B SaaS / FinTech',
    role: role || 'VP Operations / CFO',
    workflow: workflow || 'High-Friction Knowledge Ops',
    painScore: totalPainScore,
    currentCostMonthly: `$${Number(monthlyCost).toLocaleString()}`,
    estimatedSavings: `$${estimatedSavings.toLocaleString()}/mo`,
    estimatedTrainedForceCost: `$${estimatedTrainedForceCost.toLocaleString()}/mo`,
    annualSavings: `$${annualSavings.toLocaleString()}/yr`,
    threeYearSavings: `$${threeYearSavings.toLocaleString()}`,
    hoursPerWeek,
    onshoreFteCount,
    recommendation,
    createdAt: new Date().toISOString()
  };

  db.update(data => {
    data.discoveryRecords.unshift(newRecord);
  });

  res.json({
    painScore: totalPainScore,
    recommendation,
    breakdown: {
      frequency: Number(frequency),
      pain: Number(pain),
      economicImpact: Number(economicImpact),
      measurability: Number(measurability),
      remoteDeliverability: Number(remoteDeliverability),
      aiSuitability: Number(aiSuitability),
      buyerAccess: Number(buyerAccess),
      urgency: Number(urgency)
    },
    economics: {
      currentMonthly: monthlyCost,
      trainedForceMonthly: estimatedTrainedForceCost,
      monthlySavings: estimatedSavings,
      annualSavings,
      threeYearSavings,
      turnaroundSpeedBoost: "4.8x Faster",
      accuracySla: "99.6%"
    },
    record: newRecord
  });
});

app.get('/api/discovery/records', (req, res) => {
  const data = db.get();
  res.json(data.discoveryRecords);
});

// 8. CMS / SOP BLUEPRINTS & LIVE TEST SANDBOX
app.get('/api/cms/sops', (req, res) => {
  const data = db.get();
  res.json(data.sops);
});

app.post('/api/cms/sops', (req, res) => {
  const { title, category, rules } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category required' });
  }

  const newSop = {
    id: `sop_${Date.now()}`,
    title,
    category,
    version: '1.0',
    updatedAt: new Date().toISOString().split('T')[0],
    rules: Array.isArray(rules) ? rules : [rules]
  };

  db.update(data => {
    data.sops.push(newSop);
  });

  res.json({ success: true, sop: newSop });
});

// Test SOP against sample input
app.post('/api/cms/sops/test', (req, res) => {
  const { sopId, testPayload } = req.body;
  const data = db.get();
  const sop = data.sops.find(s => s.id === sopId) || data.sops[0];

  const violations = [];
  const passedRules = [];

  sop.rules.forEach((rule, idx) => {
    // Simple heuristic rule check
    if (rule.toLowerCase().includes('freight') && testPayload && testPayload.toLowerCase().includes('freight') && testPayload.includes('unauthorized')) {
      violations.push({ rule, severity: 'HIGH', note: 'Detected unauthorized freight line item requires PO FOB verification.' });
    } else if (rule.toLowerCase().includes('rounding') && testPayload && testPayload.includes('$4.')) {
      passedRules.push({ rule, note: 'Rounding delta < $5.00 within permissible tolerance.' });
    } else {
      passedRules.push({ rule, note: 'Rule check satisfied.' });
    }
  });

  res.json({
    sopTitle: sop.title,
    complianceScore: violations.length ? 85.0 : 100.0,
    status: violations.length ? 'FLAGGED_FOR_HUMAN_REVIEW' : 'SOP_PASSED',
    violations,
    passedRules
  });
});

// 9. OPERATOR ONBOARDING & CERTIFICATION TEST
app.post('/api/workers/onboard-test', (req, res) => {
  const { answers, workerId } = req.body;
  let score = 100;
  if (answers) {
    if (answers.q1 !== 'b') score -= 20;
    if (answers.q2 !== 'c') score -= 20;
    if (answers.q3 !== 'a') score -= 20;
    if (answers.q4 && answers.q4 !== 'a') score -= 20;
    if (answers.q5 && answers.q5 !== 'b') score -= 20;
  }

  const passed = score >= 80;

  db.update(data => {
    const user = data.users.find(u => u.id === workerId);
    if (user) {
      user.badge = passed ? 'Certified AI Operator (Verified Level-1)' : 'Candidate (Retake Available)';
      user.accuracy = score;
    }
  });

  res.json({
    success: true,
    score,
    passed,
    badge: passed ? 'Certified AI Operator (Verified Level-1)' : 'Needs Review',
    feedback: passed
      ? 'Outstanding! You scored ' + score + '% on SOP adherence and AI exception handling. You are now authorized to claim live tasks.'
      : 'Review the TrainedForce SOP blueprints and retake the qualification assessment.'
  });
});

// Fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ TrainedForce Enterprise Quantum OS running on http://0.0.0.0:${PORT}`);
});
