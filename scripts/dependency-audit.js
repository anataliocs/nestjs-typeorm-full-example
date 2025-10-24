#!/usr/bin/env node
/*
  Dependency audit and update report generator
  - Detects package manager (pnpm, npm, yarn)
  - Runs audit and outdated checks
  - Produces dependency-audit-<YYYY-MM-DD>.md
  - Notes breaking changes for major updates; suggests batching majors
  - Designed to be resilient if some commands are unavailable
*/

const { execSync } = require('node:child_process');
const { existsSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

function detectManager(cwd) {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'package-lock.json'))) return 'npm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  // default to pnpm if workspace file exists
  if (existsSync(join(cwd, 'pnpm-workspace.yaml'))) return 'pnpm';
  return 'npm';
}

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: e.stdout?.toString?.() || '', err: e.stderr?.toString?.() || e.message };
  }
}

function parseJsonSafe(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function auditWithPnpm(cwd) {
  // pnpm audit --json follows npm's structure in many cases; handle both array and object forms
  const res = run('pnpm audit --json', { cwd });
  const vulns = [];
  if (!res.ok) return { manager: 'pnpm', raw: res.out || res.err, vulnerabilities: vulns, error: res.err };
  const json = parseJsonSafe(res.out);
  if (!json) return { manager: 'pnpm', raw: res.out, vulnerabilities: vulns };

  // pnpm may output { advisories: {...}, metadata: {...} } or npm-like { vulnerabilities: {...} }
  if (json.advisories) {
    for (const id of Object.keys(json.advisories)) {
      const a = json.advisories[id];
      vulns.push({
        id: a.github_advisory_id || a.cves?.[0] || a.id || id,
        package: a.module_name || a.module || a.package || 'unknown',
        severity: a.severity || a.cvss?.severity || 'unknown',
        vulnerableRanges: a.vulnerable_versions || a.vulnerableRanges || '',
        patchedVersions: a.patched_versions || a.fix_versions || a.fixAvailable || '',
        title: a.title || a.summary || '',
        url: a.url || a.references?.[0] || '',
      });
    }
  } else if (json.vulnerabilities) {
    for (const [pkg, v] of Object.entries(json.vulnerabilities)) {
      const via = Array.isArray(v.via) ? v.via.find(x => typeof x === 'object') : null;
      vulns.push({
        id: via?.source || via?.id || '',
        package: pkg,
        severity: v.severity || via?.severity || 'unknown',
        vulnerableRanges: v.range || via?.range || '',
        patchedVersions: (typeof v.fixAvailable === 'object' ? v.fixAvailable.version : '') || '',
        title: via?.title || '',
        url: via?.url || '',
      });
    }
  }
  return { manager: 'pnpm', raw: json, vulnerabilities: vulns };
}

function outdatedWithPnpm(cwd) {
  const res = run('pnpm outdated --format json', { cwd });
  if (!res.ok) return { manager: 'pnpm', raw: res.out || res.err, updates: [], error: res.err };
  const json = parseJsonSafe(res.out);
  const updates = [];
  if (json && typeof json === 'object') {
    // pnpm returns a map of pkg -> { current, latest, wanted, dependentPaths }
    for (const [name, info] of Object.entries(json)) {
      const current = info.current;
      const wanted = info.wanted || info.latest;
      const latest = info.latest;
      updates.push({ name, current, wanted, latest, type: classifyUpdate(current, wanted, latest) });
    }
  }
  return { manager: 'pnpm', raw: json, updates };
}

function auditWithNpm(cwd) {
  const res = run('npm audit --json', { cwd });
  const vulns = [];
  if (!res.ok) return { manager: 'npm', raw: res.out || res.err, vulnerabilities: vulns, error: res.err };
  const json = parseJsonSafe(res.out);
  if (!json) return { manager: 'npm', raw: res.out, vulnerabilities: vulns };
  if (json.vulnerabilities) {
    for (const [pkg, v] of Object.entries(json.vulnerabilities)) {
      const via = Array.isArray(v.via) ? v.via.find(x => typeof x === 'object') : null;
      vulns.push({
        id: via?.source || via?.id || '',
        package: pkg,
        severity: v.severity || via?.severity || 'unknown',
        vulnerableRanges: v.range || via?.range || '',
        patchedVersions: (typeof v.fixAvailable === 'object' ? v.fixAvailable.version : '') || '',
        title: via?.title || '',
        url: via?.url || '',
      });
    }
  } else if (json.advisories) {
    for (const id of Object.keys(json.advisories)) {
      const a = json.advisories[id];
      vulns.push({
        id: a.github_advisory_id || a.cves?.[0] || a.id || id,
        package: a.module_name || a.module || 'unknown',
        severity: a.severity || 'unknown',
        vulnerableRanges: a.vulnerable_versions || '',
        patchedVersions: a.patched_versions || '',
        title: a.title || '',
        url: a.url || '',
      });
    }
  }
  return { manager: 'npm', raw: json, vulnerabilities: vulns };
}

function outdatedWithNpm(cwd) {
  const res = run('npm outdated --json', { cwd });
  const updates = [];
  if (!res.ok) return { manager: 'npm', raw: res.out || res.err, updates, error: res.err };
  const json = parseJsonSafe(res.out) || {};
  for (const [name, info] of Object.entries(json)) {
    const current = info.current;
    const wanted = info.wanted;
    const latest = info.latest;
    updates.push({ name, current, wanted, latest, type: classifyUpdate(current, wanted, latest) });
  }
  return { manager: 'npm', raw: json, updates };
}

function auditWithYarn(cwd) {
  // yarn v1 outputs multiple JSON lines. We'll collect the highest severity per package.
  const res = run('yarn audit --json', { cwd });
  const vulns = [];
  if (!res.ok) return { manager: 'yarn', raw: res.out || res.err, vulnerabilities: vulns, error: res.err };
  const lines = res.out.split(/\r?\n/).filter(Boolean);
  const byPkg = new Map();
  for (const line of lines) {
    const obj = parseJsonSafe(line);
    if (!obj) continue;
    if (obj.type === 'auditAdvisory' && obj.data?.advisory) {
      const a = obj.data.advisory;
      const entry = {
        id: a.github_advisory_id || a.id || '',
        package: a.module_name || '',
        severity: a.severity || 'unknown',
        vulnerableRanges: a.vulnerable_versions || '',
        patchedVersions: a.patched_versions || '',
        title: a.title || '',
        url: a.url || '',
      };
      const prev = byPkg.get(entry.package);
      if (!prev || severityRank(entry.severity) > severityRank(prev.severity)) byPkg.set(entry.package, entry);
    }
  }
  for (const v of byPkg.values()) vulns.push(v);
  return { manager: 'yarn', raw: null, vulnerabilities: vulns };
}

function outdatedWithYarn(cwd) {
  // yarn v1 does not provide stable JSON for outdated; try npm as fallback
  const res = run('yarn outdated --json', { cwd });
  const updates = [];
  if (!res.ok) return outdatedWithNpm(cwd);
  const lines = res.out.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const obj = parseJsonSafe(line);
    if (!obj) continue;
    if (obj.type === 'table' && obj.data?.body) {
      for (const row of obj.data.body) {
        // Row format: [Package, Current, Wanted, Latest, Package Type]
        const [name, current, wanted, latest] = row;
        updates.push({ name, current, wanted, latest, type: classifyUpdate(current, wanted, latest) });
      }
    }
  }
  return { manager: 'yarn', raw: null, updates };
}

