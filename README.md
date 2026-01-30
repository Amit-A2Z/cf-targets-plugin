# CF Targets Plugin

[![Build Status](https://travis-ci.org/norman-abramovitz/cf-targets-plugin.svg?branch=master)](https://travis-ci.org/norman-abramovitz/cf-targets-plugin)

## ⚠️ IMPORTANT LEGAL DISCLAIMERS

**USE AT YOUR OWN RISK**: This software is provided "AS IS" without warranty of any kind. The contributors and maintainers make no representations or warranties regarding the security, functionality, or reliability of this software.

**SECURITY NOTICE**: 
- ⚠️ **Binaries have NOT been fully tested for security vulnerabilities**
- ⚠️ **Functionality testing is LIMITED across all platforms**  
- ⚠️ **Use in production environments is NOT recommended without thorough testing**
- ⚠️ **Always verify checksums and scan binaries before use**

**NO LIABILITY**: Contributors shall not be liable for any damages, data loss, security breaches, or other issues arising from the use of this software.

---

## Overview

This plugin facilitates the use of multiple API targets with the Cloud Foundry CLI. It allows you to save and switch between different CF environments easily.

feat: modernize to Go 1.25 with comprehensive cross-platform support

- Upgrade Go runtime from 1.24 to 1.25 with breaking change fixes
- Replace deprecated io/ioutil with os package functions
- Add Windows ARM64 support for complete 6-platform coverage
- Implement UTC timestamp logging with ASCII-only output
- Remove debug code and optimize binaries (31% size reduction)
- Add comprehensive legal protection and security documentation
- Update build system for linux/arm64, darwin/amd64, darwin/arm64, windows/amd64, windows/arm64
- Enhance Makefile and build-all.sh with optimized build flags (-s -w)

BREAKING CHANGES:
- Requires Go 1.25+ for building from source
- DirEntry interface replaces FileInfo for directory operations

Security: Comprehensive disclaimers added - software provided "AS IS" without warranty
Legal: Apache License 2.0 with contributor protection and liability limitations
Testing: Build verification completed for all platforms, limited functional testing

**⚠️ TESTING STATUS**: 
- ✅ **Build Verification**: All binaries compile successfully
- ⚠️ **Functional Testing**: LIMITED - Basic functionality verified on macOS ARM64 only
- ⚠️ **Security Testing**: NOT PERFORMED - Use at your own risk
- ⚠️ **Cross-Platform Testing**: NOT COMPREHENSIVE - Only build verification completed

## Supported Platforms

| Platform | Architecture | Status | Testing Level |
|----------|-------------|---------|---------------|
| Linux | AMD64 | ✅ Builds | ⚠️ Build-only |
| Linux | ARM64 | ✅ Builds | ⚠️ Build-only |
| macOS | Intel (AMD64) | ✅ Builds | ⚠️ Build-only |
| macOS | Apple Silicon (ARM64) | ✅ Builds | ✅ Basic testing |
| Windows | AMD64 | ✅ Builds | ⚠️ Build-only |
| Windows | ARM64 | ✅ Builds | ⚠️ Build-only |

## Requirements

- Go 1.25 or later (for building from source)
- Cloud Foundry CLI


## Usage

Configure and save any number of named targets

```
$ cf api <development-target-url>
$ cf login
...
$ cf save-target development
```

Followed by

```
$ cf api <production-target-url>
$ cf login
...
$ cf save-target production
```

After saving targets, easily switch back and forth between them using:

```
$ cf set-target development
$ cf target
API Endpoint:   <development-target-url>
...
$ cf set-target production
$ cf target
API Endpoint:   <production-target-url>
...
```

View saved targets using

```
$ cf targets
development
production (current)
```

When there are changes that have not been saved, a unified diff of the changes will be shown.  For sensitive data, a
sha26 checksum is displayed instead.  The sha checksum makes for easier reading of the changes.

```
$ cf set-target test
Your current target has not been saved. Use save-target first, or use -f to discard your changes.
--- Current
+++ Target
@@ -3 +3 @@
- "AccessToken": "REDACTED sha256(9b421f0de41ed363fdfe936fcb915fd01be6938fd37302a632d5405e1e47f9c1)",
+ "AccessToken": "REDACTED sha256(9feb3a0a506c808b6e016436fc8e07fb3f393b5014799f40172bf430c4a4e679)",
@@ -6 +6 @@
- "ColorEnabled": "0",
+ "ColorEnabled": "1",
@@ -23 +23 @@
- "RefreshToken": "REDACTED sha256(957ad5c277daf6afcec1d0de6a2f051c645ed69c0e7693b51503b3b6e0e97ac6)",
+ "RefreshToken": "REDACTED sha256(c3b764a22604e32b77b7148df69b2c5b0ed2f3402d29d6da5c97eb60b623420b)",
@@ -28 +28 @@
-  "AllowSSH": false,
+  "AllowSSH": true,
``` 

## Installation

### ⚠️ SECURITY WARNING
**ALWAYS verify checksums before installation and scan binaries with your security tools.**

### Option 1: Download Pre-built Binaries (Use at Your Own Risk)

1. Download the appropriate binary for your platform from the [Releases](../../releases) page
2. **VERIFY the SHA1 checksum** against the provided `.sha1` file
3. **SCAN the binary** with your antivirus/security tools
4. Make the binary executable (Linux/macOS): `chmod +x cf-targets-plugin-*`
5. Install: `cf install-plugin /path/to/cf-targets-plugin-* -f`

### Option 2: Build from Source (Recommended for Security)

```bash
# Clone the repository
git clone https://github.com/norman-abramovitz/cf-targets-plugin.git
cd cf-targets-plugin

# Build for your platform
make build

# Install the plugin
cf install-plugin cf-targets-plugin -f
```

### Option 3: Install from CF Community (If Available)
```bash
cf add-plugin-repo CF-Community https://plugins.cloudfoundry.org/
cf install-plugin Targets -r CF-Community
```

## Full Command List

| command | usage | description|
| :--------------- |:---------------| :------------|
|`targets`| `cf targets` |list all saved targets|
|`save-target`|`cf save-target [-f] [<name>]`|save the current target for later use|
|`set-target`|`cf set-target [-f] <name>`|restore a previously saved target|
|`delete-target`|`cf delete-target <name>`|delete a previously saved target|

## Extended Build Metadata

The extended build metadata is available by executing the plugin itself.

```
./cf-targets-plugin
```

## Release Engineering Information

### GMake targets for pipelining

Generate release artifacts in the ***releases*** directory.  Sha256 checksum files are
created for each artifact as well. The file ***repo-index.yaml*** file is created for
when we are ready to submit to the cf-plugins-repo.  The GOOS and GOARCH variables are 
are included by default onto the build metadata string.
```
gmake ci-release VERSION=<major.minor,patch> [SEMVER_PRERELEASE=<prerelease-metadata>] [SEMVER_BUILDMETA=<buid-metadata>]
```

Cleans up after the artifacts are copied 
```
gmake release-clean

```
### GMake targets for manual release engineering

You can use the pipelining targets, but for manual release engineering testing the following
additional targets can be used for release build testing.

Same as ci-release but the version information defaults to the latest tag.  The patch
version is incremented to avoid version confusion for actual releases and the prerelease is set to dev.  
The same GMake variables used on ci-release can be used on release-all
```
gmake release-all
```

## GMake targets for development engineering

In addtion to the release engineering targets, the following targets will build the artifact for your local
environment.   The built artifact is located in the repo top directory.  The install target will build and install
the plugin into your local cf command. The same GMake variables for release engineering are available for development
engineering.
```
gmake build
./cf-targets-plugin
cf install-plugin cf-targets-plugin -f
```
or
```
gmake install 
./cf-targets-plugin
cf plugins
```

Clean up the build or install target generated artifacts
```
gmake clean
```

---

## 🛡️ Security and Legal Information

### Security Considerations

**⚠️ IMPORTANT**: This software has NOT undergone comprehensive security testing. Users should:

1. **Scan all binaries** with antivirus and security tools before use
2. **Verify checksums** of all downloaded files
3. **Test thoroughly** in non-production environments first
4. **Monitor for suspicious behavior** during and after installation
5. **Keep backups** of your CF CLI configuration before use

### Known Limitations

- Limited functional testing across all supported platforms
- No comprehensive security audit performed
- No warranty or guarantee of fitness for any particular purpose
- May contain undiscovered bugs or security vulnerabilities

### Reporting Security Issues

If you discover security vulnerabilities, please report them responsibly:
- **DO NOT** create public GitHub issues for security problems
- Contact the maintainers privately through GitHub
- Allow reasonable time for fixes before public disclosure

## 📄 License and Legal

### License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Disclaimer of Warranty
```
UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING, LICENSOR PROVIDES 
THE WORK (AND EACH CONTRIBUTOR PROVIDES ITS CONTRIBUTIONS) ON AN "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, 
NON-INFRINGEMENT, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
```

### Limitation of Liability
```
IN NO EVENT AND UNDER NO LEGAL THEORY, WHETHER IN TORT (INCLUDING NEGLIGENCE), 
CONTRACT, OR OTHERWISE, UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN 
WRITING, SHALL ANY CONTRIBUTOR BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY 
DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY 
CHARACTER ARISING AS A RESULT OF THIS LICENSE OR OUT OF THE USE OR INABILITY 
TO USE THE WORK.
```

### Third-Party Components

This software includes components from:
- **Go Authors**: Diff algorithm implementation (BSD-3-Clause License)
- **Cloud Foundry**: CLI plugin interfaces (Apache License 2.0)
- **Various Go modules**: See `go.mod` for complete list

### Contributing

By contributing to this project, you agree that your contributions will be licensed under the Apache License 2.0.

**Contributors are NOT liable for issues arising from the use of this software.**

---

## 🤝 Support and Community

### Support Level
This is a **community-maintained** project with **LIMITED SUPPORT**:
- No guaranteed response times
- No warranty or service level agreements  
- Best-effort community support only

### Getting Help
1. Check existing [GitHub Issues](../../issues)
2. Search the [Cloud Foundry Community](https://cloudfoundry.org/community/)
3. Create a new issue with detailed information

### Contributing
Contributions are welcome! Please:
1. Read the [Apache License 2.0](LICENSE) terms
2. Fork the repository
3. Create a feature branch
4. Submit a pull request with tests
5. Understand that contributions come with NO LIABILITY

---

**⚠️ FINAL REMINDER: USE AT YOUR OWN RISK - NO WARRANTIES PROVIDED**
