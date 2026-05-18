#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, '..');
const nextVersion = process.argv[2]?.trim();
const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

if (!nextVersion || !semverPattern.test(nextVersion)) {
  console.error('Usage: npm run release:version -- <semver>');
  console.error('Example: npm run release:version -- 0.2.0');
  process.exit(1);
}

async function readJson(fileName) {
  const filePath = resolve(appRoot, fileName);
  return {
    filePath,
    value: JSON.parse(await readFile(filePath, 'utf8'))
  };
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const packageJson = await readJson('package.json');
const packageLock = await readJson('package-lock.json');
const previousVersion = packageJson.value.version;

packageJson.value.version = nextVersion;

if (packageLock.value.name === packageJson.value.name) {
  packageLock.value.version = nextVersion;
}

if (packageLock.value.packages?.['']?.name === packageJson.value.name) {
  packageLock.value.packages[''].version = nextVersion;
}

await writeJson(packageJson.filePath, packageJson.value);
await writeJson(packageLock.filePath, packageLock.value);

console.log(`Codex Pet Overlay version: ${previousVersion} -> ${nextVersion}`);
console.log('Updated package.json and package-lock.json.');
