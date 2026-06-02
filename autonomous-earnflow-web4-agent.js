#!/usr/bin/env node
/**
 * Autonomous EarnFlow Agent with Web4 integration.
 * Sense (Web4 + internal), Think (simple strategy), Act (earn via APIs, post to Web4).
 * Run with node after starting the earnflow dev server.
 * Uses the new /api/agent/* endpoints for full autonomous registration and earning.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
// Use native fetch (Node 18+)

const EARNBASE = process.env.EARNBASE || 'http://localhost:3456';
const WEB4_DIR = path.join(__dirname, 'web4-agent');

console.log('🤖 Starting Autonomous EarnFlow + Web4 Agent...');

function runWeb4(cmd) {
  try {
    const out = execSync(`cd ${WEB4_DIR} && node scripts/w4_cli.mjs ${cmd}`, { encoding: 'utf8', stdio: 'pipe' });
    return out.trim();
  } catch (e) {
    return `ERROR: ${e.message}`;
  }
}

async function api(path, method = 'GET', body = null) {
  const url = `${EARNBASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await globalThis.fetch(url, opts);
  return res.json();
}

async function main() {
  // 1. Bootstrap Web4 identity for autonomous posting
  console.log('🌐 Bootstrapping Web4 identity...');
  let web4Init = runWeb4('init');
  console.log('Web4 init:', web4Init);
  runWeb4('publish_key');

  // 2. Register on EarnFlow (autonomous user/agent)
  console.log('📝 Autonomous registration on EarnFlow...');
  const reg = await api('/api/agent/register', 'POST', {
    email: `web4-agent-${Date.now()}@earnflow.test`,
    name: 'Web4 Autonomous Earner',
    password: 'agentpass123'
  });
  if (reg.error) {
    console.error('Register fail:', reg);
    // Fallback to demo for demo
    const demoUser = 'u_demo1'; // from seed
    console.log('Using demo user for demo run:', demoUser);
    global.CURRENT_USER = demoUser;
  } else {
    global.CURRENT_USER = reg.user.id;
    console.log('Registered agent user:', reg.user.id, 'token present');
  }

  const userId = global.CURRENT_USER;

  // 3. Autonomous earning loop (Sense-Think-Act)
  for (let cycle = 1; cycle <= 3; cycle++) {  // 3 cycles for demo
    console.log(`\n=== Cycle ${cycle} ===`);

    // SENSE: Check current state + Web4 signals
    const dash = await api(`/api/agent/earn?userId=${userId}`);
    console.log('Current balance:', dash.dashboard?.user?.balance);

    const senseWeb4 = runWeb4('sense');
    console.log('Web4 sense (recent):', senseWeb4.substring(0, 200));

    // THINK: Simple autonomous strategy (LLM-like: prioritize high reward)
    console.log('Thinking: Prioritize high-reward Kanban + quick tasks...');

    // ACT: Earn daily if possible
    try {
      const daily = await api('/api/agent/earn', 'POST', { userId, action: 'daily' });
      if (daily.success) console.log('✅ Daily earned:', daily.amount);
    } catch (e) { console.log('Daily skip:', e.message); }

    // ACT: Complete available tasks
    const tasksRes = await api(`/api/agent/tasks?userId=${userId}`);
    const tasks = tasksRes.tasks || [];
    for (const t of tasks.slice(0, 2)) {  // auto do 2
      try {
        const comp = await api('/api/agent/tasks', 'POST', { userId, taskId: t.id });
        if (comp.success) console.log('✅ Task done:', t.title, '+', comp.amount);
      } catch (e) { /* already done or limit */ }
    }

    // ACT: Kanban autonomous
    const kanban = await api(`/api/agent/kanban?userId=${userId}`);
    console.log('Kanban cards:', kanban.cards?.length || 0);

    // Auto create high value ideas (agent "thinks" of earning opps)
    const ideas = [
      { title: `Autonomous Web4 post strategy ${cycle}`, reward: 12 + cycle, vibe: 'creative' },
      { title: `Auto-optimize referral for agent economy`, reward: 9, vibe: 'grind' }
    ];
    for (const idea of ideas) {
      const created = await api('/api/agent/kanban', 'POST', { userId, action: 'create', ...idea });
      console.log('🌱 Auto-created Kanban:', created.card?.title);
    }

    // Auto bank (complete) the ones with reward
    const updatedKanban = await api(`/api/agent/kanban?userId=${userId}`);
    const toBank = (updatedKanban.cards || []).filter(c => c.reward && c.column !== 'banked').slice(0, 2);
    for (const c of toBank) {
      const banked = await api('/api/agent/kanban', 'POST', { userId, action: 'move', cardId: c.id, toColumn: 'banked' });
      console.log('🏦 Auto-banked for earning:', c.title, '+', c.reward);
    }

    // Reinvest platform cut autonomously (system collects and reinvests)
    const plat = await api(`/api/agent/earn?userId=${userId}`);
    if (plat.platformBalance > 20) {
      const reinv = Math.min(plat.platformBalance * 0.5, 10);
      await api('/api/agent/earn', 'POST', { userId, action: 'reinvest', amount: reinv });
      console.log('♻️ Auto-reinvested platform cut $' + reinv + ' into more opportunities');
    }

    // ACT: Report to Web4 autonomously (agent posts earning update)
    const postMsg = `Autonomous cycle ${cycle}: Earned via tasks+Kanban on EarnFlow. Balance now ~${dash.dashboard?.user?.balance}. #Web4 #Agent #EarnFlow`;
    const web4Post = runWeb4(`post "${postMsg}" --x ${3 + cycle * 0.1} --y ${3 + cycle * 0.1}`);
    console.log('📡 Posted to Web4:', web4Post.substring(0, 100));

    // Sleep between cycles (simulate continuous autonomy)
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Autonomous loop complete. Full flow (reg → tasks → Kanban banking → Web4 report) done without human intervention.');
  console.log('On live: Agents can call the /api/agent/* endpoints 24/7.');
}

main().catch(console.error);
