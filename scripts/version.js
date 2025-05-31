#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const args = process.argv.slice(2);
const versionType = args[0] || 'patch';

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(
  path.join(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2) + '\n'
);

// ------------------------------------------------------------
// Keep package-lock.json in sync so that CI and publishing are
// reproducible and the lockfile version matches package.json.
// We update:
//   1. Top-level "version" field
//   2. packages[""].version (npm v7+ lockfile v2/3)
// ------------------------------------------------------------

const lockPath = path.join(__dirname, '../package-lock.json');
try {
  if (fs.existsSync(lockPath)) {
    const lockRaw = fs.readFileSync(lockPath, 'utf8');
    const lockJson = JSON.parse(lockRaw);

    lockJson.version = newVersion;

    if (lockJson.packages && lockJson.packages['']) {
      lockJson.packages[''].version = newVersion;
    }

    fs.writeFileSync(lockPath, JSON.stringify(lockJson, null, 2) + '\n');
  }
} catch (err) {
  console.warn('Warning: failed to update package-lock.json version', err);
}

console.log(`Version updated to ${newVersion}`);
