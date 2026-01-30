# Contributing to CF Targets Plugin

## ⚠️ Legal Notice for Contributors

**By contributing to this project, you acknowledge and agree to the following:**

1. **No Liability**: You will NOT be held liable for any issues, damages, or security vulnerabilities arising from the use of this software
2. **Apache License**: Your contributions will be licensed under Apache License 2.0
3. **No Warranty**: You provide contributions "AS IS" without any warranties
4. **Risk Acknowledgment**: Users use this software at their own risk

## 🛡️ Contributor Protection

### Legal Protection
- All contributions are protected under Apache License 2.0
- Contributors are NOT liable for downstream usage issues
- No warranty or fitness guarantees required from contributors
- Community-driven development with shared responsibility

### Disclaimer
```
CONTRIBUTORS PROVIDE THEIR CONTRIBUTIONS ON AN "AS IS" BASIS, WITHOUT 
WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, 
WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS OF TITLE, NON-INFRINGEMENT, 
MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
```

## 🚀 How to Contribute

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test your changes (see Testing section)
5. Submit a pull request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/cf-targets-plugin.git
cd cf-targets-plugin

# Install Go 1.25 or later
# Build the plugin
make build

# Run tests
go test -v ./...
```

## 🧪 Testing Requirements

### Minimum Testing Standards
- ✅ **Build Verification**: Must compile on all target platforms
- ✅ **Unit Tests**: Add tests for new functionality
- ⚠️ **Integration Tests**: Recommended but not required
- ⚠️ **Security Testing**: Not required (but appreciated)

### Testing Commands
```bash
# Build for all platforms
make release-all VERSION=test

# Run unit tests
go test -v ./...

# Test specific functionality
./cf-targets-plugin  # Should show version info
```

### Platform Testing
We support 6 platforms but **comprehensive testing is NOT required**:
- linux/amd64, linux/arm64
- darwin/amd64, darwin/arm64  
- windows/amd64, windows/arm64

**Contributors are NOT expected to test on all platforms.**

## 📝 Contribution Guidelines

### Code Standards
- Follow Go conventions and `gofmt` formatting
- Add comments for complex logic
- Use meaningful variable and function names
- Maintain compatibility with Go 1.25+

### Commit Messages
- Use clear, descriptive commit messages
- Reference issues when applicable
- Keep commits focused and atomic

### Pull Request Process
1. **Description**: Clearly describe what your PR does
2. **Testing**: Mention what testing you performed
3. **Breaking Changes**: Highlight any breaking changes
4. **Documentation**: Update README.md if needed

### What We Accept
- ✅ Bug fixes
- ✅ New features
- ✅ Documentation improvements
- ✅ Performance improvements
- ✅ Security improvements
- ✅ Cross-platform compatibility fixes

### What We May Reject
- ❌ Changes that break existing functionality
- ❌ Contributions without basic testing
- ❌ Code that doesn't follow Go conventions
- ❌ Features that significantly increase complexity

## 🔒 Security Contributions

### Security Fixes
Security improvements are **highly appreciated** but:
- No formal security review process exists
- Contributors are NOT liable for security issues
- Best effort review by maintainers
- Community-driven security assessment

### Reporting Security Issues
- **DO NOT** create public issues for security problems
- Use GitHub's private vulnerability reporting
- Allow reasonable time for fixes before disclosure

## 📄 Legal Framework

### License Agreement
By contributing, you agree that your contributions will be licensed under Apache License 2.0.

### Copyright
- You retain copyright to your contributions
- You grant the project a perpetual, worldwide license to use your contributions
- No copyright assignment required

### Patent Grant
As per Apache License 2.0, you grant a patent license for any patents you hold that are necessarily infringed by your contributions.

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and professional
- Focus on constructive feedback
- Help newcomers learn and contribute
- Acknowledge that this is a volunteer project

### Communication
- Use GitHub issues for bug reports and feature requests
- Use pull requests for code contributions
- Be patient - this is a community project with limited resources

### Expectations
- **No SLAs**: No guaranteed response times
- **Best Effort**: Maintainers contribute when possible
- **Community Driven**: Success depends on community participation
- **No Liability**: Everyone contributes at their own risk

## 🎯 Contribution Areas

### High Priority
- Cross-platform compatibility fixes
- Security improvements
- Bug fixes
- Documentation improvements

### Medium Priority
- Performance optimizations
- New features
- Code quality improvements
- Test coverage improvements

### Low Priority
- Cosmetic changes
- Non-essential features
- Refactoring without clear benefits

## 📞 Getting Help

### Where to Ask
1. **GitHub Issues**: For bugs and feature requests
2. **Pull Request Comments**: For code-specific questions
3. **GitHub Discussions**: For general questions (if enabled)

### Response Expectations
- **No guaranteed response time**
- **Best effort from volunteers**
- **Community-driven support**
- **Be patient and respectful**

---

## ⚠️ Final Reminder

**This is a community project provided "AS IS" with NO WARRANTIES. Contributors and users participate at their own risk with no liability for issues that may arise.**

Thank you for contributing to the CF Targets Plugin community! 🙏