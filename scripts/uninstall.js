#!/usr/bin/env node

/**
 * CF Targets Plugin - NPM Uninstallation Script
 * 
 * Copyright 2024 Norman Abramovitz and Contributors
 * Licensed under Apache License 2.0
 */

const fs = require('fs');
const path = require('path');

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

function uninstall() {
  try {
    logInfo('Cleaning up CF Targets Plugin...');
    
    const binDir = path.join(__dirname, '..', 'bin');
    
    if (fs.existsSync(binDir)) {
      const files = fs.readdirSync(binDir);
      files.forEach(file => {
        const filePath = path.join(binDir, file);
        fs.unlinkSync(filePath);
        logInfo(`Removed: ${file}`);
      });
      
      fs.rmdirSync(binDir);
      logInfo('✅ Cleanup completed');
    }
    
    logWarn('Note: You may need to manually uninstall from CF CLI:');
    logWarn('cf uninstall-plugin cf-targets');
    
  } catch (error) {
    logInfo(`Cleanup completed with minor issues: ${error.message}`);
  }
}

if (require.main === module) {
  uninstall();
}

module.exports = { uninstall };