#!/usr/bin/env node

/**
 * CF Targets Plugin - NPM Uninstallation Script
 * 
 * Copyright 2024 Amit-A2Z and Contributors
 * Licensed under Apache License 2.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function checkCFCLI() {
  try {
    execSync('cf --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function uninstallCFPlugin() {
  try {
    logInfo('Removing plugin from CF CLI...');
    execSync('cf uninstall-plugin cf-targets', { stdio: 'pipe' });
    logInfo('✅ Plugin removed from CF CLI');
    return true;
  } catch (error) {
    logWarn('Plugin may not be installed in CF CLI or removal failed');
    return false;
  }
}

function uninstall() {
  try {
    logInfo('Starting CF Targets Plugin cleanup...');
    
    // Try to remove from CF CLI first
    if (checkCFCLI()) {
      uninstallCFPlugin();
    }
    
    const binDir = path.join(__dirname, '..', 'bin');
    
    if (fs.existsSync(binDir)) {
      const files = fs.readdirSync(binDir);
      files.forEach(file => {
        const filePath = path.join(binDir, file);
        fs.unlinkSync(filePath);
        logInfo(`Removed: ${file}`);
      });
      
      fs.rmdirSync(binDir);
      logInfo('✅ Binary cleanup completed');
    }
    
    logInfo('✅ CF Targets Plugin uninstalled successfully');
    console.log('\nIf the plugin still appears in "cf plugins", run:');
    console.log('cf uninstall-plugin cf-targets');
    
  } catch (error) {
    logInfo(`Cleanup completed with minor issues: ${error.message}`);
  }
}

if (require.main === module) {
  uninstall();
}

module.exports = { uninstall };