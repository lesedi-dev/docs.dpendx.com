---
sidebar_position: 4
---

# Check Run Outcomes

Learn how dpendx determines whether to pass, fail, or show a neutral status on your Pull Request.

## GitHub Checks API

dpendx uses GitHub's [Checks API](https://docs.github.com/en/rest/checks) to report scan results directly on Pull Requests.

A Check Run has several components:

| Component | Description |
|-----------|-------------|
| **Name** | Always "dpendx" |
| **Status** | `queued`, `in_progress`, or `completed` |
| **Conclusion** | `success`, `failure`, or `neutral` (only when completed) |
| **Output** | Title, summary, and detailed text |

## Conclusion Types

### Success ✅

**Condition:** No vulnerabilities found in any dependencies.

```go
if len(result.Findings) == 0 {
    return "success"
}
```

**Check Run Output:**
- **Title:** "✅ No vulnerabilities found"
- **Summary:** "Scanned 47 dependencies across Go, npm. All clear!"

**PR Impact:** Check passes, no merge blocking.

### Failure ❌

**Condition:** At least one vulnerability is found AND at least one is in a package that's imported in code.

```go
if result.ImportedCount() > 0 {
    return "failure"
}
```

**Check Run Output:**
- **Title:** "❌ Found 3 vulnerabilities"
- **Summary:** "Found 3 vulnerabilities (1 CRITICAL, 2 HIGH). 2 are in packages directly imported in your code."

**PR Impact:** Check fails, merge is blocked (if branch protection requires passing checks).

### Neutral ⚠️

**Condition:** One of:
1. Vulnerabilities found but none are imported (informational only)
2. Scan encountered a non-fatal error
3. No dependencies detected

```go
if result.VulnerabilityCount() > 0 && result.ImportedCount() == 0 {
    return "neutral"  // Vulns exist but aren't imported
}

if len(result.Errors) > 0 || result.TotalDeps == 0 {
    return "neutral"  // Scan issue or no deps found
}
```

**Check Run Output:**
- **Title:** "⚠️ Scan incomplete" or "⚠️ Found vulnerabilities (not imported)"
- **Summary:** Describes the issue or non-imported findings

**PR Impact:** Check neither passes nor fails; doesn't block merge.

## Decision Logic

```
┌───────────────────────────────────┐
│      Scan Complete                │
└───────────────┬───────────────────┘
                │
                ▼
        ┌───────────────┐
        │ Vulnerabilities│
        │    found?      │
        └───────┬───────┘
                │
       ┌────────┴────────┐
       │ No              │ Yes
       ▼                 ▼
┌─────────────┐  ┌───────────────┐
│  SUCCESS    │  │ Any imported? │
│    ✅       │  └───────┬───────┘
└─────────────┘          │
                ┌────────┴────────┐
                │ No              │ Yes
                ▼                 ▼
         ┌─────────────┐  ┌─────────────┐
         │  NEUTRAL    │  │  FAILURE    │
         │    ⚠️       │  │    ❌       │
         └─────────────┘  └─────────────┘
```

## Code Implementation

```go
func (s *Scanner) determineConclusion(result *models.ScanResult) string {
    // No vulnerabilities = success
    if !result.HasVulnerabilities() {
        return "success"
    }

    // Has imported vulnerabilities = failure
    if result.ImportedCount() > 0 {
        return "failure"
    }

    // Has vulnerabilities but none imported = neutral
    return "neutral"
}
```

## Output Format

### Successful Scan (No Vulnerabilities)

```markdown
## Scan Details

- **Dependencies scanned:** 47
- **Ecosystems:** Go, npm
- **Scan duration:** 1234ms
```

### Failed Scan (Imported Vulnerabilities)

```markdown
## Vulnerabilities Found

| Package | Version | Ecosystem | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----------|-----|----------|----------|---------------|
| lodash | 4.17.20 | npm | CVE-2021-23337 | HIGH | **Yes** | 4.17.21 |
| minimist | 1.2.5 | npm | CVE-2021-44906 | CRITICAL | **Yes** | 1.2.6 |

## Recommended Actions

- Upgrade `lodash` from 4.17.20 to 4.17.21 (npm)
  ```
  npm install lodash@4.17.21
  ```

## Scan Details

- **Dependencies scanned:** 47
- **Ecosystems:** npm
- **Scan duration:** 2341ms
```

### Neutral Scan (Non-Imported Vulnerabilities)

```markdown
## Vulnerabilities Found

| Package | Version | Ecosystem | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----------|-----|----------|----------|---------------|
| requests | 2.25.0 | PyPI | CVE-2023-32681 | MEDIUM | No | 2.31.0 |

> **Note:** These vulnerabilities are in packages that are not directly imported in your code.
> While they pose lower risk, consider updating them when convenient.

## Scan Details

- **Dependencies scanned:** 23
- **Ecosystems:** PyPI
- **Scan duration:** 1567ms
```

## Branch Protection Integration

To enforce dpendx checks, configure GitHub branch protection:

1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Select or create a rule for your main branch
3. Enable **Require status checks to pass before merging**
4. Search for and add **dpendx**

With this configuration:
- PRs with **failure** conclusion cannot be merged
- PRs with **success** or **neutral** can be merged

## Re-Running Checks

Users can re-run the dpendx check:

1. Click **Details** on the check
2. Click **Re-run** in the top right

This triggers a fresh scan, useful if:
- You've updated dependencies in a new commit
- The OSV database has been updated
- A transient error occurred

## Check Run Actions

dpendx can provide actionable buttons in check results:

```go
type CheckRunAction struct {
    Label       string // "Fix Vulnerabilities"
    Description string // "Create PR with security updates"
    Identifier  string // "fix:abc123"
}
```

When clicked, GitHub sends a `check_run.requested_action` event that dpendx handles.

## Error Scenarios

### Scan Timeout

If a scan takes longer than 5 minutes:

- **Conclusion:** `neutral`
- **Title:** "⚠️ Scan incomplete"
- **Summary:** "The vulnerability scan timed out. This may happen with very large repositories."

### OSV API Errors

If the OSV API is unavailable:

- **Conclusion:** `neutral`
- **Title:** "⚠️ Scan incomplete"
- **Summary:** "Could not query the vulnerability database. Please try again."

### No Dependencies Found

If no dependency files are detected:

- **Conclusion:** `neutral`
- **Title:** "⚠️ No dependencies detected"
- **Summary:** "No supported dependency files found in this repository."

## Summary Matrix

| Scenario | Conclusion | Blocks PR? |
|----------|------------|------------|
| No vulnerabilities | success | No |
| Vulns found, all imported | failure | Yes |
| Vulns found, some imported | failure | Yes |
| Vulns found, none imported | neutral | No |
| Scan error | neutral | No |
| No dependencies found | neutral | No |

## Next Steps

- [Learn about the OSV database](/core-concepts/osv-database)
- [Troubleshoot common issues](/troubleshooting/common-issues)
- [Set up branch protection](/getting-started/installation)
