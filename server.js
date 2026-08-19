const express = require('express');
const cors = require('cors');
const path = require('path');
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
  req.currentUser = data.users.find(u => u.id === userId) || data.users[1];
  next();
});

// --- API ENDPOINTS ---

// 1. STATS & OVERVIEW
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

// 2. AUTHENTICATION & USER MANAGEMENT
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
  const { name, email, role, specialty, company, country } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    role, // 'client' | 'worker'
    company: company || (role === 'client' ? 'Independent Enterprise' : null),
    specialty: specialty || 'General Knowledge Ops',
    country: country || (role === 'worker' ? 'Pakistan' : 'United States'),
    badge: role === 'worker' ? 'Certified AI Operator Candidate' : 'Enterprise Client',
    accuracy: role === 'worker' ? 98.0 : undefined,
    tasksCompleted: 0,
    avatar: role === 'worker' ? '⚡' : '💼',
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

// 3. SERVICES CATALOG
app.get('/api/services', (req, res) => {
  const data = db.get();
  res.json(data.services);
});

// 4. TASKS & WORKFLOW ENGINE
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

  // Sort latest first
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
  const { title, serviceId, inputSummary, priority, clientId, clientName } = req.body;
  if (!title || !serviceId) {
    return res.status(400).json({ error: 'Title and Service ID are required' });
  }

  const taskId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  // AI draft simulation based on service type
  let simulatedAiDraft = `[AI Pipeline Ingestion: Gemini 2.5 Pro]\n- Analyzed input payload.\n- Automated extraction confidence score: 97.4%.\n- Preliminary draft generated according to SOP standard.\n- Requires human operator sign-off and exception audit.`;

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
    inputSummary: inputSummary || 'Structured client payload submitted.',
    aiDraft: simulatedAiDraft,
    operatorNotes: '',
    auditLog: [
      { time: now, action: 'Workflow Created & Payload Ingested', actor: clientName || 'Enterprise Client' },
      { time: now, action: 'AI Model Inference & Auto-Drafting Complete', actor: 'Gemini 2.5 Pipeline' },
      { time: now, action: 'Queued for Human Operator Verification', actor: 'TrainedForce Dispatcher' }
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
  const { operatorNotes, accuracyScore, actionType } = req.body; // actionType: 'verify' | 'escalate'
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
      task.turnaroundSeconds = Math.floor(180 + Math.random() * 240);
      task.auditLog.push({
        time: now,
        action: `Verified & Certified Compliant (Score: ${task.accuracyScore}%)`,
        actor: task.workerName || 'Operator'
      });
      data.stats.totalTasksCompleted += 1;
    }
    return task;
  });

  if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task: updatedTask });
});

// 5. CUSTOMER DISCOVERY & ROI CALCULATOR
app.post('/api/discovery/score', (req, res) => {
  const {
    frequency = 3,
    pain = 4,
    economicImpact = 4,
    measurability = 4,
    remoteDeliverability = 5,
    aiSuitability = 4,
    buyerAccess = 3,
    urgency = 4,
    company,
    industry,
    role,
    workflow,
    monthlyCost = 15000,
    hoursPerWeek = 40
  } = req.body;

  const totalPainScore = Number(frequency) + Number(pain) + Number(economicImpact) +
    Number(measurability) + Number(remoteDeliverability) +
    Number(aiSuitability) + Number(buyerAccess) + Number(urgency);

  let recommendation = "Low Priority (Score < 16) — Do not pursue without further evidence";
  let color = "red";
  if (totalPainScore >= 32) {
    recommendation = "High Priority (32–40) — Immediate Pilot Candidate. High ROI & AI Fit.";
    color = "green";
  } else if (totalPainScore >= 24) {
    recommendation = "Investigate (24–31) — Strong potential. Refine SOP & exception boundary.";
    color = "amber";
  }

  // Calculate economics
  const estimatedSavings = Math.round(monthlyCost * 0.68);
  const estimatedTrainedForceCost = Math.round(monthlyCost * 0.32);
  const turnaroundSpeedBoost = "4.2x Faster";

  const newRecord = {
    id: `disc_${Date.now()}`,
    company: company || 'Enterprise Prospect',
    industry: industry || 'Tech/SaaS',
    role: role || 'Operations Leader',
    workflow: workflow || 'Repetitive Knowledge Task',
    painScore: totalPainScore,
    currentCostMonthly: `$${Number(monthlyCost).toLocaleString()}`,
    estimatedSavings: `$${estimatedSavings.toLocaleString()}/mo`,
    estimatedTrainedForceCost: `$${estimatedTrainedForceCost.toLocaleString()}/mo`,
    hoursPerWeek,
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
      frequency, pain, economicImpact, measurability, remoteDeliverability, aiSuitability, buyerAccess, urgency
    },
    economics: {
      currentMonthly: monthlyCost,
      trainedForceMonthly: estimatedTrainedForceCost,
      monthlySavings: estimatedSavings,
      annualSavings: estimatedSavings * 12,
      turnaroundSpeedBoost
    },
    record: newRecord
  });
});

app.get('/api/discovery/records', (req, res) => {
  const data = db.get();
  res.json(data.discoveryRecords);
});

// 6. CMS / SOP KNOWLEDGE BASE
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

// 7. OPERATOR ONBOARDING TEST SUBMISSION
app.post('/api/workers/onboard-test', (req, res) => {
  const { answers, workerId } = req.body;
  // Evaluate answers
  // Q1: What to do with variance > $10? Answer: Compare FOB terms on PO, flag for review.
  // Q2: When customer is high LTV? Answer: Offer extension credit with empathy, avoid rigid policy refusal.
  // Q3: Rule for LLM hallucination factual claims? Answer: Every claim must cite verified source URL or provided context.
  
  let score = 100;
  if (answers) {
    if (answers.q1 !== 'b') score -= 20;
    if (answers.q2 !== 'c') score -= 20;
    if (answers.q3 !== 'a') score -= 20;
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
      ? 'Congratulations! You demonstrated strong SOP adherence and AI exception handling. You are now eligible to claim live tasks in the queue.'
      : 'Review the TrainedForce SOP blueprints and retake the qualification assessment.'
  });
});

// Fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ TrainedForce Enterprise Platform running on http://0.0.0.0:${PORT}`);
});
