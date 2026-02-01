# CF Targets Plugin

[![Build Status](https://travis-ci.org/Amit-A2Z/cf-targets-plugin.svg?branch=master)](https://travis-ci.org/Amit-A2Z/cf-targets-plugin)

**Easily manage multiple Cloud Foundry API targets with seamless switching and saving.**

This plugin simplifies working with multiple CF environments by allowing you to save, switch, and manage different API targets effortlessly. Perfect for developers working across development, staging, and production environments.

## ✨ Features

- **Save Multiple Targets**: Store unlimited CF API targets with custom names
- **Quick Switching**: Switch between environments with a single command
- **Smart Diff Display**: See exactly what changes when switching targets
- **Cross-Platform**: Works on Linux, macOS, and Windows (Intel & ARM)
- **Secure**: Redacts sensitive tokens in diff output
- **Easy Installation**: One-command npm installation with automatic CF CLI registration

## 🚀 Quick Start

### 1. Install the Plugin
```bash
npm install -g @cf-plugins/cf-targets-plugin
```

### 2. Save Your First Target
```bash
cf api https://api.your-dev-environment.com
cf login
cf save-target development
```

### 3. Save Additional Targets
```bash
cf api https://api.your-prod-environment.com  
cf login
cf save-target production
```

### 4. Switch Between Targets
```bash
cf set-target development
cf set-target production
```

That's it! You're now managing multiple CF environments like a pro.

## 📖 Usage Examples

### Save Current Target
```bash
# Save with a custom name
cf save-target my-dev-env

# Update existing target (with confirmation)
cf save-target production -f
```

### Switch Targets
```bash
# Switch to saved target
cf set-target production

# Force switch (discards unsaved changes)
cf set-target development -f
```

### List All Targets
```bash
cf targets
```
Output:
```
development
production (current)
staging
```

### Delete Unused Targets
```bash
cf delete-target old-environment
```

## 📋 Commands Reference

| Command | Usage | Description |
|---------|-------|-------------|
| `targets` | `cf targets` | List all saved targets |
| `save-target` | `cf save-target [-f] [NAME]` | Save current target |
| `set-target` | `cf set-target [-f] NAME` | Switch to saved target |
| `delete-target` | `cf delete-target NAME` | Delete saved target |

### Command Options
- `-f, --force`: Override confirmations and force the operation

## 🔧 Installation Options

### Option 1: NPM (Recommended)
```bash
npm install -g @cf-plugins/cf-targets-plugin
```
The plugin automatically registers with CF CLI during installation.

### Option 2: Manual Binary Installation
1. Download binary from [Releases](../../releases)
2. Make executable: `chmod +x cf-targets-plugin-*`
3. Install: `cf install-plugin /path/to/binary -f`

### Option 3: Build from Source
```bash
git clone https://github.com/Amit-A2Z/cf-targets-plugin.git
cd cf-targets-plugin
make build
cf install-plugin cf-targets-plugin -f
```

## 🛠 Troubleshooting

### Plugin Not Showing in `cf plugins`
```bash
# Check if plugin is installed
cf plugins | grep cf-targets

# If not found, manually register
cf install-plugin ~/.nvm/versions/node/*/lib/node_modules/@cf-plugins/cf-targets-plugin/bin/cf-targets-plugin -f

# Verify installation
cf plugins
```

### Permission Denied Errors
```bash
# Make binary executable
chmod +x ~/.nvm/versions/node/*/lib/node_modules/@cf-plugins/cf-targets-plugin/bin/cf-targets-plugin
```

### CF CLI Not Found During Installation
1. Install CF CLI: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html
2. Reinstall plugin: `npm install -g @cf-plugins/cf-targets-plugin`

## 🏗 Building from Source

### Requirements
- Go 1.25 or later
- Cloud Foundry CLI

### Build Commands
```bash
# Build for current platform
make build

# Build for all platforms
make release-all

# Install locally
make install
```

## 🌍 Supported Platforms

| Platform | Architecture | Status |
|----------|-------------|---------|
| Linux | AMD64 | ✅ Supported |
| Linux | ARM64 | ✅ Supported |
| macOS | Intel (AMD64) | ✅ Supported |
| macOS | Apple Silicon (ARM64) | ✅ Supported |
| Windows | AMD64 | ✅ Supported |
| Windows | ARM64 | ✅ Supported |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

**Note**: This software is provided "AS IS" without warranty of any kind. Use at your own discretion.

---

**Need help?** Check out the [Issues](../../issues) page or create a new issue for support.
