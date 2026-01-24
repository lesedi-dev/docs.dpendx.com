---
sidebar_position: 4
---

# Understanding Results

Learn how to interpret dpendx scan results and take appropriate action.

## The Vulnerability Table

When vulnerabilities are found, dpendx displays a table like this:

| Package | Version | Ecosystem | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----------|-----|----------|----------|---------------|
| lodash | 4.17.20 | npm | CVE-2021-23337 | HIGH | **Yes** | 4.17.21 |
| minimist | 1.2.5 | npm | CVE-2021-44906 | CRITICAL | **Yes** | 1.2.6 |
| requests | 2.25.0 | PyPI | CVE-2023-32681 | MEDIUM | No | 2.31.0 |

### Column Explanations

#### Package
The name of the vulnerable package as it appears in your package manager.

#### Version
The version currently used in your project that has the vulnerability.

#### Ecosystem
Which package ecosystem this dependency belongs to:
- **Go** - Go modules
- **npm** - Node.js packages
- **PyPI** - Python packages
- **crates.io** - Rust crates
- **RubyGems** - Ruby gems
- **Maven** - Java packages
- **NuGet** - .NET packages
- **Packagist** - PHP packages
- **CocoaPods** - iOS/macOS packages

#### CVE
The vulnerability identifier, typically:
- **CVE-YYYY-NNNNN** - Common Vulnerabilities and Exposures
- **GHSA-xxxx-xxxx-xxxx** - GitHub Security Advisory

Click the ID to view full details on the OSV database.

#### Severity
How serious the vulnerability is:

| Level | Description | Action |
|-------|-------------|--------|
| **CRITICAL** | Severe risk, often RCE or data breach | Fix immediately |
| **HIGH** | Significant risk | Fix soon |
| **MEDIUM** | Moderate risk | Plan to fix |
| **LOW** | Minor risk | Fix when convenient |
| **UNKNOWN** | Severity not determined | Investigate |

Severity comes from CVSS scores when available.

#### Imported

The most important column. Indicates whether your code actually uses this package:

| Status | Meaning | Risk Level |
|--------|---------|------------|
| **Yes** | Package is imported in your source code | HIGH - vulnerable code is being executed |
| No | Package is in dependency tree but not directly imported | LOWER - vulnerable code may not run |

:::tip Understanding "Imported"
A package can be in your `package-lock.json` as a transitive dependency but never actually used by your code. dpendx analyzes your source files to determine if you're really calling the vulnerable package.
:::

#### Fixed Version
The minimum version that fixes the vulnerability. Use this for upgrading:

```bash
# npm
npm install lodash@4.17.21

# Go
go get github.com/example/pkg@v1.2.3

# Python
pip install requests==2.31.0
```

## Understanding Check Run Outcomes

### Success ✅

**What it means:** No vulnerabilities found in any dependencies.

**What you see:**
> ✅ dpendx — No vulnerabilities found
>
> Scanned 47 dependencies across Go, npm. All clear!

**Action:** None required. Your PR is safe to merge.

### Failure ❌

**What it means:** Vulnerabilities were found AND at least one is in a package that's imported in your code.

**What you see:**
> ❌ dpendx — Found 3 vulnerabilities
>
> Found 3 vulnerabilities (1 CRITICAL, 2 HIGH). 2 are in packages directly imported in your code.

**Action:** Fix the imported vulnerabilities before merging. The PR merge is blocked.

### Neutral ⚠️

**What it means:** Either:
1. Vulnerabilities found but none are imported (lower risk)
2. The scan had non-fatal errors

**What you see:**
> ⚠️ dpendx — Scan incomplete
>
> The vulnerability scan could not complete: timeout fetching go.sum

**Action:** Review the warnings. Consider fixing non-imported vulnerabilities when convenient.

## Recommended Actions Section

Below the vulnerability table, dpendx provides specific remediation commands:

```markdown
## Recommended Actions

- Upgrade `lodash` from 4.17.20 to 4.17.21 (npm)
  ```
  npm install lodash@4.17.21
  ```
- Upgrade `requests` from 2.25.0 to 2.31.0 (PyPI)
  ```
  pip install requests==2.31.0
  ```
```

Copy these commands directly to fix the issues.

## Scan Details Section

At the bottom of the report:

```markdown
## Scan Details

- **Dependencies scanned:** 47
- **Ecosystems:** Go, npm, PyPI
- **Scan duration:** 2341ms
```

### Warnings

If any non-fatal errors occurred:

```markdown
### Warnings

- poetry.lock not found (pyproject.toml uses poetry)
- Timeout querying OSV for github.com/example/pkg
```

These don't block the scan but may indicate incomplete results.

## Prioritizing Fixes

When facing multiple vulnerabilities, prioritize by:

1. **Imported + CRITICAL** - Fix first, highest risk
2. **Imported + HIGH** - Fix next
3. **Imported + MEDIUM/LOW** - Plan to fix
4. **Not Imported + Any Severity** - Fix when convenient

## Next Steps

- [Learn how dpendx works under the hood](/core-concepts/how-it-works)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot common issues](/troubleshooting/common-issues)
