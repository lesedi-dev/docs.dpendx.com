---
sidebar_position: 1
slug: /
---

# Introduction

**dpendx** is a GitHub App that scans your Pull Requests for dependency vulnerabilities and blocks insecure merges.

## How it works

Install the dpendx GitHub App on your repository. When you open a Pull Request, dpendx automatically:

1. **Scans your dependencies** for known vulnerabilities
2. **Checks if you're actually using** the vulnerable packages
3. **Reports findings** directly on your PR

If vulnerabilities are found in packages your code imports, the PR is blocked until you fix them.

## Supported Languages

dpendx supports 9 package ecosystems:

| Language | Files We Read |
|----------|--------------|
| Go | go.mod, go.sum |
| JavaScript/Node | package.json, package-lock.json, yarn.lock |
| Python | requirements.txt, pyproject.toml, poetry.lock |
| Rust | Cargo.toml, Cargo.lock |
| Ruby | Gemfile, Gemfile.lock |
| Java | pom.xml |
| .NET | *.csproj, packages.lock.json |
| PHP | composer.json, composer.lock |
| Swift/Objective-C | Podfile, Podfile.lock |

## Example Result

When dpendx finds issues, you'll see this on your PR:

| Package | Version | CVE | Severity | Imported | Fix |
|---------|---------|-----|----------|----------|-----|
| lodash | 4.17.20 | CVE-2021-23337 | HIGH | **Yes** | 4.17.21 |
| requests | 2.25.0 | CVE-2023-32681 | MEDIUM | No | 2.31.0 |

- **lodash** blocks the PR because your code imports it
- **requests** is just a warning because it's not imported

## Get Started

Ready to secure your PRs? Takes about 2 minutes.

**[Install dpendx](/getting-started/quick-start)**
