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

console.log(`Version updated to ${newVersion}`);
