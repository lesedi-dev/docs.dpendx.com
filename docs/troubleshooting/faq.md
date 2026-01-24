---
sidebar_position: 5
---

# FAQ

Frequently asked questions about dpendx.

## General Questions

### What is dpendx?

dpendx is a GitHub App that scans Pull Requests for dependency vulnerabilities. It:
- Parses dependency files from your repository
- Queries the OSV database for known vulnerabilities
- Performs reachability analysis to determine if vulnerable packages are actually imported
- Reports findings via GitHub's Checks API

### Is dpendx free?

dpendx offers:
- **Free tier** - Limited scans per month
- **Paid plans** - More scans and features

For self-hosted deployments, the software is open source.

### What ecosystems are supported?

dpendx supports 9 package ecosystems:
- Go (go.mod, go.sum)
- npm (package.json, package-lock.json, yarn.lock)
- Python (requirements.txt, pyproject.toml, poetry.lock)
- Rust (Cargo.toml, Cargo.lock)
- Ruby (Gemfile, Gemfile.lock)
- Java (pom.xml)
- .NET (*.csproj, packages.lock.json)
- PHP (composer.json, composer.lock)
- CocoaPods (Podfile, Podfile.lock)

### What vulnerability database does dpendx use?

dpendx uses the [OSV (Open Source Vulnerabilities)](https://osv.dev) database, which aggregates data from:
- GitHub Advisory Database
- PyPI Advisory Database
- Go Vulnerability Database
- RustSec Advisory Database
- And more

## Usage Questions

### How do I install dpendx?

1. Visit the [dpendx GitHub App](https://github.com/apps/dpendx-bot)
2. Click **Install**
3. Choose repositories
4. Open a Pull Request to trigger a scan

### Why doesn't the check appear on my PR?

Common reasons:
1. App not installed on the repository
2. Webhook configuration issue
3. No supported dependency files in the repo

See [Check Run Not Appearing](/troubleshooting/common-issues#check-run-not-appearing).

### How do I re-run a scan?

1. Go to your PR
2. Click **Details** on the dpendx check
3. Click **Re-run**

### Can I scan without opening a PR?

Yes, using the [Scan API endpoint](/api-reference/scan-endpoint) (requires database setup for self-hosted).

### How long does a scan take?

Typical scan times:
- Small projects (under 50 deps): 1-3 seconds
- Medium projects (50-200 deps): 3-8 seconds
- Large projects (200+ deps): 8-15 seconds

First scans are slower due to cold cache.

## Vulnerability Questions

### What does "Imported" mean?

"Imported" indicates whether the vulnerable package is actually used in your code:
- **Yes** - Your code imports/requires this package
- **No** - The package is in your dependency tree but not directly used

Imported vulnerabilities are higher risk because the vulnerable code paths may be executed.

### Why does dpendx show different results than npm audit?

dpendx and npm audit may differ because:
1. Different databases (OSV vs npm's advisory DB)
2. Different update timing
3. dpendx adds reachability analysis (Imported column)

### What severity levels does dpendx use?

| Level | CVSS Score | Meaning |
|-------|------------|---------|
| CRITICAL | 9.0-10.0 | Severe risk |
| HIGH | 7.0-8.9 | Significant risk |
| MEDIUM | 4.0-6.9 | Moderate risk |
| LOW | 0.1-3.9 | Minor risk |
| UNKNOWN | N/A | Not scored |

### Why was my PR blocked?

PRs are blocked (failure conclusion) when **imported** vulnerabilities are found. Non-imported vulnerabilities result in a neutral/warning conclusion and don't block.

### Can I ignore specific vulnerabilities?

Currently, dpendx doesn't support ignoring specific CVEs. This feature is on the roadmap.

## Technical Questions

### Does dpendx store my code?

No. dpendx:
- Fetches files on-demand during scans
- Does not store your source code
- Only stores scan results (if database is configured)

### Is dpendx open source?

Yes. The dpendx source code is available on [GitHub](https://github.com/dpendx/dpendx).

### Can I self-host dpendx?

Yes. See the [Self-Hosting Guide](/self-hosting/overview) for deployment options including Docker, Kubernetes, and Railway.

### What permissions does dpendx need?

| Permission | Reason |
|------------|--------|
| Contents (Read) | Access dependency and source files |
| Checks (Read & Write) | Create and update check runs |
| Pull requests (Read) | Receive webhook events |
| Metadata (Read) | Basic repository info |

### Does dpendx work with GitHub Enterprise?

For self-hosted dpendx, GitHub Enterprise Server can be configured. Contact support for cloud deployments.

### What happens to cached data?

dpendx caches OSV query results:
- **TTL:** 4 hours
- **Storage:** In-memory (not persisted)
- **Cleared:** On service restart

## Integration Questions

### Can I use dpendx in CI/CD?

Yes, via the [Scan API](/api-reference/scan-endpoint):

```yaml
# GitHub Actions example
- name: Security Scan
  run: |
    curl -X POST https://your-dpendx/api/scan \
      -H "Content-Type: application/json" \
      -d '{"installation_id": ..., "owner": "...", "repo": "..."}'
```

### Does dpendx work with monorepos?

Yes. dpendx scans all dependency files it finds, including those in subdirectories. All ecosystems are scanned in parallel.

### Can dpendx create fix PRs?

The fix PR feature is currently disabled due to lock file synchronization issues. Updates to manifest files don't automatically update lock files.

### Does dpendx support private package registries?

dpendx queries OSV for vulnerability information based on package name and version. Private packages not in OSV won't have vulnerability data.

## Troubleshooting Questions

### Why are some imports not detected?

dpendx uses static analysis. It cannot detect:
- Dynamic imports (`require(variable)`)
- Runtime-conditional imports
- Plugin systems that load packages dynamically

### Why does the scan timeout?

Scans timeout after 5 minutes. Large repositories with many dependencies may hit this limit. Solutions:
- Remove unused dependencies
- Use lock files for faster parsing
- Split into smaller repositories

### How do I report a bug?

1. Check existing [GitHub Issues](https://github.com/dpendx/dpendx/issues)
2. Open a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Logs (if available)

### Where can I get help?

- [GitHub Issues](https://github.com/dpendx/dpendx/issues) - Bug reports
- [GitHub Discussions](https://github.com/dpendx/dpendx/discussions) - Questions
- [Documentation](/) - This site

## Feature Requests

### What features are planned?

Upcoming features (subject to change):
- [ ] CVE/GHSA ignore lists
- [ ] Slack notifications
- [ ] Custom severity thresholds
- [ ] Gradle support
- [ ] Swift Package Manager support

### How do I request a feature?

Open a discussion on [GitHub Discussions](https://github.com/dpendx/dpendx/discussions) with:
- Use case description
- Expected behavior
- Any relevant examples
