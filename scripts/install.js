#!/usr/bin/env node

/**
 * CF Targets Plugin - NPM Installation Script
 * 
 * ⚠️ USE AT YOUR OWN RISK - This software is provided "AS IS" without warranty
 * 
 * Copyright 2024 Norman Abramovitz and Contributors
 * Licensed under Apache License 2.0
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Configuration
const GITHUB_REPO = 'Amit-A2Z/cf-targets-plugin';
const VERSION = require('../package.json').version;
const BIN_DIR = path.join(__dirname, '..', 'bin');

// Platform mapping
const PLATFORM_MAP = {
  'darwin': {
    'x64': 'darwin.amd64',
    'arm64': 'darwin.arm64'
  },
  'linux': {
    'x64': 'linux.amd64',
    'arm64': 'linux.arm64'
  },
  'win32': {
    'x64': 'windows.amd64',
    'arm64': 'windows.arm64'
  }
};

function logWithTimestamp(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level}: ${message}`);
}

function logInfo(message) {
  logWithTimestamp('INFO', message);
}

function logWarn(message) {
  logWithTimestamp('WARN', message);
}

function logError(message) {
  logWithTimestamp('ERROR', message);
}

function showSecurityWarning() {
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  IMPORTANT SECURITY WARNING');
  console.log('='.repeat(80));
  console.log('This software is provided "AS IS" without warranty of any kind.');
  console.log('NO comprehensive security testing has been performed.');
  console.log('USE AT YOUR OWN RISK - You assume all responsibility.');
  console.log('See DISCLAIMER.md for complete legal notice.');
  console.log('='.repeat(80) + '\n');
}

function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;
  
  if (!PLATFORM_MAP[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  if (!PLATFORM_MAP[platform][arch]) {
    throw new Error(`Unsupported architecture: ${arch} on ${platform}`);
  }
  
  const platformString = PLATFORM_MAP[platform][arch];
  const extension = platform === 'win32' ? '.exe' : '';
  
  return {
    platform,
    arch,
    platformString,
    extension,
    binaryName: `cf-targets-plugin-${VERSION}+${platformString}${extension}`,
    checksumName: `cf-targets-plugin-${VERSION}+${platformString}${extension}.sha1`
  };
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {}); // Clean up on error
        reject(err);
      });
    }).on('error', reject);
  });
}

async function verifyChecksum(binaryPath, checksumPath) {
  try {
    const checksumContent = fs.readFileSync(checksumPath, 'utf8').trim();
    const expectedChecksum = checksumContent.split(' ')[0]; // SHA1 format: "hash filename"
    
    const binaryContent = fs.readFileSync(binaryPath);
    const actualChecksum = crypto.createHash('sha1').update(binaryContent).digest('hex');
    
    if (actualChecksum !== expectedChecksum) {
      throw new Error(`Checksum verification failed! Expected: ${expectedChecksum}, Got: ${actualChecksum}`);
    }
    
    logInfo('✅ Checksum verification passed');
    return true;
  } catch (error) {
    logError(`❌ Checksum verification failed: ${error.message}`);
    throw error;
  }
}

async function install() {
  try {
    showSecurityWarning();
    
    logInfo('Starting CF Targets Plugin installation...');
    
    // Get platform information
    const platformInfo = getPlatformInfo();
    logInfo(`Detected platform: ${platformInfo.platform}/${platformInfo.arch} (${platformInfo.platformString})`);
    
    // Create bin directory
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }
    
    // Download URLs
    const baseUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}`;
    const binaryUrl = `${baseUrl}/${platformInfo.binaryName}`;
    const checksumUrl = `${baseUrl}/${platformInfo.checksumName}`;
    
    // File paths
    const binaryPath = path.join(BIN_DIR, `cf-targets-plugin${platformInfo.extension}`);
    const checksumPath = path.join(BIN_DIR, `cf-targets-plugin.sha1`);
    
    logInfo(`Downloading binary from: ${binaryUrl}`);
    await downloadFile(binaryUrl, binaryPath);
    logInfo('✅ Binary downloaded successfully');
    
    logInfo(`Downloading checksum from: ${checksumUrl}`);
    await downloadFile(checksumUrl, checksumPath);
    logInfo('✅ Checksum downloaded successfully');
    
    // Verify checksum
    await verifyChecksum(binaryPath, checksumPath);
    
    // Make binary executable (Unix-like systems)
    if (process.platform !== 'win32') {
      fs.chmodSync(binaryPath, '755');
      logInfo('✅ Binary made executable');
    }
    
    // Clean up checksum file
    fs.unlinkSync(checksumPath);
    
    logInfo('✅ CF Targets Plugin installed successfully!');
    logWarn('⚠️  REMEMBER: This software is provided "AS IS" without warranty');
    logWarn('⚠️  SCAN the binary with your security tools before use');
    logWarn('⚠️  TEST in non-production environments first');
    
    console.log('\nNext steps:');
    console.log('1. Install the plugin: cf install-plugin cf-targets-plugin -f');
    console.log('2. Verify installation: cf plugins');
    console.log('3. Get help: cf targets --help');
    
  } catch (error) {
    logError(`Installation failed: ${error.message}`);
    logError('Please report issues at: https://github.com/Amit-A2Z/cf-targets-plugin/issues');
    process.exit(1);
  }
}

// Run installation
if (require.main === module) {
  install();
}

module.exports = { install };