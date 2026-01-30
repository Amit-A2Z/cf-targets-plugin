#!/usr/bin/env node

/**
 * CF Targets Plugin - NPM Package Entry Point
 * 
 * ⚠️ USE AT YOUR OWN RISK - This software is provided "AS IS" without warranty
 * 
 * Copyright 2024 Norman Abramovitz and Contributors
 * Licensed under Apache License 2.0
 */

const path = require('path');
const { execSync } = require('child_process');

function showUsage() {
  console.log('\n⚠️  CF Targets Plugin - USE AT YOUR OWN RISK');
  console.log('=====================================');
  console.log('This software is provided "AS IS" without warranty.');
  console.log('See DISCLAIMER.md for complete legal notice.\n');
  
  console.log('Usage:');
  console.log('  npm install -g @cf-plugins/cf-targets-plugin');
  console.log('  cf install-plugin cf-targets-plugin -f');
  console.log('  cf targets --help\n');
  
  console.log('Commands after CF CLI installation:');
  console.log('  cf targets                    # List saved targets');
  console.log('  cf save-target <name>         # Save current target');
  console.log('  cf set-target <name>          # Switch to saved target');
  console.log('  cf delete-target <name>       # Delete saved target\n');
  
  console.log('Documentation:');
  console.log('  https://github.com/Amit-A2Z/cf-targets-plugin\n');
  
  console.log('⚠️  Security Notice:');
  console.log('  - NO comprehensive security testing performed');
  console.log('  - LIMITED functional testing across platforms');
  console.log('  - SCAN binaries with your security tools');
  console.log('  - TEST in non-production environments first\n');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  // Try to execute the binary
  try {
    const binaryPath = path.join(__dirname, 'bin', 'cf-targets-plugin');
    execSync(`"${binaryPath}" ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error: Could not execute cf-targets-plugin binary');
    console.error('Make sure the plugin is properly installed.');
    console.error('Run: cf install-plugin cf-targets-plugin -f');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  showUsage,
  version: require('./package.json').version
};