function severityRank(sev) {
  return ({ critical: 4, high: 3, moderate: 2, medium: 2, low: 1 })[String(sev).toLowerCase()] || 0;
}

function classifyUpdate(current, wanted, latest) {
  // Determine semantic version bump type for wanted vs current
  const type = (from, to) => {
    if (!from || !to) return 'unknown';
    const f = from.replace(/^v/, '');
    const t = to.replace(/^v/, '');
    const fp = f.split('.').map(Number);
    const tp = t.split('.').map(Number);
    if (fp.length < 3 || tp.length < 3 || fp.some(isNaN) || tp.some(isNaN)) return 'unknown';
    if (tp[0] > fp[0]) return 'major';
    if (tp[1] > fp[1]) return 'minor';
    if (tp[2] > fp[2]) return 'patch';
    return 'none';
  };
  return type(current, wanted || latest);
}

function generateMarkdown(dateStr, manager, audit, outdated) {
  const lines = [];
  lines.push(`# Dependency Audit Report (${dateStr})`);
  lines.push('');
  lines.push(`Package manager detected: ${manager}`);
  lines.push('');
  lines.push('## Vulnerabilities');
  if (!audit.vulnerabilities?.length) {
    lines.push('- No known vulnerabilities reported by the package manager.');
  } else {
    // Group by severity
    const groups = audit.vulnerabilities.reduce((acc, v) => {
      const s = (v.severity || 'unknown').toLowerCase();
      acc[s] = acc[s] || [];
      acc[s].push(v);
      return acc;
    }, {});
    const order = ['critical', 'high', 'moderate', 'medium', 'low', 'unknown'];
    for (const sev of order) {
      const list = groups[sev];
      if (!list || !list.length) continue;
      lines.push(`### ${sev[0].toUpperCase()}${sev.slice(1)} (${list.length})`);
      for (const v of list) {
        lines.push(`- ${v.package}: ${v.title || 'Advisory'} [${v.id || 'N/A'}]`);
        lines.push(`  - Severity: ${v.severity}`);
        if (v.vulnerableRanges) lines.push(`  - Affected: ${v.vulnerableRanges}`);
        if (v.patchedVersions) lines.push(`  - Fixed in: ${v.patchedVersions}`);
        if (v.url) lines.push(`  - More info: ${v.url}`);
      }
      lines.push('');
    }
  }

  lines.push('');
  lines.push('## Available Updates');
  if (!outdated.updates?.length) {
    lines.push('- All dependencies are up to date according to the package manager.');
  } else {
    const minors = [];
    const patches = [];
    const majors = [];
    const unknowns = [];
    for (const u of outdated.updates) {
      const item = `- ${u.name}: ${u.current} -> wanted ${u.wanted}${u.latest && u.latest !== u.wanted ? ` (latest ${u.latest})` : ''} (${u.type})`;
      if (u.type === 'major') majors.push(item);
      else if (u.type === 'minor') minors.push(item);
      else if (u.type === 'patch') patches.push(item);
      else unknowns.push(item);
    }
    if (patches.length) { lines.push('### Patch updates'); lines.push(...patches); lines.push(''); }
    if (minors.length) { lines.push('### Minor updates'); lines.push(...minors); lines.push(''); }
    if (majors.length) {
      lines.push('### Major updates (breaking changes likely)');
      lines.push(...majors);
      lines.push('');
      lines.push('Note: Major updates can include breaking changes. It is recommended to batch these updates and review release notes and migration guides before applying.');
      lines.push('');
    }
    if (unknowns.length) { lines.push('### Other/Unknown'); lines.push(...unknowns); lines.push(''); }
  }

  lines.push('');
  lines.push('## Next steps');
  lines.push('- You can run tests after applying patch and minor updates to verify nothing breaks.');
  lines.push('- Major updates should be batched separately and reviewed for breaking changes.');
  lines.push('');
  lines.push('This report was generated by scripts/dependency-audit.js');

  return lines.join('\n');
}

