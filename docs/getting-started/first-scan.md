---
sidebar_position: 3
---

# Your First Scan

Understand what happens when dpendx scans your Pull Request for the first time.

## The Scan Lifecycle

When you open or update a PR, dpendx performs these steps:

```
PR Opened/Updated
      │
      ▼
  Webhook Received
      │
      ▼
  Create Check Run (in_progress)
      │
      ▼
  Fetch Dependency Files
      │
      ▼
  Parse Dependencies
      │
      ▼
  Query OSV Database
      │
      ▼
  Fetch Source Files
      │
      ▼
  Reachability Analysis
      │
      ▼
  Update Check Run (success/failure/neutral)
```

## Step-by-Step Breakdown

### 1. Webhook Reception

When you open a PR, GitHub sends a webhook to dpendx containing:
- Repository owner and name
- PR number and head commit SHA
- Installation ID for authentication

dpendx validates the webhook signature and immediately returns HTTP 202 to acknowledge receipt.

### 2. Check Run Created

Before scanning begins, dpendx creates a GitHub Check Run with:
- **Status**: `in_progress`
- **Name**: `dpendx`
- **Title**: "Scanning for vulnerabilities..."

This appears in your PR's checks section right away.

### 3. Dependency File Fetching

dpendx fetches dependency files from your PR's head branch. It looks for:

| Ecosystem | Files |
|-----------|-------|
| Go | go.mod, go.sum |
| npm | package.json, package-lock.json, yarn.lock |
| Python | requirements.txt, pyproject.toml, poetry.lock, Pipfile.lock |
| Rust | Cargo.toml, Cargo.lock |
| Ruby | Gemfile, Gemfile.lock |
| Java | pom.xml |
| .NET | *.csproj, packages.lock.json |
| PHP | composer.json, composer.lock |
| CocoaPods | Podfile, Podfile.lock |

Files are fetched using GitHub's Contents API from the PR's head SHA.

### 4. Dependency Parsing

Each detected file is parsed using ecosystem-specific parsers:

```go
// Example: go.mod parsing extracts
Dependency{
    Name:      "github.com/pkg/errors",
    Version:   "v0.9.1",
    Ecosystem: "Go",
    Direct:    true,
}
```

Lock files (go.sum, package-lock.json, etc.) provide the full transitive dependency tree.

### 5. OSV Database Query

For each dependency, dpendx queries the [OSV database](https://osv.dev):

```json
{
  "package": {
    "name": "lodash",
    "ecosystem": "npm"
  },
  "version": "4.17.20"
}
```

OSV returns any known vulnerabilities affecting that exact version.

Responses are cached for 4 hours to reduce API calls on subsequent scans.

### 6. Reachability Analysis

For each vulnerability found, dpendx checks if the package is actually imported:

1. Fetch source files from your repository
2. Parse import/require/use statements
3. Match against vulnerable package names

This determines the **Imported** status in results.

### 7. Check Run Updated

Finally, dpendx updates the Check Run with results:

| Conclusion | Condition |
|------------|-----------|
| `success` | No vulnerabilities found |
| `failure` | Vulnerabilities found AND at least one is imported |
| `neutral` | Vulnerabilities found but none imported, OR scan had non-fatal errors |

## What You See in the PR

The check run appears in your PR's checks section:

**If no vulnerabilities:**
> ✅ **dpendx** — No vulnerabilities found
>
> Scanned 47 dependencies across Go, npm. All clear!

**If vulnerabilities found:**
> ❌ **dpendx** — Found 3 vulnerabilities
>
> Found 3 vulnerabilities (1 CRITICAL, 2 HIGH). 2 are in packages directly imported in your code.

Click "Details" to see the full report with:
- Vulnerability table
- Severity breakdown
- Remediation commands
- Scan metadata

## Scan Duration

Typical scan times:

| Repository Size | Dependencies | Duration |
|----------------|--------------|----------|
| Small (< 50 deps) | < 50 | 1-3 seconds |
| Medium (50-200 deps) | 50-200 | 3-8 seconds |
| Large (200+ deps) | 200+ | 8-15 seconds |

Scans have a 5-minute timeout. Very large monorepos may need optimization.

## Next Steps

- [Learn to interpret scan results](/getting-started/understanding-results)
- [Understand the OSV database](/core-concepts/osv-database)
- [Deep dive into reachability analysis](/core-concepts/reachability-analysis)
