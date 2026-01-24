---
sidebar_position: 1
slug: /
---

# Introduction

**dpendx** is a GitHub App that scans Pull Requests for dependency vulnerabilities and blocks insecure merges via the GitHub Checks API.

## What dpendx does

When you open or update a Pull Request, dpendx automatically:

1. **Extracts dependencies** from your project's manifest and lock files
2. **Queries the OSV database** for known vulnerabilities
3. **Performs reachability analysis** to determine if vulnerable packages are actually imported in your code
4. **Reports findings** via GitHub's Checks API with clear, actionable results

## Key Features

### Multi-Ecosystem Support

dpendx supports 9 package ecosystems out of the box:

| Ecosystem | Manifest Files | Lock Files |
|-----------|---------------|------------|
| Go | go.mod | go.sum |
| npm | package.json | package-lock.json, yarn.lock |
| Python | requirements.txt, pyproject.toml | poetry.lock, Pipfile.lock |
| Rust | Cargo.toml | Cargo.lock |
| Ruby | Gemfile | Gemfile.lock |
| Java | pom.xml | - |
| .NET | *.csproj | packages.lock.json |
| PHP | composer.json | composer.lock |
| CocoaPods | Podfile | Podfile.lock |

### Reachability Analysis

Unlike traditional dependency scanners that simply report "you have a vulnerable package," dpendx determines if vulnerable packages are **actually imported** in your source code.

This distinction matters:
- **Imported vulnerabilities** = high risk, the vulnerable code is being used
- **Non-imported vulnerabilities** = lower risk, the package exists but isn't used

### GitHub Checks Integration

dpendx integrates natively with GitHub's Checks API:
- Shows scan status directly in your PR
- Blocks merges when imported vulnerabilities are found
- Provides detailed reports with remediation guidance

## Quick Example

When dpendx finds vulnerabilities, you'll see a report like this in your PR:

| Package | Version | Ecosystem | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----------|-----|----------|----------|---------------|
| lodash | 4.17.20 | npm | CVE-2021-23337 | HIGH | **Yes** | 4.17.21 |
| requests | 2.25.0 | PyPI | CVE-2023-32681 | MEDIUM | No | 2.31.0 |

The first vulnerability (lodash) would block the PR because it's imported in code. The second (requests) is flagged but doesn't block because it's not imported.

## Getting Started

Ready to secure your PRs?

1. [**Quick Start**](/getting-started/quick-start) - Get dpendx running in 5 minutes
2. [**How It Works**](/core-concepts/how-it-works) - Understand the architecture
3. [**Ecosystems**](/ecosystems/overview) - See what's supported for your stack

## Self-Hosting

dpendx can also be self-hosted for organizations that need:
- Full control over their scanning infrastructure
- Private network access
- Custom configurations

See the [Self-Hosting Guide](/self-hosting/overview) for details.