function main() {
  const cwd = process.cwd();
  const manager = detectManager(cwd);

  let auditRes, outdatedRes;
  if (manager === 'pnpm') {
    auditRes = auditWithPnpm(cwd);
    outdatedRes = outdatedWithPnpm(cwd);
    if (outdatedRes && outdatedRes.error) {
      // Fallback to npm outdated if pnpm outdated is unavailable
      const fallback = outdatedWithNpm(cwd);
      if (fallback.updates?.length) {
        outdatedRes = fallback;
      }
    }
  } else if (manager === 'npm') {
    auditRes = auditWithNpm(cwd);
    outdatedRes = outdatedWithNpm(cwd);
  } else {
    auditRes = auditWithYarn(cwd);
    outdatedRes = outdatedWithYarn(cwd);
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const md = generateMarkdown(dateStr, manager, auditRes, outdatedRes);
  const outFile = join(cwd, `dependency-audit-${dateStr}.md`);
  writeFileSync(outFile, md, 'utf8');
  console.log(`Dependency audit written to ${outFile}`);

  if (auditRes?.error) {
    console.warn(`Audit command reported an error: ${auditRes.error}`);
  }
  if (outdatedRes?.error) {
    console.warn(`Outdated command reported an error: ${outdatedRes.error}`);
  }
}

if (require.main === module) {
  main();
}
