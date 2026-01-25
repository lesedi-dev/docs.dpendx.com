---
sidebar_position: 1
---

# Quick Start

Get dpendx scanning your Pull Requests in under 5 minutes.

## Step 1: Install the GitHub App

1. Visit the [dpendx GitHub App](https://github.com/apps/dpendx/installations/select_target)
2. Click **Install**
3. Choose which repositories to enable:
   - **All repositories** - Scan every repo in your organization
   - **Select repositories** - Choose specific repos to scan

## Step 2: Grant Permissions

dpendx requires the following permissions:

| Permission | Reason |
|------------|--------|
| **Read** repository contents | Access dependency files and source code |
| **Read & Write** checks | Create and update check runs on PRs |
| **Read** pull requests | Receive webhook events when PRs are opened/updated |

## Step 3: Open a Pull Request

Once installed, dpendx activates automatically. Open any Pull Request and you'll see:

1. A new check called **dpendx** appears in your PR's checks section
2. The check shows "in progress" while scanning
3. Results appear within seconds

## What Happens Next

When the scan completes, you'll see one of three outcomes:

### Success (No Vulnerabilities)

The check passes and shows a green checkmark.

### Failure (Vulnerabilities Found)

The check fails if any vulnerabilities are found in packages that are **imported** in your code. The report shows:

- Which packages are vulnerable
- The CVE/GHSA identifier
- Severity level
- Whether the package is imported
- Recommended version to upgrade to

### Neutral (Scan Issues)

The check shows neutral (yellow) if:
- The scan encountered an error
- Vulnerabilities were found but none are imported

## Interpreting Results

The most important column in the results is **Imported**:

- **Yes** = The vulnerable package is used in your code. You should fix this.
- **No** = The package is in your dependency tree but not directly used. Lower risk.

## Next Steps

- [Understand the full installation process](/getting-started/installation)
- [Learn about your first scan in detail](/getting-started/first-scan)
- [Deep dive into understanding results](/getting-started/understanding-results)
