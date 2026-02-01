#!/usr/bin/env node

/**
 * CF Targets Plugin - NPM Installation Script
 * 
 * Copyright 2024 Amit-A2Z and Contributors
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

function showInstallationInfo() {
  console.log('\n' + '='.repeat(60));
  console.log('CF Targets Plugin Installation');
  console.log('='.repeat(60));
  console.log('Installing Cloud Foundry CLI plugin for target management');
  console.log('This software is provided "AS IS" without warranty');
  console.log('='.repeat(60) + '\n');
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

function checkCFCLI() {
  try {
    const output = execSync('cf --version', { encoding: 'utf8', stdio: 'pipe' });
    logInfo(`CF CLI detected: ${output.trim()}`);
    return true;
  } catch (error) {
    logWarn('CF CLI not found in PATH');
    return false;
  }
}

function installCFPlugin(binaryPath) {
  try {
    logInfo('Registering plugin with CF CLI...');
    const output = execSync(`cf install-plugin "${binaryPath}" -f`, { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    logInfo('Plugin registered successfully with CF CLI');
    return true;
  } catch (error) {
    logError(`Failed to register plugin with CF CLI: ${error.message}`);
    return false;
  }
}

function verifyCFPlugin() {
  try {
    const output = execSync('cf plugins', { encoding: 'utf8', stdio: 'pipe' });
    if (output.includes('cf-targets')) {
      logInfo('✅ Plugin verification successful - cf-targets is now available');
      return true;
    } else {
      logWarn('Plugin may not be properly registered');
      return false;
    }
  } catch (error) {
    logWarn('Could not verify plugin installation');
    return false;
  }
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
    showInstallationInfo();
    
    logInfo('Starting CF Targets Plugin installation...');
    
    // Check if CF CLI is available
    const cfCliAvailable = checkCFCLI();
    
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
    
    logInfo('✅ Binary installation completed successfully!');
    
    // Register plugin with CF CLI if available
    if (cfCliAvailable) {
      const pluginInstalled = installCFPlugin(binaryPath);
      if (pluginInstalled) {
        verifyCFPlugin();
        console.log('\n🎉 Installation Complete!');
        console.log('The cf-targets plugin is now ready to use:');
        console.log('• Run "cf plugins" to see installed plugins');
        console.log('• Run "cf targets --help" to get started');
        console.log('• Run "cf save-target <name>" to save your current target');
      } else {
        console.log('\n⚠️  Manual CF CLI Registration Required:');
        console.log(`1. Run: cf install-plugin "${binaryPath}" -f`);
        console.log('2. Verify: cf plugins');
        console.log('3. Get help: cf targets --help');
      }
    } else {
      console.log('\n⚠️  CF CLI Not Found:');
      console.log('1. Install CF CLI first: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html');
      console.log(`2. Then run: cf install-plugin "${binaryPath}" -f`);
      console.log('3. Verify: cf plugins');
    }
    
    console.log('\nNote: This software is provided "AS IS" without warranty');
    
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