---
sidebar_position: 100
---

# FAQ

Common questions about dpendx.

## What languages are supported?

dpendx supports Go, JavaScript/Node.js (npm), Python, Rust, Ruby, Java, .NET, PHP, and Swift/Objective-C (CocoaPods).

See the full list in [Ecosystems](/ecosystems/overview).

## What does "Imported" mean?

When dpendx finds a vulnerability, it checks if your code actually uses that package:

- **Imported = Yes** - Your code imports this package. Higher risk.
- **Imported = No** - The package is in your dependencies but not used. Lower risk.

Only imported vulnerabilities block your PR.

## Why was my PR blocked?

Your PR is blocked when dpendx finds vulnerabilities in packages that your code actually imports.

To unblock:
1. Check the dpendx report on your PR
2. Update the vulnerable packages to the suggested versions
3. Push your changes

## How do I fix vulnerabilities?

Each ecosystem has different commands:

```bash
# npm
npm install lodash@4.17.21

# Python
pip install requests==2.31.0

# Go
go get github.com/package@v1.2.3

# Ruby
bundle update vulnerable-gem
```

The dpendx report shows the exact version to upgrade to.

## Why doesn't the check appear on my PR?

Common reasons:
1. **App not installed** - Make sure dpendx is installed on your repository
2. **No dependencies found** - Your repo might not have supported dependency files
3. **First-time delay** - The first scan may take a few seconds to appear

## How do I re-run a scan?

1. Go to your PR
2. Scroll to the Checks section
3. Click **Details** on the dpendx check
4. Click **Re-run**

## What vulnerability database does dpendx use?

dpendx uses the [OSV (Open Source Vulnerabilities)](https://osv.dev) database, which aggregates data from:
- GitHub Advisory Database
- PyPI Advisory Database
- Go Vulnerability Database
- RustSec Advisory Database
- And more

## Does dpendx store my code?

No. dpendx reads your dependency files during the scan but does not store your source code.

## Can I ignore specific vulnerabilities?

Yes. Add the vulnerability IDs to the `ignore_ids` list in your `.dpendx.yml`:

```yaml
vulnerability:
  ignore_ids:
    - "CVE-2021-23337"
    - "GHSA-xxxx-xxxx-xxxx"
```

Ignored vulnerabilities are suppressed from scan results and will not block your PR. See the [Configuration](/features/configuration) page for the full `.dpendx.yml` reference.

## What is license compliance scanning?

dpendx checks your dependencies for license compliance issues. You can configure a policy that defines which licenses are acceptable:

- **Permissive policy** (default) - Allows MIT, Apache-2.0, BSD, etc. Warns on copyleft licenses like GPL and AGPL.
- **Custom policy** - Define explicit `allowed` and `blocked` license lists.

License violations appear as warnings or blockers depending on your policy. See [License Compliance](/features/license-compliance) for details.

## What does code quality analysis check?

When enabled, dpendx runs 6 code quality analyzers on changed files in your PR:

- **Security** - SQL injection, hardcoded secrets, unsafe eval
- **Bug patterns** - Nil dereference, unchecked errors, race conditions
- **Complexity** - Functions exceeding a configurable cyclomatic complexity threshold
- **Naming** - Language-specific naming convention violations
- **Duplicate code** - Repeated code blocks across files
- **Dead code** - Unused imports and unreachable statements

Code quality is disabled by default. Enable it in your [`.dpendx.yml` configuration](/features/configuration). See [Code Quality Analysis](/features/code-quality) for details.

## What is SBOM export?

dpendx can generate a Software Bill of Materials (SBOM) in CycloneDX JSON format for any completed scan. SBOMs provide a complete inventory of your dependencies, useful for:

- **Compliance audits** - Meet regulatory requirements for software transparency
- **Supply chain security** - Track exactly what's in your software
- **License tracking** - See all licenses across your dependency tree

See [SBOM Generation](/features/sbom-generation) for the API endpoint and format details.

## How do I report a bug or request a feature?

- [GitHub Issues](https://github.com/dpendx/issues) - Bug reports
- [GitHub Discussions](https://github.com/dpendx/discussions) - Questions and feature requests
